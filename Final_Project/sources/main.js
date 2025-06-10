import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'; // Important for RectAreaLight

import { Room } from './js/Room.js';
import { RotatingCube } from './objects/SimpleGem.js';
import { SceneLight } from './lights/SceneLight.js';
import { TorchController } from './controllers/TorchController.js';

let scene, camera, renderer, composer, controls;
let pixelatedPass;
let currentRoom, currentCube, currentLight;
let roomSize = 20;
let wallHeight = 13;

const frustumHeight = 17;
let aspect = window.innerWidth / window.innerHeight;
let frustumWidth = frustumHeight * aspect +3;

let torchController;

const roomConfigurations = [
    {
        name: "Textured Room",
        floorConfig: { 
            type: 'texture', 
            textureUrl: './../textures/floor_mold.jpg', 
            textureRepeat: 1 
        },
        wallConfig: { 
            type: 'texture', 
            textureUrl: './../textures/brick_wall.jpg', 
            textureRepeat: 3 
        },
        lights: [
            {
                type: 'spot',
                name: 'torchLight',
                color: 0xff6600,
                intensity: 55,        // Reduced from 500, which is very high
                distance: 22,
                angle: Math.PI,   // Changed from -Math.PI/2 which is straight down
                penumbra: 0.2,
                decay: 1,
                position: new THREE.Vector3(5, 1, 0),  // Starting position
                target: new THREE.Vector3(0, 0, 0),    // Target position
                castShadow: true,
                shadowMapSize: 1024
            }
        ]
    },
    {
        name: "Classic Grid",
        floorConfig: { type: 'colors', colors: [0x777777, 0x555555] },
        wallConfig: { type: 'colors', colors: [0x555555, 0x444444] },
        lightConfig: {
            type: 'point',
            color: 0xfffc9c,
            intensity: 2,
            distance: 30,
            decay: 1.5,
            position: new THREE.Vector3(0, 10, 0),
            castShadow: true
        }
    },
    {
        name: "Warm Tones",
        floorConfig: { type: 'colors', colors: [0xAA8866, 0x775533] },
        wallConfig: { type: 'colors', colors: [0x775533, 0x553311] },
        lightConfig: {
            type: 'rect',
            color: 0xFFEECC,
            intensity: 5,
            width: 10,
            height: 10,
            position: new THREE.Vector3(3, 8, 3)
        }
    },
];


const params = {
    roomIndex: 0,
    pixelSize: 4,
    normalEdgeStrength: 0.3,
    depthEdgeStrength: 0.4,
    pixelAlignedPanning: true
};

const clock = new THREE.Clock();
init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282C34);

    camera = new THREE.OrthographicCamera(
        -frustumWidth ,
        frustumWidth ,
        frustumHeight,
        -frustumHeight,
        0.1,
        1000
    );

    camera.position.set(roomSize * 0.8, roomSize * 0.7, roomSize * 0.8);
    camera.lookAt(0, roomSize * 0.2, 0); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.target.set(0, roomSize * 0.2, 0); 

    torchController = new TorchController(scene, {
        roomSize: roomSize,
        maxSpeed: 0.2,
        acceleration: 0.02,
    });

    RectAreaLightUniformsLib.init();

    setupSceneObjects(params.roomIndex);

    composer = new EffectComposer(renderer);
    pixelatedPass = new RenderPixelatedPass(
        params.pixelSize, scene, camera, {
            normalEdgeStrength: params.normalEdgeStrength,
            depthEdgeStrength: params.depthEdgeStrength
        }
    );
    pixelatedPass.pixelAlignedPanning = params.pixelAlignedPanning;
    composer.addPass(pixelatedPass);

    setupGUI();

    animate();

    window.addEventListener('resize', onWindowResize);
}

function setupSceneObjects(roomIndex) {
    if (currentRoom) currentRoom.dispose();
    if (currentCube) currentCube.dispose();
    if (currentLight) currentLight.dispose();
    
    // Detach torch controller from previous light
    if (torchController) {
        torchController.detach();
    }

    const config = roomConfigurations[roomIndex];

    // Create Room with the configuration parameters
    currentRoom = new Room(
        scene,
        roomSize,
        wallHeight,
        config.floorConfig,
        config.wallConfig
    );
    
    // Enable shadows for the room
    currentRoom.getGroup().traverse((object) => {
        if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
    
    // Create the cube
    currentCube = new RotatingCube(scene, new THREE.Vector3(0, 2, 0), 2);
    currentCube.getMesh().castShadow = true;
    
    // Create SceneLight manager with first light or default
    currentLight = new SceneLight(scene, { type: 'ambient', color: 0x2d3645, intensity: 0.5 });

    // Process all lights from the config array
    if (config.lights && config.lights.length > 0) {
        for (let i = 0; i < config.lights.length; i++) {
            const lightConfig = config.lights[i];
            currentLight.addLight(lightConfig.type, lightConfig);
            
            // Check if this is our torch light and connect to controller
            if (lightConfig.name === 'torchLight') {
                const lightIndex = currentLight.lights.length - 1;
                const torchLight = currentLight.lights[lightIndex];
                const torchTarget = currentLight.targets[lightIndex];
                const torchHelper = currentLight.helpers[lightIndex] || null;
                
                console.log("Found torch light at index", lightIndex, ":", torchLight);
                console.log("Found torch target:", torchTarget);
                
                // Connect the torch controller
                torchController.attachToLight(torchLight, torchTarget, torchHelper);
                console.log('Torch controller attached to light');
            }
        }
    }
    
    // Always add a subtle ambient light if not already present
    if (!scene.userData.ambientLight) {
        const ambientLight = new THREE.AmbientLight(0x2d3645, 0.5);
        scene.add(ambientLight);
        scene.userData.ambientLight = ambientLight;
    }
}


function setupGUI() {
    const gui = new GUI();

    // Room Selection
    gui.add(params, 'roomIndex', {
        'Textured Room': 0,
        'Classic Grid': 1,
        'Warm Tones': 2
    }).name('Room Style').onChange((value) => {
        params.roomIndex = parseInt(value);
        setupSceneObjects(params.roomIndex);
    });
    
    // Pixelation Controls
    const pixelationFolder = gui.addFolder('Pixelation Controls');
    pixelationFolder.add(params, 'pixelSize', 1, 16, 1).name('Pixel Size').onChange((value) => {
        pixelatedPass.setPixelSize(value);
    });
    
    pixelationFolder.add(params, 'normalEdgeStrength', 0, 1, 0.05).name('Normal Edge Strength').onChange((value) => {
        pixelatedPass.normalEdgeStrength = value;
    });
    
    pixelationFolder.add(params, 'depthEdgeStrength', 0, 1, 0.05).name('Depth Edge Strength').onChange((value) => {
        pixelatedPass.depthEdgeStrength = value;
    });
    
    pixelationFolder.add(params, 'pixelAlignedPanning').name('Pixel Aligned Panning').onChange((value) => {
        pixelatedPass.pixelAlignedPanning = value;
    });
    
    pixelationFolder.open();

    const torchFolder = gui.addFolder('Torch Light Controls');
    
    torchFolder.add({ speed: 0.2 }, 'speed', 0.05, 0.5, 0.01)
        .name('Movement Speed')
        .onChange((value) => {
            if (torchController) {
                torchController.setOptions({ maxSpeed: value });
            }
        });
    
    torchFolder.add({ wobbleAmount: 0.05 }, 'wobbleAmount', 0, 0.2, 0.01)
        .name('Wobble Amount')
        .onChange((value) => {
            if (torchController) {
                torchController.setOptions({ wobbleAmount: value });
            }
        });
    
    // Instructions for users
    torchFolder.add({ '': 'Use W, A, S, D to move the torch' }, '')
        .name('Instructions');
    
    torchFolder.open();
}



function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    controls.update(); 

    if (torchController) {
        torchController.update(deltaTime);
    }

    if (currentCube) {
        currentCube.update(deltaTime);
    }

    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // Update composer size too
}