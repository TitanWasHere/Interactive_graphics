import * as THREE from 'three';
// -------- Rooms --------
import { AltairRoom } from './rooms/AltairRoom.js';
import { StartRoom } from './rooms/StartRoom.js';

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
let pixelatedPass;
let currentRoom;
let soundtrack;

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

    setupAudio();

    setupGUI();
    
    // Handle window resizing
    window.addEventListener('resize', onWindowResize);
}

function setupAudio() {
    audio = new AudioManager(camera);
    //console.log("AudioManager initialized with track: " + audio.getTrack());
    
}

function setupRooms(){
    roomInstances['start_room'] = new StartRoom();    roomInstances['altair_room'] = new AltairRoom();
    // Add other instances...
    // roomInstances['another_room'] = new AnotherRoom();
    
    spirit = new Spirit(new THREE.Vector3(0, 1, 0));

    currentRoom = roomInstances['start_room'];
    scene.add(currentRoom);
    scene.add(spirit.mesh);
    scene.add(spirit.mainLight); // Add the light directly to the scene

    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition())
}

function setupGUI() {
    gui = new GUI();

    // Controlli per il cambio stanza
    const roomNames = Object.keys(roomInstances);
    const guiControls = {
        currentRoomName: currentRoom.name // Inizializza con il nome della stanza corrente
    };

    gui.add(guiControls, 'currentRoomName', roomNames)
       .name('Choose Room')
       .onChange(onRoomChange);

    // Aggiorna la GUI delle luci inizialmente per la stanza di partenza
    updateLightsGUI(currentRoom.name);    const spiritFolder = gui.addFolder('Spirit Light');
    
    // Light color control
    const spiritLightColor = { color: spirit.mesh.material.color.getHex() };
    spiritFolder.addColor(spiritLightColor, 'color')
        .name('Light Color')
        .onChange((value) => {
            if (spirit) {
                spirit.setColor(value);
            }
        });
      // Light intensity control
    spiritFolder.add(spirit, 'lightIntensityBase', 0, 100, 0.1)
        .name('Light Intensity')
        .onChange((value) => {
            if (spirit) {
                spirit.setLightIntensity(value);
            }
        });

    // Light distance control
    spiritFolder.add(spirit, 'lightDistance', 0, 100, 0.1)
        .name('Light Distance')
        .onChange((value) => {
            if (spirit) {
                spirit.setLightDistance(value);
            }
        });
        
    spiritFolder.open();
}

function onRoomChange(newRoomName) {
    if (newRoomName === currentRoom.name) {
        console.log(`Already in ${newRoomName}`);
        return;
    }

    // Remove the previous room from the scene
    scene.remove(currentRoom);
    
    // Set the new current room
    currentRoom = roomInstances[newRoomName];
    scene.add(currentRoom); 

    console.log(`Switched to ${currentRoom.name}`);
}


function updateLightsGUI(roomName) {
    // Rimuovi la cartella delle luci precedente se esiste
    if (currentLightsFolder) {
        gui.removeFolder(currentLightsFolder); // Usiamo removeFolder anziché destroy per pulire meglio
    }

    // Crea una nuova cartella per le luci di questa stanza
    currentLightsFolder = gui.addFolder(`Lights: ${roomName}`);

    // Ottieni le luci attive dal LightsManager
    const activeLights = lightsManager.getCurrentActiveLights();

    activeLights.forEach((light, index) => {
        const lightType = light.type.replace('Light', ''); // Es. Ambient, Directional, Point
        const lightFolder = currentLightsFolder.addFolder(`${lightType} ${index + 1}`);

        // Controllo per l'intensità (tutte le luci hanno l'intensità)
        lightFolder.add(light, 'intensity', 0, 5, 0.01) // Min, Max, Step
            .name('Intensity')
            .listen(); // 'listen' fa sì che il valore nel GUI si aggiorni se cambia esternamente

        // Controllo per il colore (tutte le luci hanno il colore, eccetto HemisphereLight che ha sky/ground)
        if (light instanceof THREE.AmbientLight || 
            light instanceof THREE.DirectionalLight ||
            light instanceof THREE.PointLight ||
            light instanceof THREE.SpotLight) {
            
            // Per il colore, dat.GUI preferisce un oggetto con una proprietà colore in formato hex string
            const colorObject = {
                color: '#' + light.color.getHexString()
            };
            lightFolder.addColor(colorObject, 'color')
                .name('Color')
                .onChange((value) => {
                    light.color.set(value);
                });
        }
        
        // Controlli specifici per HemisphereLight
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
        
        /*if (light.position) {
            lightFolder.add(light.position, 'x', -50, 50, 0.1)
            .name('Position X')
            .onChange(() => {
                if (light.target) light.lookAt(light.target.position);
            });
            
            lightFolder.add(light.position, 'y', -50, 50, 0.1)
            .name('Position Y')
            .onChange(() => {
                if (light.target) light.lookAt(light.target.position);
            });
            
            lightFolder.add(light.position, 'z', -50, 50, 0.1)
            .name('Position Z')
            .onChange(() => {
                if (light.target) light.lookAt(light.target.position);
            });
        }*/

        


        lightFolder.open(); // Apri le sottocartelle delle luci per default
    });
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    spirit.update(deltaTime, elapsedTime);

    controls.update();
    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}