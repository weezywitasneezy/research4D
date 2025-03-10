// Eastern regions implementation
import { CONFIG } from '../core/config.js';

// Create Eastern continent and all its sub-regions
export function createEasternContinent(scene, labelSystem) {
    const elements = {
        continent: createMainContinent(scene, labelSystem),
        farms: createVerticalFarms(scene, labelSystem),
        industrial: createIndustrialArea(scene, labelSystem),
        capital: createSeasideCapital(scene, labelSystem),
        mines: createEasternMines(scene, labelSystem),
        sewers: createSewers(scene, labelSystem)
    };
    
    return elements;
}

// Create main continent body
function createMainContinent(scene, labelSystem) {
    const eastContinentGroup = new THREE.Group();
    
    // Using a combination of shapes for more natural look
    const mainContinentGeometry = new THREE.BoxGeometry(140, 12, 180);
    const mainContinentMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.easternContinent
    });
    const mainContinent = new THREE.Mesh(mainContinentGeometry, mainContinentMaterial);
    eastContinentGroup.add(mainContinent);
    
    // Adding a slightly elevated plateau for terrain variation
    const plateauGeometry = new THREE.BoxGeometry(80, 4, 100);
    const plateauMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xb0b0b0 
    });
    const plateau = new THREE.Mesh(plateauGeometry, plateauMaterial);
    plateau.position.set(-20, 8, -20);
    eastContinentGroup.add(plateau);
    
    // Adding coastal ridges
    const coastalRidgeGeometry = new THREE.BoxGeometry(10, 8, 180);
    const coastalRidgeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x909090 
    });
    const coastalRidge = new THREE.Mesh(coastalRidgeGeometry, coastalRidgeMaterial);
    coastalRidge.position.set(-65, 4, 0);
    eastContinentGroup.add(coastalRidge);
    
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
    const farmBaseGeometry = new THREE.BoxGeometry(60, 8, 60);
    const farmBaseMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x729f00 // Darker green base
    });
    const farmBase = new THREE.Mesh(farmBaseGeometry, farmBaseMaterial);
    verticalFarmGroup.add(farmBase);
    
    // Creating multiple vertical farm towers
    const createFarmTower = (x, z, height, radius) => {
        const towerGeometry = new THREE.CylinderGeometry(radius, radius, height, 8);
        const towerMaterial = new THREE.MeshLambertMaterial({ 
            color: CONFIG.colors.farmRegion
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
    
    // Create several farm towers of varying heights
    createFarmTower(-15, -15, 20, 5);
    createFarmTower(0, 0, 24, 6);
    createFarmTower(15, 10, 18, 5);
    createFarmTower(-10, 15, 22, 4);
    createFarmTower(12, -12, 26, 5);
    
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
    
    // Base industrial zone
    const industrialBaseGeometry = new THREE.BoxGeometry(60, 6, 70);
    const industrialBaseMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x505050 // Dark gray
    });
    const industrialBase = new THREE.Mesh(industrialBaseGeometry, industrialBaseMaterial);
    industrialAreaGroup.add(industrialBase);
    
    // Factory buildings
    const factoryGeometry = new THREE.BoxGeometry(15, 15, 20);
    const factoryMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.industrialArea
    });
    
    // Factory buildings
    const factory1 = new THREE.Mesh(factoryGeometry, factoryMaterial);
    factory1.position.set(-15, 10.5, -20);
    industrialAreaGroup.add(factory1);
    
    const factory2 = new THREE.Mesh(factoryGeometry, factoryMaterial);
    factory2.position.set(10, 10.5, 0);
    industrialAreaGroup.add(factory2);
    
    const factory3 = new THREE.Mesh(factoryGeometry, factoryMaterial);
    factory3.position.set(-5, 10.5, 25);
    industrialAreaGroup.add(factory3);
    
    // Smoke stacks
    const smokestackGeometry = new THREE.CylinderGeometry(2, 2.5, 25, 8);
    const smokestackMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xa0a0a0 
    });
    
    // Add smokestacks
    const addSmokestack = (x, z) => {
        const smokestack = new THREE.Mesh(smokestackGeometry, smokestackMaterial);
        smokestack.position.set(x, 23, z);
        industrialAreaGroup.add(smokestack);
    };
    
    addSmokestack(-15, -20);
    addSmokestack(10, 0);
    addSmokestack(-5, 25);
    
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
    // Implementation similar to above, focused on creating the seaside capital
    // ...
    
    // For brevity, this is simplified - you would implement the full city details
    const seasideCapitalGroup = new THREE.Group();
    
    // Main city base
    const cityBaseGeometry = new THREE.CylinderGeometry(25, 30, 5, 8);
    const cityBaseMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.seasideCapital
    });
    const cityBase = new THREE.Mesh(cityBaseGeometry, cityBaseMaterial);
    cityBase.position.y = 2.5;
    seasideCapitalGroup.add(cityBase);
    
    // Position the city group
    const position = CONFIG.positions.eastern.capital;
    seasideCapitalGroup.position.set(position.x, position.y, position.z);
    scene.add(seasideCapitalGroup);
    
    // Add label
    labelSystem.addLabel(seasideCapitalGroup, "Seaside Capital", CONFIG.colors.seasideCapital);
    
    return seasideCapitalGroup;
}

// Create eastern mines
function createEasternMines(scene, labelSystem) {
    // Create the underground mines
    const mineGeometry = new THREE.SphereGeometry(30, 8, 8);
    const mineMaterial = new THREE.MeshBasicMaterial({ 
        color: CONFIG.colors.mines,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const mineSystem = new THREE.Mesh(mineGeometry, mineMaterial);
    
    // Position the mines
    const position = CONFIG.positions.eastern.mines;
    mineSystem.position.set(position.x, position.y, position.z);
    scene.add(mineSystem);
    
    // Add label
    labelSystem.addLabel(mineSystem, "Eastern Mines", CONFIG.colors.mines);
    
    return mineSystem;
}

// Create sewers
function createSewers(scene, labelSystem) {
    // Create the sewers
    const sewerGeometry = new THREE.CylinderGeometry(20, 25, 10, 8, 1, true);
    const sewerMaterial = new THREE.MeshBasicMaterial({ 
        color: CONFIG.colors.sewers,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const sewers = new THREE.Mesh(sewerGeometry, sewerMaterial);
    
    // Position the sewers
    const position = CONFIG.positions.eastern.sewers;
    sewers.position.set(position.x, position.y, position.z);
    scene.add(sewers);
    
    // Add label
    labelSystem.addLabel(sewers, "Mutant Sewers", CONFIG.colors.sewers);
    
    return sewers;
}