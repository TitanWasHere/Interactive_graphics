import * as THREE from 'three';

export class LightsManager {
    constructor(scene){
        this.scene = scene;
        this._createLights();
    }

    _createLights() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0x404040, 1); 
        this.scene.add(ambientLight);

        // Directional Light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Point Light
        const pointLight = new THREE.PointLight(0xff0000, 1, 100);
        pointLight.position.set(-5, 5, -5);
        this.scene.add(pointLight);
    }
}