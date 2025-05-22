import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export class RendererManager {
    constructor(pixelSize = 6) {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        
        // Ensure valid initial dimensions
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, window.innerHeight);
        this.renderer.setSize(width, height);
        
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.body.appendChild(this.renderer.domElement);
        
        // Pixelated effect settings
        this.pixelSize = pixelSize;
        this.composer = null;
        this.pixelPass = null;
    }
    
    setupEffects(scene, camera) {
        // Ensure valid dimensions for the composer
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, window.innerHeight);
        
        // Create composer for post-processing
        this.composer = new EffectComposer(this.renderer);
        this.composer.setSize(width, height);
        
        // Add basic render pass first
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);
        
        // Add pixelated pass with proper parameters
        try {
            this.pixelPass = new RenderPixelatedPass(
                this.pixelSize,
                scene,
                camera
            );
            this.composer.addPass(this.pixelPass);
            console.log("Pixelated pass created successfully");
        } catch (error) {
            console.error("Error creating pixelated pass:", error);
        }
        
        return this.composer;
    }
    
    setPixelSize(size) {
        if (this.pixelPass) {
            this.pixelPass.pixelSize = size;
        }
        this.pixelSize = size;
    }
    
    resize() {
        // Ensure valid dimensions
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, window.innerHeight);
        
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        // Some passes need explicit resizing
        if (this.pixelPass && typeof this.pixelPass.setSize === 'function') {
            this.pixelPass.setSize(width, height);
        }
    }
    
    render() {
        if (this.composer) {
            this.composer.render();
        }
    }
}