import * as THREE from 'three';
// -------- Rooms --------
import { AltairRoom } from './rooms/AltairRoom.js';
import { StartRoom } from './rooms/StartRoom.js';
import { GemRoom } from './rooms/GemRoom.js';

// -------- Managers --------
import { CameraManager } from './managers/CameraManager.js';
import { SceneManager } from './managers/SceneManager.js';
import { RenderManager } from './managers/RenderManager.js';
import { ControlsManager } from './managers/ControlsManager.js';
import { LightsManager } from './managers/LightsManager.js';
import { AudioManager } from './managers/AudioManager.js';

// -------- Player --------
import { Spirit } from './player/Spirit.js';

// -------- Default --------
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

let scene, camera, renderer, composer, controls, audio;
let currentLightsFolder, gui;
let currentRoom;
let interactionPromptElement;

// ------- Player state -------
let unlockable = false;
let inventory;

let clock;
let spirit;

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
    clock = new THREE.Clock();
    
    setupRooms();
    setupGUI();
    setupInteraction(); 

    window.addEventListener('resize', onWindowResize);
}



function setupRooms(){
    roomInstances['start_room'] = new StartRoom();    
    roomInstances['altair_room'] = new AltairRoom(); 
    roomInstances['gem_room'] = new GemRoom(); 
    
    currentRoom = roomInstances['start_room']; // Set the current room to AltairRoom   
    scene.add(currentRoom);

    setupPlayer();
    

    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition());
}

function setupPlayer(){
    
    spirit = new Spirit(new THREE.Vector3(0, 1, 0));

    inventory = spirit.getInventory();
    /*inventory.addItem({
        id: "1",
        name: "Key",
        description: "A small key that unlocks a door.",
        quantity: 1
    });*/
    
    scene.add(spirit.mesh);
    scene.add(spirit.mainLight);
}

function setupInteraction() {
    interactionPromptElement = document.getElementById('interaction-prompt');
    window.addEventListener('keydown', handleInteractionKey);
}

function handleInteractionKey(event) {
 
    if (event.key.toLowerCase() === 'i') { 
        

        if(!spirit || (!spirit.currentInteractableDoor && !spirit.currentInteractableObject)) {
            return;
        }

        if (spirit.currentInteractableObject) {
            const object = spirit.currentInteractableObject;
            console.log("Interacting with object:", object.itemData.name);
            if (object.onInteract) {
                const shouldRemove = object.onInteract(spirit);
                if (shouldRemove) {
                    currentRoom.removeObject(object);
                }
            }
            return;
        }

        if (spirit.currentInteractableDoor.interactable) {
            enterDoor(spirit.currentInteractableDoor);
        }
        if(spirit.currentInteractableDoor.toUnlock && unlockable) {
            currentRoom.setInteractableDoor(spirit.currentInteractableDoor.wallSide);
            inventory.removeItem(spirit.currentInteractableDoor.toUnlock);
            unlockable = false;
        }
    }
}

function enterDoor(doorDefinition) {
    if (!doorDefinition || !doorDefinition.targetRoom) {
        console.warn("Attempted to enter a door with no target room defined.");
        return;
    }

    const targetRoomName = doorDefinition.targetRoom;
    const targetSpawnPoint = doorDefinition.targetSpawnPoint;

    if (roomInstances[targetRoomName]) {
        //console.log(`Entering door to ${targetRoomName}`);
        onRoomChange(targetRoomName, targetSpawnPoint);
    } else {
        console.warn(`Target room "${targetRoomName}" not found!`);
    }
}

function setupGUI() {
    gui = new GUI();

    audio = new AudioManager(camera);
    
    const audioFolder = gui.addFolder('Audio Controls');
    
    const audioControls = {
        playPause: () => {
            audio.togglePlayPause();
        },
        status: 'Stopped' 
    };
    
    audioFolder.add(audioControls, 'playPause').name('Play/Pause Music');
    
    // Volume control
    audioFolder.add(audio, 'volume', 0, 1, 0.01)
        .name('Volume')
        .onChange((value) => {
            audio.setVolume(value);
        });
    

    audioFolder.open();

    const spiritFolder = gui.addFolder('Spirit Light');
    
    const spiritLightColor = { color: spirit.mesh.material.color.getHex() };
    spiritFolder.addColor(spiritLightColor, 'color')
        .name('Light Color')
        .onChange((value) => { if (spirit) spirit.setColor(value); });
    
    spiritFolder.add(spirit, 'lightIntensityBase', 0, 100, 0.1)
        .name('Light Intensity')
        .onChange((value) => { if (spirit) spirit.setLightIntensity(value); });

    spiritFolder.add(spirit, 'lightDistance', 0, 100, 0.1)
        .name('Light Distance')
        .onChange((value) => { if (spirit) spirit.setLightDistance(value); });
        
    spiritFolder.open();

    const roomNames = Object.keys(roomInstances);
    const guiControls = {
        currentRoomName: currentRoom.name 
    };

    gui.add(guiControls, 'currentRoomName', roomNames)
       .name('Choose Room')
       .onChange(newRoomName => onRoomChange(newRoomName, null)); 

    updateLightsGUI(currentRoom.name);
    
}


function onRoomChange(newRoomName, targetSpawnPoint) {
    if (newRoomName === currentRoom.name) {
        console.log(`Already in ${newRoomName}`);
        return;
    }

    scene.remove(currentRoom);
    
    currentRoom = roomInstances[newRoomName];
    scene.add(currentRoom); 

    if (targetSpawnPoint && spirit) {
        spirit.mesh.position.copy(targetSpawnPoint);
        //console.log(`Spawned spirit at:`, targetSpawnPoint);
    }

    // Update lights for the new room
    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition());
    updateLightsGUI(currentRoom.name);

    //console.log(`Switched to ${currentRoom.name}`);
}


function updateLightsGUI(roomName) {

    /*let existingFolder = false;
    for (const folder of gui.folders) {
        if (folder._title === `Lights: ${roomName}`) {
            currentLightsFolder = folder;
            return
        }
    }*/

    if( currentLightsFolder ) {
        currentLightsFolder.destroy();
        currentLightsFolder = null;
    }
    

    currentLightsFolder = gui.addFolder(`Lights: ${roomName}`);

    const activeLights = lightsManager.getCurrentActiveLights();

    activeLights.forEach((light, index) => {
        const lightType = light.type.replace('Light', ''); 
        const lightFolder = currentLightsFolder.addFolder(`${lightType} ${index + 1}`);

        lightFolder.add(light, 'intensity', 0, 5, 0.01) // Min, Max, Step
            .name('Intensity')
            .listen(); // 'listen' fa sì che il valore nel GUI si aggiorni se cambia esternamente

        if (light instanceof THREE.AmbientLight || 
            light instanceof THREE.DirectionalLight ||
            light instanceof THREE.PointLight ||
            light instanceof THREE.SpotLight) {
            
            const colorObject = {
                color: '#' + light.color.getHexString()
            };
            lightFolder.addColor(colorObject, 'color')
                .name('Color')
                .onChange((value) => {
                    light.color.set(value);
                });
        }
        
        if (light instanceof THREE.HemisphereLight) {
            const skyColorObject = { color: '#' + light.skyColor.getHexString() };
            lightFolder.addColor(skyColorObject, 'color')
                .name('Sky Color')
                .onChange((value) => {
                    light.skyColor.set(value);
                });
            
            const groundColorObject = { color: '#' + light.groundColor.getHexString() };
            lightFolder.addColor(groundColorObject, 'color')
                .name('Ground Color')
                .onChange((value) => {
                    light.groundColor.set(value);
                });
        }

        


        lightFolder.open(); 
    });
}

function interactDoor(){

    interactionPromptElement.style.display = 'block';
    if(spirit.currentInteractableDoor.interactable)
        interactionPromptElement.textContent = `Press [I] to enter ${spirit.currentInteractableDoor.nameTargetRoom}`;
    else{
        const toUnlock = spirit.currentInteractableDoor.toUnlock;

        if(toUnlock && inventory.getItem(toUnlock)){
            unlockable = true;
            interactionPromptElement.textContent = `Press [I] to unlock ${spirit.currentInteractableDoor.nameTargetRoom} using ${inventory.getItem(toUnlock).name}`;
        }else{
            unlockable = false;
            interactionPromptElement.textContent = `This door is locked.`;
        }

    }
    
}

function interactObject() {
    interactionPromptElement.style.display = 'block';
    const object = spirit.currentInteractableObject;
    
    if (object) {
        interactionPromptElement.textContent = `Press [I] to take ${object.itemData.name}`;
    } else {
        interactionPromptElement.style.display = 'none';
        interactionPromptElement.textContent = '';
        unlockable = false;
    }
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    spirit.update(deltaTime, elapsedTime, currentRoom);

    if(spirit.currentInteractableDoor || spirit.currentInteractableObject){
        if(spirit.currentInteractableDoor)
            interactDoor();
        else
            interactObject();
    }else{
        interactionPromptElement.style.display = 'none';
        interactionPromptElement.textContent = '';
        unlockable = false;
    }
    
    controls.update();
    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}