// CameraManager.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraManager {
    
    constructor() {
        const roomSize = 20;

        let aspect = window.innerWidth / window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(
            65, 
            aspect, 
            0.1, 
            1000 
        );

        this.camera.position.set(roomSize * 0.9, roomSize * 1, roomSize * 0.9);
        this.camera.lookAt(0, 0, 0); 
    }

    setCameraPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    setCameraLookAt(x, y, z) {
        this.camera.lookAt(new THREE.Vector3(x, y, z));
    }
    getCamera() {
        return this.camera;
    }
    
}
