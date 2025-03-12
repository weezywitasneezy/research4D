// Western regions implementation
import { config } from '../core/config.js';

// Create Western regions and related structures
export function createWesternRegions(scene, labelSystem) {
    const elements = {
        fireIslands: createFireIslands(scene, labelSystem),
        hellsEnd: createHellsEnd(scene, labelSystem),
        hellsGate: createHellsGate(scene, labelSystem)
    };
    
    return elements;
}

// Create Fire Islands
function createFireIslands(scene, labelSystem) {
    // Fire Islands
    const fireIslandsGeometry = new THREE.CylinderGeometry(30, 35, 20, 8);
    const fireIslandsMaterial = new THREE.MeshLambertMaterial({ 
        color: config.get('colors.fireIslands')
    });
    const fireIslands = new THREE.Mesh(fireIslandsGeometry, fireIslandsMaterial);
    
    // Add some volcanic features
    const volcanoGeometry = new THREE.ConeGeometry(8, 15, 8);
    const volcanoMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xb22222 // Firebrick
    });
    
    const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
    volcano.position.set(0, 10, 0);
    fireIslands.add(volcano);
    
    // Create lava pool (crater)
    const craterGeometry = new THREE.CylinderGeometry(3, 5, 2, 8);
    const craterMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4500 // OrangeRed
    });
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.set(0, 17.5, 0);
    fireIslands.add(crater);
    
    // Position the fire islands
    const position = config.get('positions.western.fireIslands');
    fireIslands.position.set(position.x, position.y, position.z);
    scene.add(fireIslands);
    
    // Add label
    labelSystem.addLabel(fireIslands, "Fire Islands", config.get('colors.fireIslands'));
    
    return fireIslands;
}

// Create Hell's End Continent
function createHellsEnd(scene, labelSystem) {
    // Hell's End Continent
    const hellsEndGeometry = new THREE.BoxGeometry(100, 15, 400);
    const hellsEndMaterial = new THREE.MeshLambertMaterial({ 
        color: config.get('colors.hellsEnd')
    });
    const hellsEnd = new THREE.Mesh(hellsEndGeometry, hellsEndMaterial);
    
    // Position Hell's End
    const position = config.get('positions.western.hellsEnd');
    hellsEnd.position.set(position.x, position.y, position.z);
    scene.add(hellsEnd);
    
    // Add label
    labelSystem.addLabel(hellsEnd, "Hell's End", config.get('colors.hellsEnd'));
    
    return hellsEnd;
}

// Create Hell's End Gate Capital
function createHellsGate(scene, labelSystem) {
    // Hell's End Gate Capital
    const hellsGateGeometry = new THREE.CylinderGeometry(25, 25, 25, 8);
    const hellsGateMaterial = new THREE.MeshLambertMaterial({ 
        color: config.get('colors.hellsGate')
    });
    const hellsGate = new THREE.Mesh(hellsGateGeometry, hellsGateMaterial);
    
    // Position Hell's Gate
    const position = config.get('positions.western.hellsGate');
    hellsGate.position.set(position.x, position.y, position.z);
    scene.add(hellsGate);
    
    // Add label
    labelSystem.addLabel(hellsGate, "Hell's End Gate", config.get('colors.hellsGate'));
    
    return hellsGate;
}

// Add volcanic features to Hell's End (optional enhancement)
function addVolcanicFeatures(scene, hellsEnd) {
const hellsEndGroup = new THREE.Group();

// Base is the existing Hell's End continent
hellsEndGroup.add(hellsEnd);

// Add volcanoes
const createVolcano = (x, z, height, radius) => {
    // Volcano cone
    const coneGeometry = new THREE.ConeGeometry(radius, height, 8);
    const coneMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B0000 // Dark red
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    
    // Position the volcano relative to Hell's End
    cone.position.set(x, height/2 + 7.5, z); // 7.5 is half the height of Hell's End
    hellsEndGroup.add(cone);
    
    // Add crater
    const craterGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.5, height * 0.2, 8);
    const craterMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFF4500 // Orange red
    });
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.set(x, height + 5, z);
    hellsEndGroup.add(crater);
    
    return cone;
};

// Create several volcanoes on Hell's End
createVolcano(-40, -150, 30, 15);
createVolcano(-40, 0, 25, 12);
createVolcano(-40, 150, 35, 18);
createVolcano(40, -180, 28, 14);
createVolcano(40, 50, 32, 16);

// Position the entire group
const position = config.get('positions.western.hellsEnd');
hellsEndGroup.position.set(position.x, position.y, position.z);
scene.add(hellsEndGroup);

return hellsEndGroup;
}