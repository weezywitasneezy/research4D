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
                
                // Scale based on both distance and zoom level
                // When zoomed out (smaller zoom value), labels should be smaller
                // When zoomed in (larger zoom value), labels should be larger
                const distanceScale = Math.max(0.5, Math.min(1.2, 800 / dist));
                
                // Apply a more dramatic scaling based on zoom level
                // Make it more responsive to zoom changes
                // Use more explicit scaling to ensure zooming out makes them smaller
                const zoomFactorForScaling = isFullscreen ? currentZoom : currentZoom * 0.7;
                const zoomScale = Math.pow(zoomFactorForScaling, 2.5); // More dramatic exponential effect
                
                // Add additional scaling factor for very zoomed out state
                let zoomOutMultiplier = 1.0;
                if (currentZoom < 0.7) {
                    // Further reduce size when zoomed out significantly
                    zoomOutMultiplier = Math.max(0.4, currentZoom / 0.7);
                }
                
                // Combine distance and zoom scaling with fullscreen adjustment
                const finalScale = distanceScale * zoomScale * fullscreenMultiplier * zoomOutMultiplier;
                
                // Base font size adjusted by final scale
                const baseFontSize = 14;
                let fontSize = baseFontSize * finalScale;
                
                // Apply a more dramatic size change for minimum/maximum zoom states
                if (currentZoom <= 0.4) { // Very zoomed out
                    fontSize *= 0.5; // Make labels much smaller when fully zoomed out
                } else if (currentZoom >= 2.0) { // Very zoomed in
                    fontSize *= isFullscreen ? 1.5 : 1.2; // Different boost based on mode
                }
                
                // Update label position and visibility
                label.element.style.display = 'block';
                label.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                
                // Set font size with the calculated scale
                label.element.style.fontSize = `${fontSize}px`;
                
                // Adjust padding based on zoom level for a more dramatic effect
                // Smaller padding when zoomed out, larger when zoomed in
                // Use reduced vertical padding as requested
                const paddingV = Math.max(1, Math.min(5, 2.5 * currentZoom)); // Reduced vertical padding values
                const paddingH = Math.max(4, Math.min(16, 8 * currentZoom));
                label.element.style.padding = `${paddingV}px ${paddingH}px`;
                
                // Make background more opaque when zoomed in, more transparent when zoomed out
                const bgOpacity = Math.max(0.5, Math.min(0.9, 0.7 * currentZoom));
                label.element.style.backgroundColor = `rgba(0, 0, 0, ${bgOpacity})`;
                
                // Adjust text opacity based on distance - enhanced by zoom level
                const baseOpacity = Math.max(0.3, Math.min(1.0, 500 / dist));
                const finalOpacity = Math.min(1.0, baseOpacity * Math.sqrt(currentZoom));
                label.element.style.opacity = finalOpacity.toString();
                
                // Add a subtle border when zoomed in for better visibility
                if (currentZoom > 1.5) {
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