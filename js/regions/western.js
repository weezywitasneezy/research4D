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
    const fireIslandsGroup = new THREE.Group();
    
    // Function to create a volcanic island
    function createVolcanicIsland(radius, height, x, z, scale = 1.0) {
        const islandGroup = new THREE.Group();
        
        // Base island
        const baseGeometry = new THREE.CylinderGeometry(radius, radius * 1.2, height, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: CONFIG.colors.fireIslands
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        islandGroup.add(base);
        
        // Volcano cone
        const volcanoGeometry = new THREE.ConeGeometry(radius * 0.7, height * 1.2, 8);
        const volcanoMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xb22222 // Firebrick
        });
        const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
        volcano.position.y = height * 0.6;
        islandGroup.add(volcano);
        
        // Lava crater
        const craterGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.4, height * 0.2, 8);
        const craterMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4500, // OrangeRed
            transparent: true,
            opacity: 0.9
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.y = height * 1.2;
        islandGroup.add(crater);

        // Add glowing lava particles in the crater
        const particleCount = 50;
        const lavaParticlesGeometry = new THREE.BufferGeometry();
        const lavaPositions = new Float32Array(particleCount * 3);
        const lavaSizes = new Float32Array(particleCount);
        const lavaColors = new Float32Array(particleCount * 3);
        const lavaVelocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.2;
            lavaPositions[i * 3] = Math.cos(theta) * r;
            lavaPositions[i * 3 + 1] = height * 1.2;
            lavaPositions[i * 3 + 2] = Math.sin(theta) * r;
            
            lavaSizes[i] = (Math.random() * 2 + 1) * scale;
            
            // Random orange-red color for each particle
            lavaColors[i * 3] = Math.random() * 0.5 + 0.5; // Red
            lavaColors[i * 3 + 1] = Math.random() * 0.3; // Green
            lavaColors[i * 3 + 2] = 0; // Blue
            
            // Add vertical velocity for animation
            lavaVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
            lavaVelocities[i * 3 + 1] = Math.random() * 0.1;
            lavaVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }

        lavaParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(lavaPositions, 3));
        lavaParticlesGeometry.setAttribute('size', new THREE.BufferAttribute(lavaSizes, 1));
        lavaParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(lavaColors, 3));

        const lavaParticlesMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const lavaParticles = new THREE.Points(lavaParticlesGeometry, lavaParticlesMaterial);
        lavaParticles.userData.velocities = lavaVelocities;
        lavaParticles.userData.originalPositions = lavaPositions.slice();
        islandGroup.add(lavaParticles);

        // Add smoke particles above the crater
        const smokeCount = 30;
        const smokeGeometry = new THREE.BufferGeometry();
        const smokePositions = new Float32Array(smokeCount * 3);
        const smokeSizes = new Float32Array(smokeCount);
        const smokeColors = new Float32Array(smokeCount * 3);
        const smokeVelocities = new Float32Array(smokeCount * 3);

        for (let i = 0; i < smokeCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.2;
            smokePositions[i * 3] = Math.cos(theta) * r;
            smokePositions[i * 3 + 1] = height * 1.3;
            smokePositions[i * 3 + 2] = Math.sin(theta) * r;
            
            smokeSizes[i] = (Math.random() * 3 + 2) * scale;
            
            // Gray color with slight variation
            const gray = Math.random() * 0.3 + 0.4;
            smokeColors[i * 3] = gray;
            smokeColors[i * 3 + 1] = gray;
            smokeColors[i * 3 + 2] = gray;
            
            // Add upward and slight horizontal velocity
            smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.05;
            smokeVelocities[i * 3 + 1] = Math.random() * 0.1 + 0.05;
            smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
        }

        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
        smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
        smokeGeometry.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));

        const smokeMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });

        const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
        smoke.userData.velocities = smokeVelocities;
        smoke.userData.originalPositions = smokePositions.slice();
        islandGroup.add(smoke);

        // Add some rocky outcrops around the base
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = radius * (0.7 + Math.random() * 0.3);
            const rockGeometry = new THREE.ConeGeometry(
                radius * 0.2,
                height * (0.3 + Math.random() * 0.3),
                4
            );
            const rockMaterial = new THREE.MeshLambertMaterial({
                color: 0x8b0000 // Dark red
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                Math.cos(angle) * distance,
                height * 0.15,
                Math.sin(angle) * distance
            );
            rock.rotation.y = Math.random() * Math.PI;
            islandGroup.add(rock);
        }

        // Position the island
        islandGroup.position.set(x, 0, z);
        islandGroup.scale.set(scale, scale, scale);
        
        return islandGroup;
    }

    // Create multiple volcanic islands of varying sizes
    const islands = [
        createVolcanicIsland(30, 20, 0, 0, 1.0),          // Main central island
        createVolcanicIsland(20, 15, -70, 60, 0.8),       // Secondary island, further out
        createVolcanicIsland(25, 18, 60, -40, 0.9),       // Third island, spread east
        createVolcanicIsland(15, 12, -40, -80, 0.7),      // Small island, further south
        createVolcanicIsland(18, 14, 40, -100, 0.75)      // Another small island, far south
    ];

    // Add all islands to the group
    islands.forEach(island => fireIslandsGroup.add(island));

    // Position the entire fire islands group
    const position = CONFIG.positions.western.fireIslands;
    // Shift the entire group south
    fireIslandsGroup.position.set(
        position.x,
        position.y,
        position.z + 50  // Move 50 units south
    );
    scene.add(fireIslandsGroup);
    
    // Add label
    labelSystem.addLabel(fireIslandsGroup, "Fire Islands", CONFIG.colors.fireIslands);
    
    // Return the group for animation updates
    return fireIslandsGroup;
}

// Create Hell's End Continent
function createHellsEnd(scene, labelSystem) {
    // Hell's End Continent
    const hellsEndGeometry = new THREE.BoxGeometry(100, 15, 400);
    const hellsEndMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.hellsEnd
    });
    const hellsEnd = new THREE.Mesh(hellsEndGeometry, hellsEndMaterial);
    
    // Add volcanic terrain features
    const terrainFeatures = new THREE.Group();
    
    // Create volcanic mountains
    for (let i = 0; i < 8; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 380;
        const height = 10 + Math.random() * 15;
        const radius = 5 + Math.random() * 10;
        
        const mountainGeometry = new THREE.ConeGeometry(radius, height, 8);
        const mountainMaterial = new THREE.MeshLambertMaterial({
            color: 0x8b0000 // Dark red
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(x, height/2 + 7.5, z);
        
        terrainFeatures.add(mountain);
        
       // Add lava pool to some mountains
       if (Math.random() > 0.5) {
        const poolGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, 1, 8);
        const poolMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500 // OrangeRed
        });
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.position.set(x, height + 7.5, z);
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
const hellsGateMaterial = new THREE.MeshLambertMaterial({ 
    color: CONFIG.colors.hellsGate
});
const hellsGate = new THREE.Mesh(hellsGateGeometry, hellsGateMaterial);

// Add gate structures
const gateGeometry = new THREE.BoxGeometry(50, 40, 5);
const gateMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x8b0000 // Dark red
});
const gate = new THREE.Mesh(gateGeometry, gateMaterial);
gate.position.set(0, 20, 0);
hellsGate.add(gate);

// Create gate opening
const openingGeometry = new THREE.BoxGeometry(20, 30, 10);
const openingMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000 // Black
});
const opening = new THREE.Mesh(openingGeometry, openingMaterial);
opening.position.set(0, 15, 0);
hellsGate.add(opening);

// Add towers on either side of the gate
const towerGeometry = new THREE.CylinderGeometry(5, 7, 50, 8);
const towerMaterial = new THREE.MeshLambertMaterial({
    color: 0x800000 // Maroon
});

const leftTower = new THREE.Mesh(towerGeometry, towerMaterial);
leftTower.position.set(-22, 25, 0);
hellsGate.add(leftTower);

const rightTower = new THREE.Mesh(towerGeometry, towerMaterial);
rightTower.position.set(22, 25, 0);
hellsGate.add(rightTower);

// Add flaming effects on top of towers
const flameGeometry = new THREE.ConeGeometry(5, 10, 8);
const flameMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6347, // Tomato
    transparent: true,
    opacity: 0.8
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
const position = CONFIG.positions.western.hellsEnd;
hellsEndGroup.position.set(position.x, position.y, position.z);
scene.add(hellsEndGroup);

return hellsEndGroup;
}

console.log('Western regions module loaded!');