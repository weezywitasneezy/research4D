// Enhanced World Visualization with improved visual quality
function initWorldVisualization() {
    // DOM elements
    const container = document.getElementById('visualization-mount');
    const toggleRotationButton = document.getElementById('toggle-rotation');
    
    if (!container) return; // Exit if container not found
    
    // State variables
    let isRotating = true;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Improved sky with gradient and sun
    const sky = createSkyGradient();
    scene.add(sky);

    // Camera setup with improved parameters for depth
    const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        2000
    );
    
    // Better camera position for viewing the scene
    const zoomFactor = 0.7;
    const cameraRadius = 320 * zoomFactor;
    const cameraHeight = 180 * zoomFactor;
    
    camera.position.set(cameraRadius, cameraHeight, cameraRadius);
    camera.lookAt(0, 0, 0);

    // Enhanced renderer with better shadows
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = 1.2; // Slightly brighter scene
    container.appendChild(renderer.domElement);

    // Create post-processing composer for visual effects
    const composer = setupPostProcessing(renderer, scene, camera);

    // Create a container for our custom HTML labels
    const labelContainer = document.createElement('div');
    labelContainer.style.position = 'absolute';
    labelContainer.style.top = '0';
    labelContainer.style.left = '0';
    labelContainer.style.width = '100%';
    labelContainer.style.height = '100%';
    labelContainer.style.pointerEvents = 'none';
    labelContainer.style.overflow = 'hidden';
    container.appendChild(labelContainer);

    // Array to store our label data
    const labelData = [];

    // Create custom shaders for water
    const waterUniforms = {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x0077be) },
        sunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.0).normalize() }
    };
    
    // Add enhanced lighting
    setupLighting(scene);

    // Create atmospheric fog for depth
    scene.fog = new THREE.FogExp2(0xc4e0f9, 0.0015);

    // Create base plane (representing sea level) with animated water shader
    const waterMaterial = new THREE.ShaderMaterial({
        uniforms: waterUniforms,
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            varying float vElevation;
            
            // Simplex noise functions from https://github.com/stegu/webgl-noise
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                    -0.577350269189626,  // -1.0 + 2.0 * C.x
                                    0.024390243902439); // 1.0 / 41.0
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                vUv = uv;
                
                // Create more dynamic waves
                float scale1 = 0.03;
                float scale2 = 0.05;
                float noiseTime = time * 0.5;
                
                // Combine multiple noise values for more complex waves
                float noise1 = snoise(vec2(position.x * scale1, position.z * scale1 + noiseTime));
                float noise2 = snoise(vec2(position.x * scale2 - noiseTime, position.z * scale2));
                
                // Final wave height
                vElevation = noise1 * 0.8 + noise2 * 0.4;
                
                // Apply to vertex
                vec3 newPosition = position;
                newPosition.y += vElevation * 4.0;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 waterColor;
            uniform vec3 sunDirection;
            varying vec2 vUv;
            varying float vElevation;
            
            void main() {
                // Create depth effect for water color
                float depth = 0.7 + vElevation * 0.3;
                
                // Calculate specular highlight (fake sun reflection)
                float specular = pow(max(0.0, dot(vec3(0.0, 1.0, 0.0), sunDirection)), 10.0) * 0.3;
                
                // Mix deep and shallow water colors based on elevation
                vec3 deepColor = waterColor * 0.6;
                vec3 shallowColor = waterColor * 1.2;
                vec3 finalColor = mix(deepColor, shallowColor, depth) + specular;
                
                gl_FragColor = vec4(finalColor, 0.85);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });

    const waterGeometry = new THREE.PlaneGeometry(400, 400, 100, 100);
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);

    // Function to create and add a label to a 3D object
    function createLabel(object, text, color) {
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
        labelContainer.appendChild(labelDiv);
        
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

    // Create the vertical layers with improved geometry and materials
    
    // Create a cloud layer
    createClouds(scene);

    // Space Farms Layer with more interesting geometry
    const spaceFarmsGroup = new THREE.Group();
    scene.add(spaceFarmsGroup);
    
    // Main ring
    const torusGeometry = new THREE.TorusGeometry(150, 3, 16, 100);
    const spaceFarmsMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd3d3d3,
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: 0.7,
        emissive: 0x444444,
        emissiveIntensity: 0.2
    });
    const spaceFarmsRing = new THREE.Mesh(torusGeometry, spaceFarmsMaterial);
    spaceFarmsRing.rotation.x = Math.PI / 2;
    spaceFarmsGroup.add(spaceFarmsRing);
    
    // Create space stations along the ring
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 150;
        
        const station = createSpaceStation();
        station.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
        
        // Rotate to face center
        station.lookAt(0, 0, 0);
        station.rotateY(Math.PI); // Flip to face outward
        
        spaceFarmsGroup.add(station);
    }
    
    spaceFarmsGroup.position.y = 120;
    createLabel(spaceFarmsGroup, "Space Farms", 0xd3d3d3);

    // Improved floating city creator function
    const createFloatingCity = (x, z, size, color, name) => {
        const cityGroup = new THREE.Group();
        
        // Base platform with more detail
        const baseGeom = new THREE.CylinderGeometry(size, size * 1.2, size * 0.3, 8);
        
        // Add custom texture for the platform
        const platformTexture = createPlatformTexture(color);
        
        const baseMat = new THREE.MeshStandardMaterial({ 
            map: platformTexture,
            color,
            metalness: 0.5,
            roughness: 0.7,
            bumpMap: platformTexture,
            bumpScale: 0.6
        });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.castShadow = true;
        base.receiveShadow = true;
        cityGroup.add(base);
        
        // Add details to the platform edge
        const rimGeom = new THREE.TorusGeometry(size * 0.9, size * 0.05, 8, 24);
        const rimMat = new THREE.MeshStandardMaterial({ 
            color: adjustColor(color, 0.8),
            metalness: 0.7,
            roughness: 0.3
        });
        const rim = new THREE.Mesh(rimGeom, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = size * 0.1;
        rim.castShadow = true;
        cityGroup.add(rim);
        
        // Add more varied and detailed buildings
        const buildingCount = Math.floor(10 + size / 2);
        
        for (let i = 0; i < buildingCount; i++) {
            // Vary the building shapes
            let building;
            const buildingType = Math.floor(Math.random() * 4);
            const buildingHeight = size * (0.5 + Math.random() * 1.8);
            const buildingWidth = size * (0.1 + Math.random() * 0.15);
            const buildingColor = adjustColor(color, 0.7 + Math.random() * 0.6);
            
            let buildingGeom, buildingMat;
            
            switch (buildingType) {
                case 0: // Box
                    buildingGeom = new THREE.BoxGeometry(
                        buildingWidth, 
                        buildingHeight, 
                        buildingWidth
                    );
                    break;
                    
                case 1: // Cylinder
                    buildingGeom = new THREE.CylinderGeometry(
                        buildingWidth * 0.5,
                        buildingWidth * 0.7,
                        buildingHeight,
                        8
                    );
                    break;
                    
                case 2: // Pyramid
                    buildingGeom = new THREE.ConeGeometry(
                        buildingWidth,
                        buildingHeight,
                        4
                    );
                    break;
                    
                case 3: // Dome
                    buildingGeom = new THREE.SphereGeometry(
                        buildingWidth * 0.8,
                        12,
                        8,
                        0,
                        Math.PI * 2,
                        0,
                        Math.PI / 2
                    );
                    break;
            }
            
            buildingMat = new THREE.MeshStandardMaterial({ 
                color: buildingColor,
                metalness: 0.2 + Math.random() * 0.3,
                roughness: 0.5 + Math.random() * 0.4,
                emissive: buildingColor,
                emissiveIntensity: 0.1 * Math.random()
            });
            
            building = new THREE.Mesh(buildingGeom, buildingMat);
            
            // Position buildings in a more organized layout
            const distFromCenter = Math.random() * size * 0.7;
            const angle = Math.random() * Math.PI * 2;
            const posX = Math.cos(angle) * distFromCenter;
            const posZ = Math.sin(angle) * distFromCenter;
            
            building.position.set(
                posX,
                buildingHeight / 2 + size * 0.15,
                posZ
            );
            
            // Add windows to buildings
            addBuildingDetails(building, buildingType, buildingHeight, buildingWidth);
            
            building.castShadow = true;
            building.receiveShadow = true;
            cityGroup.add(building);
        }
        
        // Add light beams and floating parts
        addCityEffects(cityGroup, size, color);
        
        cityGroup.position.set(x, 60, z);
        scene.add(cityGroup);
        
        if (name) {
            createLabel(cityGroup, name, color);
        }
        
        return cityGroup;
    };

    // Eastern Sky Palace
    const skyPalace = createFloatingCity(100, -60, 18, 0x00ffff, "Sky Palace");
    
    // Central Moon Palace
    const moonPalace = createFloatingCity(0, 0, 22, 0xc39bd3, "Moon Palace");
    
    // Western Belt
    const belt = createFloatingCity(-90, 40, 15, 0xff7f50, "The Belt");

    // Create continents with terrain
    createTerrain(scene, 100, 0, 120, 90, 0xa9a9a9, "Eastern Continent");
    createTerrain(scene, -110, 0, 110, 90, 0x8b0000, "Western Continent");

    // Create Island function with terrain
    const createIsland = (x, z, size, height, color, name) => {
        const islandGroup = new THREE.Group();
        
        // Create base with custom noise-based geometry
        const segments = 64;
        const islandGeometry = new THREE.CylinderGeometry(size, size * 1.2, height, segments);
        
        // Apply noise to vertices for natural terrain
        const positions = islandGeometry.attributes.position;
        const vertex = new THREE.Vector3();
        const center = new THREE.Vector3(0, 0, 0);
        
        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);
            
            if (vertex.y >= 0) { // Only modify top surface
                const distance = vertex.distanceTo(center);
                const noise = simplex.noise2D(vertex.x * 0.1, vertex.z * 0.1) * 0.5 + 0.5;
                
                // More pronounced at edges, less in center
                const edgeFactor = Math.min(1.0, distance / size);
                const heightVariation = noise * height * 0.4 * edgeFactor;
                
                // Apply height variation
                if (vertex.y > 0) {
                    vertex.y += heightVariation;
                }
            }
            
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        islandGeometry.computeVertexNormals();
        
        // Create material with texture
        const islandTexture = createTerrainTexture(color);
        
        const islandMaterial = new THREE.MeshStandardMaterial({
            map: islandTexture,
            color: color,
            roughness: 0.9,
            metalness: 0.1,
            bumpMap: islandTexture,
            bumpScale: 0.5
        });
        
        const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial);
        islandMesh.castShadow = true;
        islandMesh.receiveShadow = true;
        islandGroup.add(islandMesh);
        
        // Add vegetation and details
        addIslandDetails(islandGroup, size, color);
        
        islandGroup.position.set(x, height / 2, z);
        scene.add(islandGroup);
        
        if (name) {
            createLabel(islandGroup, name, color);
        }
        
        return islandGroup;
    };

    // Create simplex noise for terrain generation
    const simplex = new SimplexNoise();

    // Magic Islands
    const magicIsland = createIsland(0, 0, 30, 12, 0x228b22, "Magic Islands");
    
    // Smugglers Islands
    const smugglersIsland = createIsland(0, 80, 25, 10, 0x8b4513, "Smugglers Islands");

    // Underground Layer with crystal cave systems
    createCaveSystem(scene, 20, -30, 60, 45, 0xffd700, "Cave System");
    createCaveSystem(scene, 120, -25, -40, 25, 0x696969, "Eastern Mines");

    // Underwater Layer (Atlantis)
    createAtlantis(scene, 0, -60, 40, 0x40e0d0);

    // Add enhanced vertical connectors between layers
    createEnhancedConnectors(scene);

    // Add ambient particles
    const particleSystems = createParticleSystems(scene);

    // Add grid helper for context
    const gridHelper = new THREE.GridHelper(300, 30, 0x000000, 0x000000);
    gridHelper.position.y = 0.1;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Function to update label positions
    function updateLabels() {
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
                
                // Optional: Adjust opacity based on distance
                const opacity = Math.max(0.3, Math.min(1.0, 500 / dist));
                label.element.style.opacity = opacity.toString();
            } else {
                // Hide the label if it's not visible
                label.element.style.display = 'none';
            }
        });
    }

    // Handle window resize
    const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Setup camera rotation
    let angle = 0;
    const radius = cameraRadius;
    const centerX = 0;
    const centerZ = 0;
    const height = cameraHeight;

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Update water shader time
        waterUniforms.time.value = elapsedTime;
        
        // Update particle systems
        for (const system of particleSystems) {
            if (system.update) system.update(delta, elapsedTime);
        }
        
        // Rotate camera in a circle around the scene if rotation is enabled
        if (isRotating) {
            angle += 0.001; // Slower rotation for more cinematic feel
            camera.position.x = centerX + radius * Math.cos(angle);
            camera.position.z = centerZ + radius * Math.sin(angle);
            camera.position.y = height;
            camera.lookAt(0, 0, 0);
        }
        
        // Update animated objects
        updateAnimatedObjects(elapsedTime);
        
        // Update label positions
        updateLabels();
        
        // Render the scene with post-processing
        composer.render();
    };
    animate();

    // Toggle rotation button
    if (toggleRotationButton) {
        toggleRotationButton.addEventListener('click', function() {
            isRotating = !isRotating;
            this.textContent = isRotating ? 'Pause Rotation' : 'Start Rotation';
        });
    }

    // Return a cleanup function
    return function cleanup() {
        window.removeEventListener('resize', handleResize);
        
        // Remove all label elements
        labelData.forEach(label => {
            if (label.element && label.element.parentNode) {
                label.element.parentNode.removeChild(label.element);
            }
        });
        
        // Dispose of geometries, materials, and textures to free memory
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
}

// Helper function: Create sky gradient
function createSkyGradient() {
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
    
    // Create a vertex shader that makes the sky brighter at the horizon
    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vWorldPosition;
            
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vWorldPosition;
            
            void main() {
                float y = normalize(vWorldPosition).y;
                float topColor = 0.4; // darker at top
                float bottomColor = 0.8; // brighter at horizon
                
                // Gradient from top to bottom
                vec3 skyTop = vec3(0.3, 0.6, 0.8);    // Sky blue
                vec3 skyBottom = vec3(0.7, 0.8, 1.0);  // Light blue at horizon
                
                // Mix colors based on y position (normalized)
                vec3 finalColor = mix(skyBottom, skyTop, max(0.0, y));
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.BackSide
    });
    
    return new THREE.Mesh(skyGeometry, skyMaterial);
}

// Helper function: Create post-processing effects
function setupPostProcessing(renderer, scene, camera) {
    // Create a EffectComposer for post-processing
    const composer = new THREE.EffectComposer(renderer);
    
    // RenderPass renders the scene
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Add bloom (glow) effect for light sources
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5,    // bloom strength
        0.4,    // bloom radius
        0.85     // bloom threshold
    );
    composer.addPass(bloomPass);
    
    // Add subtle depth of field effect
    const bokehPass = new THREE.BokehPass(scene, camera, {
        focus: 500,
        aperture: 0.002,
        maxblur: 0.01
    });
    composer.addPass(bokehPass);
    
    return composer;
}

// Helper function: Setup enhanced lighting
function setupLighting(scene) {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 0.9);
    sunLight.position.set(300, 400, 200);
    sunLight.castShadow = true;
    
    // Improve shadow quality
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 1000;
    sunLight.shadow.camera.left = -300;
    sunLight.shadow.camera.right = 300;
    sunLight.shadow.camera.top = 300;
    sunLight.shadow.camera.bottom = -300;
    sunLight.shadow.bias = -0.0001;
    
    scene.add(sunLight);
    
    // Add secondary fill lights for more dimension
    const fillLight1 = new THREE.DirectionalLight(0xe6f7ff, 0.4); // Blue-tinted
    fillLight1.position.set(-200, 200, -100);
    scene.add(fillLight1);
    
    const fillLight2 = new THREE.DirectionalLight(0xfff1e0, 0.3); // Warm fill
    fillLight2.position.set(100, 100, -200);
    scene.add(fillLight2);
}

// Create a space station
function createSpaceStation() {
    const stationGroup = new THREE.Group();
    
    // Main central hub
    const hubGeometry = new THREE.SphereGeometry(5, 16, 16);
    const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0xd3d3d3,
        metalness: 0.8,
        roughness: 0.3,
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.castShadow = true;
    stationGroup.add(hub);
    
    // Arms/spokes from the center
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        
        const armGeometry = new THREE.CylinderGeometry(0.7, 0.7, 15, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.6,
            roughness: 0.4
        });
        
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(
            Math.cos(angle) * 7.5,
            0,
            Math.sin(angle) * 7.5
        );
        arm.rotation.z = angle;
        arm.castShadow = true;
        stationGroup.add(arm);
        
        // Add solar panels at the end of each arm
        const panelGeometry = new THREE.BoxGeometry(10, 0.2, 4);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x2255ff,
            metalness: 0.2,
            roughness: 0.3,
            emissive: 0x0033aa,
            emissiveIntensity: 0.4
        });
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(
            Math.cos(angle) * 15,
            0,
            Math.sin(angle) * 15
        );
        panel.rotation.z = angle;
        panel.castShadow = true;
        stationGroup.add(panel);
    }
    
    // Add details to hub
    const ringGeometry = new THREE.TorusGeometry(5.5, 0.5, 8, 24);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xbbbbbb,
        metalness: 0.7,
        roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.castShadow = true;
    stationGroup.add(ring);
    
    // Add lights to the station
    const light = new THREE.PointLight(0x55aaff, 1, 30);
    light.position.set(0, 0, 0);
    stationGroup.add(light);
    
    return stationGroup;
}

// Create platform texture
function createPlatformTexture(baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Background color
    ctx.fillStyle = `rgb(${baseColor.r*255}, ${baseColor.g*255}, ${baseColor.b*255})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    const cellSize = 32;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Add some noise/texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
}

// Adjust color (brighten or darken)
function adjustColor(color, factor) {
    if (typeof color === 'number') {
        // Convert hex to THREE.Color
        color = new THREE.Color(color);
    }
    
    return new THREE.Color(
        color.r * factor,
        color.g * factor,
        color.b * factor
    );
}

// Add details to buildings
function addBuildingDetails(building, buildingType, buildingHeight, buildingWidth) {
    if (buildingType === 0 || buildingType === 1) { // Only add windows to box and cylinder buildings
        const windowGroup = new THREE.Group();
        const windowCount = Math.floor(buildingHeight / 3);
        const windowSize = buildingWidth * 0.2;
        
        // Add windows
        for (let i = 0; i < windowCount; i++) {
            for (let j = 0; j < 4; j++) {
                const windowGeom = new THREE.BoxGeometry(windowSize, windowSize, 0.5);
                const windowMat = new THREE.MeshStandardMaterial({
                    emissive: 0xffffaa,
                    emissiveIntensity: 0.5 + Math.random() * 0.5
                });
                
                const windowMesh = new THREE.Mesh(windowGeom, windowMat);
                
                const angle = (j / 4) * Math.PI * 2;
                const windowX = Math.cos(angle) * (buildingWidth / 2 + 0.1);
                const windowZ = Math.sin(angle) * (buildingWidth / 2 + 0.1);
                const windowY = -buildingHeight / 2 + 2 + i * 3;
                
                windowMesh.position.set(windowX, windowY, windowZ);
                windowMesh.lookAt(0, windowY, 0);
                
                // Random chance for light to be off
                if (Math.random() > 0.7) {
                    windowMat.emissiveIntensity = 0.1;
                }
                
                windowGroup.add(windowMesh);
            }
        }
        
        building.add(windowGroup);
    }
}

// Add effects to floating cities
function addCityEffects(cityGroup, size, baseColor) {
    // Add anti-gravity effect (light beam underneath)
    const beamGeometry = new THREE.CylinderGeometry(size * 0.3, size * 0.1, 60, 16, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = -30;
    cityGroup.add(beam);
    
    // Add floating particles around the city
    const particleCount = Math.floor(size * 2);
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = size * (0.8 + Math.random() * 0.4);
        const height = (Math.random() - 0.5) * size * 0.5;
        
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = height;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(baseColor),
        size: 1.5,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    cityGroup.add(particles);
    
    // Add a halo effect
    const haloGeometry = new THREE.RingGeometry(size * 1.1, size * 1.3, 30);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -size * 0.1;
    cityGroup.add(halo);
    
    // Store animation properties
    cityGroup.userData.animation = {
        halo: halo,
        particles: particles,
        beam: beam,
        time: Math.random() * 10 // Random starting phase
    };
}

// Create terrain for continents
function createTerrain(scene, x, y, width, depth, color, name) {
    const terrainGroup = new THREE.Group();
    
    // Create terrain geometry with heightmap
    const segments = 64;
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    
    // Apply noise to vertices for natural terrain
    const positions = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Use simplex noise for more natural terrain
    const simplex = new SimplexNoise();
    
    // Apply multiple octaves of noise for more realistic terrain
    for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i);
        
        // Get normalized position for noise
        const nx = vertex.x / width + 0.5;
        const ny = vertex.z / depth + 0.5;
        
        // Apply multiple layers of noise
        let height = 0;
        height += simplex.noise2D(nx * 3, ny * 3) * 6;
        height += simplex.noise2D(nx * 10, ny * 10) * 2;
        height += simplex.noise2D(nx * 20, ny * 20) * 1;
        
        // Apply height
        vertex.y = Math.max(0, height);
        
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    
    // Create terrain texture
    const terrainTexture = createTerrainTexture(color);
    
    const material = new THREE.MeshStandardMaterial({
        color: color,
        map: terrainTexture,
        roughness: 0.8,
        metalness: 0.2,
        bumpMap: terrainTexture,
        bumpScale: 1
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    
    terrainGroup.add(terrain);
    
    // Add details to terrain
    addTerrainDetails(terrainGroup, terrain, width, depth, color);
    
    terrainGroup.position.set(x, y, 0);
    scene.add(terrainGroup);
    
    createLabel(terrainGroup, name, color);
    
    return terrainGroup;
}

// Create terrain texture
function createTerrainTexture(baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Convert color to string
    let colorString;
    if (typeof baseColor === 'number') {
        const color = new THREE.Color(baseColor);
        colorString = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
    } else {
        colorString = `rgb(${Math.floor(baseColor.r * 255)}, ${Math.floor(baseColor.g * 255)}, ${Math.floor(baseColor.b * 255)})`;
    }
    
    // Base color
    ctx.fillStyle = colorString;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise for texture
    const addNoise = (size, contrast) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let y = 0; y < canvas.height; y += size) {
            for (let x = 0; x < canvas.width; x += size) {
                const value = Math.random() * contrast - contrast / 2;
                
                for (let sy = 0; sy < size && y + sy < canvas.height; sy++) {
                    for (let sx = 0; sx < size && x + sx < canvas.width; sx++) {
                        const pixelIndex = ((y + sy) * canvas.width + (x + sx)) * 4;
                        
                        data[pixelIndex] = Math.max(0, Math.min(255, data[pixelIndex] + value));
                        data[pixelIndex + 1] = Math.max(0, Math.min(255, data[pixelIndex + 1] + value));
                        data[pixelIndex + 2] = Math.max(0, Math.min(255, data[pixelIndex + 2] + value));
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    };
    
    // Add multiple layers of noise
    addNoise(32, 40);
    addNoise(16, 20);
    addNoise(8, 10);
    addNoise(4, 5);
    addNoise(2, 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    return texture;
}

// Add details to terrain
function addTerrainDetails(group, terrain, width, depth, baseColor) {
    // Add trees, rocks, etc. based on terrain height
    const geometry = terrain.geometry;
    const positions = geometry.attributes.position;
    
    // Sample points from terrain
    for (let i = 0; i < 50; i++) {
        // Random position on terrain
        const randomX = (Math.random() - 0.5) * width;
        const randomZ = (Math.random() - 0.5) * depth;
        
        // Find height at this position
        let height = 0;
        let closestPoint = Infinity;
        
        // Sample terrain height (crude approximation but works for our purpose)
        for (let j = 0; j < positions.count; j++) {
            const px = positions.getX(j);
            const py = positions.getY(j);
            const pz = positions.getZ(j);
            
            const distance = Math.sqrt(
                Math.pow(px - randomX, 2) + 
                Math.pow(pz - randomZ, 2)
            );
            
            if (distance < closestPoint) {
                height = py;
                closestPoint = distance;
            }
        }
        
        // Create detail based on height
        if (height > 3) {
            // Create a mountain/rock
            const rockSize = 2 + Math.random() * 5;
            const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 1);
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: adjustColor(baseColor, 0.7),
                roughness: 0.9,
                metalness: 0.1
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(randomX, height, randomZ);
            rock.rotation.set(
                Math.random() * Math.PI, 
                Math.random() * Math.PI, 
                Math.random() * Math.PI
            );
            rock.scale.set(
                0.8 + Math.random() * 0.4,
                0.7 + Math.random() * 0.6,
                0.8 + Math.random() * 0.4
            );
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            
            group.add(rock);
        } else if (height > 0.5) {
            // Create a tree or vegetation
            const treeHeight = 2 + Math.random() * 4;
            
            // Tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, treeHeight, 5);
            const trunkMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513, // Brown
                roughness: 0.9,
                metalness: 0.0
            });
            
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(randomX, height + treeHeight / 2, randomZ);
            trunk.castShadow = true;
            
            // Tree foliage
            const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 6);
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: 0x2e8b57, // Dark green
                roughness: 0.8,
                metalness: 0.0
            });
            
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = treeHeight / 2 + 1;
            foliage.castShadow = true;
            
            trunk.add(foliage);
            group.add(trunk);
        }
    }
}

// Add details to islands
function addIslandDetails(group, size, baseColor) {
    // Add trees, plants, and structures based on island type
    
    // Determine environment type based on color
    const isForest = (baseColor === 0x228b22); // Magic Islands (forest green)
    const isDesert = (baseColor === 0x8b4513); // Smugglers Islands (brown)
    
    // Number of details to add
    const detailCount = Math.floor(size * 2);
    
    for (let i = 0; i < detailCount; i++) {
        // Random position on island (circular distribution)
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * size * 0.7; // Keep details within 70% of radius
        
        const posX = Math.cos(angle) * radius;
        const posZ = Math.sin(angle) * radius;
        
        if (isForest) {
            // Add trees and magic elements
            if (Math.random() > 0.7) {
                // Magic crystal
                const crystalSize = 1 + Math.random() * 2;
                const crystalGeometry = new THREE.OctahedronGeometry(crystalSize, 0);
                const crystalMaterial = new THREE.MeshStandardMaterial({
                    color: 0x88ffff,
                    emissive: 0x66ccff,
                    emissiveIntensity: 0.5,
                    metalness: 0.9,
                    roughness: 0.2,
                    transparent: true,
                    opacity: 0.7
                });
                
                const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
                crystal.position.set(posX, crystalSize, posZ);
                crystal.rotation.set(
                    Math.random() * Math.PI, 
                    Math.random() * Math.PI, 
                    Math.random() * Math.PI
                );
                
                // Add a point light inside the crystal
                const light = new THREE.PointLight(0x66ccff, 1, 10);
                light.position.set(0, 0, 0);
                crystal.add(light);
                
                group.add(crystal);
            } else {
                // Tree
                const treeHeight = 2 + Math.random() * 5;
                
                // Tree trunk
                const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, treeHeight, 5);
                const trunkMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    roughness: 0.9,
                    metalness: 0.0
                });
                
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.set(posX, treeHeight / 2, posZ);
                trunk.castShadow = true;
                
                // Tree foliage (glowing for magic forest)
                const foliageGeometry = new THREE.SphereGeometry(1.5 + Math.random(), 8, 6);
                const foliageMaterial = new THREE.MeshStandardMaterial({
                    color: 0x88ff88,
                    emissive: 0x66cc66,
                    emissiveIntensity: 0.2,
                    roughness: 0.8,
                    metalness: 0.0
                });
                
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = treeHeight / 2 + 1;
                foliage.castShadow = true;
                
                trunk.add(foliage);
                group.add(trunk);
            }
        } else if (isDesert) {
            // Add smuggler outposts and desert vegetation
            if (Math.random() > 0.8) {
                // Small outpost/building
                const buildingSize = 2 + Math.random() * 3;
                const buildingHeight = 2 + Math.random() * 2;
                
                const buildingGeometry = new THREE.BoxGeometry(buildingSize, buildingHeight, buildingSize);
                const buildingMaterial = new THREE.MeshStandardMaterial({
                    color: 0xd2b48c, // Tan
                    roughness: 0.9,
                    metalness: 0.1
                });
                
                const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
                building.position.set(posX, buildingHeight / 2, posZ);
                building.castShadow = true;
                building.receiveShadow = true;
                
                // Add a door
                const doorGeometry = new THREE.PlaneGeometry(1, 1.5);
                const doorMaterial = new THREE.MeshBasicMaterial({
                    color: 0x4b3621, // Dark brown
                    side: THREE.DoubleSide
                });
                
                const door = new THREE.Mesh(doorGeometry, doorMaterial);
                door.position.set(0, -buildingHeight / 2 + 0.75, buildingSize / 2 + 0.01);
                building.add(door);
                
                // Add a window
                const windowGeometry = new THREE.PlaneGeometry(0.8, 0.8);
                const windowMaterial = new THREE.MeshBasicMaterial({
                    color: 0x87cefa, // Light blue
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                
                const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
                window1.position.set(-buildingSize / 4, 0, buildingSize / 2 + 0.01);
                building.add(window1);
                
                group.add(building);
            } else {
                // Cactus or rock
                if (Math.random() > 0.5) {
                    // Cactus
                    const cactusHeight = 1.5 + Math.random() * 3;
                    const cactusGeometry = new THREE.CylinderGeometry(0.3, 0.5, cactusHeight, 8);
                    const cactusMaterial = new THREE.MeshStandardMaterial({
                        color: 0x2e8b57, // Dark green
                        roughness: 0.8,
                        metalness: 0.0
                    });
                    
                    const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
                    cactus.position.set(posX, cactusHeight / 2, posZ);
                    cactus.castShadow = true;
                    
                    // Add arms to some cacti
                    if (Math.random() > 0.5) {
                        const armHeight = 1 + Math.random() * 1.5;
                        const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, armHeight, 8);
                        const arm = new THREE.Mesh(armGeometry, cactusMaterial);
                        
                        arm.rotation.z = Math.PI / 4; // 45-degree angle
                        arm.position.set(0, cactusHeight / 4, 0);
                        
                        // Position arm at edge of main cactus body
                        arm.position.x = 0.5;
                        
                        cactus.add(arm);
                    }
                    
                    group.add(cactus);
                } else {
                    // Desert rock
                    const rockSize = 1 + Math.random() * 2;
                    const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 1);
                    const rockMaterial = new THREE.MeshStandardMaterial({
                        color: 0xb8860b, // Dark goldenrod
                        roughness: 0.9,
                        metalness: 0.1
                    });
                    
                    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                    rock.position.set(posX, rockSize / 2, posZ);
                    rock.rotation.set(
                        Math.random() * Math.PI, 
                        Math.random() * Math.PI, 
                        Math.random() * Math.PI
                    );
                    rock.scale.set(
                        0.8 + Math.random() * 0.4,
                        0.6 + Math.random() * 0.4,
                        0.8 + Math.random() * 0.4
                    );
                    
                    rock.castShadow = true;
                    rock.receiveShadow = true;
                    
                    group.add(rock);
                }
            }
        }
    }
}

// Create cave system with crystals and details
function createCaveSystem(scene, x, y, z, size, color, name) {
    const caveGroup = new THREE.Group();
    
    // Main cave structure (wireframe sphere)
    const caveGeometry = new THREE.SphereGeometry(size, 12, 10);
    
    // Create a material that's wireframe but with thicker lines
    const caveMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(color) },
            opacity: { value: 0.5 }
        },
        vertexShader: `
            varying vec3 vPosition;
            
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float opacity;
            varying vec3 vPosition;
            
            void main() {
                vec3 pos = normalize(vPosition);
                
                // Create a grid pattern
                float lineWidth = 0.03;
                
                // Longitude lines
                float longitude = mod(atan(pos.z, pos.x) + 3.14159, 6.28318) / 6.28318;
                float longLine = step(1.0 - lineWidth, mod(longitude * 12.0, 1.0));
                
                // Latitude lines
                float latitude = acos(pos.y) / 3.14159;
                float latLine = step(1.0 - lineWidth, mod(latitude * 12.0, 1.0));
                
                float line = max(longLine, latLine);
                
                // Discard fragments that aren't on the lines
                if (line < 0.5) discard;
                
                // Add glow effect
                float glow = 0.5 + 0.5 * sin(latitude * 20.0 + longitude * 30.0);
                
                gl_FragColor = vec4(color * (0.7 + 0.3 * glow), opacity);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const caveMesh = new THREE.Mesh(caveGeometry, caveMaterial);
    caveGroup.add(caveMesh);
    
    // Add crystal formations inside
    const crystalCount = Math.floor(size / 2);
    
    for (let i = 0; i < crystalCount; i++) {
        // Random position inside the cave
        const radius = size * (0.4 + Math.random() * 0.5);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        const crystalX = radius * Math.sin(phi) * Math.cos(theta);
        const crystalY = radius * Math.sin(phi) * Math.sin(theta);
        const crystalZ = radius * Math.cos(phi);
        
        // Create a crystal group (multiple crystal formations)
        const crystalGroup = new THREE.Group();
        
        const crystalFormationCount = 3 + Math.floor(Math.random() * 4);
        
        for (let j = 0; j < crystalFormationCount; j++) {
            const crystalSize = 1 + Math.random() * 2;
            
            // Use different geometry for visual variety
            let crystalGeometry;
            const crystalType = Math.floor(Math.random() * 3);
            
            switch (crystalType) {
                case 0:
                    crystalGeometry = new THREE.OctahedronGeometry(crystalSize, 0);
                    break;
                case 1:
                    crystalGeometry = new THREE.ConeGeometry(crystalSize, crystalSize * 2, 4, 1);
                    break;
                case 2:
                    crystalGeometry = new THREE.TetrahedronGeometry(crystalSize, 0);
                    break;
            }
            
            // Create material with glow effect
            const intensity = 0.5 + Math.random() * 0.5;
            const crystalMaterial = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: intensity,
                metalness: 0.9,
                roughness: 0.2,
                transparent: true,
                opacity: 0.8
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            // Random position around the formation center
            crystal.position.set(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
            
            // Random rotation
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            crystalGroup.add(crystal);
        }
        
        // Add a light source for glow effect
        const light = new THREE.PointLight(color, 1, 15);
        light.position.set(0, 0, 0);
        crystalGroup.add(light);
        
        crystalGroup.position.set(crystalX, crystalY, crystalZ);
        caveGroup.add(crystalGroup);
    }
    
    caveGroup.position.set(x, y, z);
    scene.add(caveGroup);
    
    createLabel(caveGroup, name, color);
    
    return caveGroup;
}

// Create Atlantis with underwater city
function createAtlantis(scene, x, y, z, color) {
    const atlantisGroup = new THREE.Group();
    
    // Main Atlantis dome structure
    const domeGeometry = new THREE.SphereGeometry(30, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.rotation.x = Math.PI;
    atlantisGroup.add(dome);
    
    // Add decorative rings around the dome
    for (let i = 0; i < 3; i++) {
        const ringRadius = 30 * (0.7 - i * 0.15);
        const ringGeometry = new THREE.TorusGeometry(ringRadius, 0.5, 16, 48);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -5 - i * 3;
        atlantisGroup.add(ring);
    }
    
    // Create city buildings inside the dome
    const buildingCount = 30;
    const cityRadius = 25;
    
    for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2;
        let radius, height;
        
        // Create a tiered city layout
        if (i % 3 === 0) {
            // Outer ring - smaller buildings
            radius = cityRadius * (0.7 + Math.random() * 0.2);
            height = 4 + Math.random() * 3;
        } else if (i % 3 === 1) {
            // Middle ring - medium buildings
            radius = cityRadius * (0.4 + Math.random() * 0.2);
            height = 6 + Math.random() * 4;
        } else {
            // Inner ring - taller buildings
            radius = cityRadius * (0.1 + Math.random() * 0.2);
            height = 8 + Math.random() * 6;
        }
        
        // Calculate position
        const posX = Math.cos(angle) * radius;
        const posZ = Math.sin(angle) * radius;
        
        // Randomize building types
        let building;
        const buildingType = Math.floor(Math.random() * 4);
        
        switch (buildingType) {
            case 0: // Cylinder
                building = new THREE.Mesh(
                    new THREE.CylinderGeometry(1 + Math.random(), 1.5 + Math.random(), height, 6),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        metalness: 0.8,
                        roughness: 0.2,
                        emissive: color,
                        emissiveIntensity: 0.2
                    })
                );
                break;
                
            case 1: // Cone
                building = new THREE.Mesh(
                    new THREE.ConeGeometry(1.5 + Math.random(), height, 6),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        metalness: 0.7,
                        roughness: 0.3,
                        emissive: color,
                        emissiveIntensity: 0.3
                    })
                );
                break;
                
            case 2: // Pyramid
                building = new THREE.Mesh(
                    new THREE.ConeGeometry(2 + Math.random(), height, 4),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        metalness: 0.6,
                        roughness: 0.4,
                        emissive: color,
                        emissiveIntensity: 0.2
                    })
                );
                break;
                
            case 3: // Complex building (combination of shapes)
                building = new THREE.Group();
                
                // Base
                const base = new THREE.Mesh(
                    new THREE.CylinderGeometry(2 + Math.random(), 2.5 + Math.random(), height * 0.6, 6),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        metalness: 0.6,
                        roughness: 0.4,
                        emissive: color,
                        emissiveIntensity: 0.2
                    })
                );
                base.position.y = 0;
                building.add(base);
                
                // Top part
                const top = new THREE.Mesh(
                    new THREE.ConeGeometry(1.5 + Math.random(), height * 0.5, 6),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        metalness: 0.8,
                        roughness: 0.2,
                        emissive: color,
                        emissiveIntensity: 0.4
                    })
                );
                top.position.y = height * 0.3;
                building.add(top);
                break;
        }
        
        building.position.set(posX, -height / 2, posZ);
        building.castShadow = true;
        building.receiveShadow = true;
        
        atlantisGroup.add(building);
    }
    
    // Add central tower/temple
    const centralTowerHeight = 20;
    const centralTower = new THREE.Group();
    
    // Base
    const towerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 8, 5, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.7,
            roughness: 0.3,
            emissive: color,
            emissiveIntensity: 0.3
        })
    );
    towerBase.position.y = -centralTowerHeight / 2 + 2.5;
    centralTower.add(towerBase);
    
    // Middle section
    const towerMiddle = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 6, 10, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.4
        })
    );
    towerMiddle.position.y = -centralTowerHeight / 2 + 10;
    centralTower.add(towerMiddle);
    
    // Top section
    const towerTop = new THREE.Mesh(
        new THREE.ConeGeometry(4, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            emissive: color,
            emissiveIntensity: 0.6
        })
    );
    towerTop.position.y = -centralTowerHeight / 2 + 19;
    centralTower.add(towerTop);
    
    // Add glowing crystal at the top
    const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(2, 0),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: color,
            emissiveIntensity: 1.0,
            metalness: 1.0,
            roughness: 0.0
        })
    );
    crystal.position.y = -centralTowerHeight / 2 + 24;
    centralTower.add(crystal);
    
    // Add point light for the crystal
    const crystalLight = new THREE.PointLight(color, 1.5, 50);
    crystalLight.position.copy(crystal.position);
    centralTower.add(crystalLight);
    
    atlantisGroup.add(centralTower);
    
    // Add ambient bubble particles around the dome
    const particleCount = 100;
    const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7
    });
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Random position around the dome
        const radius = 30 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI / 2; // Only above the dome
        
        particle.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            -radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
        
        // Store animation data
        particle.userData = {
            speed: 0.1 + Math.random() * 0.3,
            offset: Math.random() * Math.PI * 2
        };
        
        atlantisGroup.add(particle);
    }
    
    // Add light beams from dome
    const beamCount = 5;
    for (let i = 0; i < beamCount; i++) {
        const angle = (i / beamCount) * Math.PI * 2;
        const radius = 15;
        
        const beamGeometry = new THREE.CylinderGeometry(1, 3, 100, 16, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(
            Math.cos(angle) * radius,
            -50,
            Math.sin(angle) * radius
        );
        beam.rotation.x = Math.PI / 2;
        
        atlantisGroup.add(beam);
    }
    
    atlantisGroup.position.set(x, y, z);
    scene.add(atlantisGroup);
    
    createLabel(atlantisGroup, "Atlantis", color);
    
    return atlantisGroup;
}

// Create enhanced connectors between layers
function createEnhancedConnectors(scene) {
    // Define connection points
    const connections = [
        // Space to Sky
        { start: [100, 120, -60], end: [100, 60, -60], color: 0x00ffff },
        { start: [0, 120, 0], end: [0, 60, 0], color: 0xc39bd3 },
        
        // Sky to Surface
        { start: [100, 60, -60], end: [100, 8, -60], color: 0x00ffff },
        { start: [0, 60, 0], end: [0, 12, 0], color: 0xc39bd3 },
        { start: [-90, 60, 40], end: [-90, 15, 40], color: 0xff7f50 },
        
        // Surface to Underground
        { start: [120, 8, -40], end: [120, -25, -40], color: 0x696969 },
        { start: [0, 12, 80], end: [20, -30, 60], color: 0xffd700 },
        
        // Underground to Underwater
        { start: [20, -30, 60], end: [0, -60, 40], color: 0x40e0d0 }
    ];
    
    connections.forEach((conn) => {
        createEnergyBeam(
            scene,
            new THREE.Vector3(...conn.start),
            new THREE.Vector3(...conn.end),
            conn.color
        );
    });
}

// Create energy beam connector with animated particles
function createEnergyBeam(scene, startPoint, endPoint, color) {
    const beamGroup = new THREE.Group();
    
    // Create main beam
    const beamLength = startPoint.distanceTo(endPoint);
    const beamDirection = endPoint.clone().sub(startPoint).normalize();
    
    // Create a curved path for the beam
    const curvePoints = [];
    curvePoints.push(startPoint.clone());
    
    // Add control points for curve
    const midPoint = startPoint.clone().add(endPoint).multiplyScalar(0.5);
    const perpendicular = new THREE.Vector3(-beamDirection.z, 0, beamDirection.x).normalize().multiplyScalar(beamLength * 0.2);
    midPoint.add(perpendicular);
    
    curvePoints.push(midPoint);
    curvePoints.push(endPoint.clone());
    
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    
    // Create tube geometry along the curve
    const tubeGeometry = new THREE.TubeGeometry(curve, 20, 1, 8, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    beamGroup.add(tube);
    
    // Create particle system along the beam
    const particleCount = Math.floor(beamLength / 2);
    const particleGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7
    });
    
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Position particle along the curve
        const t = i / particleCount;
        particle.position.copy(curve.getPoint(t));
        
        // Set animation parameters
        particle.userData = {
            speed: 0.005 + Math.random() * 0.01,
            t: t,
            curve: curve
        };
        
        particles.push(particle);
        beamGroup.add(particle);
    }
    
    // Add the animation update function
    beamGroup.userData.update = (delta, time) => {
        // Update particle positions
        particles.forEach(particle => {
            particle.userData.t += particle.userData.speed;
            
            if (particle.userData.t > 1) {
                particle.userData.t = 0;
            }
            
            particle.position.copy(curve.getPoint(particle.userData.t));
            
            // Pulse the particle size
            const scale = 0.8 + 0.4 * Math.sin(time * 5 + particle.userData.t * 10);
            particle.scale.set(scale, scale, scale);
        });
        
        // Pulse the beam opacity
        tubeMaterial.opacity = 0.2 + 0.1 * Math.sin(time * 3);
    };
    
    scene.add(beamGroup);
    return beamGroup;
}

// Create clouds for atmosphere
function createClouds(scene) {
    const cloudsGroup = new THREE.Group();
    
    // Create a cloud texture
    const cloudTexture = createCloudTexture();
    
    const cloudCount = 20;
    for (let i = 0; i < cloudCount; i++) {
        // Random position
        const radius = 100 + Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 80 + Math.random() * 60;
        
        // Create cloud plane
        const cloudSize = 20 + Math.random() * 30;
        const cloudGeometry = new THREE.PlaneGeometry(cloudSize, cloudSize / 2);
        const cloudMaterial = new THREE.MeshLambertMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.3,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(x, y, z);
        cloud.lookAt(0, y, 0); // Make cloud face the center
        
        // Store animation data
        cloud.userData = {
            rotationSpeed: 0.05 + Math.random() * 0.05,
            initialAngle: angle,
            radius: radius,
            bobSpeed: 0.5 + Math.random() * 0.5,
            bobHeight: 1 + Math.random() * 2,
            initialY: y
        };
        
        cloudsGroup.add(cloud);
    }
    
    // Add animation update function
    cloudsGroup.userData.update = (delta, time) => {
        cloudsGroup.children.forEach(cloud => {
            // Rotate around center
            const newAngle = cloud.userData.initialAngle + time * cloud.userData.rotationSpeed;
            cloud.position.x = Math.cos(newAngle) * cloud.userData.radius;
            cloud.position.z = Math.sin(newAngle) * cloud.userData.radius;
            
            // Bob up and down
            cloud.position.y = cloud.userData.initialY + 
                Math.sin(time * cloud.userData.bobSpeed) * cloud.userData.bobHeight;
                
            // Keep facing center
            cloud.lookAt(0, cloud.position.y, 0);
        });
    };
    
    scene.add(cloudsGroup);
    return cloudsGroup;
}

// Create a cloud texture
function createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Fill with transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create a radial gradient for the cloud
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise for texture
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 3;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.03})`;
        ctx.fill();
    }
    
    // Create a texture
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Create particle systems
function createParticleSystems(scene) {
    const systems = [];
    
    // Dust particles in the air
    const dustSystem = createDustParticles();
    scene.add(dustSystem);
    systems.push(dustSystem);
    
    // Water bubbles near Atlantis
    const bubbleSystem = createBubbleParticles();
    bubbleSystem.position.set(0, -60, 40);
    scene.add(bubbleSystem);
    systems.push(bubbleSystem);
    
    return systems;
}

// Create dust particles
function createDustParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        // Random position in a large cylinder around the scene
        const radius = 150 + Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        const height = -20 + Math.random() * 150;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        
        sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom shader for particles
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            attribute float size;
            uniform float time;
            
            void main() {
                vec3 pos = position;
                
                // Slow drift movement
                pos.x += sin(time * 0.1 + pos.y * 0.05) * 2.0;
                pos.z += cos(time * 0.1 + pos.x * 0.05) * 2.0;
                pos.y += sin(time * 0.2 + pos.x * 0.05 + pos.z * 0.05) * 0.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            
            void main() {
                // Create a soft circle
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                
                if (alpha < 0.1) discard;
                
                gl_FragColor = vec4(color, alpha * 0.3);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    
    // Add update function
    particles.userData.update = (delta, time) => {
        material.uniforms.time.value = time;
    };
    
    return particles;
}

// Create bubble particles for underwater
function createBubbleParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        // Random position in a hemisphere above Atlantis
        const radius = Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 40;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        
        sizes[i] = 0.5 + Math.random() * 1.0;
        speeds[i] = 0.5 + Math.random() * 1.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    
    // Custom shader for bubbles
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0x88ccff) }
        },
        vertexShader: `
            attribute float size;
            attribute float speed;
            uniform float time;
            
            void main() {
                vec3 pos = position;
                
                // Bubble rising movement
                float t = fract(time * 0.05 * speed + pos.x * 0.01 + pos.z * 0.01);
                pos.y = 40.0 * t; // Rise up to 40 units
                
                // Wobble motion
                pos.x += sin(time * speed + pos.y * 0.2) * (1.0 - t) * 3.0;
                pos.z += cos(time * speed + pos.y * 0.2) * (1.0 - t) * 3.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            
            void main() {
                // Create a bubble effect
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                
                float rim = smoothstep(0.4, 0.5, dist) * smoothstep(0.5, 0.4, dist);
                float bubble = 1.0 - smoothstep(0.45, 0.5, dist);
                
                vec3 finalColor = mix(color * 1.5, color, bubble);
                float alpha = bubble * 0.3 + rim * 0.7;
                
                if (alpha < 0.05) discard;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    
    // Add update function
    particles.userData.update = (delta, time) => {
        material.uniforms.time.value = time;
    };
    
    return particles;
}

// Update animated objects
function updateAnimatedObjects(time) {
    // Find objects with animation data and update them
    scene.traverse((object) => {
        if (object.userData && object.userData.animation) {
            const animation = object.userData.animation;
            
            // Animate city effects
            if (animation.halo) {
                animation.time += 0.01;
                animation.halo.rotation.z = animation.time * 0.2;
                animation.halo.material.opacity = 0.1 + 0.1 * Math.sin(animation.time);
                
                // Animate particles
                if (animation.particles) {
                    animation.particles.rotation.y = animation.time * 0.1;
                }
                
                // Animate beam
                if (animation.beam) {
                    animation.beam.material.opacity = 0.1 + 0.1 * Math.sin(animation.time * 2);
                }
            }
        }
    });
}

// Class to generate simplex noise
class SimplexNoise {
    constructor() {
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        
        // To remove the need for index wrapping, double the permutation table length
        this.perm = [];
        for(let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
        
        // A lookup table to traverse the simplex around a given point in 4D.
        this.simplex = [
            [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],
            [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],
            [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
            [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],
            [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],
            [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
            [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],
            [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]
        ];
    }
    
    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }
    
    noise2D(xin, yin) {
        // Noise contributions from the three corners
        let n0, n1, n2;
        
        // Skew the input space to determine which simplex cell we're in
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const s = (xin + yin) * F2; // Hairy factor for 2D
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        const t = (i + j) * G2;
        const X0 = i - t; // Unskew the cell origin back to (x,y) space
        const Y0 = j - t;
        const x0 = xin - X0; // The x,y distances from the cell origin
        const y0 = yin - Y0;
        
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if(x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1 = 1;
            j1 = 0;
        } else { // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1 = 0;
            j1 = 1;
        }
        
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        const y2 = y0 - 1.0 + 2.0 * G2;
        
        // Work out the hashed gradient indices of the three simplex corners
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        
        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if(t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
        }
        
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if(t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }
        
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if(t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }
        
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    }
}

// Initialize the visualization when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load Three.js and dependencies dynamically
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };
    
    // Load scripts in sequence
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
        .then(() => loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.min.js'))
        .then(() => loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.min.js'))
        .then(() => loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.min.js'))
        .then(() => loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/BokehPass.min.js'))
        .then(() => {
            console.log('All Three.js resources loaded successfully');
            initWorldVisualization();
        })
        .catch(error => {
            console.error('Error loading Three.js resources:', error);
            // Fallback to basic visualization if loading fails
            initFallbackVisualization();
        });
});

// Fallback visualization with basic features if advanced loading fails
function initFallbackVisualization() {
    console.log('Using fallback visualization mode');
    
    // This is a simplified version without post-processing and advanced effects
    const container = document.getElementById('visualization-mount');
    if (!container) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    
    const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        2000
    );
    
    const zoomFactor = 0.7;
    const cameraRadius = 320 * zoomFactor;
    const cameraHeight = 180 * zoomFactor;
    
    camera.position.set(cameraRadius, cameraHeight, cameraRadius);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Add basic lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);
    
    // Add basic water plane
    const waterGeometry = new THREE.PlaneGeometry(400, 400);
    const waterMaterial = new THREE.MeshLambertMaterial({
        color: 0x4682B4,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    
    // Add simple floating cities
    const skyPalace = createSimpleCity(100, 60, -60, 0x00ffff, "Sky Palace");
    const moonPalace = createSimpleCity(0, 60, 0, 0xc39bd3, "Moon Palace");
    const belt = createSimpleCity(-90, 60, 40, 0xff7f50, "The Belt");
    
    scene.add(skyPalace);
    scene.add(moonPalace);
    scene.add(belt);
    
    // Add continents
    const eastContinent = createSimpleTerrain(100, 4, 0, 120, 90, 0xa9a9a9, "Eastern Continent");
    const westContinent = createSimpleTerrain(-110, 7.5, 0, 110, 90, 0x8b0000, "Western Continent");
    
    scene.add(eastContinent);
    scene.add(westContinent);
    
    // Add simple islands
    const magicIsland = createSimpleIsland(0, 0, 30, 12, 0x228b22, "Magic Islands");
    const smugglersIsland = createSimpleIsland(0, 80, 25, 10, 0x8b4513, "Smugglers Islands");
    
    scene.add(magicIsland);
    scene.add(smugglersIsland);
    
    // Animation loop
    let angle = 0;
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate camera
        angle += 0.002;
        camera.position.x = Math.cos(angle) * cameraRadius;
        camera.position.z = Math.sin(angle) * cameraRadius;
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Basic city creator
    function createSimpleCity(x, y, z, color, name) {
        const group = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(10, 12, 2, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ color });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);
        
        // Buildings
        for (let i = 0; i < 5; i++) {
            const buildingHeight = 3 + Math.random() * 6;
            const buildingGeometry = new THREE.BoxGeometry(2, buildingHeight, 2);
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color(color).multiplyScalar(0.7) 
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            const angle = (i / 5) * Math.PI * 2;
            const radius = 5;
            
            building.position.set(
                Math.cos(angle) * radius,
                buildingHeight / 2 + 1,
                Math.sin(angle) * radius
            );
            
            group.add(building);
        }
        
        // Add a label
        const div = document.createElement('div');
        div.className = 'label3d';
        div.textContent = name;
        div.style.color = `#${color.toString(16).padStart(6, '0')}`;
        container.appendChild(div);
        
        // Update label position in animation loop
        group.userData = {
            label: div,
            name: name
        };
        
        group.position.set(x, y, z);
        return group;
    }
    
    // Simple terrain creator
    function createSimpleTerrain(x, y, z, width, depth, color, name) {
        const group = new THREE.Group();
        
        const geometry = new THREE.BoxGeometry(width, 8, depth);
        const material = new THREE.MeshLambertMaterial({ color });
        const terrain = new THREE.Mesh(geometry, material);
        
        group.add(terrain);
        group.position.set(x, y, z);
        
        return group;
    }
    
    // Simple island creator
    function createSimpleIsland(x, z, size, height, color, name) {
        const group = new THREE.Group();
        
        const geometry = new THREE.CylinderGeometry(size, size * 1.2, height, 16);
        const material = new THREE.MeshLambertMaterial({ color });
        const island = new THREE.Mesh(geometry, material);
        
        group.add(island);
        group.position.set(x, height / 2, z);
        
        return group;
    }
}