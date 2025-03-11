// Configuration settings and constants

// Define CONFIG object globally
window.CONFIG = {
    // Current state tracking (used for scaling labels, etc.)
    currentZoom: 1.0, // Default zoom level
    
    // Scene settings
    scene: {
        backgroundColor: 0x87ceeb, // Sky blue
        waterColor: 0x4682b4, // Steel blue
    },
    
    // Camera settings
    camera: {
        fov: 45,
        near: 0.1,
        far: 2000,
        zoomFactor: 0.7,
        radius: 480,
        height: 180,
        rotationSpeed: 0.002
    },
    
    // Region positions
    positions: {
        eastern: {
            continent: { x: 240, y: 6, z: 0 },
            farms: { x: 270, y: 13.5, z: -120 },
            industrial: { x: 360, y: 15, z: 30 },
            capital: { x: 135, y: 16, z: 120 },
            skyPalace: { x: 135, y: 80, z: 120 },
            spaceFarms: { x: 240, y: 140, z: 20 },
            mines: { x: 375, y: -25, z: -40 },
            sewers: { x: 180, y: -15, z: 90 }
        },
        central: {
            magicIslands: { x: 0, y: 7.5, z: 0 },
            moonPalace: { x: 0, y: 80, z: 0 },
            smugglersIsland: { x: 60, y: 6, z: 90 },
            belt: { x: 60, y: 70, z: 90 },
            atlantis: { x: 0, y: -50, z: 45 }
        },
        western: {
            fireIslands: { x: -135, y: 10, z: 0 },
            hellsEnd: { x: -240, y: 7.5, z: 0 },
            hellsGate: { x: -240, y: 20, z: 0 }
        }
    },
    
    // Colors
    colors: {
        // Eastern regions
        easternContinent: 0xa9a9a9,
        industrialArea: 0x708090,
        farmRegion: 0x7cfc00,
        seasideCapital: 0xdaa520,
        skyPalace: 0x00ffff,
        spaceFarms: 0xadd8e6,
        mines: 0x696969,
        sewers: 0x556b2f,
        
        // Central regions
        magicIslands: 0x9932cc,
        moonPalace: 0xc39bd3,
        forestFarms: 0x228b22,
        smugglersIsland: 0xcd853f,
        belt: 0xff7f50,
        caveIslands: 0x808080,
        atlantis: 0x40e0d0,
        
        // Western regions
        fireIslands: 0xff4500,
        hellsEnd: 0x8b0000,
        hellsGate: 0xb22222
    },
    
    // Animation settings
    animation: {
        enabled: true,
        rotationSpeed: 0.002,
        dragEnabled: true,      // Always enable drag to rotate
        dragPausesRotation: true // Pause auto-rotation while dragging
    }
};

console.log('CONFIG loaded');