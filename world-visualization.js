// World Visualization with Low Poly Design
function initWorldVisualization() {
    // DOM elements
    const container = document.getElementById('visualization-mount');
    const toggleRotationButton = document.getElementById('toggle-rotation');
    
    if (!container) return; // Exit if container not found
    
    // State variables
    let isRotating = true;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background

    // Camera setup - adjusted for smaller viewport with zoom
    const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        2000
    );
    
    // ZOOM ADJUSTMENT: Reduce camera distance by ~30%
    const zoomFactor = 0.7; // 30% closer (1.0 - 0.3 = 0.7)
    const cameraRadius = 320 * zoomFactor; // Original: ~450
    const cameraHeight = 180 * zoomFactor; // Original: ~250
    
    camera.position.set(cameraRadius, cameraHeight, cameraRadius);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

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

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Add sun light for better highlights
    const sunLight = new THREE.DirectionalLight(0xffffaa, 0.6);
    sunLight.position.set(-30, 50, 30);
    scene.add(sunLight);

    // Create water using a transparent plane with slight blue tint
    const createWater = (width, depth) => {
        const waterGeometry = new THREE.PlaneGeometry(width, depth, 32, 32);
        
        // Water shader material
        const waterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    
                    // Create copy of position
                    vec3 pos = position;
                    
                    // Wave parameters
                    float amplitude = 0.6;
                    float frequency = 0.05;
                    float speed = 0.5;
                    
                    // Primary wave
                    float waveX = sin(pos.x * frequency + time * speed) * 
                                  cos(pos.z * frequency * 0.8 + time * speed * 0.8) * 
                                  amplitude;
                                  
                    // Secondary waves for more complexity
                    float waveX2 = sin(pos.x * frequency * 2.0 + time * speed * 1.2) * 
                                   cos(pos.z * frequency * 1.5 + time * speed * 0.9) * 
                                   amplitude * 0.3;
                                   
                    float waveZ = sin(pos.z * frequency * 1.2 + time * speed * 1.1) * 
                                  amplitude * 0.5;
                    
                    // Combined wave effect
                    pos.y += waveX + waveX2 + waveZ;
                    
                    // Final position with waves
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    // Water color gradient
                    vec3 shallowColor = vec3(0.0, 0.5, 0.8);
                    vec3 deepColor = vec3(0.0, 0.2, 0.5);
                    
                    // Create wave pattern for color variation
                    float wave1 = sin(vUv.x * 20.0 + time * 0.5) * 0.5 + 0.5;
                    float wave2 = sin(vUv.y * 15.0 - time * 0.3) * 0.5 + 0.5;
                    float waveCombined = (wave1 + wave2) * 0.5;
                    
                    // Mix water colors
                    vec3 waterColor = mix(deepColor, shallowColor, waveCombined * 0.3 + 0.7);
                    
                    // Add highlight for wave peaks (simplified specular)
                    float highlight = pow(waveCombined, 8.0) * 0.5;
                    waterColor += highlight;
                    
                    // Final color with slight transparency
                    gl_FragColor = vec4(waterColor, 0.85);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0;
        
        return water;
    };

    // Initialize simplex noise (we'll simulate it since SimplexNoise isn't directly available)
    const createNoiseGenerator = () => {
        return {
            noise2D: (x, z) => {
                // Simple pseudo-noise function - not as good as SimplexNoise but workable for our purpose
                return Math.sin(x * 0.1) * Math.cos(z * 0.1) +
                       Math.sin(x * 0.3 + 0.5) * Math.cos(z * 0.2 + 1.3) * 0.5 +
                       Math.sin(x * 0.9 + 1.1) * Math.cos(z * 0.7 + 0.7) * 0.25;
            }
        };
    };
    
    const simplex = createNoiseGenerator();

    // Create a low poly island or continent with noise and height-based coloring
    const createLowPolyLandmass = (width, depth, centerX, centerZ, baseHeight, noiseStrength, islandRadius, falloffStart, colorScheme) => {
        // Default color scheme
        const colors = colorScheme || {
            water: 0x4682b4,
            sand: new THREE.Color(0.95, 0.9, 0.7),
            grass: new THREE.Color(0.2, 0.6, 0.2),
            mountain: new THREE.Color(0.5, 0.5, 0.5)
        };
        
        // Create base geometry
        const segments = 50; // Higher for more detail
        const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
        geometry.rotateX(-Math.PI / 2);
        
        // Apply height with noise
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Distance from landmass center
            const localX = x + centerX;
            const localZ = z + centerZ;
            const distanceFromCenter = Math.sqrt(localX * localX + localZ * localZ);
            
            let height = 0;
            if (distanceFromCenter < islandRadius) {
                // Apply noise for terrain variation
                const noiseScale = 0.03;
                const noiseValue = (simplex.noise2D(localX * noiseScale, localZ * noiseScale) + 1) * 0.5;
                
                // Higher terrain in the middle
                const centralHeight = Math.max(0, 1 - distanceFromCenter / islandRadius) * baseHeight;
                
                // Combine noise and central height
                height = noiseValue * noiseStrength + centralHeight;
                
                // Sharp falloff at the edges for coastline effect
                if (distanceFromCenter > falloffStart) {
                    const falloffFactor = 1 - (distanceFromCenter - falloffStart) / (islandRadius - falloffStart);
                    height *= falloffFactor;
                }
            } else {
                // Below sea level
                height = -0.5;
            }
            
            vertices[i + 1] = height;
        }
        
        // Update normals for proper lighting
        geometry.computeVertexNormals();
        
        // Add vertex colors based on height
        const count = geometry.attributes.position.count;
        const colorArray = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const height = vertices[i * 3 + 1];
            
            let color;
            // Sand color for shoreline
            if (height < 0.2 && height >= 0) {
                color = colors.sand;
            } 
            // Grass color for lower terrain
            else if (height < 3) {
                // Vary green based on height
                const r = 0.2 + (height / 10);
                const g = 0.6 + (height / 15);
                const b = 0.2;
                color = new THREE.Color(r, g, b);
            } 
            // Mountain/rock color for higher terrain
            else {
                color = colors.mountain;
            }
            
            // Blue for water
            if (height < 0) {
                color = new THREE.Color(0.0, 0.3, 0.7);
            }
            
            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        
        // Create mesh with vertex colors
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: true
        });
        
        const landmass = new THREE.Mesh(geometry, material);
        landmass.position.set(centerX, 0, centerZ);
        landmass.castShadow = true;
        landmass.receiveShadow = true;
        
        return landmass;
    };

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

    // Create water surface
    const waterSurface = createWater(600, 600);
    scene.add(waterSurface);

    // Create low poly landscapes
    
    // Eastern Continent - tech world with gray mountains
    const eastContinent = createLowPolyLandmass(
        160, 120,             // width, depth
        100, 0,               // centerX, centerZ
        12,                   // baseHeight
        4,                    // noiseStrength
        70,                   // islandRadius
        50,                   // falloffStart
        {
            sand: new THREE.Color(0.9, 0.9, 0.85),
            grass: new THREE.Color(0.7, 0.8, 0.7),
            mountain: new THREE.Color(0.6, 0.6, 0.65)
        }
    );
    scene.add(eastContinent);
    createLabel(eastContinent, "Eastern Continent", 0xa9a9a9);

    // Western Continent - demon world with reddish mountains
    const westContinent = createLowPolyLandmass(
        140, 120,             // width, depth
        -110, 0,              // centerX, centerZ
        15,                   // baseHeight
        3.5,                  // noiseStrength
        65,                   // islandRadius
        45,                   // falloffStart
        {
            sand: new THREE.Color(0.9, 0.8, 0.7),
            grass: new THREE.Color(0.7, 0.5, 0.4),
            mountain: new THREE.Color(0.6, 0.3, 0.3)
        }
    );
    scene.add(westContinent);
    createLabel(westContinent, "Western Continent", 0x8b0000);

    // Magic Islands - greener with lush vegetation
    const magicIsland = createLowPolyLandmass(
        80, 80,               // width, depth
        0, 0,                 // centerX, centerZ
        12,                   // baseHeight
        3,                    // noiseStrength
        30,                   // islandRadius
        25,                   // falloffStart
        {
            sand: new THREE.Color(0.85, 0.9, 0.7),
            grass: new THREE.Color(0.2, 0.75, 0.3),
            mountain: new THREE.Color(0.4, 0.55, 0.4)
        }
    );
    scene.add(magicIsland);
    createLabel(magicIsland, "Magic Islands", 0x228b22);

    // Smugglers Islands - darker, more rugged
    const smugglersIsland = createLowPolyLandmass(
        70, 70,               // width, depth
        0, 80,                // centerX, centerZ
        10,                   // baseHeight
        4,                    // noiseStrength
        25,                   // islandRadius
        20,                   // falloffStart
        {
            sand: new THREE.Color(0.8, 0.75, 0.6),
            grass: new THREE.Color(0.5, 0.45, 0.3),
            mountain: new THREE.Color(0.45, 0.35, 0.25)
        }
    );
    scene.add(smugglersIsland);
    createLabel(smugglersIsland, "Smugglers Islands", 0x8b4513);

    // 1. Space Farms Layer (highest)
    const spaceFarmsGeometry = new THREE.TorusGeometry(150, 3, 16, 50);
    const spaceFarmsMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xd3d3d3, // Light gray
        transparent: true,
        opacity: 0.7
    });
    const spaceFarms = new THREE.Mesh(spaceFarmsGeometry, spaceFarmsMaterial);
    spaceFarms.position.y = 120;
    spaceFarms.rotation.x = Math.PI / 2;
    scene.add(spaceFarms);
    createLabel(spaceFarms, "Space Farms", 0xd3d3d3);

    // 2. Floating Cities Layer
    const createFloatingCity = (x, z, size, color, name) => {
        const cityGroup = new THREE.Group();
        
        // Base platform
        const baseGeom = new THREE.CylinderGeometry(size, size * 1.2, size * 0.3, 6);
        const baseMat = new THREE.MeshLambertMaterial({ color });
        const base = new THREE.Mesh(baseGeom, baseMat);
        cityGroup.add(base);
        
        // Buildings
        for (let i = 0; i < 5; i++) {
            const buildingHeight = size * (0.5 + Math.random() * 1.5);
            const buildingSize = size * 0.2;
            const buildingGeom = new THREE.BoxGeometry(buildingSize, buildingHeight, buildingSize);
            const buildingMat = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color(color).multiplyScalar(0.8)
            });
            const building = new THREE.Mesh(buildingGeom, buildingMat);
            building.position.set(
                (Math.random() - 0.5) * size * 0.8,
                buildingHeight / 2 + size * 0.15,
                (Math.random() - 0.5) * size * 0.8
            );
            cityGroup.add(building);
        }
        
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

    // 4. Underground Layer
    // Create a wireframe to represent the underground caves
    const caveGeometry = new THREE.SphereGeometry(45, 8, 8);
    const caveMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffd700, // Gold for mines/caves
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const caveSystem = new THREE.Mesh(caveGeometry, caveMaterial);
    caveSystem.position.set(20, -30, 60);
    scene.add(caveSystem);
    createLabel(caveSystem, "Cave System", 0xffd700);

    // Eastern mines
    const mineGeometry = new THREE.SphereGeometry(25, 8, 8);
    const mineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x696969, // Dim gray for industrial mines
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const mineSystem = new THREE.Mesh(mineGeometry, mineMaterial);
    mineSystem.position.set(120, -25, -40);
    scene.add(mineSystem);
    createLabel(mineSystem, "Eastern Mines", 0x696969);

    // 5. Underwater Layer (Atlantis)
    const atlantisGeometry = new THREE.DodecahedronGeometry(30, 1);
    const atlantisMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x40e0d0, // Turquoise
        transparent: true,
        opacity: 0.7
    });
    const atlantis = new THREE.Mesh(atlantisGeometry, atlantisMaterial);
    atlantis.position.set(0, -60, 40);
    scene.add(atlantis);
    createLabel(atlantis, "Atlantis", 0x40e0d0);

    // Add vertical connectors between layers
    const createVerticalConnector = (startX, startY, startZ, endX, endY, endZ, color) => {
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
        return new THREE.Line(geometry, material);
    };

    // Add connectors with updated positions
    const connectors = [
        // Space to Sky
        createVerticalConnector(100, 120, -60, 100, 60, -60, 0x00ffff), // East
        createVerticalConnector(0, 120, 0, 0, 60, 0, 0xc39bd3), // Central
        
        // Sky to Surface
        createVerticalConnector(100, 60, -60, 100, 8, -60, 0x00ffff), // East
        createVerticalConnector(0, 60, 0, 0, 12, 0, 0xc39bd3), // Central
        createVerticalConnector(-90, 60, 40, -90, 15, 40, 0xff7f50), // West
        
        // Surface to Underground
        createVerticalConnector(120, 8, -40, 120, -25, -40, 0x696969), // Eastern mines
        createVerticalConnector(0, 12, 80, 20, -30, 60, 0xffd700), // Cave system
        
        // Underground to Underwater
        createVerticalConnector(20, -30, 60, 0, -60, 40, 0x40e0d0) // To Atlantis
    ];
    
    connectors.forEach(connector => scene.add(connector));

    // Add grid helper for context
    const gridHelper = new THREE.GridHelper(300, 30, 0x000000, 0x000000);
    gridHelper.position.y = 0.1;
    gridHelper.material.opacity = 0.2;
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
    };
    window.addEventListener('resize', handleResize);

    // Setup camera rotation
    let angle = 0;
    let time = 0;
    const radius = cameraRadius; // ZOOMED: Using the adjusted camera radius
    const centerX = 0;
    const centerZ = 0;
    const height = cameraHeight; // ZOOMED: Using the adjusted camera height

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Update time for water animation
        time += 0.01;
        
        // Update water shader time uniform if it exists
        if (waterSurface.material.uniforms && waterSurface.material.uniforms.time) {
            waterSurface.material.uniforms.time.value = time;
        }
        
        // Rotate camera in a circle around the scene if rotation is enabled
        if (isRotating) {
            angle += 0.002;
            camera.position.x = centerX + radius * Math.cos(angle);
            camera.position.z = centerZ + radius * Math.sin(angle);
            camera.position.y = height + Math.sin(time * 0.2) * 2; // Add subtle bobbing effect
            camera.lookAt(0, 0, 0);
        }
        
        // Update label positions
        updateLabels();
        
        // Render the scene
        renderer.render(scene, camera);
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

// Initialize the visualization when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load Three.js dynamically
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = function() {
        initWorldVisualization();
    };
    document.head.appendChild(threeScript);
});