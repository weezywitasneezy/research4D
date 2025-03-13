// Main entry point for visualization
import { config } from './core/config.js';
import { initScene } from './core/scene.js';
import { createEasternContinent } from './regions/eastern.js';
import { createCentralIslands } from './regions/central.js';
import { createWesternRegions } from './regions/western.js';
import { createUnderwaterStructures } from './regions/underwater.js';
import { createSkyStructures } from './regions/sky.js';
import { createConnectors } from './core/utils.js';

// Global state
let cleanup = null;

// Main initialization function
function initWorldVisualization() {
    // Initialize the scene, camera, and renderer
    const container = document.getElementById('visualization-mount');
    if (!container) {
        console.error("Visualization mount not found!");
        return;
    }
    
    // Initialize scene using the config-based setup
    const { scene, camera, renderer, labelContainer, controls } = initScene(container);
    
    // Create label system
    const labelSystem = {
        addLabel: (object, text, color) => {
            const label = document.createElement('div');
            label.className = 'region-label';
            label.textContent = text;
            label.style.color = '#' + color.toString(16).padStart(6, '0');
            labelContainer.appendChild(label);
            
            // Store the label element with the object for updates
            object.userData.label = label;
            
            // Initial position update
            updateLabelPosition(object, camera, renderer, label);
        },
        cleanup: () => {
            while (labelContainer.firstChild) {
                labelContainer.removeChild(labelContainer.firstChild);
            }
        }
    };
    
    // Create all regions
    const regions = {
        eastern: createEasternContinent(scene, labelSystem),
        central: createCentralIslands(scene, labelSystem),
        western: createWesternRegions(scene, labelSystem),
        underwater: createUnderwaterStructures(scene, labelSystem),
        sky: createSkyStructures(scene, labelSystem)
    };
    
    // Create connectors between regions
    createConnectors(scene);
    
    // Setup animation loop
    let animationFrameId;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Update controls
        controls.update();
        
        // Update all labels
        scene.traverse((object) => {
            if (object.userData.label) {
                updateLabelPosition(object, camera, renderer, object.userData.label);
            }
        });
        
        renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    // Setup cleanup function
    cleanup = () => {
        // Stop animation loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Cleanup label system
        labelSystem.cleanup();
        
        // Dispose of all scene resources
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        // Remove renderer from DOM
        if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    };
    
    return cleanup;
}

// Helper function to update label positions
function updateLabelPosition(object, camera, renderer, labelElement) {
    // Get the screen space position of the object
    const vector = new THREE.Vector3();
    object.getWorldPosition(vector);
    vector.project(camera);
    
    // Convert to screen coordinates
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (-vector.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
    
    // Update label position
    labelElement.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    
    // Hide label if object is behind the camera
    labelElement.style.display = vector.z > 1 ? 'none' : 'block';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    cleanup = initWorldVisualization();
});

// Handle cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (cleanup) {
        cleanup();
    }
});
