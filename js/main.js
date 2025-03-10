// Main entry point for visualization
import { initScene, renderer, scene, camera } from './core/scene.js';
import { setupControls } from './core/controls.js';
import { setupLabelSystem, updateLabels } from './components/labels.js';
import { createEasternContinent } from './regions/eastern.js';
import { createCentralIslands } from './regions/central.js';
import { createWesternRegions } from './regions/western.js';
import { createUnderwaterStructures } from './regions/underwater.js';
import { createSkyStructures } from './regions/sky.js';
import { initAnimations, startAnimationLoop } from './components/animations.js';
import { createConnectors } from './core/utils.js';

// Global state
let cleanup = null;

// Main initialization function
function initWorldVisualization() {
    // Initialize the scene, camera, and renderer
    const container = document.getElementById('visualization-mount');
    if (!container) return;
    
    const { scene, camera, renderer, labelContainer } = initScene(container);
    
    // Setup controls (rotation, fullscreen buttons)
    const controls = setupControls(container);
    
    // Setup label system
    const labelSystem = setupLabelSystem(labelContainer);
    
    // Add regions to the scene
    const easternElements = createEasternContinent(scene, labelSystem);
    const centralElements = createCentralIslands(scene, labelSystem);
    const westernElements = createWesternRegions(scene, labelSystem);
    const underwaterElements = createUnderwaterStructures(scene, labelSystem);
    const skyElements = createSkyStructures(scene, labelSystem);
    
    // Create vertical connectors between layers
    createConnectors(scene, {
        easternElements,
        centralElements,
        underwaterElements,
        skyElements
    });
    
    // Setup animations
    const animations = initAnimations(camera, controls.isRotating);
    
    // Start animation loop
    startAnimationLoop(renderer, scene, camera, animations, labelSystem);
    
    // Setup cleanup function
    cleanup = function() {
        // Cleanup code here...
        controls.cleanup();
        animations.cleanup();
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
    };
    
    return cleanup;
}

// Load Three.js and initialize visualization
document.addEventListener('DOMContentLoaded', function() {
    // Load Three.js dynamically
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = function() {
        cleanup = initWorldVisualization();
    };
    document.head.appendChild(threeScript);
});

// Handle cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (cleanup) {
        cleanup();
    }
});