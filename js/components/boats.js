import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

export function createBoats(scene, labelSystem) {
    const boatsGroup = new THREE.Group();
    
    // Create a boat model
    function createBoat() {
        const boatGroup = new THREE.Group();
        
        // Hull
        const hullGeometry = new THREE.BoxGeometry(8, 2, 4);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1;
        boatGroup.add(hull);
        
        // Deck
        const deckGeometry = new THREE.BoxGeometry(10, 0.5, 6);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 2.25;
        boatGroup.add(deck);
        
        // Mast
        const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.set(0, 6.25, 0);
        boatGroup.add(mast);
        
        // Sail (using ShapeGeometry instead of TriangleGeometry)
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(4, 0);
        shape.lineTo(2, 6);
        shape.lineTo(0, 0);
        
        const sailGeometry = new THREE.ShapeGeometry(shape);
        const sailMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.set(0, 6.25, 0);
        sail.rotation.z = Math.PI / 2; // Rotate to face forward
        boatGroup.add(sail);
        
        return boatGroup;
    }
    
    // Create two boats
    const boat1 = createBoat();
    const boat2 = createBoat();
    
    // Set initial positions
    boat1.position.set(-200, 2, -100);
    boat2.position.set(200, 2, 100);
    
    boatsGroup.add(boat1);
    boatsGroup.add(boat2);
    
    // Define safe paths for boats
    const paths = {
        boat1: [
            { x: -200, z: -100 },
            { x: -100, z: -150 },
            { x: 0, z: -100 },
            { x: 100, z: -50 },
            { x: 200, z: -100 },
            { x: 100, z: -150 },
            { x: 0, z: -200 },
            { x: -100, z: -150 }
        ],
        boat2: [
            { x: 200, z: 100 },
            { x: 100, z: 150 },
            { x: 0, z: 100 },
            { x: -100, z: 50 },
            { x: -200, z: 100 },
            { x: -100, z: 150 },
            { x: 0, z: 200 },
            { x: 100, z: 150 }
        ]
    };
    
    // Animation state
    const boatStates = {
        boat1: { pathIndex: 0, progress: 0 },
        boat2: { pathIndex: 0, progress: 0 }
    };
    
    // Animation function
    function animateBoats() {
        const speed = 0.5; // Speed of boat movement
        
        // Update each boat
        [boat1, boat2].forEach((boat, index) => {
            const boatName = `boat${index + 1}`;
            const state = boatStates[boatName];
            const path = paths[boatName];
            
            // Get current and next path points
            const currentPoint = path[state.pathIndex];
            const nextPoint = path[(state.pathIndex + 1) % path.length];
            
            // Calculate direction
            const dx = nextPoint.x - currentPoint.x;
            const dz = nextPoint.z - currentPoint.z;
            const angle = Math.atan2(dz, dx);
            
            // Update boat position
            boat.position.x = currentPoint.x + dx * state.progress;
            boat.position.z = currentPoint.z + dz * state.progress;
            boat.rotation.y = angle;
            
            // Update progress
            state.progress += speed;
            
            // Move to next path point if reached current destination
            if (state.progress >= 1) {
                state.progress = 0;
                state.pathIndex = (state.pathIndex + 1) % path.length;
            }
        });
        
        requestAnimationFrame(animateBoats);
    }
    
    // Start animation
    animateBoats();
    
    // Add boats to scene
    scene.add(boatsGroup);
    
    return boatsGroup;
} 