// Compass markers component
// This replaces the HTML/CSS compass markers with 3D objects that have labels attached

// Create 3D compass markers that will move and rotate with the scene
function create3DCompassMarkers(scene, labelSystem) {
    // Create a group to hold all compass markers
    const compassGroup = new THREE.Group();
    compassGroup.name = "CompassMarkers";
    
    // Define the compass directions and their positions
    const compassDirections = [
        { text: 'N', position: new THREE.Vector3(0, 0, -250), color: 0xFFFFFF },
        { text: 'S', position: new THREE.Vector3(0, 0, 250), color: 0xFFFFFF },
        { text: 'E', position: new THREE.Vector3(250, 0, 0), color: 0xFFFFFF },
        { text: 'W', position: new THREE.Vector3(-250, 0, 0), color: 0xFFFFFF }
    ];
    
    // Create each compass marker
    compassDirections.forEach(direction => {
        // Create a small sphere as a marker point
        const markerGeometry = new THREE.SphereGeometry(5, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: direction.color,
            transparent: true,
            opacity: 0.7
        });
        
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(direction.position);
        marker.name = `Compass${direction.text}`;
        
        // Add the marker to the compass group
        compassGroup.add(marker);
        
        // Add a label to the marker using the existing label system
        const label = labelSystem.addLabel(marker, direction.text, direction.color);
        
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
