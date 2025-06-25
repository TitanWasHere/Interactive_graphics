import * as THREE from 'three';
// -------- Rooms --------
import { AltairRoom } from './rooms/AltairRoom.js';
import { StartRoom } from './rooms/StartRoom.js';
import { GemRoom } from './rooms/GemRoom.js';
import { CorridorRoom } from './rooms/CorridorRoom.js';
import { SpiritRoom } from './rooms/SpiritRoom.js';
import { BalconyRoom } from './rooms/BalconyRoom.js';

// -------- Managers --------
import { CameraManager } from './managers/CameraManager.js';
import { SceneManager } from './managers/SceneManager.js';
import { RenderManager } from './managers/RenderManager.js';
import { ControlsManager } from './managers/ControlsManager.js';
import { LightsManager } from './managers/LightsManager.js';
import { AudioManager } from './managers/AudioManager.js';

// -------- Player --------
import { Player } from './player/Player.js';

// -------- NPC ---------- 
import { Spirit } from './skeletons/Spirit.js';

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
let player, newSpirit;

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

//let newSpirit;

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
    roomInstances['balcony_room'] = new BalconyRoom();
    roomInstances['corridor_room'] = new CorridorRoom();
    roomInstances['start_room'] = new StartRoom();    
    roomInstances['altair_room'] = new AltairRoom(); 
    roomInstances['gem_room'] = new GemRoom();
    roomInstances['spirit_room'] = new SpiritRoom(scene); 
    
    currentRoom = roomInstances['start_room'];    
    scene.add(currentRoom);

    setupPlayer();

    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition());
}

function setupPlayer(){
    
    player = new Player(new THREE.Vector3(0, 1, 0));

    
    newSpirit = new Spirit(new THREE.Vector3(0, 1, 7), 0xee00ff, 0x9900cc, 0xcc33ff, 0xff66ff);
    

    inventory = player.getInventory();
    /*inventory.addItem({
        id: "1",
        name: "Key",
        description: "A small key that unlocks a door.",
        quantity: 1
    });*/
    
    scene.add(player.mesh);
    scene.add(player.mainLight);

    
}

function setupInteraction() {
    interactionPromptElement = document.getElementById('interaction-prompt');
    window.addEventListener('keydown', handleInteractionKey);
}

function handleInteractionKey(event) {
 
    if (event.key.toLowerCase() === 'i') { 
        

        if(!player || (!player.currentInteractableDoor && !player.currentInteractableObject)) {
            return;
        }

        if (player.currentInteractableObject) {
            const object = player.currentInteractableObject;
            console.log("Interacting with object:", object.itemData.name);
            if (object.onInteract) {
                const shouldRemove = object.onInteract(player);
                if (shouldRemove) {
                    currentRoom.removeObject(object);
                }
            }
            return;
        }

        if (player.currentInteractableDoor.interactable) {
            enterDoor(player.currentInteractableDoor);
        }
        if(player.currentInteractableDoor.toUnlock && unlockable) {
            currentRoom.setInteractableDoor(player.currentInteractableDoor.wallSide);
            inventory.removeItem(player.currentInteractableDoor.toUnlock);
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
    
    const spiritLightColor = { color: player.mesh.material.color.getHex() };
    spiritFolder.addColor(spiritLightColor, 'color')
        .name('Light Color')
        .onChange((value) => { if (player) player.setColor(value); });
    
    spiritFolder.add(player, 'lightIntensityBase', 0, 100, 0.1)
        .name('Light Intensity')
        .onChange((value) => { if (player) player.setLightIntensity(value); });

    spiritFolder.add(player, 'lightDistance', 0, 100, 0.1)
        .name('Light Distance')
        .onChange((value) => { if (player) player.setLightDistance(value); });
        
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

    if (targetSpawnPoint && player) {
        player.mesh.position.copy(targetSpawnPoint);
        //console.log(`Spawned player at:`, targetSpawnPoint);
    }

    // Update lights for the new room
    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition());
    updateLightsGUI(currentRoom.name);

    //console.log(`Switched to ${currentRoom.name}`);

    if( newRoomName === "spirit_room" ) {
        scene.add(newSpirit.mesh);
        scene.add(newSpirit.mainLight); 
    }else{
        scene.remove(newSpirit.mesh);
        scene.remove(newSpirit.mainLight); 
    }
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
    if(player.currentInteractableDoor.interactable)
        interactionPromptElement.textContent = `Press [I] to enter ${player.currentInteractableDoor.nameTargetRoom}`;
    else{
        const toUnlock = player.currentInteractableDoor.toUnlock;

        if(toUnlock && inventory.getItem(toUnlock)){
            unlockable = true;
            interactionPromptElement.textContent = `Press [I] to unlock ${player.currentInteractableDoor.nameTargetRoom} using ${inventory.getItem(toUnlock).name}`;
        }else{
            unlockable = false;
            interactionPromptElement.textContent = `This door is locked.`;
        }

    }
    
}

function interactObject() {
    interactionPromptElement.style.display = 'block';
    const object = player.currentInteractableObject;
    
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

    player.update(deltaTime, elapsedTime, currentRoom);
    newSpirit.update(deltaTime, elapsedTime); 

    if(player.currentInteractableDoor || player.currentInteractableObject){
        if(player.currentInteractableDoor)
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