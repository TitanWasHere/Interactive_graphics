// CameraManager.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraManager {
    /**
     * @param {HTMLElement} domElement - The DOM element for OrbitControls interaction (usually the renderer's canvas).
     * @param {number} fov - Camera field of view.
     * @param {number} aspect - Camera aspect ratio.
     * @param {number} near - Camera near clipping plane.
     * @param {number} far - Camera far clipping plane.
     */
    constructor(domElement, fov = 75, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000) {
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.controls = new OrbitControls(this.camera, domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below floor

        // Listen for window resize events to update camera aspect
        window.addEventListener('resize', this._onWindowResize.bind(this));
    }

    /**
     * Gets the camera instance.
     * @returns {THREE.Camera}
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Updates the OrbitControls. Call this in your animation loop.
     */
    updateControls() {
        this.controls.update();
    }

    /**
     * Handles window resizing, updating only the camera's aspect ratio.
     * @private
     */
    _onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight; // Assume full window size for aspect
        this.camera.updateProjectionMatrix();
    }

    /**
     * Focuses the camera on a specific room.
     * @param {import('./Room').Room} room - The room instance to focus on.
     */
    focusOnRoom(room) {
        // Position camera relative to the room
        this.camera.position.set(
            room.position.x,
            room.position.y + room.wallHeight * 1.5, // 1.5 times wall height above room base
            room.position.z + room.floorDepth * 2 // 2 times room depth away
        );
        // Point camera towards the center of the room
        this.controls.target.set(
            room.position.x + room.floorWidth / 2, // Center X of the room
            room.position.y + room.wallHeight / 2,  // Middle Y of the room
            room.position.z + room.floorDepth / 2   // Center Z of the room
        );
        this.controls.update(); // Apply the new target
    }

    /**
     * Disposes of the OrbitControls to clean up event listeners.
     */
    dispose() {
        this.controls.dispose();
        window.removeEventListener('resize', this._onWindowResize.bind(this));
    }
}