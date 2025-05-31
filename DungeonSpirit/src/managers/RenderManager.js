import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export class RenderManager {
    constructor(scene, camera, pixels = 3) {
        this.scene = scene;
        this.camera = camera;
        this._setRenderer();
        
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        this.pixelatedPass = new RenderPixelatedPass(pixels, this.scene, this.camera);
        this.composer.addPass(this.pixelatedPass);
    }

    _setRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    render() {
        this.composer.render();
    }

    getRenderer() {
        return this.renderer;
    }

    getComposer() {
        return this.composer;
    }

    setPixelationLevel(pixels) {
        this.pixelatedPass.setPixelSize(pixels);
    }
}