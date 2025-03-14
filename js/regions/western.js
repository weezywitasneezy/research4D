// Western regions implementation
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

// Create Western regions and related structures
export function createWesternRegion(scene, labelSystem, animations) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
    const elements = {
        fireIslands: createFireIslands(scene, labelSystem, animations),
        hellsEnd: createHellsEnd(scene, labelSystem, animations),
        hellsGate: createHellsGate(scene, labelSystem, animations)
    };
    
    return elements;
}

// Create Fire Islands
function createFireIslands(scene, labelSystem, animations) {
    const fireIslandsGroup = new THREE.Group();
    
    // Function to create a volcanic island
    function createVolcanicIsland(radius, height, x, z, scale = 1.0) {
        const islandGroup = new THREE.Group();
        
        // Create more detailed base with irregular edges
        const baseSegments = 16;
        const baseGeometry = new THREE.CylinderBufferGeometry(radius, radius * 1.3, height, baseSegments);
        // Modify vertices to create irregular edges
        const basePositions = baseGeometry.attributes.position.array;
        for (let i = 0; i < basePositions.length; i += 3) {
            if (basePositions[i + 1] > 0) { // Only modify top vertices
                const angle = Math.atan2(basePositions[i + 2], basePositions[i]);
                const distortion = (Math.sin(angle * 3) * 0.2 + Math.cos(angle * 2) * 0.3) * radius;
                basePositions[i] *= 1 + distortion;
                basePositions[i + 2] *= 1 + distortion;
            }
        }
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.colors.fireIslands,
            shininess: 10,
            flatShading: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        islandGroup.add(base);
        
        // Create detailed volcano with terraced layers
        const volcanoLayers = 5;
        const layerHeight = height * 1.2 / volcanoLayers;
        for (let i = 0; i < volcanoLayers; i++) {
            const layerRadius = radius * 0.7 * (1 - i / volcanoLayers);
            const layerGeometry = new THREE.CylinderBufferGeometry(
                layerRadius,
                layerRadius * 1.2,
                layerHeight,
                12
            );
            // Add surface detail to each layer
            const layerPositions = layerGeometry.attributes.position.array;
            for (let j = 0; j < layerPositions.length; j += 3) {
                layerPositions[j] += (Math.random() - 0.5) * layerRadius * 0.1;
                layerPositions[j + 2] += (Math.random() - 0.5) * layerRadius * 0.1;
            }
            const layerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0xb22222).multiplyScalar(1 - i * 0.1),
                shininess: 5,
                flatShading: true
            });
            const layer = new THREE.Mesh(layerGeometry, layerMaterial);
            layer.position.y = height * 0.6 + i * layerHeight;
            islandGroup.add(layer);
        }
        
        // Create detailed crater with inner structure
        const craterGroup = new THREE.Group();
        
        // Outer crater rim
        const rimGeometry = new THREE.TorusBufferGeometry(radius * 0.4, radius * 0.1, 16, 32);
        const rimMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b0000,
            shininess: 20,
            flatShading: true
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = height * 1.2;
        craterGroup.add(rim);
        
        // Inner crater with lava
        const innerCraterGeometry = new THREE.CylinderBufferGeometry(radius * 0.35, radius * 0.3, height * 0.3, 16);
        const innerCraterMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4500,
            emissive: 0xff2200,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        const innerCrater = new THREE.Mesh(innerCraterGeometry, innerCraterMaterial);
        innerCrater.position.y = height * 1.1;
        craterGroup.add(innerCrater);
        
        // Add glowing lava particles with improved effect
        const particleCount = 100;
        const lavaParticlesGeometry = new THREE.BufferGeometry();
        const lavaPositions = new Float32Array(particleCount * 3);
        const lavaSizes = new Float32Array(particleCount);
        const lavaColors = new Float32Array(particleCount * 3);
        const lavaVelocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.3;
            const height_offset = Math.random() * height * 0.2;
            lavaPositions[i * 3] = Math.cos(theta) * r;
            lavaPositions[i * 3 + 1] = height * 1.1 + height_offset;
            lavaPositions[i * 3 + 2] = Math.sin(theta) * r;
            
            lavaSizes[i] = (Math.random() * 3 + 2) * scale;
            
            const temp = Math.random();
            lavaColors[i * 3] = Math.min(1, 0.7 + temp * 0.3);
            lavaColors[i * 3 + 1] = Math.max(0, temp * 0.5);
            lavaColors[i * 3 + 2] = Math.max(0, temp * 0.2);
            
            const speed = Math.random() * 0.15 + 0.05;
            lavaVelocities[i * 3] = (Math.random() - 0.5) * speed;
            lavaVelocities[i * 3 + 1] = Math.random() * speed * 2;
            lavaVelocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
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
        lavaParticles.userData.originalPositions = lavaPositions.slice();
        lavaParticles.userData.maxHeight = height * 1.3;
        lavaParticles.userData.baseHeight = height * 1.1;
        craterGroup.add(lavaParticles);

        // Register lava particles with animation system
        if (animations) {
            animations.registerHellsEndParticles(lavaParticles);
        }

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
            const r = Math.random() * radius * 0.2;
            smokePositions[i * 3] = Math.cos(theta) * r;
            smokePositions[i * 3 + 1] = height * 1.3;
            smokePositions[i * 3 + 2] = Math.sin(theta) * r;
            
            smokeSizes[i] = (Math.random() * 4 + 3) * scale;
            
            const brightness = Math.random() * 0.3 + 0.4;
            const warmth = Math.random() * 0.1;
            smokeColors[i * 3] = brightness + warmth;
            smokeColors[i * 3 + 1] = brightness + warmth * 0.5;
            smokeColors[i * 3 + 2] = brightness;
            
            const windSpeed = Math.random() * 0.1 + 0.05;
            smokeVelocities[i * 3] = (Math.random() - 0.5) * windSpeed;
            smokeVelocities[i * 3 + 1] = Math.random() * windSpeed + 0.05;
            smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * windSpeed;
            
            smokeLifetimes[i] = Math.random();
        }

        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
        smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
        smokeGeometry.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));

        const smokeMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
        smoke.userData.velocities = smokeVelocities;
        smoke.userData.originalPositions = smokePositions.slice();
        smoke.userData.lifetimes = smokeLifetimes;
        smoke.userData.maxHeight = height * 1.8;
        smoke.userData.baseHeight = height * 1.3;
        craterGroup.add(smoke);

        // Register smoke particles with animation system
        if (animations) {
            animations.registerHellsEndParticles(smoke);
        }

        islandGroup.add(craterGroup);

        // Add detailed rocky formations around the base
        const rockCount = 12;
        for (let i = 0; i < rockCount; i++) {
            const angle = (i / rockCount) * Math.PI * 2;
            const distance = radius * (0.7 + Math.random() * 0.3);
            
            // Create more complex rock geometry
            const rockGeometry = new THREE.DodecahedronBufferGeometry(radius * 0.2);
            // Distort vertices for more natural look
            const rockPositions = rockGeometry.attributes.position.array;
            for (let j = 0; j < rockPositions.length; j += 3) {
                rockPositions[j] *= 1 + (Math.random() - 0.5) * 0.3;
                rockPositions[j + 1] *= 1 + (Math.random() - 0.5) * 0.3;
                rockPositions[j + 2] *= 1 + (Math.random() - 0.5) * 0.3;
            }
            
            const rockMaterial = new THREE.MeshPhongMaterial({
                color: 0x8b0000,
                shininess: 5,
                flatShading: true
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            // Position and rotate rocks naturally
            rock.position.set(
                Math.cos(angle) * distance,
                height * 0.15,
                Math.sin(angle) * distance
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.scale.set(
                1 + Math.random() * 0.5,
                0.8 + Math.random() * 0.4,
                1 + Math.random() * 0.5
            );
            
            islandGroup.add(rock);
            
            // Add smaller debris around larger rocks
            if (Math.random() > 0.5) {
                const debrisCount = Math.floor(Math.random() * 3) + 2;
                for (let k = 0; k < debrisCount; k++) {
                    const debrisGeometry = new THREE.TetrahedronBufferGeometry(radius * 0.05);
                    const debris = new THREE.Mesh(debrisGeometry, rockMaterial);
                    const debrisAngle = angle + (Math.random() - 0.5) * 0.5;
                    const debrisDistance = distance + (Math.random() - 0.5) * radius * 0.2;
                    debris.position.set(
                        Math.cos(debrisAngle) * debrisDistance,
                        height * 0.1,
                        Math.sin(debrisAngle) * debrisDistance
                    );
                    debris.rotation.set(
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        Math.random() * Math.PI
                    );
                    islandGroup.add(debris);
                }
            }
        }

        // Add lava flows on some sides
        const flowCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < flowCount; i++) {
            const flowAngle = Math.random() * Math.PI * 2;
            const flowStart = height * 0.8;
            const flowLength = height * 0.6;
            const flowWidth = radius * 0.15;
            
            const flowShape = new THREE.Shape();
            flowShape.moveTo(-flowWidth / 2, 0);
            flowShape.quadraticCurveTo(-flowWidth / 4, flowLength / 3, -flowWidth / 8, flowLength);
            flowShape.quadraticCurveTo(0, flowLength * 1.1, flowWidth / 8, flowLength);
            flowShape.quadraticCurveTo(flowWidth / 4, flowLength / 3, flowWidth / 2, 0);
            flowShape.lineTo(-flowWidth / 2, 0);
            
            const flowGeometry = new THREE.ShapeGeometry(flowShape);
            const flowMaterial = new THREE.MeshPhongMaterial({
                color: 0xff4500,
                emissive: 0xff2200,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            
            const flow = new THREE.Mesh(flowGeometry, flowMaterial);
            flow.position.set(
                Math.cos(flowAngle) * radius * 0.5,
                flowStart,
                Math.sin(flowAngle) * radius * 0.5
            );
            flow.rotation.set(-Math.PI / 2, 0, flowAngle);
            islandGroup.add(flow);
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
function createHellsEnd(scene, labelSystem, animations) {
    const hellsEndGroup = new THREE.Group();

    // Create detailed terrain base
    const terrainGeometry = new THREE.PlaneBufferGeometry(100, 400, 50, 200);
    const terrainPositions = terrainGeometry.attributes.position.array;
    
    // Generate realistic terrain using multiple noise passes
    for (let i = 0; i < terrainPositions.length; i += 3) {
        const x = terrainPositions[i];
        const z = terrainPositions[i + 2];
        
        // Large scale features
        let height = (Math.sin(x * 0.02) + Math.cos(z * 0.02)) * 5;
        
        // Medium scale terrain variation
        height += (Math.sin(x * 0.05 + z * 0.03) + Math.cos(x * 0.03 + z * 0.05)) * 3;
        
        // Small scale roughness
        height += (Math.random() - 0.5) * 2;
        
        terrainPositions[i + 1] = height + 15; // Base height
    }
    
    // Create custom normal material for better lighting
    const terrainMaterial = new THREE.MeshPhongMaterial({
        color: CONFIG.colors.hellsEnd,
        shininess: 5,
        flatShading: true
    });
    
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    hellsEndGroup.add(terrain);

    // Create volcanic mountain range
    const mountainCount = 15;
    const mountains = new THREE.Group();
    
    // Function to create a detailed volcanic mountain
    const createVolcanicMountain = (x, z, scale) => {
        const mountainGroup = new THREE.Group();
        
        // Create layered mountain structure
        const layers = 6;
        const baseRadius = 10 * scale;
        const baseHeight = 25 * scale;
        
        for (let i = 0; i < layers; i++) {
            const layerRadius = baseRadius * (1 - i / layers);
            const layerHeight = baseHeight * (1 - i / layers * 0.7);
            
            const layerGeometry = new THREE.CylinderBufferGeometry(
                layerRadius * 0.8,
                layerRadius,
                layerHeight,
                12
            );
            
            // Add surface detail
            const positions = layerGeometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] *= 1 + (Math.random() - 0.5) * 0.2;
                positions[j + 2] *= 1 + (Math.random() - 0.5) * 0.2;
            }
            
            const layerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x8b0000).multiplyScalar(1 - i * 0.1),
                shininess: 5,
                flatShading: true
            });
            
            const layer = new THREE.Mesh(layerGeometry, layerMaterial);
            layer.position.y = i * layerHeight * 0.8;
            mountainGroup.add(layer);
        }
        
        // Add crater at the top
        const craterGeometry = new THREE.CylinderBufferGeometry(
            baseRadius * 0.2,
            baseRadius * 0.3,
            baseHeight * 0.2,
            12
        );
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4500,
            emissive: 0xff2200,
            emissiveIntensity: 0.5,
            shininess: 30
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.y = baseHeight;
        mountainGroup.add(crater);
        
        // Add lava particles
        const particleCount = 50;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * baseRadius * 0.2;
            positions[i * 3] = Math.cos(theta) * r;
            positions[i * 3 + 1] = baseHeight + Math.random() * 5;
            positions[i * 3 + 2] = Math.sin(theta) * r;
            
            const temp = Math.random();
            colors[i * 3] = Math.min(1, 0.7 + temp * 0.3);
            colors[i * 3 + 1] = Math.max(0, temp * 0.5);
            colors[i * 3 + 2] = Math.max(0, temp * 0.2);
            
            sizes[i] = Math.random() * 2 + 1;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        particles.userData.maxHeight = baseHeight + 25;
        particles.userData.baseHeight = baseHeight;
        mountainGroup.add(particles);

        // Register particles with animation system
        if (animations) {
            animations.registerHellsEndParticles(particles);
        }
        
        // Add lava flows
        const flowCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < flowCount; i++) {
            const flowAngle = Math.random() * Math.PI * 2;
            const flowStart = baseHeight * 0.7;
            const flowLength = baseHeight * 0.6;
            const flowWidth = baseRadius * 0.2;
            
            const flowShape = new THREE.Shape();
            flowShape.moveTo(-flowWidth / 2, 0);
            flowShape.quadraticCurveTo(-flowWidth / 4, flowLength / 3, -flowWidth / 8, flowLength);
            flowShape.quadraticCurveTo(0, flowLength * 1.1, flowWidth / 8, flowLength);
            flowShape.quadraticCurveTo(flowWidth / 4, flowLength / 3, flowWidth / 2, 0);
            flowShape.lineTo(-flowWidth / 2, 0);
            
            const flowGeometry = new THREE.ShapeGeometry(flowShape);
            const flowMaterial = new THREE.MeshPhongMaterial({
                color: 0xff4500,
                emissive: 0xff2200,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            
            const flow = new THREE.Mesh(flowGeometry, flowMaterial);
            flow.position.set(
                Math.cos(flowAngle) * baseRadius * 0.7,
                flowStart,
                Math.sin(flowAngle) * baseRadius * 0.7
            );
            flow.rotation.set(-Math.PI / 2, 0, flowAngle);
            mountainGroup.add(flow);
        }
        
        mountainGroup.position.set(x, 0, z);
        return mountainGroup;
    };
    
    // Create mountain range
    for (let i = 0; i < mountainCount; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 380;
        const scale = 0.5 + Math.random() * 0.5;
        
        const mountain = createVolcanicMountain(x, z, scale);
        mountains.add(mountain);
    }
    
    hellsEndGroup.add(mountains);
    
    // Add lava fields
    const lavaFieldCount = 8;
    for (let i = 0; i < lavaFieldCount; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 380;
        const scale = 5 + Math.random() * 10;
        
        const lavaGeometry = new THREE.CircleBufferGeometry(scale, 8);
        const lavaMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4500,
            emissive: 0xff2200,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        
        const lavaPool = new THREE.Mesh(lavaGeometry, lavaMaterial);
        lavaPool.rotation.x = -Math.PI / 2;
        lavaPool.position.set(x, 16, z);
        hellsEndGroup.add(lavaPool);
        
        // Add glowing particles above lava pools
        const particleCount = 20;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let j = 0; j < particleCount; j++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * scale * 0.8;
            positions[j * 3] = x + Math.cos(theta) * r;
            positions[j * 3 + 1] = 17 + Math.random() * 3;
            positions[j * 3 + 2] = z + Math.sin(theta) * r;
            
            const temp = Math.random();
            colors[j * 3] = Math.min(1, 0.7 + temp * 0.3);
            colors[j * 3 + 1] = Math.max(0, temp * 0.5);
            colors[j * 3 + 2] = Math.max(0, temp * 0.2);
            
            sizes[j] = Math.random() * 2 + 1;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        particles.userData.maxHeight = 30;
        particles.userData.baseHeight = 17;
        hellsEndGroup.add(particles);

        // Register particles with animation system
        if (animations) {
            animations.registerHellsEndParticles(particles);
        }
    }
    
    // Position Hell's End
    const position = CONFIG.positions.western.hellsEnd;
    hellsEndGroup.position.set(position.x, position.y, position.z);
    scene.add(hellsEndGroup);
    
    // Add label
    labelSystem.addLabel(hellsEndGroup, "Hell's End", CONFIG.colors.hellsEnd);
    
    return hellsEndGroup;
}

// Create Hell's Gate
function createHellsGate(scene, labelSystem, animations) {
    const hellsGateGroup = new THREE.Group();
    
    // Create the main gate structure
    const gateHeight = 80;
    const gateWidth = 40;
    const gateDepth = 15;
    
    // Create the main archway
    const archShape = new THREE.Shape();
    archShape.moveTo(-gateWidth/2, 0);
    archShape.lineTo(-gateWidth/2, gateHeight * 0.7);
    archShape.quadraticCurveTo(0, gateHeight, gateWidth/2, gateHeight * 0.7);
    archShape.lineTo(gateWidth/2, 0);
    archShape.lineTo(-gateWidth/2, 0);
    
    const extrudeSettings = {
        steps: 10,
        depth: gateDepth,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelSegments: 3
    };
    
    const archGeometry = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
    const archMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a0f0f,
        shininess: 30,
        flatShading: true
    });
    
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    hellsGateGroup.add(arch);
    
    // Add detailed pillars
    const createPillar = (x) => {
        const pillarGroup = new THREE.Group();
        
        // Main pillar body
        const pillarGeometry = new THREE.CylinderBufferGeometry(3, 4, gateHeight * 0.8, 8);
        const pillarPositions = pillarGeometry.attributes.position.array;
        
        // Add surface detail to pillar
        for (let i = 0; i < pillarPositions.length; i += 3) {
            const angle = Math.atan2(pillarPositions[i], pillarPositions[i+2]);
            const height = pillarPositions[i+1];
            
            pillarPositions[i] *= 1 + Math.sin(height * 0.2) * 0.1;
            pillarPositions[i+2] *= 1 + Math.sin(height * 0.2) * 0.1;
        }
        
        const pillarMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a1f1f,
            shininess: 20,
            flatShading: true
        });
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillarGroup.add(pillar);
        
        // Add decorative rings
        const ringCount = 5;
        for (let i = 0; i < ringCount; i++) {
            const ringGeometry = new THREE.TorusBufferGeometry(3.5, 0.5, 8, 16);
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: 0x3a2f2f,
                shininess: 30
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.y = (i + 1) * (gateHeight * 0.8 / (ringCount + 1)) - gateHeight * 0.4;
            ring.rotation.x = Math.PI / 2;
            pillarGroup.add(ring);
        }
        
        // Add pillar cap
        const capGeometry = new THREE.CylinderBufferGeometry(4, 3, 5, 8);
        const capMaterial = new THREE.MeshPhongMaterial({
            color: 0x3a2f2f,
            shininess: 30
        });
        
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = gateHeight * 0.4;
        pillarGroup.add(cap);
        
        pillarGroup.position.set(x, 0, 0);
        return pillarGroup;
    };
    
    // Add pillars
    hellsGateGroup.add(createPillar(-gateWidth/2 - 3));
    hellsGateGroup.add(createPillar(gateWidth/2 + 3));
    
    // Add decorative elements
    const addDecorations = () => {
        // Add skull decorations
        const skullCount = 8;
        for (let i = 0; i < skullCount; i++) {
            const skullGeometry = new THREE.SphereBufferGeometry(2, 8, 8);
            const skullMaterial = new THREE.MeshPhongMaterial({
                color: 0xeeeeee,
                shininess: 10,
                flatShading: true
            });
            
            const skull = new THREE.Mesh(skullGeometry, skullMaterial);
            const angle = (i / skullCount) * Math.PI;
            const x = Math.cos(angle) * (gateWidth/2 - 2);
            const y = Math.sin(angle) * (gateHeight - 10) + 10;
            
            skull.position.set(x, y, gateDepth/2);
            hellsGateGroup.add(skull);
            
            // Add eye sockets
            const eyeGeometry = new THREE.SphereBufferGeometry(0.5, 4, 4);
            const eyeMaterial = new THREE.MeshPhongMaterial({
                color: 0x000000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            
            leftEye.position.set(-0.7, 0.3, 1);
            rightEye.position.set(0.7, 0.3, 1);
            
            skull.add(leftEye);
            skull.add(rightEye);
        }
        
        // Add chains
        const chainCount = 6;
        for (let i = 0; i < chainCount; i++) {
            const chainGroup = new THREE.Group();
            const linkCount = 10;
            
            for (let j = 0; j < linkCount; j++) {
                const linkGeometry = new THREE.TorusBufferGeometry(1, 0.3, 8, 16);
                const linkMaterial = new THREE.MeshPhongMaterial({
                    color: 0x444444,
                    shininess: 30
                });
                
                const link = new THREE.Mesh(linkGeometry, linkMaterial);
                link.position.y = -j * 2;
                link.rotation.x = (j % 2) * Math.PI / 2;
                chainGroup.add(link);
            }
            
            const x = (i - chainCount/2 + 0.5) * (gateWidth/chainCount);
            chainGroup.position.set(x, gateHeight * 0.8, gateDepth/2);
            hellsGateGroup.add(chainGroup);
        }
    };
    
    addDecorations();
    
    // Add particle effects
    const createParticleSystem = () => {
        const particleCount = 200;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * gateWidth;
            const y = Math.random() * gateHeight;
            const z = (Math.random() - 0.5) * gateDepth;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            const temp = Math.random();
            colors[i * 3] = Math.min(1, 0.5 + temp * 0.5);     // Red
            colors[i * 3 + 1] = Math.max(0, temp * 0.3);       // Green
            colors[i * 3 + 2] = Math.max(0, temp * 0.1);       // Blue
            
            sizes[i] = Math.random() * 2 + 1;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        particles.userData.baseHeight = gateHeight * 0.4;
        hellsGateGroup.add(particles);

        // Register effects with animation system
        if (animations) {
            animations.registerHellsGateEffects(particles, null);
        }
    };
    
    createParticleSystem();
    
    // Add glowing portal effect
    const portalGeometry = new THREE.PlaneBufferGeometry(gateWidth * 0.8, gateHeight * 0.6);
    const portalMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.set(0, gateHeight * 0.4, 0);
    hellsGateGroup.add(portal);

    // Register effects with animation system
    if (animations) {
        animations.registerHellsGateEffects(null, portal);
    }
    
    // Position Hell's Gate
    const position = CONFIG.positions.western.hellsGate;
    hellsGateGroup.position.set(position.x, position.y, position.z);
    scene.add(hellsGateGroup);
    
    // Add label
    labelSystem.addLabel(hellsGateGroup, "Hell's Gate", CONFIG.colors.hellsGate);
    
    return hellsGateGroup;
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