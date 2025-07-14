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
import { PurpleSpirit } from './objects/NPCs/PurpleSpirit.js';
import { GuardSpirit } from './objects/NPCs/GuardSpirit.js';
import { Spirit } from './skeletons/Spirit.js';

// -------- UI --------
import { StartMenu } from './ui/StartMenu.js';
import { CongratulationsOverlay } from './ui/CongratulationsOverlay.js';

// -------- Default --------
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

let DEBUG = false;

let scene, camera, renderer, composer, controls, audio;
let currentLightsFolder, gui;
let currentRoom;
let interactionPromptElement;

// ------- Game state -------
let gameStarted = false;
let startMenu;

// ------- Player state -------
let unlockable = false;
let inventory;

let clock;
let player, newSpirit, guardSpirit, guardSpirit1, guardSpirit2;

const sceneManager = new SceneManager();
scene = sceneManager.getScene();
const cameraManager = new CameraManager();
camera = cameraManager.getCamera();

const renderManager = new RenderManager(scene, camera);
renderer = renderManager.getRenderer();
composer = renderManager.getComposer();

const controlsManager = new ControlsManager(camera, renderer.domElement);
controls = controlsManager.getControls();
controls.enabled = false; 

let lightsManager = new LightsManager(scene, renderer);
let roomInstances = {};


initStartMenu();

function initStartMenu() {
    startMenu = new StartMenu(
        startGame,      
        exitGame        
    );
}

function startGame() {
    if (!gameStarted) {
        init();
        animate();
        gameStarted = true;
        
        // Start the music when game begins
        if (audio) {
            audio.togglePlayPause();
        }
        
        controls.enabled = true;
        
    } else {
        controls.enabled = true;

        
        if (audio && audio.isLoaded && !audio.isPlaying) {
            audio.togglePlayPause();
        }
    }
}


function exitGame() {
    if (confirm('Are you sure you want to exit?')) {
        window.close();
    }
}

function pauseGame() {
    if (gameStarted && startMenu) {
        controls.enabled = false;
        document.body.style.cursor = 'default';
        
        if (audio && audio.isPlaying) {
            audio.pause();
        }
        
        startMenu.show();
    }
} 

function init(){
    clock = new THREE.Clock();
    audio = new AudioManager(camera);
    
    setupRooms();
    if(DEBUG == true)
        setupGUI();
    setupInteraction(); 

    window.addEventListener('resize', onWindowResize);
}

function handlePortalActivation() {
    showCongratulationsAndReturnToMenu();
}

function showCongratulationsAndReturnToMenu() {
    controls.enabled = false;
    
    if (audio && audio.isPlaying) {
        audio.togglePlayPause();
    }
    
    const congratsOverlay = new CongratulationsOverlay(() => {
        gameStarted = false;
        
        
        if (currentRoom && currentRoom.name !== 'start_room') {
            onRoomChange('start_room', null);
        }
    });
    
    congratsOverlay.show();
}



function setupRooms(){
    
    roomInstances['corridor_room'] = new CorridorRoom();
    roomInstances['start_room'] = new StartRoom();    
    roomInstances['altair_room'] = new AltairRoom(); 
    roomInstances['gem_room'] = new GemRoom();
    roomInstances['balcony_room'] = new BalconyRoom("Balcony Room", handlePortalActivation);
    roomInstances['spirit_room'] = new SpiritRoom(scene); 
    
    currentRoom = roomInstances['start_room']; 
    scene.add(currentRoom);

    setupPlayer(roomInstances);

    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition());
}

function setupPlayer(roomInstances){
    
    player = new Player(new THREE.Vector3(0, 1, 0));
    
    newSpirit = new PurpleSpirit(new THREE.Vector3(0, 1, 7), 0xee00ff, 0x9900cc, 0xcc33ff, 0xff66ff);
    guardSpirit1 = new Spirit(new THREE.Vector3(4, 1, -5), 0x006622, 0x009933, 0x00cc44);
    guardSpirit2 = new Spirit(new THREE.Vector3(-4, 1, -3), 0x228b22, 0x33cc88, 0x66ffcc);

    guardSpirit = new GuardSpirit(new THREE.Vector3(-4, 1, -7), 0x008080 , 0x00b3a4 , 0x66ffe0);
    
    roomInstances['start_room'].addNPC(guardSpirit);
    roomInstances['spirit_room'].addNPC(newSpirit);

    inventory = player.getInventory();
    
    scene.add(player.mesh);
    scene.add(player.mainLight);
    addNPCSpirit("start_room"); 

    
}

function checkRoomBackground(roomName) {
    if (roomName === "balcony_room") {
        const textureLoader = new THREE.TextureLoader();
        const backgroundTexture = textureLoader.load('../../textures/night_background.jpg', (texture) => {
            scene.background = texture;
        });
        //const messageBox = document.getElementById('message-box');
        //messageBox.textContent = "THANKS FOR PLAYING!";
        //messageBox.style.display = 'block';

    }else{
        scene.background = null; 
        const messageBox = document.getElementById('message-box');
        messageBox.textContent = "";
        messageBox.style.display = 'none';
    }
}

function setupInteraction() {
    interactionPromptElement = document.getElementById('interaction-prompt');
    window.addEventListener('keydown', handleInteractionKey);
    
    // Add ESC key handler to show menu
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && gameStarted && startMenu && !startMenu.isVisible) {
            pauseGame();
        }
    });
}

function handleInteractionKey(event) {
 
    if (event.key.toLowerCase() === 'i') { 
        

        if(!player || (!player.currentInteractableDoor && !player.currentInteractableObject && !player.currentInteractableNPC && !player.currentInteractableStructure)) {
            return;
        }

        console.log(player.currentInteractableStructure);

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
        if(player.currentInteractableDoor) {
            if (player.currentInteractableDoor.interactable) {
                enterDoor(player.currentInteractableDoor);
            }
            if(player.currentInteractableDoor.toUnlock && unlockable) {
                currentRoom.setInteractableDoor(player.currentInteractableDoor.wallSide);
                inventory.removeItem(player.currentInteractableDoor.toUnlock);
                unlockable = false;
            }
        }

        
        if (player.currentInteractableNPC) {
            const npc = player.currentInteractableNPC;
            console.log("Interacting with NPC:", npc.name);
            if (npc.isInteractable) {
                const resp = npc.onInteract(player);
                const msg = npc.onNPCInteract(resp);
                console.log(npc);
                const messageBox = document.getElementById('message-box');
                messageBox.textContent = `[${npc.name}]: ${msg}`;
                messageBox.style.display = 'block';
                setTimeout(() => {
                    messageBox.style.display = 'none';
                    interactionPromptElement.style.display = 'none';
                    interactionPromptElement.textContent = '';
                }, 4000);
            }
            return;
        }

        if (player.currentInteractableStructure) {
            const structure = player.currentInteractableStructure;
            console.log("Interacting with structure:", structure.name);
            if (structure.toggle) {
                structure.toggle();
            }
            return;
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
        onRoomChange(targetRoomName, targetSpawnPoint);
    } else {
        console.warn(`Target room "${targetRoomName}" not found!`);
    }
}

function setupGUI() {
    gui = new GUI();

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
    if(DEBUG == true)
        updateLightsGUI(currentRoom.name);

    //console.log(`Switched to ${currentRoom.name}`);

    addNPCSpirit(newRoomName);
    checkRoomBackground(newRoomName);
}

function addNPCSpirit(newRoomName){
    if( newRoomName === "start_room" ) {
        scene.add(guardSpirit.mesh);
        scene.add(guardSpirit.mainLight); 
    }else{
        scene.remove(guardSpirit.mesh);
        scene.remove(guardSpirit.mainLight); 
    }

    if( newRoomName === "spirit_room" ) {
        scene.add(newSpirit.mesh);
        scene.add(newSpirit.mainLight);

        scene.add(guardSpirit1.mesh);
        scene.add(guardSpirit1.mainLight);
        scene.add(guardSpirit2.mesh);
        scene.add(guardSpirit2.mainLight);
    }else{
        scene.remove(newSpirit.mesh);
        scene.remove(newSpirit.mainLight);

        scene.remove(guardSpirit1.mesh);
        scene.remove(guardSpirit1.mainLight);
        scene.remove(guardSpirit2.mesh);
        scene.remove(guardSpirit2.mainLight);
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

function interactNPC(){
    interactionPromptElement.style.display = 'block';
    const npc = player.currentInteractableNPC;
    
    if (npc) {
        interactionPromptElement.textContent = `Press [I] to interact with ${npc.name}`;
    } else {
        interactionPromptElement.style.display = 'none';
        interactionPromptElement.textContent = '';
        unlockable = false;
    }
}

function interactObject() {
    interactionPromptElement.style.display = 'block';
    const object = player.currentInteractableObject;
    
    if (object) {
        console.log("Interacting with object:", object);
        interactionPromptElement.textContent = `Press [I] to take ${object.itemData.name}`;
    } else {
        interactionPromptElement.style.display = 'none';
        interactionPromptElement.textContent = '';
        unlockable = false;
    }
}

function interactStructure() {
    interactionPromptElement.style.display = 'block';
    const structure = player.currentInteractableStructure;
    
    if (structure) {
        interactionPromptElement.textContent = `Press [I] to ${structure.typeInteraction} ${structure.name}`;
    } else {
        interactionPromptElement.style.display = 'none';
        interactionPromptElement.textContent = '';
        unlockable = false;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Only update game when started and menu is hidden
    if (!gameStarted || (startMenu && startMenu.isVisible)) {
        return;
    }

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    player.update(deltaTime, elapsedTime, currentRoom);
    newSpirit.update(deltaTime, elapsedTime); 
    guardSpirit.update(deltaTime, elapsedTime);
    guardSpirit1.update(deltaTime, elapsedTime);
    guardSpirit2.update(deltaTime, elapsedTime);

    if(player.currentInteractableDoor || player.currentInteractableObject || player.currentInteractableNPC || player.currentInteractableStructure){
        if(player.currentInteractableDoor)
            interactDoor();
        else if(player.currentInteractableNPC)
            interactNPC();
        else if(player.currentInteractableObject)
            interactObject();
        else if(player.currentInteractableStructure)
            interactStructure();

    }else{
        interactionPromptElement.style.display = 'none';
        interactionPromptElement.textContent = '';
        unlockable = false;
    }

    if(currentRoom == roomInstances['balcony_room']) {
        currentRoom.getPortal().update(deltaTime);
    }

    for(const torch of currentRoom.torches) {
        torch.update(elapsedTime, deltaTime);
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