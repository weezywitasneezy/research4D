// Underwater regions implementation
import { CONFIG } from '../core/config.js';

// Create all underwater structures
export function createUnderwaterStructures(scene, labelSystem) {
    // Need to check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined. Make sure config.js is loaded first.');
        return {};
    }
    
    const elements = {
        atlantis: createAtlantis(scene, labelSystem)
    };
    
    return elements;
}

// Create Atlantis (underwater city)
function createAtlantis(scene, labelSystem) {
    // Main Atlantis structure
    const atlantisGroup = new THREE.Group();
    
    // Create the main dome
    const domeGeometry = new THREE.DodecahedronGeometry(40, 1);
    const domeMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.colors.atlantis,
        transparent: true,
        opacity: 0.7
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    atlantisGroup.add(dome);
    
    // Add central tower
    const towerGeometry = new THREE.CylinderGeometry(3, 5, 35, 6);
    const towerMaterial = new THREE.MeshLambertMaterial({
        color: 0x48d1cc, // Medium turquoise
        transparent: true,
        opacity: 0.85
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 15;
    atlantisGroup.add(tower);
    
    // Add smaller domes
    const addSmallDome = (x, z, size) => {
        const smallDomeGeometry = new THREE.SphereGeometry(size, 12, 12);
        const smallDomeMaterial = new THREE.MeshLambertMaterial({
            color: 0x7fffd4, // Aquamarine
            transparent: true,
            opacity: 0.6
        });
        const smallDome = new THREE.Mesh(smallDomeGeometry, smallDomeMaterial);
        smallDome.position.set(x, size/2 - 10, z);
        atlantisGroup.add(smallDome);
    };
    
    // Add several small domes around the main structure
    addSmallDome(20, 15, 12);
    addSmallDome(-25, 10, 10);
    addSmallDome(0, -28, 15);
    addSmallDome(15, -15, 8);
    addSmallDome(-18, -20, 9);
    
    // Add connecting tubes between domes
    const addTube = (startX, startZ, endX, endZ) => {
        // Find starting and ending y coordinates based on the domes
        const startY = -10;
        const endY = -10;
        
        // Create a curved path for the tube
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(startX, startY, startZ),
            new THREE.Vector3((startX + endX) / 2, startY - 5, (startZ + endZ) / 2),
            new THREE.Vector3(endX, endY, endZ)
        ]);
        
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 2, 8, false);
        const tubeMaterial = new THREE.MeshLambertMaterial({
            color: 0xb0e0e6, // Powder blue
            transparent: true,
            opacity: 0.5
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        atlantisGroup.add(tube);
    };
    
    // Add connecting tubes between domes
    addTube(0, 0, 20, 15);
    addTube(0, 0, -25, 10);
    addTube(0, 0, 0, -28);
    addTube(0, -28, 15, -15);
    addTube(0, -28, -18, -20);
    
    // Add some seafloor elements around Atlantis
    const addSeafloorElement = (x, z, height, radius) => {
        const seafloorGeometry = new THREE.ConeGeometry(radius, height, 5);
        const seafloorMaterial = new THREE.MeshLambertMaterial({
            color: 0x2f4f4f, // Dark slate gray
            transparent: true,
            opacity: 0.7
        });
        const seafloorElement = new THREE.Mesh(seafloorGeometry, seafloorMaterial);
        seafloorElement.position.set(x, -30, z);
        atlantisGroup.add(seafloorElement);
    };
    
    // Add various seafloor elements
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const height = 5 + Math.random() * 15;
        const radius = 3 + Math.random() * 5;
        addSeafloorElement(x, z, height, radius);
    }
    
    // Position Atlantis
    const position = CONFIG.positions.central.atlantis;
    atlantisGroup.position.set(position.x, position.y, position.z);
    scene.add(atlantisGroup);
    
    // Add label
    labelSystem.addLabel(atlantisGroup, "Atlantis", CONFIG.colors.atlantis);
    
    return atlantisGroup;
}

console.log('Underwater regions module loaded!');