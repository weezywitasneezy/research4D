// Utility functions for the visualization
import { CONFIG } from './config.js';

// Create vertical connectors between different regions/layers
export function createConnectors(scene, elements) {
    const connectors = [];
    
    // Helper function to create a single vertical connector line
    function createVerticalConnector(startX, startY, startZ, endX, endY, endZ, color) {
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
        
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        connectors.push(line);
        return line;
    }
    
    // Create connector if the start and end objects exist
    function createConnectorBetweenObjects(startObject, endObject, color) {
        if (!startObject || !endObject) {
            console.warn('Cannot create connector: Missing objects');
            return null;
        }
        
        const startPos = new THREE.Vector3();
        const endPos = new THREE.Vector3();
        
        startObject.getWorldPosition(startPos);
        endObject.getWorldPosition(endPos);
        
        const connector = createVerticalConnector(
            startPos.x, startPos.y, startPos.z,
            endPos.x, endPos.y, endPos.z,
            color
        );
        
        return connector;
    }
    
    // Connect Eastern regions
    if (elements.eastern) {
        // Space Farms to Sky Palace
        if (elements.eastern.skyPalace && elements.sky && elements.sky.spaceFarms) {
            createConnectorBetweenObjects(
                elements.sky.spaceFarms,
                elements.eastern.skyPalace,
                CONFIG.colors.skyPalace
            );
        }
        
        // Sky Palace to Seaside Capital
        if (elements.eastern.skyPalace && elements.eastern.capital) {
            createConnectorBetweenObjects(
                elements.eastern.skyPalace,
                elements.eastern.capital,
                CONFIG.colors.skyPalace
            );
        }
        
        // Seaside Capital to Sewers
        if (elements.eastern.capital && elements.eastern.sewers) {
            createConnectorBetweenObjects(
                elements.eastern.capital,
                elements.eastern.sewers,
                CONFIG.colors.sewers
            );
        }
        
        // Industrial Area to Mines
        if (elements.eastern.industrial && elements.eastern.mines) {
            createConnectorBetweenObjects(
                elements.eastern.industrial,
                elements.eastern.mines,
                CONFIG.colors.mines
            );
        }
    }
    
    // Connect Central regions
    if (elements.central) {
        // Moon Palace to Magic Islands
        if (elements.central.moonPalace && elements.central.magicIslands) {
            createConnectorBetweenObjects(
                elements.central.moonPalace,
                elements.central.magicIslands,
                CONFIG.colors.moonPalace
            );
        }
        
        // The Belt to Smugglers Island
        if (elements.central.belt && elements.central.smugglersIsland) {
            createConnectorBetweenObjects(
                elements.central.belt,
                elements.central.smugglersIsland,
                CONFIG.colors.belt
            );
        }
        
        // Magic Islands to Atlantis
        if (elements.central.magicIslands && elements.underwater && elements.underwater.atlantis) {
            createConnectorBetweenObjects(
                elements.central.magicIslands,
                elements.underwater.atlantis,
                CONFIG.colors.magicIslands
            );
        }
    }
    
    // If no position info available, use hardcoded fallbacks
    if (connectors.length === 0) {
        console.warn('Using fallback connectors with hardcoded positions');
        
        // Space to Sky Palace
        if (CONFIG.positions) {
            createVerticalConnector(
                CONFIG.positions.eastern.spaceFarms.x, 
                CONFIG.positions.eastern.spaceFarms.y, 
                CONFIG.positions.eastern.spaceFarms.z, 
                CONFIG.positions.eastern.skyPalace.x, 
                CONFIG.positions.eastern.skyPalace.y, 
                CONFIG.positions.eastern.skyPalace.z, 
                CONFIG.colors.skyPalace
            );
            
            // Sky Palace to Seaside Capital
            createVerticalConnector(
                CONFIG.positions.eastern.skyPalace.x, 
                CONFIG.positions.eastern.skyPalace.y, 
                CONFIG.positions.eastern.skyPalace.z, 
                CONFIG.positions.eastern.capital.x, 
                CONFIG.positions.eastern.capital.y, 
                CONFIG.positions.eastern.capital.z, 
                CONFIG.colors.skyPalace
            );
            
            // Magic Islands to Atlantis
            createVerticalConnector(
                CONFIG.positions.central.magicIslands.x, 
                CONFIG.positions.central.magicIslands.y, 
                CONFIG.positions.central.magicIslands.z, 
                CONFIG.positions.central.atlantis.x, 
                CONFIG.positions.central.atlantis.y, 
                CONFIG.positions.central.atlantis.z, 
                CONFIG.colors.magicIslands
            );
        }
    }
    
    return connectors;
}

console.log('Utils module loaded');