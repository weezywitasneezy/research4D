// Animation and camera controls
import { CONFIG } from '../core/config.js';
import * as THREE from 'three';

// Initialize animations
export function setupAnimations(camera, controls, labelSystem, renderer, scene, zoomControls) {
    console.log('Initializing animations with zoom and elevation support');
    
    // Initialize clock for delta time calculations
    const clock = new THREE.Clock();
    
    // Animation state
    let angle = 0;
    let radius = CONFIG.camera.radius * CONFIG.camera.zoomFactor;
    let height = CONFIG.camera.height * CONFIG.camera.zoomFactor;
    let isDragging = false;
    let previousX = 0;
    let animationFrameId = null;
    
    // Particle system state
    const particleSystems = {
        hellsEnd: [],
        hellsGate: {
            particles: null,
            portal: null
        }
    };
    
    // Center point (can be adjusted if needed)
    const centerX = 0;
    const centerZ = 0;
    
    // Get container for event handling
    const container = renderer.domElement.parentElement;
    
    // Mouse interaction handlers
    const onMouseDown = (event) => {
        isDragging = true;
        const clientX = event.type === 'touchstart' ? 
            event.touches[0].clientX : event.clientX;
        previousX = clientX;
        if (event.type === 'touchstart') {
            event.preventDefault();
        }
    };
    
    const onMouseUp = () => {
        isDragging = false;
    };
    
    const onMouseMove = (event) => {
        if (!isDragging || !CONFIG.animation.dragEnabled) return;
        const clientX = event.type === 'touchmove' ? 
            event.touches[0].clientX : event.clientX;
        const rotationSpeed = 0.005;
        const movementX = (previousX - clientX) * rotationSpeed;
        angle += movementX;
        previousX = clientX;
    };
    
    // Add event listeners
    if (container) {
        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        container.addEventListener('touchstart', onMouseDown, { passive: false });
        window.addEventListener('touchmove', onMouseMove);
        window.addEventListener('touchend', onMouseUp);
    }
    
    // Function to update general particle systems
    function updateParticleSystems(deltaTime) {
        scene.traverse(object => {
            if (object instanceof THREE.Points) {
                const positions = object.geometry.attributes.position.array;
                const velocities = object.userData.velocities;
                const originalPositions = object.userData.originalPositions;
                
                if (velocities && originalPositions) {
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i] += velocities[i] * deltaTime;
                        positions[i + 1] += velocities[i + 1] * deltaTime;
                        positions[i + 2] += velocities[i + 2] * deltaTime;
                        
                        if (positions[i + 1] > originalPositions[i + 1] + 20) {
                            positions[i] = originalPositions[i];
                            positions[i + 1] = originalPositions[i + 1];
                            positions[i + 2] = originalPositions[i + 2];
                        }
                    }
                    object.geometry.attributes.position.needsUpdate = true;
                }
            }
        });
    }
    
    // Update Hell's End particles
    function updateHellsEndParticles(deltaTime) {
        particleSystems.hellsEnd.forEach(particles => {
            if (!particles || !particles.geometry) return;
            
            const positions = particles.geometry.attributes.position.array;
            const colors = particles.geometry.attributes.color.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += (Math.random() - 0.4) * deltaTime * 10;
                
                if (positions[i + 1] > particles.userData.maxHeight) {
                    positions[i + 1] = particles.userData.baseHeight;
                }
                
                const flicker = 0.9 + Math.random() * 0.2;
                colors[i] *= flicker;
                colors[i + 1] *= flicker;
                colors[i + 2] *= flicker;
                
                // Renormalize colors to prevent fade-out
                const maxColor = Math.max(colors[i], colors[i + 1], colors[i + 2]);
                if (maxColor < 0.5) {
                    colors[i] *= 2;
                    colors[i + 1] *= 2;
                    colors[i + 2] *= 2;
                }
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.color.needsUpdate = true;
        });
    }
    
    // Update Hell's Gate effects
    function updateHellsGateEffects(deltaTime) {
        const { particles, portal } = particleSystems.hellsGate;
        
        if (particles && particles.geometry) {
            const positions = particles.geometry.attributes.position.array;
            const colors = particles.geometry.attributes.color.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                
                const angle = deltaTime * 0.5;
                const radius = Math.sqrt(x * x + z * z);
                
                positions[i] = Math.cos(angle) * x - Math.sin(angle) * z;
                positions[i + 2] = Math.sin(angle) * x + Math.cos(angle) * z;
                positions[i + 1] += (Math.random() - 0.5) * deltaTime * 5;
                
                if (Math.abs(positions[i + 1] - particles.userData.baseHeight) > 40) {
                    positions[i + 1] = particles.userData.baseHeight + (Math.random() - 0.5) * 10;
                }
                
                const flicker = 0.95 + Math.random() * 0.1;
                colors[i] *= flicker;
                colors[i + 1] *= flicker;
                colors[i + 2] *= flicker;
                
                // Renormalize colors
                const maxColor = Math.max(colors[i], colors[i + 1], colors[i + 2]);
                if (maxColor < 0.3) {
                    colors[i] *= 2;
                    colors[i + 1] *= 2;
                    colors[i + 2] *= 2;
                }
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.color.needsUpdate = true;
        }
        
        if (portal && portal.material) {
            const time = performance.now() * 0.001;
            const pulse = Math.sin(time * 2) * 0.1 + 0.3;
            portal.material.opacity = pulse;
            portal.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
        }
    }
    
    // Camera rotation function
    function updateCameraPosition() {
        const zoomLevel = zoomControls ? zoomControls.zoomLevel() : 1.0;
        const elevationOffset = zoomControls ? zoomControls.elevationOffset() : 0;
        const baseRadius = (CONFIG && CONFIG.camera) ? CONFIG.camera.radius * CONFIG.camera.zoomFactor : 480 * 0.7;
        const baseHeight = (CONFIG && CONFIG.camera) ? CONFIG.camera.height * CONFIG.camera.zoomFactor : 180 * 0.7;
        
        radius = baseRadius / zoomLevel;
        height = (baseHeight / zoomLevel) + elevationOffset;
        
        let isLabelHovered = labelSystem && labelSystem.isHovered ? labelSystem.isHovered() : false;
        
        if (controls.isRotating() && !isDragging && !isLabelHovered) {
            const rotationSpeed = (CONFIG && CONFIG.camera) ? CONFIG.camera.rotationSpeed : 0.002;
            angle += rotationSpeed;
        }
        
        camera.position.x = centerX + radius * Math.cos(angle);
        camera.position.z = centerZ + radius * Math.sin(angle);
        camera.position.y = height;
        camera.lookAt(centerX, 0, centerZ);
    }
    
    // Animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        const deltaTime = clock.getDelta();
        
        updateCameraPosition();
        updateParticleSystems(deltaTime);
        updateHellsEndParticles(deltaTime);
        updateHellsGateEffects(deltaTime);
        
        if (labelSystem) {
            labelSystem.updateLabels(camera);
        }
        
        renderer.render(scene, camera);
    }
    
    // Start the animation loop
    animate();
    
    // Return public interface
    return {
        registerHellsEndParticles: (particles) => {
            particleSystems.hellsEnd.push(particles);
        },
        registerHellsGateEffects: (particles, portal) => {
            particleSystems.hellsGate.particles = particles;
            particleSystems.hellsGate.portal = portal;
        },
        getAnimationFrameId: () => animationFrameId,
        setAnimationFrameId: (id) => { animationFrameId = id; },
        cleanup: () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
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
