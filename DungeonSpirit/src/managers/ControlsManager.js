import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class ControlsManager {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
    }

    update() {
        this.controls.update();
    }

    getControls() {
        return this.controls;
    }
}