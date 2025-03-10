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

    // Camera setup - adjusted for smaller viewport
    const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        2000
    );
    camera.position.set(300, 200, 300);
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
    const baseGeometry = new THREE.PlaneGeometry(300, 300);
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

    // 3. Surface Layer (continents)
    // Eastern Continent
    const eastContinentGeometry = new THREE.BoxGeometry(120, 8, 90);
    const eastContinentMaterial = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 }); // Dark gray for tech world
    const eastContinent = new THREE.Mesh(eastContinentGeometry, eastContinentMaterial);
    eastContinent.position.set(100, 4, 0);
    scene.add(eastContinent);
    createLabel(eastContinent, "Eastern Continent", 0xa9a9a9);

    // Create Island function
    const createIsland = (x, z, size, height, color, name) => {
        const islandGeometry = new THREE.CylinderGeometry(size, size * 1.2, height, 8);
        const islandMaterial = new THREE.MeshLambertMaterial({ color });
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        island.position.set(x, height / 2, z);
        scene.add(island);
        
        if (name) {
            createLabel(island, name, color);
        }
        
        return island;
    };

    // Magic Islands
    const magicIsland = createIsland(0, 0, 30, 12, 0x228b22, "Magic Islands"); // Forest green
    
    // Smugglers Islands
    const smugglersIsland = createIsland(0, 80, 25, 10, 0x8b4513, "Smugglers Islands"); // Saddle brown

    // Western Continent
    const westContinentGeometry = new THREE.BoxGeometry(110, 15, 90);
    const westContinentMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 }); // Dark red for demon world
    const westContinent = new THREE.Mesh(westContinentGeometry, westContinentMaterial);
    westContinent.position.set(-110, 7.5, 0);
    scene.add(westContinent);
    createLabel(westContinent, "Western Continent", 0x8b0000);

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
    const radius = 450; // Distance from center
    const centerX = 0;
    const centerZ = 0;
    const height = 250; // Height of camera

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
