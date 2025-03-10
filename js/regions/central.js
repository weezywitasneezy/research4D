// Central regions implementation
import { CONFIG } from '../core/config.js';

// Create Central islands and all related structures
export function createCentralIslands(scene, labelSystem) {
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
    const magicIslandGeometry = new THREE.CylinderGeometry(35, 40, 15, 8);
    const magicIslandMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.magicIslands
    });
    const magicIsland = new THREE.Mesh(magicIslandGeometry, magicIslandMaterial);
    
    // Position the magic island
    const position = CONFIG.positions.central.magicIslands;
    magicIsland.position.set(position.x, position.y, position.z);
    scene.add(magicIsland);
    
    // Add label
    labelSystem.addLabel(magicIsland, "Magic Islands Capital", CONFIG.colors.magicIslands);
    
    return magicIsland;
}

// Create Moon Palace (floating above magic islands)
function createMoonPalace(scene, labelSystem) {
    // Moon Palace
    const moonPalaceGeometry = new THREE.CylinderGeometry(20, 24, 18, 6);
    const moonPalaceMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.moonPalace,
        transparent: true,
        opacity: 0.9
    });
    const moonPalace = new THREE.Mesh(moonPalaceGeometry, moonPalaceMaterial);
    
    // Position the moon palace
    const position = CONFIG.positions.central.moonPalace;
    moonPalace.position.set(position.x, position.y, position.z);
    scene.add(moonPalace);
    
    // Add label
    labelSystem.addLabel(moonPalace, "Moon Palace", CONFIG.colors.moonPalace);
    
    return moonPalace;
}

// Create Forested Islands surrounding magic islands
function createForestedIslands(scene, labelSystem) {
    // Function to create a forested island
    const createForestedIsland = (x, z, size) => {
        const islandGroup = new THREE.Group();
        
        // Island base
        const baseGeom = new THREE.CylinderGeometry(size, size * 1.1, size * 0.4, 8);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Saddle brown
        const base = new THREE.Mesh(baseGeom, baseMat);
        islandGroup.add(base);
        
        // Forest
        const forestGeom = new THREE.ConeGeometry(size * 0.8, size * 1.2, 8);
        const forestMat = new THREE.MeshLambertMaterial({ 
            color: CONFIG.colors.forestFarms
        });
        const forest = new THREE.Mesh(forestGeom, forestMat);
        forest.position.y = size * 0.8;
        islandGroup.add(forest);
        
        islandGroup.position.set(x, 0, z);
        scene.add(islandGroup);
        
        return islandGroup;
    };

    // Create several forested islands around the magic islands
    const forestedIslands = [
        createForestedIsland(-40, -30, 15),
        createForestedIsland(40, -40, 12),
        createForestedIsland(50, 20, 14),
        createForestedIsland(-50, 30, 13),
        createForestedIsland(0, -45, 16)
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
    // The Belt
    const beltGeometry = new THREE.TorusGeometry(20, 3, 16, 32);
    const beltMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.belt,
        transparent: true,
        opacity: 0.9
    });
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    
    // Position the belt
    const position = CONFIG.positions.central.belt;
    belt.position.set(position.x, position.y, position.z);
    belt.rotation.x = Math.PI / 2;
    scene.add(belt);
    
    // Add label
    labelSystem.addLabel(belt, "The Belt", CONFIG.colors.belt);
    
    return belt;
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
        
        caveGroup.position.set(x, 0, z);
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

// Create Atlantis (underwater city)
export function createAtlantis(scene, labelSystem) {
    // Atlantis
    const atlantisGeometry = new THREE.DodecahedronGeometry(40, 1);
    const atlantisMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.atlantis,
        transparent: true,
        opacity: 0.7
    });
    const atlantis = new THREE.Mesh(atlantisGeometry, atlantisMaterial);
    
    // Position Atlantis
    const position = CONFIG.positions.central.atlantis;
    atlantis.position.set(position.x, position.y, position.z);
    scene.add(atlantis);
    
    // Add label
    labelSystem.addLabel(atlantis, "Atlantis", CONFIG.colors.atlantis);
    
    return atlantis;
}