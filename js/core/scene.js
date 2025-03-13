// Scene initialization and management
import * as THREE from 'three';
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
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    // Ambient light for overall scene illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Main directional light (sun-like)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(50, 100, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    scene.add(mainLight);

    // Secondary directional light for fill
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-50, 50, -50);
    scene.add(fillLight);

    // Hemisphere light for environmental lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    // Point lights for specific areas
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight1.position.set(0, 50, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight2.position.set(100, 50, 100);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight3.position.set(-100, 50, -100);
    scene.add(pointLight3);
}

// Add base plane (sea level)
function addBasePlane(scene) {
    const baseGeometry = new THREE.PlaneGeometry(400, 400);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
        color: CONFIG.scene.waterColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        emissive: 0x000000,
        emissiveIntensity: 0.1
    });
    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.receiveShadow = true;
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