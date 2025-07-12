import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class ControlsManager {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true; 
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI / 2; 
    }

    update() {
        this.controls.update();
    }

    getControls() {
        return this.controls;
    }
}