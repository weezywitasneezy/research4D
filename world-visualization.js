// World Visualization
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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    // Add a secondary light for better depth
    const secondaryLight = new THREE.DirectionalLight(0xffffee, 0.4);
    secondaryLight.position.set(-80, 120, -80);
    scene.add(secondaryLight);

    // Create base plane (representing sea level) - improved with texture
    const waterGeometry = new THREE.PlaneGeometry(400, 400, 50, 50);
    const waterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4682b4, // Steel blue for water
        metalness: 0.1,
        roughness: 0.7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
    });
    
    // Add slight waves to water surface
    const waterVertices = waterGeometry.attributes.position.array;
    for (let i = 0; i < waterVertices.length; i += 3) {
        const x = waterVertices[i];
        const z = waterVertices[i + 2];
        
        // Create gentle wave pattern
        waterVertices[i + 1] = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.5;
    }
    waterGeometry.attributes.position.needsUpdate = true;
    waterGeometry.computeVertexNormals();
    
    const basePlane = new THREE.Mesh(waterGeometry, waterMaterial);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.receiveShadow = true;
    scene.add(basePlane);

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

    // Function to create low-poly terrain
    function createLowPolyTerrain(width, depth, widthSegments, depthSegments, heightScale, baseColor, peakColor) {
        // Create geometry with segments for the low-poly look
        const geometry = new THREE.PlaneGeometry(width, depth, widthSegments, depthSegments);
        
        // Generate height map
        const positions = geometry.attributes.position.array;
        
        // SimplexNoise for natural-looking terrain
        const simplex = new SimplexNoise();
        
        // Create vertex colors for gradient effect
        const colors = [];
        
        // Convert hex colors to RGB components
        const baseColorRGB = {
            r: (baseColor >> 16 & 255) / 255,
            g: (baseColor >> 8 & 255) / 255,
            b: (baseColor & 255) / 255
        };
        
        const peakColorRGB = {
            r: (peakColor >> 16 & 255) / 255,
            g: (peakColor >> 8 & 255) / 255,
            b: (peakColor & 255) / 255
        };
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            
            // Multi-layered noise for more interesting terrain
            let elevation = 0;
            // Large features
            elevation += simplex.noise2D(x * 0.01, z * 0.01) * 0.6;
            // Medium features
            elevation += simplex.noise2D(x * 0.04, z * 0.04) * 0.3;
            // Small features
            elevation += simplex.noise2D(x * 0.1, z * 0.1) * 0.1;
            
            // Apply height to Y coordinate
            positions[i + 1] = elevation * heightScale;
            
            // Calculate color based on height
            const normalizedHeight = (elevation + 1) / 2; // Convert from [-1,1] to [0,1]
            
            // Interpolate between base and peak colors
            const r = baseColorRGB.r + (peakColorRGB.r - baseColorRGB.r) * normalizedHeight;
            const g = baseColorRGB.g + (peakColorRGB.g - baseColorRGB.g) * normalizedHeight;
            const b = baseColorRGB.b + (peakColorRGB.b - baseColorRGB.b) * normalizedHeight;
            
            colors.push(r, g, b);
        }
        
        // Assign colors to geometry
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Update geometry normals
        geometry.computeVertexNormals();
        
        // Create material with vertex colors
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: true, // This gives the low-poly look
            metalness: 0.1,
            roughness: 0.8
        });
        
        // Create mesh and enable shadows
        const terrain = new THREE.Mesh(geometry, material);
        terrain.castShadow = true;
        terrain.receiveShadow = true;
        
        return terrain;
    }

    // Create the vertical layers
    
    // 1. Space Farms Layer (highest)
    const spaceFarmsGeometry = new THREE.TorusGeometry(150, 3, 16, 50);
    const spaceFarmsMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd3d3d3, // Light gray
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: 0.7
    });
    const spaceFarms = new THREE.Mesh(spaceFarmsGeometry, spaceFarmsMaterial);
    spaceFarms.position.y = 120;
    spaceFarms.rotation.x = Math.PI / 2;
    spaceFarms.castShadow = true;
    scene.add(spaceFarms);
    createLabel(spaceFarms, "Space Farms", 0xd3d3d3);

    // 2. Floating Cities Layer
    const createFloatingCity = (x, z, size, color, name) => {
        const cityGroup = new THREE.Group();
        
        // Base platform - more interesting shape
        const baseShape = new THREE.Shape();
        const sides = 6;
        const innerRadius = size * 0.8;
        const outerRadius = size * 1.2;
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const nextAngle = ((i + 1) / sides) * Math.PI * 2;
            
            const x1 = Math.cos(angle) * innerRadius;
            const y1 = Math.sin(angle) * innerRadius;
            
            const x2 = Math.cos(angle) * outerRadius;
            const y2 = Math.sin(angle) * outerRadius;
            
            const x3 = Math.cos(nextAngle) * outerRadius;
            const y3 = Math.sin(nextAngle) * outerRadius;
            
            const x4 = Math.cos(nextAngle) * innerRadius;
            const y4 = Math.sin(nextAngle) * innerRadius;
            
            if (i === 0) {
                baseShape.moveTo(x1, y1);
            } else {
                baseShape.lineTo(x1, y1);
            }
            
            baseShape.lineTo(x2, y2);
            baseShape.lineTo(x3, y3);
            baseShape.lineTo(x4, y4);
        }
        
        const baseExtrudeSettings = {
            depth: size * 0.3,
            bevelEnabled: true,
            bevelThickness: size * 0.1,
            bevelSize: size * 0.05,
            bevelSegments: 3
        };
        
        const baseGeom = new THREE.ExtrudeGeometry(baseShape, baseExtrudeSettings);
        const baseMat = new THREE.MeshStandardMaterial({ 
            color, 
            metalness: 0.3,
            roughness: 0.7
        });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.rotation.x = -Math.PI / 2;
        base.position.y = -size * 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        cityGroup.add(base);
        
        // Buildings
        for (let i = 0; i < 8; i++) {
            const buildingHeight = size * (0.5 + Math.random() * 1.5);
            const buildingWidth = size * (0.1 + Math.random() * 0.2);
            const buildingDepth = size * (0.1 + Math.random() * 0.2);
            
            // Use different shapes for buildings
            let buildingGeom;
            const buildingType = Math.floor(Math.random() * 4);
            
            if (buildingType === 0) {
                // Tower
                buildingGeom = new THREE.CylinderGeometry(
                    buildingWidth * 0.5, 
                    buildingWidth * 0.7, 
                    buildingHeight, 
                    5 + Math.floor(Math.random() * 3)
                );
            } else if (buildingType === 1) {
                // Pyramid
                buildingGeom = new THREE.ConeGeometry(
                    buildingWidth, 
                    buildingHeight, 
                    4
                );
            } else {
                // Box building
                buildingGeom = new THREE.BoxGeometry(
                    buildingWidth, 
                    buildingHeight, 
                    buildingDepth
                );
            }
            
            // Slightly different color for each building
            const colorVariation = 0.2;
            const variationFactor = 1 - colorVariation / 2 + Math.random() * colorVariation;
            
            const buildingMat = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color(color).multiplyScalar(variationFactor),
                metalness: 0.2 + Math.random() * 0.3,
                roughness: 0.6 + Math.random() * 0.3
            });
            
            const building = new THREE.Mesh(buildingGeom, buildingMat);
            
            // Position within the base platform
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size * 0.6;
            
            building.position.set(
                Math.cos(angle) * distance,
                buildingHeight / 2,
                Math.sin(angle) * distance
            );
            
            // Random rotation for non-circular buildings
            if (buildingType !== 0) {
                building.rotation.y = Math.random() * Math.PI * 2;
            }
            
            building.castShadow = true;
            building.receiveShadow = true;
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

    // 3. Surface Layer (continents) - Using low poly terrain instead of boxes
    
    // Load SimplexNoise from CDN
    function loadSimplexNoise() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.4.0/simplex-noise.min.js';
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    }
    
    // Wait for SimplexNoise to load before creating terrains
    loadSimplexNoise().then(() => {
        // Eastern Continent - Tech themed with blue-gray colors
        const eastContinent = createLowPolyTerrain(
            120, 90,          // width, depth
            25, 20,           // width segments, depth segments
            12,               // height scale
            0x607d8b,         // base color (blue gray)
            0xa5c6d9          // peak color (lighter blue)
        );
        eastContinent.rotation.x = -Math.PI / 2;
        eastContinent.position.set(100, 0, 0);
        scene.add(eastContinent);
        createLabel(eastContinent, "Eastern Continent", 0x607d8b);
        
        // Create Magic Islands - Lush green
        const magicIsland = createLowPolyTerrain(
            60, 60,           // width, depth
            15, 15,           // width segments, depth segments
            15,               // height scale
            0x2e7d32,         // base color (deep green)
            0x81c784          // peak color (lighter green)
        );
        magicIsland.rotation.x = -Math.PI / 2;
        magicIsland.position.set(0, 0, 0);
        scene.add(magicIsland);
        createLabel(magicIsland, "Magic Islands", 0x2e7d32);
        
        // Smugglers Islands - Sandy brown colors
        const smugglersIsland = createLowPolyTerrain(
            50, 50,           // width, depth
            12, 12,           // width segments, depth segments
            10,               // height scale
            0x8b4513,         // base color (saddle brown)
            0xd2b48c          // peak color (tan)
        );
        smugglersIsland.rotation.x = -Math.PI / 2;
        smugglersIsland.position.set(0, 0, 80);
        scene.add(smugglersIsland);
        createLabel(smugglersIsland, "Smugglers Islands", 0x8b4513);
        
        // Western Continent - Demon world with red/dark colors
        const westContinent = createLowPolyTerrain(
            110, 90,          // width, depth
            25, 20,           // width segments, depth segments
            20,               // height scale - more dramatic heights
            0x8b0000,         // base color (dark red)
            0xff5252          // peak color (brighter red)
        );
        westContinent.rotation.x = -Math.PI / 2;
        westContinent.position.set(-110, 0, 0);
        scene.add(westContinent);
        createLabel(westContinent, "Western Continent", 0x8b0000);
    });

    // 4. Underground Layer
    // Create a wireframe to represent the underground caves - improved
    const caveGeometry = new THREE.SphereGeometry(45, 12, 12);
    const caveMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffd700, // Gold for mines/caves
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const caveSystem = new THREE.Mesh(caveGeometry, caveMaterial);
    caveSystem.position.set(20, -30, 60);
    scene.add(caveSystem);
    createLabel(caveSystem, "Cave System", 0xffd700);

    // Eastern mines - improved with crystalline shapes
    const createCrystallineMines = () => {
        const mineGroup = new THREE.Group();
        mineGroup.position.set(120, -25, -40);
        
        // Add base wireframe sphere
        const baseSphereGeom = new THREE.SphereGeometry(25, 10, 10);
        const baseSphereMat = new THREE.MeshBasicMaterial({ 
            color: 0x696969, 
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const baseSphere = new THREE.Mesh(baseSphereGeom, baseSphereMat);
        mineGroup.add(baseSphere);
        
        // Add crystal formations inside
        const crystalColors = [0x7986cb, 0x64b5f6, 0x4fc3f7, 0x4dd0e1];
        
        for (let i = 0; i < 15; i++) {
            const crystalSize = 2 + Math.random() * 8;
            
            // Create a crystal geometry - several options
            let crystalGeom;
            const crystalType = Math.floor(Math.random() * 3);
            
            if (crystalType === 0) {
                // Octahedron crystal
                crystalGeom = new THREE.OctahedronGeometry(crystalSize, 0);
            } else if (crystalType === 1) {
                // Tetrahedron crystal
                crystalGeom = new THREE.TetrahedronGeometry(crystalSize, 0);
            } else {
                // Custom crystal (elongated shape)
                const points = [];
                points.push(new THREE.Vector3(0, -crystalSize, 0));
                points.push(new THREE.Vector3(crystalSize * 0.3, 0, crystalSize * 0.3));
                points.push(new THREE.Vector3(crystalSize * 0.2, crystalSize * 0.6, crystalSize * 0.2));
                points.push(new THREE.Vector3(0, crystalSize, 0));
                
                crystalGeom = new THREE.LatheGeometry(points, 5);
            }
            
            // Crystal material with slight transparency and glow
            const crystalMat = new THREE.MeshStandardMaterial({
                color: crystalColors[Math.floor(Math.random() * crystalColors.length)],
                metalness: 0.9,
                roughness: 0.2,
                transparent: true,
                opacity: 0.8
            });
            
            const crystal = new THREE.Mesh(crystalGeom, crystalMat);
            
            // Place crystal within sphere volume
            const radius = 20 * Math.random();
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            crystal.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            
            // Random rotation
            crystal.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            crystal.castShadow = true;
            mineGroup.add(crystal);
        }
        
        scene.add(mineGroup);
        createLabel(mineGroup, "Eastern Mines", 0x696969);
        
        return mineGroup;
    };
    
    const mineSystem = createCrystallineMines();

    // 5. Underwater Layer (Atlantis) - improved with more architectural detail
    const createAtlantis = () => {
        const atlantisGroup = new THREE.Group();
        atlantisGroup.position.set(0, -60, 40);
        
        // Main dome structure
        const domeGeometry = new THREE.DodecahedronGeometry(30, 1);
        const domeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x40e0d0, // Turquoise
            metalness: 0.4,
            roughness: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.castShadow = true;
        atlantisGroup.add(dome);
        
        // Add pillars around the dome
        const pillarCount = 8;
        
        for (let i = 0; i < pillarCount; i++) {
            const angle = (i / pillarCount) * Math.PI * 2;
            const radius = 38;
            
            const pillarGeometry = new THREE.CylinderGeometry(2, 2, 40, 6);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0x4dd0e1,
                metalness: 0.3,
                roughness: 0.7
            });
            
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            pillar.castShadow = true;
            atlantisGroup.add(pillar);
        }
        
        // Add smaller domes (buildings)
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + Math.PI / 5;
            const radius = 20;
            
            const smallDomeGeometry = new THREE.IcosahedronGeometry(5, 0);
            const smallDomeMaterial = new THREE.MeshStandardMaterial({
                color: 0x80deea,
                metalness: 0.6,
                roughness: 0.4,
                transparent: true,
                opacity: 0.85
            });
            
            const smallDome = new THREE.Mesh(smallDomeGeometry, smallDomeMaterial);
            smallDome.position.set(
                Math.cos(angle) * radius,
                -10,
                Math.sin(angle) * radius
            );
            
            smallDome.castShadow = true;
            atlantisGroup.add(smallDome);
        }
        
        scene.add(atlantisGroup);
        createLabel(atlantisGroup, "Atlantis", 0x40e0d0);
        
        return atlantisGroup;
    };
    
    const atlantis = createAtlantis();

    // Add vertical connectors between layers - improved with energy effect
    const createVerticalConnector = (startX, startY, startZ, endX, endY, endZ, color) => {
        const connectorGroup = new THREE.Group();
        
        // Create a curve for the path
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(startX, startY, startZ),
            new THREE.Vector3(
                startX + (endX - startX) * 0.25 + (Math.random() * 10 - 5),
                startY + (endY - startY) * 0.25,
                startZ + (endZ - startZ) * 0.25 + (Math.random() * 10 - 5)
            ),
            new THREE.Vector3(
                startX + (endX - startX) * 0.75 + (Math.random() * 10 - 5),
                startY + (endY - startY) * 0.75,
                startZ + (endZ - startZ) * 0.75 + (Math.random() * 10 - 5)
            ),
            new THREE.Vector3(endX, endY, endZ)
        ]);
        
        // Create tube geometry along the curve
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.8, 8, false);
        const tubeMaterial = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        connectorGroup.add(tube);
        
        // Add particle effect along the path
        const particlesCount = 20;
        const particleGeometry = new THREE.SphereGeometry(1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color).multiplyScalar(1.5),
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < particlesCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position along the curve
            const t = i / particlesCount;
            const position = curve.getPoint(t);
            particle.position.copy(position);
            
            // Randomize size slightly
            const scale = 0.3 + Math.random() * 0.4;
            particle.scale.set(scale, scale, scale);
            
            // Store original position for animation
            particle.userData = {
                t: t,
                curve: curve,
                speed: 0.001 + Math.random() * 0.002,
                direction: Math.random() > 0.5 ? 1 : -1
            };
            
            connectorGroup.add(particle);
        }
        
        scene.add(connectorGroup);
        return connectorGroup;
    };

    // Add connectors with updated positions and colors
    const connectors = [
        // Space to Sky
        createVerticalConnector(100, 120, -60, 100, 60, -60, 0x00ffff), // East - Cyan
        createVerticalConnector(0, 120, 0, 0, 60, 0, 0xc39bd3), // Central - Purple
        
        // Sky to Surface
        createVerticalConnector(100, 60, -60, 100, 8, -60, 0x64b5f6), // East - Light Blue
        createVerticalConnector(0, 60, 0, 0, 12, 0, 0xba68c8), // Central - Purple
        createVerticalConnector(-90, 60, 40, -90, 15, 40, 0xff9e80), // West - Orange
        
        // Surface to Underground
        createVerticalConnector(120, 8, -40, 120, -25, -40, 0x4db6ac), // Eastern mines - Teal
        createVerticalConnector(0, 12, 80, 20, -30, 60, 0xffd54f), // Cave system - Amber
        
        // Underground to Underwater
        createVerticalConnector(20, -30, 60, 0, -60, 40, 0x4fc3f7) // To Atlantis - Light Blue
    ];

    // Add grid helper for context
    const gridHelper = new THREE.GridHelper(300, 30, 0x000000, 0x000000);
    gridHelper.position.y = 0.1;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Add fog for atmosphere
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.0015);

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
    const radius = cameraRadius; // ZOOMED: Using the adjusted camera radius
    const centerX = 0;
    const centerZ = 0;
    const height = cameraHeight; // ZOOMED: Using the adjusted camera height

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate camera in a circle around the scene if rotation is enabled
        if (isRotating) {
            angle += 0.002;
            camera.position.x = centerX + radius * Math.cos(angle);
            camera.position.z = centerZ + radius * Math.sin(angle);
            camera.position.y = height;
            camera.lookAt(0, 0, 0);
        }
        
        // Animate water with gentle waves
        if (basePlane.geometry.attributes && basePlane.geometry.attributes.position) {
            const positions = basePlane.geometry.attributes.position.array;
            const time = Date.now() * 0.0003;
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                positions[i + 1] = Math.sin(x * 0.05 + time) * Math.cos(z * 0.05 + time) * 1.5;
            }
            
            basePlane.geometry.attributes.position.needsUpdate = true;
            basePlane.geometry.computeVertexNormals();
        }
        
        // Animate connector particles
        connectors.forEach(connector => {
            connector.children.forEach(child => {
                if (child.userData && child.userData.curve) {
                    // Update particle position along the curve
                    child.userData.t += child.userData.speed * child.userData.direction;
                    
                    // Loop the particle when it reaches the end
                    if (child.userData.t >= 1) {
                        child.userData.t = 0;
                    } else if (child.userData.t <= 0) {
                        child.userData.t = 1;
                    }
                    
                    // Set position along the curve
                    const newPos = child.userData.curve.getPoint(child.userData.t);
                    child.position.copy(newPos);
                    
                    // Pulse the size
                    const pulseScale = 0.3 + 0.2 * Math.sin(Date.now() * 0.01 * child.userData.speed);
                    child.scale.set(pulseScale, pulseScale, pulseScale);
                }
            });
        });
        
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