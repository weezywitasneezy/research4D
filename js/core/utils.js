// Utility functions for visualization
import { config } from './config.js';

// Create a line between two points
function createLine(startPoint, endPoint, color) {
    const material = new THREE.LineBasicMaterial({ color: color });
    const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
    return new THREE.Line(geometry, material);
}

// Create a tube between two points
function createTube(startPoint, endPoint, radius, color) {
    // Create a curve between the points
    const curve = new THREE.CatmullRomCurve3([startPoint, endPoint]);
    
    // Create tube geometry
    const geometry = new THREE.TubeGeometry(curve, 20, radius, 8, false);
    const material = new THREE.MeshLambertMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.7
    });
    
    return new THREE.Mesh(geometry, material);
}

// Create connectors between regions
export function createConnectors(scene) {
    // Sky Palace to Space Farms connector
    const skyPalaceToSpaceFarms = createTube(
        new THREE.Vector3(0, 80, 0),
        new THREE.Vector3(0, 140, 0),
        2,
        config.get('colors.skyPalace')
    );
    scene.add(skyPalaceToSpaceFarms);
    
    // Sky Palace to Seaside Capital connector
    const skyPalaceToCapital = createTube(
        new THREE.Vector3(0, 80, 0),
        new THREE.Vector3(0, 16, 0),
        2,
        config.get('colors.skyPalace')
    );
    scene.add(skyPalaceToCapital);
    
    // Sewers to Mines connector
    const sewersToMines = createTube(
        new THREE.Vector3(180, -15, 90),
        new THREE.Vector3(375, -25, -40),
        3,
        config.get('colors.sewers')
    );
    scene.add(sewersToMines);
    
    // Mines to Industrial Area connector
    const minesToIndustrial = createTube(
        new THREE.Vector3(375, -25, -40),
        new THREE.Vector3(360, 15, 30),
        3,
        config.get('colors.mines')
    );
    scene.add(minesToIndustrial);
    
    // Moon Palace to Magic Islands connector
    const moonPalaceToMagic = createTube(
        new THREE.Vector3(0, 80, 0),
        new THREE.Vector3(0, 7.5, 0),
        2,
        config.get('colors.moonPalace')
    );
    scene.add(moonPalaceToMagic);
    
    // Belt to Smugglers Island connector
    const beltToSmuggler = createTube(
        new THREE.Vector3(60, 70, 90),
        new THREE.Vector3(60, 6, 90),
        2,
        config.get('colors.belt')
    );
    scene.add(beltToSmuggler);
    
    // Magic Islands to Atlantis connector
    const magicToAtlantis = createTube(
        new THREE.Vector3(0, 7.5, 0),
        new THREE.Vector3(0, -50, 45),
        3,
        config.get('colors.magicIslands')
    );
    scene.add(magicToAtlantis);
    
    // Create connectors between major regions
    if (config.get('positions')) {
        // Space Farms to Sky Palace
        const spaceToSky = createTube(
            new THREE.Vector3(
                config.get('positions.eastern.spaceFarms.x'),
                config.get('positions.eastern.spaceFarms.y'),
                config.get('positions.eastern.spaceFarms.z')
            ),
            new THREE.Vector3(
                config.get('positions.eastern.skyPalace.x'),
                config.get('positions.eastern.skyPalace.y'),
                config.get('positions.eastern.skyPalace.z')
            ),
            4,
            config.get('colors.skyPalace')
        );
        scene.add(spaceToSky);
        
        // Sky Palace to Seaside Capital
        const skyToCapital = createTube(
            new THREE.Vector3(
                config.get('positions.eastern.skyPalace.x'),
                config.get('positions.eastern.skyPalace.y'),
                config.get('positions.eastern.skyPalace.z')
            ),
            new THREE.Vector3(
                config.get('positions.eastern.capital.x'),
                config.get('positions.eastern.capital.y'),
                config.get('positions.eastern.capital.z')
            ),
            4,
            config.get('colors.skyPalace')
        );
        scene.add(skyToCapital);
        
        // Magic Islands to Atlantis
        const magicToAtlantisConfig = createTube(
            new THREE.Vector3(
                config.get('positions.central.magicIslands.x'),
                config.get('positions.central.magicIslands.y'),
                config.get('positions.central.magicIslands.z')
            ),
            new THREE.Vector3(
                config.get('positions.central.atlantis.x'),
                config.get('positions.central.atlantis.y'),
                config.get('positions.central.atlantis.z')
            ),
            4,
            config.get('colors.magicIslands')
        );
        scene.add(magicToAtlantisConfig);
    }
}

// Make functions available globally
window.createConnectors = createConnectors;

console.log('Utils module loaded');