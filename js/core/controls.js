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
    toggleRotationButton.innerHTML = state.isRotating ? 
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z" fill="currentColor"/></svg>' : 
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M8 5.14v14l11-7-11-7z" fill="currentColor"/></svg>';
    toggleRotationButton.title = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
    
    // Create fullscreen button with icon
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'toggle-fullscreen';
    fullscreenButton.className = 'icon-button';
    fullscreenButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>';
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
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z" fill="currentColor"/></svg>' : 
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M8 5.14v14l11-7-11-7z" fill="currentColor"/></svg>';
        
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
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/></svg>' : 
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>';
            
        fullscreenButton.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    };
    
    // Mouse wheel zoom handler - keep wheel zoom functionality
    const handleMouseWheel = function(event) {
        event.preventDefault();
        
        // We don't need to track zoom level in the UI anymore,
        // but we keep the event handler for the wheel functionality
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
    
    // Add CSS for icon controls
    styleElement.textContent = `
        .visualization-controls {
            position: absolute;
            bottom: 20px;
            left: 20px;
            z-index: 100;
            display: flex;
            gap: 10px;
            padding: 0;
            background: transparent;
            box-shadow: none;
        }
        
        .icon-controls-container {
            display: flex;
            gap: 15px;
        }
        
        .icon-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: background 0.2s, transform 0.2s;
            padding: 0;
            outline: none;
        }
        
        .icon-button svg {
            width: 24px;
            height: 24px;
        }
        
        .icon-button:hover {
            background: rgba(0, 0, 0, 0.7);
            transform: scale(1.05);
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
