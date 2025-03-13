// Direction markers component
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

export async function setupDirectionMarkers(scene) {
    const markers = new THREE.Group();
    
    // Create a sphere geometry that will be reused
    const sphereGeometry = new THREE.SphereGeometry(5, 16, 16);
    
    // Create materials
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    const textMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.8
    });
    
    // Function to create a directional marker
    const createMarker = (letter, position) => {
        const markerGroup = new THREE.Group();
        
        // Add sphere
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        markerGroup.add(sphere);
        
        // Create text sprite instead of 3D text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // Draw text
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(letter, 32, 32);
        
        // Create sprite texture
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Scale sprite
        sprite.scale.set(5, 5, 1);
        sprite.position.set(0, 0, 0);
        
        markerGroup.add(sprite);
        
        // Position the entire marker
        markerGroup.position.copy(position);
        
        return markerGroup;
    };
    
    // Create markers for each direction
    const distance = 220; // Position outside the grid
    
    // North marker
    const northMarker = createMarker('N', new THREE.Vector3(0, 10, distance));
    markers.add(northMarker);
    
    // South marker
    const southMarker = createMarker('S', new THREE.Vector3(0, 10, -distance));
    markers.add(southMarker);
    
    // East marker
    const eastMarker = createMarker('E', new THREE.Vector3(distance, 10, 0));
    markers.add(eastMarker);
    
    // West marker
    const westMarker = createMarker('W', new THREE.Vector3(-distance, 10, 0));
    markers.add(westMarker);
    
    // Add markers to scene
    scene.add(markers);
    
    return {
        markers,
        cleanup: () => {
            scene.remove(markers);
            // Dispose of geometries and materials
            sphereGeometry.dispose();
            sphereMaterial.dispose();
            textMaterial.dispose();
        }
    };
} 