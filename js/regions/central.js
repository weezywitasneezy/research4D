// Central regions implementation
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

// Create Central islands and all related structures
export function createCentralIslands(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
    const elements = {
        magicIslands: createMagicIslands(scene, labelSystem),
        moonPalace: createMoonPalace(scene, labelSystem),
        forestedIslands: createForestedIslands(scene, labelSystem),
        smugglersIsland: createSmugglersIsland(scene, labelSystem),
        belt: createBelt(scene, labelSystem),
        caveIslands: createCaveIslands(scene, labelSystem)
    };
    
    return elements;
}

// Create Magic Islands Capital
function createMagicIslands(scene, labelSystem) {
    // Magic Islands Capital
    const magicIslandGeometry = new THREE.CylinderGeometry(35, 40, 15, 8, 4);
    const vertices = magicIslandGeometry.attributes.position.array;
    
    // Add terrain displacement for more organic look
    for (let i = 0; i < vertices.length; i += 3) {
        const angle = Math.atan2(vertices[i], vertices[i + 2]);
        const displacement = 
            Math.sin(angle * 6) * 0.2 + 
            Math.sin(angle * 3 + vertices[i + 1] * 0.2) * 0.3;
        
        vertices[i] *= (1 + displacement);
        vertices[i + 2] *= (1 + displacement);
    }
    
    magicIslandGeometry.computeVertexNormals();
    
    const magicIslandMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.magicIslands,
        roughness: 0.6,
        metalness: 0.4,
        flatShading: true
    });
    const magicIsland = new THREE.Mesh(magicIslandGeometry, magicIslandMaterial);
    
    // Position the magic island
    const position = CONFIG.positions.central.magicIslands;
    magicIsland.position.set(position.x, position.y, position.z);
    scene.add(magicIsland);
    
    // Create crystal cluster formations
    const createCrystalCluster = (x, z, scale = 1.0) => {
        const clusterGroup = new THREE.Group();
        
        // Create multiple crystals in a cluster
        const crystalCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < crystalCount; i++) {
            const height = (8 + Math.random() * 4) * scale;
            const radius = (1.5 + Math.random() * 1) * scale;
            
            const crystalGeometry = new THREE.ConeGeometry(
                radius,
                height,
                5 + Math.floor(Math.random() * 3)
            );
            
            // Add crystal surface detail
            const crystalVertices = crystalGeometry.attributes.position.array;
            for (let j = 0; j < crystalVertices.length; j += 3) {
                const angle = Math.atan2(crystalVertices[j], crystalVertices[j + 2]);
                const heightPercent = (crystalVertices[j + 1] + height/2) / height;
                
                const detail = 
                    Math.sin(angle * 5 + heightPercent * 10) * 0.1 +
                    Math.cos(heightPercent * 8) * 0.1;
                
                crystalVertices[j] *= (1 + detail);
                crystalVertices[j + 2] *= (1 + detail);
            }
            
            crystalGeometry.computeVertexNormals();
            
            const crystalMaterial = new THREE.MeshStandardMaterial({
                color: 0xcc99ff,
                transparent: true,
                opacity: 0.8,
                roughness: 0.2,
                metalness: 0.8,
                emissive: 0x6600cc,
                emissiveIntensity: 0.2
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            // Position within cluster
            const angle = (i / crystalCount) * Math.PI * 2;
            const clusterRadius = 1.5 * scale;
            crystal.position.set(
                Math.cos(angle) * clusterRadius,
                Math.random() * 2 * scale,
                Math.sin(angle) * clusterRadius
            );
            
            // Random rotation
            crystal.rotation.y = Math.random() * Math.PI;
            crystal.rotation.z = (Math.random() - 0.5) * 0.3;
            
            clusterGroup.add(crystal);
        }
        
        clusterGroup.position.set(x, 10, z);
        return clusterGroup;
    };
    
    // Add crystal clusters around the island
    const clusters = [
        createCrystalCluster(0, 0, 1.5),      // Center cluster
        createCrystalCluster(25, 0, 1.2),     // Right cluster
        createCrystalCluster(-25, 0, 1.2),    // Left cluster
        createCrystalCluster(0, 25, 1.2),     // Front cluster
        createCrystalCluster(0, -25, 1.2),    // Back cluster
        createCrystalCluster(18, 18, 1.0),    // Diagonal clusters
        createCrystalCluster(-18, 18, 1.0),
        createCrystalCluster(18, -18, 1.0),
        createCrystalCluster(-18, -18, 1.0)
    ];
    
    clusters.forEach(cluster => magicIsland.add(cluster));
    
    // Add magical particle effects
    const particleCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const radius = 30 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        
        particlePositions[i * 3] = Math.sin(theta) * Math.cos(phi) * radius;
        particlePositions[i * 3 + 1] = Math.sin(phi) * radius + 10;
        particlePositions[i * 3 + 2] = Math.cos(theta) * Math.cos(phi) * radius;
        
        // Magical purple-blue gradient colors
        particleColors[i * 3] = 0.6 + Math.random() * 0.4;     // R
        particleColors[i * 3 + 1] = 0.3 + Math.random() * 0.4; // G
        particleColors[i * 3 + 2] = 1.0;                       // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    magicIsland.add(particles);
    
    // Add label
    labelSystem.addLabel(magicIsland, "Magic Islands Capital", CONFIG.colors.magicIslands);
    
    return magicIsland;
}

// Create Moon Palace (floating above magic islands)
function createMoonPalace(scene, labelSystem) {
    const moonPalaceGroup = new THREE.Group();

    // Create main palace structure with more elegant geometry
    const mainPalaceGeometry = new THREE.CylinderGeometry(20, 24, 25, 8, 1);
    const mainPalaceVertices = mainPalaceGeometry.attributes.position.array;
    
    // Add elegant architectural details
    for (let i = 0; i < mainPalaceVertices.length; i += 3) {
        const angle = Math.atan2(mainPalaceVertices[i], mainPalaceVertices[i + 2]);
        const height = mainPalaceVertices[i + 1];
        const displacement = 
            Math.sin(angle * 8) * 0.15 + 
            Math.cos(height * 0.5) * 0.1;
        
        mainPalaceVertices[i] *= (1 + displacement);
        mainPalaceVertices[i + 2] *= (1 + displacement);
    }
    
    mainPalaceGeometry.computeVertexNormals();
    
    const moonPalaceMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.moonPalace,
        transparent: true,
        opacity: 0.9,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x6600cc,
        emissiveIntensity: 0.1
    });
    
    const mainPalace = new THREE.Mesh(mainPalaceGeometry, moonPalaceMaterial);
    moonPalaceGroup.add(mainPalace);

    // Create ethereal dome
    const domeGeometry = new THREE.SphereGeometry(22, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6e6fa,
        transparent: true,
        opacity: 0.4,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x9370db,
        emissiveIntensity: 0.2
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 25;
    moonPalaceGroup.add(dome);

    // Create elegant spires with more detail
    const createSpire = (x, z, height, radius) => {
        const spireGroup = new THREE.Group();
        
        // Main spire body
        const spireGeometry = new THREE.CylinderGeometry(radius * 0.3, radius, height, 6, 4);
        const spireVertices = spireGeometry.attributes.position.array;
        
        // Add architectural details to spire
        for (let i = 0; i < spireVertices.length; i += 3) {
            const angle = Math.atan2(spireVertices[i], spireVertices[i + 2]);
            const heightPercent = (spireVertices[i + 1] + height/2) / height;
            
            const detail = 
                Math.sin(angle * 6 + heightPercent * 10) * 0.15 +
                Math.cos(heightPercent * 8) * 0.1;
            
            spireVertices[i] *= (1 + detail);
            spireVertices[i + 2] *= (1 + detail);
        }
        
        spireGeometry.computeVertexNormals();
        
        const spireMaterial = new THREE.MeshStandardMaterial({
            color: 0xd8bfd8,
            transparent: true,
            opacity: 0.9,
            roughness: 0.4,
            metalness: 0.6,
            emissive: 0x9370db,
            emissiveIntensity: 0.1
        });
        
        const spire = new THREE.Mesh(spireGeometry, spireMaterial);
        spireGroup.add(spire);
        
        // Add decorative top
        const topGeometry = new THREE.ConeGeometry(radius * 0.4, height * 0.3, 6);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0xe6e6fa,
            transparent: true,
            opacity: 0.9,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x9370db,
            emissiveIntensity: 0.2
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = height * 0.6;
        spireGroup.add(top);
        
        // Add floating crystal
        const crystalGeometry = new THREE.OctahedronGeometry(radius * 0.3);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0xe6e6fa,
            emissiveIntensity: 0.5
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.y = height * 0.8;
        spireGroup.add(crystal);
        
        spireGroup.position.set(x, 15, z);
        return spireGroup;
    };

    // Create spires in a more complex arrangement
    const spireRadius = 18;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * spireRadius;
        const z = Math.sin(angle) * spireRadius;
        const height = 15 + Math.sin(angle * 2) * 3; // Varying heights
        const radius = 2 + Math.cos(angle * 2) * 0.5; // Varying widths
        
        const spire = createSpire(x, z, height, radius);
        moonPalaceGroup.add(spire);
    }

    // Add ethereal particle effects
    const particleCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const radius = 25 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particlePositions[i * 3] = Math.sin(theta) * Math.cos(phi) * radius;
        particlePositions[i * 3 + 1] = Math.sin(phi) * radius;
        particlePositions[i * 3 + 2] = Math.cos(theta) * Math.cos(phi) * radius;
        
        // Ethereal white-purple colors
        particleColors[i * 3] = 0.9 + Math.random() * 0.1;     // R
        particleColors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
        particleColors[i * 3 + 2] = 1.0;                       // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    moonPalaceGroup.add(particles);

    // Position the moon palace
    const position = CONFIG.positions.central.moonPalace;
    moonPalaceGroup.position.set(position.x, position.y, position.z);
    scene.add(moonPalaceGroup);
    
    // Add label
    labelSystem.addLabel(moonPalaceGroup, "Moon Palace", CONFIG.colors.moonPalace);
    
    return moonPalaceGroup;
}

// Create Forested Islands surrounding magic islands
function createForestedIslands(scene, labelSystem) {
    // Function to create a detailed forested island
    const createForestedIsland = (x, z, size) => {
        const islandGroup = new THREE.Group();
        
        // Create detailed island base with terrain variation
        const baseGeometry = new THREE.CylinderGeometry(size, size * 1.2, size * 0.4, 12, 2);
        const baseVertices = baseGeometry.attributes.position.array;
        
        // Add terrain displacement
        for (let i = 0; i < baseVertices.length; i += 3) {
            const angle = Math.atan2(baseVertices[i], baseVertices[i + 2]);
            const radius = Math.sqrt(baseVertices[i] * baseVertices[i] + baseVertices[i + 2] * baseVertices[i + 2]);
            
            const displacement = 
                Math.sin(angle * 4) * 0.2 + 
                Math.cos(angle * 6) * 0.15 +
                Math.sin(radius * 0.5) * 0.1;
            
            baseVertices[i] *= (1 + displacement);
            baseVertices[i + 2] *= (1 + displacement);
        }
        
        baseGeometry.computeVertexNormals();
        
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.8,
            metalness: 0.2,
            flatShading: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        islandGroup.add(base);
        
        // Create varied forest elements
        const createTree = (x, z, scale = 1.0) => {
            const treeGroup = new THREE.Group();
            
            // Tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(
                0.4 * scale, 
                0.6 * scale, 
                2 * scale, 
                6
            );
            const trunkMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.9,
                metalness: 0.1
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = scale;
            treeGroup.add(trunk);
            
            // Tree foliage layers
            const createFoliageLayer = (y, radius, height) => {
                const foliageGeometry = new THREE.ConeGeometry(radius, height, 8);
                const foliageMaterial = new THREE.MeshStandardMaterial({
                    color: CONFIG.colors.forestFarms,
                    roughness: 0.8,
                    metalness: 0.1,
                    flatShading: true
                });
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = y;
                return foliage;
            };
            
            // Add multiple foliage layers
            const layers = 3;
            for (let i = 0; i < layers; i++) {
                const y = (2 + i * 1.2) * scale;
                const radius = (1.5 - i * 0.3) * scale;
                const height = 2 * scale;
                treeGroup.add(createFoliageLayer(y, radius, height));
            }
            
            treeGroup.position.set(x, 0, z);
            return treeGroup;
        };
        
        // Add trees in a natural pattern
        const treeCount = Math.floor(15 + Math.random() * 10);
        for (let i = 0; i < treeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (size * 0.8);
            const scale = 0.8 + Math.random() * 0.4;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const tree = createTree(x, z, scale);
            tree.rotation.y = Math.random() * Math.PI * 2;
            tree.rotation.x = (Math.random() - 0.5) * 0.2;
            tree.rotation.z = (Math.random() - 0.5) * 0.2;
            islandGroup.add(tree);
        }
        
        // Add ground vegetation
        const createGroundVegetation = (x, z) => {
            const bushGeometry = new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 6, 4);
            const bushMaterial = new THREE.MeshStandardMaterial({
                color: 0x228b22,
                roughness: 0.8,
                metalness: 0.1,
                flatShading: true
            });
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(x, 0.4, z);
            bush.scale.y = 0.7;
            return bush;
        };
        
        // Add scattered ground vegetation
        const vegetationCount = Math.floor(30 + Math.random() * 20);
        for (let i = 0; i < vegetationCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (size * 0.9);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const vegetation = createGroundVegetation(x, z);
            vegetation.rotation.y = Math.random() * Math.PI * 2;
            islandGroup.add(vegetation);
        }
        
        // Add atmospheric particle effects (pollen/leaves)
        const particleCount = 50;
        const particlesGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const height = Math.random() * size * 2;
            
            particlePositions[i * 3] = Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = height;
            particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
            
            // Green-yellow colors for pollen/leaves
            particleColors[i * 3] = 0.7 + Math.random() * 0.3;     // R
            particleColors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
            particleColors[i * 3 + 2] = 0.2 + Math.random() * 0.2; // B
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        islandGroup.add(particles);
        
        // Position the island
        islandGroup.position.set(x, CONFIG.positions.central.magicIslands.y, z);
        scene.add(islandGroup);
        
        return islandGroup;
    };

    // Create several forested islands with varying sizes
    const forestedIslands = [
        createForestedIsland(-60, -150, 12),  // Reduced size, moved further out
        createForestedIsland(60, -160, 10),   // Reduced size, moved further out
        createForestedIsland(80, -100, 11),   // Reduced size, moved further out
        createForestedIsland(-80, -90, 10),   // Reduced size, moved further out
        createForestedIsland(0, -180, 13),    // Reduced size, moved further out
        createForestedIsland(-40, -200, 9),   // Moved 80 units south
        createForestedIsland(40, -210, 9)     // Moved 80 units south
    ];
    
    // Add label to the first forested island
    labelSystem.addLabel(forestedIslands[0], "Forest Farms", CONFIG.colors.forestFarms);
    
    return forestedIslands;
}

// Create Smugglers Island (to the south)
function createSmugglersIsland(scene, labelSystem) {
    // Smugglers Island
    const smugglersIslandGeometry = new THREE.CylinderGeometry(25, 30, 12, 8);
    const smugglersIslandMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.smugglersIsland
    });
    const smugglersIsland = new THREE.Mesh(smugglersIslandGeometry, smugglersIslandMaterial);
    
    // Add smuggler hideouts
    const hideoutGeometry = new THREE.BoxGeometry(8, 5, 8);
    const hideoutMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8b4513 // Saddle brown
    });
    
    // Create hideouts around the island
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const hideout = new THREE.Mesh(hideoutGeometry, hideoutMaterial);
        hideout.position.set(x, 6, z);
        smugglersIsland.add(hideout);
    }
    
    // Position the smugglers island
    const position = CONFIG.positions.central.smugglersIsland;
    smugglersIsland.position.set(position.x, position.y, position.z);
    scene.add(smugglersIsland);
    
    // Add label
    labelSystem.addLabel(smugglersIsland, "Smugglers Island", CONFIG.colors.smugglersIsland);
    
    return smugglersIsland;
}

// Create The Belt (floating above smugglers island)
function createBelt(scene, labelSystem) {
    const beltGroup = new THREE.Group();

    // Create main belt ring with more detail
    const beltGeometry = new THREE.TorusGeometry(20, 3, 32, 100);
    const beltVertices = beltGeometry.attributes.position.array;
    
    // Add surface detail to the belt
    for (let i = 0; i < beltVertices.length; i += 3) {
        const angle = Math.atan2(beltVertices[i], beltVertices[i + 2]);
        const radius = Math.sqrt(beltVertices[i] * beltVertices[i] + beltVertices[i + 2] * beltVertices[i + 2]);
        
        const displacement = 
            Math.sin(angle * 20) * 0.1 + 
            Math.cos(angle * 15) * 0.1 +
            Math.sin(beltVertices[i + 1] * 2) * 0.1;
        
        beltVertices[i] *= (1 + displacement);
        beltVertices[i + 2] *= (1 + displacement);
    }
    
    beltGeometry.computeVertexNormals();
    
    const beltMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.belt,
        transparent: true,
        opacity: 0.9,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0xff4500,
        emissiveIntensity: 0.2
    });
    
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    beltGroup.add(belt);

    // Create detailed trading platforms
    const createTradingPlatform = (angle) => {
        const platformGroup = new THREE.Group();
        
        // Main platform base
        const baseGeometry = new THREE.BoxGeometry(8, 2, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcd853f,
            roughness: 0.7,
            metalness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        platformGroup.add(base);
        
        // Add market stalls
        const stallCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < stallCount; i++) {
            const stallWidth = 2 + Math.random();
            const stallHeight = 2.5 + Math.random();
            
            const stallGeometry = new THREE.BoxGeometry(stallWidth, stallHeight, stallWidth);
            const stallMaterial = new THREE.MeshStandardMaterial({
                color: 0xdeb887,
                roughness: 0.8,
                metalness: 0.2
            });
            const stall = new THREE.Mesh(stallGeometry, stallMaterial);
            
            // Position stall on platform
            const stallAngle = (i / stallCount) * Math.PI * 2;
            const stallRadius = 2;
            stall.position.set(
                Math.cos(stallAngle) * stallRadius,
                stallHeight/2 + 1,
                Math.sin(stallAngle) * stallRadius
            );
            
            platformGroup.add(stall);
            
            // Add canopy
            const canopyGeometry = new THREE.ConeGeometry(stallWidth * 0.8, stallHeight * 0.4, 4);
            const canopyMaterial = new THREE.MeshStandardMaterial({
                color: 0xff7f50,
                roughness: 0.6,
                metalness: 0.2
            });
            const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
            canopy.position.set(
                Math.cos(stallAngle) * stallRadius,
                stallHeight + 1.5,
                Math.sin(stallAngle) * stallRadius
            );
            platformGroup.add(canopy);
        }
        
        // Add decorative elements
        const addDecoration = (x, z) => {
            const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 6);
            const poleMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.7,
                metalness: 0.3
            });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(x, 2, z);
            platformGroup.add(pole);
            
            const bannerGeometry = new THREE.PlaneGeometry(1.5, 0.8);
            const bannerMaterial = new THREE.MeshStandardMaterial({
                color: 0xff7f50,
                roughness: 0.6,
                metalness: 0.2,
                side: THREE.DoubleSide
            });
            const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
            banner.position.set(x, 3.5, z);
            banner.rotation.y = Math.random() * Math.PI * 2;
            platformGroup.add(banner);
        };
        
        // Add decorations at corners
        addDecoration(3.5, 3.5);
        addDecoration(-3.5, 3.5);
        addDecoration(3.5, -3.5);
        addDecoration(-3.5, -3.5);
        
        // Position the platform group on the belt
        const radius = 20;
        platformGroup.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
        platformGroup.rotation.y = angle + Math.PI / 2;
        
        return platformGroup;
    };

    // Create platforms around the belt
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const platform = createTradingPlatform(angle);
        beltGroup.add(platform);
    }

    // Add connecting bridges between platforms
    const createBridge = (startAngle, endAngle) => {
        const radius = 20;
        const start = new THREE.Vector3(
            Math.cos(startAngle) * radius,
            0,
            Math.sin(startAngle) * radius
        );
        const end = new THREE.Vector3(
            Math.cos(endAngle) * radius,
            0,
            Math.sin(endAngle) * radius
        );
        
        const bridgePoints = [];
        const segments = 10;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = start.x + (end.x - start.x) * t;
            const z = start.z + (end.z - start.z) * t;
            const y = Math.sin(t * Math.PI) * 2; // Arch shape
            
            bridgePoints.push(new THREE.Vector3(x, y, z));
        }
        
        const bridgeCurve = new THREE.CatmullRomCurve3(bridgePoints);
        const bridgeGeometry = new THREE.TubeGeometry(bridgeCurve, 20, 0.3, 8, false);
        const bridgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff7f50,
            transparent: true,
            opacity: 0.7,
            roughness: 0.4,
            metalness: 0.6
        });
        
        return new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    };

    // Add bridges between platforms
    for (let i = 0; i < 8; i++) {
        const startAngle = (i / 8) * Math.PI * 2;
        const endAngle = ((i + 1) / 8) * Math.PI * 2;
        const bridge = createBridge(startAngle, endAngle);
        beltGroup.add(bridge);
    }

    // Position the belt
    const position = CONFIG.positions.central.belt;
    beltGroup.position.set(position.x, position.y, position.z);
    beltGroup.rotation.x = Math.PI / 2;
    scene.add(beltGroup);
    
    // Add label
    labelSystem.addLabel(beltGroup, "The Belt", CONFIG.colors.belt);
    
    return beltGroup;
}

// Create Cave Islands surrounding smugglers island
function createCaveIslands(scene, labelSystem) {
    // Function to create a cave island
    const createCaveIsland = (x, z, size) => {
        const caveGroup = new THREE.Group();
        
        // Island base
        const baseGeom = new THREE.CylinderGeometry(size, size * 1.1, size * 0.3, 6);
        const baseMat = new THREE.MeshLambertMaterial({ 
            color: CONFIG.colors.caveIslands
        });
        const base = new THREE.Mesh(baseGeom, baseMat);
        caveGroup.add(base);
        
        // Cave entrance (hole in the middle)
        const caveGeom = new THREE.CylinderGeometry(size * 0.4, size * 0.4, size * 0.3, 8);
        const caveMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black
        const cave = new THREE.Mesh(caveGeom, caveMat);
        cave.position.y = size * 0.01;
        caveGroup.add(cave);
        
        caveGroup.position.set(x, CONFIG.positions.central.smugglersIsland.y, z);
        scene.add(caveGroup);
        
        return caveGroup;
    };

    // Create several cave islands around smugglers island
    const caveIslands = [
        createCaveIsland(30, 110, 10),
        createCaveIsland(-25, 115, 8),
        createCaveIsland(15, 130, 9),
        createCaveIsland(-15, 70, 7)
    ];
    
    // Add label to the first cave island
    labelSystem.addLabel(caveIslands[0], "Cave Islands", CONFIG.colors.caveIslands);
    
    return caveIslands;
}

console.log('Central regions module loaded!');