// Eastern regions implementation
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

// Create Eastern continent and all its sub-regions
export function createEasternContinent(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
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
    const mainContinentMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.easternContinent,
        metalness: 0.1,
        roughness: 0.8
    });
    const mainContinent = new THREE.Mesh(mainContinentGeometry, mainContinentMaterial);
    mainContinent.castShadow = true;
    mainContinent.receiveShadow = true;
    eastContinentGroup.add(mainContinent);
    
    // Adding a slightly elevated plateau for terrain variation
    const plateauGeometry = new THREE.BoxGeometry(60, 4, 180);
    const plateauMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xb0b0b0,
        metalness: 0.1,
        roughness: 0.7
    });
    const plateau = new THREE.Mesh(plateauGeometry, plateauMaterial);
    plateau.position.set(-10, 8, -60);
    plateau.castShadow = true;
    plateau.receiveShadow = true;
    eastContinentGroup.add(plateau);
    
    // Adding coastal ridges - eastern edge
    const eastCoastalRidgeGeometry = new THREE.BoxGeometry(12, 8, 400);
    const eastCoastalRidgeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x909090,
        metalness: 0.1,
        roughness: 0.6
    });
    const eastCoastalRidge = new THREE.Mesh(eastCoastalRidgeGeometry, eastCoastalRidgeMaterial);
    eastCoastalRidge.position.set(44, 4, 0);
    eastCoastalRidge.castShadow = true;
    eastCoastalRidge.receiveShadow = true;
    eastContinentGroup.add(eastCoastalRidge);
    
    // Western coastal ridge
    const westCoastalRidgeGeometry = new THREE.BoxGeometry(10, 10, 360);
    const westCoastalRidgeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        metalness: 0.1,
        roughness: 0.7
    });
    const westCoastalRidge = new THREE.Mesh(westCoastalRidgeGeometry, westCoastalRidgeMaterial);
    westCoastalRidge.position.set(-45, 5, 0);
    westCoastalRidge.castShadow = true;
    westCoastalRidge.receiveShadow = true;
    eastContinentGroup.add(westCoastalRidge);
    
    // Northern mountains
    const northernMountainsGeometry = new THREE.BoxGeometry(80, 18, 15);
    const northernMountainsMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x787878,
        metalness: 0.1,
        roughness: 0.8
    });
    const northernMountains = new THREE.Mesh(northernMountainsGeometry, northernMountainsMaterial);
    northernMountains.position.set(0, 9, -192);
    northernMountains.castShadow = true;
    northernMountains.receiveShadow = true;
    eastContinentGroup.add(northernMountains);
    
    // Southern mountains - added to complete the look for the longer landmass
    const southernMountainsGeometry = new THREE.BoxGeometry(70, 16, 15);
    const southernMountainsMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969,
        metalness: 0.1,
        roughness: 0.8
    });
    const southernMountains = new THREE.Mesh(southernMountainsGeometry, southernMountainsMaterial);
    southernMountains.position.set(0, 8, 192);
    southernMountains.castShadow = true;
    southernMountains.receiveShadow = true;
    eastContinentGroup.add(southernMountains);
    
    // Position the entire continent group
    const position = CONFIG.positions.eastern.continent;
    eastContinentGroup.position.set(position.x, position.y, position.z);
    scene.add(eastContinentGroup);
    
    // Add label
    labelSystem.addLabel(eastContinentGroup, "Eastern Continent", CONFIG.colors.easternContinent);
    
    return eastContinentGroup;
}

// Create vertical farm region
function createVerticalFarms(scene, labelSystem) {
    const verticalFarmGroup = new THREE.Group();
    
    // Base land area
    const farmBaseGeometry = new THREE.BoxGeometry(80, 8, 80);
    const farmBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x729f00, // Darker green base
        metalness: 0.1,
        roughness: 0.7
    });
    const farmBase = new THREE.Mesh(farmBaseGeometry, farmBaseMaterial);
    farmBase.castShadow = true;
    farmBase.receiveShadow = true;
    verticalFarmGroup.add(farmBase);
    
    // Creating multiple vertical farm towers
    const createFarmTower = (x, z, height, radius) => {
        const towerGeometry = new THREE.CylinderGeometry(radius, radius, height, 8);
        const towerMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.farmRegion,
            metalness: 0.1,
            roughness: 0.5
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.set(x, height/2 + 4, z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        verticalFarmGroup.add(tower);
        
        // Add a small dome on top
        const domeGeometry = new THREE.SphereGeometry(radius, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xaaffaa, // Light green
            metalness: 0.1,
            roughness: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.set(x, height + 4, z);
        dome.castShadow = true;
        dome.receiveShadow = true;
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
    const position = CONFIG.positions.eastern.farms;
    verticalFarmGroup.position.set(position.x, position.y, position.z);
    scene.add(verticalFarmGroup);
    
    // Add label
    labelSystem.addLabel(verticalFarmGroup, "Vertical Farm Region", CONFIG.colors.farmRegion);
    
    return verticalFarmGroup;
}

// Create industrial area
function createIndustrialArea(scene, labelSystem) {
    const industrialAreaGroup = new THREE.Group();
    
    // Base industrial zone - expanded
    const industrialBaseGeometry = new THREE.BoxGeometry(100, 6, 120);
    const industrialBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x505050, // Dark gray
        metalness: 0.3,
        roughness: 0.7
    });
    const industrialBase = new THREE.Mesh(industrialBaseGeometry, industrialBaseMaterial);
    industrialBase.castShadow = true;
    industrialBase.receiveShadow = true;
    industrialAreaGroup.add(industrialBase);
    
    // Factory buildings - more and bigger
    const createFactory = (x, z, width, height, depth) => {
        const factoryGeometry = new THREE.BoxGeometry(width, height, depth);
        const factoryMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.industrialArea,
            metalness: 0.4,
            roughness: 0.6
        });
        const factory = new THREE.Mesh(factoryGeometry, factoryMaterial);
        factory.position.set(x, height/2 + 3, z);
        factory.castShadow = true;
        factory.receiveShadow = true;
        industrialAreaGroup.add(factory);
        
        // Add chimney
        if (height > 15) {
            const chimneyGeometry = new THREE.CylinderGeometry(width/8, width/6, height/2, 8);
            const chimneyMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x606060,
                metalness: 0.3,
                roughness: 0.7
            });
            const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
            chimney.position.set(x + width/4, height + height/4, z - depth/4);
            chimney.castShadow = true;
            chimney.receiveShadow = true;
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
    const position = CONFIG.positions.eastern.industrial;
    industrialAreaGroup.position.set(position.x, position.y, position.z);
    scene.add(industrialAreaGroup);
    
    // Add label
    labelSystem.addLabel(industrialAreaGroup, "Industrial Area", CONFIG.colors.industrialArea);
    
    return industrialAreaGroup;
}

// Create seaside capital
function createSeasideCapital(scene, labelSystem) {
    const seasideCapitalGroup = new THREE.Group();
    
    // Main city base - larger and more defined
    const cityBaseGeometry = new THREE.CylinderGeometry(40, 45, 5, 8);
    const cityBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.seasideCapital,
        metalness: 0.2,
        roughness: 0.6
    });
    const cityBase = new THREE.Mesh(cityBaseGeometry, cityBaseMaterial);
    cityBase.position.y = 2.5;
    cityBase.castShadow = true;
    cityBase.receiveShadow = true;
    seasideCapitalGroup.add(cityBase);
    
    // Add buildings to the capital
    function addBuilding(x, z, height, width) {
        const buildingGeometry = new THREE.BoxGeometry(width, height, width);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0xe6d2a8, // Sandstone color
            metalness: 0.1,
            roughness: 0.7
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height/2 + 5, z);
        building.castShadow = true;
        building.receiveShadow = true;
        seasideCapitalGroup.add(building);
    }
    
    // Central palace - larger building in center
    const palaceGeometry = new THREE.CylinderGeometry(12, 15, 30, 6);
    const palaceMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0e68c, // Khaki gold
        metalness: 0.2,
        roughness: 0.5
    });
    const palace = new THREE.Mesh(palaceGeometry, palaceMaterial);
    palace.position.set(0, 20, 0);
    palace.castShadow = true;
    palace.receiveShadow = true;
    seasideCapitalGroup.add(palace);
    
    // Palace dome
    const domeGeometry = new THREE.SphereGeometry(12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700, // Gold
        metalness: 0.4,
        roughness: 0.3
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.set(0, 35, 0);
    dome.castShadow = true;
    dome.receiveShadow = true;
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
    
    // Position the city group
    const position = CONFIG.positions.eastern.capital;
    seasideCapitalGroup.position.set(position.x, position.y, position.z);
    scene.add(seasideCapitalGroup);
    
    // Add label
    labelSystem.addLabel(seasideCapitalGroup, "Seaside Capital", CONFIG.colors.seasideCapital);
    
    return seasideCapitalGroup;
}

// Create space farms
function createSpaceFarms(scene, labelSystem) {
    const spaceFarmGroup = new THREE.Group();
    
    // Main platform
    const platformGeometry = new THREE.BoxGeometry(60, 2, 60);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.spaceFarms,
        metalness: 0.3,
        roughness: 0.4
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.castShadow = true;
    platform.receiveShadow = true;
    spaceFarmGroup.add(platform);
    
    // Add transparent dome
    const domeGeometry = new THREE.SphereGeometry(30, 16, 16);
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0xadd8e6,
        transparent: true,
        opacity: 0.3,
        metalness: 0.1,
        roughness: 0.2
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.castShadow = true;
    dome.receiveShadow = true;
    spaceFarmGroup.add(dome);
    
    // Add farm structures
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 15;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const farmGeometry = new THREE.BoxGeometry(8, 12, 8);
        const farmMaterial = new THREE.MeshStandardMaterial({
            color: 0x90EE90,
            metalness: 0.1,
            roughness: 0.5
        });
        const farm = new THREE.Mesh(farmGeometry, farmMaterial);
        farm.position.set(x, 7, z);
        farm.castShadow = true;
        farm.receiveShadow = true;
        spaceFarmGroup.add(farm);
    }
    
    // Position the space farm group
    const position = CONFIG.positions.eastern.spaceFarms;
    spaceFarmGroup.position.set(position.x, position.y, position.z);
    scene.add(spaceFarmGroup);
    
    // Add label
    labelSystem.addLabel(spaceFarmGroup, "Space Farms", CONFIG.colors.spaceFarms);
    
    return spaceFarmGroup;
}

// Create eastern mines
function createEasternMines(scene, labelSystem) {
    const minesGroup = new THREE.Group();
    
    // Main mine entrance
    const entranceGeometry = new THREE.BoxGeometry(40, 20, 40);
    const entranceMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.mines,
        metalness: 0.2,
        roughness: 0.8
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.castShadow = true;
    entrance.receiveShadow = true;
    minesGroup.add(entrance);
    
    // Add mine shafts
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 15;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const shaftGeometry = new THREE.CylinderGeometry(3, 3, 10, 8);
        const shaftMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.1,
            roughness: 0.9
        });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.set(x, 5, z);
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        minesGroup.add(shaft);
    }
    
    // Position the mines group
    const position = CONFIG.positions.eastern.mines;
    minesGroup.position.set(position.x, position.y, position.z);
    scene.add(minesGroup);
    
    // Add label
    labelSystem.addLabel(minesGroup, "Eastern Mines", CONFIG.colors.mines);
    
    return minesGroup;
}

// Create sewers
function createSewers(scene, labelSystem) {
    const sewersGroup = new THREE.Group();
    
    // Main sewer entrance
    const entranceGeometry = new THREE.BoxGeometry(30, 15, 30);
    const entranceMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.sewers,
        metalness: 0.1,
        roughness: 0.9
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.castShadow = true;
    entrance.receiveShadow = true;
    sewersGroup.add(entrance);
    
    // Add sewer tunnels
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 12;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const tunnelGeometry = new THREE.CylinderGeometry(2, 2, 8, 8);
        const tunnelMaterial = new THREE.MeshStandardMaterial({
            color: 0x556b2f,
            metalness: 0.1,
            roughness: 0.8
        });
        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        tunnel.position.set(x, 4, z);
        tunnel.castShadow = true;
        tunnel.receiveShadow = true;
        sewersGroup.add(tunnel);
    }
    
    // Position the sewers group
    const position = CONFIG.positions.eastern.sewers;
    sewersGroup.position.set(position.x, position.y, position.z);
    scene.add(sewersGroup);
    
    // Add label
    labelSystem.addLabel(sewersGroup, "Sewers", CONFIG.colors.sewers);
    
    return sewersGroup;
}

console.log('Eastern regions module loaded!');