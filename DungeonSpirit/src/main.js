import * as THREE from 'three';
import { StartRoom } from './rooms/StartRoom.js';
import { CameraManager } from './managers/CameraManager.js';
import { SceneManager } from './managers/SceneManager.js';
import { RenderManager } from './managers/RenderManager.js';
import { ControlsManager } from './managers/ControlsManager.js';
import { LightsManager } from './managers/LightsManager.js';

let scene, camera, renderer, composer, controls;
let pixelatedPass;
let currentRoom;

const sceneManager = new SceneManager();
scene = sceneManager.getScene();
const cameraManager = new CameraManager();
camera = cameraManager.getCamera();

const renderManager = new RenderManager(scene, camera);
renderer = renderManager.getRenderer();
composer = renderManager.getComposer();

const controlsManager = new ControlsManager(camera, renderer.domElement);
controls = controlsManager.getControls();

//const lightsManager = new LightsManager(scene);


init();
animate(); 

function init(){
    currentRoom = new StartRoom();
    scene.add(currentRoom);

    // Add lighting - make it brighter
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    // Add directional light to see textures better
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);
    
    // Handle window resizing
    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}