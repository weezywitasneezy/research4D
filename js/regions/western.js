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
    
    // Function to create a volcanic island with enhanced features
    function createVolcanicIsland(radius, height, x, z, scale = 1.0) {
        const islandGroup = new THREE.Group();
        
        // Create detailed island base with displacement
        const baseGeometry = new THREE.CylinderGeometry(radius, radius * 1.2, height, 32, 8);
        const vertices = baseGeometry.attributes.position.array;
        
        // Add terrain displacement
        for (let i = 0; i < vertices.length; i += 3) {
            const angle = Math.atan2(vertices[i], vertices[i + 2]);
            const displacement = 
                Math.sin(angle * 8) * 0.2 + // Create ridges
                Math.sin(angle * 4 + vertices[i + 1] * 0.2) * 0.3 + // Add variation
                (Math.random() - 0.5) * 0.1; // Random noise
            
            vertices[i] *= (1 + displacement);
            vertices[i + 2] *= (1 + displacement);
        }
        
        baseGeometry.computeVertexNormals();
        
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.fireIslands,
            roughness: 0.8,
            metalness: 0.2,
            flatShading: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        islandGroup.add(base);
        
        // Create detailed volcano cone
        const volcanoGeometry = new THREE.ConeGeometry(radius * 0.7, height * 1.2, 32, 8);
        const volcanoVertices = volcanoGeometry.attributes.position.array;
        
        // Add volcanic rock texture through geometry
        for (let i = 0; i < volcanoVertices.length; i += 3) {
            const angle = Math.atan2(volcanoVertices[i], volcanoVertices[i + 2]);
            const height = volcanoVertices[i + 1];
            const displacement = 
                Math.sin(angle * 12 + height * 2) * 0.1 + // Vertical ridges
                Math.cos(angle * 8) * Math.sin(height * 4) * 0.15 + // Horizontal bands
                (Math.random() - 0.5) * 0.05; // Random variation
            
            volcanoVertices[i] *= (1 + displacement);
            volcanoVertices[i + 2] *= (1 + displacement);
        }
        
        volcanoGeometry.computeVertexNormals();
        
        const volcanoMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xb22222,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });
        const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
        volcano.position.y = height * 0.6;
        islandGroup.add(volcano);
        
        // Create complex crater
        const craterGroup = new THREE.Group();
        
        // Main crater
        const craterGeometry = new THREE.CylinderGeometry(radius * 0.3, radius * 0.4, height * 0.2, 32, 2, true);
        const craterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff4500,
            emissive: 0xff2200,
            emissiveIntensity: 0.5,
            roughness: 0.7,
            metalness: 0.3
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        craterGroup.add(crater);

        // Add lava particles with proper velocity setup
        const particleCount = 50;
        const lavaParticlesGeometry = new THREE.BufferGeometry();
        const lavaPositions = new Float32Array(particleCount * 3);
        const lavaColors = new Float32Array(particleCount * 3);
        const lavaVelocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * (radius * 0.3);
            
            lavaPositions[i * 3] = Math.cos(theta) * r;
            lavaPositions[i * 3 + 1] = height * 0.1;
            lavaPositions[i * 3 + 2] = Math.sin(theta) * r;
            
            lavaColors[i * 3] = 1;  // R
            lavaColors[i * 3 + 1] = 0.3 + Math.random() * 0.4;  // G
            lavaColors[i * 3 + 2] = 0;  // B
            
            // Add velocities for animation
            lavaVelocities[i * 3] = (Math.random() - 0.5) * 0.1;     // X velocity
            lavaVelocities[i * 3 + 1] = Math.random() * 0.2;         // Y velocity
            lavaVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1; // Z velocity
        }
        
        lavaParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(lavaPositions, 3));
        lavaParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(lavaColors, 3));
        
        const lavaParticlesMaterial = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const lavaParticles = new THREE.Points(lavaParticlesGeometry, lavaParticlesMaterial);
        lavaParticles.userData.velocities = lavaVelocities;
        lavaParticles.userData.originalPositions = lavaPositions.slice();
        craterGroup.add(lavaParticles);

        // Add smoke particles with proper velocity setup
        const smokeCount = 30;
        const smokeGeometry = new THREE.BufferGeometry();
        const smokePositions = new Float32Array(smokeCount * 3);
        const smokeColors = new Float32Array(smokeCount * 3);
        const smokeVelocities = new Float32Array(smokeCount * 3);
        
        for (let i = 0; i < smokeCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * (radius * 0.2);
            
            smokePositions[i * 3] = Math.cos(theta) * r;
            smokePositions[i * 3 + 1] = height * 0.2;
            smokePositions[i * 3 + 2] = Math.sin(theta) * r;
            
            const gray = 0.3 + Math.random() * 0.4;
            smokeColors[i * 3] = gray;
            smokeColors[i * 3 + 1] = gray;
            smokeColors[i * 3 + 2] = gray;
            
            // Add velocities for animation
            smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.05;    // X velocity
            smokeVelocities[i * 3 + 1] = 0.1 + Math.random() * 0.1;   // Y velocity
            smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05; // Z velocity
        }
        
        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
        smokeGeometry.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));
        
        const smokeMaterial = new THREE.PointsMaterial({
            size: 2.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.4
        });
        
        const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
        smoke.userData.velocities = smokeVelocities;
        smoke.userData.originalPositions = smokePositions.slice();
        craterGroup.add(smoke);

        craterGroup.position.y = height * 1.2;
        islandGroup.add(craterGroup);

        // Add rock formations around base
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = radius * (0.7 + Math.random() * 0.3);
            const rockHeight = height * (0.3 + Math.random() * 0.3);
            
            const rockGeometry = new THREE.ConeGeometry(
                radius * 0.2,
                rockHeight,
                5 + Math.floor(Math.random() * 3)
            );
            
            // Distort rock geometry
            const rockVertices = rockGeometry.attributes.position.array;
            for (let j = 0; j < rockVertices.length; j += 3) {
                const displacement = (Math.random() - 0.5) * 0.2;
                rockVertices[j] *= (1 + displacement);
                rockVertices[j + 2] *= (1 + displacement);
            }
            
            rockGeometry.computeVertexNormals();
            
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b0000,
                roughness: 0.9,
                metalness: 0.1,
                flatShading: true
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                Math.cos(angle) * distance,
                height * 0.15,
                Math.sin(angle) * distance
            );
            rock.rotation.y = Math.random() * Math.PI;
            rock.rotation.z = (Math.random() - 0.5) * 0.3;
            islandGroup.add(rock);
        }

        // Position the island
        islandGroup.position.set(x, 0, z);
        islandGroup.scale.set(scale, scale, scale);
        
        return islandGroup;
    }

    // Create multiple volcanic islands with varying characteristics
    const islands = [
        createVolcanicIsland(30, 20, 0, 0, 1.0),          // Main central island
        createVolcanicIsland(20, 15, -70, 60, 0.8),       // Secondary island
        createVolcanicIsland(25, 18, 60, -40, 0.9),       // Third island
        createVolcanicIsland(15, 12, -40, -80, 0.7),      // Small island
        createVolcanicIsland(18, 14, 40, -100, 0.75)      // Another small island
    ];

    // Create obsidian bridges connecting islands
    const createObsidianBridge = (start, end, height) => {
        const bridgePoints = [];
        const segments = 20;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = start.x + (end.x - start.x) * t;
            const z = start.z + (end.z - start.z) * t;
            const y = height * Math.sin(t * Math.PI); // Arch shape
            
            bridgePoints.push(new THREE.Vector3(x, y, z));
        }
        
        const bridgeCurve = new THREE.CatmullRomCurve3(bridgePoints);
        const bridgeGeometry = new THREE.TubeGeometry(bridgeCurve, 20, 2, 8, false);
        const bridgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9
        });
        
        return new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    };

    // Connect islands with obsidian bridges
    const bridgeConnections = [
        { start: {x: 0, z: 0}, end: {x: -70, z: 60}, height: 15 },
        { start: {x: 0, z: 0}, end: {x: 60, z: -40}, height: 12 },
        { start: {x: -70, z: 60}, end: {x: -40, z: -80}, height: 10 },
        { start: {x: 60, z: -40}, end: {x: 40, z: -100}, height: 8 }
    ];

    bridgeConnections.forEach(connection => {
        const bridge = createObsidianBridge(connection.start, connection.end, connection.height);
        fireIslandsGroup.add(bridge);
    });

    // Add all islands to the group
    islands.forEach(island => fireIslandsGroup.add(island));

    // Position the entire fire islands group
    const position = CONFIG.positions.western.fireIslands;
    fireIslandsGroup.position.set(
        position.x,
        position.y,
        position.z + 50  // Move 50 units south
    );
    scene.add(fireIslandsGroup);

    // Add label
    labelSystem.addLabel(fireIslandsGroup, "Fire Islands", CONFIG.colors.fireIslands);

    return fireIslandsGroup;
}

// Create Hell's End Continent
function createHellsEnd(scene, labelSystem) {
    const hellsEndGroup = new THREE.Group();

    // Main continent base with enhanced displacement
    const hellsEndGeometry = new THREE.PlaneGeometry(100, 400, 100, 400); // Increased resolution
    const vertices = hellsEndGeometry.attributes.position.array;
    
    // Create dramatic terrain displacement across the entire continent
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Create various terrain features with improved variation
        vertices[i + 1] = 
            Math.sin(x * 0.1) * Math.cos(z * 0.1) * 8 + // Base terrain waves
            Math.sin(x * 0.3 + z * 0.2) * 4 + // Medium terrain features
            Math.sin(x * 0.8 + z * 0.7) * 2 + // Small terrain details
            (Math.random() - 0.5) * 3 + // Random variation
            Math.sin(Math.sqrt(x * x + z * z) * 0.2) * 5; // Radial elevation changes
    }

    hellsEndGeometry.computeVertexNormals();
    
    const hellsEndMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.hellsEnd,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: true
    });
    
    const hellsEndBase = new THREE.Mesh(hellsEndGeometry, hellsEndMaterial);
    hellsEndBase.rotation.x = -Math.PI / 2;
    hellsEndGroup.add(hellsEndBase);

    // Create more natural volcanic mountains
    const createVolcano = (x, z) => {
        const height = 15 + Math.random() * 20;
        const radius = 8 + Math.random() * 12;
        
        // Create main volcano cone with detailed surface
        const volcanoGeometry = new THREE.ConeGeometry(radius, height, 16, 8);
        const volcanoVertices = volcanoGeometry.attributes.position.array;
        
        // Add surface detail to volcano
        for (let i = 0; i < volcanoVertices.length; i += 3) {
            const angle = Math.atan2(volcanoVertices[i], volcanoVertices[i + 2]);
            const heightPercent = (volcanoVertices[i + 1] + height/2) / height;
            
            const displacement = 
                Math.sin(angle * 8 + heightPercent * 10) * 0.15 + // Vertical ridges
                Math.cos(heightPercent * 15) * 0.1 + // Horizontal bands
                (Math.random() - 0.5) * 0.1; // Random variation
            
            volcanoVertices[i] *= (1 + displacement);
            volcanoVertices[i + 2] *= (1 + displacement);
        }
        
        volcanoGeometry.computeVertexNormals();
        
        const volcanoMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.7,
            metalness: 0.3,
            flatShading: true
        });
        
        const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
        volcano.position.set(x, height/2, z);
        
        return volcano;
    };

    // Add randomly placed volcanoes
    const numVolcanoes = 12; // Reduced number of volcanoes
    const usedPositions = new Set();
    
    for (let i = 0; i < numVolcanoes; i++) {
        let x, z;
        do {
            x = (Math.random() - 0.5) * 80; // Spread across width
            z = (Math.random() - 0.5) * 380; // Spread across length
            // Ensure minimum distance between volcanoes
        } while (Array.from(usedPositions).some(pos => {
            const [px, pz] = pos.split(',').map(Number);
            return Math.sqrt((x - px) ** 2 + (z - pz) ** 2) < 40;
        }));
        
        usedPositions.add(`${x},${z}`);
        hellsEndGroup.add(createVolcano(x, z));
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

    // Create base using Fire Islands-style geometry
    const baseGeometry = new THREE.CylinderGeometry(50, 55, 14, 32, 8); // Increased height from 4 to 14
    const vertices = baseGeometry.attributes.position.array;
    
    // Add terrain displacement similar to Fire Islands
    for (let i = 0; i < vertices.length; i += 3) {
        const angle = Math.atan2(vertices[i], vertices[i + 2]);
        const displacement = 
            Math.sin(angle * 8) * 0.2 + // Create ridges
            Math.sin(angle * 4 + vertices[i + 1] * 0.2) * 0.3 + // Add variation
            (Math.random() - 0.5) * 0.1; // Random noise
        
        vertices[i] *= (1 + displacement);
        vertices[i + 2] *= (1 + displacement);
    }
    
    baseGeometry.computeVertexNormals();
    
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.hellsGate,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: true
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.scale.z = 3.2; // Stretch north-south (reduced from 4 to bring edges in by 40 units)
    base.position.y = -15; // Lower the base by 15 units (additional 5 units down)
    hellsGateGroup.add(base);

    // Create main platform with detailed geometry
    const platformGeometry = new THREE.CylinderGeometry(25, 28, 4, 16, 2);
    const platformVertices = platformGeometry.attributes.position.array;
    
    // Add platform details
    for (let i = 0; i < platformVertices.length; i += 3) {
        const angle = Math.atan2(platformVertices[i], platformVertices[i + 2]);
        const radius = Math.sqrt(platformVertices[i] * platformVertices[i] + platformVertices[i + 2] * platformVertices[i + 2]);
        
        const displacement = 
            Math.sin(angle * 16) * 0.2 + // Radial patterns
            Math.cos(angle * 8) * Math.sin(platformVertices[i + 1] * 2) * 0.3; // Vertical patterns
        
        if (radius > 20) {
            platformVertices[i] *= (1 + displacement * 0.1);
            platformVertices[i + 2] *= (1 + displacement * 0.1);
        }
    }
    
    platformGeometry.computeVertexNormals();
    
    const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.hellsGate,
        roughness: 0.7,
        metalness: 0.3,
        flatShading: true
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(-40, 2, 0);
    hellsGateGroup.add(platform);

    // Create main gate structure with intricate details
    const gateGroup = new THREE.Group();
    
    // Main archway
    const archPoints = [];
    const archSegments = 20;
    
    for (let i = 0; i <= archSegments; i++) {
        const t = i / archSegments;
        const angle = t * Math.PI;
        archPoints.push(new THREE.Vector3(
            Math.cos(angle) * 15,
            Math.sin(angle) * 20 + 20,
            0
        ));
    }
    
    const archCurve = new THREE.CatmullRomCurve3(archPoints);
    const archGeometry = new THREE.TubeGeometry(archCurve, 20, 2, 12, false);
    const archMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        roughness: 0.6,
        metalness: 0.4
    });
    
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    gateGroup.add(arch);

    // Gate walls with detailed architecture
    const wallGeometry = new THREE.BoxGeometry(40, 40, 5);
    const wallVertices = wallGeometry.attributes.position.array;
    
    // Add architectural details to walls
    for (let i = 0; i < wallVertices.length; i += 3) {
        if (Math.abs(wallVertices[i]) > 15) { // Only modify edges
            const height = wallVertices[i + 1];
            const pattern = 
                Math.sin(height * 0.5) * 0.3 + // Horizontal ridges
                Math.cos(height * 0.8) * 0.2; // Additional detail
            
            wallVertices[i] *= (1 + pattern * 0.1);
        }
    }
    
    wallGeometry.computeVertexNormals();
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: true
    });
    
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 20, 0);
    gateGroup.add(wall);

    // Create intricate gate opening
    const openingGeometry = new THREE.BoxGeometry(20, 30, 10);
    const openingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,
        emissive: 0x330000,
        emissiveIntensity: 0.5
    });
    const opening = new THREE.Mesh(openingGeometry, openingMaterial);
    opening.position.set(0, 15, 0);
    gateGroup.add(opening);

    // Create detailed towers
    const createDetailedTower = (x) => {
        const towerGroup = new THREE.Group();
        
        // Main tower body with architectural details
        const towerGeometry = new THREE.CylinderGeometry(5, 7, 50, 12, 8);
        const towerVertices = towerGeometry.attributes.position.array;
        
        // Add architectural details to tower
        for (let i = 0; i < towerVertices.length; i += 3) {
            const angle = Math.atan2(towerVertices[i], towerVertices[i + 2]);
            const height = towerVertices[i + 1];
            
            const detail = 
                Math.sin(angle * 6 + height * 0.2) * 0.2 + // Vertical ridges
                Math.cos(height * 0.4) * 0.1; // Horizontal bands
            
            towerVertices[i] *= (1 + detail);
            towerVertices[i + 2] *= (1 + detail);
        }
        
        towerGeometry.computeVertexNormals();
        
        const towerMaterial = new THREE.MeshStandardMaterial({
            color: 0x800000,
            roughness: 0.7,
            metalness: 0.3,
            flatShading: true
        });
        
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        towerGroup.add(tower);
        
        // Add decorative elements to tower
        const addTowerDecorations = () => {
            // Decorative rings
            for (let i = 0; i < 3; i++) {
                const ringGeometry = new THREE.TorusGeometry(6, 0.5, 8, 24);
                const ringMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8b0000,
                    roughness: 0.6,
                    metalness: 0.4
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.y = 10 + i * 15;
                ring.rotation.x = Math.PI / 2;
                towerGroup.add(ring);
            }
            
            // Tower top
            const topGeometry = new THREE.ConeGeometry(6, 10, 8);
            const topMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b0000,
                roughness: 0.5,
                metalness: 0.5
            });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 30;
            towerGroup.add(top);
        };
        
        addTowerDecorations();
        towerGroup.position.set(x, 25, 0);
        return towerGroup;
    };

    // Add towers
    const leftTower = createDetailedTower(-22);
    const rightTower = createDetailedTower(22);
    gateGroup.add(leftTower);
    gateGroup.add(rightTower);

    // Add decorative elements connecting towers to main gate
    const createConnector = (x) => {
        const connectorGeometry = new THREE.BoxGeometry(8, 30, 3);
        const connectorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.7,
            metalness: 0.3
        });
        const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
        connector.position.set(x, 15, 0);
        return connector;
    };

    gateGroup.add(createConnector(-16));
    gateGroup.add(createConnector(16));

    // Add the gate group to main group and rotate it to face west
    gateGroup.rotation.y = Math.PI / 2;
    gateGroup.position.set(-40, 4, 0); // Lowered to be closer to base
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