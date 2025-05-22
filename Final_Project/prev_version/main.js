import * as THREE from 'three';
import { RendererManager } from './rendererManager.js';
import { LightingManager } from './lightingManager.js';
import { RoomManager } from './roomManager.js';

// ----------- SETUP SCENE -----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x231b2d);

// ----------- SETUP CAMERA -----------
const frustumHeight = 15;
let aspect = window.innerWidth / window.innerHeight;
let frustumWidth = frustumHeight * aspect;

const camera = new THREE.OrthographicCamera(
    -frustumWidth / 2,
    frustumWidth / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    0.1,
    1000
);

camera.position.set(15, 15, 15);
camera.lookAt(0, 0, 0);

// ----------- SETUP RENDERER AND EFFECTS -----------
const rendererManager = new RendererManager(6); // Pixelation level = 6
const composer = rendererManager.setupEffects(scene, camera);

// ----------- SETUP LIGHTING -----------
const lightingManager = new LightingManager(scene);

// ----------- SETUP ROOM MANAGEMENT -----------
const roomManager = new RoomManager(scene, lightingManager);

// ----------- EVENT LISTENERS -----------
document.getElementById('showBrickRoom').addEventListener('click', () => {
    roomManager.showRoom('brick');
});

document.getElementById('showBlackRoom').addEventListener('click', () => {
    roomManager.showRoom('black');
});

// Add pixelation controls (optional)
const pixelationControl = document.createElement('div');
pixelationControl.style.position = 'absolute';
pixelationControl.style.bottom = '10px';
pixelationControl.style.left = '10px';
pixelationControl.style.color = 'white';
pixelationControl.innerHTML = `
    <label for="pixelSize">Pixel Size: </label>
    <input type="range" id="pixelSize" min="1" max="16" value="6" />
    <span id="pixelSizeValue">6</span>
`;
document.body.appendChild(pixelationControl);

document.getElementById('pixelSize').addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    rendererManager.setPixelSize(size);
    document.getElementById('pixelSizeValue').textContent = size;
});

// ----------- RESIZE HANDLING -----------
function onWindowResize() {
    aspect = window.innerWidth / window.innerHeight;
    frustumWidth = frustumHeight * aspect;
    camera.left = -frustumWidth / 2;
    camera.right = frustumWidth / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = -frustumHeight / 2;
    camera.updateProjectionMatrix();
    
    rendererManager.resize();
}
window.addEventListener('resize', onWindowResize);
onWindowResize();

// ----------- ANIMATION LOOP -----------
function animate() {
    requestAnimationFrame(animate);
    rendererManager.render(scene, camera);
}

animate();

// ----------- Initial Room Display -----------
roomManager.showRoom('brick');