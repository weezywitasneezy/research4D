// Sky regions implementation
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

// Create sky regions and related structures
export function createSkyRegion(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
    const elements = {
        floatingIslands: createFloatingIslands(scene, labelSystem),
        cloudCity: createCloudCity(scene, labelSystem),
        skyTemple: createSkyTemple(scene, labelSystem)
    };
    
    return elements;
}

// Create Floating Islands
function createFloatingIslands(scene, labelSystem) {
    const floatingIslandsGroup = new THREE.Group();
    
    // Main floating island
    const islandGeometry = new THREE.CylinderGeometry(30, 35, 20, 8);
    const islandMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.floatingIslands,
        metalness: 0.1,
        roughness: 0.7
    });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.castShadow = true;
    island.receiveShadow = true;
    floatingIslandsGroup.add(island);
    
    // Add waterfalls
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 25;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const waterfallGeometry = new THREE.CylinderGeometry(2, 2, 40, 8);
        const waterfallMaterial = new THREE.MeshStandardMaterial({
            color: 0x00bfff,
            metalness: 0.1,
            roughness: 0.2,
            transparent: true,
            opacity: 0.6
        });
        const waterfall = new THREE.Mesh(waterfallGeometry, waterfallMaterial);
        waterfall.position.set(x, -10, z);
        waterfall.castShadow = true;
        waterfall.receiveShadow = true;
        floatingIslandsGroup.add(waterfall);
    }
    
    // Add smaller floating islands
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 60;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = 10 + Math.random() * 20;
        
        const smallIslandGeometry = new THREE.CylinderGeometry(10, 12, 8, 6);
        const smallIslandMaterial = new THREE.MeshStandardMaterial({
            color: 0x98fb98,
            metalness: 0.1,
            roughness: 0.6
        });
        const smallIsland = new THREE.Mesh(smallIslandGeometry, smallIslandMaterial);
        smallIsland.position.set(x, y, z);
        smallIsland.castShadow = true;
        smallIsland.receiveShadow = true;
        floatingIslandsGroup.add(smallIsland);
    }
    
    // Position the floating islands
    const position = CONFIG.positions.sky.floatingIslands;
    floatingIslandsGroup.position.set(position.x, position.y, position.z);
    scene.add(floatingIslandsGroup);
    
    // Add label
    labelSystem.addLabel(floatingIslandsGroup, "Floating Islands", CONFIG.colors.floatingIslands);
    
    return floatingIslandsGroup;
}

// Create Cloud City
function createCloudCity(scene, labelSystem) {
    const cloudCityGroup = new THREE.Group();
    
    // Main cloud platform
    const platformGeometry = new THREE.BoxGeometry(100, 5, 100);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.cloudCity,
        metalness: 0.2,
        roughness: 0.5
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.castShadow = true;
    platform.receiveShadow = true;
    cloudCityGroup.add(platform);
    
    // Add buildings
    for (let i = 0; i < 15; i++) {
        const x = -45 + Math.random() * 90;
        const z = -45 + Math.random() * 90;
        const height = 20 + Math.random() * 30;
        const width = 8 + Math.random() * 12;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, width);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f8ff,
            metalness: 0.1,
            roughness: 0.4
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height/2 + 2.5, z);
        building.castShadow = true;
        building.receiveShadow = true;
        cloudCityGroup.add(building);
    }
    
    // Add cloud effects
    for (let i = 0; i < 20; i++) {
        const x = -60 + Math.random() * 120;
        const z = -60 + Math.random() * 120;
        const y = -10 + Math.random() * 20;
        
        const cloudGeometry = new THREE.SphereGeometry(10 + Math.random() * 10, 8, 8);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.2,
            transparent: true,
            opacity: 0.6
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(x, y, z);
        cloud.castShadow = true;
        cloud.receiveShadow = true;
        cloudCityGroup.add(cloud);
    }
    
    // Position the cloud city
    const position = CONFIG.positions.sky.cloudCity;
    cloudCityGroup.position.set(position.x, position.y, position.z);
    scene.add(cloudCityGroup);
    
    // Add label
    labelSystem.addLabel(cloudCityGroup, "Cloud City", CONFIG.colors.cloudCity);
    
    return cloudCityGroup;
}

// Create Sky Temple
function createSkyTemple(scene, labelSystem) {
    const skyTempleGroup = new THREE.Group();
    
    // Main temple structure
    const templeGeometry = new THREE.BoxGeometry(40, 60, 40);
    const templeMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.skyTemple,
        metalness: 0.3,
        roughness: 0.4
    });
    const temple = new THREE.Mesh(templeGeometry, templeMaterial);
    temple.castShadow = true;
    temple.receiveShadow = true;
    skyTempleGroup.add(temple);
    
    // Add temple roof
    const roofGeometry = new THREE.ConeGeometry(25, 20, 8);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.4,
        roughness: 0.3
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 40;
    roof.castShadow = true;
    roof.receiveShadow = true;
    skyTempleGroup.add(roof);
    
    // Add temple entrance
    const entranceGeometry = new THREE.BoxGeometry(15, 25, 5);
    const entranceMaterial = new THREE.MeshStandardMaterial({
        color: 0xdaa520,
        metalness: 0.2,
        roughness: 0.5
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, 17.5, 22.5);
    entrance.castShadow = true;
    entrance.receiveShadow = true;
    skyTempleGroup.add(entrance);
    
    // Add temple pillars
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 25;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const pillarGeometry = new THREE.CylinderGeometry(2, 2, 30, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.3,
            roughness: 0.4
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, 15, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        skyTempleGroup.add(pillar);
    }
    
    // Add floating platforms
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 40;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = 10 + Math.random() * 20;
        
        const platformGeometry = new THREE.BoxGeometry(15, 2, 15);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.2,
            roughness: 0.5
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(x, y, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        skyTempleGroup.add(platform);
    }
    
    // Position the sky temple
    const position = CONFIG.positions.sky.skyTemple;
    skyTempleGroup.position.set(position.x, position.y, position.z);
    scene.add(skyTempleGroup);
    
    // Add label
    labelSystem.addLabel(skyTempleGroup, "Sky Temple", CONFIG.colors.skyTemple);
    
    return skyTempleGroup;
}

console.log('Sky regions module loaded!');