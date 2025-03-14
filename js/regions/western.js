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
    const hellsEndGroup = new THREE.Group();
    
    // Create base continent with more detailed geometry
    const baseGeometry = new THREE.BoxGeometry(100, 15, 400, 20, 1, 40);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: CONFIG.colors.hellsEnd,
        flatShading: true,
        shininess: 10
    });
    
    // Add displacement to base geometry for rough terrain
    const positions = baseGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positions, i);
        
        // Skip bottom vertices to keep the base flat
        if (vertex.y > -7) {
            const noise = Math.sin(vertex.x * 0.2) * Math.sin(vertex.z * 0.05) * 2 +
                         Math.sin(vertex.x * 0.1) * Math.cos(vertex.z * 0.1) * 1.5;
            vertex.y += noise;
        }
        
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    baseGeometry.computeVertexNormals();
    const hellsEnd = new THREE.Mesh(baseGeometry, baseMaterial);
    hellsEndGroup.add(hellsEnd);
    
    // Create enhanced volcanic mountains with better detail
    const createVolcanicMountain = (x, z, height, radius) => {
        const mountainGroup = new THREE.Group();
        
        // Create detailed mountain geometry with layers
        const layers = 3;
        for (let i = 0; i < layers; i++) {
            const layerRadius = radius * (1 - i * 0.2);
            const layerHeight = height * (0.7 + i * 0.3);
            
            const coneGeometry = new THREE.ConeGeometry(layerRadius, layerHeight, 12);
            const coneMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x8b0000).offsetHSL(0, 0, -i * 0.1),
                flatShading: true,
                shininess: 15
            });
            
            // Add surface detail
            const conePositions = coneGeometry.attributes.position;
            for (let j = 0; j < conePositions.count; j++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(conePositions, j);
                
                const angle = Math.atan2(vertex.z, vertex.x);
                const noise = Math.sin(angle * 6) * 0.1 +
                             Math.sin(angle * 12) * 0.05;
                
                vertex.x += vertex.x * noise;
                vertex.z += vertex.z * noise;
                
                conePositions.setXYZ(j, vertex.x, vertex.y, vertex.z);
            }
            
            coneGeometry.computeVertexNormals();
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.y = i * height * 0.1;
            mountainGroup.add(cone);
        }
        
        // Add glowing crater
        const craterGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.4, height * 0.1, 12);
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b0000,
            emissive: 0xff4500,
            emissiveIntensity: 0.5,
            flatShading: true
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.y = height * 0.9;
        mountainGroup.add(crater);
        
        // Add lava pool
        const poolGeometry = new THREE.CircleGeometry(radius * 0.25, 12);
        const poolMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            transparent: true,
            opacity: 0.9
        });
        
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.rotation.x = -Math.PI / 2;
        pool.position.y = height * 0.9;
        mountainGroup.add(pool);
        
        // Position the mountain group
        mountainGroup.position.set(x, height/2 + 7.5, z);
        return mountainGroup;
    };
    
    // Create volcanic mountains in a more interesting pattern
    const mountainPositions = [
        { x: -35, z: -160, h: 35, r: 18 },
        { x: 35, z: -120, h: 30, r: 15 },
        { x: -40, z: -40, h: 40, r: 20 },
        { x: 30, z: 40, h: 35, r: 17 },
        { x: -35, z: 120, h: 38, r: 19 },
        { x: 40, z: 160, h: 32, r: 16 }
    ];
    
    mountainPositions.forEach(pos => {
        const mountain = createVolcanicMountain(pos.x, pos.z, pos.h, pos.r);
        hellsEndGroup.add(mountain);
    });
    
    // Add rock formations between mountains
    const createRockFormation = (x, z) => {
        const rockGroup = new THREE.Group();
        
        const rockCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < rockCount; i++) {
            const points = [];
            const segments = 5 + Math.floor(Math.random() * 3);
            const rockHeight = 8 + Math.random() * 12;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                points.push(new THREE.Vector2(
                    (1 - Math.pow(t, 0.5)) * (3 + Math.random() * 2),
                    rockHeight * t
                ));
            }
            
            const rockGeometry = new THREE.LatheGeometry(points, 6);
            const rockMaterial = new THREE.MeshPhongMaterial({
                color: 0x8b0000,
                flatShading: true,
                shininess: 5
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 10,
                0,
                (Math.random() - 0.5) * 10
            );
            rock.rotation.set(
                Math.random() * 0.3,
                Math.random() * Math.PI,
                Math.random() * 0.3
            );
            rockGroup.add(rock);
        }
        
        rockGroup.position.set(x, 7.5, z);
        return rockGroup;
    };
    
    // Add rock formations
    for (let i = 0; i < 12; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 360;
        const rocks = createRockFormation(x, z);
        hellsEndGroup.add(rocks);
    }
    
    // Position Hell's End
    const position = CONFIG.positions.western.hellsEnd;
    hellsEndGroup.position.set(position.x, position.y, position.z);
    scene.add(hellsEndGroup);
    
    // Add label
    labelSystem.addLabel(hellsEndGroup, "Hell's End", CONFIG.colors.hellsEnd);
    
    return hellsEndGroup;
}

// Create Hell's End Gate Capital
function createHellsGate(scene, labelSystem) {
    const hellsGateGroup = new THREE.Group();
    
    // Create enhanced base structure
    const baseRadius = 25;
    const baseHeight = 25;
    const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius * 1.2, baseHeight, 8, 4, true);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: CONFIG.colors.hellsGate,
        flatShading: true,
        shininess: 20
    });
    
    // Add surface detail to base
    const basePositions = baseGeometry.attributes.position;
    for (let i = 0; i < basePositions.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(basePositions, i);
        
        const angle = Math.atan2(vertex.z, vertex.x);
        const noise = Math.sin(angle * 8) * 0.1 +
                     Math.cos(angle * 4) * 0.15;
        
        vertex.x += vertex.x * noise;
        vertex.z += vertex.z * noise;
        
        basePositions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    baseGeometry.computeVertexNormals();
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    hellsGateGroup.add(base);
    
    // Create enhanced gate structure
    const gateGroup = new THREE.Group();
    
    // Main gate frame with more detail
    const frameGeometry = new THREE.BoxGeometry(50, 40, 8);
    const frameMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8b0000,
        flatShading: true,
        shininess: 15
    });
    
    // Add architectural details to frame
    const framePositions = frameGeometry.attributes.position;
    for (let i = 0; i < framePositions.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(framePositions, i);
        
        // Add decorative patterns
        if (Math.abs(vertex.x) > 20) {
            vertex.z += Math.sin(vertex.y * 0.2) * 0.5;
        }
        
        framePositions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    frameGeometry.computeVertexNormals();
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 20, 0);
    gateGroup.add(frame);
    
    // Create detailed archway
    const archPoints = [];
    const archSegments = 12;
    for (let i = 0; i <= archSegments; i++) {
        const t = i / archSegments;
        const angle = (Math.PI / 2) * t;
        archPoints.push(new THREE.Vector2(
            Math.cos(angle) * 10,
            Math.sin(angle) * 15
        ));
    }
    
    const archGeometry = new THREE.LatheGeometry(archPoints, 16, 0, Math.PI);
    const archMaterial = new THREE.MeshPhongMaterial({
        color: 0x800000,
        flatShading: true,
        shininess: 20
    });
    
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, 15, 0);
    gateGroup.add(arch);
    
    // Create gate opening with glowing effect
    const openingGeometry = new THREE.BoxGeometry(20, 30, 12);
    const openingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        emissive: 0x330000,
        emissiveIntensity: 0.5
    });
    const opening = new THREE.Mesh(openingGeometry, openingMaterial);
    opening.position.set(0, 15, 0);
    gateGroup.add(opening);
    
    // Create enhanced towers
    const createTower = (x) => {
        const towerGroup = new THREE.Group();
        
        // Main tower structure with layers
        const layers = 4;
        for (let i = 0; i < layers; i++) {
            const layerRadius = 5 * (1 - i * 0.1);
            const layerHeight = 15;
            const segments = 8;
            
            const towerGeometry = new THREE.CylinderGeometry(
                layerRadius,
                layerRadius * 1.2,
                layerHeight,
                segments
            );
            
            const towerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x800000).offsetHSL(0, 0, -i * 0.1),
                flatShading: true,
                shininess: 15
            });
            
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.y = i * layerHeight;
            towerGroup.add(tower);
            
            // Add decorative elements to each layer
            const decorCount = segments;
            for (let j = 0; j < decorCount; j++) {
                const angle = (j / decorCount) * Math.PI * 2;
                const decorGeometry = new THREE.BoxGeometry(1, 2, 1);
                const decorMaterial = new THREE.MeshPhongMaterial({
                    color: 0x600000,
                    flatShading: true
                });
                
                const decor = new THREE.Mesh(decorGeometry, decorMaterial);
                decor.position.set(
                    Math.cos(angle) * (layerRadius + 0.5),
                    0,
                    Math.sin(angle) * (layerRadius + 0.5)
                );
                tower.add(decor);
            }
        }
        
        // Add tower top with flame effect
        const topGeometry = new THREE.ConeGeometry(6, 12, 8);
        const topMaterial = new THREE.MeshPhongMaterial({
            color: 0x600000,
            flatShading: true
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = layers * 15;
        towerGroup.add(top);
        
        // Create enhanced flame effect
        const flameGroup = new THREE.Group();
        
        // Inner flame
        const innerFlameGeometry = new THREE.ConeGeometry(3, 8, 8);
        const innerFlameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6347,
            transparent: true,
            opacity: 0.9
        });
        const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial);
        flameGroup.add(innerFlame);
        
        // Outer flame
        const outerFlameGeometry = new THREE.ConeGeometry(4, 10, 8);
        const outerFlameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            transparent: true,
            opacity: 0.5
        });
        const outerFlame = new THREE.Mesh(outerFlameGeometry, outerFlameMaterial);
        flameGroup.add(outerFlame);
        
        flameGroup.position.y = layers * 15 + 10;
        towerGroup.add(flameGroup);
        
        // Position the tower
        towerGroup.position.set(x, 0, 0);
        return towerGroup;
    };
    
    // Add enhanced towers
    const leftTower = createTower(-22);
    const rightTower = createTower(22);
    gateGroup.add(leftTower);
    gateGroup.add(rightTower);
    
    // Add decorative elements between towers
    const createDecorativeWall = () => {
        const wallGeometry = new THREE.BoxGeometry(36, 30, 4);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x800000,
            flatShading: true
        });
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        
        // Add surface detail
        const wallPositions = wallGeometry.attributes.position;
        for (let i = 0; i < wallPositions.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(wallPositions, i);
            
            if (vertex.z > 0) {
                vertex.z += Math.sin(vertex.y * 0.2) * 0.3 +
                           Math.sin(vertex.x * 0.1) * 0.2;
            }
            
            wallPositions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        wallGeometry.computeVertexNormals();
        return wall;
    };
    
    const backWall = createDecorativeWall();
    backWall.position.set(0, 15, -4);
    gateGroup.add(backWall);
    
    hellsGateGroup.add(gateGroup);
    
    // Position Hell's Gate
    const position = CONFIG.positions.western.hellsGate;
    hellsGateGroup.position.set(position.x, position.y, position.z);
    scene.add(hellsGateGroup);
    
    // Add label
    labelSystem.addLabel(hellsGateGroup, "Hell's End Gate", CONFIG.colors.hellsGate);
    
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