// Eastern regions implementation
import { config } from '../core/config.js';

// Create Eastern continent and all its sub-regions
export function createEasternContinent(scene, labelSystem) {
    const elements = {
        continent: createMainContinent(scene, labelSystem),
        farms: createVerticalFarms(scene, labelSystem),
        industrial: createIndustrialArea(scene, labelSystem),
        capital: createSeasideCapital(scene, labelSystem),
        spaceFarms: createSpaceFarms(scene, labelSystem),
        mines: createEasternMines(scene, labelSystem),
        sewers: createSewers(scene, labelSystem)
    };
    
    return elements;
}

// Create main continent body
function createMainContinent(scene, labelSystem) {
    const eastContinentGroup = new THREE.Group();
    
    // Using a combination of shapes for more natural look - adjusted to requested dimensions
    const mainContinentGeometry = new THREE.BoxGeometry(100, 12, 400);
    const mainContinentMaterial = new THREE.MeshLambertMaterial({ 
        color: config.get('colors.easternContinent')
    });
    const mainContinent = new THREE.Mesh(mainContinentGeometry, mainContinentMaterial);
    eastContinentGroup.add(mainContinent);
    
    // Adding a slightly elevated plateau for terrain variation
    const plateauGeometry = new THREE.BoxGeometry(60, 4, 180);
    const plateauMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xb0b0b0 
    });
    const plateau = new THREE.Mesh(plateauGeometry, plateauMaterial);
    plateau.position.set(-10, 8, -60);
    eastContinentGroup.add(plateau);
    
    // Adding coastal ridges - eastern edge
    const eastCoastalRidgeGeometry = new THREE.BoxGeometry(12, 8, 400);
    const eastCoastalRidgeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x909090 
    });
    const eastCoastalRidge = new THREE.Mesh(eastCoastalRidgeGeometry, eastCoastalRidgeMaterial);
    eastCoastalRidge.position.set(44, 4, 0);
    eastContinentGroup.add(eastCoastalRidge);
    
    // Western coastal ridge
    const westCoastalRidgeGeometry = new THREE.BoxGeometry(10, 10, 360);
    const westCoastalRidgeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x808080 
    });
    const westCoastalRidge = new THREE.Mesh(westCoastalRidgeGeometry, westCoastalRidgeMaterial);
    westCoastalRidge.position.set(-45, 5, 0);
    eastContinentGroup.add(westCoastalRidge);
    
    // Northern mountains
    const northernMountainsGeometry = new THREE.BoxGeometry(80, 18, 15);
    const northernMountainsMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x787878 
    });
    const northernMountains = new THREE.Mesh(northernMountainsGeometry, northernMountainsMaterial);
    northernMountains.position.set(0, 9, -192);
    eastContinentGroup.add(northernMountains);
    
    // Southern mountains - added to complete the look for the longer landmass
    const southernMountainsGeometry = new THREE.BoxGeometry(70, 16, 15);
    const southernMountainsMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x696969 
    });
    const southernMountains = new THREE.Mesh(southernMountainsGeometry, southernMountainsMaterial);
    southernMountains.position.set(0, 8, 192);
    eastContinentGroup.add(southernMountains);
    
    // Position the entire continent group
    const position = config.get('positions.eastern.continent');
    eastContinentGroup.position.set(position.x, position.y, position.z);
    scene.add(eastContinentGroup);
    
    // Add label
    labelSystem.addLabel(eastContinentGroup, "Eastern Continent", config.get('colors.easternContinent'));
    
    return eastContinentGroup;
}

// Create vertical farm region
function createVerticalFarms(scene, labelSystem) {
    const verticalFarmGroup = new THREE.Group();
    
    // Base land area
    const farmBaseGeometry = new THREE.BoxGeometry(80, 8, 80);
    const farmBaseMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x729f00 // Darker green base
    });
    const farmBase = new THREE.Mesh(farmBaseGeometry, farmBaseMaterial);
    verticalFarmGroup.add(farmBase);
    
    // Creating multiple vertical farm towers
    const createFarmTower = (x, z, height, radius) => {
        const towerGeometry = new THREE.CylinderGeometry(radius, radius, height, 8);
        const towerMaterial = new THREE.MeshLambertMaterial({ 
            color: config.get('colors.farmRegion')
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.set(x, height/2 + 4, z);
        verticalFarmGroup.add(tower);
        
        // Add a small dome on top
        const domeGeometry = new THREE.SphereGeometry(radius, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xaaffaa // Light green
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.set(x, height + 4, z);
        verticalFarmGroup.add(dome);
    };
    
    // Create several farm towers of varying heights - more spread out
    createFarmTower(-25, -25, 24, 7);
    createFarmTower(5, 0, 30, 9);
    createFarmTower(25, 15, 22, 6);
    createFarmTower(-15, 25, 26, 7);
    createFarmTower(22, -20, 32, 8);
    createFarmTower(-30, -5, 28, 6);
    createFarmTower(15, 30, 20, 5);
    
    // Position the entire farm group
    const position = config.get('positions.eastern.farms');
    verticalFarmGroup.position.set(position.x, position.y, position.z);
    scene.add(verticalFarmGroup);
    
    // Add label
    labelSystem.addLabel(verticalFarmGroup, "Vertical Farm Region", config.get('colors.farmRegion'));
    
    return verticalFarmGroup;
}

// Create industrial area
function createIndustrialArea(scene, labelSystem) {
    const industrialAreaGroup = new THREE.Group();
    
    // Base industrial zone - expanded
    const industrialBaseGeometry = new THREE.BoxGeometry(100, 6, 120);
    const industrialBaseMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x505050 // Dark gray
    });
    const industrialBase = new THREE.Mesh(industrialBaseGeometry, industrialBaseMaterial);
    industrialAreaGroup.add(industrialBase);
    
    // Factory buildings - more and bigger
    const createFactory = (x, z, width, height, depth) => {
        const factoryGeometry = new THREE.BoxGeometry(width, height, depth);
        const factoryMaterial = new THREE.MeshLambertMaterial({ 
            color: config.get('colors.industrialArea')
        });
        const factory = new THREE.Mesh(factoryGeometry, factoryMaterial);
        factory.position.set(x, height/2 + 3, z);
        industrialAreaGroup.add(factory);
        
        // Add chimney
        if (height > 15) {
            const chimneyGeometry = new THREE.CylinderGeometry(width/8, width/6, height/2, 8);
            const chimneyMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x606060
            });
            const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
            chimney.position.set(x + width/4, height + height/4, z - depth/4);
            industrialAreaGroup.add(chimney);
        }
    };
    
    // Create various factories
    createFactory(-35, -40, 25, 18, 30);
    createFactory(20, -20, 30, 25, 20);
    createFactory(-15, 10, 20, 15, 40);
    createFactory(30, 30, 35, 22, 25);
    createFactory(-25, 40, 28, 20, 30);
    
    // Position the entire industrial area group
    const position = config.get('positions.eastern.industrial');
    industrialAreaGroup.position.set(position.x, position.y, position.z);
    scene.add(industrialAreaGroup);
    
    // Add label
    labelSystem.addLabel(industrialAreaGroup, "Industrial Area", config.get('colors.industrialArea'));
    
    return industrialAreaGroup;
}

// Create seaside capital
function createSeasideCapital(scene, labelSystem) {
    const seasideCapitalGroup = new THREE.Group();
    
    // Main city base - larger and more defined
    const cityBaseGeometry = new THREE.CylinderGeometry(40, 45, 5, 8);
    const cityBaseMaterial = new THREE.MeshLambertMaterial({ 
        color: config.get('colors.seasideCapital')
    });
    const cityBase = new THREE.Mesh(cityBaseGeometry, cityBaseMaterial);
    cityBase.position.y = 2.5;
    seasideCapitalGroup.add(cityBase);
    
    // Add buildings to the capital
    function addBuilding(x, z, height, width) {
        const buildingGeometry = new THREE.BoxGeometry(width, height, width);
        const buildingMaterial = new THREE.MeshLambertMaterial({
            color: 0xe6d2a8 // Sandstone color
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height/2 + 5, z);
        seasideCapitalGroup.add(building);
    }
    
    // Central palace - larger building in center
    const palaceGeometry = new THREE.CylinderGeometry(12, 15, 30, 6);
    const palaceMaterial = new THREE.MeshLambertMaterial({
        color: 0xf0e68c // Khaki gold
    });
    const palace = new THREE.Mesh(palaceGeometry, palaceMaterial);
    palace.position.set(0, 20, 0);
    seasideCapitalGroup.add(palace);
    
    // Palace dome
    const domeGeometry = new THREE.SphereGeometry(12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshLambertMaterial({
        color: 0xffd700 // Gold
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.set(0, 35, 0);
    seasideCapitalGroup.add(dome);
    
    // Add surrounding buildings
    for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 25;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const height = 8 + Math.random() * 12;
        const width = 5 + Math.random() * 5;
        addBuilding(x, z, height, width);
    }
    
    // Outer ring of buildings
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 35;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const height = 5 + Math.random() * 8;
        const width = 4 + Math.random() * 4;
        addBuilding(x, z, height, width);
    }
    
    // Position the city group
    const position = config.get('positions.eastern.capital');
    seasideCapitalGroup.position.set(position.x, position.y, position.z);
    scene.add(seasideCapitalGroup);
    
    // Add label
    labelSystem.addLabel(seasideCapitalGroup, "Seaside Capital", config.get('colors.seasideCapital'));
    
    return seasideCapitalGroup;
}

// Create space farms
function createSpaceFarms(scene, labelSystem) {
    const spaceFarmGroup = new THREE.Group();
    
    // Base platform
    const platformGeometry = new THREE.CylinderGeometry(45, 50, 5, 8);
    const platformMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87cefa // Light sky blue
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -2.5;
    spaceFarmGroup.add(platform);
    
    // Create geodesic domes for the space farms
    function createDome(x, z, radius, height, color) {
        // Create base
        const baseGeometry = new THREE.CylinderGeometry(radius, radius, height * 0.2, 16);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x607d8b }); // Blue gray
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(x, height * 0.1, z);
        spaceFarmGroup.add(base);
        
        // Create dome
        const domeGeometry = new THREE.SphereGeometry(radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.7
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.set(x, height * 0.2, z);
        spaceFarmGroup.add(dome);
        
        // Create internal structures (simplified for performance)
        const internalGeometry = new THREE.BoxGeometry(radius * 1.2, height * 0.6, radius * 1.2);
        const internalMaterial = new THREE.MeshLambertMaterial({ color: 0xaed581 }); // Light green
        const internal = new THREE.Mesh(internalGeometry, internalMaterial);
        internal.position.set(x, height * 0.4, z);
        spaceFarmGroup.add(internal);
    }
    
    // Create several domes of varying sizes
    createDome(0, 0, 20, 30, config.get('colors.spaceFarms'));
    createDome(-35, 15, 15, 25, 0x90caf9); // Light blue
    createDome(30, -10, 18, 28, 0x80deea); // Cyan
    createDome(-20, -30, 12, 20, 0x4fc3f7); // Light blue
    createDome(25, 25, 14, 22, 0x4dd0e1); // Cyan
    
    // Add connecting walkways between domes
    function createWalkway(x1, z1, x2, z2) {
        // Calculate midpoint and distance
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
        
        // Calculate the angle to rotate the walkway
        const angle = Math.atan2(z2 - z1, x2 - x1);
        
        // Create walkway
        const walkwayGeometry = new THREE.BoxGeometry(distance, 3, 5);
        const walkwayMaterial = new THREE.MeshLambertMaterial({ color: 0x90a4ae }); // Blue gray
        const walkway = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
        
        // Position and rotate walkway
        walkway.position.set(midX, 5, midZ);
        walkway.rotation.y = angle;
        spaceFarmGroup.add(walkway);
    }
    
    // Create walkways between domes
    createWalkway(0, 0, -35, 15);
    createWalkway(0, 0, 30, -10);
    createWalkway(0, 0, -20, -30);
    createWalkway(0, 0, 25, 25);
    createWalkway(-35, 15, -20, -30);
    createWalkway(30, -10, 25, 25);
    
    // Position the entire space farm group
    const position = config.get('positions.eastern.spaceFarms');
    spaceFarmGroup.position.set(position.x, position.y, position.z);
    scene.add(spaceFarmGroup);
    
    // Add label
    labelSystem.addLabel(spaceFarmGroup, "Space Farms", config.get('colors.spaceFarms'));
    
    return spaceFarmGroup;
}

// Create eastern mines
function createEasternMines(scene, labelSystem) {
    // Create the underground mines - larger and more complex
    const mineGroup = new THREE.Group();
    
    // Main mine cavern
    const mainCavernGeometry = new THREE.SphereGeometry(40, 8, 8);
    const mainCavernMaterial = new THREE.MeshBasicMaterial({ 
        color: config.get('colors.mines'),
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const mainCavern = new THREE.Mesh(mainCavernGeometry, mainCavernMaterial);
    mineGroup.add(mainCavern);
    
    // Add connecting tunnels
    const addTunnel = (x, y, z, length, rotation) => {
        const tunnelGeometry = new THREE.CylinderGeometry(8, 8, length, 8, 1, true);
        const tunnelMaterial = new THREE.MeshBasicMaterial({ 
            color: config.get('colors.mines'),
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        tunnel.position.set(x, y, z);
        
        // Apply rotation
        if (rotation === 'x') {
            tunnel.rotation.z = Math.PI / 2;
        } else if (rotation === 'z') {
            tunnel.rotation.x = Math.PI / 2;
        }
        
        mineGroup.add(tunnel);
    };
    
    // Add smaller caverns
    const addCavern = (x, y, z, radius) => {
        const cavernGeometry = new THREE.SphereGeometry(radius, 8, 8);
        const cavernMaterial = new THREE.MeshBasicMaterial({ 
            color: config.get('colors.mines'),
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const cavern = new THREE.Mesh(cavernGeometry, cavernMaterial);
        cavern.position.set(x, y, z);
        mineGroup.add(cavern);
    };
    
    // Create tunnels and connecting caverns
    addTunnel(30, 0, 0, 60, 'x');
    addTunnel(-30, 0, 0, 60, 'x');
    addTunnel(0, 0, 30, 60, 'z');
    addTunnel(0, 0, -30, 60, 'z');
    
    // Add small caverns at tunnel ends
    addCavern(60, 0, 0, 15);
    addCavern(-60, 0, 0, 18);
    addCavern(0, 0, 60, 20);
    addCavern(0, 0, -60, 16);
    
    // Position the mines
    const position = config.get('positions.eastern.mines');
    mineGroup.position.set(position.x, position.y, position.z);
    scene.add(mineGroup);
    
    // Add label
    labelSystem.addLabel(mineGroup, "Eastern Mines", config.get('colors.mines'));
    
    return mineGroup;
}

// Create sewers
function createSewers(scene, labelSystem) {
    // Create a more complex sewer system
    const sewerGroup = new THREE.Group();
    
    // Main sewer cylinder
    const mainSewerGeometry = new THREE.CylinderGeometry(25, 30, 15, 8, 1, true);
    const sewerMaterial = new THREE.MeshBasicMaterial({ 
        color: config.get('colors.sewers'),
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const mainSewer = new THREE.Mesh(mainSewerGeometry, sewerMaterial);
    sewerGroup.add(mainSewer);
    
    // Create sewer pipe extensions
    const addSewerPipe = (x, y, z, length, radius, rotation) => {
        const pipeGeometry = new THREE.CylinderGeometry(radius, radius, length, 8, 1, true);
        const pipe = new THREE.Mesh(pipeGeometry, sewerMaterial);
        pipe.position.set(x, y, z);
        
        // Apply rotation
        if (rotation === 'x') {
            pipe.rotation.z = Math.PI / 2;
        } else if (rotation === 'z') {
            pipe.rotation.x = Math.PI / 2;
        }
        
        sewerGroup.add(pipe);
    };
    
    // Add connecting pipes
    addSewerPipe(30, 0, 0, 40, 8, 'x');
    addSewerPipe(-20, 0, 10, 35, 10, 'x');
    addSewerPipe(0, 0, 30, 40, 12, 'z');
    addSewerPipe(10, 0, -25, 35, 7, 'z');
    
    // Add a few processing tanks
    const addTank = (x, y, z, radius, height) => {
        const tankGeometry = new THREE.CylinderGeometry(radius, radius, height, 8, 1, false);
        const tankMaterial = new THREE.MeshBasicMaterial({
            color: 0x3a5f0b,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const tank = new THREE.Mesh(tankGeometry, tankMaterial);
        tank.position.set(x, y, z);
        sewerGroup.add(tank);
    };
    
    // Add processing tanks
    addTank(35, 0, 15, 12, 20);
    addTank(-25, 0, -20, 10, 15);
    addTank(15, 0, 40, 15, 25);
    
    // Position the sewers
    const position = config.get('positions.eastern.sewers');
    sewerGroup.position.set(position.x, position.y, position.z);
    scene.add(sewerGroup);
    
    // Add label
    labelSystem.addLabel(sewerGroup, "Mutant Sewers", config.get('colors.sewers'));
    
    return sewerGroup;
}