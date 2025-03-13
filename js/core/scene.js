// Scene initialization and management
import { CONFIG } from './config.js';

// Initialize the scene, camera, and renderer
export function setupScene(container) {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.scene.backgroundColor);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        CONFIG.camera.fov, 
        container.clientWidth / container.clientHeight, 
        CONFIG.camera.near, 
        CONFIG.camera.far
    );
    
    // Position camera
    const zoomFactor = CONFIG.camera.zoomFactor;
    const cameraRadius = CONFIG.camera.radius * zoomFactor;
    const cameraHeight = CONFIG.camera.height * zoomFactor;
    
    camera.position.set(cameraRadius, cameraHeight, cameraRadius);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create a container for HTML labels
    const labelContainer = document.createElement('div');
    labelContainer.style.position = 'absolute';
    labelContainer.style.top = '0';
    labelContainer.style.left = '0';
    labelContainer.style.width = '100%';
    labelContainer.style.height = '100%';
    labelContainer.style.pointerEvents = 'none';
    labelContainer.style.overflow = 'hidden';
    container.appendChild(labelContainer);

    // Add lights
    addLights(scene);
    
    // Add base ground plane (sea level)
    addBasePlane(scene);
    
    // Add grid helper
    addGridHelper(scene);
    
    // Setup window resize handler
    const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    };
    
    // Add resize event listeners including fullscreen changes
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('mozfullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);
    document.addEventListener('MSFullscreenChange', handleResize);
    
    return {
        scene, 
        camera, 
        renderer, 
        labelContainer,
        cleanup: () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('fullscreenchange', handleResize);
            document.removeEventListener('mozfullscreenchange', handleResize);
            document.removeEventListener('webkitfullscreenchange', handleResize);
            document.removeEventListener('MSFullscreenChange', handleResize);
        }
    };
}

// Add lights to the scene
function addLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

// Add base plane (sea level)
function addBasePlane(scene) {
    const baseGeometry = new THREE.PlaneGeometry(400, 400);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.scene.waterColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    basePlane.rotation.x = -Math.PI / 2;
    scene.add(basePlane);
}

// Add grid helper
function addGridHelper(scene) {
    const gridHelper = new THREE.GridHelper(400, 40, 0x000000, 0x000000);
    gridHelper.position.y = 0.1;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}