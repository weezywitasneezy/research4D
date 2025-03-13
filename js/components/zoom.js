// Zoom functionality for the 3D visualization
import { CONFIG } from '../core/config.js';

// Initialize zoom controls
export function initZoomControls(container, camera) {
    console.log('Initializing zoom controls');
    
    // State object
    const state = {
        zoomLevel: 1.0,
        minZoom: 0.3,
        maxZoom: 2.5,
        elevationOffset: 0,
        minElevation: -300,
        maxElevation: 200,
        labelSize: 1.0
    };
    
    // Track event listeners for cleanup
    const listeners = [];
    
    // Set initial zoom in CONFIG
    if (CONFIG) {
        CONFIG.currentZoom = state.zoomLevel;
        CONFIG.labelSize = state.labelSize;
    }
    
    // Mouse wheel handler - still keep Shift+wheel for elevation as an alternative
    function handleMouseWheel(event) {
        event.preventDefault();
        
        // If shift key is pressed, adjust elevation instead of zoom
        if (event.shiftKey) {
            // Determine elevation direction
            const elevationDirection = event.deltaY < 0 ? 1 : -1;
            
            // Adjust elevation level
            const elevationChange = 15 * elevationDirection;
            state.elevationOffset = Math.max(
                state.minElevation, 
                Math.min(state.maxElevation, state.elevationOffset + elevationChange)
            );
            
            console.log('Mouse wheel elevation:', state.elevationOffset);
        } else {
            // Regular zoom behavior
            const zoomDirection = event.deltaY < 0 ? 1 : -1;
            
            // Adjust zoom level
            const zoomChange = 0.1 * zoomDirection;
            state.zoomLevel = Math.max(
                state.minZoom, 
                Math.min(state.maxZoom, state.zoomLevel + zoomChange)
            );
            
            // Update CONFIG with new zoom level
            if (CONFIG) {
                CONFIG.currentZoom = state.zoomLevel;
            }
            
            console.log('Mouse wheel zoom:', state.zoomLevel);
        }
    }
    
    // Add event listeners
    container.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Track listeners for cleanup
    listeners.push(
        { element: container, event: 'wheel', handler: handleMouseWheel }
    );
    
    // Return API
    return {
        zoomLevel: () => state.zoomLevel,
        elevationOffset: () => state.elevationOffset,
        setElevationOffset: (value) => {
            // Clamp value between min and max
            state.elevationOffset = Math.max(
                state.minElevation, 
                Math.min(state.maxElevation, value)
            );
        },
        labelSize: () => state.labelSize,
        cleanup: () => {
            // Remove all event listeners
            listeners.forEach(({ element, event, handler }) => {
                if (element) {
                    element.removeEventListener(event, handler);
                }
            });
        }
    };
}

console.log('Zoom controls module loaded!');
