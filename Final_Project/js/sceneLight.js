import * as THREE from 'three';

class SceneLight {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.light = null;
        this.helper = null;
        this.target = null;
        
        // Default options with fallbacks to the original parameters
        const defaults = {
            type: 'rect', // 'rect', 'point', 'spot', 'directional', 'ambient'
            color: 0xFFEECC,
            intensity: 5,
            // RectAreaLight specific
            width: 10,
            height: 10,
            // Point light specific
            distance: 20,
            decay: 2,
            // Spotlight specific
            angle: Math.PI / 16,
            penumbra: 0.02,
            // Position
            position: new THREE.Vector3(0, 8, 0),
            target: new THREE.Vector3(0, 0, 0),
            // Shadows
            castShadow: true,
            shadowMapSize: 1024
        };
        
        // Merge provided options with defaults
        this.options = {...defaults, ...options};
        
        // Create the appropriate light based on type
        switch(this.options.type) {
            case 'point':
                this.createPointLight();
                break;
            case 'spot':
                this.createSpotLight();
                break;
            case 'directional':
                this.createDirectionalLight();
                break;
            case 'ambient':
                this.createAmbientLight();
                break;
            case 'rect':
            default:
                this.createRectAreaLight();
                break;
        }
    }
    
    createRectAreaLight() {
        const { color, intensity, width, height, position } = this.options;
        
        this.light = new THREE.RectAreaLight(color, intensity, width, height);
        this.light.position.copy(position);
        this.light.lookAt(this.options.target); // Point toward target
        
        this.scene.add(this.light);
    }
    
    createPointLight() {
        const { color, intensity, position, distance, decay, castShadow, shadowMapSize } = this.options;
        
        // Create the point light
        this.light = new THREE.PointLight(color, intensity, distance, decay);
        this.light.position.copy(position);
        
        // Set up shadows
        if (castShadow) {
            this.light.castShadow = true;
            this.light.shadow.mapSize.width = shadowMapSize;
            this.light.shadow.mapSize.height = shadowMapSize;
            this.light.shadow.camera.near = 0.1;
            this.light.shadow.camera.far = distance || 30;
            this.light.shadow.bias = -0.002; // Reduces shadow acne
        }
        
        this.scene.add(this.light);
        
        // Optional: Create a small sphere to visualize the light position
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1, 100, 100),
            new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 })
        );
        sphere.position.copy(position);
        this.helper = sphere;
        this.scene.add(this.helper);
    }

    createSpotLight() {
        const { color, intensity, position, distance, angle, penumbra, decay, castShadow, shadowMapSize, target } = this.options;
        
        // Create the spotlight
        this.light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
        this.light.position.copy(position);
        
        // Set up target
        this.target = new THREE.Object3D();
        this.target.position.copy(target);
        this.scene.add(this.target);
        this.light.target = this.target;
        
        // Set up shadows
        if (castShadow) {
            this.light.castShadow = true;
            this.light.shadow.mapSize.width = shadowMapSize;
            this.light.shadow.mapSize.height = shadowMapSize;
            this.light.shadow.camera.near = 0.1;
            this.light.shadow.camera.far = distance || 30;
            this.light.shadow.focus = 1;
        }
        
        this.scene.add(this.light);
    }

    createDirectionalLight() {
        const { color, intensity, position, castShadow, shadowMapSize } = this.options;
        
        // Create the directional light
        this.light = new THREE.DirectionalLight(color, intensity);
        this.light.position.copy(position);
        
        // Set up shadows
        if (castShadow) {
            this.light.castShadow = true;
            this.light.shadow.mapSize.width = shadowMapSize;
            this.light.shadow.mapSize.height = shadowMapSize;
            
            // Optimize shadow camera
            const d = 30;
            this.light.shadow.camera.left = -d;
            this.light.shadow.camera.right = d;
            this.light.shadow.camera.top = d;
            this.light.shadow.camera.bottom = -d;
            this.light.shadow.camera.near = 0.1;
            this.light.shadow.camera.far = 100;
        }
        
        this.scene.add(this.light);
    }

    createAmbientLight() {
        const { color, intensity } = this.options;
        
        // Create ambient light (no shadows)
        this.light = new THREE.AmbientLight(color, intensity);
        this.scene.add(this.light);
    }

    setColor(color) {
        if (this.light) {
            this.light.color.set(color);
            if (this.helper) this.helper.material.color.set(color);
        }
    }

    setIntensity(intensity) {
        if (this.light) {
            this.light.intensity = intensity;
        }
    }
    
    setPosition(position) {
        if (this.light) {
            this.light.position.copy(position);
            if (this.helper) this.helper.position.copy(position);
        }
    }

    getLight() {
        return this.light;
    }

    dispose() {
        if (this.light) {
            this.scene.remove(this.light);
            // Only call dispose if the light has this method
            if (typeof this.light.dispose === 'function') {
                this.light.dispose();
            }
        }
        
        if (this.helper) {
            this.scene.remove(this.helper);
            this.helper.geometry.dispose();
            this.helper.material.dispose();
        }
        
        if (this.target && this.target !== this.light.target) {
            this.scene.remove(this.target);
        }
    }
}

export { SceneLight };