import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const WorldLayersVisualization = () => {
  const mountRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      2000
    );
    camera.position.set(300, 200, 300);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create base plane (representing sea level)
    const baseGeometry = new THREE.PlaneGeometry(300, 300);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4682b4, // Steel blue for water
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    basePlane.rotation.x = -Math.PI / 2;
    scene.add(basePlane);

    // Create the vertical layers
    
    // 1. Space Farms Layer (highest)
    const spaceFarmsGeometry = new THREE.TorusGeometry(150, 3, 16, 50);
    const spaceFarmsMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xd3d3d3, // Light gray
      transparent: true,
      opacity: 0.7
    });
    const spaceFarms = new THREE.Mesh(spaceFarmsGeometry, spaceFarmsMaterial);
    spaceFarms.position.y = 120;
    spaceFarms.rotation.x = Math.PI / 2;
    scene.add(spaceFarms);

    // 2. Floating Cities Layer
    const createFloatingCity = (x, z, size, color) => {
      const cityGroup = new THREE.Group();
      
      // Base platform
      const baseGeom = new THREE.CylinderGeometry(size, size * 1.2, size * 0.3, 6);
      const baseMat = new THREE.MeshLambertMaterial({ color });
      const base = new THREE.Mesh(baseGeom, baseMat);
      cityGroup.add(base);
      
      // Buildings
      for (let i = 0; i < 5; i++) {
        const buildingHeight = size * (0.5 + Math.random() * 1.5);
        const buildingSize = size * 0.2;
        const buildingGeom = new THREE.BoxGeometry(buildingSize, buildingHeight, buildingSize);
        const buildingMat = new THREE.MeshLambertMaterial({ 
          color: new THREE.Color(color).multiplyScalar(0.8)
        });
        const building = new THREE.Mesh(buildingGeom, buildingMat);
        building.position.set(
          (Math.random() - 0.5) * size * 0.8,
          buildingHeight / 2 + size * 0.15,
          (Math.random() - 0.5) * size * 0.8
        );
        cityGroup.add(building);
      }
      
      cityGroup.position.set(x, 60, z);
      return cityGroup;
    };

    // Eastern Sky Palace
    const skyPalace = createFloatingCity(100, -60, 18, 0x00ffff);
    scene.add(skyPalace);
    
    // Central Moon Palace
    const moonPalace = createFloatingCity(0, 0, 22, 0xc39bd3);
    scene.add(moonPalace);
    
    // Western Belt
    const belt = createFloatingCity(-90, 40, 15, 0xff7f50);
    scene.add(belt);

    // 3. Surface Layer (continents)
    // Eastern Continent
    const eastContinentGeometry = new THREE.BoxGeometry(120, 8, 90);
    const eastContinentMaterial = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 }); // Dark gray for tech world
    const eastContinent = new THREE.Mesh(eastContinentGeometry, eastContinentMaterial);
    eastContinent.position.set(100, 4, 0);
    scene.add(eastContinent);

    // Central Islands
    const createIsland = (x, z, size, height, color) => {
      const islandGeometry = new THREE.CylinderGeometry(size, size * 1.2, height, 8);
      const islandMaterial = new THREE.MeshLambertMaterial({ color });
      const island = new THREE.Mesh(islandGeometry, islandMaterial);
      island.position.set(x, height / 2, z);
      return island;
    };

    // Magic Islands
    const magicIsland = createIsland(0, 0, 30, 12, 0x228b22); // Forest green
    scene.add(magicIsland);
    
    // Smugglers Islands
    const smugglersIsland = createIsland(0, 80, 25, 10, 0x8b4513); // Saddle brown
    scene.add(smugglersIsland);

    // Western Continent
    const westContinentGeometry = new THREE.BoxGeometry(110, 15, 90);
    const westContinentMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 }); // Dark red for demon world
    const westContinent = new THREE.Mesh(westContinentGeometry, westContinentMaterial);
    westContinent.position.set(-110, 7.5, 0);
    scene.add(westContinent);

    // 4. Underground Layer
    // Create a wireframe to represent the underground caves
    const caveGeometry = new THREE.SphereGeometry(45, 8, 8);
    const caveMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffd700, // Gold for mines/caves
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const caveSystem = new THREE.Mesh(caveGeometry, caveMaterial);
    caveSystem.position.set(20, -30, 60);
    scene.add(caveSystem);

    // Eastern mines
    const mineGeometry = new THREE.SphereGeometry(25, 8, 8);
    const mineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x696969, // Dim gray for industrial mines
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const mineSystem = new THREE.Mesh(mineGeometry, mineMaterial);
    mineSystem.position.set(120, -25, -40);
    scene.add(mineSystem);

    // 5. Underwater Layer (Atlantis)
    const atlantisGeometry = new THREE.DodecahedronGeometry(30, 1);
    const atlantisMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x40e0d0, // Turquoise
      transparent: true,
      opacity: 0.7
    });
    const atlantis = new THREE.Mesh(atlantisGeometry, atlantisMaterial);
    atlantis.position.set(0, -60, 40);
    scene.add(atlantis);

    // Add vertical connectors between layers
    const createVerticalConnector = (startX, startY, startZ, endX, endY, endZ, color) => {
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
    };

    // Add connectors with updated positions
    const connectors = [
      // Space to Sky
      createVerticalConnector(100, 120, -60, 100, 60, -60, 0x00ffff), // East
      createVerticalConnector(0, 120, 0, 0, 60, 0, 0xc39bd3), // Central
      
      // Sky to Surface
      createVerticalConnector(100, 60, -60, 100, 8, -60, 0x00ffff), // East
      createVerticalConnector(0, 60, 0, 0, 12, 0, 0xc39bd3), // Central
      createVerticalConnector(-90, 60, 40, -90, 15, 40, 0xff7f50), // West
      
      // Surface to Underground
      createVerticalConnector(120, 8, -40, 120, -25, -40, 0x696969), // Eastern mines
      createVerticalConnector(0, 12, 80, 20, -30, 60, 0xffd700), // Cave system
      
      // Underground to Underwater
      createVerticalConnector(20, -30, 60, 0, -60, 40, 0x40e0d0) // To Atlantis
    ];
    
    connectors.forEach(connector => scene.add(connector));

    // Add grid helper for context
    const gridHelper = new THREE.GridHelper(300, 30, 0x000000, 0x000000);
    gridHelper.position.y = 0.1;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Create 3D text labels for important locations
    // Using Object3D to attach labels directly to objects
    const createLabel3D = (text, position, color, object) => {
      // Create a DOM element for the label
      const labelDiv = document.createElement('div');
      labelDiv.className = 'label3d';
      labelDiv.textContent = text;
      labelDiv.style.position = 'absolute';
      labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      labelDiv.style.color = color || 'white';
      labelDiv.style.padding = '4px 8px';
      labelDiv.style.borderRadius = '4px';
      labelDiv.style.fontSize = '14px';
      labelDiv.style.fontWeight = 'bold';
      labelDiv.style.pointerEvents = 'none';
      labelDiv.style.zIndex = '1000';
      labelDiv.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
      labelDiv.style.whiteSpace = 'nowrap';
      
      // Add to document body
      document.body.appendChild(labelDiv);
      
      // Reference position in world space
      const worldPos = new THREE.Vector3(position.x, position.y, position.z);
      
      return {
        element: labelDiv,
        worldPosition: worldPos,
        objectRef: object,
        offset: { x: position.x, y: position.y, z: position.z },
        update: function() {
          // Get the current position of the label in world coordinates
          const vector = this.worldPosition.clone();
          
          // Project to screen space
          vector.project(camera);
          
          // Convert the projected coordinates to CSS coordinates
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
          
          // Only show if in front of camera (z < 1) and within screen bounds
          if (vector.z < 1 && 
              x > 0 && x < window.innerWidth && 
              y > 0 && y < window.innerHeight) {
            this.element.style.display = 'block';
            this.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            
            // Calculate distance to camera for size scaling
            const dist = camera.position.distanceTo(this.worldPosition);
            const scale = Math.max(0.5, Math.min(1.2, 800 / dist));
            this.element.style.fontSize = `${14 * scale}px`;
            
            // Add a line connecting the label to the object
            this.element.style.borderBottom = `2px solid ${color || 'white'}`;
          } else {
            this.element.style.display = 'none';
          }
        }
      };
    };
    
    // Create all labels with their correct 3D positions
    const labels = [
      // Space level
      createLabel3D('Space Farms', { x: 0, y: 135, z: 0 }, '#D3D3D3', spaceFarms),
      
      // Sky level
      createLabel3D('Sky Palace', { x: 100, y: 85, z: -60 }, '#00FFFF', skyPalace),
      createLabel3D('Moon Palace', { x: 0, y: 85, z: 0 }, '#C39BD3', moonPalace),
      createLabel3D('The Belt', { x: -90, y: 85, z: 40 }, '#FF7F50', belt),
      
      // Surface level
      createLabel3D('Eastern Continent', { x: 100, y: 20, z: 0 }, '#A9A9A9', eastContinent),
      createLabel3D('Magic Islands', { x: 0, y: 20, z: 0 }, '#228B22', magicIsland),
      createLabel3D('Smugglers Islands', { x: 0, y: 20, z: 80 }, '#8B4513', smugglersIsland),
      createLabel3D('Western Continent', { x: -110, y: 25, z: 0 }, '#8B0000', westContinent),
      
      // Underground level
      createLabel3D('Cave System', { x: 20, y: -15, z: 60 }, '#FFD700', caveSystem),
      createLabel3D('Eastern Mines', { x: 120, y: -10, z: -40 }, '#696969', mineSystem),
      
      // Underwater level
      createLabel3D('Atlantis', { x: 0, y: -45, z: 40 }, '#40E0D0', atlantis)
    ];

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Setup simple camera rotation
    let angle = 0;
    const radius = 450; // Further increased radius for more zoomed out view
    const centerX = 0;
    const centerZ = 0;
    const height = 250; // Increased height for better overview

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate camera in a circle around the scene if rotation is enabled
      if (isRotating) {
        angle += 0.002;
        camera.position.x = centerX + radius * Math.cos(angle);
        camera.position.z = centerZ + radius * Math.sin(angle);
        camera.position.y = height;
        camera.lookAt(0, 0, 0);
      }
      
      // Update label positions
      labels.forEach(label => label.update());
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Remove all label elements from the DOM
      labels.forEach(label => {
        if (label.element && label.element.parentNode) {
          label.element.parentNode.removeChild(label.element);
        }
      });
    };
  }, [isRotating]);

  // Toggle rotation
  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };

  // Simplified Legend component with just rotation controls
  const Legend = () => (
    <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-4 rounded shadow-md">
      <h3 className="text-lg font-bold mb-2">World Layers Visualization</h3>
      <p className="text-sm mb-4">All key locations are labeled directly in the scene.</p>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={toggleRotation}
      >
        {isRotating ? 'Pause Rotation' : 'Start Rotation'}
      </button>
    </div>
  );

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
      <Legend />
    </div>
  );
};

export default WorldLayersVisualization;