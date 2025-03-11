// UI controls including rotation and fullscreen functionality
import { CONFIG } from './config.js';

// Setup UI controls
export function setupControls(container) {
    const visualizationContainer = document.querySelector('.visualization-container');
    const visualizationControls = document.querySelector('.visualization-controls');
    
    // State
    const state = {
        isRotating: CONFIG.animation.enabled,
        zoomLevel: 1.0, // Default zoom level
        minZoom: 0.3,  // Minimum zoom level (zoomed out)
        maxZoom: 2.5,  // Maximum zoom level (zoomed in)
        updateZoomIndicator: null // Function to update zoom indicator
    };
    
    // Event listeners
    const listeners = [];
    
    if (!visualizationControls) {
        console.warn('Visualization controls not found');
        return { 
            isRotating: state.isRotating,
            cleanup: () => {}
        };
    }
    
    // Get or create rotation button
    let toggleRotationButton = document.getElementById('toggle-rotation');
    
    if (!toggleRotationButton) {
        toggleRotationButton = document.createElement('button');
        toggleRotationButton.id = 'toggle-rotation';
        toggleRotationButton.className = 'control-button';
        toggleRotationButton.textContent = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
        visualizationControls.appendChild(toggleRotationButton);
    }
    
    // Create zoom buttons
    const zoomInButton = document.createElement('button');
    zoomInButton.id = 'zoom-in';
    zoomInButton.className = 'control-button';
    zoomInButton.textContent = 'Zoom In';
    
    const zoomOutButton = document.createElement('button');
    zoomOutButton.id = 'zoom-out';
    zoomOutButton.className = 'control-button';
    zoomOutButton.textContent = 'Zoom Out';
    
    // Create fullscreen button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'toggle-fullscreen';
    fullscreenButton.className = 'control-button';
    fullscreenButton.textContent = 'Enter Fullscreen';
    
    // Create zoom indicator container
    const zoomControlContainer = document.createElement('div');
    zoomControlContainer.className = 'zoom-control-container';
    
    // Create zoom level indicator
    const zoomIndicator = document.createElement('div');
    zoomIndicator.className = 'zoom-indicator';
    zoomIndicator.innerHTML = `<div class="zoom-label">Zoom: <span id="zoom-value">100%</span></div>
                              <div class="zoom-slider-container">
                                <div class="zoom-slider-track"></div>
                                <div class="zoom-slider-fill" id="zoom-slider-fill"></div>
                              </div>`;
    
    zoomControlContainer.appendChild(zoomInButton);
    zoomControlContainer.appendChild(zoomOutButton);
    zoomControlContainer.appendChild(zoomIndicator);
    
    // Insert controls
    if (toggleRotationButton) {
        toggleRotationButton.insertAdjacentElement('afterend', zoomControlContainer);
        zoomControlContainer.insertAdjacentElement('afterend', fullscreenButton);
    } else {
        visualizationControls.appendChild(zoomControlContainer);
        visualizationControls.appendChild(fullscreenButton);
    }
    
    // Function to update zoom indicator
    const zoomValueElement = document.getElementById('zoom-value');
    const zoomSliderFill = document.getElementById('zoom-slider-fill');
    
    const updateZoomIndicator = () => {
        if (zoomValueElement) {
            const zoomPercent = Math.round(state.zoomLevel * 100);
            zoomValueElement.textContent = `${zoomPercent}%`;
        }
        
        if (zoomSliderFill) {
            // Calculate fill percentage based on zoom level position in the range
            const zoomRange = state.maxZoom - state.minZoom;
            const zoomPosition = state.zoomLevel - state.minZoom;
            const fillPercent = (zoomPosition / zoomRange) * 100;
            zoomSliderFill.style.width = `${fillPercent}%`;
        }
    };
    
    // Store the update function in state
    state.updateZoomIndicator = updateZoomIndicator;
    
    // Initial update
    updateZoomIndicator();
    
    // Toggle rotation handler
    const handleToggleRotation = function() {
        state.isRotating = !state.isRotating;
        this.textContent = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
    };
    
    // Zoom handlers
    const handleZoomIn = function() {
        state.zoomLevel = Math.min(state.zoomLevel + 0.2, state.maxZoom);
        if (state.updateZoomIndicator) state.updateZoomIndicator();
        console.log('Zoom in to:', state.zoomLevel);
    };
    
    const handleZoomOut = function() {
        state.zoomLevel = Math.max(state.zoomLevel - 0.2, state.minZoom);
        if (state.updateZoomIndicator) state.updateZoomIndicator();
        console.log('Zoom out to:', state.zoomLevel);
    };
    
    // Mouse wheel zoom handler
    const handleMouseWheel = function(event) {
        event.preventDefault();
        
        // Determine zoom direction based on wheel delta
        const zoomDirection = event.deltaY < 0 ? 1 : -1;
        
        // Adjust zoom level based on direction
        const zoomChange = 0.1 * zoomDirection;
        state.zoomLevel = Math.max(state.minZoom, Math.min(state.maxZoom, state.zoomLevel + zoomChange));
        if (state.updateZoomIndicator) state.updateZoomIndicator();
        
        console.log('Mouse wheel zoom:', state.zoomLevel);
    };
    
    // Toggle fullscreen handler
    const handleToggleFullscreen = function() {
        toggleFullScreen(visualizationContainer);
    };
    
    // Update fullscreen button text based on fullscreen state
    const updateFullscreenButtonText = function() {
        if (document.fullscreenElement || 
            document.mozFullScreenElement || 
            document.webkitFullscreenElement || 
            document.msFullscreenElement) {
            fullscreenButton.textContent = 'Exit Fullscreen';
        } else {
            fullscreenButton.textContent = 'Enter Fullscreen';
        }
    };
    
    // Add event listeners
    toggleRotationButton.addEventListener('click', handleToggleRotation);
    zoomInButton.addEventListener('click', handleZoomIn);
    zoomOutButton.addEventListener('click', handleZoomOut);
    fullscreenButton.addEventListener('click', handleToggleFullscreen);
    container.addEventListener('wheel', handleMouseWheel, { passive: false }); // Capture mouse wheel events
    document.addEventListener('fullscreenchange', updateFullscreenButtonText);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('MSFullscreenChange', updateFullscreenButtonText);
    
    // Track listeners for cleanup
    listeners.push(
        { element: toggleRotationButton, event: 'click', handler: handleToggleRotation },
        { element: zoomInButton, event: 'click', handler: handleZoomIn },
        { element: zoomOutButton, event: 'click', handler: handleZoomOut },
        { element: fullscreenButton, event: 'click', handler: handleToggleFullscreen },
        { element: container, event: 'wheel', handler: handleMouseWheel },
        { element: document, event: 'fullscreenchange', handler: updateFullscreenButtonText },
        { element: document, event: 'mozfullscreenchange', handler: updateFullscreenButtonText },
        { element: document, event: 'webkitfullscreenchange', handler: updateFullscreenButtonText },
        { element: document, event: 'MSFullscreenChange', handler: updateFullscreenButtonText }
    );
    
    return {
        isRotating: () => state.isRotating,
        zoomLevel: () => state.zoomLevel,
        cleanup: () => {
            // Remove all event listeners
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        }
    };
}

// Fullscreen toggle function
function toggleFullScreen(element) {
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}