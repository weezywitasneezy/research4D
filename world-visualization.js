// World Visualization
function initWorldVisualization() {
    // DOM elements
    const container = document.getElementById('visualization-mount');
    const toggleRotationButton = document.getElementById('toggle-rotation');
    
    if (!container) {
        console.error('Visualization container not found');
        return;
    }
    
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
    
    // Camera positioning
    const zoomFactor = 0.7; // 30% closer
    const cameraRadius = 320 * zoomFactor;
    const cameraHeight = 180 * zoomFactor;
    
    camera.position.set(cameraRadius, cameraHeight, cameraRadius);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear any existing canvas
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
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
    scene.add(directionalLight);

    // Create improved water surface
    const waterGeometry = new THREE.PlaneGeometry(300, 300, 32, 32);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        shininess: 100,
        transparent: true,
        opacity: 0.8
    });
    const basePlane = new THREE.Mesh(waterGeometry, waterMaterial);
    basePlane.rotation.x = -Math.PI / 2;
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

    // Create the vertical layers with improved appearances
    
    // 1. Space Farms Layer (highest)
    const spaceFarmsGeometry = new THREE.TorusGeometry(150, 3, 16, 50);
    const spaceFarmsMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xd3d3d3, // Light gray
        shininess: 50,
        transparent: true,
        opacity: 0.7
    });
    const spaceFarms = new THREE.Mesh(spaceFarmsGeometry, spaceFarmsMaterial);
    spaceFarms.position.y = 120;
    spaceFarms.rotation.x = Math.PI / 2;
    scene.add(spaceFarms);
    createLabel(spaceFarms, "Space Farms", 0xd3d3d3);

    // 2. Floating Cities Layer with improved details
    const createFloatingCity = (x, z, size, color, name) => {
        const cityGroup = new THREE.Group();
        
        // Base platform
        const baseGeom = new THREE.CylinderGeometry(size, size * 1.2, size * 0.3, 8);
        const baseMat = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 60
        });
        const base = new THREE.Mesh(baseGeom, baseMat);
        cityGroup.add(base);
        
        // Add buildings with more variety
        const buildingCount = Math.floor(10 + size / 3);
        
        for (let i = 0; i < buildingCount; i++) {
            // Vary the building types
            let buildingGeom;
            const buildingType = Math.floor(Math.random() * 3);
            const buildingHeight = size * (0.5 + Math.random() * 1.5);
            const buildingWidth = size * 0.2;
            
            switch (buildingType) {
                case 0: // Box
                    buildingGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingWidth);
                    break;
                case 1: // Cylinder
                    buildingGeom = new THREE.CylinderGeometry(buildingWidth/2, buildingWidth/2, buildingHeight, 8);
                    break;
                case 2: // Pyramid
                    buildingGeom = new THREE.ConeGeometry(buildingWidth, buildingHeight, 4);
                    break;
            }
            
            // Building material with slight color variation
            const buildingColor = new THREE.Color(color);
            buildingColor.r *= (0.7 + Math.random() * 0.3);
            buildingColor.g *= (0.7 + Math.random() * 0.3);
            buildingColor.b *= (0.7 + Math.random() * 0.3);
            
            const buildingMat = new THREE.MeshPhongMaterial({
                color: buildingColor,
                shininess: 30
            });
            
            const building = new THREE.Mesh(buildingGeom, buildingMat);
            
            // Position with some randomization
            const radius = Math.random() * size * 0.7;
            const angle = Math.random() * Math.PI * 2;
            building.position.set(
                Math.cos(angle) * radius,
                buildingHeight / 2 + size * 0.15,
                Math.sin(angle) * radius
            );
            
            cityGroup.add(building);
        }
        
        // Add energy beam underneath
        const beamGeometry = new THREE.CylinderGeometry(size * 0.2, size * 0.05, 50, 16, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.y = -25;
        cityGroup.add(beam);
        
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

    // 3. Surface Layer (continents) with improved geometry
    // Eastern Continent
    const eastContinentGeometry = new THREE.BoxGeometry(120, 8, 90);
    const eastContinentMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xa9a9a9, // Dark gray for tech world
        shininess: 20
    });
    const eastContinent = new THREE.Mesh(eastContinentGeometry, eastContinentMaterial);
    eastContinent.position.set(100, 4, 0);
    scene.add(eastContinent);
    createLabel(eastContinent, "Eastern Continent", 0xa9a9a9);

    // Create improved islands
    const createIsland = (x, z, size, height, color, name) => {
        const islandGroup = new THREE.Group();
        
        // Main island geometry
        const islandGeometry = new THREE.CylinderGeometry(size, size * 1.2, height, 16);
        const islandMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 30
        });
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        islandGroup.add(island);
        
        // Add some vegetation or features based on island type
        if (color === 0x228b22) { // Magic Islands (green)
            // Add trees or crystals
            for (let i = 0; i < 12; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * size * 0.7;
                
                if (Math.random() > 0.7) {
                    // Crystal
                    const crystalGeom = new THREE.ConeGeometry(1 + Math.random() * 2, 4 + Math.random() * 3, 5);
                    const crystalMat = new THREE.MeshPhongMaterial({
                        color: 0x88ffff,
                        shininess: 90,
                        transparent: true,
                        opacity: 0.7
                    });
                    
                    const crystal = new THREE.Mesh(crystalGeom, crystalMat);
                    crystal.position.set(
                        Math.cos(angle) * radius,
                        height/2 + 2,
                        Math.sin(angle) * radius
                    );
                    crystal.rotation.y = Math.random() * Math.PI;
                    
                    islandGroup.add(crystal);
                } else {
                    // Tree
                    const trunkGeom = new THREE.CylinderGeometry(0.5, 0.8, 4, 6);
                    const trunkMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
                    
                    const foliageGeom = new THREE.SphereGeometry(2, 8, 6);
                    const foliageMat = new THREE.MeshPhongMaterial({ color: 0x228B22 });
                    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
                    foliage.position.y = 3;
                    
                    trunk.add(foliage);
                    trunk.position.set(
                        Math.cos(angle) * radius,
                        height/2 + 2,
                        Math.sin(angle) * radius
                    );
                    
                    islandGroup.add(trunk);
                }
            }
        } else if (color === 0x8b4513) { // Smugglers Islands (brown)
            // Add desert features 
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * size * 0.7;
                
                if (Math.random() > 0.7) {
                    // Small building
                    const buildingGeom = new THREE.BoxGeometry(3, 3, 3);
                    const buildingMat = new THREE.MeshPhongMaterial({ color: 0xd2b48c });
                    const building = new THREE.Mesh(buildingGeom, buildingMat);
                    
                    building.position.set(
                        Math.cos(angle) * radius,
                        height/2 + 1.5,
                        Math.sin(angle) * radius
                    );
                    
                    islandGroup.add(building);
                } else {
                    // Cactus or rock
                    if (Math.random() > 0.5) {
                        const cactusGeom = new THREE.CylinderGeometry(0.7, 1, 3 + Math.random() * 2, 8);
                        const cactusMat = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });
                        const cactus = new THREE.Mesh(cactusGeom, cactusMat);
                        
                        cactus.position.set(
                            Math.cos(angle) * radius,
                            height/2 + 1.5,
                            Math.sin(angle) * radius
                        );
                        
                        islandGroup.add(cactus);
                    } else {
                        const rockGeom = new THREE.DodecahedronGeometry(1 + Math.random());
                        const rockMat = new THREE.MeshPhongMaterial({ color: 0xA0522D });
                        const rock = new THREE.Mesh(rockGeom, rockMat);
                        
                        rock.position.set(
                            Math.cos(angle) * radius,
                            height/2 + 1,
                            Math.sin(angle) * radius
                        );
                        rock.rotation.set(
                            Math.random() * Math.PI,
                            Math.random() * Math.PI,
                            Math.random() * Math.PI
                        );
                        
                        islandGroup.add(rock);
                    }
                }
            }
        }
        
        islandGroup.position.set(x, height / 2, z);
        scene.add(islandGroup);
        
        if (name) {
            createLabel(islandGroup, name, color);
        }
        
        return islandGroup;
    };

    // Magic Islands
    const magicIsland = createIsland(0, 0, 30, 12, 0x228b22, "Magic Islands"); // Forest green
    
    // Smugglers Islands
    const smugglersIsland = createIsland(0, 80, 25, 10, 0x8b4513, "Smugglers Islands"); // Saddle brown

    // Western Continent
    const westContinentGeometry = new THREE.BoxGeometry(110, 15, 90);
    const westContinentMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8b0000, // Dark red for demon world
        shininess: 20
    });
    const westContinent = new THREE.Mesh(westContinentGeometry, westContinentMaterial);
    westContinent.position.set(-110, 7.5, 0);
    scene.add(westContinent);
    createLabel(westContinent, "Western Continent", 0x8b0000);

    // 4. Underground Layer with improved caves
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

    // Add some crystals inside the cave
    for (let i = 0; i < 8; i++) {
        const crystalGeom = new THREE.OctahedronGeometry(2 + Math.random(), 0);
        const crystalMat = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        
        const crystal = new THREE.Mesh(crystalGeom, crystalMat);
        
        // Random position within cave
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 30 + Math.random() * 10;
        
        crystal.position.set(
            20 + radius * Math.sin(phi) * Math.cos(theta),
            -30 + radius * Math.cos(phi),
            60 + radius * Math.sin(phi) * Math.sin(theta)
        );
        
        crystal.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        scene.add(crystal);
    }

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

    // 5. Underwater Layer (Atlantis) with improved dome
    const atlantisGroup = new THREE.Group();
    
    // Main dome
    const domeGeometry = new THREE.SphereGeometry(30, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x40e0d0, // Turquoise
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        side: THREE.DoubleSide
    });
    
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.rotation.x = Math.PI;
    atlantisGroup.add(dome);
    
    // Add buildings inside dome
    for (let i = 0; i < 20; i++) {
        const buildingType = Math.floor(Math.random() * 3);
        const buildingHeight = 2 + Math.random() * 8;
        let buildingGeom;
        
        switch(buildingType) {
            case 0:
                buildingGeom = new THREE.BoxGeometry(2, buildingHeight, 2);
                break;
            case 1:
                buildingGeom = new THREE.CylinderGeometry(1, 1.5, buildingHeight, 6);
                break;
            case 2:
                buildingGeom = new THREE.ConeGeometry(1.5, buildingHeight, 5);
                break;
        }
        
        const buildingMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 80
        });
        
        const building = new THREE.Mesh(buildingGeom, buildingMat);
        
        // Position within dome
        const radius = Math.random() * 25;
        const angle = Math.random() * Math.PI * 2;
        
        building.position.set(
            radius * Math.cos(angle),
            -buildingHeight/2,
            radius * Math.sin(angle)
        );
        
        atlantisGroup.add(building);
    }
    
    atlantisGroup.position.set(0, -60, 40);
    scene.add(atlantisGroup);
    createLabel(atlantisGroup, "Atlantis", 0x40e0d0);

    // Add vertical connectors between layers with enhanced appearance
    const createVerticalConnector = (startX, startY, startZ, endX, endY, endZ, color) => {
        // Create core beam
        const points = [
            new THREE.Vector3(startX, startY, startZ),
            new THREE.Vector3(endX, endY, endZ)
        ];
        const beamGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const beamMaterial = new THREE.LineBasicMaterial({ 
            color, 
            linewidth: 2,
            transparent: true,
            opacity: 0.7
        });
        const beam = new THREE.Line(beamGeometry, beamMaterial);
        scene.add(beam);
        
        // Add energy tube around beam
        const curvePoints = points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 1.5, 8, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        scene.add(tube);
        
        return [beam, tube];
    };

    // Add improved connectors with updated positions
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

    // Add cloud layer
    const createCloud = (x, y, z, size) => {
        const cloudGroup = new THREE.Group();
        
        // Create several sphere meshes for a puffy cloud
        const sphereCount = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < sphereCount; i++) {
            const sphereSize = (size/2) * (0.6 + Math.random() * 0.8);
            const cloudGeometry = new THREE.SphereGeometry(sphereSize, 7, 7);
            const cloudMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                shininess: 10
            });
            
            const sphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            // Position spheres to form a cloud shape
            sphere.position.set(
                (Math.random() - 0.5) * size,
                (Math.random() - 0.5) * size/2,
                (Math.random() - 0.5) * size
            );
            
            cloudGroup.add(sphere);
        }
        
        cloudGroup.position.set(x, y, z);
        return cloudGroup;
    };
    
    // Add some clouds around the world
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 150;
        const height = 100 + Math.random() * 40;
        
        const cloud = createCloud(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius,
            10 + Math.random() * 20
        );
        
        scene.add(cloud);
    }

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
    const radius = cameraRadius; // ZOOMED: Using the adjusted camera radius
    const centerX = 0;
    const centerZ = 0;
    const height = cameraHeight; // ZOOMED: Using the adjusted camera height

    // Animation loop with water animation
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Animate water
        if (basePlane.geometry.isBufferGeometry) {
            const positions = basePlane.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const z = positions.getZ(i);
                // Simple wave effect
                const y = Math.sin(x * 0.05 + elapsedTime) * Math.cos(z * 0.05 + elapsedTime) * 2;
                positions.setY(i, y);
            }
            positions.needsUpdate = true;
        }
        
        // Rotate camera in a circle around the scene if rotation is enabled
        if (isRotating) {
            angle += 0.001;
            camera.position.x = centerX + radius * Math.cos(angle);
            camera.position.z = centerZ + radius * Math.sin(angle);
            camera.position.y = height;
            camera.lookAt(0, 0, 0);
        }
        
        // Update label positions
        updateLabels();
        
        // Render the scene
        renderer.render(scene, camera);
    };
    
    // Start animation
    animate();

    // Toggle rotation button
    if (toggleRotationButton) {
        toggleRotationButton.addEventListener('click', function() {
            isRotating = !isRotating;
            this.textContent = isRotating ? 'Pause Rotation' : 'Start Rotation';
        });