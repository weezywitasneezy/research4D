import * as THREE from 'three';
import { setupControls } from './core/controls.js';
import { setupScene } from './core/scene.js';
import { setupLabelSystem } from './components/labels.js';
import { setupAnimations } from './components/animations.js';
import { setupZoomControls } from './components/zoom.js';
import { setupDirectionMarkers } from './components/directionMarkers.js';
import { createEasternContinent } from './regions/eastern.js';
import { createCentralIslands } from './regions/central.js';
import { createWesternRegion } from './regions/western.js';
import { createUnderwaterStructures } from './regions/underwater.js';
import { createSkyStructures } from './regions/sky.js';
import { createConnectors } from './core/utils.js';
import { CONFIG } from './core/config.js';

// This function is replaced by the 3D implementation in compass.js
function addCompassMarkers(container) {
    // This function is kept for backward compatibility but not used anymore
    console.log("HTML compass markers have been replaced with 3D markers");
}

// Main entry point for visualization
let cleanup = null;

// Main initialization function
export async function initWorldVisualization() {
    // Initialize the scene, camera, and renderer
    const container = document.getElementById('visualization-mount');
    if (!container) {
        console.error("Visualization mount not found!");
        return;
    }
    
    // Ensure container has appropriate CSS for fullscreen
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    
    try {
        // Setup core components
        const { scene, camera, renderer, labelContainer } = setupScene(container);
        const labelSystem = setupLabelSystem(labelContainer);
        const controls = setupControls(container);
        
        // Create regions
        const regions = {
            eastern: createEasternContinent(scene, labelSystem),
            central: createCentralIslands(scene, labelSystem),
            western: createWesternRegion(scene, labelSystem),
            underwater: createUnderwaterStructures(scene, labelSystem),
            sky: createSkyStructures(scene, labelSystem)
        };
        
        // Create connectors between regions
        createConnectors(scene, regions);
        
        // Setup direction markers
        const directionMarkers = setupDirectionMarkers(scene);
        
        // Setup zoom controls
        const zoomControls = await setupZoomControls(container, camera);
        
        // Setup animations
        setupAnimations(camera, controls, labelSystem, renderer, scene, zoomControls);
        
        // Setup cleanup function
        cleanup = function() {
            if (controls && controls.cleanup) controls.cleanup();
            if (labelSystem && labelSystem.cleanup) labelSystem.cleanup();
            if (zoomControls && zoomControls.cleanup) zoomControls.cleanup();
            if (directionMarkers && directionMarkers.cleanup) directionMarkers.cleanup();
            
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
    } catch (error) {
        console.error("Error initializing visualization:", error);
        throw error;
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initWorldVisualization().catch(console.error);
});

// Handle cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (cleanup) {
        cleanup();
    }
});
