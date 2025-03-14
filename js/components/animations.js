// Animation and camera controls
import { CONFIG } from '../core/config.js';
import * as THREE from 'three';

// Initialize animations
export function setupAnimations(camera, controls, labelSystem, renderer, scene, zoomControls) {
    console.log('Initializing animations with zoom and elevation support');
    
    // Animation state
    let angle = 0;
    let radius = CONFIG.camera.radius * CONFIG.camera.zoomFactor;
    let height = CONFIG.camera.height * CONFIG.camera.zoomFactor;
    let isDragging = false;
    let previousX = 0;
    let animationFrameId = null;
    
    // Center point (can be adjusted if needed)
    const centerX = 0;
    const centerZ = 0;
    
    // Get container for event handling
    const container = renderer.domElement.parentElement;
    
    // Mouse interaction handlers
    const onMouseDown = (event) => {
        isDragging = true;
        
        // Store initial position for drag calculation
        const clientX = event.type === 'touchstart' ? 
            event.touches[0].clientX : event.clientX;
        previousX = clientX;
        
        // Prevent default behavior for touch events
        if (event.type === 'touchstart') {
            event.preventDefault();
        }
    };
    
    const onMouseUp = () => {
        isDragging = false;
    };
    
    const onMouseMove = (event) => {
        if (!isDragging || !CONFIG.animation.dragEnabled) return;
        
        // Handle both mouse and touch events
        const clientX = event.type === 'touchmove' ? 
            event.touches[0].clientX : event.clientX;
        
        // Calculate rotation based on mouse movement
        const rotationSpeed = 0.005;
        const movementX = (previousX - clientX) * rotationSpeed;
        
        // Update angle based on movement
        angle += movementX;
        
        // Store current position for next frame
        previousX = clientX;
    };
    
    // Add event listeners
    if (container) {
        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        
        // Add touch event support
        container.addEventListener('touchstart', onMouseDown, { passive: false });
        window.addEventListener('touchmove', onMouseMove);
        window.addEventListener('touchend', onMouseUp);
    }
    
    // Function to update particle systems
    function updateParticleSystems() {
        // Find all particle systems in the scene
        scene.traverse(object => {
            if (object instanceof THREE.Points) {
                const positions = object.geometry.attributes.position.array;
                const velocities = object.userData.velocities;
                const originalPositions = object.userData.originalPositions;
                
                // Update each particle
                for (let i = 0; i < positions.length; i += 3) {
                    // Apply velocity
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];
                    
                    // Reset particles that go too high
                    if (positions[i + 1] > originalPositions[i + 1] + 20) {
                        positions[i] = originalPositions[i];
                        positions[i + 1] = originalPositions[i + 1];
                        positions[i + 2] = originalPositions[i + 2];
                    }
                }
                
                // Mark the attribute as needing update
                object.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    
    // Camera rotation function
    function updateCameraPosition() {
        // Get current zoom level from zoomControls
        const zoomLevel = zoomControls ? zoomControls.zoomLevel() : 1.0;
        
        // Get current elevation offset from zoomControls
        const elevationOffset = zoomControls ? zoomControls.elevationOffset() : 0;
        
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
        if (labelSystem && labelSystem.isHovered) {
            isLabelHovered = labelSystem.isHovered();
        }
        
        // Only update angle if:
        // 1. Rotation is enabled via controls
        // 2. Not currently dragging
        // 3. No label is being hovered
        if (controls.isRotating() && !isDragging && !isLabelHovered) {
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
    
    // Start animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Update camera position
        updateCameraPosition();
        
        // Update particle systems
        updateParticleSystems();
        
        // Update labels if label system exists
        if (labelSystem) {
            labelSystem.updateLabels(camera);
        }
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Start the animation loop
    animate();
    
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

console.log('Animation module loaded!');
