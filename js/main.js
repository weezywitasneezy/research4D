// Main entry point for visualization

// Global variables to hold module references after THREE is loaded
let Scene, Controls, Labels, EasternRegion, CentralRegion, WesternRegion, UnderwaterRegion, SkyRegion, Animations, Utils;

// Global state
let cleanup = null;
let scene, camera, renderer, labelContainer, labelSystem, controls;

// Initialize modules after THREE.js is loaded
function initModules() {
    // Create module objects with necessary dependencies
    Scene = {
        initScene: function(container) {
            // Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87ceeb); // Sky blue from CONFIG
            
            // Camera setup
            camera = new THREE.PerspectiveCamera(
                45, // fov
                container.clientWidth / container.clientHeight,
                0.1, // near
                2000 // far
            );
            
            // Position camera
            const zoomFactor = 0.7;
            const cameraRadius = 320 * zoomFactor;
            const cameraHeight = 180 * zoomFactor;
            
            camera.position.set(cameraRadius, cameraHeight, cameraRadius);
            camera.lookAt(0, 0, 0);
            
            // Renderer setup
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);
            
            // Create a container for HTML labels
            labelContainer = document.createElement('div');
            labelContainer.style.position = 'absolute';
            labelContainer.style.top = '0';
            labelContainer.style.left = '0';
            labelContainer.style.width = '100%';
            labelContainer.style.height = '100%';
            labelContainer.style.pointerEvents = 'none';
            labelContainer.style.overflow = 'hidden';
            container.appendChild(labelContainer);
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(50, 100, 50);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
            
            // Add base plane (sea level)
            const baseGeometry = new THREE.PlaneGeometry(400, 400);
            const baseMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x4682b4, // Steel blue from CONFIG
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
            basePlane.rotation.x = -Math.PI / 2;
            scene.add(basePlane);
            
            // Add grid helper
            const gridHelper = new THREE.GridHelper(400, 40, 0x000000, 0x000000);
            gridHelper.position.y = 0.1;
            gridHelper.material.opacity = 0.2;
            gridHelper.material.transparent = true;
            scene.add(gridHelper);
            
            return { scene, camera, renderer, labelContainer };
        }
    };
    
    Controls = {
        setupControls: function(container) {
            const visualizationContainer = document.querySelector('.visualization-container');
            const visualizationControls = document.querySelector('.visualization-controls');
            
            // State
            const state = {
                isRotating: true // Default to rotating
            };
            
            // Event listeners
            const listeners = [];
            
            if (!visualizationControls) {
                console.warn('Visualization controls not found');
                return { 
                    isRotating: () => state.isRotating,
                    cleanup: () => {}
                };
            }
            
            // Get or create rotation button
            let toggleRotationButton = document.getElementById('toggle-rotation');
            
            if (!toggleRotationButton) {
                toggleRotationButton = document.createElement('button');
                toggleRotationButton.id = 'toggle-rotation';
                toggleRotationButton.className = 'control-button';
                toggleRotationButton.textContent = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
                visualizationControls.appendChild(toggleRotationButton);
            }
            
            // Create fullscreen button
            const fullscreenButton = document.createElement('button');
            fullscreenButton.id = 'toggle-fullscreen';
            fullscreenButton.className = 'control-button';
            fullscreenButton.textContent = 'Enter Fullscreen';
            
            // Insert fullscreen button after rotation button
            if (toggleRotationButton) {
                toggleRotationButton.insertAdjacentElement('afterend', fullscreenButton);
            } else {
                visualizationControls.appendChild(fullscreenButton);
            }
            
            // Toggle rotation handler
            const handleToggleRotation = function() {
                state.isRotating = !state.isRotating;
                this.textContent = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
            };
            
            // Toggle fullscreen handler
            const handleToggleFullscreen = function() {
                toggleFullScreen(visualizationContainer);
                
                // Force a resize after a short delay to ensure proper rendering
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 100);
            };
            
            // Update fullscreen button text based on fullscreen state
            const updateFullscreenButtonText = function() {
                if (document.fullscreenElement || 
                    document.mozFullScreenElement || 
                    document.webkitFullscreenElement || 
                    document.msFullscreenElement) {
                    fullscreenButton.textContent = 'Exit Fullscreen';
                } else {
                    fullscreenButton.textContent = 'Enter Fullscreen';
                }
            };
            
            // Add event listeners
            toggleRotationButton.addEventListener('click', handleToggleRotation);
            fullscreenButton.addEventListener('click', handleToggleFullscreen);
            document.addEventListener('fullscreenchange', updateFullscreenButtonText);
            document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
            document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
            document.addEventListener('MSFullscreenChange', updateFullscreenButtonText);
            
            // Track listeners for cleanup
            listeners.push(
                { element: toggleRotationButton, event: 'click', handler: handleToggleRotation },
                { element: fullscreenButton, event: 'click', handler: handleToggleFullscreen },
                { element: document, event: 'fullscreenchange', handler: updateFullscreenButtonText },
                { element: document, event: 'mozfullscreenchange', handler: updateFullscreenButtonText },
                { element: document, event: 'webkitfullscreenchange', handler: updateFullscreenButtonText },
                { element: document, event: 'MSFullscreenChange', handler: updateFullscreenButtonText }
            );
            
            return {
                isRotating: () => state.isRotating,
                cleanup: () => {
                    // Remove all event listeners
                    listeners.forEach(({ element, event, handler }) => {
                        element.removeEventListener(event, handler);
                    });
                }
            };
        }
    };
    
    // Helper function for fullscreen
    function toggleFullScreen(element) {
        if (!document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement) {
            
            // Enter fullscreen mode
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.warn(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen mode
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => {
                    console.warn(`Error attempting to exit fullscreen: ${err.message}`);
                });
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    Labels = {
        setupLabelSystem: function(container) {
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
                        const scale = Math.max(0.5, Math.min(1.2, 800 / dist));
                        
                        // Update label position and visibility
                        label.element.style.display = 'block';
                        label.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                        label.element.style.fontSize = `${14 * scale}px`;
                        
                        // Adjust opacity based on distance
                        const opacity = Math.max(0.3, Math.min(1.0, 500 / dist));
                        label.element.style.opacity = opacity.toString();
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
    };
    
    // Simple placeholder for regions
    EasternRegion = {
        createEasternContinent: function(scene, labelSystem) {
            // Create a basic eastern continent
            const easternGroup = new THREE.Group();
            
            // Main continent body
            const continentGeom = new THREE.BoxGeometry(140, 12, 180);
            const continentMat = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 });
            const continent = new THREE.Mesh(continentGeom, continentMat);
            easternGroup.add(continent);
            
            // Position
            easternGroup.position.set(130, 6, 0);
            scene.add(easternGroup);
            
            // Add label
            labelSystem.addLabel(easternGroup, "Eastern Continent", 0xa9a9a9);
            
            return { continent: easternGroup };
        }
    };
    
    CentralRegion = {
        createCentralIslands: function(scene, labelSystem) {
            // Create a basic central islands
            const islandGroup = new THREE.Group();
            
            // Magic Islands Capital
            const islandGeom = new THREE.CylinderGeometry(35, 40, 15, 8);
            const islandMat = new THREE.MeshLambertMaterial({ color: 0x9932cc });
            const island = new THREE.Mesh(islandGeom, islandMat);
            islandGroup.add(island);
            
            // Position
            islandGroup.position.set(0, 7.5, 0);
            scene.add(islandGroup);
            
            // Add label
            labelSystem.addLabel(islandGroup, "Magic Islands", 0x9932cc);
            
            return { magicIslands: islandGroup };
        }
    };
    
    WesternRegion = {
        createWesternRegions: function(scene, labelSystem) {
            // Create basic western regions
            const westernGroup = new THREE.Group();
            
            // Fire Islands
            const islandGeom = new THREE.CylinderGeometry(30, 35, 20, 8);
            const islandMat = new THREE.MeshLambertMaterial({ color: 0xff4500 });
            const island = new THREE.Mesh(islandGeom, islandMat);
            westernGroup.add(island);
            
            // Position
            westernGroup.position.set(-90, 10, 0);
            scene.add(westernGroup);
            
            // Add label
            labelSystem.addLabel(westernGroup, "Fire Islands", 0xff4500);
            
            return { fireIslands: westernGroup };
        }
    };
    
    SkyRegion = {
        createSkyStructures: function(scene, labelSystem) {
            // Create basic sky palace
            const skyGroup = new THREE.Group();
            
            // Sky Palace
            const palaceGeom = new THREE.CylinderGeometry(18, 22, 6, 6);
            const palaceMat = new THREE.MeshLambertMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const palace = new THREE.Mesh(palaceGeom, palaceMat);
            skyGroup.add(palace);
            
            // Position
            skyGroup.position.set(100, 80, 60);
            scene.add(skyGroup);
            
            // Add label
            labelSystem.addLabel(skyGroup, "Sky Palace", 0x00ffff);
            
            return { skyPalace: skyGroup };
        }
    };
    
    UnderwaterRegion = {
        createUnderwaterStructures: function(scene, labelSystem) {
            // Create basic atlantis
            const atlantisGroup = new THREE.Group();
            
            // Atlantis
            const atlantisGeom = new THREE.DodecahedronGeometry(40, 1);
            const atlantisMat = new THREE.MeshLambertMaterial({
                color: 0x40e0d0,
                transparent: true,
                opacity: 0.7
            });
            const atlantis = new THREE.Mesh(atlantisGeom, atlantisMat);
            atlantisGroup.add(atlantis);
            
            // Position
            atlantisGroup.position.set(0, -50, 45);
            scene.add(atlantisGroup);
            
            // Add label
            labelSystem.addLabel(atlantisGroup, "Atlantis", 0x40e0d0);
            
            return { atlantis: atlantisGroup };
        }
    };
    
    Utils = {
        createConnectors: function(scene, elements) {
            // Create vertical connectors between different regions
            const createConnector = (startX, startY, startZ, endX, endY, endZ, color) => {
                const points = [
                    new THREE.Vector3(startX, startY, startZ),
                    new THREE.Vector3(endX, endY, endZ)
                ];
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ 
                    color, 
                    linewidth: 2,
                    transparent: true,
                    opacity: 0.7
                });
                
                const line = new THREE.Line(geometry, material);
                scene.add(line);
                return line;
            };
            
            // Just create a few sample connectors
            const connectors = [
                // Sky Palace to Ground
                createConnector(100, 80, 60, 100, 16, 60, 0x00ffff),
                
                // Magic Islands to Atlantis
                createConnector(0, 7.5, 0, 0, -50, 45, 0x9932cc)
            ];
            
            return connectors;
        }
    };
    
    Animations = {
        initAnimations: function(camera, isRotatingFn) {
            // Camera rotation variables
            let angle = 0;
            const radius = 320 * 0.7; // From CONFIG
            const height = 180 * 0.7;
            const centerX = 0;
            const centerZ = 0;
            
            // Animation frame ID for cleanup
            let animationFrameId = null;
            
            // Camera rotation function
            function updateCameraPosition() {
                if (isRotatingFn()) {
                    angle += 0.002; // From CONFIG
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
        },
        
        startAnimationLoop: function(renderer, scene, camera, animations, labelSystem) {
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
    };
}

// Main initialization function
function initWorldVisualization() {
    // Initialize the scene, camera, and renderer
    const container = document.getElementById('visualization-mount');
    if (!container) return;
    
    // Load all our module functionality
    initModules();
    
    const sceneObjects = Scene.initScene(container);
    scene = sceneObjects.scene;
    camera = sceneObjects.camera;
    renderer = sceneObjects.renderer;
    labelContainer = sceneObjects.labelContainer;
    
    // Setup controls
    controls = Controls.setupControls(container);
    
    // Setup label system
    labelSystem = Labels.setupLabelSystem(labelContainer);
    
    // Add regions to the scene - simplified versions for testing
    const easternElements = EasternRegion.createEasternContinent(scene, labelSystem);
    const centralElements = CentralRegion.createCentralIslands(scene, labelSystem);
    const westernElements = WesternRegion.createWesternRegions(scene, labelSystem);
    const underwaterElements = UnderwaterRegion.createUnderwaterStructures(scene, labelSystem);
    const skyElements = SkyRegion.createSkyStructures(scene, labelSystem);
    
    // Create vertical connectors between layers
    Utils.createConnectors(scene, {
        easternElements,
        centralElements,
        underwaterElements,
        skyElements
    });
    
    // Setup animations
    const animations = Animations.initAnimations(camera, controls.isRotating);
    
    // Start animation loop
    Animations.startAnimationLoop(renderer, scene, camera, animations, labelSystem);
    
    // Setup cleanup function
    cleanup = function() {
        // Cleanup code here...
        controls.cleanup();
        animations.cleanup();
        labelSystem.cleanup();
        
        // Dispose of all scene resources
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    };
    
    return cleanup;
}

// Load Three.js and initialize visualization
document.addEventListener('DOMContentLoaded', function() {
    // Load Three.js dynamically
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = function() {
        cleanup = initWorldVisualization();
    };
    document.head.appendChild(threeScript);
});

// Handle cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (cleanup) {
        cleanup();
    }
});