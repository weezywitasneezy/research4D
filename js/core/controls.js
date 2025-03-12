// UI controls including rotation and fullscreen functionality

// Setup UI controls
export function setupControls(container) {
    const visualizationContainer = document.querySelector('.visualization-container');
    const visualizationControls = document.querySelector('.visualization-controls');
    
    // State
    const state = {
        isRotating: true // Default to rotating
    };
    
    // Event listeners
    const listeners = [];
    
    if (!visualizationControls) {
        console.warn('Visualization controls not found');
        return { 
            isRotating: () => state.isRotating,
            cleanup: () => {}
        };
    }
    
    // Clear any existing controls
    visualizationControls.innerHTML = '';
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'icon-controls-container';
    
    // Create rotation button with icon
    const toggleRotationButton = document.createElement('button');
    toggleRotationButton.id = 'toggle-rotation';
    toggleRotationButton.className = 'icon-button';
    // Use square icon when rotation is active (default)
    toggleRotationButton.innerHTML = state.isRotating ? 
        '<svg viewBox="0 0 24 24" width="12" height="12"><rect x="7" y="7" width="10" height="10" fill="currentColor"/></svg>' : 
        '<svg viewBox="0 0 24 24" width="12" height="12"><polygon points="7,5 19,12 7,19" fill="currentColor"/></svg>';
    toggleRotationButton.title = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
    
    // Create fullscreen button with icon
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'toggle-fullscreen';
    fullscreenButton.className = 'icon-button';
    fullscreenButton.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M3,3 L9,3 L9,5 L5,5 L5,9 L3,9 L3,3 Z M3,21 L3,15 L5,15 L5,19 L9,19 L9,21 L3,21 Z M21,3 L21,9 L19,9 L19,5 L15,5 L15,3 L21,3 Z M21,21 L15,21 L15,19 L19,19 L19,15 L21,15 L21,21 Z" fill="currentColor"/></svg>';
    fullscreenButton.title = 'Enter Fullscreen';
    
    // Add buttons to container
    controlsContainer.appendChild(toggleRotationButton);
    controlsContainer.appendChild(fullscreenButton);
    
    // Add container to controls
    visualizationControls.appendChild(controlsContainer);
    
    // Add necessary styles
    addIconControlsStyles();
    
    // Toggle rotation handler
    const handleToggleRotation = function() {
        state.isRotating = !state.isRotating;
        
        // Update button icon
        this.innerHTML = state.isRotating ? 
            '<svg viewBox="0 0 24 24" width="12" height="12"><rect x="7" y="7" width="10" height="10" fill="currentColor"/></svg>' : 
            '<svg viewBox="0 0 24 24" width="12" height="12"><polygon points="7,5 19,12 7,19" fill="currentColor"/></svg>';
        
        this.title = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
    };
    
    // Toggle fullscreen handler
    const handleToggleFullscreen = function() {
        toggleFullScreen(visualizationContainer);
    };
    
    // Update fullscreen button icon based on fullscreen state
    const updateFullscreenButton = function() {
        const isFullscreen = !!(document.fullscreenElement || 
            document.mozFullScreenElement || 
            document.webkitFullscreenElement || 
            document.msFullscreenElement);
            
        fullscreenButton.innerHTML = isFullscreen ? 
            '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M3,9 L3,3 L9,3 M15,3 L21,3 L21,9 M3,15 L3,21 L9,21 M15,21 L21,21 L21,15" stroke="currentColor" stroke-width="2" fill="none"/></svg>' : 
            '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M3,3 L9,3 L9,5 L5,5 L5,9 L3,9 L3,3 Z M3,21 L3,15 L5,15 L5,19 L9,19 L9,21 L3,21 Z M21,3 L21,9 L19,9 L19,5 L15,5 L15,3 L21,3 Z M21,21 L15,21 L15,19 L19,19 L19,15 L21,15 L21,21 Z" fill="currentColor"/></svg>';
            
        fullscreenButton.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    };
    
    // Mouse wheel zoom handler - keep wheel zoom functionality
    const handleMouseWheel = function(event) {
        event.preventDefault();
        // We keep the event handler for the wheel functionality
    };
    
    // Add event listeners
    toggleRotationButton.addEventListener('click', handleToggleRotation);
    fullscreenButton.addEventListener('click', handleToggleFullscreen);
    container.addEventListener('wheel', handleMouseWheel, { passive: false });
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    // Track listeners for cleanup
    listeners.push(
        { element: toggleRotationButton, event: 'click', handler: handleToggleRotation },
        { element: fullscreenButton, event: 'click', handler: handleToggleFullscreen },
        { element: container, event: 'wheel', handler: handleMouseWheel },
        { element: document, event: 'fullscreenchange', handler: updateFullscreenButton },
        { element: document, event: 'mozfullscreenchange', handler: updateFullscreenButton },
        { element: document, event: 'webkitfullscreenchange', handler: updateFullscreenButton },
        { element: document, event: 'MSFullscreenChange', handler: updateFullscreenButton }
    );
    
    return {
        isRotating: () => state.isRotating,
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

// Add CSS styles for icon controls
function addIconControlsStyles() {
    // Check if styles are already added
    if (document.getElementById('icon-controls-styles')) {
        return;
    }
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'icon-controls-styles';
    
    // Add CSS for simple icon controls
    styleElement.textContent = `
        .visualization-controls {
            position: absolute;
            bottom: 15px;
            left: 15px;
            z-index: 100;
            display: flex;
            gap: 8px;
            padding: 0;
            background: transparent;
            box-shadow: none;
        }
        
        .icon-controls-container {
            display: flex;
            gap: 8px;
        }
        
        .icon-button {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.3);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: background 0.2s, transform 0.1s;
            padding: 0;
            outline: none;
        }
        
        .icon-button:hover {
            background: rgba(0, 0, 0, 0.5);
        }
        
        .icon-button:active {
            transform: scale(0.95);
        }
    `;
    
    // Add to document
    document.head.appendChild(styleElement);
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
