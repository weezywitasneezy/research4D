// Compass markers component
// This replaces the HTML/CSS compass markers with 3D objects that have labels attached

// Create 3D compass markers that will move and rotate with the scene
function create3DCompassMarkers(scene, labelSystem) {
    // Create a group to hold all compass markers
    const compassGroup = new THREE.Group();
    compassGroup.name = "CompassMarkers";
    
    // Define the compass directions and their positions
    // Position them further away to ensure they're at the edges of the world
    // And slightly elevate them to avoid collision with ground objects
    const compassDistance = 300; // Increased distance to ensure they're well outside the main scene
    const compassHeight = 30;   // Elevate them above ground level for better visibility
    
    const compassDirections = [
        { text: 'N', position: new THREE.Vector3(0, compassHeight, -compassDistance), color: 0xFFFFFF },
        { text: 'S', position: new THREE.Vector3(0, compassHeight, compassDistance), color: 0xFFFFFF },
        { text: 'E', position: new THREE.Vector3(compassDistance, compassHeight, 0), color: 0xFFFFFF },
        { text: 'W', position: new THREE.Vector3(-compassDistance, compassHeight, 0), color: 0xFFFFFF }
    ];
    
    // Create each compass marker
    compassDirections.forEach(direction => {
        // Create a more visible marker with a small arrow-like shape pointing in the direction
        const markerGroup = new THREE.Group();
        
        // Create a small sphere as the main point
        const sphereGeometry = new THREE.SphereGeometry(7, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x3366ff,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        markerGroup.add(sphere);
        
        // Add a small directional indicator (cone pointing in the direction)
        const coneGeometry = new THREE.ConeGeometry(4, 15, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        
        // Position and rotate the cone to point in the correct direction
        if (direction.text === 'N') {
            cone.position.z = -12;
            cone.rotation.x = Math.PI / 2;
        } else if (direction.text === 'S') {
            cone.position.z = 12;
            cone.rotation.x = -Math.PI / 2;
        } else if (direction.text === 'E') {
            cone.position.x = 12;
            cone.rotation.z = -Math.PI / 2;
        } else if (direction.text === 'W') {
            cone.position.x = -12;
            cone.rotation.z = Math.PI / 2;
        }
        
        markerGroup.add(cone);
        
        // Position the marker group at the compass point position
        markerGroup.position.copy(direction.position);
        markerGroup.name = `Compass${direction.text}`;
        
        // Add the marker group to the compass group
        compassGroup.add(markerGroup);
        
        // Add a label to the marker group using the existing label system
        // Add a special type property to identify compass labels for special handling
        const label = labelSystem.addLabel(markerGroup, direction.text, direction.color);
        
        // Mark this as a compass label for special handling in the updateLabels function
        if (label) {
            label.isCompass = true;
        }
        
        // Style the label differently to make it stand out as a compass point
        if (label && label.element) {
            label.element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            label.element.style.borderRadius = '50%';
            label.element.style.width = '30px';
            label.element.style.height = '30px';
            label.element.style.display = 'flex';
            label.element.style.alignItems = 'center';
            label.element.style.justifyContent = 'center';
            label.element.style.fontWeight = 'bold';
            
            // Add a class for further styling if needed
            label.element.classList.add('compass-label');
        }
    });
    
    // Add the compass group to the scene
    scene.add(compassGroup);
    
    // Return the compass group for future reference
    return compassGroup;
}

// Function to remove HTML compass markers
function removeHTMLCompassMarkers(container) {
    const markers = container.querySelectorAll('.compass-marker');
    markers.forEach(marker => marker.remove());
}

// Export functions to global scope for access from other modules
window.create3DCompassMarkers = create3DCompassMarkers;
window.removeHTMLCompassMarkers = removeHTMLCompassMarkers;

console.log('Compass markers module loaded!');
