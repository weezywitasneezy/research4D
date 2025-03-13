// Sky regions implementation

// Create all sky structures
function createSkyStructures(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
    const elements = {
        skyPalace: createSkyPalace(scene, labelSystem),
        spaceFarms: createSpaceFarms(scene, labelSystem)
    };
    
    return elements;
}

// Create Sky Palace (floating above seaside capital)
function createSkyPalace(scene, labelSystem) {
    const skyPalaceGroup = new THREE.Group();
    
    // Main floating platform
    const platformGeometry = new THREE.CylinderGeometry(18, 22, 6, 6);
    const platformMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.skyPalace,
        transparent: true,
        opacity: 0.8
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0;
    skyPalaceGroup.add(platform);
    
    // Central palace structure
    const palaceGeometry = new THREE.CylinderGeometry(12, 15, 15, 6);
    const palaceMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.skyPalace,
        transparent: true,
        opacity: 0.9
    });
    const palace = new THREE.Mesh(palaceGeometry, palaceMaterial);
    palace.position.y = 10.5;
    skyPalaceGroup.add(palace);
    
    // Decorative ring around the platform
    const ringGeometry = new THREE.TorusGeometry(20, 1, 16, 32);
    const ringMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xadd8e6, // Light blue
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 3;
    skyPalaceGroup.add(ring);
    
    // Top central tower
    const towerGeometry = new THREE.CylinderGeometry(4, 8, 12, 6);
    const towerMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xb0e0e6, // Powder blue
        transparent: true,
        opacity: 0.9
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 24;
    skyPalaceGroup.add(tower);
    
    // Tower top dome
    const domeGeometry = new THREE.SphereGeometry(5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xe0ffff, // Light cyan
        transparent: true,
        opacity: 0.9
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 30;
    skyPalaceGroup.add(dome);
    
    // Add cloud-like structures around the platform
    addClouds(skyPalaceGroup);
    
    // Position the entire sky palace group
    const position = CONFIG.positions.eastern.skyPalace;
    skyPalaceGroup.position.set(position.x, position.y, position.z);
    scene.add(skyPalaceGroup);
    
    // Add label
    labelSystem.addLabel(skyPalaceGroup, "Sky Palace", CONFIG.colors.skyPalace);
    
    return skyPalaceGroup;
}

// Helper function to add clouds around sky structures
function addClouds(group) {
    // Create small cloud-like structures around the platform
    const createCloud = (radius, angle, size) => {
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        
        const cloudGeometry = new THREE.SphereGeometry(size, 8, 8);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf0f8ff, // Alice blue
            transparent: true,
            opacity: 0.4
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(x, -2, z);
        group.add(cloud);
    };
    
    // Create clouds around the structure
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 25;
        const size = 3 + Math.random() * 2;
        createCloud(radius, angle, size);
    }
}

// Create Space Farms (highest layer)
function createSpaceFarms(scene, labelSystem) {
    // Space Farms ring
    const spaceFarmsGeometry = new THREE.TorusGeometry(80, 4, 16, 50);
    const spaceFarmsMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.spaceFarms,
        transparent: true,
        opacity: 0.7
    });
    const spaceFarms = new THREE.Mesh(spaceFarmsGeometry, spaceFarmsMaterial);
    
    // Position the space farms
    const position = CONFIG.positions.eastern.spaceFarms;
    spaceFarms.position.set(position.x, position.y, position.z);
    spaceFarms.rotation.x = Math.PI / 3;
    scene.add(spaceFarms);
    
    // Add orbital platforms
    addOrbitalPlatforms(scene, spaceFarms, labelSystem);
    
    // No label for the orbital ring
    // Keep only the platforms' labels if any
    
    return spaceFarms;
}

// Add orbital platforms around space farms (optional enhancement)
function addOrbitalPlatforms(scene, spaceFarms, labelSystem) {
    // Create orbital platform group
    const platformsGroup = new THREE.Group();
    
    // Create a platform
    const createPlatform = (angle, height, size) => {
        const radius = 80; // Same as space farms ring
        
        // Calculate position on the ring
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = height;
        
        // Platform geometry
        const platformGeometry = new THREE.BoxGeometry(size, size/4, size);
        const platformMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xe0ffff, // Light cyan
            transparent: true,
            opacity: 0.9
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        
        // Position the platform
        platform.position.set(x, y, z);
        
        // Rotate to face center
        platform.lookAt(0, y, 0);
        
        platformsGroup.add(platform);
        return platform;
    };
    
    // Create several platforms
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const height = 135 + Math.random() * 10; // Slightly different heights
        const size = 8 + Math.random() * 4; // Different sizes
        createPlatform(angle, height, size);
    }
    
    // Position the entire group at the same position as space farms
    const position = CONFIG.positions.eastern.spaceFarms;
    platformsGroup.position.set(position.x, position.y, position.z);
    scene.add(platformsGroup);
    
    return platformsGroup;
}

// Make functions available globally
window.createSkyStructures = createSkyStructures;