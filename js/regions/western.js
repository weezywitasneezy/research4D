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

// Create Fire Islands with enhanced visuals
function createFireIslands(scene, labelSystem) {
    const fireIslandsGroup = new THREE.Group();
    
    // Function to create a detailed volcanic island
    function createVolcanicIsland(radius, height, x, z, scale = 1.0) {
        const islandGroup = new THREE.Group();
        
        // Create detailed base with displacement
        const baseSegments = 32;
        const baseGeometry = new THREE.CylinderGeometry(
            radius, radius * 1.4, height, 
            baseSegments, 8, true
        );
        
        // Add displacement to the base vertices
        const positions = baseGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positions, i);
            
            // Add noise-based displacement
            const angle = Math.atan2(vertex.z, vertex.x);
            const distance = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
            const noise = Math.sin(angle * 4) * 0.1 + 
                         Math.sin(angle * 7) * 0.05 +
                         Math.cos(distance * 0.2) * 0.1;
            
            vertex.x += vertex.x * noise;
            vertex.z += vertex.z * noise;
            
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        baseGeometry.computeVertexNormals();
        
        // Create layered materials for the base
        const baseMaterials = [
            new THREE.MeshPhongMaterial({ 
                color: CONFIG.colors.fireIslands,
                shininess: 10,
                flatShading: true
            }),
            new THREE.MeshPhongMaterial({ 
                color: 0x8b4513,  // Saddle brown
                shininess: 5,
                flatShading: true
            })
        ];
        
        const base = new THREE.Mesh(baseGeometry, baseMaterials[0]);
        islandGroup.add(base);
        
        // Create detailed volcano with multiple layers
        const volcanoLayers = 3;
        for (let i = 0; i < volcanoLayers; i++) {
            const layerRadius = radius * (0.8 - i * 0.15);
            const layerHeight = height * (0.6 + i * 0.3);
            const segments = 16 - i * 2;
            
            const volcanoGeometry = new THREE.ConeGeometry(
                layerRadius, layerHeight, segments, 4,
                true  // Open-ended for layering
            );
            
            // Add surface detail
            const volcanoPositions = volcanoGeometry.attributes.position;
            for (let j = 0; j < volcanoPositions.count; j++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(volcanoPositions, j);
                
                // Add ridge and erosion patterns
                const angle = Math.atan2(vertex.z, vertex.x);
                const heightFactor = vertex.y / layerHeight;
                const noise = Math.sin(angle * segments) * 0.1 * (1 - heightFactor) +
                            Math.sin(angle * 3) * 0.05;
                
                vertex.x += vertex.x * noise;
                vertex.z += vertex.z * noise;
                
                volcanoPositions.setXYZ(j, vertex.x, vertex.y, vertex.z);
            }
            
            volcanoGeometry.computeVertexNormals();
            
            const volcanoMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8b0000,  // Dark red
                shininess: 15,
                flatShading: true
            });
            
            const volcanoLayer = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
            volcanoLayer.position.y = height * (0.4 + i * 0.2);
            islandGroup.add(volcanoLayer);
        }
        
        // Create detailed crater with lava pool
        const craterGeometry = new THREE.CylinderGeometry(
            radius * 0.3, radius * 0.4, height * 0.2, 
            16, 2, true
        );
        
        // Add detail to crater rim
        const craterPositions = craterGeometry.attributes.position;
        for (let i = 0; i < craterPositions.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(craterPositions, i);
            
            // Add jagged edges to crater rim
            const angle = Math.atan2(vertex.z, vertex.x);
            const noise = Math.sin(angle * 8) * 0.1 +
                         Math.sin(angle * 12) * 0.05;
            
            vertex.x += vertex.x * noise;
            vertex.z += vertex.z * noise;
            
            craterPositions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        craterGeometry.computeVertexNormals();
        
        const craterMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8b0000,
            shininess: 20,
            flatShading: true
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.y = height * 1.2;
        islandGroup.add(crater);
        
        // Create glowing lava pool
        const lavaPoolGeometry = new THREE.CircleGeometry(radius * 0.25, 16);
        const lavaPoolMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            transparent: true,
            opacity: 0.9
        });
        
        const lavaPool = new THREE.Mesh(lavaPoolGeometry, lavaPoolMaterial);
        lavaPool.rotation.x = -Math.PI / 2;
        lavaPool.position.y = height * 1.2;
        islandGroup.add(lavaPool);

        // Enhanced particle systems
        // Lava particles with improved distribution and movement
        const particleCount = 100;
        const lavaParticlesGeometry = new THREE.BufferGeometry();
        const lavaPositions = new Float32Array(particleCount * 3);
        const lavaSizes = new Float32Array(particleCount);
        const lavaColors = new Float32Array(particleCount * 3);
        const lavaVelocities = new Float32Array(particleCount * 3);
        const lavaLifetimes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Distribute particles in a disc shape
            const theta = Math.random() * Math.PI * 2;
            const r = Math.pow(Math.random(), 0.5) * radius * 0.2; // Square root for uniform distribution
            lavaPositions[i * 3] = Math.cos(theta) * r;
            lavaPositions[i * 3 + 1] = height * 1.2;
            lavaPositions[i * 3 + 2] = Math.sin(theta) * r;
            
            lavaSizes[i] = (Math.random() * 2 + 1) * scale;
            
            // Create color gradient from yellow to red
            const temperature = Math.random();
            lavaColors[i * 3] = 1.0; // Red always full
            lavaColors[i * 3 + 1] = temperature * 0.7; // Green varies
            lavaColors[i * 3 + 2] = temperature * 0.2; // Blue varies less
            
            // More varied velocities for interesting movement
            const speed = Math.random() * 0.1 + 0.05;
            const angle = Math.random() * Math.PI * 2;
            lavaVelocities[i * 3] = Math.cos(angle) * speed;
            lavaVelocities[i * 3 + 1] = Math.random() * 0.15 + 0.05;
            lavaVelocities[i * 3 + 2] = Math.sin(angle) * speed;
            
            // Add lifetime for particle recycling
            lavaLifetimes[i] = Math.random();
        }

        lavaParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(lavaPositions, 3));
        lavaParticlesGeometry.setAttribute('size', new THREE.BufferAttribute(lavaSizes, 1));
        lavaParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(lavaColors, 3));

        const lavaParticlesMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        const lavaParticles = new THREE.Points(lavaParticlesGeometry, lavaParticlesMaterial);
        lavaParticles.userData.velocities = lavaVelocities;
        lavaParticles.userData.lifetimes = lavaLifetimes;
        lavaParticles.userData.originalPositions = lavaPositions.slice();
        islandGroup.add(lavaParticles);

        // Enhanced smoke system with better visuals
        const smokeCount = 60;
        const smokeGeometry = new THREE.BufferGeometry();
        const smokePositions = new Float32Array(smokeCount * 3);
        const smokeSizes = new Float32Array(smokeCount);
        const smokeColors = new Float32Array(smokeCount * 3);
        const smokeVelocities = new Float32Array(smokeCount * 3);
        const smokeLifetimes = new Float32Array(smokeCount);

        for (let i = 0; i < smokeCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.15;
            smokePositions[i * 3] = Math.cos(theta) * r;
            smokePositions[i * 3 + 1] = height * 1.3;
            smokePositions[i * 3 + 2] = Math.sin(theta) * r;
            
            smokeSizes[i] = (Math.random() * 4 + 2) * scale;
            
            // Varied smoke colors
            const brightness = Math.random() * 0.3 + 0.4;
            const warmth = Math.random() * 0.1; // Add slight warmth to some particles
            smokeColors[i * 3] = brightness + warmth;
            smokeColors[i * 3 + 1] = brightness;
            smokeColors[i * 3 + 2] = brightness;
            
            // More natural smoke movement
            const speed = Math.random() * 0.05 + 0.02;
            smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.05;
            smokeVelocities[i * 3 + 1] = speed;
            smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
            
            smokeLifetimes[i] = Math.random();
        }

        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
        smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
        smokeGeometry.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));

        const smokeMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
        smoke.userData.velocities = smokeVelocities;
        smoke.userData.lifetimes = smokeLifetimes;
        smoke.userData.originalPositions = smokePositions.slice();
        islandGroup.add(smoke);

        // Add detailed rocky outcrops and formations
        const rockCount = 8;
        for (let i = 0; i < rockCount; i++) {
            const angle = (i / rockCount) * Math.PI * 2 + Math.random() * 0.5;
            const distance = radius * (0.6 + Math.random() * 0.3);
            
            // Create more complex rock geometry
            const points = [];
            const segments = 5 + Math.floor(Math.random() * 3);
            const rockHeight = height * (0.2 + Math.random() * 0.3);
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const radiusVar = 1 - Math.pow(t, 0.5); // Taper towards top
                points.push(new THREE.Vector2(
                    radius * 0.15 * radiusVar * (1 + Math.random() * 0.3),
                    rockHeight * t
                ));
            }
            
            const rockGeometry = new THREE.LatheGeometry(points, 5);
            
            // Add surface detail to rocks
            const rockPositions = rockGeometry.attributes.position;
            for (let j = 0; j < rockPositions.count; j++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(rockPositions, j);
                
                const noise = Math.sin(vertex.y * 2) * 0.1 +
                             Math.sin(vertex.x * 3) * 0.1;
                
                vertex.x += vertex.x * noise;
                vertex.z += vertex.z * noise;
                
                rockPositions.setXYZ(j, vertex.x, vertex.y, vertex.z);
            }
            
            rockGeometry.computeVertexNormals();
            
            const rockMaterial = new THREE.MeshPhongMaterial({
                color: 0x8b0000,
                shininess: 5,
                flatShading: true
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                Math.cos(angle) * distance,
                height * 0.15,
                Math.sin(angle) * distance
            );
            rock.rotation.set(
                Math.random() * 0.2,
                Math.random() * Math.PI,
                Math.random() * 0.2
            );
            islandGroup.add(rock);
        }

        // Position the island
        islandGroup.position.set(x, 0, z);
        islandGroup.scale.set(scale, scale, scale);
        
        return islandGroup;
    }

    // Create multiple volcanic islands with varied characteristics
    const islands = [
        createVolcanicIsland(30, 20, 0, 0, 1.0),          // Main central island
        createVolcanicIsland(20, 15, -70, 60, 0.8),       // Secondary island
        createVolcanicIsland(25, 18, 60, -40, 0.9),       // Third island
        createVolcanicIsland(15, 12, -40, -80, 0.7),      // Small island
        createVolcanicIsland(18, 14, 40, -100, 0.75)      // Another small island
    ];

    // Add all islands to the group
    islands.forEach(island => fireIslandsGroup.add(island));

    // Position the entire fire islands group
    const position = CONFIG.positions.western.fireIslands;
    fireIslandsGroup.position.set(
        position.x,
        position.y,
        position.z + 50  // Moved south
    );
    scene.add(fireIslandsGroup);
    
    // Add label
    labelSystem.addLabel(fireIslandsGroup, "Fire Islands", CONFIG.colors.fireIslands);
    
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