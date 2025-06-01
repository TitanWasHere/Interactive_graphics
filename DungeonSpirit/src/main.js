import * as THREE from 'three';
import { StartRoom } from './rooms/StartRoom.js';
import { CameraManager } from './managers/CameraManager.js';
import { SceneManager } from './managers/SceneManager.js';
import { RenderManager } from './managers/RenderManager.js';
import { ControlsManager } from './managers/ControlsManager.js';
import { LightsManager } from './managers/LightsManager.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

let scene, camera, renderer, composer, controls;
let currentLightsFolder, gui;
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
setupGUI();
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
    updateLightsGUI(currentRoom.name);
}

function onRoomChange(newRoomName) {
    if (newRoomName === currentRoom.name) {
        console.log(`Already in ${newRoomName}`);
        return;
    }

    // Rimuovi la stanza precedente dalla scena
    scene.remove(currentRoom);
    
    // Imposta la nuova stanza corrente
    currentRoom = roomInstances[newRoomName];
    scene.add(currentRoom); // Aggiungi la nuova stanza alla scena

    // Imposta le luci per la nuova stanza
    lightsManager.setRoomLights(currentRoom.name, currentRoom.getLightsDefinition());

    // Aggiorna la GUI con i controlli per le luci della nuova stanza
    updateLightsGUI(currentRoom.name);

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
    controls.update();
    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}