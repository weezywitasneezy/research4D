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
        // Keep labelSize in state for use by other components
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
    `;
    
    // Create elevation buttons
    const elevateUpButton = document.createElement('button');
    elevateUpButton.id = 'elevate-up';
    elevateUpButton.className = 'control-button';
    elevateUpButton.textContent = '↑ Go Up';
    
    const elevateDownButton = document.createElement('button');
    elevateDownButton.id = 'elevate-down';
    elevateDownButton.className = 'control-button';
    elevateDownButton.textContent = '↓ Go Down';
    
    // Create elevation indicator with Shift key hint
    const elevationIndicator = document.createElement('div');
    elevationIndicator.className = 'elevation-indicator';
    elevationIndicator.innerHTML = `<div class="elevation-label">Height: <span id="elevation-value">0m (ground)</span></div>
                                 <div class="elevation-slider-container">
                                   <div class="elevation-slider-track"></div>
                                   <div class="elevation-slider-fill" id="elevation-slider-fill"></div>
                                 </div>
                                 <div class="elevation-hint">Tip: Use Shift+Mouse Wheel</div>`;
    
    // Create container for elevation controls
    const elevationControlsContainer = document.createElement('div');
    elevationControlsContainer.className = 'elevation-controls-container';
    elevationControlsContainer.appendChild(elevateUpButton);
    elevationControlsContainer.appendChild(elevateDownButton);
    elevationControlsContainer.appendChild(elevationIndicator);
    
    // Add zoom elements to container
    zoomControlsContainer.appendChild(zoomInButton);
    zoomControlsContainer.appendChild(zoomOutButton);
    zoomControlsContainer.appendChild(zoomIndicator);
    
    // Insert after the rotation button (typically the first control)
    const toggleRotationButton = document.getElementById('toggle-rotation');
    if (toggleRotationButton) {
        toggleRotationButton.insertAdjacentElement('afterend', zoomControlsContainer);
        zoomControlsContainer.insertAdjacentElement('afterend', elevationControlsContainer);
    } else {
        // If rotation button not found, just add to the controls
        visualizationControls.appendChild(zoomControlsContainer);
        visualizationControls.appendChild(elevationControlsContainer);
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
    
    // Get elements for updating the elevation indicator
    const elevationValueElement = document.getElementById('elevation-value');
    const elevationSliderFill = document.getElementById('elevation-slider-fill');
    
    // Update the elevation indicator display
    function updateElevationIndicator() {
        if (elevationValueElement) {
            const elevValue = Math.round(state.elevationOffset);
            // Add suffix and color based on elevation
            if (elevValue < 0) {
                elevationValueElement.textContent = `${Math.abs(elevValue)}m below`;
                elevationValueElement.style.color = '#d32f2f'; // Red for below ground
            } else if (elevValue > 0) {
                elevationValueElement.textContent = `${elevValue}m above`;
                elevationValueElement.style.color = '#2e7d32'; // Green for above ground
            } else {
                elevationValueElement.textContent = `0m (ground)`;
                elevationValueElement.style.color = '#000000'; // Black for ground level
            }
        }
        
        if (elevationSliderFill) {
            // Calculate fill percentage
            const elevationRange = state.maxElevation - state.minElevation;
            const elevationPosition = state.elevationOffset - state.minElevation;
            const fillPercent = (elevationPosition / elevationRange) * 100;
            elevationSliderFill.style.width = `${fillPercent}%`;
            
            // Change color based on above/below ground
            if (state.elevationOffset < 0) {
                elevationSliderFill.style.backgroundColor = '#d32f2f'; // Red for below ground
            } else if (state.elevationOffset > 0) {
                elevationSliderFill.style.backgroundColor = '#2e7d32'; // Green for above ground
            } else {
                elevationSliderFill.style.backgroundColor = '#1a2a3a'; // Default for ground level
            }
        }
    }
    
    // Initial indicator updates
    updateZoomIndicator();
    updateElevationIndicator();
    
    // Set initial zoom in CONFIG
    if (window.CONFIG) {
        window.CONFIG.currentZoom = state.zoomLevel;
        // Set a default labelSize for consistency
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
    
    // Elevation up handler
    function handleElevateUp() {
        state.elevationOffset = Math.min(state.elevationOffset + 30, state.maxElevation);
        updateElevationIndicator();
        console.log('Elevated up to:', state.elevationOffset);
    }
    
    // Elevation down handler
    function handleElevateDown() {
        state.elevationOffset = Math.max(state.elevationOffset - 30, state.minElevation);
        updateElevationIndicator();
        console.log('Elevated down to:', state.elevationOffset);
    }
    
    // Mouse wheel handler
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
            
            updateElevationIndicator();
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
    elevateUpButton.addEventListener('click', handleElevateUp);
    elevateDownButton.addEventListener('click', handleElevateDown);
    container.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Track listeners for cleanup
    listeners.push(
        { element: zoomInButton, event: 'click', handler: handleZoomIn },
        { element: zoomOutButton, event: 'click', handler: handleZoomOut },
        { element: elevateUpButton, event: 'click', handler: handleElevateUp },
        { element: elevateDownButton, event: 'click', handler: handleElevateDown },
        { element: container, event: 'wheel', handler: handleMouseWheel }
    );
    
    // Return API
    return {
        zoomLevel: () => state.zoomLevel,
        elevationOffset: () => state.elevationOffset,
        labelSize: () => state.labelSize, // Keep this for backward compatibility
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
            
            if (elevationControlsContainer && elevationControlsContainer.parentNode) {
                elevationControlsContainer.parentNode.removeChild(elevationControlsContainer);
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
    
    // Add CSS for zoom and elevation controls (without label size controls)
    styleElement.textContent = `
        .zoom-controls-container,
        .elevation-controls-container {
            margin-bottom: 12px;
        }
        
        #zoom-in, #zoom-out,
        #elevate-up, #elevate-down {
            display: inline-block;
            width: calc(50% - 5px);
            text-align: center;
            margin-bottom: 6px;
        }
        
        #zoom-in, #elevate-up {
            margin-right: 5px;
        }
        
        #zoom-out, #elevate-down {
            margin-left: 5px;
        }
        
        .zoom-indicator,
        .elevation-indicator {
            width: 100%;
            margin-top: 2px;
        }
        
        .zoom-label,
        .elevation-label {
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
        
        .zoom-slider-container,
        .elevation-slider-container {
            position: relative;
            width: 100%;
            height: 24px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .zoom-slider-track,
        .elevation-slider-track {
            position: absolute;
            width: 100%;
            height: 100%;
            background: #e0e0e0;
        }
        
        .zoom-slider-fill,
        .elevation-slider-fill {
            position: absolute;
            width: 32%;
            height: 100%;
            background: #1a2a3a;
            transition: width 0.2s ease;
        }
        
        /* Different color for elevation controls */
        #elevate-up, #elevate-down {
            background-color: #2c5e8a;
            font-weight: bold;
        }
        
        #elevate-up:hover {
            background-color: #3d7ab3;
        }
        
        #elevate-down:hover {
            background-color: #a03232;
        }
        
        .elevation-slider-fill {
            background: #2c5e8a;
        }
    `;
    
    // Add to document
    document.head.appendChild(styleElement);
}

// Export functions
window.initZoomControls = initZoomControls;

console.log('Zoom controls module loaded');
