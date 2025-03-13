// Animation and camera controls
import { CONFIG } from '../core/config.js';

// Initialize animations
export function initAnimations(camera, isRotatingFn, zoomLevelFn, elevationOffsetFn) {
    console.log('Initializing animations with zoom and elevation support');
    
    // Camera rotation variables
    let angle = 0;
    let radius = (CONFIG && CONFIG.camera) ? 
        CONFIG.camera.radius * CONFIG.camera.zoomFactor : 
        480 * 0.7;
    let height = (CONFIG && CONFIG.camera) ? 
        CONFIG.camera.height * CONFIG.camera.zoomFactor : 
        180 * 0.7;
    const centerX = 0;
    const centerZ = 0;
    
    // Animation frame ID for cleanup
    let animationFrameId = null;
    
    // Mouse drag control variables
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragSensitivityHorizontal = 0.01; // Adjust for horizontal rotation
    let dragSensitivityVertical = 0.75;   // Increased by 50% for more responsive vertical movement
    
    // Get the container element
    const container = document.getElementById('visualization-mount');
    
    // Mouse event handlers for drag control
    function onMouseDown(event) {
        // Only enable dragging if it's allowed in the config
        if (CONFIG && CONFIG.animation && CONFIG.animation.dragEnabled === false) {
            return;
        }
        
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        // Pause auto-rotation when user starts dragging
        if (CONFIG && CONFIG.animation) {
            CONFIG._wasRotating = isRotatingFn && isRotatingFn();
            CONFIG.animation.enabled = false;
        }
        
        // Add class to container for visual feedback
        if (container) {
            container.classList.add('dragging');
        }
    }
    
    function onMouseMove(event) {
        if (!isDragging) return;
        
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        // Handle horizontal movement (around Y axis)
        if (deltaMove.x !== 0) {
            // Update camera angle
            angle -= deltaMove.x * dragSensitivityHorizontal;
        }
        
        // Handle vertical movement (elevation)
        if (deltaMove.y !== 0) {
            // Get current elevation offset with fallback
            let currentElevation = 0;
            if (elevationOffsetFn && typeof elevationOffsetFn === 'function') {
                try {
                    currentElevation = elevationOffsetFn();
                } catch (e) {
                    console.warn('Error getting elevation offset:', e);
                }
            }
            
            // Calculate new elevation
            // Moving mouse up (negative deltaY) increases elevation
            // Moving mouse down (positive deltaY) decreases elevation
            const elevationChange = -deltaMove.y * dragSensitivityVertical;
            
            // Get min/max elevation limits from CONFIG or use defaults
            const minElevation = (CONFIG && CONFIG.minElevation) ? 
                CONFIG.minElevation : -300;
            const maxElevation = (CONFIG && CONFIG.maxElevation) ? 
                CONFIG.maxElevation : 200;
            
            // Calculate new elevation with limits
            const newElevation = Math.max(
                minElevation, 
                Math.min(maxElevation, currentElevation + elevationChange)
            );
            
            // Update elevation if we have a setter function in zoomControls
            if (window.zoomControls && window.zoomControls.setElevationOffset) {
                window.zoomControls.setElevationOffset(newElevation);
            }
        }
        
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    function onMouseUp(event) {
        isDragging = false;
        
        // Resume auto-rotation if it was enabled before
        if (CONFIG && CONFIG._wasRotating) {
            CONFIG.animation.enabled = true;
            delete CONFIG._wasRotating;
        }
        
        // Remove class from container
        if (container) {
            container.classList.remove('dragging');
        }
    }
    
    // Add mouse event listeners
    if (container) {
        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        
        // Also handle touch events for mobile
        container.addEventListener('touchstart', (e) => {
            if (CONFIG && CONFIG.animation && CONFIG.animation.dragEnabled === false) {
                return;
            }
            
            e.preventDefault();
            const touch = e.touches[0];
            onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });
        
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });
        
        window.addEventListener('touchend', onMouseUp, { passive: false });
    }
    
    // Camera rotation function
    function updateCameraPosition() {
        // Get current zoom level with fallback
        let zoomLevel = 1.0;
        if (zoomLevelFn && typeof zoomLevelFn === 'function') {
            try {
                zoomLevel = zoomLevelFn();
            } catch (e) {
                console.warn('Error getting zoom level:', e);
            }
        }
        
        // Get current elevation offset with fallback
        let elevationOffset = 0;
        if (elevationOffsetFn && typeof elevationOffsetFn === 'function') {
            try {
                elevationOffset = elevationOffsetFn();
            } catch (e) {
                console.warn('Error getting elevation offset:', e);
            }
        }
        
        // Get base values from CONFIG with fallbacks
        const baseRadius = (CONFIG && CONFIG.camera) ? 
            CONFIG.camera.radius * CONFIG.camera.zoomFactor : 
            480 * 0.7;
            
        const baseHeight = (CONFIG && CONFIG.camera) ? 
            CONFIG.camera.height * CONFIG.camera.zoomFactor : 
            180 * 0.7;
        
        // Update camera values based on zoom and elevation
        radius = baseRadius / zoomLevel;
        height = (baseHeight / zoomLevel) + elevationOffset;
        
        // Check if the label system indicates a label is being hovered
        let isLabelHovered = false;
        if (container && container._labelSystem && container._labelSystem.isHovered) {
            isLabelHovered = container._labelSystem.isHovered();
        }
        
        // Only update angle if:
        // 1. Rotation is enabled via isRotatingFn
        // 2. Not currently dragging
        // 3. No label is being hovered
        if (isRotatingFn && isRotatingFn() && !isDragging && !isLabelHovered) {
            const rotationSpeed = (CONFIG && CONFIG.camera) ? 
                CONFIG.camera.rotationSpeed : 0.002;
            angle += rotationSpeed;
        }
        
        // Update camera position using calculated values
        camera.position.x = centerX + radius * Math.cos(angle);
        camera.position.z = centerZ + radius * Math.sin(angle);
        camera.position.y = height;
        camera.lookAt(centerX, 0, centerZ);
    }
    
    return {
        angle,
        updateCameraPosition,
        getAnimationFrameId: () => animationFrameId,
        setAnimationFrameId: (id) => { animationFrameId = id; },
        cleanup: () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            // Remove event listeners
            if (container) {
                container.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                
                container.removeEventListener('touchstart', onMouseDown);
                window.removeEventListener('touchmove', onMouseMove);
                window.removeEventListener('touchend', onMouseUp);
            }
        }
    };
}

// Start animation loop
export function startAnimationLoop(renderer, scene, camera, animations, labelSystem) {
    // Animation loop
    function animate() {
        animations.setAnimationFrameId(requestAnimationFrame(animate));
        
        // Update camera position
        animations.updateCameraPosition();
        
        // Update labels if label system exists
        if (labelSystem) {
            labelSystem.updateLabels(camera);
        }
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Start the animation loop
    animate();
}

console.log('Animation module loaded!');
