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
    scene.background = new THREE.Color(0x1a237e); // Dark blue background to match reference

    // Camera setup - adjusted for smaller viewport with zoom
    const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        2000
    );
    
    // ZOOM ADJUSTMENT: Reduce camera distance by ~30%
    const zoomFactor = 0.8; // 20% closer
    const cameraRadius = 320 * zoomFactor;
    const cameraHeight = 220 * zoomFactor; // Higher angle to see more of the isometric view
    
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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(150, 200, 150);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.bias = -0.001;
    scene.add(directionalLight);

    // Create base plane (representing sea level)
    const baseGeometry = new THREE.BoxGeometry(500, 5, 500); // Thicker water
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4fc3f7, // Brighter blue
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.8, // More reflective
    });
    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    basePlane.position.y = -2.5; // Slightly lower to create beach effect
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

    // Function to create stylized low-poly terrain continents
    function createStylizedContinent(params) {
        const {
            position,
            width,
            depth,
            name,
            terrainType = 'grassland' // Options: 'grassland', 'desert', 'snow'
        } = params;
        
        // Create a continent group to hold all parts
        const continentGroup = new THREE.Group();
        continentGroup.position.copy(position);
        
        // Define color palette based on terrain type
        let grassColor, sandColor, rockColor, snowColor;
        
        switch (terrainType) {
            case 'desert':
                grassColor = 0xd9ad7c; // Light tan
                sandColor = 0xe3c998;  // Sandy color
                rockColor = 0xb38867;  // Brown rock
                snowColor = 0xf7e7ce;  // Light sand
                break;
            case 'snow':
                grassColor = 0xc9e9f6; // Light blue-white
                sandColor = 0xe0e9ec;  // Off-white
                rockColor = 0x9db2bd;  // Gray-blue
                snowColor = 0xffffff;  // Pure white
                break;
            case 'grassland':
            default:
                grassColor = 0x4caf50; // Bright green
                sandColor = 0xf0e68c;  // Khaki/sand
                rockColor = 0x8d6e63;  // Brown
                snowColor = 0xdcedc8;  // Light green
                break;
        }
        
        // Create an array of layers with different heights
        const numLayers = 4;
        const maxHeight = 30;
        
        for (let i = 0; i < numLayers; i++) {
            // Calculate dimensions for this layer
            const layerWidth = width * (1 - (i * 0.15));
            const layerDepth = depth * (1 - (i * 0.15));
            const layerHeight = (i + 1) * (maxHeight / numLayers);
            
            // Create this layer's shape with more angular vertices for low-poly look
            const layerShape = new THREE.Shape();
            const corners = 6; // Hexagonal base shape
            const cornerOffset = 0.2; // Randomness for corners
            
            // Get the center point of this layer
            const centerX = 0;
            const centerZ = 0;
            
            // Generate angular points around a circle
            for (let j = 0; j < corners; j++) {
                const angle = (j / corners) * Math.PI * 2;
                const radius = j % 2 === 0 ? 
                              (layerWidth * 0.5) * (0.9 + Math.random() * cornerOffset) : 
                              (layerWidth * 0.5) * (0.8 + Math.random() * cornerOffset);
                
                const x = centerX + Math.cos(angle) * radius;
                const y = centerZ + Math.sin(angle) * radius;
                
                if (j === 0) {
                    layerShape.moveTo(x, y);
                } else {
                    layerShape.lineTo(x, y);
                }
            }
            
            layerShape.closePath();
            
            // Choose color based on layer height
            let layerColor;
            if (i === 0) {
                layerColor = sandColor; // Beach/shore
            } else if (i === numLayers - 1) {
                layerColor = snowColor; // Top/peak
            } else if (i === numLayers - 2) {
                layerColor = rockColor; // High areas/rock
            } else {
                layerColor = grassColor; // Main terrain
            }
            
            // Create extruded geometry with beveled edges for the low-poly look
            const extrudeSettings = {
                steps: 1,
                depth: layerHeight,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 2,
                bevelOffset: 0,
                bevelSegments: 1 // Low segments for angular look
            };
            
            const geometry = new THREE.ExtrudeGeometry(layerShape, extrudeSettings);
            geometry.rotateX(-Math.PI / 2); // Make it face upward
            
            // Create material with flat shading for the low-poly look
            const material = new THREE.MeshStandardMaterial({
                color: layerColor,
                flatShading: true,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const layer = new THREE.Mesh(geometry, material);
            layer.position.y = i > 0 ? ((i - 1) * (maxHeight / numLayers)) : 0;
            layer.castShadow = true;
            layer.receiveShadow = true;
            
            continentGroup.add(layer);
            
            // Add trees or details to higher layers (except the top one)
            if (i > 0 && i < numLayers - 1 && terrainType === 'grassland') {
                addTrees(layer, layerShape, layerHeight);
            }
        }
        
        // Add the continent to the scene
        scene.add(continentGroup);
        createLabel(continentGroup, name, grassColor);
        
        return continentGroup;
        
        // Helper function to add stylized trees
        function addTrees(layer, layerShape, layerHeight) {
            // Get points around the shape perimeter
            const perimeterPoints = layerShape.getPoints(20);
            
            // Also add some random points inside the shape
            const innerPoints = [];
            const numInnerTrees = 10;
            
            for (let i = 0; i < numInnerTrees; i++) {
                // Create a random point inside the shape
                // This is a simplified approach - may place trees outside shape
                const randomPoint = new THREE.Vector2(
                    (Math.random() - 0.5) * layerWidth * 0.7,
                    (Math.random() - 0.5) * layerDepth * 0.7
                );
                
                innerPoints.push(randomPoint);
            }
            
            // Combine perimeter and inner points
            const treePoints = [...perimeterPoints, ...innerPoints];
            
            // Create trees at a subset of these points
            for (let i = 0; i < treePoints.length; i += 3) { // Place at every 3rd point
                const point = treePoints[i];
                
                // Skip some points randomly
                if (Math.random() > 0.6) continue;
                
                // Create a simple stylized tree
                const treeGroup = new THREE.Group();
                
                // Tree trunk - a simple cylinder
                const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 5, 5);
                const trunkMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8d6e63, // Brown
                    flatShading: true
                });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.y = 2.5;
                treeGroup.add(trunk);
                
                // Tree foliage - using cones for a low-poly look
                const foliageSize = 3 + Math.random() * 2;
                const foliageGeometry = new THREE.ConeGeometry(foliageSize, foliageSize * 2, 6);
                
                // Vary the tree colors slightly
                const foliageColorVariation = 0.2;
                const baseColor = new THREE.Color(0x2e7d32); // Dark green
                const foliageColor = new THREE.Color(
                    baseColor.r * (1 - foliageColorVariation/2 + Math.random() * foliageColorVariation),
                    baseColor.g * (1 - foliageColorVariation/2 + Math.random() * foliageColorVariation),
                    baseColor.b * (1 - foliageColorVariation/2 + Math.random() * foliageColorVariation)
                );
                
                const foliageMaterial = new THREE.MeshStandardMaterial({
                    color: foliageColor,
                    flatShading: true
                });
                
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = 7; // Place on top of trunk
                treeGroup.add(foliage);
                
                // Position the tree
                treeGroup.position.set(point.x, layerHeight, point.y);
                
                // Add some random rotation
                treeGroup.rotation.y = Math.random() * Math.PI * 2;
                
                // Add tree to the layer
                layer.add(treeGroup);
            }
        }
    }

    // Create the vertical layers
    
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

    // Create stylized continents
    // Eastern Continent - stylized grassland
    const eastContinentParams = {
        position: new THREE.Vector3(120, 2, 0),
        width: 150,
        depth: 120,
        name: "Eastern Continent",
        terrainType: 'grassland'
    };
    const eastContinent = createStylizedContinent(eastContinentParams);

    // Western Continent - stylized desert
    const westContinentParams = {
        position: new THREE.Vector3(-120, 2, 0),
        width: 140,
        depth: 130,
        name: "Western Continent",
        terrainType: 'desert'
    };
    const westContinent = createStylizedContinent(westContinentParams);

    // Create stylized islands
    const magicIslandParams = {
        position: new THREE.Vector3(0, 2, 0), 
        width: 60,
        depth: 60,
        name: "Magic Islands",
        terrainType: 'grassland'
    };
    const magicIsland = createStylizedContinent(magicIslandParams);

    const smugglersIslandParams = {
        position: new THREE.Vector3(0, 2, 80),
        width: 50,
        depth: 50,
        name: "Smugglers Islands",
        terrainType: 'desert'
    };
    const smugglersIsland = createStylizedContinent(smugglersIslandParams);

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
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r132/three.min.js';
    threeScript.onload = function() {
        initWorldVisualization();
    };
    document.head.appendChild(threeScript);
});