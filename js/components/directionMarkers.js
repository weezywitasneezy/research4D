// Direction markers component
import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

export function setupDirectionMarkers(scene) {
    const markers = new THREE.Group();
    
    // Create a sphere geometry that will be reused
    const sphereGeometry = new THREE.SphereGeometry(5, 16, 16);
    
    // Create text geometry for letters
    const textGeometry = new THREE.TextGeometry('N', {
        font: CONFIG.fonts.default,
        size: 3,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false
    });
    
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
        
        // Add text
        const text = new THREE.Mesh(textGeometry, textMaterial);
        // Center the text
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        text.position.set(-textWidth/2, 0, 0);
        markerGroup.add(text);
        
        // Position the entire marker
        markerGroup.position.copy(position);
        
        // Make text always face camera
        text.renderOrder = 1;
        text.onBeforeRender = (renderer, scene, camera) => {
            text.quaternion.copy(camera.quaternion);
        };
        
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
            textGeometry.dispose();
            sphereMaterial.dispose();
            textMaterial.dispose();
        }
    };
} 