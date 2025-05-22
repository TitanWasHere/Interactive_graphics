import * as THREE from 'three';

class SceneLight {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.lights = []; // Array to store multiple lights
        this.helpers = []; // Array to store multiple helpers
        this.targets = []; // Array to store multiple targets
        
        // Default options with fallbacks to the original parameters
        const defaults = {
            type: 'rect', // 'rect', 'point', 'spot', 'directional', 'ambient'
            color: 0xFFEECC,
            intensity: 5,
            width: 10,
            height: 10,
            distance: 20,
            decay: 2,
            angle: Math.PI / 16,
            penumbra: 0.02,
            position: new THREE.Vector3(0, 8, 0),
            target: new THREE.Vector3(0, 0, 0),
            castShadow: true,
            shadowMapSize: 1024
        };
        
        // Merge provided options with defaults
        this.options = {...defaults, ...options};
        
        // Create the initial light based on options
        this.addLight(this.options.type, this.options);
    }
    
    // New method to add a light of specified type with custom options
    addLight(lightType, customOptions = {}) {
        // Merge base options with custom options for this specific light
        const options = {...this.options, ...customOptions, type: lightType};
        
        let light = null;
        let helper = null;
        let target = null;
        
        // Create the appropriate light based on type
        switch(lightType) {
            case 'point':
                [light, helper] = this._createPointLight(options);
                break;
            case 'spot':
                [light, helper, target] = this._createSpotLight(options);
                break;
            case 'directional':
                [light, helper] = this._createDirectionalLight(options);
                break;
            case 'ambient':
                light = this._createAmbientLight(options);
                break;
            case 'rect':
            default:
                light = this._createRectAreaLight(options);
                break;
        }
        
        // Store the created light as the primary light if it's the first one
        if (this.lights.length === 0) {
            this.light = light;
        }
        
        // Add to our arrays
        this.lights.push(light);
        if (helper) this.helpers.push(helper);
        if (target) this.targets.push(target);
        
        return light;
    }
    
    // Renamed methods with leading underscore to indicate they're internal helpers
    _createRectAreaLight(options) {
        const { color, intensity, width, height, position } = options;
        
        const light = new THREE.RectAreaLight(color, intensity, width, height);
        light.position.copy(position);
        light.lookAt(options.target); // Point toward target
        
        this.scene.add(light);
        return light;
    }
    
    _createPointLight(options) {
        const { color, intensity, position, distance, decay, castShadow, shadowMapSize } = options;
        
        // Create the point light
        const light = new THREE.PointLight(color, intensity, distance, decay);
        light.position.copy(position);
        
        // Set up shadows
        if (castShadow) {
            light.castShadow = true;
            light.shadow.mapSize.width = shadowMapSize;
            light.shadow.mapSize.height = shadowMapSize;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = distance || 30;
            light.shadow.bias = -0.002; // Reduces shadow acne
        }
        
        this.scene.add(light);
        
        // Optional: Create a small sphere to visualize the light position
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1, 100, 100),
            new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 })
        );
        sphere.position.copy(position);
        this.scene.add(sphere);
        
        return [light, sphere];
    }

    _createSpotLight(options) {
        const { color, intensity, position, distance, angle, penumbra, decay, castShadow, shadowMapSize, target } = options;
        
        // Create the spotlight
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
        light.position.copy(position);
        
        // Set up target - this is important!
        const targetObj = new THREE.Object3D();
        targetObj.position.copy(target || new THREE.Vector3(0, 0, 0));
        this.scene.add(targetObj);
        light.target = targetObj;
        
        // Set up shadows
        if (castShadow) {
            light.castShadow = true;
            light.shadow.mapSize.width = shadowMapSize;
            light.shadow.mapSize.height = shadowMapSize;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = distance || 30;
            light.shadow.focus = 1;
        }
        
        this.scene.add(light);
        
        // Create a glowing sphere to visualize the light source
        const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        
        // Create a glowing material
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { value: 0.2 },
                "p": { value: 4.0 },
                glowColor: { value: new THREE.Color(color) },
                viewVector: { value: new THREE.Vector3() }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normal);
                    vec3 vNormel = normalize(viewVector);
                    intensity = pow(c - dot(vNormal, vNormel), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        // Create the sphere and glow
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(position);
        this.scene.add(sphere);
        
        // Add a larger glow sphere
        const glowSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            glowMaterial
        );
        glowSphere.position.copy(position);
        this.scene.add(glowSphere);
        
        // Group them together
        const helper = new THREE.Group();
        helper.add(sphere);
        helper.add(glowSphere);
        helper.position.copy(position);
        
        return [light, helper, targetObj]; // Light, helper, target
    }

    _createDirectionalLight(options) {
        const { color, intensity, position, castShadow, shadowMapSize } = options;
        
        // Create the directional light
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.copy(position);
        
        // Set up shadows
        if (castShadow) {
            light.castShadow = true;
            light.shadow.mapSize.width = shadowMapSize;
            light.shadow.mapSize.height = shadowMapSize;
            
            // Optimize shadow camera
            const d = 30;
            light.shadow.camera.left = -d;
            light.shadow.camera.right = d;
            light.shadow.camera.top = d;
            light.shadow.camera.bottom = -d;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 100;
        }
        
        this.scene.add(light);
        
        return [light, null];
    }

    _createAmbientLight(options) {
        const { color, intensity } = options;
        
        // Create ambient light (no shadows)
        const light = new THREE.AmbientLight(color, intensity);
        this.scene.add(light);
        
        return light;
    }

    setColor(color, index = 0) {
        if (index < this.lights.length) {
            this.lights[index].color.set(color);
            if (index < this.helpers.length && this.helpers[index]) {
                this.helpers[index].material.color.set(color);
            }
        }
    }

    setIntensity(intensity, index = 0) {
        if (index < this.lights.length) {
            this.lights[index].intensity = intensity;
        }
    }
    
    setPosition(position, index = 0) {
        if (index < this.lights.length) {
            this.lights[index].position.copy(position);
            if (index < this.helpers.length && this.helpers[index]) {
                this.helpers[index].position.copy(position);
            }
        }
    }

    getLight(index = 0) {
        return index < this.lights.length ? this.lights[index] : null;
    }
    
    getAllLights() {
        return this.lights;
    }

    dispose() {
        // Clean up all lights
        this.lights.forEach(light => {
            this.scene.remove(light);
            // Only call dispose if the light has this method
            if (typeof light.dispose === 'function') {
                light.dispose();
            }
        });
        
        // Clean up all helpers
        this.helpers.forEach(helper => {
            if (helper) {
                this.scene.remove(helper);
                if (helper.geometry) helper.geometry.dispose();
                if (helper.material) helper.material.dispose();
            }
        });
        
        // Clean up all targets
        this.targets.forEach(target => {
            if (target) {
                this.scene.remove(target);
            }
        });
        
        // Reset arrays
        this.lights = [];
        this.helpers = [];
        this.targets = [];
        this.light = null;
    }
}

export { SceneLight };