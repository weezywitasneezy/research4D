    styleElement.textContent += `
        /* Style for the label size buttons */
        .label-size-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
        }
        
        #label-size-smaller, #label-size-bigger {
            display: inline-block;
            width: calc(50% - 5px);
            text-align: center;
            margin-bottom: 6px;
            background-color: #4CAF50;
            color: white;
        }
        
        #label-size-smaller:hover, #label-size-bigger:hover {
            background-color: #3e8e41;
        }
        
        #label-size-smaller {
            margin-right: 5px;
        }
        
        #label-size-bigger {
            margin-left: 5px;
        }
    `;        /* Style for the label size buttons */
        .label-size-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
        }
        
        #label-size-smaller, #label-size-bigger {
            display: inline-block;
            width: calc(50% - 5px);
            text-align: center;
            margin-bottom: 6px;
            background-color: #4CAF50;
            color: white;
        }
        
        #label-size-smaller:hover, #label-size-bigger:hover {
            background-color: #3e8e41;
        }
        
        #label-size-smaller {
            margin-right: 5px;
        }
        
        #label-size-bigger {
            margin-left: 5px;
        }    // Get button elements for label size
    const labelSizeSmallerButton = document.getElementById('label-size-smaller');
    const labelSizeBiggerButton = document.getElementById('label-size-bigger');
    
    // Label size smaller handler
    function handleLabelSizeSmaller() {
        state.labelSize = Math.max(state.minLabelSize, state.labelSize - 0.1);
        updateLabelSizeIndicator();
        
        // Make sure CONFIG is updated
        if (window.CONFIG) {
            window.CONFIG.labelSize = state.labelSize;
            console.log('Label size decreased to:', state.labelSize);
            
            // Create and dispatch a custom event to notify that label size has changed
            const labelSizeEvent = new CustomEvent('labelSizeChanged', { detail: { size: state.labelSize } });
            window.dispatchEvent(labelSizeEvent);
            
            // Find the animation frame and force an immediate labels update
            const visualizationMount = document.getElementById('visualization-mount');
            if (visualizationMount && visualizationMount._labelSystem) {
                visualizationMount._labelSystem.updateLabels(camera);
            }
        }
    }
    
    // Label size bigger handler
    function handleLabelSizeBigger() {
        state.labelSize = Math.min(state.maxLabelSize, state.labelSize + 0.1);
        updateLabelSizeIndicator();
        
        // Make sure CONFIG is updated
        if (window.CONFIG) {
            window.CONFIG.labelSize = state.labelSize;
            console.log('Label size increased to:', state.labelSize);
            
            // Create and dispatch a custom event to notify that label size has changed
            const labelSizeEvent = new CustomEvent('labelSizeChanged', { detail: { size: state.labelSize } });
            window.dispatchEvent(labelSizeEvent);
            
            // Find the animation frame and force an immediate labels update
            const visualizationMount = document.getElementById('visualization-mount');
            if (visualizationMount && visualizationMount._labelSystem) {
                visualizationMount._labelSystem.updateLabels(camera);
            }
        }
    } // Get elements for updating the label size indicator
    const labelSizeValueElement = document.getElementById('label-size-value');
    const labelSizeSlider = document.getElementById('label-size-slider');
    
    // Function to update the label size indicator
    function updateLabelSizeIndicator() {
        if (labelSizeValueElement) {
            const sizePercent = Math.round(state.labelSize * 100);
            labelSizeValueElement.textContent = `${sizePercent}%`;
        }
        
        if (labelSizeSlider) {
            labelSizeSlider.value = state.labelSize;
        }
        
        // Update CONFIG with new label size
        if (window.CONFIG) {
            window.CONFIG.labelSize = state.labelSize;
        }
    }    // Create container for label size controls
    const labelSizeControlsContainer = document.createElement('div');
    labelSizeControlsContainer.className = 'label-size-controls-container';
    
    // Create label size indicator
    const labelSizeIndicator = document.createElement('div');
    labelSizeIndicator.className = 'label-size-indicator';
    labelSizeIndicator.innerHTML = `
        <div class="label-size-label">Label Size: <span id="label-size-value">100%</span></div>
        <div class="label-size-slider-container">
            <input type="range" id="label-size-slider" min="0.5" max="2.0" step="0.1" value="1.5" style="width: 100%">
        </div>
        <div class="label-size-buttons">
            <button id="label-size-smaller" class="control-button">Smaller</button>
            <button id="label-size-bigger" class="control-button">Bigger</button>
        </div>
    `;
    
    // Add label size control to container
    labelSizeControlsContainer.appendChild(labelSizeIndicator);
    
    // Insert after elevation controls
    elevationControlsContainer.insertAdjacentElement('afterend', labelSizeControlsContainer);// Zoom functionality for the 3D visualization

// Initialize zoom controls
function initZoomControls(container, camera) {
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
        elevationOffset: 0,  // New state for vertical movement
        minElevation: -300,  // Minimum elevation (below surface) - now much deeper
        maxElevation: 200,   // Maximum elevation (above surface)
        labelSize: 1.5,      // Label size multiplier
        minLabelSize: 0.5,   // Minimum label size
        maxLabelSize: 2.0    // Maximum label size
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
    
    // Create container for label size controls
    const labelSizeControlsContainer = document.createElement('div');
    labelSizeControlsContainer.className = 'label-size-controls-container';
    
    // Create label size indicator
    const labelSizeIndicator = document.createElement('div');
    labelSizeIndicator.className = 'label-size-indicator';
    labelSizeIndicator.innerHTML = `
        <div class="label-size-label">Label Size: <span id="label-size-value">100%</span></div>
        <div class="label-size-slider-container">
            <input type="range" id="label-size-slider" min="0.5" max="2.0" step="0.1" value="1.0" style="width: 100%">
        </div>
        <div class="label-size-buttons">
            <button id="label-size-smaller" class="control-button">Smaller</button>
            <button id="label-size-bigger" class="control-button">Bigger</button>
        </div>
    `;
    
    // Add label size control to container
    labelSizeControlsContainer.appendChild(labelSizeIndicator);
    
    // Add zoom elements to container
    zoomControlsContainer.appendChild(zoomInButton);
    zoomControlsContainer.appendChild(zoomOutButton);
    zoomControlsContainer.appendChild(zoomIndicator);
    
    // Insert after the rotation button (typically the first control)
    const toggleRotationButton = document.getElementById('toggle-rotation');
    if (toggleRotationButton) {
        toggleRotationButton.insertAdjacentElement('afterend', zoomControlsContainer);
        zoomControlsContainer.insertAdjacentElement('afterend', elevationControlsContainer);
        elevationControlsContainer.insertAdjacentElement('afterend', labelSizeControlsContainer);
    } else {
        // If rotation button not found, just add to the controls
        visualizationControls.appendChild(zoomControlsContainer);
        visualizationControls.appendChild(elevationControlsContainer);
        visualizationControls.appendChild(labelSizeControlsContainer);
    }
    
    // Add necessary styles to document if not already present
    addZoomStyles();
    
    // Get elements for updating the zoom indicator
    const zoomValueElement = document.getElementById('zoom-value');
    const zoomSliderFill = document.getElementById('zoom-slider-fill');
    
    // Function to update the zoom indicator display
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
    }
    
    // Get elements for updating the elevation indicator
    const elevationValueElement = document.getElementById('elevation-value');
    const elevationSliderFill = document.getElementById('elevation-slider-fill');
    
    // Function to update the elevation indicator display
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
    
    // Get elements for updating the label size indicator
    const labelSizeValueElement = document.getElementById('label-size-value');
    const labelSizeSlider = document.getElementById('label-size-slider');
    
    // Function to update the label size indicator
    function updateLabelSizeIndicator() {
        if (labelSizeValueElement) {
            const sizePercent = Math.round(state.labelSize * 100);
            labelSizeValueElement.textContent = `${sizePercent}%`;
        }
        
        if (labelSizeSlider) {
            labelSizeSlider.value = state.labelSize;
        }
        
        // Update CONFIG with new label size
        if (window.CONFIG) {
            window.CONFIG.labelSize = state.labelSize;
        }
    }
    
    // Initial label size update
    updateLabelSizeIndicator();
    
    // Set initial zoom and label size in CONFIG
    if (window.CONFIG) {
        window.CONFIG.currentZoom = state.zoomLevel;
        window.CONFIG.labelSize = state.labelSize;
    }
    
    // Zoom in handler
    function handleZoomIn() {
        state.zoomLevel = Math.min(state.zoomLevel + 0.2, state.maxZoom);
        updateZoomIndicator();
        
        // Update CONFIG with new zoom level
        if (window.CONFIG) {
            window.CONFIG.currentZoom = state.zoomLevel;
        }
        
        console.log('Zoomed in to:', state.zoomLevel);
    }
    
    // Zoom out handler
    function handleZoomOut() {
        state.zoomLevel = Math.max(state.zoomLevel - 0.2, state.minZoom);
        updateZoomIndicator();
        
        // Update CONFIG with new zoom level
        if (window.CONFIG) {
            window.CONFIG.currentZoom = state.zoomLevel;
        }
        
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
    
    // Enhanced mouse wheel handler
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
            // Regular zoom behavior (unchanged)
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
    
    // Label size buttons event handlers
    function handleLabelSizeSmaller() {
        state.labelSize = Math.max(state.minLabelSize, state.labelSize - 0.1);
        updateLabelSizeIndicator();
        
        // Make sure CONFIG is updated
        if (window.CONFIG) {
            window.CONFIG.labelSize = state.labelSize;
            console.log('Label size decreased to:', state.labelSize);
            
            // Force an immediate update
            const labelSizeEvent = new CustomEvent('labelSizeChanged', { detail: { size: state.labelSize } });
            window.dispatchEvent(labelSizeEvent);
        }
    }
    
    function handleLabelSizeBigger() {
        state.labelSize = Math.min(state.maxLabelSize, state.labelSize + 0.1);
        updateLabelSizeIndicator();
        
        // Make sure CONFIG is updated
        if (window.CONFIG) {
            window.CONFIG.labelSize = state.labelSize;
            console.log('Label size increased to:', state.labelSize);
            
            // Force an immediate update
            const labelSizeEvent = new CustomEvent('labelSizeChanged', { detail: { size: state.labelSize } });
            window.dispatchEvent(labelSizeEvent);
        }
    }
    
    // Get button elements for label size
    const labelSizeSmallerButton = document.getElementById('label-size-smaller');
    const labelSizeBiggerButton = document.getElementById('label-size-bigger');
    
    // Add label size button event listeners
    if (labelSizeSmallerButton) {
        labelSizeSmallerButton.addEventListener('click', handleLabelSizeSmaller);
    }
    
    if (labelSizeBiggerButton) {
        labelSizeBiggerButton.addEventListener('click', handleLabelSizeBigger);
    }
    
    // Label size slider event handler
    function handleLabelSizeChange(event) {
        state.labelSize = parseFloat(event.target.value);
        updateLabelSizeIndicator();
        
        // Make sure CONFIG is updated
        if (window.CONFIG) {
            // Force a redraw of labels when the size changes
            window.CONFIG.labelSize = state.labelSize;
            console.log('Label size changed to:', state.labelSize, 'CONFIG updated:', window.CONFIG.labelSize);
            
            // Create and dispatch a custom event to notify that label size has changed
            const labelSizeEvent = new CustomEvent('labelSizeChanged', { detail: { size: state.labelSize } });
            window.dispatchEvent(labelSizeEvent);
            
            // Find the animation frame and force an immediate labels update
            const visualizationMount = document.getElementById('visualization-mount');
            if (visualizationMount && visualizationMount._labelSystem) {
                visualizationMount._labelSystem.updateLabels(camera);
            }
        } else {
            console.warn('CONFIG object not available for label size update');
        }
    }
    
    // Add label size slider event listener
    if (labelSizeSlider) {
        labelSizeSlider.addEventListener('input', handleLabelSizeChange);
    }
    
    // Track listeners for cleanup
    listeners.push(
        { element: zoomInButton, event: 'click', handler: handleZoomIn },
        { element: zoomOutButton, event: 'click', handler: handleZoomOut },
        { element: elevateUpButton, event: 'click', handler: handleElevateUp },
        { element: elevateDownButton, event: 'click', handler: handleElevateDown },
        { element: container, event: 'wheel', handler: handleMouseWheel },
        { element: labelSizeSlider, event: 'input', handler: handleLabelSizeChange },
        { element: labelSizeSmallerButton, event: 'click', handler: handleLabelSizeSmaller },
        { element: labelSizeBiggerButton, event: 'click', handler: handleLabelSizeBigger }
    );
    
    // Return API
    return {
        zoomLevel: () => state.zoomLevel,
        elevationOffset: () => state.elevationOffset,
        labelSize: () => state.labelSize,
        cleanup: () => {
            // Remove all event listeners
            listeners.forEach(({ element, event, handler }) => {
                if (element) {
                    element.removeEventListener(event, handler);
                }
            });
            
            // Optionally remove DOM elements
            if (zoomControlsContainer && zoomControlsContainer.parentNode) {
                zoomControlsContainer.parentNode.removeChild(zoomControlsContainer);
            }
            
            if (elevationControlsContainer && elevationControlsContainer.parentNode) {
                elevationControlsContainer.parentNode.removeChild(elevationControlsContainer);
            }
            
            if (labelSizeControlsContainer && labelSizeControlsContainer.parentNode) {
                labelSizeControlsContainer.parentNode.removeChild(labelSizeControlsContainer);
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
    
    // Add CSS for zoom and elevation controls
    styleElement.textContent = `
        .zoom-controls-container,
        .elevation-controls-container,
        .label-size-controls-container {
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
        .elevation-indicator,
        .label-size-indicator {
            width: 100%;
            margin-top: 2px;
        }
        
        .zoom-label,
        .elevation-label,
        .label-size-label {
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
        .elevation-slider-container,
        .label-size-slider-container {
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
        
        /* Style for the label size slider */
        #label-size-slider {
            width: 100%;
            margin: 0;
            height: 24px;
            background: #e0e0e0;
            outline: none;
            -webkit-appearance: none;
            border-radius: 3px;
        }
        
        #label-size-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #4CAF50;
            cursor: pointer;
            border-radius: 50%;
        }
        
        #label-size-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #4CAF50;
            cursor: pointer;
            border-radius: 50%;
            border: none;
        }
        
        /* Style for the label size buttons */
        .label-size-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
        }
        
        #label-size-smaller, #label-size-bigger {
            display: inline-block;
            width: calc(50% - 5px);
            text-align: center;
            margin-bottom: 6px;
            background-color: #4CAF50;
            color: white;
        }
        
        #label-size-smaller:hover, #label-size-bigger:hover {
            background-color: #3e8e41;
        }
        
        #label-size-smaller {
            margin-right: 5px;
        }
        
        #label-size-bigger {
            margin-left: 5px;
        }
    `;
    
    // Add to document
    document.head.appendChild(styleElement);
}

// Export functions
window.initZoomControls = initZoomControls;

console.log('Zoom controls module loaded');
