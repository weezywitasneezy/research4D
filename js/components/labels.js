// Label management system
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';
import { LabelModal } from './LabelModal.js';

// Setup the label system
export function setupLabelSystem(container) {
    // Store label data
    const labelData = [];
    
    // Keep track of hover state
    let isLabelHovered = false;
    
    // Keep track of visibility state
    let labelsVisible = true;

    // Create modal instance
    const modal = new LabelModal();

    // Ensure container has correct pointer-event settings
    container.style.pointerEvents = 'none';
    
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
        labelDiv.style.pointerEvents = 'auto';
        
        // Add hover event handlers for enhanced interaction
        const mouseEnterHandler = () => {
            console.log(`Label hover start: ${text}`);
            isLabelHovered = true;
            
            // Additional hover effects beyond CSS
            labelDiv.style.backgroundColor = 'rgba(20, 20, 30, 0.85)';
            
            // Store original color to restore it
            labelDiv._originalColor = labelDiv.style.color;
            
            // Brighten color on hover
            labelDiv.style.color = 'white';
            
            // Add glow animation class
            labelDiv.classList.add('label3d-glow');
        };
        
        const mouseLeaveHandler = () => {
            console.log(`Label hover end: ${text}`);
            isLabelHovered = false;
            
            // Restore original styles
            labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            labelDiv.style.color = labelDiv._originalColor;
            
            // Remove glow animation class
            labelDiv.classList.remove('label3d-glow');
        };
        
        // Add click event for modal interaction
        const clickHandler = () => {
            console.log(`Clicked on: ${text}`);
            // Use the exact text as the key
            modal.show(text);
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
        // For underground structures (negative y position), position below
        // For above-ground structures, position above
        const worldPos = new THREE.Vector3();
        object.getWorldPosition(worldPos);
        const isUnderground = worldPos.y < 0;
        const position = new THREE.Vector3(
            0,
            isUnderground ? -objectHeight / 2 - 10 : objectHeight / 2 + 10,
            0
        );
        
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
    
    // Function to update label positions
    function updateLabels(camera) {
        // Check if we're in fullscreen mode
        const isFullscreen = !!(document.fullscreenElement || 
            document.mozFullScreenElement || 
            document.webkitFullscreenElement || 
            document.msFullscreenElement);
            
        // Get the container dimensions
        const container = document.getElementById('visualization-mount');
        if (!container) return;
        
        // Get current zoom level from CONFIG
        const currentZoom = CONFIG.currentZoom || 1.0;
        
        // Calculate fullscreen multiplier for label sizing
        const fullscreenMultiplier = isFullscreen ? 1.5 : 1.0;
        
        // Update each label
        labelData.forEach(label => {
            if (!label.visible || !labelsVisible) {
                label.element.style.display = 'none';
                return;
            }
            
            // Get world position of the label
            const worldPosition = new THREE.Vector3();
            label.object.getWorldPosition(worldPosition);
            worldPosition.add(label.position);
            
            // Project 3D position to 2D screen position
            const screenPosition = worldPosition.clone();
            screenPosition.project(camera);
            
            // Convert to screen coordinates
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
                const paddingV = Math.max(0.5, Math.min(1, 0.6 * fullscreenMultiplier));
                const paddingH = Math.max(4, Math.min(12, 8 * fullscreenMultiplier));
                label.element.style.padding = `${paddingV}px ${paddingH}px`;
                
                // Adjust opacity based on distance
                const opacity = Math.max(0.3, Math.min(1.0, 500 / dist));
                label.element.style.opacity = opacity.toString();
            } else {
                // Hide label if it's behind the camera or outside screen bounds
                label.element.style.display = 'none';
            }
        });
    }
    
    // Function to toggle label visibility
    function toggleLabels() {
        labelsVisible = !labelsVisible;
        return labelsVisible;
    }
    
    // Function to check if labels are visible
    function areLabelsVisible() {
        return labelsVisible;
    }
    
    return {
        addLabel,
        updateLabels,
        toggleLabels,
        areLabelsVisible,
        isHovered: () => isLabelHovered,
        cleanup: () => {
            // Remove all labels and their event listeners
            labelData.forEach(label => {
                if (label.element) {
                    label.element.removeEventListener('mouseenter', label.element._mouseEnterHandler);
                    label.element.removeEventListener('mouseleave', label.element._mouseLeaveHandler);
                    label.element.removeEventListener('click', label.element._clickHandler);
                    label.element.remove();
                }
            });
        }
    };
}

console.log('Label system module loaded!');
