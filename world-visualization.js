// Hell's End Gate Capital - Enhanced with demonic architecture
const hellsGateGroup = new THREE.Group();
    
// Main circular base
const baseGeometry = new THREE.CylinderGeometry(25, 25, 5, 8);
const hellsGateMaterial = new THREE.MeshLambertMaterial({ color: 0xb22222 }); // Firebrick
const base = new THREE.Mesh(baseGeometry, hellsGateMaterial);
hellsGateGroup.add(base);

// Central fortress/castle
const centralTowerGeometry = new THREE.BoxGeometry(30, 25, 30);
const darkStoneMaterial = new THREE.MeshLambertMaterial({ color: 0x2f0000 }); // Very dark red
const centralTower = new THREE.Mesh(centralTowerGeometry, darkStoneMaterial);
centralTower.position.y = 15;
hellsGateGroup.add(centralTower);

// Dark tower spires at corners
const spirePositions = [
    { x: 12, z: 12 },
    { x: -12, z: 12 },
    { x: 12, z: -12 },
    { x: -12, z: -12 }
];

spirePositions.forEach((pos, i) => {
    const height = 35 + (i % 2) * 10;
    const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 5, height, 6),
        darkStoneMaterial
    );
    spire.position.set(pos.x, height/2 + 15, pos.z);
    hellsGateGroup.add(spire);
    
    // Add pointy top to each spire
    const spireTop = new THREE.Mesh(
        new THREE.ConeGeometry(3, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0x8b0000 }) // Dark red
    );
    spireTop.position.set(pos.x, height + 19, pos.z);
    hellsGateGroup.add(spireTop);
});

// Large central demonic spire
const centralSpire = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 8, 50, 6),
    new THREE.MeshLambertMaterial({ color: 0x8b0000 }) // Dark red
);
centralSpire.position.y = 40;
hellsGateGroup.add(centralSpire);

// Spire crown with fire
const spireCrown = new THREE.Mesh(
    new THREE.SphereGeometry(8, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xff4500 }) // Orange red
);
spireCrown.position.y = 65;
spireCrown.rotation.x = Math.PI;
hellsGateGroup.add(spireCrown);

// Add "horns" to the central spire
const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x330000 }); // Very dark red

const leftHorn = new THREE.Mesh(
    new THREE.ConeGeometry(3, 15, 6),
    hornMaterial
);
leftHorn.position.set(-6, 65, 0);
leftHorn.rotation.z = -Math.PI / 6;
hellsGateGroup.add(leftHorn);

const rightHorn = new THREE.Mesh(
    new THREE.ConeGeometry(3, 15, 6),
    hornMaterial
);
rightHorn.position.set(6, 65, 0);
rightHorn.rotation.z = Math.PI / 6;
hellsGateGroup.add(rightHorn);

// Add the great gate - a massive gateway into the mountain/fortress
const gateGeometry = new THREE.BoxGeometry(20, 15, 2);
const gateHole = new THREE.Mesh(
    new THREE.BoxGeometry(16, 10, 4),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
gateHole.position.z = 16;

const gateMaterial = new THREE.MeshLambertMaterial({ color: 0x800000 }); // Maroon
const gate = new THREE.Mesh(gateGeometry, gateMaterial);
gate.position.set(0, 10, 15);
hellsGateGroup.add(gate);

// Gate archway
const archGeometry = new THREE.TorusGeometry(10, 2, 8, 12, Math.PI);
const arch = new THREE.Mesh(archGeometry, gateMaterial);
arch.position.set(0, 16, 15);
arch.rotation.x = Math.PI / 2;
arch.rotation.y = Math.PI;
hellsGateGroup.add(arch);

// Black opening of the gate
const opening = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 10),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
opening.position.set(0, 10, 16);
hellsGateGroup.add(opening);

// Add braziers/fire pits around the base
const createFirePit = (x, z) => {
    const pit = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 3, 3, 8),
        new THREE.MeshLambertMaterial({ color: 0x333333 }) // Dark gray
    );
    pit.position.set(x, 1.5, z);
    hellsGateGroup.add(pit);
    
    // Fire
    const fire = new THREE.Mesh(
        new THREE.ConeGeometry(2, 6, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0xff6600, // Orange
            transparent: true,
            opacity: 0.9
        })
    );
    fire.position.set(x, 6, z);
    hellsGateGroup.add(fire);
    
    // Smoke
    const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(3, 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0x666666, // Gray
            transparent: true,
            opacity: 0.4
        })
    );
    smoke.position.set(x, 10, z);
    hellsGateGroup.add(smoke);
};

const pitPositions = [
    { x: 20, z: 0 },
    { x: 0, z: 20 },
    { x: -20, z: 0 },
    { x: 0, z: -20 },
    { x: 16, z: 16 },
    { x: -16, z: 16 },
    { x: 16, z: -16 },
    { x: -16, z: -16 }
];

pitPositions.forEach(pos => createFirePit(pos.x, pos.z));

// Add wall around the perimeter
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x400000 }); // Dark red

for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const radius = 23;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Wall segment
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(6, 10, 2),
        wallMaterial
    );
    
    // Position and rotate to face outward
    wall.position.set(x, 5, z);
    wall.rotation.y = angle;
    
    hellsGateGroup.add(wall);
    
    // Add battlements on top
    if (i % 2 === 0) {
        const battlement = new THREE.Mesh(
            new THREE.BoxGeometry(6, 3, 3),
            wallMaterial
        );
        battlement.position.set(x, 11.5, z);
        battlement.rotation.y = angle;
        hellsGateGroup.add(battlement);
    }
}

hellsGateGroup.position.set(-150, 20, 0);
scene.add(hellsGateGroup);
createLabel(hellsGateGroup, "Hell's End Gate", 0xb22222);    // Atlantis (underwater city) - Enhanced with domes and structures
const atlantisGroup = new THREE.Group();

// Main central dome - larger and more detailed
const centralDomeGeometry = new THREE.DodecahedronGeometry(25, 1);
const atlantisMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x40e0d0, // Turquoise
    transparent: true,
    opacity: 0.7
});
const centralDome = new THREE.Mesh(centralDomeGeometry, atlantisMaterial);
atlantisGroup.add(centralDome);

// Additional surrounding domes of varying sizes
const domePositions = [
    { x: -30, z: 0, size: 15 },
    { x: 30, z: 10, size: 18 },
    { x: 0, z: 35, size: 20 },
    { x: -25, z: -30, size: 12 },
    { x: 25, z: -20, size: 14 }
];

domePositions.forEach(dome => {
    const domeGeometry = new THREE.SphereGeometry(dome.size, 16, 16);
    const domeMesh = new THREE.Mesh(domeGeometry, atlantisMaterial);
    domeMesh.position.set(dome.x, 0, dome.z);
    atlantisGroup.add(domeMesh);
});

// Create connecting tunnels between domes
const tunnelMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x48d1cc, // Medium turquoise
    transparent: true,
    opacity: 0.6
});

// Connect central dome to all surrounding domes
domePositions.forEach(dome => {
    const distance = Math.sqrt(dome.x * dome.x + dome.z * dome.z);
    const angle = Math.atan2(dome.z, dome.x);
    
    const tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, distance, 8, 1, true),
        tunnelMaterial
    );
    
    // Position at midpoint and rotate to connect the domes
    tunnel.position.set(dome.x / 2, 0, dome.z / 2);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = -angle;
    
    atlantisGroup.add(tunnel);
});

// Also connect some peripheral domes to each other
for (let i = 0; i < domePositions.length - 1; i++) {
    const dome1 = domePositions[i];
    const dome2 = domePositions[i+1];
    
    const dx = dome2.x - dome1.x;
    const dz = dome2.z - dome1.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    
    const tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, distance, 8, 1, true),
        tunnelMaterial
    );
    
    tunnel.position.set(
        (dome1.x + dome2.x) / 2,
        0,
        (dome1.z + dome2.z) / 2
    );
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = -angle;
    
    atlantisGroup.add(tunnel);
}

// Add architectural spires and towers within the main dome
const spireMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x7fffd4, // Aquamarine
    transparent: true,
    opacity: 0.8
});

for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const radius = 12;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const height = 20 + Math.random() * 15;
    
    const spire = new THREE.Mesh(
        new THREE.ConeGeometry(2, height, 6),
        spireMaterial
    );
    spire.position.set(x, height/2, z);
    atlantisGroup.add(spire);
}

// Add a large central tower in the main dome
const centralTower = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 8, 40, 8),
    spireMaterial
);
centralTower.position.y = 20;
atlantisGroup.add(centralTower);

// Add orb at the top of the central tower
const orb = new THREE.Mesh(
    new THREE.SphereGeometry(5, 16, 16),
    new THREE.MeshLambertMaterial({ 
        color: 0x00ffff, // Cyan
        transparent: true,
        opacity: 0.9
    })
);
orb.position.y = 42.5;
atlantisGroup.add(orb);

// Add underwater vegetation and coral
const coralMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xff7f50, // Coral
    transparent: true,
    opacity: 0.9
});

for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Create different shapes for underwater flora
    let coral;
    const shapeType = Math.floor(Math.random() * 3);
    
    if (shapeType === 0) {
        // Coral branch
        coral = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 1, 5 + Math.random() * 5, 5),
            new THREE.MeshLambertMaterial({ 
                color: 0xff6347, // Tomato
                transparent: true,
                opacity: 0.9
            })
        );
    } else if (shapeType === 1) {
        // Seaweed
        coral = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 8 + Math.random() * 7, 0.5),
            new THREE.MeshLambertMaterial({ 
                color: 0x32cd32, // Lime green
                transparent: true,
                opacity: 0.8
            })
        );
        coral.rotation.x = (Math.random() - 0.5) * 0.5;
        coral.rotation.z = (Math.random() - 0.5) * 0.5;
    } else {
        // Brain coral
        coral = new THREE.Mesh(
            new THREE.SphereGeometry(1 + Math.random() * 2, 8, 8),
            coralMaterial
        );
    }
    
    coral.position.set(x, -10, z);
    atlantisGroup.add(coral);
}

// Add bubbles rising from the city
for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 40;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.random() * 40 - 20;
    
    const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random(), 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        })
    );
    bubble.position.set(x, y, z);
    atlantisGroup.add(bubble);
}

atlantisGroup.position.set(0, -50, 45);
scene.add(atlantisGroup);
createLabel(atlantisGroup, "Atlantis", 0x40e0d0);// World Visualization
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

// EASTERN CONTINENT - Enhanced with irregular shape
const eastContinentGroup = new THREE.Group();

// Main landmass
const mainLandGeometry = new THREE.BoxGeometry(140, 12, 180);
const eastContinentMaterial = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 });
const mainLand = new THREE.Mesh(mainLandGeometry, eastContinentMaterial);
eastContinentGroup.add(mainLand);

// Coastal features - small peninsulas and bays
const coastalFeature1 = new THREE.Mesh(
    new THREE.BoxGeometry(30, 10, 40),
    eastContinentMaterial
);
coastalFeature1.position.set(-60, 0, 70);
coastalFeature1.rotation.y = Math.PI / 6;
eastContinentGroup.add(coastalFeature1);

const coastalFeature2 = new THREE.Mesh(
    new THREE.BoxGeometry(25, 14, 50),
    eastContinentMaterial
);
coastalFeature2.position.set(-65, 0, -60);
coastalFeature2.rotation.y = -Math.PI / 8;
eastContinentGroup.add(coastalFeature2);

// Mountain ranges
const mountainRangeGeometry = new THREE.ConeGeometry(25, 30, 5);
const mountainRangeMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const mountainRange = new THREE.Mesh(mountainRangeGeometry, mountainRangeMaterial);
mountainRange.position.set(10, 15, -30);
mountainRange.scale.set(2, 1, 1);
eastContinentGroup.add(mountainRange);

eastContinentGroup.position.set(130, 6, 0);
scene.add(eastContinentGroup);
createLabel(eastContinentGroup, "Eastern Continent", 0xa9a9a9);

// EASTERN REGIONS
// Vertical Farm Region (north east) - Enhanced with vertical farm towers
const verticalFarmGroup = new THREE.Group();

// Base land area
const farmBaseGeometry = new THREE.BoxGeometry(60, 10, 60);
const verticalFarmMaterial = new THREE.MeshLambertMaterial({ color: 0x7cfc00 }); // Light green
const farmBase = new THREE.Mesh(farmBaseGeometry, verticalFarmMaterial);
verticalFarmGroup.add(farmBase);

// Add multiple vertical farm towers
const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x32cd32 }); // Lime green
const towerPositions = [
    [-15, 0, -15], [15, 0, -15], [0, 0, 0], 
    [-15, 0, 15], [15, 0, 15]
];

towerPositions.forEach((pos, i) => {
    const height = 20 + Math.random() * 10;
    const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, height, 8),
        towerMaterial
    );
    tower.position.set(pos[0], height/2 + 5, pos[1]);
    verticalFarmGroup.add(tower);
    
    // Add connecting elements between towers
    if (i > 0) {
        const connector = new THREE.Mesh(
            new THREE.BoxGeometry(Math.abs(pos[0] - towerPositions[i-1][0]) || 2, 
                                  2, 
                                  Math.abs(pos[1] - towerPositions[i-1][1]) || 2),
            towerMaterial
        );
        connector.position.set(
            (pos[0] + towerPositions[i-1][0])/2,
            15,
            (pos[1] + towerPositions[i-1][1])/2
        );
        verticalFarmGroup.add(connector);
    }
});

verticalFarmGroup.position.set(110, 8.5, -60);
scene.add(verticalFarmGroup);
createLabel(verticalFarmGroup, "Vertical Farm Region", 0x7cfc00);

// Industrial Area (due east) - Enhanced with factory buildings and smokestacks
const industrialGroup = new THREE.Group();

// Base platform
const industrialBaseGeometry = new THREE.BoxGeometry(60, 8, 70);
const industrialAreaMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate gray
const industrialBase = new THREE.Mesh(industrialBaseGeometry, industrialAreaMaterial);
industrialGroup.add(industrialBase);

// Factory buildings
const factoryMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });

// Main factory complex
const mainFactory = new THREE.Mesh(
    new THREE.BoxGeometry(30, 15, 40),
    factoryMaterial
);
mainFactory.position.set(-10, 11.5, 0);
industrialGroup.add(mainFactory);

// Add factory roof
const roofGeometry = new THREE.CylinderGeometry(0, 20, 10, 4);
const roof = new THREE.Mesh(roofGeometry, factoryMaterial);
roof.rotation.y = Math.PI / 4;
roof.position.set(-10, 24, 0);
industrialGroup.add(roof);

// Smokestacks
const createSmokestack = (x, z, height, radius) => {
    const stack = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius * 1.2, height, 8),
        new THREE.MeshLambertMaterial({ color: 0x8b0000 }) // Dark red
    );
    stack.position.set(x, height/2 + 8, z);
    industrialGroup.add(stack);
    
    // Add smoke effect at top
    const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.5, 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa, 
            transparent: true, 
            opacity: 0.6 
        })
    );
    smoke.position.set(x, height + 10, z);
    industrialGroup.add(smoke);
};

createSmokestack(10, -15, 25, 2);
createSmokestack(15, 15, 30, 2.5);
createSmokestack(-15, -20, 20, 2);

// Storage tanks
const tankMaterial = new THREE.MeshLambertMaterial({ color: 0xb0c4de }); // Light steel blue

for (let i = 0; i < 3; i++) {
    const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, 12, 12),
        tankMaterial
    );
    tank.position.set(20, 6, -20 + i * 15);
    industrialGroup.add(tank);
}

industrialGroup.position.set(150, 11, 0);
scene.add(industrialGroup);
createLabel(industrialGroup, "Industrial Area", 0x708090);

// Seaside Capital City - Enhanced with city buildings and port features
const capitalGroup = new THREE.Group();

// Base platform
const capitalBaseGeometry = new THREE.CylinderGeometry(25, 30, 5, 8);
const seasideCapitalMaterial = new THREE.MeshLambertMaterial({ color: 0xdaa520 }); // Goldenrod
const capitalBase = new THREE.Mesh(capitalBaseGeometry, seasideCapitalMaterial);
capitalGroup.add(capitalBase);

// City center - central tall building
const centerTowerGeometry = new THREE.CylinderGeometry(5, 7, 35, 6);
const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5dc }); // Beige
const centerTower = new THREE.Mesh(centerTowerGeometry, buildingMaterial);
centerTower.position.y = 20;
capitalGroup.add(centerTower);

// Surrounding buildings
const buildingCount = 12;
const radius = 15;

for (let i = 0; i < buildingCount; i++) {
    const angle = (i / buildingCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Random height between 10 and 20
    const height = 10 + Math.random() * 10;
    
    // Alternate between rectangular and cylindrical buildings
    let building;
    if (i % 2 === 0) {
        building = new THREE.Mesh(
            new THREE.BoxGeometry(6, height, 6),
            buildingMaterial
        );
    } else {
        building = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3, height, 6),
            buildingMaterial
        );
    }
    
    building.position.set(x, height/2 + 2.5, z);
    building.rotation.y = angle;
    capitalGroup.add(building);
}

// Harbor/port extension
const harborGeometry = new THREE.BoxGeometry(30, 3, 15);
const harborMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c }); // Tan
const harbor = new THREE.Mesh(harborGeometry, harborMaterial);
harbor.position.set(0, 1.5, 35);
capitalGroup.add(harbor);

// Harbor cranes
const craneMaterial = new THREE.MeshLambertMaterial({ color: 0x4682b4 }); // Steel blue

const createCrane = (x, z) => {
    const craneBase = new THREE.Mesh(
        new THREE.BoxGeometry(3, 18, 3),
        craneMaterial
    );
    craneBase.position.set(x, 9, z);
    
    const craneArm = new THREE.Mesh(
        new THREE.BoxGeometry(12, 2, 2),
        craneMaterial
    );
    craneArm.position.set(x + 6, 18, z);
    
    capitalGroup.add(craneBase);
    capitalGroup.add(craneArm);
};

createCrane(-8, 35);
createCrane(8, 35);

// Lighthouse
const lighthouse = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 3, 20, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
);
lighthouse.position.set(20, 10, 25);
capitalGroup.add(lighthouse);

// Lighthouse top
const lighthouseTop = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 3, 8),
    new THREE.MeshLambertMaterial({ color: 0xff4500 }) // Orange red
);
lighthouseTop.position.set(20, 21.5, 25);
capitalGroup.add(lighthouseTop);

capitalGroup.position.set(100, 16, 60);
scene.add(capitalGroup);
createLabel(capitalGroup, "Seaside Capital", 0xdaa520);

// Sky Palace (floating above seaside capital) - Enhanced with elegant architecture
const skyPalaceGroup = new THREE.Group();

// Main floating platform
const skyBaseMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x00ffff, // Cyan
    transparent: true,
    opacity: 0.9
});

// Create more complex base with layers
const skyBaseBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(22, 25, 5, 8),
    skyBaseMaterial
);
skyPalaceGroup.add(skyBaseBottom);

const skyBaseMiddle = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 22, 4, 8),
    skyBaseMaterial
);
skyBaseMiddle.position.y = 4.5;
skyPalaceGroup.add(skyBaseMiddle);

const skyBaseTop = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 20, 3, 8),
    skyBaseMaterial
);
skyBaseTop.position.y = 8;
skyPalaceGroup.add(skyBaseTop);

// Central tower
const centralTowerMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xafeeee, // Pale turquoise
    transparent: true,
    opacity: 0.9
});

const centralTower = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 8, 25, 6),
    centralTowerMaterial
);
centralTower.position.y = 22;
skyPalaceGroup.add(centralTower);

// Tower top - crystal-like structure
const towerTop = new THREE.Mesh(
    new THREE.OctahedronGeometry(6, 1),
    new THREE.MeshLambertMaterial({ 
        color: 0xe0ffff, // Light cyan
        transparent: true,
        opacity: 0.7
    })
);
towerTop.position.y = 37;
towerTop.rotation.y = Math.PI / 4;
skyPalaceGroup.add(towerTop);

// Surrounding smaller towers
const smallTowerPositions = [
    [10, 0, 0], [7, 0, 7], [0, 0, 10], 
    [-7, 0, 7], [-10, 0, 0], [-7, 0, -7], 
    [0, 0, -10], [7, 0, -7]
];

smallTowerPositions.forEach((pos, i) => {
    const height = 12 + (i % 3) * 2;
    const smallTower = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, height, 5),
        centralTowerMaterial
    );
    smallTower.position.set(pos[0], height/2 + 9.5, pos[1]);
    skyPalaceGroup.add(smallTower);
    
    // Add spire to each small tower
    const spire = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 4, 5),
        new THREE.MeshLambertMaterial({ color: 0xb0e0e6 }) // Powder blue
    );
    spire.position.set(pos[0], height + 11.5, pos[1]);
    skyPalaceGroup.add(spire);
});

// Connecting bridges between towers
const bridgeMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xe0ffff, // Light cyan
    transparent: true,
    opacity: 0.7
});

for (let i = 0; i < smallTowerPositions.length; i++) {
    const nextIdx = (i + 1) % smallTowerPositions.length;
    const pos = smallTowerPositions[i];
    const nextPos = smallTowerPositions[nextIdx];
    
    const dx = nextPos[0] - pos[0];
    const dz = nextPos[1] - pos[1];
    const distance = Math.sqrt(dx*dx + dz*dz);
    const angle = Math.atan2(dz, dx);
    
    const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(distance, 1, 1.5),
        bridgeMaterial
    );
    bridge.position.set(
        (pos[0] + nextPos[0])/2,
        13,
        (pos[1] + nextPos[1])/2
    );
    bridge.rotation.y = angle;
    skyPalaceGroup.add(bridge);
}

// Add central bridge to main tower
for (let i = 0; i < smallTowerPositions.length; i += 2) {
    const pos = smallTowerPositions[i];
    const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1]), 1, 1.5),
        bridgeMaterial
    );
    bridge.position.set(pos[0]/2, 16, pos[1]/2);
    bridge.rotation.y = Math.atan2(pos[1], pos[0]);
    skyPalaceGroup.add(bridge);
}

// Cloud-like effects around the base
for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 25 + Math.random() * 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(5 + Math.random() * 3, 8, 8),
        new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        })
    );
    cloud.position.set(x, -2 - Math.random() * 3, z);
    skyPalaceGroup.add(cloud);
}

skyPalaceGroup.position.set(100, 80, 60);
scene.add(skyPalaceGroup);
createLabel(skyPalaceGroup, "Sky Palace", 0x00ffff);

// Space Farms (highest layer) - Enhanced with orbital modules and farm structures
const spaceFarmsGroup = new THREE.Group();

// Main orbital ring
const ringGeometry = new THREE.TorusGeometry(80, 3, 16, 50);
const spaceFarmsMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xadd8e6, // Light blue
    transparent: true,
    opacity: 0.7
});
const mainRing = new THREE.Mesh(ringGeometry, spaceFarmsMaterial);
spaceFarmsGroup.add(mainRing);

// Secondary support rings
const smallerRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(75, 2, 16, 40),
    spaceFarmsMaterial
);
smallerRing1.rotation.x = Math.PI / 6;
spaceFarmsGroup.add(smallerRing1);

const smallerRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(85, 2, 16, 40),
    spaceFarmsMaterial
);
smallerRing2.rotation.x = -Math.PI / 6;
spaceFarmsGroup.add(smallerRing2);

// Add farm modules along the main ring
const moduleMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x98fb98, // Pale green
    transparent: true,
    opacity: 0.8
});

const panelMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x4169e1, // Royal blue for solar panels
    transparent: true,
    opacity: 0.9
});

// Create modules around the ring
for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = Math.cos(angle) * 80;
    const z = Math.sin(angle) * 80;
    
    // Farm module - cylindrical greenhouse
    const farmModule = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 6, 15, 8),
        moduleMaterial
    );
    
    farmModule.position.set(x, 0, z);
    farmModule.rotation.z = angle;
    farmModule.rotation.x = Math.PI / 2;
    spaceFarmsGroup.add(farmModule);
    
    // Solar panel arrays extending from modules
    const panel1 = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.5, 18),
        panelMaterial
    );
    panel1.position.set(x + Math.cos(angle) * 12, Math.sin(angle) * 12, z + Math.sin(angle) * 12);
    panel1.rotation.z = angle;
    panel1.rotation.x = Math.PI / 2;
    spaceFarmsGroup.add(panel1);
    
    // Add a connector between module and solar panel
    const connector = new THREE.Mesh(
        new THREE.BoxGeometry(6, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0xc0c0c0 }) // Silver
    );
    connector.position.set(x + Math.cos(angle) * 9, Math.sin(angle) * 9, z + Math.sin(angle) * 9);
    connector.rotation.z = angle;
    connector.rotation.x = Math.PI / 2;
    spaceFarmsGroup.add(connector);
    
    // Every third module gets an additional structure
    if (i % 3 === 0) {
        const specialModule = new THREE.Mesh(
            new THREE.SphereGeometry(8, 8, 8),
            new THREE.MeshLambertMaterial({ 
                color: 0xe6e6fa, // Lavender
                transparent: true,
                opacity: 0.8
            })
        );
        specialModule.position.set(x, 0, z);
        spaceFarmsGroup.add(specialModule);
        
        // Add defensive turret or communication antenna
        const antenna = new THREE.Mesh(
            new THREE.ConeGeometry(1, 12, 4),
            new THREE.MeshLambertMaterial({ color: 0xffd700 }) // Gold
        );
        antenna.position.set(x, 10, z);
        spaceFarmsGroup.add(antenna);
    }
}

// Central hub
const hub = new THREE.Mesh(
    new THREE.SphereGeometry(15, 16, 16),
    new THREE.MeshLambertMaterial({ 
        color: 0xf0f8ff, // Alice blue
        transparent: true,
        opacity: 0.9
    })
);
spaceFarmsGroup.add(hub);

// Spokes connecting hub to ring
for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 65, 8),
        new THREE.MeshLambertMaterial({ color: 0xc0c0c0 }) // Silver
    );
    spoke.position.x = Math.cos(angle) * 40;
    spoke.position.z = Math.sin(angle) * 40;
    spoke.rotation.z = Math.PI / 2;
    spoke.rotation.y = angle;
    spaceFarmsGroup.add(spoke);
}

spaceFarmsGroup.position.set(120, 140, 0);
spaceFarmsGroup.rotation.x = Math.PI / 3;
scene.add(spaceFarmsGroup);
createLabel(spaceFarmsGroup, "Space Farms", 0xadd8e6);

// Eastern Mines (under industrial area) - Enhanced with excavation features
const mineGroup = new THREE.Group();

// Main mine chamber - wireframe sphere
const mainChamberGeometry = new THREE.SphereGeometry(25, 12, 12);
const mineMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x696969, // Dim gray
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const mainChamber = new THREE.Mesh(mainChamberGeometry, mineMaterial);
mineGroup.add(mainChamber);

// Add mining tunnels radiating from the main chamber
const tunnelCount = 8;
for (let i = 0; i < tunnelCount; i++) {
    const angle = (i / tunnelCount) * Math.PI * 2;
    const length = 20 + Math.random() * 30;
    
    const x = Math.cos(angle) * length;
    const z = Math.sin(angle) * length;
    const y = (Math.random() - 0.5) * 20;
    
    const tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, length, 8, 1, true),
        mineMaterial
    );
    
    // Position tunnel to point outward from center
    tunnel.position.set(x/2, y, z/2);
    tunnel.rotation.z = Math.PI/2;
    tunnel.rotation.y = angle;
    
    mineGroup.add(tunnel);
    
    // Add smaller chambers at end of some tunnels
    if (i % 2 === 0) {
        const endChamber = new THREE.Mesh(
            new THREE.SphereGeometry(8, 8, 8),
            mineMaterial
        );
        endChamber.position.set(x, y, z);
        mineGroup.add(endChamber);
    }
}

// Add ore veins throughout the mine
const oreMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffd700, // Gold
    transparent: true,
    opacity: 0.8
});

for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 25;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 20;
    
    const vein = new THREE.Mesh(
        new THREE.BoxGeometry(1 + Math.random() * 3, 1 + Math.random() * 3, 1 + Math.random() * 3),
        oreMaterial
    );
    vein.position.set(x, y, z);
    vein.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mineGroup.add(vein);
}

// Add supports/structures
const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Saddle brown

for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const radius = 15;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Vertical support beam
    const support = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 40, 6),
        supportMaterial
    );
    support.position.set(x, 0, z);
    mineGroup.add(support);
    
    // Horizontal cross-beams
    const crossBeam1 = new THREE.Mesh(
        new THREE.BoxGeometry(radius, 1, 1),
        supportMaterial
    );
    crossBeam1.position.set(x/2, 10, z/2);
    crossBeam1.rotation.y = angle;
    mineGroup.add(crossBeam1);
    
    const crossBeam2 = new THREE.Mesh(
        new THREE.BoxGeometry(radius, 1, 1),
        supportMaterial
    );
    crossBeam2.position.set(x/2, -10, z/2);
    crossBeam2.rotation.y = angle;
    mineGroup.add(crossBeam2);
}

// Add mining equipment
const equipmentMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate gray

// Mine cart tracks
const tracks = new THREE.Mesh(
    new THREE.BoxGeometry(40, 0.5, 2),
    equipmentMaterial
);
tracks.position.set(10, -15, 0);
mineGroup.add(tracks);

// Mine cart
const cart = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3, 4),
    equipmentMaterial
);
cart.position.set(20, -13, 0);
mineGroup.add(cart);

// Add wheel shapes to the cart
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gray
const wheelPositions = [
    { x: 22, z: 1.5 },
    { x: 22, z: -1.5 },
    { x: 18, z: 1.5 },
    { x: 18, z: -1.5 }
];

wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.5, 8),
        wheelMaterial
    );
    wheel.position.set(pos.x, -14.5, pos.z);
    wheel.rotation.z = Math.PI/2;
    mineGroup.add(wheel);
});

// Drilling equipment
const drill = new THREE.Mesh(
    new THREE.ConeGeometry(2, 8, 8),
    wheelMaterial
);
drill.position.set(-20, 0, -15);
drill.rotation.z = Math.PI/2;
mineGroup.add(drill);

// Support pole for drill
const drillSupport = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 15, 6),
    equipmentMaterial
);
drillSupport.position.set(-20, -7.5, -15);
mineGroup.add(drillSupport);

mineGroup.position.set(150, -25, 0);
scene.add(mineGroup);
createLabel(mineGroup, "Eastern Mines", 0x696969);

// Sewers (under seaside capital) - Enhanced with mutant flora and fauna features
const sewerGroup = new THREE.Group();

// Main sewer chamber
const sewerGeometry = new THREE.CylinderGeometry(20, 25, 10, 8, 1, true);
const sewerMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x556b2f, // Dark olive green
    wireframe: true,
    transparent: true,
    opacity: 0.5
});
const sewer = new THREE.Mesh(sewerGeometry, sewerMaterial);
sewerGroup.add(sewer);

// Add sewer tunnels radiating from the central chamber
const tunnelCount = 6;
for (let i = 0; i < tunnelCount; i++) {
    const angle = (i / tunnelCount) * Math.PI * 2;
    const x = Math.cos(angle) * 30;
    const z = Math.sin(angle) * 30;
    
    const tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 35, 8, 1, true),
        sewerMaterial
    );
    
    tunnel.position.set(x/2, 0, z/2);
    tunnel.rotation.z = Math.PI/2;
    tunnel.rotation.y = angle;
    
    sewerGroup.add(tunnel);
}

// Add water/sewage at the bottom
const waterGeometry = new THREE.CircleGeometry(22, 32);
const waterMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x3d5229, // Murky green
    transparent: true,
    opacity: 0.8
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.position.y = -4;
water.rotation.x = -Math.PI / 2;
sewerGroup.add(water);

// Add mutant flora - strange plants growing from water and walls
const createMutantPlant = (x, z, size, type) => {
    let plant;
    
    if (type === 'tentacle') {
        // Long tentacle-like plant
        plant = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5 * size, 0.3 * size, 6 * size, 8),
            new THREE.MeshLambertMaterial({ color: 0x9acd32 }) // Yellow green
        );
        plant.rotation.x = Math.random() * 0.5;
        plant.rotation.z = Math.random() * 0.5;
    } else if (type === 'bulb') {
        // Bulbous plant with glowing pods
        plant = new THREE.Group();
        
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3 * size, 0.5 * size, 3 * size, 8),
            new THREE.MeshLambertMaterial({ color: 0x6b8e23 }) // Olive drab
        );
        plant.add(stem);
        
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(1 * size, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0xadff2f, // Green yellow
                transparent: true,
                opacity: 0.9
            })
        );
        bulb.position.y = 2 * size;
        plant.add(bulb);
    } else {
        // Fungal growth
        plant = new THREE.Mesh(
            new THREE.SphereGeometry(1 * size, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshLambertMaterial({ color: 0x8fbc8f }) // Dark sea green
        );
        plant.rotation.x = Math.PI;
    }
    
    plant.position.set(x, -4, z);
    sewerGroup.add(plant);
};

// Add various plants around the sewer
for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const type = ['tentacle', 'bulb', 'fungal'][Math.floor(Math.random() * 3)];
    const size = 0.8 + Math.random() * 1.5;
    
    createMutantPlant(x, z, size, type);
}

// Add mutant creatures - only silhouettes visible in the murky water
const creatureMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x004d00, // Very dark green
    transparent: true,
    opacity: 0.7
});

// Add a large creature silhouette moving through water
const largeCreature = new THREE.Mesh(
    new THREE.SphereGeometry(4, 8, 8),
    creatureMaterial
);
largeCreature.position.set(5, -2, 8);
sewerGroup.add(largeCreature);

// Creature tentacle/appendage
const tentacle1 = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 0.5, 8, 8),
    creatureMaterial
);
tentacle1.position.set(10, -2, 12);
tentacle1.rotation.z = Math.PI / 3;
tentacle1.rotation.y = Math.PI / 4;
sewerGroup.add(tentacle1);

const tentacle2 = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 0.5, 7, 8),
    creatureMaterial
);
tentacle2.position.set(8, -2, 3);
tentacle2.rotation.z = Math.PI / 2.5;
tentacle2.rotation.y = -Math.PI / 6;
sewerGroup.add(tentacle2);

// Add smaller creatures
for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 15;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const creature = new THREE.Mesh(
        new THREE.SphereGeometry(1 + Math.random(), 8, 8),
        creatureMaterial
    );
    creature.position.set(x, -3, z);
    sewerGroup.add(creature);
}

// Add industrial waste barrels
const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0xb22222 }); // Firebrick

for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 10;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 4, 8),
        barrelMaterial
    );
    barrel.position.set(x, -2, z);
    barrel.rotation.x = Math.random() - 0.5;
    barrel.rotation.z = Math.random() - 0.5;
    sewerGroup.add(barrel);
    
    // Add glowing waste spill from some barrels
    if (Math.random() > 0.6) {
        const spill = new THREE.Mesh(
            new THREE.CircleGeometry(3 + Math.random() * 2, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0x39ff14, // Neon green
                transparent: true,
                opacity: 0.7
            })
        );
        spill.position.set(x, -3.9, z);
        spill.rotation.x = -Math.PI / 2;
        sewerGroup.add(spill);
    }
}

// Add some pipes on the walls
const pipeMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Saddle brown for rusty pipes

for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 20;
    const z = Math.sin(angle) * 20;
    
    const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 10, 8),
        pipeMaterial
    );
    pipe.position.set(x, 0, z);
    pipe.rotation.z = Math.PI / 2;
    pipe.rotation.y = angle;
    sewerGroup.add(pipe);
    
    // Add valve or joint to some pipes
    if (i % 2 === 0) {
        const valve = new THREE.Mesh(
            new THREE.TorusGeometry(2, 0.5, 8, 16),
            pipeMaterial
        );
        valve.position.set(x, 0, z);
        valve.rotation.x = Math.PI / 2;
        sewerGroup.add(valve);
    }
}

sewerGroup.position.set(100, -15, 60);
scene.add(sewerGroup);
createLabel(sewerGroup, "Mutant Sewers", 0x556b2f);

// CENTRAL ISLANDS
// Magic Islands Capital - Enhanced with magical architecture
const magicIslandGroup = new THREE.Group();

// Main island base
const islandBaseGeometry = new THREE.CylinderGeometry(35, 40, 8, 8);
const magicIslandMaterial = new THREE.MeshLambertMaterial({ color: 0x9932cc }); // Dark orchid
const islandBase = new THREE.Mesh(islandBaseGeometry, magicIslandMaterial);
magicIslandGroup.add(islandBase);

// Central magical dome/crystal
const centralDome = new THREE.Mesh(
    new THREE.SphereGeometry(15, 16, 16),
    new THREE.MeshLambertMaterial({ 
        color: 0xda70d6, // Orchid
        transparent: true,
        opacity: 0.8
    })
);
centralDome.position.y = 15;
magicIslandGroup.add(centralDome);

// Crystal spires arranged in a circle
const spireCount = 7;
const spireRadius = 25;

for (let i = 0; i < spireCount; i++) {
    const angle = (i / spireCount) * Math.PI * 2;
    const x = Math.cos(angle) * spireRadius;
    const z = Math.sin(angle) * spireRadius;
    
    // Height varies for each spire
    const height = 15 + (i % 3) * 5;
    
    // Create crystal spire
    const spire = new THREE.Mesh(
        new THREE.ConeGeometry(3, height, 5),
        new THREE.MeshLambertMaterial({ 
            color: 0xba55d3, // Medium orchid
            transparent: true,
            opacity: 0.9
        })
    );
    spire.position.set(x, height/2 + 4, z);
    magicIslandGroup.add(spire);
    
    // Add glowing orb at top of every other spire
    if (i % 2 === 0) {
        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(2, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0xee82ee, // Violet
                transparent: true,
                opacity: 0.9
            })
        );
        orb.position.set(x, height + 4, z);
        magicIslandGroup.add(orb);
    }
}

// Magical swirling patterns on the base
const swirls = new THREE.Mesh(
    new THREE.TorusKnotGeometry(38, 1, 100, 16),
    new THREE.MeshBasicMaterial({ 
        color: 0xdda0dd, // Plum
        transparent: true,
        opacity: 0.6
    })
);
swirls.position.y = 4.5;
swirls.rotation.x = Math.PI / 2;
magicIslandGroup.add(swirls);

// Floating crystal fragments around the central dome
for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const height = 15 + Math.sin(i * 0.5) * 8;
    const radius = 12 + Math.cos(i * 0.7) * 5;
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const fragment = new THREE.Mesh(
        new THREE.TetrahedronGeometry(1.5 + Math.random(), 0),
        new THREE.MeshLambertMaterial({ 
            color: 0xe6e6fa, // Lavender
            transparent: true,
            opacity: 0.8
        })
    );
    fragment.position.set(x, height, z);
    fragment.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    magicIslandGroup.add(fragment);
}

magicIslandGroup.position.set(0, 7.5, 0);
scene.add(magicIslandGroup);
createLabel(magicIslandGroup, "Magic Islands Capital", 0x9932cc);

// Moon Palace (floating above magic islands) - Enhanced with lunar aesthetic
const moonPalaceGroup = new THREE.Group();

// Main floating platform - crescent moon shape
const moonPalaceMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xc39bd3, // Lavender
    transparent: true,
    opacity: 0.9
});

// Create a makeshift crescent moon shape using intersection of spheres
const sphereGeom1 = new THREE.SphereGeometry(24, 24, 24);
const sphereGeom2 = new THREE.SphereGeometry(22, 24, 24);

const sphere1 = new THREE.Mesh(sphereGeom1, moonPalaceMaterial);
sphere1.position.x = 0;

const sphere2 = new THREE.Mesh(sphereGeom2, moonPalaceMaterial);
sphere2.position.x = 8;

// Use CSG operations to create crescent
const moonGeometry = new THREE.CylinderGeometry(24, 24, 12, 32, 1, false, 0, Math.PI * 1.5);
const moonPlatform = new THREE.Mesh(moonGeometry, moonPalaceMaterial);
moonPlatform.rotation.y = Math.PI * 0.25;
moonPalaceGroup.add(moonPlatform);

// Central dome - observatory
const domeMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xe6e6fa, // Lavender
    transparent: true,
    opacity: 0.8
});

const centralDome = new THREE.Mesh(
    new THREE.SphereGeometry(12, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    domeMaterial
);
centralDome.position.y = 6;
moonPalaceGroup.add(centralDome);

// Observatory telescope
const telescopeMaterial = new THREE.MeshLambertMaterial({ color: 0x4b0082 }); // Indigo

const telescopeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 4, 3, 8),
    telescopeMaterial
);
telescopeBase.position.y = 9;
moonPalaceGroup.add(telescopeBase);

const telescopeTube = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 10, 8),
    telescopeMaterial
);
telescopeTube.position.set(5, 13, 0);
telescopeTube.rotation.z = Math.PI * 0.25;
moonPalaceGroup.add(telescopeTube);

// Towers around the perimeter - at cardinal directions
const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xd8bfd8 }); // Thistle

const createTower = (x, z, height) => {
    const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, height, 6),
        towerMaterial
    );
    tower.position.set(x, height/2 + 6, z);
    moonPalaceGroup.add(tower);
    
    // Add tower cap
    const cap = new THREE.Mesh(
        new THREE.ConeGeometry(2.5, 4, 6),
        new THREE.MeshLambertMaterial({ color: 0xb19cd9 }) // Light purple
    );
    cap.position.set(x, height + 8, z);
    moonPalaceGroup.add(cap);
};

createTower(0, -18, 12);
createTower(18, 0, 14);
createTower(0, 18, 12);
createTower(-18, 0, 14);

// Magical lunar glow effect - particles around the palace
for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 24 + Math.random() * 10;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 20;
    
    const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.7 + Math.random() * 0.7, 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.5 + Math.random() * 0.5
        })
    );
    particle.position.set(x, y, z);
    moonPalaceGroup.add(particle);
}

// Stairs cascading from the main platform edge
const stairsMaterial = new THREE.MeshLambertMaterial({ color: 0xdcd0ff }); // Very light purple

for (let i = 0; i < 5; i++) {
    const step = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1, 4),
        stairsMaterial
    );
    step.position.set(12 + i * 3, -i * 1.5, 0);
    moonPalaceGroup.add(step);
}

moonPalaceGroup.position.set(0, 80, 0);
scene.add(moonPalaceGroup);
createLabel(moonPalaceGroup, "Moon Palace", 0xc39bd3);

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

// Smugglers Island (to the south) - Enhanced with smuggler hideouts and ships
const smugglersGroup = new THREE.Group();

// Main island base with more irregular shape
const smugglersIslandMaterial = new THREE.MeshLambertMaterial({ color: 0xcd853f }); // Peru
const mainIsland = new THREE.Mesh(
    new THREE.CylinderGeometry(25, 30, 6, 8, 1, false),
    smugglersIslandMaterial
);
smugglersGroup.add(mainIsland);

// Additional terrain features - rocky outcroppings
const rocks = [
    { x: 15, z: 5, scale: 0.7 },
    { x: -12, z: 10, scale: 0.8 },
    { x: 0, z: -20, scale: 1 },
    { x: -18, z: -5, scale: 0.9 }
];

rocks.forEach(rock => {
    const rockMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(5 * rock.scale, 0),
        smugglersIslandMaterial
    );
    rockMesh.position.set(rock.x, 3, rock.z);
    rockMesh.rotation.set(Math.random(), Math.random(), Math.random());
    smugglersGroup.add(rockMesh);
});

// Hidden coves and caves
const coveEntrance = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 8, 8, 1, true, Math.PI * 0.25, Math.PI * 0.5),
    new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.8
    })
);
coveEntrance.position.set(0, 3, 25);
coveEntrance.rotation.y = Math.PI;
smugglersGroup.add(coveEntrance);

// Smuggler buildings and hideouts
const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Saddle brown

// Main hideout
const mainHideout = new THREE.Mesh(
    new THREE.BoxGeometry(12, 8, 15),
    buildingMaterial
);
mainHideout.position.set(0, 7, 0);
smugglersGroup.add(mainHideout);

// Hideout roof
const hideoutRoof = new THREE.Mesh(
    new THREE.ConeGeometry(15, 6, 4),
    new THREE.MeshLambertMaterial({ color: 0xa0522d }) // Sienna
);
hideoutRoof.position.set(0, 14, 0);
hideoutRoof.rotation.y = Math.PI / 4;
smugglersGroup.add(hideoutRoof);

// Watchtower
const watchtower = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 15, 6),
    buildingMaterial
);
watchtower.position.set(-15, 10.5, -10);
smugglersGroup.add(watchtower);

// Watchtower top
const watchtowerTop = new THREE.Mesh(
    new THREE.ConeGeometry(4, 5, 6),
    new THREE.MeshLambertMaterial({ color: 0xa0522d }) // Sienna
);
watchtowerTop.position.set(-15, 18, -10);
smugglersGroup.add(watchtowerTop);

// Docks with ships
const dockMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 }); // Burlywood

// Main dock
const dock = new THREE.Mesh(
    new THREE.BoxGeometry(40, 1, 8),
    dockMaterial
);
dock.position.set(0, 3.5, 35);
smugglersGroup.add(dock);

// Create ships
const createShip = (x, z, size, angle) => {
    const shipGroup = new THREE.Group();
    
    // Hull
    const hull = new THREE.Mesh(
        new THREE.BoxGeometry(size * 10, size * 3, size * 4),
        new THREE.MeshLambertMaterial({ color: 0x5c4033 }) // Brown
    );
    shipGroup.add(hull);
    
    // Masts
    const createMast = (xPos, height) => {
        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(size * 0.3, size * 0.3, height, 8),
            new THREE.MeshLambertMaterial({ color: 0x8b7355 }) // Burlywood
        );
        mast.position.set(xPos, height/2 + size * 1.5, 0);
        shipGroup.add(mast);
        
        // Sail
        const sail = new THREE.Mesh(
            new THREE.PlaneGeometry(size * 5, height * 0.6),
            new THREE.MeshLambertMaterial({ 
                color: 0xf5f5dc, // Beige
                side: THREE.DoubleSide
            })
        );
        sail.position.set(xPos + size * 2, height/2 + size * 2, 0);
        sail.rotation.z = Math.PI / 12;
        shipGroup.add(sail);
    };
    
    createMast(-size * 2, size * 10);
    createMast(size * 2, size * 8);
    
    shipGroup.position.set(x, 3, z);
    shipGroup.rotation.y = angle;
    smugglersGroup.add(shipGroup);
};

createShip(20, 38, 1, Math.PI / 4);
createShip(-15, 40, 0.8, -Math.PI / 6);

// Add some crates and barrels near the docks
for (let i = 0; i < 8; i++) {
    const isBarrel = Math.random() > 0.5;
    const object = new THREE.Mesh(
        isBarrel 
            ? new THREE.CylinderGeometry(1, 1, 2, 8)
            : new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshLambertMaterial({ color: 0xdeb887 }) // Burlywood
    );
    
    const x = (Math.random() - 0.5) * 30;
    const z = 30 + Math.random() * 10;
    object.position.set(x, 4.5, z);
    object.rotation.y = Math.random() * Math.PI;
    smugglersGroup.add(object);
}

smugglersGroup.position.set(0, 6, 90);
scene.add(smugglersGroup);
createLabel(smugglersGroup, "Smugglers Island", 0xcd853f);

// The Belt (floating above smugglers island) - Enhanced with more complex structure
const beltGroup = new THREE.Group();

// Main ring structure - slightly irregular
const beltMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xff7f50, // Coral
    transparent: true,
    opacity: 0.9
});

// Create the main irregular ring
const beltRing = new THREE.Mesh(
    new THREE.TorusGeometry(20, 3, 16, 32),
    beltMaterial
);
beltGroup.add(beltRing);

// Add second smaller ring for complex structure
const secondaryRing = new THREE.Mesh(
    new THREE.TorusGeometry(15, 2, 16, 24),
    beltMaterial
);
secondaryRing.rotation.x = Math.PI / 4;
beltGroup.add(secondaryRing);

// Add third smaller ring
const tertiaryRing = new THREE.Mesh(
    new THREE.TorusGeometry(12, 1.5, 16, 20),
    beltMaterial
);
tertiaryRing.rotation.x = -Math.PI / 4;
tertiaryRing.rotation.z = Math.PI / 4;
beltGroup.add(tertiaryRing);

// Add floating platforms/stations along the belt
const stationMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xe9967a, // Dark salmon
    transparent: true,
    opacity: 0.95
});

// Create stations at various points around the rings
for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * 20;
    const z = Math.sin(angle) * 20;
    
    // Alternate between different station types
    if (i % 2 === 0) {
        // Larger station
        const station = new THREE.Mesh(
            new THREE.BoxGeometry(6, 3, 4),
            stationMaterial
        );
        station.position.set(x, 0, z);
        station.rotation.y = angle;
        beltGroup.add(station);
        
        // Add antenna
        const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 5, 4),
            new THREE.MeshLambertMaterial({ color: 0xc0c0c0 }) // Silver
        );
        antenna.position.set(x, 4, z);
        beltGroup.add(antenna);
    } else {
        // Smaller circular station
        const station = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 2, 8),
            stationMaterial
        );
        station.position.set(x, 0, z);
        beltGroup.add(station);
        
        // Add dome top
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshLambertMaterial({ 
                color: 0xffa07a, // Light salmon
                transparent: true,
                opacity: 0.8
            })
        );
        dome.position.set(x, 1, z);
        beltGroup.add(dome);
    }
}

// Add connecting bridges between some stations
const bridgeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffa07a, // Light salmon
    transparent: true,
    opacity: 0.7
});

for (let i = 0; i < 3; i++) {
    const angle1 = (i * 2 / 6) * Math.PI * 2;
    const angle2 = ((i * 2 + 1) / 6) * Math.PI * 2;
    
    const x1 = Math.cos(angle1) * 20;
    const z1 = Math.sin(angle1) * 20;
    const x2 = Math.cos(angle2) * 20;
    const z2 = Math.sin(angle2) * 20;
    
    // Calculate bridge position and rotation
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
    const angle = Math.atan2(z2 - z1, x2 - x1);
    
    const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(length, 1, 1.5),
        bridgeMaterial
    );
    bridge.position.set(midX, 0, midZ);
    bridge.rotation.y = angle;
    beltGroup.add(bridge);
}

// Add energy/particle effects around the ring
for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + (Math.random() - 0.5) * 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 5;
    
    const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0xffcc99, // Light orange
            transparent: true,
            opacity: 0.6 + Math.random() * 0.4
        })
    );
    particle.position.set(x, y, z);
    beltGroup.add(particle);
}

beltGroup.position.set(0, 70, 90);
beltGroup.rotation.x = Math.PI / 2;
scene.add(beltGroup);
createLabel(beltGroup, "The Belt", 0xff7f50);

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
// Fire Islands - Enhanced with volcanic features
const fireIslandsGroup = new THREE.Group();

// Main island base
const islandBaseGeometry = new THREE.CylinderGeometry(30, 35, 10, 8);
const fireIslandsMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Saddle brown for island base
const islandBase = new THREE.Mesh(islandBaseGeometry, fireIslandsMaterial);
fireIslandsGroup.add(islandBase);

// Volcanic mountain
const volcanoGeometry = new THREE.ConeGeometry(25, 30, 16);
const volcanoMaterial = new THREE.MeshLambertMaterial({ color: 0xa0522d }); // Sienna
const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
volcano.position.y = 20;
fireIslandsGroup.add(volcano);

// Volcanic crater
const craterGeometry = new THREE.CylinderGeometry(10, 15, 8, 16, 1, true);
const craterMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x8b0000, // Dark red
    side: THREE.DoubleSide
});
const crater = new THREE.Mesh(craterGeometry, craterMaterial);
crater.position.y = 35;
fireIslandsGroup.add(crater);

// Lava pool in crater
const lavaGeometry = new THREE.CircleGeometry(10, 16);
const lavaMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff4500, // Orange red
    transparent: true,
    opacity: 0.9
});
const lava = new THREE.Mesh(lavaGeometry, lavaMaterial);
lava.position.y = 31;
lava.rotation.x = -Math.PI / 2;
fireIslandsGroup.add(lava);

// Add lava streams down the sides
const createLavaStream = (angle, width, length) => {
    const streamGeometry = new THREE.PlaneGeometry(width, length);
    const streamMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4500, // Orange red
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const stream = new THREE.Mesh(streamGeometry, streamMaterial);
    
    // Position on the volcano side
    const x = Math.cos(angle) * 15;
    const z = Math.sin(angle) * 15;
    stream.position.set(x, 20, z);
    
    // Rotate to align with volcano slope
    stream.rotation.x = Math.PI / 4;
    stream.rotation.y = angle;
    
    fireIslandsGroup.add(stream);
};

createLavaStream(0, 5, 25);
createLavaStream(Math.PI * 0.6, 4, 30);
createLavaStream(Math.PI * 1.2, 6, 35);
createLavaStream(Math.PI * 1.8, 5, 25);

// Add smoke particles from crater
for (let i = 0; i < 15; i++) {
    const offset = (Math.random() - 0.5) * 10;
    const smokeGeometry = new THREE.SphereGeometry(3 + Math.random() * 3, 8, 8);
    const smokeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x555555, 
        transparent: true, 
        opacity: 0.3 + Math.random() * 0.3
    });
    
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke.position.set(offset, 35 + Math.random() * 15, offset);
    fireIslandsGroup.add(smoke);
}

// Add smaller volcanic islands around the main one
const smallIslandsPositions = [
    { x: 50, z: 20, scale: 0.6 },
    { x: -40, z: -20, scale: 0.5 },
    { x: 20, z: -50, scale: 0.7 },
    { x: -25, z: 45, scale: 0.4 }
];

smallIslandsPositions.forEach(pos => {
    // Island base
    const smallIsland = new THREE.Mesh(
        new THREE.CylinderGeometry(15 * pos.scale, 18 * pos.scale, 8 * pos.scale, 8),
        fireIslandsMaterial
    );
    smallIsland.position.set(pos.x, 4 * pos.scale, pos.z);
    fireIslandsGroup.add(smallIsland);
    
    // Small volcano
    const smallVolcano = new THREE.Mesh(
        new THREE.ConeGeometry(12 * pos.scale, 20 * pos.scale, 12),
        volcanoMaterial
    );
    smallVolcano.position.set(pos.x, (8 + 10 * pos.scale), pos.z);
    fireIslandsGroup.add(smallVolcano);
    
    // Small crater with lava
    const smallCrater = new THREE.Mesh(
        new THREE.CircleGeometry(5 * pos.scale, 12),
        lavaMaterial
    );
    smallCrater.position.set(pos.x, (8 + 20 * pos.scale), pos.z);
    smallCrater.rotation.x = -Math.PI / 2;
    fireIslandsGroup.add(smallCrater);
    
    // Add a small smoke cloud
    if (Math.random() > 0.5) {
        const smallSmoke = new THREE.Mesh(
            new THREE.SphereGeometry(4 * pos.scale, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0x666666, 
                transparent: true, 
                opacity: 0.4
            })
        );
        smallSmoke.position.set(pos.x, (8 + 22 * pos.scale), pos.z);
        fireIslandsGroup.add(smallSmoke);
    }
});

// Add obsidian rock formations
for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const rock = new THREE.Mesh(
        new THREE.TetrahedronGeometry(2 + Math.random() * 3, 0),
        new THREE.MeshLambertMaterial({ color: 0x0c0c0c }) // Almost black
    );
    rock.position.set(x, 5, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    fireIslandsGroup.add(rock);
}

fireIslandsGroup.position.set(-90, 10, 0);
scene.add(fireIslandsGroup);
createLabel(fireIslandsGroup, "Fire Islands", 0xff4500);

// Hell's End Continent - Enhanced with demonic and rugged features
const hellsEndGroup = new THREE.Group();

// Main landmass with rugged terrain
const mainLandGeometry = new THREE.BoxGeometry(120, 15, 180);
const hellsEndMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 }); // Dark red
const mainLand = new THREE.Mesh(mainLandGeometry, hellsEndMaterial);
hellsEndGroup.add(mainLand);

// Add mountain ranges using cone geometry
const mountainPositions = [
    { x: -40, z: -60, scale: 1.2, rotation: 0.2 },
    { x: 20, z: -30, scale: 0.9, rotation: -0.3 },
    { x: -10, z: 50, scale: 1.0, rotation: 0.4 },
    { x: 30, z: 20, scale: 1.1, rotation: -0.1 }
];

mountainPositions.forEach(pos => {
    const mountainRange = new THREE.Mesh(
        new THREE.ConeGeometry(20 * pos.scale, 40 * pos.scale, 5),
        new THREE.MeshLambertMaterial({ color: 0x800000 }) // Maroon
    );
    mountainRange.position.set(pos.x, 20 * pos.scale, pos.z);
    mountainRange.rotation.y = pos.rotation;
    mountainRange.scale.set(2, 1, 1);
    hellsEndGroup.add(mountainRange);
});

// Add cracks with lava
const createLavaCrack = (startX, startZ, endX, endZ, width) => {
    const dx = endX - startX;
    const dz = endZ - startZ;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    
    const crack = new THREE.Mesh(
        new THREE.PlaneGeometry(length, width),
        new THREE.MeshBasicMaterial({ 
            color: 0xff4500, // Orange red (lava)
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        })
    );
    
    crack.position.set(startX + dx/2, 7.6, startZ + dz/2);
    crack.rotation.x = Math.PI / 2;
    crack.rotation.y = angle;
    
    hellsEndGroup.add(crack);
};

createLavaCrack(-50, -30, 30, -50, 4);
createLavaCrack(20, 20, -40, 60, 3);
createLavaCrack(-30, -70, -10, 30, 5);

// Add smoke and fire effects scattered around
for (let i = 0; i < 25; i++) {
    const x = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 160;
    
    // Create smoke cloud
    const smokeCloud = new THREE.Mesh(
        new THREE.SphereGeometry(3 + Math.random() * 3, 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0x555555, // Dark gray
            transparent: true, 
            opacity: 0.5
        })
    );
    smokeCloud.position.set(x, 15 + Math.random() * 5, z);
    hellsEndGroup.add(smokeCloud);
    
    // Add fire beneath some smoke clouds
    if (Math.random() > 0.6) {
        const fire = new THREE.Mesh(
            new THREE.ConeGeometry(2, 5, 8),
            new THREE.MeshBasicMaterial({ color: 0xffa500 }) // Orange
        );
        fire.position.set(x, 10, z);
        hellsEndGroup.add(fire);
    }
}

// Add dead trees
for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 160;
    
    // Tree trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1.5, 10 + Math.random() * 5, 5),
        new THREE.MeshLambertMaterial({ color: 0x4d2600 }) // Dark brown
    );
    trunk.position.set(x, 5 + trunk.geometry.parameters.height / 2, z);
    hellsEndGroup.add(trunk);
    
    // Add twisted branches
    const branchCount = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < branchCount; j++) {
        const branchHeight = 5 + trunk.geometry.parameters.height / 2 * Math.random();
        const branchAngle = Math.random() * Math.PI * 2;
        const branch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.8, 4 + Math.random() * 3, 4),
            new THREE.MeshLambertMaterial({ color: 0x4d2600 }) // Dark brown
        );
        branch.position.set(
            x + Math.cos(branchAngle) * 2,
            branchHeight,
            z + Math.sin(branchAngle) * 2
        );
        branch.rotation.z = Math.random() - 0.5;
        branch.rotation.y = branchAngle;
        hellsEndGroup.add(branch);
    }
}

// Jagged coastal features
const addCoastalFeature = (x, z, width, depth, rotation) => {
    const coastal = new THREE.Mesh(
        new THREE.BoxGeometry(width, 10, depth),
        hellsEndMaterial
    );
    coastal.position.set(x, 0, z);
    coastal.rotation.y = rotation;
    hellsEndGroup.add(coastal);
};

addCoastalFeature(-70, 60, 30, 40, Math.PI / 5);
addCoastalFeature(60, -70, 25, 50, -Math.PI / 6);
addCoastalFeature(-50, -90, 40, 30, Math.PI / 4);

hellsEndGroup.position.set(-150, 7.5, 0);
scene.add(hellsEndGroup);
createLabel(hellsEndGroup, "Hell's End", 0x8b0000);

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