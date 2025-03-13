// Central region implementation
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

// Create central region and all its sub-regions
export function createCentralRegion(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
    const elements = {
        central: createCentralBase(scene, labelSystem),
        centralCity: createCentralCity(scene, labelSystem),
        centralTower: createCentralTower(scene, labelSystem),
        centralMarket: createCentralMarket(scene, labelSystem),
        centralPark: createCentralPark(scene, labelSystem)
    };
    
    return elements;
}

// Create central base
function createCentralBase(scene, labelSystem) {
    const centralGroup = new THREE.Group();
    
    // Main central platform
    const baseGeometry = new THREE.BoxGeometry(200, 10, 200);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.central,
        metalness: 0.2,
        roughness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    centralGroup.add(base);
    
    // Add decorative elements
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 80;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const pillarGeometry = new THREE.CylinderGeometry(3, 3, 15, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.2,
            roughness: 0.5
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, 7.5, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        centralGroup.add(pillar);
    }
    
    // Position the central base
    const position = CONFIG.positions.central.central;
    centralGroup.position.set(position.x, position.y, position.z);
    scene.add(centralGroup);
    
    // Add label
    labelSystem.addLabel(centralGroup, "Central Region", CONFIG.colors.central);
    
    return centralGroup;
}

// Create central city
function createCentralCity(scene, labelSystem) {
    const cityGroup = new THREE.Group();
    
    // Main city base
    const cityBaseGeometry = new THREE.BoxGeometry(150, 5, 150);
    const cityBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.centralCity,
        metalness: 0.2,
        roughness: 0.5
    });
    const cityBase = new THREE.Mesh(cityBaseGeometry, cityBaseMaterial);
    cityBase.castShadow = true;
    cityBase.receiveShadow = true;
    cityGroup.add(cityBase);
    
    // Add buildings
    for (let i = 0; i < 20; i++) {
        const x = -70 + Math.random() * 140;
        const z = -70 + Math.random() * 140;
        const height = 15 + Math.random() * 25;
        const width = 8 + Math.random() * 12;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, width);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.1,
            roughness: 0.4
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height/2 + 2.5, z);
        building.castShadow = true;
        building.receiveShadow = true;
        cityGroup.add(building);
    }
    
    // Position the central city
    const position = CONFIG.positions.central.centralCity;
    cityGroup.position.set(position.x, position.y, position.z);
    scene.add(cityGroup);
    
    // Add label
    labelSystem.addLabel(cityGroup, "Central City", CONFIG.colors.centralCity);
    
    return cityGroup;
}

// Create central tower
function createCentralTower(scene, labelSystem) {
    const towerGroup = new THREE.Group();
    
    // Main tower structure
    const towerGeometry = new THREE.CylinderGeometry(15, 20, 100, 8);
    const towerMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.centralTower,
        metalness: 0.3,
        roughness: 0.4
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.castShadow = true;
    tower.receiveShadow = true;
    towerGroup.add(tower);
    
    // Add tower levels
    for (let i = 0; i < 5; i++) {
        const levelGeometry = new THREE.CylinderGeometry(18, 18, 2, 8);
        const levelMaterial = new THREE.MeshStandardMaterial({
            color: 0x999999,
            metalness: 0.2,
            roughness: 0.5
        });
        const level = new THREE.Mesh(levelGeometry, levelMaterial);
        level.position.y = 20 + i * 15;
        level.castShadow = true;
        level.receiveShadow = true;
        towerGroup.add(level);
    }
    
    // Add top spire
    const spireGeometry = new THREE.ConeGeometry(10, 20, 8);
    const spireMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.2,
        roughness: 0.3
    });
    const spire = new THREE.Mesh(spireGeometry, spireMaterial);
    spire.position.y = 95;
    spire.castShadow = true;
    spire.receiveShadow = true;
    towerGroup.add(spire);
    
    // Position the central tower
    const position = CONFIG.positions.central.centralTower;
    towerGroup.position.set(position.x, position.y, position.z);
    scene.add(towerGroup);
    
    // Add label
    labelSystem.addLabel(towerGroup, "Central Tower", CONFIG.colors.centralTower);
    
    return towerGroup;
}

// Create central market
function createCentralMarket(scene, labelSystem) {
    const marketGroup = new THREE.Group();
    
    // Main market structure
    const marketGeometry = new THREE.BoxGeometry(80, 15, 80);
    const marketMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.centralMarket,
        metalness: 0.1,
        roughness: 0.6
    });
    const market = new THREE.Mesh(marketGeometry, marketMaterial);
    market.castShadow = true;
    market.receiveShadow = true;
    marketGroup.add(market);
    
    // Add market stalls
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 25;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const stallGeometry = new THREE.BoxGeometry(8, 6, 8);
        const stallMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.1,
            roughness: 0.5
        });
        const stall = new THREE.Mesh(stallGeometry, stallMaterial);
        stall.position.set(x, 3, z);
        stall.castShadow = true;
        stall.receiveShadow = true;
        marketGroup.add(stall);
    }
    
    // Add central fountain
    const fountainGeometry = new THREE.CylinderGeometry(5, 6, 3, 8);
    const fountainMaterial = new THREE.MeshStandardMaterial({
        color: 0x00bfff,
        metalness: 0.1,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6
    });
    const fountain = new THREE.Mesh(fountainGeometry, fountainMaterial);
    fountain.position.y = 1.5;
    fountain.castShadow = true;
    fountain.receiveShadow = true;
    marketGroup.add(fountain);
    
    // Position the central market
    const position = CONFIG.positions.central.centralMarket;
    marketGroup.position.set(position.x, position.y, position.z);
    scene.add(marketGroup);
    
    // Add label
    labelSystem.addLabel(marketGroup, "Central Market", CONFIG.colors.centralMarket);
    
    return marketGroup;
}

// Create central park
function createCentralPark(scene, labelSystem) {
    const parkGroup = new THREE.Group();
    
    // Main park base
    const parkBaseGeometry = new THREE.BoxGeometry(100, 2, 100);
    const parkBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.centralPark,
        metalness: 0.1,
        roughness: 0.7
    });
    const parkBase = new THREE.Mesh(parkBaseGeometry, parkBaseMaterial);
    parkBase.castShadow = true;
    parkBase.receiveShadow = true;
    parkGroup.add(parkBase);
    
    // Add trees
    for (let i = 0; i < 15; i++) {
        const x = -45 + Math.random() * 90;
        const z = -45 + Math.random() * 90;
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a2f1a,
            metalness: 0.1,
            roughness: 0.8
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 4, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        parkGroup.add(trunk);
        
        // Tree top
        const topGeometry = new THREE.ConeGeometry(4, 6, 8);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            metalness: 0.1,
            roughness: 0.6
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(x, 10, z);
        top.castShadow = true;
        top.receiveShadow = true;
        parkGroup.add(top);
    }
    
    // Add benches
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 30;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        const benchGeometry = new THREE.BoxGeometry(4, 1, 2);
        const benchMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            metalness: 0.1,
            roughness: 0.7
        });
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.set(x, 1, z);
        bench.castShadow = true;
        bench.receiveShadow = true;
        parkGroup.add(bench);
    }
    
    // Position the central park
    const position = CONFIG.positions.central.centralPark;
    parkGroup.position.set(position.x, position.y, position.z);
    scene.add(parkGroup);
    
    // Add label
    labelSystem.addLabel(parkGroup, "Central Park", CONFIG.colors.centralPark);
    
    return parkGroup;
}

console.log('Central region module loaded!');