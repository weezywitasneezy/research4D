// World Visualization

// Fullscreen toggle function
function toggleFullScreen(element) {
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function initWorldVisualization() {
    // DOM elements
    const container = document.getElementById('visualization-mount');
    const toggleRotationButton = document.getElementById('toggle-rotation');
    const visualizationContainer = document.querySelector('.visualization-container');
    
    if (!container) return; // Exit if container not found
    
    // State variables
    let isRotating = true;
    
    // Find the visualization controls div
    const visualizationControls = document.querySelector('.visualization-controls');
    
    if (visualizationControls) {
        // Create fullscreen button
        const fullscreenButton = document.createElement('button');
        fullscreenButton.id = 'toggle-fullscreen';
        fullscreenButton.className = 'control-button';
        fullscreenButton.textContent = 'Enter Fullscreen';
        
        // Insert fullscreen button after the toggle rotation button
        if (toggleRotationButton) {
            // Insert after the toggle rotation button
            toggleRotationButton.insertAdjacentElement('afterend', fullscreenButton);
        } else {
            // If toggle rotation button doesn't exist, just append to controls
            visualizationControls.appendChild(fullscreenButton);
        }
        
        // Add click handler for fullscreen button
        fullscreenButton.addEventListener('click', function() {
            toggleFullScreen(visualizationContainer);
        });
        
        // Add event listeners to update button text
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
        
        document.addEventListener('fullscreenchange', updateFullscreenButtonText);
        document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
        document.addEventListener('MSFullscreenChange', updateFullscreenButtonText);
    }
    
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

    // EASTERN CONTINENT - Enhanced with more detail
    // Main continent body
    const eastContinentGroup = new THREE.Group();
    
    // Using a combination of shapes for more natural look
    const mainContinentGeometry = new THREE.BoxGeometry(140, 12, 180);
    const mainContinentMaterial = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 });
    const mainContinent = new THREE.Mesh(mainContinentGeometry, mainContinentMaterial);
    eastContinentGroup.add(mainContinent);
    
    // Adding a slightly elevated plateau for terrain variation
    const plateauGeometry = new THREE.BoxGeometry(80, 4, 100);
    const plateauMaterial = new THREE.MeshLambertMaterial({ color: 0xb0b0b0 });
    const plateau = new THREE.Mesh(plateauGeometry, plateauMaterial);
    plateau.position.set(-20, 8, -20);
    eastContinentGroup.add(plateau);
    
    // Adding coastal ridges
    const coastalRidgeGeometry = new THREE.BoxGeometry(10, 8, 180);
    const coastalRidgeMaterial = new THREE.MeshLambertMaterial({ color: 0x909090 });
    const coastalRidge = new THREE.Mesh(coastalRidgeGeometry, coastalRidgeMaterial);
    coastalRidge.position.set(-65, 4, 0);
    eastContinentGroup.add(coastalRidge);
    
    // Position the entire continent group
    eastContinentGroup.position.set(130, 6, 0);
    scene.add(eastContinentGroup);
    createLabel(eastContinentGroup, "Eastern Continent", 0xa9a9a9);

    // EASTERN REGIONS
    // Vertical Farm Region (north east) - Enhanced with more detail
    const verticalFarmGroup = new THREE.Group();
    
    // Base land area
    const farmBaseGeometry = new THREE.BoxGeometry(60, 8, 60);
    const farmBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x729f00 }); // Darker green base
    const farmBase = new THREE.Mesh(farmBaseGeometry, farmBaseMaterial);
    verticalFarmGroup.add(farmBase);
    
    // Creating multiple vertical farm towers
    const createFarmTower = (x, z, height, radius) => {
        const towerGeometry = new THREE.CylinderGeometry(radius, radius, height, 8);
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x7cfc00 }); // Light green
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.set(x, height/2 + 4, z);
        verticalFarmGroup.add(tower);
        
        // Add a small dome on top
        const domeGeometry = new THREE.SphereGeometry(radius, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshLambertMaterial({ color: 0xaaffaa }); // Light green
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.set(x, height + 4, z);
        verticalFarmGroup.add(dome);
    };
    
    // Create several farm towers of varying heights
    createFarmTower(-15, -15, 20, 5);
    createFarmTower(0, 0, 24, 6);
    createFarmTower(15, 10, 18, 5);
    createFarmTower(-10, 15, 22, 4);
    createFarmTower(12, -12, 26, 5);
    
    // Position the entire farm group
    verticalFarmGroup.position.set(110, 13.5, -60);
    scene.add(verticalFarmGroup);
    createLabel(verticalFarmGroup, "Vertical Farm Region", 0x7cfc00);

    // Industrial Area (due east) - Enhanced with more detail
    const industrialAreaGroup = new THREE.Group();
    
    // Base industrial zone
    const industrialBaseGeometry = new THREE.BoxGeometry(60, 6, 70);
    const industrialBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 }); // Dark gray
    const industrialBase = new THREE.Mesh(industrialBaseGeometry, industrialBaseMaterial);
    industrialAreaGroup.add(industrialBase);
    
    // Factory buildings
    const factoryGeometry = new THREE.BoxGeometry(15, 15, 20);
    const factoryMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate gray
    
    // First factory building
    const factory1 = new THREE.Mesh(factoryGeometry, factoryMaterial);
    factory1.position.set(-15, 10.5, -20);
    industrialAreaGroup.add(factory1);
    
    // Second factory building
    const factory2 = new THREE.Mesh(factoryGeometry, factoryMaterial);
    factory2.position.set(10, 10.5, 0);
    industrialAreaGroup.add(factory2);
    
    // Third factory building
    const factory3 = new THREE.Mesh(factoryGeometry, factoryMaterial);
    factory3.position.set(-5, 10.5, 25);
    industrialAreaGroup.add(factory3);
    
    // Smoke stacks
    const smokestackGeometry = new THREE.CylinderGeometry(2, 2.5, 25, 8);
    const smokestackMaterial = new THREE.MeshLambertMaterial({ color: 0xa0a0a0 });
    
    // Add smokestacks to the factories
    const addSmokestack = (x, z) => {
        const smokestack = new THREE.Mesh(smokestackGeometry, smokestackMaterial);
        smokestack.position.set(x, 23, z);
        industrialAreaGroup.add(smokestack);
    };
    
    addSmokestack(-15, -20);
    addSmokestack(10, 0);
    addSmokestack(-5, 25);
    
    // Position the entire industrial area group
    industrialAreaGroup.position.set(150, 15, 0);
    scene.add(industrialAreaGroup);
    createLabel(industrialAreaGroup, "Industrial Area", 0x708090);

    // Seaside Capital City - Enhanced with more detail
    const seasideCapitalGroup = new THREE.Group();
    
    // Main city base
    const cityBaseGeometry = new THREE.CylinderGeometry(25, 30, 5, 8);
    const cityBaseMaterial = new THREE.MeshLambertMaterial({ color: 0xdaa520 }); // Goldenrod
    const cityBase = new THREE.Mesh(cityBaseGeometry, cityBaseMaterial);
    cityBase.position.y = 2.5;
    seasideCapitalGroup.add(cityBase);
    
    // Central tallest building/palace
    const centralTowerGeometry = new THREE.CylinderGeometry(5, 8, 25, 6);
    const centralTowerMaterial = new THREE.MeshLambertMaterial({ color: 0xf0e68c }); // Khaki
    const centralTower = new THREE.Mesh(centralTowerGeometry, centralTowerMaterial);
    centralTower.position.y = 17.5;
    seasideCapitalGroup.add(centralTower);
    
    // Tower spire
    const spireGeometry = new THREE.ConeGeometry(3, 10, 6);
    const spireMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 }); // Gold
    const spire = new THREE.Mesh(spireGeometry, spireMaterial);
    spire.position.y = 35;
    seasideCapitalGroup.add(spire);
    
    // Surrounding buildings
    const createBuilding = (radius, angle, height, width) => {
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, width);
        const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xe6c899 }); // Lighter tan
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height/2 + 5, z);
        seasideCapitalGroup.add(building);
    };
    
    // Create circular arrangement of buildings
    const buildingCount = 8;
    for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2;
        const radius = 15;
        const height = 10 + Math.random() * 8; // Random heights
        const width = 5 + Math.random() * 3; // Random widths
        createBuilding(radius, angle, height, width);
    }
    
    // Create harbor/docks extending toward the sea (east)
    const harborGeometry = new THREE.BoxGeometry(40, 2, 10);
    const harborMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Saddle brown
    const harbor = new THREE.Mesh(harborGeometry, harborMaterial);
    harbor.position.set(-30, 3, 0); // Extend toward the sea (west)
    seasideCapitalGroup.add(harbor);
    
    // Position the entire city group
    seasideCapitalGroup.position.set(100, 16, 60);
    scene.add(seasideCapitalGroup);
    createLabel(seasideCapitalGroup, "Seaside Capital", 0xdaa520);

    // Sky Palace (floating above seaside capital) - Enhanced with more detail
    const skyPalaceGroup = new THREE.Group();
    
    // Main floating platform
    const platformGeometry = new THREE.CylinderGeometry(18, 22, 6, 6);
    const platformMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00ffff, // Cyan
        transparent: true,
        opacity: 0.8
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0;
    skyPalaceGroup.add(platform);
    
    // Central palace structure
    const palaceGeometry = new THREE.CylinderGeometry(12, 15, 15, 6);
    const palaceMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00ffff, // Cyan
        transparent: true,
        opacity: 0.9
    });
    const palace = new THREE.Mesh(palaceGeometry, palaceMaterial);
    palace.position.y = 10.5;
    skyPalaceGroup.add(palace);
    
    // Decorative ring around the platform
    const ringGeometry = new THREE.TorusGeometry(20, 1, 16, 32);
    const ringMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xadd8e6, // Light blue
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 3;
    skyPalaceGroup.add(ring);
    
    // Top central tower
    const towerGeometry = new THREE.CylinderGeometry(4, 8, 12, 6);
    const towerMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xb0e0e6, // Powder blue
        transparent: true,
        opacity: 0.9
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 24;
    skyPalaceGroup.add(tower);
    
    // Tower top dome
    const domeGeometry = new THREE.SphereGeometry(5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xe0ffff, // Light cyan
        transparent: true,
        opacity: 0.9
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 30;
    skyPalaceGroup.add(dome);
    
    // Small cloud-like structures around the platform
    const createCloud = (radius, angle, size) => {
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        
        const cloudGeometry = new THREE.SphereGeometry(size, 8, 8);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf0f8ff, // Alice blue
            transparent: true,
            opacity: 0.4
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(x, -2, z);
        skyPalaceGroup.add(cloud);
    };
    
    // Create clouds around the palace
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 25;
        const size = 3 + Math.random() * 2;
        createCloud(radius, angle, size);
    }
    
    // Position the entire sky palace group
    skyPalaceGroup.position.set(100, 80, 60);
    scene.add(skyPalaceGroup);
    createLabel(skyPalaceGroup, "Sky Palace", 0x00ffff);

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
    
    // Add resize event listeners including fullscreen changes
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('mozfullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);
    document.addEventListener('MSFullscreenChange', handleResize);

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

    // Toggle rotation button event listener if it exists
    if (toggleRotationButton) {
        toggleRotationButton.addEventListener('click', function() {
            isRotating = !isRotating;
            this.textContent = isRotating ? 'Pause Rotation' : 'Start Rotation';
        });
    }

    // Return a cleanup function
    return function cleanup() {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('fullscreenchange', handleResize);
        document.removeEventListener('mozfullscreenchange', handleResize);
        document.removeEventListener('webkitfullscreenchange', handleResize);
        document.removeEventListener('MSFullscreenChange', handleResize);
        
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