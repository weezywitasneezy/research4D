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
    
    // Function to create a volcanic island with advanced geometry
    function createVolcanicIsland(radius, height, x, z, scale = 1.0) {
        const islandGroup = new THREE.Group();
        
        // Create a more detailed island base with noise-based terrain
        const baseSegments = 32; // Higher segment count for more detail
        const baseGeometry = new THREE.CylinderBufferGeometry(
            radius, radius * 1.3, height * 0.6, baseSegments, 4, false
        );
        
        // Apply noise to the vertices for a more natural look
        const basePositions = baseGeometry.attributes.position;
        const baseVertices = basePositions.count;
        
        for (let i = 0; i < baseVertices; i++) {
            const idx = i * 3;
            const x = basePositions.array[idx];
            const y = basePositions.array[idx + 1];
            const z = basePositions.array[idx + 2];
            
            // Skip bottom vertices to keep the base flat
            if (y > -height * 0.25) {
                // Apply noise based on position
                const noiseScale = 0.1;
                const noise = (Math.sin(x * noiseScale) + Math.cos(z * noiseScale)) * radius * 0.15;
                
                // Apply more noise to the sides than the top
                const yFactor = 1 - Math.abs(y) / (height * 0.3);
                basePositions.array[idx] += noise * yFactor;
                basePositions.array[idx + 2] += noise * yFactor;
            }
        }
        
        // Update normals
        baseGeometry.computeVertexNormals();
        
        // Create a more realistic material with color variation
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.fireIslands,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        islandGroup.add(base);
        
        // Create a more detailed volcano cone
        const volcanoSegments = 24;
        const volcanoGeometry = new THREE.ConeBufferGeometry(
            radius * 0.8, height * 1.4, volcanoSegments, 6, false
        );
        
        // Apply noise to the volcano cone
        const volcanoPositions = volcanoGeometry.attributes.position;
        const volcanoVertices = volcanoPositions.count;
        
        for (let i = 0; i < volcanoVertices; i++) {
            const idx = i * 3;
            const x = volcanoPositions.array[idx];
            const y = volcanoPositions.array[idx + 1];
            const z = volcanoPositions.array[idx + 2];
            
            // Apply noise based on position
            const noiseScale = 0.2;
            const noise = (Math.sin(x * noiseScale * 2) + Math.cos(z * noiseScale * 2)) * radius * 0.1;
            
            // Apply more noise to the sides than the top
            const yFactor = 1 - Math.abs(y) / (height * 0.7);
            volcanoPositions.array[idx] += noise * yFactor;
            volcanoPositions.array[idx + 2] += noise * yFactor;
        }
        
        // Update normals
        volcanoGeometry.computeVertexNormals();
        
        // Create a more realistic material with color variation
        const volcanoMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xb22222, // Firebrick
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });
        
        const volcano = new THREE.Mesh(volcanoGeometry, volcanoMaterial);
        volcano.position.y = height * 0.3; // Position on top of the base
        islandGroup.add(volcano);
        
        // Create a detailed crater with inner structure
        const craterOuterRadius = radius * 0.5;
        const craterInnerRadius = radius * 0.35;
        const craterDepth = height * 0.3;
        
        // Outer crater rim
        const craterRimGeometry = new THREE.TorusBufferGeometry(
            craterOuterRadius, radius * 0.1, 16, 32
        );
        const craterRimMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000, // Dark red
            roughness: 0.8,
            metalness: 0.2,
            flatShading: true
        });
        const craterRim = new THREE.Mesh(craterRimGeometry, craterRimMaterial);
        craterRim.rotation.x = Math.PI / 2; // Rotate to horizontal
        craterRim.position.y = height * 1.3;
        islandGroup.add(craterRim);
        
        // Inner crater
        const craterGeometry = new THREE.CylinderBufferGeometry(
            craterInnerRadius, craterInnerRadius * 1.2, craterDepth, 24, 3, true
        );
        
        // Apply noise to the crater
        const craterPositions = craterGeometry.attributes.position;
        const craterVertices = craterPositions.count;
        
        for (let i = 0; i < craterVertices; i++) {
            const idx = i * 3;
            const x = craterPositions.array[idx];
            const y = craterPositions.array[idx + 1];
            const z = craterPositions.array[idx + 2];
            
            // Apply noise based on position
            const noiseScale = 0.3;
            const noise = (Math.sin(x * noiseScale * 3) + Math.cos(z * noiseScale * 3)) * radius * 0.05;
            
            craterPositions.array[idx] += noise;
            craterPositions.array[idx + 2] += noise;
        }
        
        // Update normals
        craterGeometry.computeVertexNormals();
        
        const craterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b0000, // Dark red
            roughness: 0.7,
            metalness: 0.3,
            side: THREE.DoubleSide,
            flatShading: true
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.y = height * 1.15;
        islandGroup.add(crater);
        
        // Lava pool at the bottom of the crater
        const lavaGeometry = new THREE.CircleBufferGeometry(craterInnerRadius * 0.9, 24);
        const lavaMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4500, // OrangeRed
            transparent: true,
            opacity: 0.9,
            emissive: 0xff4500,
            emissiveIntensity: 0.5
        });
        
        const lava = new THREE.Mesh(lavaGeometry, lavaMaterial);
        lava.rotation.x = -Math.PI / 2; // Rotate to horizontal
        lava.position.y = height * 1.0;
        islandGroup.add(lava);
        
        // Enhanced lava particle system
        const particleCount = 100;
        const lavaParticlesGeometry = new THREE.BufferGeometry();
        const lavaPositions = new Float32Array(particleCount * 3);
        const lavaSizes = new Float32Array(particleCount);
        const lavaColors = new Float32Array(particleCount * 3);
        const lavaVelocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Distribute particles in a circle within the crater
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * craterInnerRadius * 0.8;
            lavaPositions[i * 3] = Math.cos(theta) * r;
            lavaPositions[i * 3 + 1] = height * 1.0 + Math.random() * 0.5; // Start at lava surface
            lavaPositions[i * 3 + 2] = Math.sin(theta) * r;
            
            // Vary particle sizes for more realism
            lavaSizes[i] = (Math.random() * 2 + 1) * scale;
            
            // Create a gradient of colors from yellow to red
            const colorFactor = Math.random();
            lavaColors[i * 3] = 1.0; // Red always high
            lavaColors[i * 3 + 1] = Math.random() * 0.5 + 0.2; // Green varies
            lavaColors[i * 3 + 2] = Math.random() * 0.1; // Blue very low
            
            // Add more varied velocities
            lavaVelocities[i * 3] = (Math.random() - 0.5) * 0.03;
            lavaVelocities[i * 3 + 1] = Math.random() * 0.15 + 0.05;
            lavaVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
        }
        
        lavaParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(lavaPositions, 3));
        lavaParticlesGeometry.setAttribute('size', new THREE.BufferAttribute(lavaSizes, 1));
        lavaParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(lavaColors, 3));
        
        const lavaParticlesMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const lavaParticles = new THREE.Points(lavaParticlesGeometry, lavaParticlesMaterial);
        lavaParticles.userData.velocities = lavaVelocities;
        lavaParticles.userData.originalPositions = lavaPositions.slice();
        islandGroup.add(lavaParticles);
        
        // Enhanced smoke particle system
        const smokeCount = 60;
        const smokeGeometry = new THREE.BufferGeometry();
        const smokePositions = new Float32Array(smokeCount * 3);
        const smokeSizes = new Float32Array(smokeCount);
        const smokeColors = new Float32Array(smokeCount * 3);
        const smokeVelocities = new Float32Array(smokeCount * 3);
        
        for (let i = 0; i < smokeCount; i++) {
            // Distribute particles in a circle within the crater
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * craterInnerRadius * 0.7;
            smokePositions[i * 3] = Math.cos(theta) * r;
            smokePositions[i * 3 + 1] = height * 1.3; // Start at crater top
            smokePositions[i * 3 + 2] = Math.sin(theta) * r;
            
            // Vary particle sizes for more realism
            smokeSizes[i] = (Math.random() * 4 + 3) * scale;
            
            // Create a gradient of gray colors
            const gray = Math.random() * 0.4 + 0.3;
            smokeColors[i * 3] = gray;
            smokeColors[i * 3 + 1] = gray;
            smokeColors[i * 3 + 2] = gray;
            
            // Add more varied velocities
            smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.08;
            smokeVelocities[i * 3 + 1] = Math.random() * 0.15 + 0.08;
            smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
        }
        
        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
        smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
        smokeGeometry.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));
        
        const smokeMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });
        
        const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
        smoke.userData.velocities = smokeVelocities;
        smoke.userData.originalPositions = smokePositions.slice();
        islandGroup.add(smoke);
        
        // Add detailed rocky outcrops and terrain features
        const rockCount = 12; // More rocks for detail
        for (let i = 0; i < rockCount; i++) {
            const angle = (i / rockCount) * Math.PI * 2;
            const distance = radius * (0.6 + Math.random() * 0.4);
            
            // Create more complex rock geometry
            const rockDetail = 3 + Math.floor(Math.random() * 3);
            const rockGeometry = new THREE.DodecahedronBufferGeometry(
                radius * (0.1 + Math.random() * 0.15),
                rockDetail
            );
            
            // Apply noise to the rock vertices
            const rockPositions = rockGeometry.attributes.position;
            const rockVertices = rockPositions.count;
            
            for (let j = 0; j < rockVertices; j++) {
                const idx = j * 3;
                const x = rockPositions.array[idx];
                const y = rockPositions.array[idx + 1];
                const z = rockPositions.array[idx + 2];
                
                // Apply noise based on position
                const noiseScale = 1.0;
                const noise = (Math.sin(x * noiseScale * 5) + Math.cos(z * noiseScale * 5)) * radius * 0.03;
                
                rockPositions.array[idx] += noise;
                rockPositions.array[idx + 1] += noise;
                rockPositions.array[idx + 2] += noise;
            }
            
            // Update normals
            rockGeometry.computeVertexNormals();
            
            // Create a more realistic rock material
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b0000, // Dark red
                roughness: 0.9,
                metalness: 0.1,
                flatShading: true
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            // Position and rotate the rock
            rock.position.set(
                Math.cos(angle) * distance,
                height * (0.1 + Math.random() * 0.2),
                Math.sin(angle) * distance
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.scale.set(
                1 + Math.random() * 0.5,
                1 + Math.random() * 1.0,
                1 + Math.random() * 0.5
            );
            
            islandGroup.add(rock);
        }
        
        // Add lava flows down the sides of the volcano
        const flowCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < flowCount; i++) {
            const angle = (i / flowCount) * Math.PI * 2;
            
            // Create a curved lava flow path
            const flowPoints = [];
            const flowSegments = 10;
            const startY = height * 1.0; // Start at the crater
            const endY = height * 0.1; // End near the base
            
            for (let j = 0; j <= flowSegments; j++) {
                const t = j / flowSegments;
                const curveX = Math.cos(angle) * (radius * 0.4 + t * radius * 0.6);
                const curveY = startY - t * (startY - endY);
                const curveZ = Math.sin(angle) * (radius * 0.4 + t * radius * 0.6);
                
                // Add some noise to the path
                const noiseScale = 0.5;
                const noise = (Math.sin(t * Math.PI * 2 * noiseScale) + Math.cos(t * Math.PI * 3 * noiseScale)) * radius * 0.1;
                
                flowPoints.push(new THREE.Vector3(
                    curveX + noise * Math.cos(angle + Math.PI/2),
                    curveY,
                    curveZ + noise * Math.sin(angle + Math.PI/2)
                ));
            }
            
            // Create a smooth curve from the points
            const flowCurve = new THREE.CatmullRomCurve3(flowPoints);
            
            // Create a tube geometry along the curve
            const flowGeometry = new THREE.TubeBufferGeometry(
                flowCurve,
                20, // tubularSegments
                radius * 0.05 + Math.random() * radius * 0.05, // radius
                8, // radialSegments
                false // closed
            );
            
            const flowMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4500, // OrangeRed
                transparent: true,
                opacity: 0.9,
                emissive: 0xff4500,
                emissiveIntensity: 0.5
            });
            
            const flow = new THREE.Mesh(flowGeometry, flowMaterial);
            islandGroup.add(flow);
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
    // Create a group for all Hell's End elements
    const hellsEndGroup = new THREE.Group();
    
    // Create a more detailed base terrain with noise-based height map
    const terrainWidth = 100;
    const terrainLength = 400;
    const terrainSegmentsX = 50;
    const terrainSegmentsZ = 200;
    
    // Create a plane geometry with high segment count for detailed terrain
    const terrainGeometry = new THREE.PlaneBufferGeometry(
        terrainWidth, terrainLength, terrainSegmentsX, terrainSegmentsZ
    );
    
    // Rotate to horizontal
    terrainGeometry.rotateX(-Math.PI / 2);
    
    // Apply noise-based height map
    const positions = terrainGeometry.attributes.position;
    const vertexCount = positions.count;
    
    // Create height map with multiple noise frequencies
    for (let i = 0; i < vertexCount; i++) {
        const idx = i * 3;
        const x = positions.array[idx];
        const z = positions.array[idx + 2];
        
        // Base height
        let height = 0;
        
        // Large scale terrain features
        const largeScale = 0.005;
        height += Math.sin(x * largeScale) * Math.cos(z * largeScale) * 8;
        
        // Medium scale terrain features
        const mediumScale = 0.02;
        height += Math.sin(x * mediumScale * 2) * Math.cos(z * mediumScale) * 4;
        
        // Small scale terrain features (details)
        const smallScale = 0.05;
        height += Math.sin(x * smallScale * 3) * Math.cos(z * smallScale * 2) * 2;
        
        // Add some random noise for small details
        height += (Math.random() - 0.5) * 1.5;
        
        // Ensure minimum height
        height = Math.max(height, 0);
        
        // Apply height
        positions.array[idx + 1] = height;
    }
    
    // Update normals
    terrainGeometry.computeVertexNormals();
    
    // Create a more realistic terrain material
    const terrainMaterial = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.hellsEnd,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true,
        side: THREE.DoubleSide
    });
    
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    hellsEndGroup.add(terrain);
    
    // Add volcanic mountains with detailed geometry
    const mountainCount = 12;
    const mountains = [];
    
    for (let i = 0; i < mountainCount; i++) {
        // Position mountains across the terrain
        const x = (Math.random() - 0.5) * terrainWidth * 0.8;
        const z = (Math.random() - 0.5) * terrainLength * 0.8;
        
        // Vary mountain sizes
        const height = 15 + Math.random() * 20;
        const radius = 8 + Math.random() * 12;
        
        // Create detailed mountain geometry
        const segments = 16 + Math.floor(Math.random() * 8);
        const mountainGeometry = new THREE.ConeBufferGeometry(
            radius, height, segments, 6, false
        );
        
        // Apply noise to the mountain vertices
        const mountainPositions = mountainGeometry.attributes.position;
        const mountainVertices = mountainPositions.count;
        
        for (let j = 0; j < mountainVertices; j++) {
            const idx = j * 3;
            const vx = mountainPositions.array[idx];
            const vy = mountainPositions.array[idx + 1];
            const vz = mountainPositions.array[idx + 2];
            
            // Skip the peak and base center
            if (Math.abs(vx) > 0.1 || Math.abs(vz) > 0.1) {
                // Apply noise based on position
                const noiseScale = 0.3;
                const noise = (Math.sin(vx * noiseScale * 5) + Math.cos(vz * noiseScale * 5)) * radius * 0.15;
                
                // Apply more noise to the sides than the top
                const yFactor = 1 - Math.abs(vy) / (height * 0.5);
                mountainPositions.array[idx] += noise * yFactor;
                mountainPositions.array[idx + 2] += noise * yFactor;
            }
        }
        
        // Update normals
        mountainGeometry.computeVertexNormals();
        
        // Create a more realistic mountain material with color variation
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000, // Dark red
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });
        
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        
        // Position the mountain
        mountain.position.set(x, height / 2, z);
        
        // Add some random rotation for variety
        mountain.rotation.y = Math.random() * Math.PI * 2;
        
        hellsEndGroup.add(mountain);
        mountains.push({
            mesh: mountain,
            position: new THREE.Vector3(x, height, z),
            radius: radius,
            height: height
        });
        
        // Add crater to some mountains
        if (Math.random() > 0.3) {
            // Create crater rim
            const craterRadius = radius * 0.4;
            const rimGeometry = new THREE.TorusBufferGeometry(
                craterRadius, radius * 0.1, 12, 24
            );
            
            const rimMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b0000, // Dark red
                roughness: 0.8,
                metalness: 0.2,
                flatShading: true
            });
            
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.x = Math.PI / 2; // Rotate to horizontal
            rim.position.y = height;
            mountain.add(rim);
            
            // Create lava pool in crater
            const poolGeometry = new THREE.CircleBufferGeometry(craterRadius * 0.8, 24);
            const poolMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4500, // OrangeRed
                transparent: true,
                opacity: 0.9,
                emissive: 0xff4500,
                emissiveIntensity: 0.5
            });
            
            const pool = new THREE.Mesh(poolGeometry, poolMaterial);
            pool.rotation.x = -Math.PI / 2; // Rotate to horizontal
            pool.position.y = height - 0.5;
            mountain.add(pool);
            
            // Add lava particles
            const particleCount = 50;
            const particlesGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);
            const colors = new Float32Array(particleCount * 3);
            const velocities = new Float32Array(particleCount * 3);
            
            for (let k = 0; k < particleCount; k++) {
                const theta = Math.random() * Math.PI * 2;
                const r = Math.random() * craterRadius * 0.7;
                positions[k * 3] = Math.cos(theta) * r;
                positions[k * 3 + 1] = height - 0.5 + Math.random() * 0.5;
                positions[k * 3 + 2] = Math.sin(theta) * r;
                
                sizes[k] = Math.random() * 2 + 1;
                
                colors[k * 3] = 1.0; // Red
                colors[k * 3 + 1] = Math.random() * 0.5 + 0.2; // Green
                colors[k * 3 + 2] = Math.random() * 0.1; // Blue
                
                velocities[k * 3] = (Math.random() - 0.5) * 0.03;
                velocities[k * 3 + 1] = Math.random() * 0.1 + 0.05;
                velocities[k * 3 + 2] = (Math.random() - 0.5) * 0.03;
            }
            
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const particlesMaterial = new THREE.PointsMaterial({
                size: 2,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true
            });
            
            const particles = new THREE.Points(particlesGeometry, particlesMaterial);
            particles.userData.velocities = velocities;
            particles.userData.originalPositions = positions.slice();
            mountain.add(particles);
        }
    }
    
    // Add lava rivers flowing across the terrain
    const riverCount = 5;
    
    for (let i = 0; i < riverCount; i++) {
        // Create a curved path for the river
        const points = [];
        const segmentCount = 50;
        
        // Start from a random mountain with a crater
        const startMountain = mountains[Math.floor(Math.random() * mountains.length)];
        const startX = startMountain.position.x;
        const startZ = startMountain.position.z;
        
        // End at the edge of the terrain
        const endAngle = Math.random() * Math.PI * 2;
        const endX = Math.cos(endAngle) * terrainWidth * 0.5;
        const endZ = Math.sin(endAngle) * terrainLength * 0.5;
        
        // Create control points for a curved path
        for (let j = 0; j <= segmentCount; j++) {
            const t = j / segmentCount;
            
            // Use cubic interpolation for a natural curve
            const tx = startX + (endX - startX) * (3 * t * t - 2 * t * t * t);
            const tz = startZ + (endZ - startZ) * (3 * t * t - 2 * t * t * t);
            
            // Add some noise to the path
            const noiseScale = 0.1;
            const noise = (Math.sin(t * Math.PI * 2 * noiseScale) + Math.cos(t * Math.PI * 3 * noiseScale)) * 15;
            
            // Calculate height based on terrain
            const heightScale = 1 - t; // Higher near the mountain, lower at the end
            const y = 2 + heightScale * 5;
            
            points.push(new THREE.Vector3(
                tx + noise * Math.cos(endAngle + Math.PI/2),
                y,
                tz + noise * Math.sin(endAngle + Math.PI/2)
            ));
        }
        
        // Create a smooth curve from the points
        const curve = new THREE.CatmullRomCurve3(points);
        
        // Create a tube geometry along the curve
        const riverWidth = 2 + Math.random() * 3;
        const riverGeometry = new THREE.TubeBufferGeometry(
            curve,
            100, // tubularSegments
            riverWidth, // radius
            12, // radialSegments
            false // closed
        );
        
        const riverMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500, // OrangeRed
            transparent: true,
            opacity: 0.9,
            emissive: 0xff4500,
            emissiveIntensity: 0.5
        });
        
        const river = new THREE.Mesh(riverGeometry, riverMaterial);
        hellsEndGroup.add(river);
    }
    
    // Add scattered rock formations
    const rockCount = 50;
    
    for (let i = 0; i < rockCount; i++) {
        // Position rocks across the terrain
        const x = (Math.random() - 0.5) * terrainWidth * 0.9;
        const z = (Math.random() - 0.5) * terrainLength * 0.9;
        
        // Vary rock sizes
        const size = 2 + Math.random() * 5;
        
        // Create detailed rock geometry
        const rockDetail = 2 + Math.floor(Math.random() * 2);
        const rockType = Math.random();
        
        let rockGeometry;
        
        if (rockType < 0.33) {
            rockGeometry = new THREE.DodecahedronBufferGeometry(size, rockDetail);
        } else if (rockType < 0.66) {
            rockGeometry = new THREE.OctahedronBufferGeometry(size, rockDetail);
        } else {
            rockGeometry = new THREE.TetrahedronBufferGeometry(size, rockDetail);
        }
        
        // Apply noise to the rock vertices
        const rockPositions = rockGeometry.attributes.position;
        const rockVertices = rockPositions.count;
        
        for (let j = 0; j < rockVertices; j++) {
            const idx = j * 3;
            const vx = rockPositions.array[idx];
            const vy = rockPositions.array[idx + 1];
            const vz = rockPositions.array[idx + 2];
            
            // Apply noise based on position
            const noiseScale = 0.5;
            const noise = (Math.sin(vx * noiseScale * 5) + Math.cos(vz * noiseScale * 5)) * size * 0.2;
            
            rockPositions.array[idx] += noise;
            rockPositions.array[idx + 1] += noise;
            rockPositions.array[idx + 2] += noise;
        }
        
        // Update normals
        rockGeometry.computeVertexNormals();
        
        // Create a more realistic rock material
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x8b0000 : 0x696969, // Dark red or dark gray
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        // Position the rock
        rock.position.set(x, size / 2 + 1, z);
        
        // Add some random rotation for variety
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        hellsEndGroup.add(rock);
    }
    
    // Add smoke plumes from some mountains
    mountains.forEach(mountain => {
        if (Math.random() > 0.5) {
            const smokeCount = 40;
            const smokeGeometry = new THREE.BufferGeometry();
            const smokePositions = new Float32Array(smokeCount * 3);
            const smokeSizes = new Float32Array(smokeCount);
            const smokeColors = new Float32Array(smokeCount * 3);
            const smokeVelocities = new Float32Array(smokeCount * 3);
            
            for (let i = 0; i < smokeCount; i++) {
                const theta = Math.random() * Math.PI * 2;
                const r = Math.random() * mountain.radius * 0.3;
                smokePositions[i * 3] = mountain.position.x + Math.cos(theta) * r;
                smokePositions[i * 3 + 1] = mountain.position.y;
                smokePositions[i * 3 + 2] = mountain.position.z + Math.sin(theta) * r;
                
                smokeSizes[i] = Math.random() * 5 + 3;
                
                const gray = Math.random() * 0.4 + 0.3;
                smokeColors[i * 3] = gray;
                smokeColors[i * 3 + 1] = gray;
                smokeColors[i * 3 + 2] = gray;
                
                smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.1;
                smokeVelocities[i * 3 + 1] = Math.random() * 0.2 + 0.1;
                smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            }
            
            smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
            smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
            smokeGeometry.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));
            
            const smokeMaterial = new THREE.PointsMaterial({
                size: 3,
                vertexColors: true,
                transparent: true,
                opacity: 0.4,
                sizeAttenuation: true
            });
            
            const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
            smoke.userData.velocities = smokeVelocities;
            smoke.userData.originalPositions = smokePositions.slice();
            hellsEndGroup.add(smoke);
        }
    });
    
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
    // Create a group for all Hell's Gate elements
    const hellsGateGroup = new THREE.Group();
    
    // Create a more detailed base platform
    const baseRadius = 35;
    const baseHeight = 10;
    const baseSegments = 32;
    
    // Create a detailed base with multiple layers
    const baseGeometry = new THREE.CylinderBufferGeometry(
        baseRadius, baseRadius * 1.2, baseHeight, baseSegments, 3, false
    );
    
    // Apply noise to the base vertices for a more natural look
    const basePositions = baseGeometry.attributes.position;
    const baseVertices = basePositions.count;
    
    for (let i = 0; i < baseVertices; i++) {
        const idx = i * 3;
        const x = basePositions.array[idx];
        const y = basePositions.array[idx + 1];
        const z = basePositions.array[idx + 2];
        
        // Skip bottom vertices to keep the base flat
        if (y > -baseHeight * 0.4) {
            // Apply noise based on position
            const noiseScale = 0.1;
            const noise = (Math.sin(x * noiseScale) + Math.cos(z * noiseScale)) * baseRadius * 0.05;
            
            // Apply more noise to the sides than the top
            const yFactor = 1 - Math.abs(y) / (baseHeight * 0.5);
            basePositions.array[idx] += noise * yFactor;
            basePositions.array[idx + 2] += noise * yFactor;
        }
    }
    
    // Update normals
    baseGeometry.computeVertexNormals();
    
    // Create a more realistic material with color variation
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.hellsGate,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: true
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    hellsGateGroup.add(base);
    
    // Create a more detailed and impressive gate structure
    const gateWidth = 60;
    const gateHeight = 50;
    const gateDepth = 20;
    
    // Main gate structure - more detailed with multiple parts
    const gateGroup = new THREE.Group();
    
    // Create the main gate body with beveled edges
    const gateGeometry = new THREE.BoxBufferGeometry(gateWidth, gateHeight, gateDepth, 10, 10, 10);
    
    // Apply noise to the gate vertices for a more detailed look
    const gatePositions = gateGeometry.attributes.position;
    const gateVertices = gatePositions.count;
    
    for (let i = 0; i < gateVertices; i++) {
        const idx = i * 3;
        const x = gatePositions.array[idx];
        const y = gatePositions.array[idx + 1];
        const z = gatePositions.array[idx + 2];
        
        // Apply noise based on position, more at the edges
        const edgeFactor = Math.max(
            Math.abs(x) / (gateWidth * 0.5),
            Math.abs(y) / (gateHeight * 0.5),
            Math.abs(z) / (gateDepth * 0.5)
        );
        
        const noiseScale = 0.2;
        const noise = (Math.sin(x * noiseScale * 2) + Math.cos(z * noiseScale * 2)) * 0.5;
        
        // Apply more noise near the edges
        gatePositions.array[idx] += noise * edgeFactor * 0.5;
        gatePositions.array[idx + 1] += noise * edgeFactor * 0.5;
        gatePositions.array[idx + 2] += noise * edgeFactor * 0.5;
    }
    
    // Update normals
    gateGeometry.computeVertexNormals();
    
    // Create a more realistic gate material
    const gateMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000, // Dark red
        roughness: 0.7,
        metalness: 0.3,
        flatShading: true
    });
    
    const gate = new THREE.Mesh(gateGeometry, gateMaterial);
    gate.position.set(0, baseHeight + gateHeight / 2, 0);
    gateGroup.add(gate);
    
    // Create a more detailed gate opening
    const openingWidth = 25;
    const openingHeight = 35;
    const openingDepth = gateDepth + 2; // Slightly larger than the gate depth
    
    // Create a more interesting arch shape for the opening
    const openingShape = new THREE.Shape();
    openingShape.moveTo(-openingWidth / 2, -openingHeight / 2);
    openingShape.lineTo(-openingWidth / 2, openingHeight / 2 - openingWidth / 4);
    openingShape.quadraticCurveTo(
        0, openingHeight / 2 + openingWidth / 8,
        openingWidth / 2, openingHeight / 2 - openingWidth / 4
    );
    openingShape.lineTo(openingWidth / 2, -openingHeight / 2);
    openingShape.lineTo(-openingWidth / 2, -openingHeight / 2);
    
    const openingExtrudeSettings = {
        steps: 1,
        depth: openingDepth,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelSegments: 5
    };
    
    const openingGeometry = new THREE.ExtrudeBufferGeometry(openingShape, openingExtrudeSettings);
    
    // Rotate to face forward
    openingGeometry.rotateX(Math.PI / 2);
    
    const openingMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000, // Black
        side: THREE.DoubleSide
    });
    
    const opening = new THREE.Mesh(openingGeometry, openingMaterial);
    opening.position.set(0, baseHeight + gateHeight / 2 - 5, 0);
    gateGroup.add(opening);
    
    // Add decorative elements to the gate
    // Ornate border around the opening
    const borderWidth = openingWidth + 4;
    const borderHeight = openingHeight + 4;
    
    // Create a border shape that follows the opening shape
    const borderShape = new THREE.Shape();
    borderShape.moveTo(-borderWidth / 2, -borderHeight / 2);
    borderShape.lineTo(-borderWidth / 2, borderHeight / 2 - borderWidth / 4);
    borderShape.quadraticCurveTo(
        0, borderHeight / 2 + borderWidth / 8,
        borderWidth / 2, borderHeight / 2 - borderWidth / 4
    );
    borderShape.lineTo(borderWidth / 2, -borderHeight / 2);
    borderShape.lineTo(-borderWidth / 2, -borderHeight / 2);
    
    // Create a hole in the shape for the opening
    const holeShape = new THREE.Shape();
    holeShape.moveTo(-openingWidth / 2, -openingHeight / 2);
    holeShape.lineTo(-openingWidth / 2, openingHeight / 2 - openingWidth / 4);
    holeShape.quadraticCurveTo(
        0, openingHeight / 2 + openingWidth / 8,
        openingWidth / 2, openingHeight / 2 - openingWidth / 4
    );
    holeShape.lineTo(openingWidth / 2, -openingHeight / 2);
    holeShape.lineTo(-openingWidth / 2, -openingHeight / 2);
    
    borderShape.holes.push(holeShape);
    
    const borderExtrudeSettings = {
        steps: 1,
        depth: 2,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 3
    };
    
    const borderGeometry = new THREE.ExtrudeBufferGeometry(borderShape, borderExtrudeSettings);
    
    // Rotate to face forward
    borderGeometry.rotateX(Math.PI / 2);
    
    const borderMaterial = new THREE.MeshStandardMaterial({
        color: 0xcd5c5c, // Indian Red
        roughness: 0.5,
        metalness: 0.5,
        flatShading: true
    });
    
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.set(0, baseHeight + gateHeight / 2 - 5, gateDepth / 2 + 0.5);
    gateGroup.add(border);
    
    // Add towers on either side of the gate with more detail
    const towerCount = 2;
    const towerRadius = 7;
    const towerHeight = 60;
    const towerSegments = 16;
    
    for (let i = 0; i < towerCount; i++) {
        const xPos = (i === 0 ? -1 : 1) * (gateWidth / 2 + towerRadius);
        
        // Create a more detailed tower geometry
        const towerGeometry = new THREE.CylinderBufferGeometry(
            towerRadius, towerRadius * 1.3, towerHeight, towerSegments, 8, false
        );
        
        // Apply noise to the tower vertices
        const towerPositions = towerGeometry.attributes.position;
        const towerVertices = towerPositions.count;
        
        for (let j = 0; j < towerVertices; j++) {
            const idx = j * 3;
            const x = towerPositions.array[idx];
            const y = towerPositions.array[idx + 1];
            const z = towerPositions.array[idx + 2];
            
            // Apply noise based on position
            const noiseScale = 0.3;
            const noise = (Math.sin(x * noiseScale * 3 + y * noiseScale) + 
                          Math.cos(z * noiseScale * 3 + y * noiseScale)) * towerRadius * 0.1;
            
            // Apply more noise to the middle than the top or bottom
            const yFactor = 1 - 2 * Math.abs(y) / towerHeight;
            towerPositions.array[idx] += noise * Math.max(0, yFactor);
            towerPositions.array[idx + 2] += noise * Math.max(0, yFactor);
        }
        
        // Update normals
        towerGeometry.computeVertexNormals();
        
        // Create a more realistic tower material
        const towerMaterial = new THREE.MeshStandardMaterial({
            color: 0x800000, // Maroon
            roughness: 0.8,
            metalness: 0.2,
            flatShading: true
        });
        
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.set(xPos, baseHeight + towerHeight / 2, 0);
        gateGroup.add(tower);
        
        // Add decorative elements to the tower
        
        // Add windows to the tower
        const windowCount = 4;
        const windowHeight = 5;
        const windowWidth = 3;
        const windowDepth = 1;
        
        for (let j = 0; j < windowCount; j++) {
            const angle = (j / windowCount) * Math.PI * 2;
            const windowX = Math.cos(angle) * (towerRadius - 0.5);
            const windowZ = Math.sin(angle) * (towerRadius - 0.5);
            
            const windowGeometry = new THREE.BoxBufferGeometry(
                windowWidth, windowHeight, windowDepth
            );
            
            const windowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffa500, // Orange
                transparent: true,
                opacity: 0.7,
                emissive: 0xffa500,
                emissiveIntensity: 0.5
            });
            
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(windowX, towerHeight / 4, windowZ);
            window.lookAt(tower.position.clone().add(new THREE.Vector3(windowX * 2, towerHeight / 4, windowZ * 2)));
            tower.add(window);
        }
        
        // Add a decorative top to the tower
        const topRadius = towerRadius * 1.2;
        const topHeight = towerRadius * 0.8;
        
        const topGeometry = new THREE.CylinderBufferGeometry(
            topRadius * 0.8, topRadius, topHeight, towerSegments, 2, false
        );
        
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0xcd5c5c, // Indian Red
            roughness: 0.6,
            metalness: 0.4,
            flatShading: true
        });
        
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = towerHeight / 2 + topHeight / 2;
        tower.add(top);
        
        // Add a flaming effect on top of the tower
        const flameHeight = 12;
        const flameRadius = towerRadius * 0.7;
        
        // Create a more interesting flame shape
        const flameGeometry = new THREE.ConeBufferGeometry(
            flameRadius, flameHeight, 16, 8, false
        );
        
        // Apply noise to the flame vertices for a more natural look
        const flamePositions = flameGeometry.attributes.position;
        const flameVertices = flamePositions.count;
        
        for (let j = 0; j < flameVertices; j++) {
            const idx = j * 3;
            const x = flamePositions.array[idx];
            const y = flamePositions.array[idx + 1];
            const z = flamePositions.array[idx + 2];
            
            // Apply noise based on position
            const noiseScale = 0.5;
            const noise = (Math.sin(x * noiseScale * 5 + y * noiseScale * 3) + 
                          Math.cos(z * noiseScale * 5 + y * noiseScale * 3)) * flameRadius * 0.3;
            
            // Apply more noise to the middle than the top or bottom
            const yFactor = 1 - Math.abs(y) / (flameHeight * 0.5);
            flamePositions.array[idx] += noise * yFactor;
            flamePositions.array[idx + 2] += noise * yFactor;
        }
        
        // Update normals
        flameGeometry.computeVertexNormals();
        
        // Create a more realistic flame material with emissive properties
        const flameMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6347, // Tomato
            transparent: true,
            opacity: 0.8,
            emissive: 0xff4500,
            emissiveIntensity: 0.8,
            flatShading: true
        });
        
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = towerHeight / 2 + topHeight + flameHeight / 2;
        tower.add(flame);
        
        // Add flame particles
        const particleCount = 50;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let j = 0; j < particleCount; j++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * flameRadius * 0.7;
            positions[j * 3] = Math.cos(theta) * r;
            positions[j * 3 + 1] = towerHeight / 2 + topHeight + flameHeight / 2 + Math.random() * 2;
            positions[j * 3 + 2] = Math.sin(theta) * r;
            
            sizes[j] = Math.random() * 2 + 1;
            
            // Create a gradient of colors from yellow to red
            const colorFactor = Math.random();
            colors[j * 3] = 1.0; // Red always high
            colors[j * 3 + 1] = Math.random() * 0.5 + 0.2; // Green varies
            colors[j * 3 + 2] = Math.random() * 0.1; // Blue very low
            
            velocities[j * 3] = (Math.random() - 0.5) * 0.05;
            velocities[j * 3 + 1] = Math.random() * 0.15 + 0.05;
            velocities[j * 3 + 2] = (Math.random() - 0.5) * 0.05;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        particles.userData.velocities = velocities;
        particles.userData.originalPositions = positions.slice();
        tower.add(particles);
    }
    
    // Add decorative elements to the base
    const decorationCount = 8;
    
    for (let i = 0; i < decorationCount; i++) {
        const angle = (i / decorationCount) * Math.PI * 2;
        const x = Math.cos(angle) * baseRadius * 0.8;
        const z = Math.sin(angle) * baseRadius * 0.8;
        
        // Create a decorative pillar
        const pillarRadius = 2;
        const pillarHeight = 15;
        
        const pillarGeometry = new THREE.CylinderBufferGeometry(
            pillarRadius, pillarRadius * 1.2, pillarHeight, 8, 2, false
        );
        
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0xcd5c5c, // Indian Red
            roughness: 0.7,
            metalness: 0.3,
            flatShading: true
        });
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, baseHeight / 2 + pillarHeight / 2, z);
        hellsGateGroup.add(pillar);
        
        // Add a decorative top to the pillar
        const topRadius = pillarRadius * 1.5;
        const topHeight = pillarRadius * 0.8;
        
        const topGeometry = new THREE.CylinderBufferGeometry(
            topRadius * 0.8, topRadius, topHeight, 8, 1, false
        );
        
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000, // Dark red
            roughness: 0.6,
            metalness: 0.4,
            flatShading: true
        });
        
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(x, baseHeight / 2 + pillarHeight + topHeight / 2, z);
        hellsGateGroup.add(top);
        
        // Add a small flame on top of some pillars
        if (i % 2 === 0) {
            const flameHeight = 5;
            const flameRadius = pillarRadius * 0.7;
            
            const flameGeometry = new THREE.ConeBufferGeometry(
                flameRadius, flameHeight, 8, 2, false
            );
            
            const flameMaterial = new THREE.MeshBasicMaterial({
                color: 0xff6347, // Tomato
                transparent: true,
                opacity: 0.8,
                emissive: 0xff4500,
                emissiveIntensity: 0.5
            });
            
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(x, baseHeight / 2 + pillarHeight + topHeight + flameHeight / 2, z);
            hellsGateGroup.add(flame);
        }
    }
    
    // Add the gate group to the main group
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