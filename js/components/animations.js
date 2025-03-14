// Animation and camera controls

// Initialize animations
function initAnimations(camera, isRotatingFn, zoomLevelFn, elevationOffsetFn) {
    console.log('Initializing animations with zoom and elevation support');
    
    // Camera rotation variables
    let angle = 0;
    let radius = (window.CONFIG && window.CONFIG.camera) ? 
        window.CONFIG.camera.radius * window.CONFIG.camera.zoomFactor : 
        480 * 0.7;
    let height = (window.CONFIG && window.CONFIG.camera) ? 
        window.CONFIG.camera.height * window.CONFIG.camera.zoomFactor : 
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
        if (window.CONFIG && window.CONFIG.animation && window.CONFIG.animation.dragEnabled === false) {
            return;
        }
        
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        // Pause auto-rotation when user starts dragging
        if (window.CONFIG && window.CONFIG.animation) {
            window.CONFIG._wasRotating = isRotatingFn && isRotatingFn();
            window.CONFIG.animation.enabled = false;
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
            const minElevation = (window.CONFIG && window.CONFIG.minElevation) ? 
                window.CONFIG.minElevation : -300;
            const maxElevation = (window.CONFIG && window.CONFIG.maxElevation) ? 
                window.CONFIG.maxElevation : 200;
            
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
        if (window.CONFIG && window.CONFIG._wasRotating) {
            window.CONFIG.animation.enabled = true;
            delete window.CONFIG._wasRotating;
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
            if (window.CONFIG && window.CONFIG.animation && window.CONFIG.animation.dragEnabled === false) {
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
        const baseRadius = (window.CONFIG && window.CONFIG.camera) ? 
            window.CONFIG.camera.radius * window.CONFIG.camera.zoomFactor : 
            480 * 0.7;
            
        const baseHeight = (window.CONFIG && window.CONFIG.camera) ? 
            window.CONFIG.camera.height * window.CONFIG.camera.zoomFactor : 
            180 * 0.7;
        
        // Update camera values based on zoom and elevation
        radius = baseRadius / zoomLevel;
        height = (baseHeight / zoomLevel) + elevationOffset;
        
        // Check if the label system indicates a label is being hovered
        let isLabelHovered = false;
        if (window.isLabelHovered) {
            isLabelHovered = true;
        } else if (container && container._labelSystem && container._labelSystem.isHovered) {
            isLabelHovered = container._labelSystem.isHovered();
        }
        
        // Only update angle if:
        // 1. Rotation is enabled via isRotatingFn
        // 2. Not currently dragging
        // 3. No label is being hovered
        if (isRotatingFn && isRotatingFn() && !isDragging && !isLabelHovered) {
            const rotationSpeed = (window.CONFIG && window.CONFIG.camera) ? 
                window.CONFIG.camera.rotationSpeed : 0.002;
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
function startAnimationLoop(renderer, scene, camera, animations, labelSystem) {
    // Save zoom controls reference globally so animations can access it
    if (window.zoomControls === undefined && typeof zoomControls !== 'undefined') {
        window.zoomControls = zoomControls;
    }
    
    // Save label system reference for future access
    if (labelSystem) {
        window.labelSystem = labelSystem;
    }
    
    // Animation loop
    function animate() {
        animations.setAnimationFrameId(requestAnimationFrame(animate));
        
        // Update camera position for rotation
        animations.updateCameraPosition();
        
        // Update label positions
        if (labelSystem && labelSystem.updateLabels) {
            labelSystem.updateLabels(camera);
        }
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Start the animation loop
    animate();
}

// Make functions available globally
window.initAnimations = initAnimations;
window.startAnimationLoop = startAnimationLoop;

console.log('Animations module loaded');
