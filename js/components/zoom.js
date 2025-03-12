// Zoom functionality for the 3D visualization

// Initialize zoom controls
function initZoomControls(container, camera) {
    console.log('Initializing zoom controls');
    
    // Get the visualization controls container
    const visualizationControls = document.querySelector('.visualization-controls');
    
    if (!visualizationControls) {
        console.warn('Visualization controls not found for zoom functionality');
        return { zoomLevel: () => 1.0, elevationOffset: () => 0 };
    }
    
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
    
    // Create container for navigation hint
    const navigationHintContainer = document.createElement('div');
    navigationHintContainer.className = 'navigation-hint-container';
    
    // Create navigation hint
    const navigationHint = document.createElement('div');
    navigationHint.className = 'navigation-hint';
    navigationHint.innerHTML = `
        <div class="hint-text">
            <p>Mouse: Drag to rotate & elevate</p>
            <p>Scroll: Zoom in/out</p>
            <p>Shift+Scroll: Move up/down</p>
        </div>
    `;
    
    // Add hint to container
    navigationHintContainer.appendChild(navigationHint);
    
    // Insert after the rotation button (typically the first control)
    const toggleRotationButton = document.getElementById('toggle-rotation');
    if (toggleRotationButton) {
        toggleRotationButton.insertAdjacentElement('afterend', navigationHintContainer);
    } else {
        // If rotation button not found, just add to the controls
        visualizationControls.appendChild(navigationHintContainer);
    }
    
    // Add necessary styles to document
    addZoomStyles();
    
    // Set initial zoom in CONFIG
    if (window.CONFIG) {
        window.CONFIG.currentZoom = state.zoomLevel;
        window.CONFIG.labelSize = state.labelSize;
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
            if (window.CONFIG) {
                window.CONFIG.currentZoom = state.zoomLevel;
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
            
            // Remove DOM elements
            if (navigationHintContainer && navigationHintContainer.parentNode) {
                navigationHintContainer.parentNode.removeChild(navigationHintContainer);
            }
        }
    };
}

// Add CSS styles for zoom controls
function addZoomStyles() {
    // Check if styles are already added
    if (document.getElementById('zoom-controls-styles')) {
        return;
    }
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'zoom-controls-styles';
    
    // Add CSS for navigation hints
    styleElement.textContent = `
        .navigation-hint-container {
            margin-bottom: 12px;
            padding: 8px;
            background-color: rgba(26, 42, 58, 0.7);
            border-radius: 5px;
        }
        
        .navigation-hint {
            width: 100%;
        }
        
        .hint-text {
            font-size: 11px;
            color: white;
            line-height: 1.4;
        }
        
        .hint-text p {
            margin: 2px 0;
        }
    `;
    
    // Add to document
    document.head.appendChild(styleElement);
}

// Export functions
window.initZoomControls = initZoomControls;

console.log('Zoom controls module loaded');
