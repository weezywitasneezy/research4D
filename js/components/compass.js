// Compass markers component
// This replaces the HTML/CSS compass markers with 3D objects that have labels attached

// Create 3D compass markers that will move and rotate with the scene
function create3DCompassMarkers(scene, labelSystem) {
    // Create a group to hold all compass markers
    const compassGroup = new THREE.Group();
    compassGroup.name = "CompassMarkers";
    
    // Define the compass directions and their positions
    // Position them MUCH further away to ensure they're only visible when looking directly at them
    // We'll position them so far away that they'll only appear when looking directly in their direction
    const compassDistance = 3000; // Extremely far to ensure they only appear when looking directly at them
    const compassHeight = 0;     // Keep at ground level for better orientation
    
    const compassDirections = [
        { text: 'N', position: new THREE.Vector3(0, compassHeight, -compassDistance), color: 0xFFFFFF },
        { text: 'S', position: new THREE.Vector3(0, compassHeight, compassDistance), color: 0xFFFFFF },
        { text: 'E', position: new THREE.Vector3(compassDistance, compassHeight, 0), color: 0xFFFFFF },
        { text: 'W', position: new THREE.Vector3(-compassDistance, compassHeight, 0), color: 0xFFFFFF }
    ];
    
    // Create each compass marker
    compassDirections.forEach(direction => {
        // Create a simpler marker - just a small invisible sphere to hold the label
        const markerGroup = new THREE.Group();
        
        // Create a tiny, nearly invisible sphere as an anchor point for the label
        const sphereGeometry = new THREE.SphereGeometry(1, 8, 8);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.01 // Nearly invisible
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        markerGroup.add(sphere);
        
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
