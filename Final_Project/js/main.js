import * as THREE from 'three';
import { AmbientLight, PointLight } from 'three';

import { createRoom, ROOM_CONSTANTS } from './roomUtils.js';
import {
    lineMaterial,
    blackFloorMaterial,
    blackWallMaterial,
    grayFloorSidesMaterial,
    brickWallMaterial,
    brickFloorMaterial,
    onBrickWallTextureLoaded,
    onBrickFloorTextureLoaded
} from './materials.js';

// ----------- SETUP SCENE -----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x231b2d); 

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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows often look better

document.body.appendChild(renderer.domElement);

// ----------- LIGHTS (Torch Effect - Conditional) -----------
// Reduce ambient light significantly to make the scene darker overall when the torch is off
const ambientLight = new AmbientLight(0x404040,5); // Lower intensity
scene.add(ambientLight);

// Point light representing the torch - create it but initially hide it
const torchLight = new PointLight(0xe26309, 300, 6); // Color (Orange), Intensity, Distance
// Position the light low and near one of the walls, as if mounted or held
const lightX = -ROOM_CONSTANTS.floorWidth / 2 + ROOM_CONSTANTS.wallThickness + 0.5; // slightly in front of wall 2
const lightY = ROOM_CONSTANTS.wallHeight / 2 + ROOM_CONSTANTS.floorHeight / 2 - 2; // around mid-height
const lightZ = 0; 

torchLight.position.set(lightX, lightY, lightZ);

// Enable shadow casting for the torch light
torchLight.castShadow = true;

// Configure shadow camera for the point light
torchLight.shadow.mapSize.width = 1024;
torchLight.shadow.mapSize.height = 1024;
torchLight.shadow.camera.near = 0.1;
torchLight.shadow.camera.far = 20;
torchLight.shadow.bias = -0.005;

// --- Initially hide the torch light ---
torchLight.visible = false;

scene.add(torchLight); // Add the light to the scene always, control visibility



// ----------- ROOM MANAGEMENT -----------
let currentRoomGroup = null;
let currentRoomObject = null;
let currentRoomName = null;

const roomConfigs = {
    brick: {
        name: 'brick',
        floorTopMaterial: brickFloorMaterial,
        floorSidesMaterial: grayFloorSidesMaterial,
        wallMaterial: brickWallMaterial,
        lineMaterial: lineMaterial
    },
    black: {
        name: 'black',
        floorTopMaterial: blackFloorMaterial,
        floorSidesMaterial: grayFloorSidesMaterial,
        wallMaterial: blackWallMaterial,
        lineMaterial: lineMaterial
    }
};

/**
 * @param {string} roomName - The key of the room configuration (e.g., 'brick', 'black').
 */
function showRoom(roomName) {
     currentRoomName = roomName;

     const config = roomConfigs[roomName];
     if (!config) {
        console.error(`Room configuration "${roomName}" not found.`);
        return;
     }

     // Create the new room using the configuration materials
     const roomObject = createRoom(
         config.floorTopMaterial,
         config.floorSidesMaterial,
         config.wallMaterial,
         config.lineMaterial
     );

     // --- Enable Shadows on Room Meshes ---
     roomObject.floorMesh.receiveShadow = true;
     roomObject.wall1Mesh.castShadow = true;
     roomObject.wall2Mesh.castShadow = true;
     

     if (currentRoomGroup) {
         scene.remove(currentRoomGroup);
         // Dispose geometries/materials if necessary here
     }

     // Store references
     currentRoomGroup = roomObject.group;
     currentRoomObject = roomObject;
     currentRoomObject.name = roomName;

     // Position
     currentRoomGroup.position.y = -2;

     // Add to scene
     scene.add(currentRoomGroup);

     console.log(`Displayed room: ${roomName}`);

     // --- Control Light Visibility based on the current room ---
     if (roomName === 'brick') {
         torchLight.visible = true;
         // If you used the helper: pointLightHelper.visible = true;
     } else {
         torchLight.visible = false;
         // If you used the helper: pointLightHelper.visible = false;
     }
}

// ----------- TEXTURE LOAD HANDLING -----------
onBrickWallTextureLoaded((loadedWallMaterial) => {
    console.log("Received notification: Brick wall texture is ready.");
    roomConfigs.brick.wallMaterial = loadedWallMaterial;

    if (currentRoomObject && currentRoomObject.name === 'brick') {
        console.log("Updating current brick room walls with loaded texture.");
        currentRoomObject.wall1Mesh.material = loadedWallMaterial;
        currentRoomObject.wall2Mesh.material = loadedWallMaterial;
    }
});

onBrickFloorTextureLoaded((loadedFloorMaterial) => {
    console.log("Received notification: Brick floor texture is ready.");
    roomConfigs.brick.floorTopMaterial = loadedFloorMaterial;

    if (currentRoomObject && currentRoomObject.name === 'brick') {
        console.log("Updating current brick room floor top with loaded texture.");
        if (Array.isArray(currentRoomObject.floorMesh.material) && currentRoomObject.floorMesh.material.length > 2) {
             currentRoomObject.floorMesh.material[2] = loadedFloorMaterial;
             currentRoomObject.floorMesh.material.needsUpdate = true;
        } else {
             console.warn("Floor mesh material is not an array or is too small to update index 2.");
        }
    }
});


// ----------- EVENT LISTENERS -----------
document.getElementById('showBrickRoom').addEventListener('click', () => {
    showRoom('brick');
});

document.getElementById('showBlackRoom').addEventListener('click', () => {
    showRoom('black');
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
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
onWindowResize();

// ----------- ANIMATION LOOP -----------
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// ----------- Initial Room Display -----------
showRoom('brick');