# research4D
AI assisted research into understanding 4 spatial dimensions throughout history and science

## Project Overview
This project visualizes research institutes studying the fourth spatial dimension through an interactive 3D world map. The visualization features multiple regions and vertical layers, from space farms to underwater structures, showing spatial relationships between research institutes.

## Code Structure and Methodology

### Architecture
The project follows a modular architecture built with Three.js for 3D visualization:

1. **Core Module System**
   - ES6 modules for clean dependency management
   - Centralized configuration through `config.js`
   - Utility functions for common operations
   - Scene management and camera controls

2. **Component-Based Design**
   - Reusable 3D components (labels, animations, zoom controls)
   - Each component is self-contained with its own cleanup
   - Event-driven architecture for user interactions

3. **Region-Based Organization**
   - Each region is implemented as a separate module
   - Consistent interface across regions
   - Shared resources and utilities
   - Independent state management

### Technical Implementation
- **Three.js for 3D Rendering**
  - Custom geometries for unique structures
  - Advanced materials with transparency and effects
  - Optimized rendering for performance
  - Efficient resource management and cleanup

- **State Management**
  - Centralized configuration
  - Event-based state updates
  - Clean resource disposal
  - Memory leak prevention

- **Performance Optimization**
  - Geometry reuse where possible
  - Efficient material management
  - Optimized rendering loops
  - Resource cleanup on unmount

## File and Folder Structure

```
/
├── index.html                      // Main HTML file
├── css/
│   ├── main-styles.css             // General styling for the website
│   └── visualization.css           // Specific styling for the 3D visualization
├── js/
│   ├── main.js                     // Main entry point and module loader
│   ├── core/
│   │   ├── config.js               // Global CONFIG object with settings
│   │   ├── controls.js             // UI controls module
│   │   ├── scene.js                // Scene setup and management
│   │   └── utils.js                // Utility functions including connectors
│   ├── components/
│   │   ├── animations.js           // Camera position and animation controls
│   │   ├── labels.js               // 3D label system for objects
│   │   └── zoom.js                 // Camera zoom and elevation controls
│   └── regions/                    // Each region in its own file
│       ├── eastern.js              // Eastern continent implementation
│       ├── central.js              // Central islands implementation
│       ├── western.js              // Western regions implementation
│       ├── underwater.js           // Underwater structures implementation
│       └── sky.js                  // Sky structures implementation
├── images/                         // Images for the website
└── music/                          // Audio files for the music player
```

## World Regions and Structures

### Eastern Region
The most diverse and developed region, featuring:
- **Vertical Farms**: Multiple farm towers with domes
- **Industrial Area**: Factory buildings with chimneys
- **Seaside Capital**: Central palace with surrounding buildings
- **Space Farms**: Geodesic domes with connecting walkways
- **Eastern Mines**: Underground caverns and tunnels
- **Sewers**: Complex sewer system with processing tanks

### Western Region
Themed around fire and volcanic elements:
- **Fire Islands**: Volcanic terrain
- **Hell's End**: Continent with volcanic mountains and lava pools
- **Hell's Gate**: Capital with flaming towers and gate structures

### Central Region
Floating and island-based structures:
- **Magic Islands**: Central islands
- **Moon Palace**: Floating palace with spires
- **Forested Islands**: Islands with forest farms
- **Smuggler's Island**: Hidden trading post
- **Belt**: Aerial structure connecting islands
- **Cave Islands**: Underground network of caves

### Sky Region
Floating structures with ethereal elements:
- **Sky Palace**: Floating palace with cloud structures
- **Space Farms**: Orbital ring with platforms

### Underwater Region
Submerged architectural marvels:
- **Atlantis**: Main dome with central tower and smaller domes
- Connected underwater structures
- Seafloor elements and environmental features

## Features

### Interactive 3D Visualization
- **Rotation**: Automatic camera rotation with the ability to pause/resume
- **Zoom**: Camera zoom controls (buttons and mouse wheel)
- **Vertical Navigation**: Control camera elevation to explore above and below ground
  - Use "Go Up" and "Go Down" buttons or Shift+Mouse Wheel
  - Color-coded indicators show current position relative to ground level

### Vertical Layers
The visualization is organized into multiple vertical layers:
- **Space**: Space farms and floating structures
- **Sky**: Sky Palace, The Belt, and other aerial structures
- **Surface**: Continents, islands, and ground-level structures
- **Underground**: Mines, sewers, and subterranean structures

### Music Player
- Built-in dimensional audio experience with playback controls
- Playlist of music designed to enhance exploration

## Usage
- Use mouse wheel to zoom in/out
- Hold Shift + use mouse wheel to move up/down vertically
- Use control buttons to toggle rotation, enter fullscreen, etc.
- Labels appear as you approach structures to identify key locations

## Research Papers
The site includes research papers from different institutes exploring:
- Mesopotamian ziggurats as dimensional bridges
- Ancient mathematical frameworks for higher dimensions
- Spiritual and scientific approaches to dimensional studies
