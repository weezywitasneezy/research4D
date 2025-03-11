// Label management system
import { CONFIG } from '../core/config.js';

// Setup the label system
export function setupLabelSystem(container) {
    // Store label data
    const labelData = [];
    
    // Function to add a label to a 3D object
    function addLabel(object, text, color) {
        // Convert hex color to CSS color string
        const cssColor = typeof color === 'number' 
            ? '#' + color.toString(16).padStart(6, '0')
            : color || 'white';
        
        // Create a div element for the label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label3d';
        labelDiv.textContent = text;
        labelDiv.style.color = cssColor;
        
        // Add the label to our container
        container.appendChild(labelDiv);
        
        // Calculate the object's dimensions
        const box = new THREE.Box3().setFromObject(object);
        const objectHeight = box.max.y - box.min.y;
        
        // Create a position vector for the label
        // We'll position it slightly above the object
        const position = new THREE.Vector3(0, objectHeight / 2 + 10, 0);
        
        // Store the label info for updating in the animation loop
        const labelInfo = {
            element: labelDiv,
            object: object,
            position: position,
            visible: true
        };
        
        labelData.push(labelInfo);
        
        return labelInfo;
    }
    
    // Function to update all label positions
    function updateLabels(camera) {
        // Check if we're in fullscreen mode - moved to outer scope
        const isFullscreen = !!(document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement);
        
        // Get the current zoom level from CONFIG - moved to outer scope
        let currentZoom = 1.0;
        if (window.CONFIG && window.CONFIG.currentZoom) {
            currentZoom = window.CONFIG.currentZoom;
        }
        
        // Apply different base sizes when not in fullscreen
        // Make labels 50% smaller in normal mode
        const fullscreenMultiplier = isFullscreen ? 1.0 : 0.5;
        
        // Add debug info to console
        console.log(`Label scaling - Fullscreen: ${isFullscreen}, Zoom: ${currentZoom}, Multiplier: ${fullscreenMultiplier}`);
        
        // Loop through all labels
        labelData.forEach(label => {
            if (!label.visible) {
                label.element.style.display = 'none';
                return;
            }
            
            // Get the object's world position
            const worldPosition = new THREE.Vector3();
            
            // If the object is a group, use its position directly
            if (label.object.isGroup) {
                worldPosition.copy(label.object.position);
                worldPosition.y += label.position.y; // Add the label's y offset
            } else {
                // Get the object's world position and add the label's offset
                label.object.updateMatrixWorld();
                // Get the object's position in world space
                label.object.getWorldPosition(worldPosition);
                // Add the label's offset
                worldPosition.y += label.position.y;
            }
            
            // Project the world position to screen coordinates
            const screenPosition = worldPosition.clone();
            screenPosition.project(camera);
            
            // Convert to CSS coordinates
            const x = (screenPosition.x * 0.5 + 0.5) * container.clientWidth;
            const y = (-screenPosition.y * 0.5 + 0.5) * container.clientHeight;
            
            // Check if the label is in front of the camera and within screen bounds
            if (screenPosition.z < 1 && 
                x > 0 && x < container.clientWidth && 
                y > 0 && y < container.clientHeight) {
                
                // Calculate distance to camera for size scaling
                const dist = camera.position.distanceTo(worldPosition);
                
                // Distance-based scaling factor
                const distanceScale = Math.max(0.5, Math.min(1.2, 800 / dist));
                
                // Base font size
                const baseFontSize = 14;
                let fontSize;
                
                if (!isFullscreen) {
                    // In normal mode, implement the special scaling:
                    // 1. At 30% zoom, use half the current size
                    // 2. For zoom > 30%, cap it at the 30% size
                    // 3. For zoom < 30%, scale down proportionally
                    
                    if (currentZoom <= 0.3) {
                        // Scale down proportionally for zooms below 30%
                        const zoomRatio = currentZoom / 0.3; // Becomes 1.0 at 30% zoom
                        fontSize = baseFontSize * distanceScale * 0.25 * zoomRatio;
                    } else {
                        // Cap at the 30% zoom size for anything higher
                        fontSize = baseFontSize * distanceScale * 0.25;
                    }
                } else {
                    // In fullscreen mode, use regular scaling
                    const zoomScale = Math.pow(currentZoom, 2); // Squared for dramatic effect
                    fontSize = baseFontSize * distanceScale * zoomScale;
                    
                    // Apply extreme zoom adjustments
                    if (currentZoom <= 0.4) {
                        fontSize *= 0.6; // Smaller when zoomed out extremely
                    } else if (currentZoom >= 2.0) {
                        fontSize *= 1.5; // Larger when zoomed in extremely
                    }
                }
                
                // Update label position and visibility
                label.element.style.display = 'block';
                label.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                
                // Set font size with the calculated scale
                label.element.style.fontSize = `${fontSize}px`;
                
                // Adjust padding based on zoom level and mode
                if (!isFullscreen) {
                    // In normal mode, use minimal padding regardless of zoom level
                    label.element.style.padding = '2px 4px';
                } else {
                    // In fullscreen mode, scale padding with zoom
                    const paddingV = Math.max(1, Math.min(5, 2.5 * currentZoom));
                    const paddingH = Math.max(4, Math.min(16, 8 * currentZoom));
                    label.element.style.padding = `${paddingV}px ${paddingH}px`;
                }
                
                // Adjust background opacity based on mode and zoom
                let bgOpacity;
                if (!isFullscreen) {
                    // In normal mode, use more transparent background
                    bgOpacity = 0.5;
                } else {
                    // In fullscreen mode, scale with zoom
                    bgOpacity = Math.max(0.5, Math.min(0.9, 0.7 * currentZoom));
                }
                label.element.style.backgroundColor = `rgba(0, 0, 0, ${bgOpacity})`;
                
                // Adjust text opacity based on distance
                const baseOpacity = Math.max(0.3, Math.min(1.0, 500 / dist));
                label.element.style.opacity = baseOpacity.toString();
                
                // Only add borders in fullscreen mode
                if (isFullscreen && currentZoom > 1.5) {
                    label.element.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                } else {
                    label.element.style.border = 'none';
                }
            } else {
                // Hide the label if it's not visible
                label.element.style.display = 'none';
            }
        });
    }
    
    // Function to remove all labels
    function cleanup() {
        labelData.forEach(label => {
            if (label.element && label.element.parentNode) {
                label.element.parentNode.removeChild(label.element);
            }
        });
        
        // Clear the array
        labelData.length = 0;
    }
    
    // Return the label system API
    return {
        addLabel,
        updateLabels,
        cleanup,
        labelData
    };
}