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
    
    // Create zoom buttons
    const zoomInButton = document.createElement('button');
    zoomInButton.id = 'zoom-in';
    zoomInButton.className = 'control-button';
    zoomInButton.textContent = 'Zoom In';
    
    const zoomOutButton = document.createElement('button');
    zoomOutButton.id = 'zoom-out';
    zoomOutButton.className = 'control-button';
    zoomOutButton.textContent = 'Zoom Out';
    
    // Create container for zoom controls
    const zoomControlsContainer = document.createElement('div');
    zoomControlsContainer.className = 'zoom-controls-container';
    
    // Create zoom indicator
    const zoomIndicator = document.createElement('div');
    zoomIndicator.className = 'zoom-indicator';
    zoomIndicator.innerHTML = `
        <div class="zoom-label">Zoom: <span id="zoom-value">100%</span></div>
        <div class="zoom-slider-container">
            <div class="zoom-slider-track"></div>
            <div class="zoom-slider-fill" id="zoom-slider-fill"></div>
        </div>
        <div class="elevation-hint">Tip: Use mouse drag to rotate & elevate</div>
    `;
    
    // Add zoom elements to container
    zoomControlsContainer.appendChild(zoomInButton);
    zoomControlsContainer.appendChild(zoomOutButton);
    zoomControlsContainer.appendChild(zoomIndicator);
    
    // Insert after the rotation button (typically the first control)
    const toggleRotationButton = document.getElementById('toggle-rotation');
    if (toggleRotationButton) {
        toggleRotationButton.insertAdjacentElement('afterend', zoomControlsContainer);
    } else {
        // If rotation button not found, just add to the controls
        visualizationControls.appendChild(zoomControlsContainer);
    }
    
    // Add necessary styles to document
    addZoomStyles();
    
    // Get elements for updating the zoom indicator
    const zoomValueElement = document.getElementById('zoom-value');
    const zoomSliderFill = document.getElementById('zoom-slider-fill');
    
    // Update the zoom indicator display
    function updateZoomIndicator() {
        if (zoomValueElement) {
            const zoomPercent = Math.round(state.zoomLevel * 100);
            zoomValueElement.textContent = `${zoomPercent}%`;
        }
        
        if (zoomSliderFill) {
            // Calculate fill percentage
            const zoomRange = state.maxZoom - state.minZoom;
            const zoomPosition = state.zoomLevel - state.minZoom;
            const fillPercent = (zoomPosition / zoomRange) * 100;
            zoomSliderFill.style.width = `${fillPercent}%`;
        }
        
        // Update CONFIG with new zoom level
        if (window.CONFIG) {
            window.CONFIG.currentZoom = state.zoomLevel;
        }
    }
    
    // Initial indicator updates
    updateZoomIndicator();
    
    // Set initial zoom in CONFIG
    if (window.CONFIG) {
        window.CONFIG.currentZoom = state.zoomLevel;
        window.CONFIG.labelSize = state.labelSize;
    }
    
    // Zoom in handler
    function handleZoomIn() {
        state.zoomLevel = Math.min(state.zoomLevel + 0.2, state.maxZoom);
        updateZoomIndicator();
        console.log('Zoomed in to:', state.zoomLevel);
    }
    
    // Zoom out handler
    function handleZoomOut() {
        state.zoomLevel = Math.max(state.zoomLevel - 0.2, state.minZoom);
        updateZoomIndicator();
        console.log('Zoomed out to:', state.zoomLevel);
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
            
            updateZoomIndicator();
            console.log('Mouse wheel zoom:', state.zoomLevel);
        }
    }
    
    // Add event listeners
    zoomInButton.addEventListener('click', handleZoomIn);
    zoomOutButton.addEventListener('click', handleZoomOut);
    container.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Track listeners for cleanup
    listeners.push(
        { element: zoomInButton, event: 'click', handler: handleZoomIn },
        { element: zoomOutButton, event: 'click', handler: handleZoomOut },
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
            if (zoomControlsContainer && zoomControlsContainer.parentNode) {
                zoomControlsContainer.parentNode.removeChild(zoomControlsContainer);
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
    
    // Add CSS for zoom controls (without elevation controls)
    styleElement.textContent = `
        .zoom-controls-container {
            margin-bottom: 12px;
        }
        
        #zoom-in, #zoom-out {
            display: inline-block;
            width: calc(50% - 5px);
            text-align: center;
            margin-bottom: 6px;
        }
        
        #zoom-in {
            margin-right: 5px;
        }
        
        #zoom-out {
            margin-left: 5px;
        }
        
        .zoom-indicator {
            width: 100%;
            margin-top: 2px;
        }
        
        .zoom-label {
            font-size: 12px;
            margin-bottom: 4px;
            color: #333;
            display: flex;
            justify-content: space-between;
        }
        
        .elevation-hint {
            font-size: 10px;
            color: #666;
            text-align: right;
            margin-top: 2px;
            font-style: italic;
        }
        
        .zoom-slider-container {
            position: relative;
            width: 100%;
            height: 24px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .zoom-slider-track {
            position: absolute;
            width: 100%;
            height: 100%;
            background: #e0e0e0;
        }
        
        .zoom-slider-fill {
            position: absolute;
            width: 32%;
            height: 100%;
            background: #1a2a3a;
            transition: width 0.2s ease;
        }
    `;
    
    // Add to document
    document.head.appendChild(styleElement);
}

// Export functions
window.initZoomControls = initZoomControls;

console.log('Zoom controls module loaded');
