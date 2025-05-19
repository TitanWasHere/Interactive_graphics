import * as THREE from 'three';

export const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 0 });

export const blackFloorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
    roughness: 0.8, 
    metalness: 0 
});

export const blackWallMaterial = new THREE.MeshStandardMaterial({ // Changed to StandardMaterial
    color: 0x000000,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
    roughness: 0.8,
    metalness: 0
});

// Material for the gray sides and bottom of the brick floor (Standard)
export const grayFloorSidesMaterial = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(0x808080), // Choose your desired gray color
    side: THREE.FrontSide,
    transparent: false,
    opacity: 1,
    roughness: 0.8,
    metalness: 0
});


const textureLoader = new THREE.TextureLoader();


export let brickWallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa, // Placeholder color
    side: THREE.DoubleSide,
    roughness: 0.8, // Add roughness
    metalness: 0 // Add metalness
});

export let brickFloorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa, // Placeholder color
    side: THREE.FrontSide,
    roughness: 0.8,
    metalness: 0
});

let isBrickWallTextureLoaded = false;
let isBrickFloorTextureLoaded = false;

const brickTextureLoadedCallbacks = [];
const brickFloorTextureLoadedCallbacks = [];

// Load Brick Wall Texture
textureLoader.load(
    './textures/brick_wall.jpg',
    function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 3);

        brickWallMaterial = new THREE.MeshStandardMaterial({ 
            map: texture, // The texture map
            color: new THREE.Color(0x4c4c4c), 
            side: THREE.DoubleSide,
            roughness: 0.9, 
            metalness: 0 
        });

        console.log('Brick wall texture loaded!');
        isBrickWallTextureLoaded = true;

        brickTextureLoadedCallbacks.forEach(callback => callback(brickWallMaterial));
        brickTextureLoadedCallbacks.length = 0;
    },
    undefined,
    function (err) {
        console.error('An error occurred loading the brick wall texture:', err);
        isBrickWallTextureLoaded = true;
        brickTextureLoadedCallbacks.forEach(callback => callback(brickWallMaterial));
        brickTextureLoadedCallbacks.length = 0;
    }
);

// Load Brick Floor Texture
textureLoader.load(
    './textures/brick_floor.jpg',
    function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 2);

       
        brickFloorMaterial = new THREE.MeshStandardMaterial({ 
            map: texture, // The texture map
            color: new THREE.Color(0x4c4c4c), // Apply a darker tint
            side: THREE.FrontSide,
            roughness: 0.7, // Slightly less rough than walls? Adjust as needed
            metalness: 0
        });

        console.log('Brick floor texture loaded!');
        isBrickFloorTextureLoaded = true;

        brickFloorTextureLoadedCallbacks.forEach(callback => callback(brickFloorMaterial));
        brickFloorTextureLoadedCallbacks.length = 0;
    },
    undefined,
    function (err) {
        console.error('An error occurred loading the brick floor texture:', err);
        isBrickFloorTextureLoaded = true;
        brickFloorTextureLoadedCallbacks.forEach(callback => callback(brickFloorMaterial));
        brickFloorTextureLoadedCallbacks.length = 0;
    }
);

export function onBrickFloorTextureLoaded(callback) {
    if (isBrickFloorTextureLoaded) {
        callback(brickFloorMaterial);
    } else {
        brickFloorTextureLoadedCallbacks.push(callback);
    }
}

export function onBrickWallTextureLoaded(callback) {
    if (isBrickWallTextureLoaded) {
        callback(brickWallMaterial);
    } else {
        brickTextureLoadedCallbacks.push(callback);
    }
}