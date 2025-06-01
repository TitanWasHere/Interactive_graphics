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

let lightsManager = new LightsManager(scene, renderer);
let roomInstances = {};

init();
animate(); 

function init(){
    roomInstances['start_room'] = new StartRoom("start");
    // roomInstances["room2"] = new Room("room2");
    // roomInstances["room3"] = new Room("room3");

    currentRoom = roomInstances['start_room'];
    scene.add(currentRoom);

    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition())
    

    
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