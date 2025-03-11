# research4D
AI assisted research into understanding 4 spatial dimensions throughout history and science

## Project Overview
This project visualizes research institutes studying the fourth spatial dimension through an interactive 3D world map. The visualization features multiple regions and vertical layers, from space farms to underwater structures, showing spatial relationships between research institutes.

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

## Features

### Interactive 3D Visualization
- **Rotation**: Automatic camera rotation with the ability to pause/resume
- **Zoom**: Camera zoom controls (buttons and mouse wheel)
- **Vertical Navigation**: Control camera elevation to explore above and below ground
  - Use "Go Up" and "Go Down" buttons or Shift+Mouse Wheel
  - Color-coded indicators show current position relative to ground level

### Regions
- **Eastern Continent**: Large landmass with various sub-regions:
  - Vertical farms
  - Industrial area
  - Seaside capital
  - Space farms (floating above)
  - Underground mines and sewers

- **Central Islands**: Magical islands at the center of the world
  - Moon Palace research institute
  - Smuggler's Island
  - The Belt (aerial structure)
  - Atlantis (underwater)

- **Western Region**: Fire-themed islands and structures

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
