// Label management system

// Setup the label system
function setupLabelSystem(container) {
    // Store label data
    const labelData = [];
    
    // Keep track of hover state
    let isLabelHovered = false;
    
    // Global flag for easier access from animation module
    window.isLabelHovered = false;
    
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
        
        // Add hover event handlers for enhanced interaction
        const mouseEnterHandler = () => {
            console.log(`Label hover start: ${text}`);
            
            // Additional hover effects beyond CSS
            labelDiv.style.backgroundColor = 'rgba(20, 20, 30, 0.85)';
            
            // Store original color to restore it
            labelDiv._originalColor = labelDiv.style.color;
            
            // Brighten color on hover
            if (labelDiv.style.color.startsWith('#')) {
                // For hex colors
                labelDiv.style.color = 'white';
            } else {
                // For named colors
                labelDiv.style.color = 'white';
            }
            
            // Add glow animation class
            labelDiv.classList.add('label3d-glow');
            
            // Set hover flags
            isLabelHovered = true;
            window.isLabelHovered = true;
        };
        
        const mouseLeaveHandler = () => {
            console.log(`Label hover end: ${text}`);
            
            // Restore original styles
            labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            labelDiv.style.color = labelDiv._originalColor;
            
            // Remove glow animation class
            labelDiv.classList.remove('label3d-glow');
            
            // Clear hover flags
            isLabelHovered = false;
            window.isLabelHovered = false;
        };
        
        // Add click event for future interaction
        const clickHandler = () => {
            console.log(`Clicked on: ${text}`);
            // Additional functionality can be added here
        };
        
        // Store handlers for cleanup
        labelDiv._mouseEnterHandler = mouseEnterHandler;
        labelDiv._mouseLeaveHandler = mouseLeaveHandler;
        labelDiv._clickHandler = clickHandler;
        
        // Add event listeners
        labelDiv.addEventListener('mouseenter', mouseEnterHandler);
        labelDiv.addEventListener('mouseleave', mouseLeaveHandler);
        labelDiv.addEventListener('click', clickHandler);
        
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
        // Check if we're in fullscreen mode
        const isFullscreen = !!(document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement);
        
        // Get the current zoom level from CONFIG
        let currentZoom = 1.0;
        
        if (window.CONFIG && window.CONFIG.currentZoom) {
            currentZoom = window.CONFIG.currentZoom;
        }
        
        // Apply different base sizes when not in fullscreen
        const fullscreenMultiplier = isFullscreen ? 1.0 : 0.7;
        
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
                
                // Calculate scaling factors
                // Enhanced distance and zoom scaling for better visibility
                const distanceScale = Math.max(0.5, Math.min(1.5, 900 / dist));
                const zoomScale = Math.max(0.5, Math.min(1.5, currentZoom));
                
                // Calculate final font size - automatic scaling based on zoom and distance
                const baseFontSize = 14;
                const fontSize = baseFontSize * distanceScale * zoomScale * fullscreenMultiplier;
                
                // Update label position and visibility
                label.element.style.display = 'block';
                label.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                label.element.style.fontSize = `${fontSize}px`;
                
                // Set appropriate padding based on screen mode and size
                const paddingV = Math.max(2, Math.min(6, 4 * fullscreenMultiplier));
                const paddingH = Math.max(4, Math.min(12, 8 * fullscreenMultiplier));
                label.element.style.padding = `${paddingV}px ${paddingH}px`;
                
                // Adjust opacity based on distance
                const opacity = Math.max(0.3, Math.min(1.0, 500 / dist));
                label.element.style.opacity = opacity.toString();
                
                // Only add borders in fullscreen mode with high zoom
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
    
    // Function to check if any label is currently hovered
    function isHovered() {
        return isLabelHovered;
    }
    
    // Function to remove all labels
    function cleanup() {
        // Reset hover state
        isLabelHovered = false;
        window.isLabelHovered = false;
        
        labelData.forEach(label => {
            if (label.element) {
                // Remove event listeners
                label.element.removeEventListener('mouseenter', label.element._mouseEnterHandler);
                label.element.removeEventListener('mouseleave', label.element._mouseLeaveHandler);
                label.element.removeEventListener('click', label.element._clickHandler);
                
                // Remove from DOM
                if (label.element.parentNode) {
                    label.element.parentNode.removeChild(label.element);
                }
            }
        });
        
        // Clear the array
        labelData.length = 0;
    }
    
    // Return the label system API
    return {
        addLabel,
        updateLabels,
        isHovered,
        cleanup,
        labelData
    };
}

// Make function available globally
window.setupLabelSystem = setupLabelSystem;

console.log('Label system module loaded!');
