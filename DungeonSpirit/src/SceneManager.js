// js/SceneManager.js
import * as THREE from 'three';

export class SceneManager {
    /**
     * @param {HTMLElement} container - The DOM element where the renderer canvas will be appended.
     */
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera = null; // Will be initialized via init()
        this.cameraManager = null; // Reference to CameraManager for controls update
        this.animationFrameId = null;

        this._addLights();
        window.addEventListener('resize', this._onWindowResize.bind(this));
    }

    /**
     * Initializes the SceneManager with a camera and a CameraManager.
     * @param {THREE.Camera} camera - The camera instance to use for rendering.
     * @param {import('./CameraManager').CameraManager} cameraManager - The CameraManager instance.
     */
    init(camera, cameraManager) {
        this.camera = camera;
        this.cameraManager = cameraManager;
        this.container.appendChild(this.renderer.domElement);
    }

    _addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    /**
     * Adds a Three.js object to the scene.
     * @param {THREE.Object3D} object - The object to add.
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * Removes a Three.js object from the scene.
     * @param {THREE.Object3D} object - The object to remove.
     */
    remove(object) {
        this.scene.remove(object);
    }

    /**
     * Handles window resizing, updating the renderer size and camera aspect.
     * @private
     */
    _onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.renderer.setSize(width, height);
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    /**
     * The main animation loop.
     * @private
     */
    _animate() {
        this.animationFrameId = requestAnimationFrame(this._animate.bind(this));
        if (this.cameraManager) {
            this.cameraManager.updateControls(); // Update orbit controls
        }
        if (this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Starts the animation loop.
     */
    start() {
        this._animate();
    }

    /**
     * Stops the animation loop.
     */
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Disposes of the renderer and removes the canvas from the DOM.
     * Also attempts to dispose of scene children's resources.
     */
    dispose() {
        this.stop();
        window.removeEventListener('resize', this._onWindowResize.bind(this));
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
        
        // Dispose of scene children's resources (like Rooms)
        // Iterate over a copy of the array because `child.dispose()` might remove the child from the scene.
        [...this.scene.children].forEach(child => {
            if (child.dispose && typeof child.dispose === 'function') {
                child.dispose(); // Custom dispose for rooms/other complex objects
            } else {
                // Generic disposal for simple meshes not part of a custom class
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
            this.scene.remove(child); // Ensure child is removed from scene
        });
        this.scene.clear(); // Clears all children from the scene (redundant after loop but ensures empty)
    }

    /**
     * Returns the DOM element of the renderer's canvas.
     * @returns {HTMLCanvasElement}
     */
    getRendererDomElement() {
        return this.renderer.domElement;
    }
}