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

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        2000
    );
    
    // Zoom adjustment
    const zoomFactor = 0.7;
    const cameraRadius = 320 * zoomFactor;
    const cameraHeight = 180 * zoomFactor;
    
    camera.position.set(cameraRadius, cameraHeight, cameraRadius);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
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

    // Create base plane (representing sea level)
    const baseGeometry = new THREE.PlaneGeometry(400, 400);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4682b4, // Steel blue for water
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
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

    // EASTERN CONTINENT
    const eastContinentGeometry = new THREE.BoxGeometry(140, 12, 180);
    const eastContinentMaterial = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 });
    const eastContinent = new THREE.Mesh(eastContinentGeometry, eastContinentMaterial);
    eastContinent.position.set(130, 6, 0);
    scene.add(eastContinent);
    createLabel(eastContinent, "Eastern Continent", 0xa9a9a9);

    // EASTERN REGIONS
    // Vertical Farm Region (north east)
    const verticalFarmGeometry = new THREE.BoxGeometry(60, 15, 60);
    const verticalFarmMaterial = new THREE.MeshLambertMaterial({ color: 0x7cfc00 }); // Light green
    const verticalFarm = new THREE.Mesh(verticalFarmGeometry, verticalFarmMaterial);
    verticalFarm.position.set(110, 13.5, -60);
    scene.add(verticalFarm);
    createLabel(verticalFarm, "Vertical Farm Region", 0x7cfc00);

    // Industrial Area (due east)
    const industrialAreaGeometry = new THREE.BoxGeometry(60, 18, 70);
    const industrialAreaMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate gray
    const industrialArea = new THREE.Mesh(industrialAreaGeometry, industrialAreaMaterial);
    industrialArea.position.set(150, 15, 0);
    scene.add(industrialArea);
    createLabel(industrialArea, "Industrial Area", 0x708090);

    // Seaside Capital City
    const seasideCapitalGeometry = new THREE.CylinderGeometry(25, 30, 20, 8);
    const seasideCapitalMaterial = new THREE.MeshLambertMaterial({ color: 0xdaa520 }); // Goldenrod
    const seasideCapital = new THREE.Mesh(seasideCapitalGeometry, seasideCapitalMaterial);
    seasideCapital.position.set(100, 16, 60);
    scene.add(seasideCapital);
    createLabel(seasideCapital, "Seaside Capital", 0xdaa520);

    // Sky Palace (floating above seaside capital)
    const skyPalaceGeometry = new THREE.CylinderGeometry(18, 22, 15, 6);
    const skyPalaceMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00ffff, // Cyan
        transparent: true,
        opacity: 0.9
    });
    const skyPalace = new THREE.Mesh(skyPalaceGeometry, skyPalaceMaterial);
    skyPalace.position.set(100, 80, 60);
    scene.add(skyPalace);
    createLabel(skyPalace, "Sky Palace", 0x00ffff);

    // Space Farms (highest layer)
    const spaceFarmsGeometry = new THREE.TorusGeometry(80, 4, 16, 50);
    const spaceFarmsMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xadd8e6, // Light blue
        transparent: true,
        opacity: 0.7
    });
    const spaceFarms = new THREE.Mesh(spaceFarmsGeometry, spaceFarmsMaterial);
    spaceFarms.position.set(120, 140, 0);
    spaceFarms.rotation.x = Math.PI / 3;
    scene.add(spaceFarms);
    createLabel(spaceFarms, "Space Farms", 0xadd8e6);

    // Eastern Mines (under industrial area)
    const mineGeometry = new THREE.SphereGeometry(30, 8, 8);
    const mineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x696969, // Dim gray for mines
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const mineSystem = new THREE.Mesh(mineGeometry, mineMaterial);
    mineSystem.position.set(150, -25, 0);
    scene.add(mineSystem);
    createLabel(mineSystem, "Eastern Mines", 0x696969);

    // Sewers (under seaside capital)
    const sewerGeometry = new THREE.CylinderGeometry(20, 25, 10, 8, 1, true);
    const sewerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x556b2f, // Dark olive green
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const sewers = new THREE.Mesh(sewerGeometry, sewerMaterial);
    sewers.position.set(100, -15, 60);
    scene.add(sewers);
    createLabel(sewers, "Mutant Sewers", 0x556b2f);

    // CENTRAL ISLANDS
    // Magic Islands Capital
    const magicIslandGeometry = new THREE.CylinderGeometry(35, 40, 15, 8);
    const magicIslandMaterial = new THREE.MeshLambertMaterial({ color: 0x9932cc }); // Dark orchid
    const magicIsland = new THREE.Mesh(magicIslandGeometry, magicIslandMaterial);
    magicIsland.position.set(0, 7.5, 0);
    scene.add(magicIsland);
    createLabel(magicIsland, "Magic Islands Capital", 0x9932cc);

    // Moon Palace (floating above magic islands)
    const moonPalaceGeometry = new THREE.CylinderGeometry(20, 24, 18, 6);
    const moonPalaceMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xc39bd3, // Lavender
        transparent: true,
        opacity: 0.9
    });
    const moonPalace = new THREE.Mesh(moonPalaceGeometry, moonPalaceMaterial);
    moonPalace.position.set(0, 80, 0);
    scene.add(moonPalace);
    createLabel(moonPalace, "Moon Palace", 0xc39bd3);

    // Forested Islands (surrounding magic islands)
    const createForestedIsland = (x, z, size) => {
        const islandGroup = new THREE.Group();
        
        // Island base
        const baseGeom = new THREE.CylinderGeometry(size, size * 1.1, size * 0.4, 8);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Saddle brown
        const base = new THREE.Mesh(baseGeom, baseMat);
        islandGroup.add(base);
        
        // Forest
        const forestGeom = new THREE.ConeGeometry(size * 0.8, size * 1.2, 8);
        const forestMat = new THREE.MeshLambertMaterial({ color: 0x228b22 }); // Forest green
        const forest = new THREE.Mesh(forestGeom, forestMat);
        forest.position.y = size * 0.8;
        islandGroup.add(forest);
        
        islandGroup.position.set(x, 0, z);
        scene.add(islandGroup);
        
        return islandGroup;
    };

    // Create several forested islands around the magic islands
    const forestedIslands = [
        createForestedIsland(-40, -30, 15),
        createForestedIsland(40, -40, 12),
        createForestedIsland(50, 20, 14),
        createForestedIsland(-50, 30, 13),
        createForestedIsland(0, -45, 16)
    ];
    createLabel(forestedIslands[0], "Forest Farms", 0x228b22);

    // Smugglers Island (to the south)
    const smugglersIslandGeometry = new THREE.CylinderGeometry(25, 30, 12, 8);
    const smugglersIslandMaterial = new THREE.MeshLambertMaterial({ color: 0xcd853f }); // Peru
    const smugglersIsland = new THREE.Mesh(smugglersIslandGeometry, smugglersIslandMaterial);
    smugglersIsland.position.set(0, 6, 90);
    scene.add(smugglersIsland);
    createLabel(smugglersIsland, "Smugglers Island", 0xcd853f);

    // The Belt (floating above smugglers island)
    const beltGeometry = new THREE.TorusGeometry(20, 3, 16, 32);
    const beltMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff7f50, // Coral
        transparent: true,
        opacity: 0.9
    });
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    belt.position.set(0, 70, 90);
    belt.rotation.x = Math.PI / 2;
    scene.add(belt);
    createLabel(belt, "The Belt", 0xff7f50);

    // Cave Islands (surrounding smugglers island)
    const createCaveIsland = (x, z, size) => {
        const caveGroup = new THREE.Group();
        
        // Island base
        const baseGeom = new THREE.CylinderGeometry(size, size * 1.1, size * 0.3, 6);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        const base = new THREE.Mesh(baseGeom, baseMat);
        caveGroup.add(base);
        
        // Cave entrance (hole in the middle)
        const caveGeom = new THREE.CylinderGeometry(size * 0.4, size * 0.4, size * 0.3, 8);
        const caveMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black
        const cave = new THREE.Mesh(caveGeom, caveMat);
        cave.position.y = size * 0.01;
        caveGroup.add(cave);
        
        caveGroup.position.set(x, 0, z);
        scene.add(caveGroup);
        
        return caveGroup;
    };

    // Create several cave islands around smugglers island
    const caveIslands = [
        createCaveIsland(30, 110, 10),
        createCaveIsland(-25, 115, 8),
        createCaveIsland(15, 130, 9),
        createCaveIsland(-15, 70, 7)
    ];
    createLabel(caveIslands[0], "Cave Islands", 0x808080);

    // Atlantis (underwater city)
    const atlantisGeometry = new THREE.DodecahedronGeometry(40, 1);
    const atlantisMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x40e0d0, // Turquoise
        transparent: true,
        opacity: 0.7
    });
    const atlantis = new THREE.Mesh(atlantisGeometry, atlantisMaterial);
    atlantis.position.set(0, -50, 45);
    scene.add(atlantis);
    createLabel(atlantis, "Atlantis", 0x40e0d0);

    // WESTERN REGIONS
    // Fire Islands
    const fireIslandsGeometry = new THREE.CylinderGeometry(30, 35, 20, 8);
    const fireIslandsMaterial = new THREE.MeshLambertMaterial({ color: 0xff4500 }); // Orange red
    const fireIslands = new THREE.Mesh(fireIslandsGeometry, fireIslandsMaterial);
    fireIslands.position.set(-90, 10, 0);
    scene.add(fireIslands);
    createLabel(fireIslands, "Fire Islands", 0xff4500);

    // Hell's End Continent
    const hellsEndGeometry = new THREE.BoxGeometry(120, 15, 180);
    const hellsEndMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 }); // Dark red
    const hellsEnd = new THREE.Mesh(hellsEndGeometry, hellsEndMaterial);
    hellsEnd.position.set(-150, 7.5, 0);
    scene.add(hellsEnd);
    createLabel(hellsEnd, "Hell's End", 0x8b0000);

    // Hell's End Gate Capital
    const hellsGateGeometry = new THREE.CylinderGeometry(25, 25, 25, 8);
    const hellsGateMaterial = new THREE.MeshLambertMaterial({ color: 0xb22222 }); // Firebrick
    const hellsGate = new THREE.Mesh(hellsGateGeometry, hellsGateMaterial);
    hellsGate.position.set(-150, 20, 0);
    scene.add(hellsGate);
    createLabel(hellsGate, "Hell's End Gate", 0xb22222);

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

    // Add connectors
    const connectors = [
        // Space to Sky Palace
        createVerticalConnector(120, 140, 0, 100, 80, 60, 0x00ffff),
        
        // Sky Palace to Seaside Capital
        createVerticalConnector(100, 80, 60, 100, 16, 60, 0x00ffff),
        
        // Seaside Capital to Sewers
        createVerticalConnector(100, 16, 60, 100, -15, 60, 0x556b2f),
        
        // Industrial Area to Mines
        createVerticalConnector(150, 15, 0, 150, -25, 0, 0x696969),
        
        // Moon Palace to Magic Islands
        createVerticalConnector(0, 80, 0, 0, 7.5, 0, 0xc39bd3),
        
        // The Belt to Smugglers Island
        createVerticalConnector(0, 70, 90, 0, 6, 90, 0xff7f50),
        
        // Smugglers Island to Cave Islands to Atlantis
        createVerticalConnector(0, 6, 90, 15, 0, 130, 0x808080),
        createVerticalConnector(15, 0, 130, 0, -50, 45, 0x40e0d0),
        
        // Magic Islands to Atlantis
        createVerticalConnector(0, 7.5, 0, 0, -50, 45, 0x9932cc),
    ];
    
    connectors.forEach(connector => scene.add(connector));

    // Add grid helper for context
    const gridHelper = new THREE.GridHelper(400, 40, 0x000000, 0x000000);
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
    const radius = cameraRadius;
    const centerX = 0;
    const centerZ = 0;
    const height = cameraHeight;

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
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = function() {
        initWorldVisualization();
    };
    document.head.appendChild(threeScript);
});