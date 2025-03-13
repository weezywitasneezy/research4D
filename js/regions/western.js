// Western regions implementation
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

// Create Western regions and related structures
export function createWesternRegion(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
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
    const fireIslandsMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.fireIslands,
        metalness: 0.3,
        roughness: 0.4
    });
    const fireIslands = new THREE.Mesh(fireIslandsGeometry, fireIslandsMaterial);
    fireIslands.castShadow = true;
    fireIslands.receiveShadow = true;
    
    // Add some volcanic features
    const volcanoGeometry = new THREE.ConeGeometry(8, 15, 8);
    const volcanoMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xb22222, // Firebrick
        metalness: 0.2,
        roughness: 0.6
    });
    
    const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
    volcano.position.set(0, 10, 0);
    volcano.castShadow = true;
    volcano.receiveShadow = true;
    fireIslands.add(volcano);
    
    // Create lava pool (crater)
    const craterGeometry = new THREE.CylinderGeometry(3, 5, 2, 8);
    const craterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff4500, // OrangeRed
        metalness: 0.1,
        roughness: 0.3,
        emissive: 0xff4500,
        emissiveIntensity: 0.5
    });
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.set(0, 17.5, 0);
    crater.castShadow = true;
    crater.receiveShadow = true;
    fireIslands.add(crater);
    
    // Position the fire islands
    const position = CONFIG.positions.western.fireIslands;
    fireIslands.position.set(position.x, position.y, position.z);
    scene.add(fireIslands);
    
    // Add label
    labelSystem.addLabel(fireIslands, "Fire Islands", CONFIG.colors.fireIslands);
    
    return fireIslands;
}

// Create Hell's End Continent
function createHellsEnd(scene, labelSystem) {
    // Hell's End Continent
    const hellsEndGeometry = new THREE.BoxGeometry(100, 15, 400);
    const hellsEndMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.hellsEnd,
        metalness: 0.2,
        roughness: 0.7
    });
    const hellsEnd = new THREE.Mesh(hellsEndGeometry, hellsEndMaterial);
    hellsEnd.castShadow = true;
    hellsEnd.receiveShadow = true;
    
    // Add volcanic terrain features
    const terrainFeatures = new THREE.Group();
    
    // Create volcanic mountains
    for (let i = 0; i < 8; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 380;
        const height = 10 + Math.random() * 15;
        const radius = 5 + Math.random() * 10;
        
        const mountainGeometry = new THREE.ConeGeometry(radius, height, 8);
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000, // Dark red
            metalness: 0.1,
            roughness: 0.8
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(x, height/2 + 7.5, z);
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        
        terrainFeatures.add(mountain);
        
        // Add lava pool to some mountains
        if (Math.random() > 0.5) {
            const poolGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, 1, 8);
            const poolMaterial = new THREE.MeshStandardMaterial({
                color: 0xff4500, // OrangeRed
                metalness: 0.1,
                roughness: 0.3,
                emissive: 0xff4500,
                emissiveIntensity: 0.3
            });
            const pool = new THREE.Mesh(poolGeometry, poolMaterial);
            pool.position.set(x, height + 7.5, z);
            pool.castShadow = true;
            pool.receiveShadow = true;
            terrainFeatures.add(pool);
        }
    }

    hellsEnd.add(terrainFeatures);

    // Position Hell's End
    const position = CONFIG.positions.western.hellsEnd;
    hellsEnd.position.set(position.x, position.y, position.z);
    scene.add(hellsEnd);

    // Add label
    labelSystem.addLabel(hellsEnd, "Hell's End", CONFIG.colors.hellsEnd);

    return hellsEnd;
}

// Create Hell's End Gate Capital
function createHellsGate(scene, labelSystem) {
    // Hell's End Gate Capital
    const hellsGateGeometry = new THREE.CylinderGeometry(25, 25, 25, 8);
    const hellsGateMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.hellsGate,
        metalness: 0.4,
        roughness: 0.5
    });
    const hellsGate = new THREE.Mesh(hellsGateGeometry, hellsGateMaterial);
    hellsGate.castShadow = true;
    hellsGate.receiveShadow = true;

    // Add gate structures
    const gateGeometry = new THREE.BoxGeometry(50, 40, 5);
    const gateMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b0000, // Dark red
        metalness: 0.3,
        roughness: 0.6
    });
    const gate = new THREE.Mesh(gateGeometry, gateMaterial);
    gate.position.set(0, 20, 0);
    gate.castShadow = true;
    gate.receiveShadow = true;
    hellsGate.add(gate);

    // Create gate opening
    const openingGeometry = new THREE.BoxGeometry(20, 30, 10);
    const openingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000, // Black
        metalness: 0.1,
        roughness: 0.9,
        emissive: 0xff4500,
        emissiveIntensity: 0.2
    });
    const opening = new THREE.Mesh(openingGeometry, openingMaterial);
    opening.position.set(0, 15, 0);
    opening.castShadow = true;
    opening.receiveShadow = true;
    hellsGate.add(opening);

    // Add towers on either side of the gate
    const towerGeometry = new THREE.CylinderGeometry(5, 7, 50, 8);
    const towerMaterial = new THREE.MeshStandardMaterial({
        color: 0x800000, // Maroon
        metalness: 0.3,
        roughness: 0.7
    });

    const leftTower = new THREE.Mesh(towerGeometry, towerMaterial);
    leftTower.position.set(-22, 25, 0);
    leftTower.castShadow = true;
    leftTower.receiveShadow = true;
    hellsGate.add(leftTower);

    const rightTower = new THREE.Mesh(towerGeometry, towerMaterial);
    rightTower.position.set(22, 25, 0);
    rightTower.castShadow = true;
    rightTower.receiveShadow = true;
    hellsGate.add(rightTower);

    // Add flaming effects on top of towers
    const flameGeometry = new THREE.ConeGeometry(5, 10, 8);
    const flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6347, // Tomato
        transparent: true,
        opacity: 0.8,
        metalness: 0.1,
        roughness: 0.2,
        emissive: 0xff6347,
        emissiveIntensity: 0.8
    });

    const leftFlame = new THREE.Mesh(flameGeometry, flameMaterial);
    leftFlame.position.set(0, 30, 0);
    leftTower.add(leftFlame);

    const rightFlame = new THREE.Mesh(flameGeometry, flameMaterial);
    rightFlame.position.set(0, 30, 0);
    rightTower.add(rightFlame);

    // Position Hell's Gate
    const position = CONFIG.positions.western.hellsGate;
    hellsGate.position.set(position.x, position.y, position.z);
    scene.add(hellsGate);

    // Add label
    labelSystem.addLabel(hellsGate, "Hell's End Gate", CONFIG.colors.hellsGate);

    return hellsGate;
}

// Add volcanic features to Hell's End (optional enhancement)
export function addVolcanicFeatures(scene, hellsEnd) {
    const hellsEndGroup = new THREE.Group();

    // Base is the existing Hell's End continent
    hellsEndGroup.add(hellsEnd);

    // Add volcanoes
    const createVolcano = (x, z, height, radius) => {
        // Volcano cone
        const coneGeometry = new THREE.ConeGeometry(radius, height, 8);
        const coneMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B0000, // Dark red
            metalness: 0.2,
            roughness: 0.7
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.castShadow = true;
        cone.receiveShadow = true;
        
        // Position the volcano relative to Hell's End
        cone.position.set(x, height/2 + 7.5, z); // 7.5 is half the height of Hell's End
        hellsEndGroup.add(cone);
        
        // Add crater
        const craterGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.5, height * 0.2, 8);
        const craterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF4500, // Orange red
            metalness: 0.1,
            roughness: 0.3,
            emissive: 0xFF4500,
            emissiveIntensity: 0.4
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(x, height + 5, z);
        crater.castShadow = true;
        crater.receiveShadow = true;
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
    const position = CONFIG.positions.western.hellsEnd;
    hellsEndGroup.position.set(position.x, position.y, position.z);
    scene.add(hellsEndGroup);

    return hellsEndGroup;
}

console.log('Western regions module loaded!');