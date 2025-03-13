// Underwater regions implementation
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

// Create underwater regions and related structures
export function createUnderwaterRegion(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
    const elements = {
        abyss: createAbyss(scene, labelSystem),
        trench: createTrench(scene, labelSystem),
        coralReef: createCoralReef(scene, labelSystem)
    };
    
    return elements;
}

// Create the Abyss
function createAbyss(scene, labelSystem) {
    const abyssGroup = new THREE.Group();
    
    // Main abyss structure
    const abyssGeometry = new THREE.CylinderGeometry(50, 60, 100, 8);
    const abyssMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.abyss,
        metalness: 0.1,
        roughness: 0.9,
        transparent: true,
        opacity: 0.8
    });
    const abyss = new THREE.Mesh(abyssGeometry, abyssMaterial);
    abyss.castShadow = true;
    abyss.receiveShadow = true;
    abyssGroup.add(abyss);
    
    // Add bioluminescent features
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 30 + Math.random() * 20;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = -20 - Math.random() * 60;
        
        const lightGeometry = new THREE.SphereGeometry(2, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            metalness: 0.1,
            roughness: 0.2,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(x, y, z);
        light.castShadow = true;
        light.receiveShadow = true;
        abyssGroup.add(light);
    }
    
    // Position the abyss
    const position = CONFIG.positions.underwater.abyss;
    abyssGroup.position.set(position.x, position.y, position.z);
    scene.add(abyssGroup);
    
    // Add label
    labelSystem.addLabel(abyssGroup, "The Abyss", CONFIG.colors.abyss);
    
    return abyssGroup;
}

// Create the Trench
function createTrench(scene, labelSystem) {
    const trenchGroup = new THREE.Group();
    
    // Main trench structure
    const trenchGeometry = new THREE.BoxGeometry(200, 150, 30);
    const trenchMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.trench,
        metalness: 0.1,
        roughness: 0.8,
        transparent: true,
        opacity: 0.7
    });
    const trench = new THREE.Mesh(trenchGeometry, trenchMaterial);
    trench.castShadow = true;
    trench.receiveShadow = true;
    trenchGroup.add(trench);
    
    // Add hydrothermal vents
    for (let i = 0; i < 10; i++) {
        const x = -90 + Math.random() * 180;
        const z = -10 + Math.random() * 20;
        const y = -70 - Math.random() * 10;
        
        const ventGeometry = new THREE.CylinderGeometry(3, 5, 20, 8);
        const ventMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4500,
            metalness: 0.2,
            roughness: 0.6,
            emissive: 0xff4500,
            emissiveIntensity: 0.3
        });
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.set(x, y, z);
        vent.castShadow = true;
        vent.receiveShadow = true;
        trenchGroup.add(vent);
        
        // Add smoke/steam particles
        const smokeGeometry = new THREE.ConeGeometry(5, 15, 8);
        const smokeMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.9
        });
        const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
        smoke.position.set(x, y + 10, z);
        smoke.castShadow = true;
        smoke.receiveShadow = true;
        trenchGroup.add(smoke);
    }
    
    // Position the trench
    const position = CONFIG.positions.underwater.trench;
    trenchGroup.position.set(position.x, position.y, position.z);
    scene.add(trenchGroup);
    
    // Add label
    labelSystem.addLabel(trenchGroup, "The Trench", CONFIG.colors.trench);
    
    return trenchGroup;
}

// Create the Coral Reef
function createCoralReef(scene, labelSystem) {
    const reefGroup = new THREE.Group();
    
    // Main reef base
    const reefBaseGeometry = new THREE.BoxGeometry(150, 40, 150);
    const reefBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.coralReef,
        metalness: 0.1,
        roughness: 0.7,
        transparent: true,
        opacity: 0.8
    });
    const reefBase = new THREE.Mesh(reefBaseGeometry, reefBaseMaterial);
    reefBase.castShadow = true;
    reefBase.receiveShadow = true;
    reefGroup.add(reefBase);
    
    // Add coral formations
    for (let i = 0; i < 30; i++) {
        const x = -70 + Math.random() * 140;
        const z = -70 + Math.random() * 140;
        const y = -15 - Math.random() * 20;
        
        const coralGeometry = new THREE.ConeGeometry(5 + Math.random() * 5, 10 + Math.random() * 15, 8);
        const coralMaterial = new THREE.MeshStandardMaterial({
            color: 0xff69b4,
            metalness: 0.1,
            roughness: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const coral = new THREE.Mesh(coralGeometry, coralMaterial);
        coral.position.set(x, y, z);
        coral.castShadow = true;
        coral.receiveShadow = true;
        reefGroup.add(coral);
    }
    
    // Add sea anemones
    for (let i = 0; i < 20; i++) {
        const x = -70 + Math.random() * 140;
        const z = -70 + Math.random() * 140;
        const y = -15 - Math.random() * 10;
        
        const anemoneGeometry = new THREE.CylinderGeometry(2, 4, 8, 8);
        const anemoneMaterial = new THREE.MeshStandardMaterial({
            color: 0xff1493,
            metalness: 0.1,
            roughness: 0.4,
            transparent: true,
            opacity: 0.7
        });
        const anemone = new THREE.Mesh(anemoneGeometry, anemoneMaterial);
        anemone.position.set(x, y, z);
        anemone.castShadow = true;
        anemone.receiveShadow = true;
        reefGroup.add(anemone);
    }
    
    // Position the reef
    const position = CONFIG.positions.underwater.coralReef;
    reefGroup.position.set(position.x, position.y, position.z);
    scene.add(reefGroup);
    
    // Add label
    labelSystem.addLabel(reefGroup, "Coral Reef", CONFIG.colors.coralReef);
    
    return reefGroup;
}

console.log('Underwater regions module loaded!');