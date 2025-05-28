import * as THREE from 'three';
import { StartRoom } from './rooms/StartRoom.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

let scene, camera, renderer, composer, controls;
let pixelatedPass;
let currentRoom;

init();
animate(); // Start the animation loop

function init(){
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set a background color

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 20);
    
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up composer and passes
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Create pixelated pass for post-processing
    pixelatedPass = new RenderPixelatedPass(3, scene, camera);
    composer.addPass(pixelatedPass);

    // Create controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // Initialize the start room
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