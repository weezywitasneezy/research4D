// Direction markers component
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

export async function setupDirectionMarkers(scene) {
    const markers = new THREE.Group();
    
    // Create a sphere geometry that will be reused
    const sphereGeometry = new THREE.SphereGeometry(20, 32, 32);
    
    // Create materials
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
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
        canvas.width = 128;
        canvas.height = 128;
        
        // Draw text with white background for better visibility
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(0, 0, 128, 128);
        
        // Draw text
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.font = 'bold 96px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(letter, 64, 64);
        
        // Create sprite texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Scale sprite
        sprite.scale.set(20, 20, 1);
        sprite.position.set(0, 0, 0.1);
        
        // Ensure sprite renders on top
        sprite.renderOrder = 1;
        sprite.material.depthTest = false;
        
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
    
    // East marker - moved further out
    const eastMarker = createMarker('E', new THREE.Vector3(distance + 20, 10, 0));
    markers.add(eastMarker);
    
    // West marker - moved further out
    const westMarker = createMarker('W', new THREE.Vector3(-distance - 20, 10, 0));
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