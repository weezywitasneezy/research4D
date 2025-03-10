// UI controls including rotation and fullscreen functionality
import { CONFIG } from './config.js';

// Setup UI controls
export function setupControls(container) {
    const visualizationContainer = document.querySelector('.visualization-container');
    const visualizationControls = document.querySelector('.visualization-controls');
    
    // State
    const state = {
        isRotating: CONFIG.animation.enabled
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
    
    // Create fullscreen button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'toggle-fullscreen';
    fullscreenButton.className = 'control-button';
    fullscreenButton.textContent = 'Enter Fullscreen';
    
    // Insert fullscreen button after rotation button
    if (toggleRotationButton) {
        toggleRotationButton.insertAdjacentElement('afterend', fullscreenButton);
    } else {
        visualizationControls.appendChild(fullscreenButton);
    }
    
    // Toggle rotation handler
    const handleToggleRotation = function() {
        state.isRotating = !state.isRotating;
        this.textContent = state.isRotating ? 'Pause Rotation' : 'Start Rotation';
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
    fullscreenButton.addEventListener('click', handleToggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenButtonText);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('MSFullscreenChange', updateFullscreenButtonText);
    
    // Track listeners for cleanup
    listeners.push(
        { element: toggleRotationButton, event: 'click', handler: handleToggleRotation },
        { element: fullscreenButton, event: 'click', handler: handleToggleFullscreen },
        { element: document, event: 'fullscreenchange', handler: updateFullscreenButtonText },
        { element: document, event: 'mozfullscreenchange', handler: updateFullscreenButtonText },
        { element: document, event: 'webkitfullscreenchange', handler: updateFullscreenButtonText },
        { element: document, event: 'MSFullscreenChange', handler: updateFullscreenButtonText }
    );
    
    return {
        isRotating: () => state.isRotating,
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