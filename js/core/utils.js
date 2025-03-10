// Utility functions for the visualization
import { CONFIG } from './config.js';

// Create vertical connectors between different regions/layers
export function createConnectors(scene, elements) {
    const connectors = [
        // Space to Sky Palace
        createVerticalConnector(
            CONFIG.positions.eastern.spaceFarms.x, 
            CONFIG.positions.eastern.spaceFarms.y, 
            CONFIG.positions.eastern.spaceFarms.z, 
            CONFIG.positions.eastern.skyPalace.x, 
            CONFIG.positions.eastern.skyPalace.y, 
            CONFIG.positions.eastern.skyPalace.z, 
            CONFIG.colors.skyPalace
        ),
        
        // Sky Palace to Seaside Capital
        createVerticalConnector(
            CONFIG.positions.eastern.skyPalace.x, 
            CONFIG.positions.eastern.skyPalace.y, 
            CONFIG.positions.eastern.skyPalace.z, 
            CONFIG.positions.eastern.capital.x, 
            CONFIG.positions.eastern.capital.y, 
            CONFIG.positions.eastern.capital.z, 
            CONFIG.colors.skyPalace
        ),
        
        // Seaside Capital to Sewers
        createVerticalConnector(
            CONFIG.positions.eastern.capital.x, 
            CONFIG.positions.eastern.capital.y, 
            CONFIG.positions.eastern.capital.z, 
            CONFIG.positions.eastern.sewers.x, 
            CONFIG.positions.eastern.sewers.y, 
            CONFIG.positions.eastern.sewers.z, 
            CONFIG.colors.sewers
        ),
        
        // Industrial Area to Mines
        createVerticalConnector(
            CONFIG.positions.eastern.industrial.x, 
            CONFIG.positions.eastern.industrial.y, 
            CONFIG.positions.eastern.industrial.z, 
            CONFIG.positions.eastern.mines.x, 
            CONFIG.positions.eastern.mines.y, 
            CONFIG.positions.eastern.mines.z, 
            CONFIG.colors.mines
        ),
        
        // Moon Palace to Magic Islands
        createVerticalConnector(
            CONFIG.positions.central.moonPalace.x, 
            CONFIG.positions.central.moonPalace.y, 
            CONFIG.positions.central.moonPalace.z, 
            CONFIG.positions.central.magicIslands.x, 
            CONFIG.positions.central.magicIslands.y, 
            CONFIG.positions.central.magicIslands.z, 
            CONFIG.colors.moonPalace
        ),
        
        // The Belt to Smugglers Island
        createVerticalConnector(
            CONFIG.positions.central.belt.x, 
            CONFIG.positions.central.belt.y, 
            CONFIG.positions.central.belt.z, 
            CONFIG.positions.central.smugglersIsland.x, 
            CONFIG.positions.central.smugglersIsland.y, 
            CONFIG.positions.central.smugglersIsland.z, 
            CONFIG.colors.belt
        ),
        
        // Magic Islands to Atlantis
        createVerticalConnector(
            CONFIG.positions.central.magicIslands.x, 
            CONFIG.positions.central.magicIslands.y, 
            CONFIG.positions.central.magicIslands.z, 
            CONFIG.positions.central.atlantis.x, 
            CONFIG.positions.central.atlantis.y, 
            CONFIG.positions.central.atlantis.z, 
            CONFIG.colors.magicIslands
        ),
    ];
    
    // Add all connectors to the scene
    connectors.forEach(connector => scene.add(connector));
    
    return connectors;
}

// Create a single vertical connector line
export function createVerticalConnector(startX, startY, startZ, endX, endY, endZ, color) {
    const points = [
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(endX, endY, endZ)
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color, 
        linewidth: 2,
        transparent: true,
        opacity: 0.7
    });
    
    return new THREE.Line(geometry, material);
}