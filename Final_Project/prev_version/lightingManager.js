import * as THREE from 'three';
import { ROOM_CONSTANTS } from './roomUtils.js';

export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        
        this.setupLights();
    }
    
    setupLights() {
        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0x404040, 5);
        this.scene.add(this.lights.ambient);
        
        // Torch light
        const lightX = -ROOM_CONSTANTS.floorWidth / 2 + ROOM_CONSTANTS.wallThickness + 0.5;
        const lightY = ROOM_CONSTANTS.wallHeight / 2 + ROOM_CONSTANTS.floorHeight / 2 - 2;
        const lightZ = 0;
        
        this.lights.torch = new THREE.PointLight(0xFFFF00, 150, 15);
        this.lights.torch.position.set(lightX, lightY, lightZ);
        this.lights.torch.castShadow = true;
        this.lights.torch.shadow.mapSize.width = 1024;
        this.lights.torch.shadow.mapSize.height = 1024;
        this.lights.torch.shadow.camera.near = 0.1;
        this.lights.torch.shadow.camera.far = 20;
        this.lights.torch.shadow.bias = -0.005;
        this.lights.torch.visible = false;
        
        this.scene.add(this.lights.torch);
    }
    
    setTorchVisibility(visible) {
        if (this.lights.torch) {
            this.lights.torch.visible = visible;
        }
    }
    
    setAmbientIntensity(intensity) {
        if (this.lights.ambient) {
            this.lights.ambient.intensity = intensity;
        }
    }
}