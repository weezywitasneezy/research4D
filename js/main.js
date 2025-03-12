// Main entry point for visualization

// Global state
let cleanup = null;

// Main initialization function
function initWorldVisualization() {
    // Initialize the scene, camera, and renderer
    const container = document.getElementById('visualization-mount');
    if (!container) {
        console.error("Visualization mount not found!");
        return;
    }
    
    // Ensure container has appropriate CSS for fullscreen
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    
    // First load core modules
    loadCoreModules()
        .then(core => {
            const { scene, camera, renderer, labelSystem, controls } = core;
            
            // Then load region modules
            return loadRegionModules(scene, labelSystem)
                .then(regions => {
                    // Create connectors between regions
                    loadUtilsAndCreateConnectors(scene, regions);
                    
                    // Load zoom controls
                    loadZoomControls(container, camera).then(zoomControls => {
                        // Store zoomControls globally for access by other components
                        window.zoomControls = zoomControls;
                        
                        // Setup animations with zoom controls
                        setupAnimations(camera, controls, labelSystem, renderer, scene, zoomControls);
                    });
                    
                    // Setup cleanup function
                    cleanup = function() {
                        // Cleanup code here...
                        if (controls && controls.cleanup) controls.cleanup();
                        if (core.cleanup) core.cleanup();
                        
                        if (labelSystem && labelSystem.cleanup) {
                            labelSystem.cleanup();
                        }
                        
                        if (window.zoomControls && window.zoomControls.cleanup) {
                            window.zoomControls.cleanup();
                        }
                        
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
                        
                        // Clear global references
                        window.zoomControls = null;
                    };
                });
        })
        .catch(error => {
            console.error("Error initializing visualization:", error);
        });
    
    return cleanup;
}

// Load core modules (scene, controls, labels)
function loadCoreModules() {
    return new Promise((resolve, reject) => {
        // Create scene module
        const sceneModule = {
            initScene: function(container) {
                // Scene setup
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0x87ceeb); // Sky blue
                
                // Camera setup
                const camera = new THREE.PerspectiveCamera(
                    45, // fov
                    container.clientWidth / container.clientHeight,
                    0.1, // near
                    2000 // far
                );
                
                // Position camera
                const zoomFactor = 0.7;
                const cameraRadius = 480 * zoomFactor;
                const cameraHeight = 180 * zoomFactor;
                
                camera.position.set(cameraRadius, cameraHeight, cameraRadius);
                camera.lookAt(0, 0, 0);
                
                // Renderer setup
                const renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                container.appendChild(renderer.domElement);
                
                // Create a container for HTML labels
                const labelContainer = document.createElement('div');
                labelContainer.style.position = 'absolute';
                labelContainer.style.top = '0';
                labelContainer.style.left = '0';
                labelContainer.style.width = '100%';
                labelContainer.style.height = '100%';
                labelContainer.style.overflow = 'hidden';
                container.appendChild(labelContainer);
                
                // Create direction indicators
                function createDirectionIndicators(container) {
                    const directions = [
                        { text: 'N', class: 'direction-north' },
                        { text: 'S', class: 'direction-south' },
                        { text: 'E', class: 'direction-east' },
                        { text: 'W', class: 'direction-west' }
                    ];
                    
                    directions.forEach(dir => {
                        const indicator = document.createElement('div');
                        indicator.className = `direction-indicator ${dir.class}`;
                        indicator.textContent = dir.text;
                        container.appendChild(indicator);
                    });
                }
                
                // Add direction indicators to the container
                createDirectionIndicators(container);
                
                // Add lights
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambientLight);
                
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(50, 100, 50);
                directionalLight.castShadow = true;
                scene.add(directionalLight);
                
                // Add base plane (sea level)
                const baseGeometry = new THREE.PlaneGeometry(600, 400);
                const baseMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x4682b4, // Steel blue
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.8
                });
                const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
                basePlane.rotation.x = -Math.PI / 2;
                scene.add(basePlane);
                
                // Add grid helper
                const gridHelper = new THREE.GridHelper(600, 60, 0x000000, 0x000000);
                gridHelper.position.y = 0.1;
                gridHelper.material.opacity = 0.2;
                gridHelper.material.transparent = true;
                scene.add(gridHelper);
                
                // Setup window resize handler
                const handleResize = () => {
                    // If in fullscreen, get dimensions from window
                    // Otherwise use container dimensions
                    let width, height;
                    
                    if (document.fullscreenElement ||
                        document.mozFullScreenElement ||
                        document.webkitFullscreenElement ||
                        document.msFullscreenElement) {
                        width = window.innerWidth;
                        height = window.innerHeight;
                        
                        // When in fullscreen, ensure renderer canvas fills the entire screen
                        renderer.domElement.style.position = 'absolute';
                        renderer.domElement.style.left = '0';
                        renderer.domElement.style.top = '0';
                        renderer.domElement.style.width = '100%';
                        renderer.domElement.style.height = '100%';
                        
                        // Make sure label container also fills the screen
                        if (labelContainer) {
                            labelContainer.style.position = 'absolute';
                            labelContainer.style.left = '0';
                            labelContainer.style.top = '0';
                            labelContainer.style.width = '100%';
                            labelContainer.style.height = '100%';
                        }
                        
                        // Update directional indicators
                        const indicators = container.querySelectorAll('.direction-indicator');
                        indicators.forEach(indicator => {
                            if (indicator.classList.contains('direction-north')) {
                                indicator.style.top = '30px';
                            } else if (indicator.classList.contains('direction-south')) {
                                indicator.style.bottom = '30px';
                            } else if (indicator.classList.contains('direction-east')) {
                                indicator.style.right = '30px';
                            } else if (indicator.classList.contains('direction-west')) {
                                indicator.style.left = '30px';
                            }
                        });
                    } else {
                        width = container.clientWidth;
                        height = container.clientHeight;
                        
                        // Reset styles when not in fullscreen
                        renderer.domElement.style.position = '';
                        renderer.domElement.style.left = '';
                        renderer.domElement.style.top = '';
                        renderer.domElement.style.width = '';
                        renderer.domElement.style.height = '';
                        
                        if (labelContainer) {
                            labelContainer.style.position = 'absolute';
                            labelContainer.style.left = '0';
                            labelContainer.style.top = '0';
                            labelContainer.style.width = '100%';
                            labelContainer.style.height = '100%';
                        }
                    }
                    
                    // Update camera
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    
                    // Update renderer size
                    renderer.setSize(width, height, true);
                    
                    console.log(`Resize: ${width}x${height}, Fullscreen: ${!!document.fullscreenElement}`);
                };
                
                // Add resize event listeners including fullscreen changes
                window.addEventListener('resize', handleResize);
                
                // Add delay to fullscreen event handlers to ensure proper rendering after transition
                const delayedResize = () => {
                    setTimeout(handleResize, 100);
                };
                
                document.addEventListener('fullscreenchange', delayedResize);
                document.addEventListener('mozfullscreenchange', delayedResize);
                document.addEventListener('webkitfullscreenchange', delayedResize);
                document.addEventListener('MSFullscreenChange', delayedResize);
                
                const cleanup = () => {
                    window.removeEventListener('resize', handleResize);
                    document.removeEventListener('fullscreenchange', delayedResize);
                    document.removeEventListener('mozfullscreenchange', delayedResize);
                    document.removeEventListener('webkitfullscreenchange', delayedResize);
                    document.removeEventListener('MSFullscreenChange', delayedResize);
                };
                
                return { scene, camera, renderer, labelContainer, cleanup };
            }
        };
        
        // Create controls module
        const controlsModule = {
            setupControls: function(container) {
                const visualizationContainer = document.querySelector('.visualization-container');
                // Find or create visualization controls container
                let visualizationControls = document.querySelector('.visualization-controls');
                
                // Remove any existing controls to start fresh
                if (visualizationControls) {
                    // Clear out all existing content
                    visualizationControls.innerHTML = '';
                } else {
                    // Create the controls container if it doesn't exist
                    visualizationControls = document.createElement('div');
                    visualizationControls.className = 'visualization-controls';
                    container.appendChild(visualizationControls);
                }
                
                // Remove any location legend
                const locationLegend = document.querySelector('.location-legend');
                if (locationLegend && locationLegend.parentNode) {
                    locationLegend.parentNode.removeChild(locationLegend);
                }
                
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
                    toggleRotationButton.className = 'icon-button';
                    
                        // Create icon element for play/pause
                    const rotationIcon = document.createElement('div');
                    rotationIcon.className = state.isRotating ? 'pause-icon' : 'play-icon';
                    toggleRotationButton.appendChild(rotationIcon);
                    
                    visualizationControls.appendChild(toggleRotationButton);
                }
                
                // Create fullscreen button
                const fullscreenButton = document.createElement('button');
                fullscreenButton.id = 'toggle-fullscreen';
                fullscreenButton.className = 'icon-button';
                
                // Create fullscreen icon as text (using symbol)
                fullscreenButton.innerHTML = '⤢';
                fullscreenButton.style.fontSize = '20px';
                
                // Insert fullscreen button after rotation button
                if (toggleRotationButton) {
                    toggleRotationButton.insertAdjacentElement('afterend', fullscreenButton);
                } else {
                    visualizationControls.appendChild(fullscreenButton);
                }
                
                // Toggle rotation handler
                const handleToggleRotation = function() {
                    state.isRotating = !state.isRotating;
                    
                    // Get or create icon
                    let icon = this.querySelector('.play-icon, .pause-icon');
                    if (!icon) {
                        icon = document.createElement('div');
                        this.appendChild(icon);
                    }
                    
                    // Update icon class
                    if (state.isRotating) {
                        icon.className = 'pause-icon';
                    } else {
                        icon.className = 'play-icon';
                    }
                };
                
                // Toggle fullscreen handler
                const handleToggleFullscreen = function() {
                    toggleFullScreen(visualizationContainer);
                    
                    // Force a resize after a short delay to ensure proper rendering
                    setTimeout(() => {
                        window.dispatchEvent(new Event('resize'));
                    }, 100);
                };
                
                // Update fullscreen button icon based on fullscreen state
                const updateFullscreenButtonIcon = function() {
                    // Update icon based on fullscreen state
                    if (document.fullscreenElement || 
                        document.mozFullScreenElement || 
                        document.webkitFullscreenElement || 
                        document.msFullscreenElement) {
                        fullscreenButton.innerHTML = '⤣'; // Unicode character for exit fullscreen
                    } else {
                        fullscreenButton.innerHTML = '⤢'; // Unicode character for enter fullscreen
                    }
                };
                
                // Add event listeners
                toggleRotationButton.addEventListener('click', handleToggleRotation);
                fullscreenButton.addEventListener('click', handleToggleFullscreen);
                document.addEventListener('fullscreenchange', updateFullscreenButtonIcon);
                document.addEventListener('mozfullscreenchange', updateFullscreenButtonIcon);
                document.addEventListener('webkitfullscreenchange', updateFullscreenButtonIcon);
                document.addEventListener('MSFullscreenChange', updateFullscreenButtonIcon);
                
                // Track listeners for cleanup
                listeners.push(
                    { element: toggleRotationButton, event: 'click', handler: handleToggleRotation },
                    { element: fullscreenButton, event: 'click', handler: handleToggleFullscreen },
                    { element: document, event: 'fullscreenchange', handler: updateFullscreenButtonIcon },
                    { element: document, event: 'mozfullscreenchange', handler: updateFullscreenButtonIcon },
                    { element: document, event: 'webkitfullscreenchange', handler: updateFullscreenButtonIcon },
                    { element: document, event: 'MSFullscreenChange', handler: updateFullscreenButtonIcon }
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
        
        // Create label system module
        const labelsModule = {
            setupLabelSystem: function(container) {
                // First, try to load the external label system
                try {
                    // Try loading from components first
                    if (typeof setupLabelSystem === 'function') {
                        return setupLabelSystem(container);
                    }
                } catch (e) {
                    console.warn('Failed to load external label system, using built-in fallback', e);
                }
                
                // If the external system fails, use the built-in one
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
                    
                    // Add hover event handlers for enhanced interaction
                    const mouseEnterHandler = () => {
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
                    };
                    
                    const mouseLeaveHandler = () => {
                        // Restore original styles
                        labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        labelDiv.style.color = labelDiv._originalColor;
                        
                        // Remove glow animation class
                        labelDiv.classList.remove('label3d-glow');
                    };
                    
                    // Add click event for future interaction
                    const clickHandler = () => {
                        console.log(`Clicked on: ${text}`);
                        // We can add additional functionality here like focusing the camera on this object
                        // or showing information about it
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
                    cleanup,
                    labelData
                };
            }
        };
        
        // Fullscreen toggle function
        function toggleFullScreen(element) {
            if (!document.fullscreenElement &&
                !document.mozFullScreenElement &&
                !document.webkitFullscreenElement &&
                !document.msFullscreenElement) {
                
                // Before entering fullscreen, ensure the element has appropriate styles
                if (element) {
                    // Save original styles to restore later
                    element._originalStyles = {
                        width: element.style.width,
                        height: element.style.height,
                        position: element.style.position,
                        overflow: element.style.overflow
                    };
                    
                    // Set styles for fullscreen
                    element.style.width = '100%';
                    element.style.height = '100%';
                    element.style.position = 'fixed';
                    element.style.top = '0';
                    element.style.left = '0';
                    element.style.overflow = 'hidden';
                }
                
                // Enter fullscreen mode
                try {
                    if (element.requestFullscreen) {
                        element.requestFullscreen().then(() => {
                            console.log("Entered fullscreen mode");
                            // Force resize immediately
                            window.dispatchEvent(new Event('resize'));
                        }).catch(err => {
                            console.warn(`Error attempting to enable fullscreen: ${err.message}`);
                        });
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                        console.log("Entered fullscreen mode (moz)");
                    } else if (element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                        console.log("Entered fullscreen mode (webkit)");
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                        console.log("Entered fullscreen mode (ms)");
                    }
                } catch (err) {
                    console.error("Fullscreen error:", err);
                }
            } else {
                // Exit fullscreen mode
                try {
                    if (document.exitFullscreen) {
                        document.exitFullscreen().then(() => {
                            console.log("Exited fullscreen mode");
                            // Restore original styles
                            if (element && element._originalStyles) {
                                Object.keys(element._originalStyles).forEach(key => {
                                    element.style[key] = element._originalStyles[key];
                                });
                            }
                        }).catch(err => {
                            console.warn(`Error attempting to exit fullscreen: ${err.message}`);
                        });
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                        console.log("Exited fullscreen mode (moz)");
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                        console.log("Exited fullscreen mode (webkit)");
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                        console.log("Exited fullscreen mode (ms)");
                    }
                } catch (err) {
                    console.error("Fullscreen exit error:", err);
                }
            }
        }
        
        // Initialize scene, controls, and label system
        const container = document.getElementById('visualization-mount');
        const sceneResult = sceneModule.initScene(container);
        const scene = sceneResult.scene;
        const camera = sceneResult.camera;
        const renderer = sceneResult.renderer;
        const labelContainer = sceneResult.labelContainer;
        
        // Initialize controls
        const controls = controlsModule.setupControls(container);
        
        // Initialize label system
        const labelSystem = labelsModule.setupLabelSystem(labelContainer);
        
        // Store labelSystem reference in visualization mount for direct access
        container._labelSystem = labelSystem;
        
        resolve({
            scene,
            camera,
            renderer,
            labelSystem,
            controls,
            cleanup: sceneResult.cleanup
        });
    });
}

// Load region modules
function loadRegionModules(scene, labelSystem) {
    return new Promise((resolve, reject) => {
        // We'll load each region's script dynamically
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(script);
            });
        };
        
        // Load the configuration first
        loadScript('js/core/config.js')
            .then(() => {
                // Create a placeholder for regions
                const regions = {};
                
                // Load all region scripts
                return Promise.all([
                    // After each script loads, create the region and store the elements
                    loadScript('js/regions/eastern.js')
                        .then(() => {
                            if (typeof createEasternContinent === 'function') {
                                regions.eastern = createEasternContinent(scene, labelSystem);
                                console.log('Eastern region loaded');
                            } else {
                                console.warn('Eastern region function not found');
                                // Create a simple placeholder for testing
                                const easternGroup = new THREE.Group();
                                const box = new THREE.Mesh(
                                    new THREE.BoxGeometry(140, 12, 180),
                                    new THREE.MeshLambertMaterial({ color: 0xa9a9a9 })
                                );
                                easternGroup.add(box);
                                easternGroup.position.set(240, 6, 0);
                                scene.add(easternGroup);
                                
                                labelSystem.addLabel(easternGroup, "Eastern Continent", 0xa9a9a9);
                                regions.eastern = { continent: easternGroup };
                            }
                        }),
                    
                    loadScript('js/regions/central.js')
                        .then(() => {
                            if (typeof createCentralIslands === 'function') {
                                regions.central = createCentralIslands(scene, labelSystem);
                                console.log('Central region loaded');
                            } else {
                                console.warn('Central region function not found');
                                // Create a placeholder
                                const centralGroup = new THREE.Group();
                                const cylinder = new THREE.Mesh(
                                    new THREE.CylinderGeometry(35, 40, 15, 8),
                                    new THREE.MeshLambertMaterial({ color: 0x9932cc })
                                );
                                centralGroup.add(cylinder);
                                centralGroup.position.set(0, 7.5, 0);
                                scene.add(centralGroup);
                                
                                labelSystem.addLabel(centralGroup, "Magic Islands", 0x9932cc);
                                regions.central = { magicIslands: centralGroup };
                            }
                        }),
                    
                    loadScript('js/regions/western.js')
                        .then(() => {
                            if (typeof createWesternRegions === 'function') {
                                regions.western = createWesternRegions(scene, labelSystem);
                                console.log('Western region loaded');
                            } else {
                                console.warn('Western region function not found');
                                // Create a placeholder
                                const westernGroup = new THREE.Group();
                                const cylinder = new THREE.Mesh(
                                    new THREE.CylinderGeometry(30, 35, 20, 8),
                                    new THREE.MeshLambertMaterial({ color: 0xff4500 })
                                );
                                westernGroup.add(cylinder);
                                westernGroup.position.set(-135, 10, 0);
                                scene.add(westernGroup);
                                
                                labelSystem.addLabel(westernGroup, "Fire Islands", 0xff4500);
                                regions.western = { fireIslands: westernGroup };
                            }
                        }),
                    
                    loadScript('js/regions/underwater.js')
                        .then(() => {
                            if (typeof createUnderwaterStructures === 'function') {
                                regions.underwater = createUnderwaterStructures(scene, labelSystem);
                                console.log('Underwater region loaded');
                            } else {
                                console.warn('Underwater region function not found');
                                // Create a placeholder
                                const underwaterGroup = new THREE.Group();
                                const sphere = new THREE.Mesh(
                                    new THREE.DodecahedronGeometry(40, 1),
                                    new THREE.MeshLambertMaterial({ 
                                        color: 0x40e0d0,
                                        transparent: true,
                                        opacity: 0.7
                                    })
                                );
                                underwaterGroup.add(sphere);
                                underwaterGroup.position.set(0, -50, 45);
                                scene.add(underwaterGroup);
                                
                                labelSystem.addLabel(underwaterGroup, "Atlantis", 0x40e0d0);
                                regions.underwater = { atlantis: underwaterGroup };
                            }
                        }),
                    
                    loadScript('js/regions/sky.js')
                        .then(() => {
                            if (typeof createSkyStructures === 'function') {
                                regions.sky = createSkyStructures(scene, labelSystem);
                                console.log('Sky region loaded');
                            } else {
                                console.warn('Sky region function not found');
                                // Create a placeholder
                                const skyGroup = new THREE.Group();
                                const cylinder = new THREE.Mesh(
                                    new THREE.CylinderGeometry(18, 22, 6, 6),
                                    new THREE.MeshLambertMaterial({ 
                                        color: 0x00ffff,
                                        transparent: true,
                                        opacity: 0.8
                                    })
                                );
                                skyGroup.add(cylinder);
                                skyGroup.position.set(150, 80, 60);
                                scene.add(skyGroup);
                                
                                labelSystem.addLabel(skyGroup, "Sky Palace", 0x00ffff);
                                regions.sky = { skyPalace: skyGroup };
                            }
                        })
                ])
                .then(() => {
                    resolve(regions);
                });
            })
            .catch(error => {
                console.error("Error loading region modules:", error);
                reject(error);
            });
    });
}

// Load zoom controls module
function loadZoomControls(container, camera) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'js/components/zoom.js';
        script.onload = function() {
            if (typeof initZoomControls === 'function') {
                console.log('Initializing zoom controls');
                const zoomControls = initZoomControls(container, camera);
                resolve(zoomControls);
            } else {
                console.warn('Zoom controls function not found');
                resolve({ zoomLevel: () => 1.0, elevationOffset: () => 0 }); // Return dummy zoom control
            }
        };
        script.onerror = function() {
            console.error('Failed to load zoom controls script');
            resolve({ zoomLevel: () => 1.0, elevationOffset: () => 0 }); // Fallback
        };
        document.head.appendChild(script);
    });
}

// Setup animations
function setupAnimations(camera, controls, labelSystem, renderer, scene, zoomControls) {
    // Load animations script
    const script = document.createElement('script');
    script.src = 'js/components/animations.js';
    script.onload = function() {
        if (typeof initAnimations === 'function' && typeof startAnimationLoop === 'function') {
            const animations = initAnimations(camera, controls.isRotating, zoomControls.zoomLevel, zoomControls.elevationOffset);
            startAnimationLoop(renderer, scene, camera, animations, labelSystem);
        } else {
            console.warn('Animation functions not found, creating fallback');
            
            // Fallback animation implementation
            let angle = 0;
            let radius = 480 * 0.7;
            let height = 180 * 0.7;
            let animationFrameId = null;
            
            function animate() {
                animationFrameId = requestAnimationFrame(animate);
                
                // Get zoom level and elevation
                const zoomLevel = zoomControls ? zoomControls.zoomLevel() : 1.0;
                const elevationOffset = zoomControls ? zoomControls.elevationOffset() : 0;
                
                // Update camera position based on zoom and elevation
                radius = (480 * 0.7) / zoomLevel;
                height = ((180 * 0.7) / zoomLevel) + elevationOffset;
                
                // Rotate camera if needed
                if (controls.isRotating()) {
                    angle += 0.002;
                }
                
                // Position camera
                camera.position.x = radius * Math.cos(angle);
                camera.position.z = radius * Math.sin(angle);
                camera.position.y = height;
                camera.lookAt(0, 0, 0);
                
                // Update labels
                labelSystem.updateLabels(camera);
                
                // Render scene
                renderer.render(scene, camera);
            }
            
            // Start animation
            animate();
        }
    };
    script.onerror = function() {
        console.error('Failed to load animations script');
    };
    document.head.appendChild(script);
}

// Load utils and create connectors
function loadUtilsAndCreateConnectors(scene, regions) {
    const script = document.createElement('script');
    script.src = 'js/core/utils.js';
    script.onload = function() {
        if (typeof createConnectors === 'function') {
            createConnectors(scene, regions);
        } else {
            console.warn('Utils functions not found, creating fallback connectors');
            
            // Create a simple connector between regions
            function createConnector(startPos, endPos, color) {
                const points = [
                    new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                    new THREE.Vector3(endPos.x, endPos.y, endPos.z)
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
            }
            
            // Create some basic connectors between regions
            if (regions.sky && regions.sky.skyPalace && regions.eastern && regions.eastern.capital) {
                createConnector(
                    regions.sky.skyPalace.position,
                    regions.eastern.capital.position,
                    0x00ffff
                );
            }
            
            if (regions.central && regions.central.magicIslands && regions.underwater && regions.underwater.atlantis) {
                createConnector(
                    regions.central.magicIslands.position,
                    regions.underwater.atlantis.position,
                    0x9932cc
                );
            }
        }
    };
    script.onerror = function() {
        console.error('Failed to load utils script');
    };
    document.head.appendChild(script);
}

// Load Three.js and initialize visualization
document.addEventListener('DOMContentLoaded', function() {
    // Load Three.js dynamically
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    
    // Preload labels.js component
    const labelsScript = document.createElement('script');
    labelsScript.src = 'js/components/labels.js';
    labelsScript.onload = function() {
        console.log('Labels component loaded successfully');
    };
    labelsScript.onerror = function() {
        console.warn('Could not load external labels module, using built-in fallback');
    };
    document.head.appendChild(labelsScript);
    
    threeScript.onload = function() {
        console.log('THREE.js loaded, initializing visualization');
        // Also load other components before initializing
        const zoomScript = document.createElement('script');
        zoomScript.src = 'js/components/zoom.js';
        zoomScript.onload = function() {
            cleanup = initWorldVisualization();
        };
        document.head.appendChild(zoomScript);
    };
    threeScript.onerror = function() {
        console.error('Failed to load THREE.js library');
    };
    document.head.appendChild(threeScript);
});

// Handle cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (cleanup) {
        cleanup();
    }
});
