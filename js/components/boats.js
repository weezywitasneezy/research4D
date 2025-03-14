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
        boat1: [ // Eastern-Central Trade Route
            { x: 180, z: -40 },    // Eastern continent start
            { x: 160, z: -60 },    // Following eastern coast
            { x: 140, z: -80 },    // Curving around farms
            { x: 100, z: -60 },    // Approaching central waters
            { x: 60, z: -80 },     // Nearing Magic Islands
            { x: 20, z: -100 },    // North of Magic Islands
            { x: -20, z: -80 },    // Circling Magic Islands
            { x: -40, z: -40 },    // Trade stop
            { x: -20, z: -20 },    // Return path start
            { x: 20, z: -40 },     // Between regions
            { x: 60, z: -20 },     // Approaching eastern waters
            { x: 100, z: -40 },    // Eastern coastal waters
            { x: 140, z: -20 },    // Following coast back
            { x: 160, z: -40 }     // Return to start
        ],
        boat2: [ // Western-Central-Southern Route
            { x: -180, z: 40 },    // Western start
            { x: -160, z: 60 },    // Following western coast
            { x: -120, z: 40 },    // Fire Islands approach
            { x: -80, z: 60 },     // Safe passage
            { x: -40, z: 80 },     // Central waters
            { x: 0, z: 60 },       // Central region
            { x: 40, z: 80 },      // Eastern approach
            { x: 80, z: 100 },     // Industrial area
            { x: 120, z: 80 },     // Space farms
            { x: 160, z: 60 },     // Eastern coast
            { x: 180, z: 40 },     // Eastern point
            { x: 160, z: 20 },     // Return journey
            { x: 120, z: 40 },     // Following coast
            { x: 80, z: 20 },      // Past industrial
            { x: 40, z: 40 },      // Central waters
            { x: 0, z: 20 },       // Central region
            { x: -40, z: 40 },     // Western approach
            { x: -80, z: 20 },     // Past Fire Islands
            { x: -120, z: 40 },    // Western waters
            { x: -160, z: 20 }     // Return to start
        ]
    };
    
    // Animation state
    const boatStates = {
        boat1: { pathIndex: 0, progress: 0 },
        boat2: { pathIndex: 0, progress: 0 }
    };
    
    // Animation function
    function animateBoats() {
        const speed = 0.01; // 10x slower than original
        const rotationSpeed = 0.05; // Slightly faster rotation for tighter turns
        const positionEasing = 0.03; // Slightly faster position changes
        
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
            
            // Smooth rotation transition
            const currentRotation = boat.rotation.y;
            const targetRotation = angle;
            const rotationDiff = targetRotation - currentRotation;
            
            // Normalize rotation difference to [-PI, PI]
            let normalizedDiff = rotationDiff;
            while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
            while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
            
            // Smoothly rotate the boat
            boat.rotation.y += normalizedDiff * rotationSpeed;
            
            // Update boat position with easing
            const targetX = currentPoint.x + dx * state.progress;
            const targetZ = currentPoint.z + dz * state.progress;
            boat.position.x += (targetX - boat.position.x) * positionEasing;
            boat.position.z += (targetZ - boat.position.z) * positionEasing;
            
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