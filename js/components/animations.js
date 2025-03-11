// Animation and camera controls

// Initialize animations
function initAnimations(camera, isRotatingFn) {
    // Camera rotation variables
    let angle = 0;
    const radius = CONFIG.camera.radius * CONFIG.camera.zoomFactor;
    const height = CONFIG.camera.height * CONFIG.camera.zoomFactor;
    const centerX = 0;
    const centerZ = 0;
    
    // Animation frame ID for cleanup
    let animationFrameId = null;
    
    // Camera rotation function
    function updateCameraPosition() {
        if (isRotatingFn()) {
            angle += CONFIG.camera.rotationSpeed;
            camera.position.x = centerX + radius * Math.cos(angle);
            camera.position.z = centerZ + radius * Math.sin(angle);
            camera.position.y = height;
            camera.lookAt(0, 0, 0);
        }
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
        }
    };
}

// Start animation loop
function startAnimationLoop(renderer, scene, camera, animations, labelSystem) {
    // Animation loop
    function animate() {
        animations.setAnimationFrameId(requestAnimationFrame(animate));
        
        // Update camera position for rotation
        animations.updateCameraPosition();
        
        // Update label positions
        labelSystem.updateLabels(camera);
        
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