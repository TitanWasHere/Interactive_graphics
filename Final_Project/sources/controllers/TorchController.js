import * as THREE from 'three';

class TorchController {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.light = null;
        this.lightTarget = null;
        this.helper = null;
        this.redSphere = null; // Add this line to store the red sphere
        
        // Movement settings with defaults
        this.options = {
            maxSpeed: 0.2,
            acceleration: 0.02,
            damping: 0.9,
            wobbleAmount: 0.05,
            wobbleSpeed: 5,
            roomSize: 20,
            ...options
        };
        
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.keyStates = {
            'w': false,
            'a': false,
            's': false,
            'd': false
        };
        
        this.isActive = false;
        this.setupKeyboardControls();
    }
    
    /**
     * Connect this controller to a specific light
     */
    attachToLight(light, lightTarget, helper = null) {
        this.light = light;
        
        // If lightTarget is undefined, create a new one
        if (!lightTarget && light && light.isSpotLight) {
            this.lightTarget = new THREE.Object3D();
            this.lightTarget.position.set(light.position.x, 0, light.position.z);
            this.scene.add(this.lightTarget);
            light.target = this.lightTarget;
        } else {
            this.lightTarget = lightTarget;
        }
        
        this.helper = helper;
        
        // Create a glowing red sphere that follows the torch
        this.createRedSphere(light ? light.position : new THREE.Vector3(0, 10, 0));
        
        this.isActive = !!light;
        this.velocity.set(0, 0, 0);
        
        console.log("Torch controller attached with red sphere");
        return this;
    }
    
    /**
     * Create a glowing red sphere to follow the torch
     */
    createRedSphere(position) {
        // Remove any existing red sphere
        if (this.redSphere) {
            this.scene.remove(this.redSphere);
            if (this.redSphere.geometry) this.redSphere.geometry.dispose();
            if (this.redSphere.material) this.redSphere.material.dispose();
        }
        
        // Create a red glowing sphere
        const sphereGeometry = new THREE.SphereGeometry(0.6, 24, 24);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3333,  // Red color
            transparent: true,
            opacity: 0.8
        });
        
        this.redSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.redSphere.position.copy(position);
        
        // Add a point light inside the sphere for the glowing effect
        const pointLight = new THREE.PointLight(0xff3333, 2, 5);
        pointLight.position.set(0, 0, 0); // Center of the sphere
        this.redSphere.add(pointLight);
        
        this.scene.add(this.redSphere);
    }
    
    /**
     * Detach from current light
     */
    detach() {
        this.light = null;
        this.lightTarget = null;
        this.helper = null;
        
        // Clean up the red sphere when detaching
        if (this.redSphere) {
            this.scene.remove(this.redSphere);
            if (this.redSphere.geometry) this.redSphere.geometry.dispose();
            if (this.redSphere.material) this.redSphere.material.dispose();
            this.redSphere = null;
        }
        
        this.isActive = false;
        return this;
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupKeyboardControls() {
        // Properly implement keyboard controls
        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (this.keyStates.hasOwnProperty(key)) {
                this.keyStates[key] = true;
                console.log(`Key pressed: ${key}, Keys state:`, this.keyStates);
            }
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (this.keyStates.hasOwnProperty(key)) {
                this.keyStates[key] = false;
            }
        });
    }
    
    /**
     * Update the light position based on keyboard input
     */
    update(deltaTime) {
        if (!this.isActive || !this.light) return;
        
        // Calculate acceleration based on key states
        const moveAccel = new THREE.Vector3(0, 0, 0);
        
        if (this.keyStates.w) moveAccel.z -= this.options.acceleration;
        if (this.keyStates.s) moveAccel.z += this.options.acceleration;
        if (this.keyStates.a) moveAccel.x -= this.options.acceleration;
        if (this.keyStates.d) moveAccel.x += this.options.acceleration;
        
        // Apply acceleration to velocity
        this.velocity.add(moveAccel);
        
        // Apply damping (smooth deceleration)
        this.velocity.multiplyScalar(this.options.damping);
        
        // Limit maximum speed
        if (this.velocity.length() > this.options.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.options.maxSpeed);
        }
        
        // Update light position
        this.light.position.add(this.velocity);
        
        // Keep the light within the room bounds
        const boundaryOffset = 1.5; // Offset from walls
        const roomHalfSize = this.options.roomSize / 2 - boundaryOffset;
        
        this.light.position.x = Math.max(-roomHalfSize, Math.min(roomHalfSize, this.light.position.x));
        this.light.position.z = Math.max(-roomHalfSize, Math.min(roomHalfSize, this.light.position.z));
        
        // Update target to be always point downward
        if (this.lightTarget) {
            this.lightTarget.position.x = this.light.position.x;
            this.lightTarget.position.z = this.light.position.z;
            this.lightTarget.position.y = 0; // Point to the floor
        }
        
        // Add a slight wobble effect for torch-like feel
        const time = Date.now() * 0.002;
        const wobbleAmount = this.options.wobbleAmount;
        this.light.position.y += Math.sin(time * this.options.wobbleSpeed) * wobbleAmount;
        
        // Update helper position if present
        if (this.helper) {
            this.helper.position.copy(this.light.position);
        }
        
        // Update the red sphere position to follow the torch
        if (this.redSphere) {
            // Position it slightly offset from the light source
            this.redSphere.position.copy(this.light.position);
            
            // Add a subtle bobbing motion to the red sphere
            this.redSphere.position.y += Math.sin(time * 7) * 0.1;
            
            // Add a subtle pulsing effect to the red sphere
            const pulseScale = 1 + 0.1 * Math.sin(time * 4);
            this.redSphere.scale.set(pulseScale, pulseScale, pulseScale);
        }
    }
    
    /**
     * Change controller settings
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
        return this;
    }
    
    /**
     * Clean up event listeners
     */
    dispose() {
        // Detach will handle cleanup of the red sphere
        this.detach();
    }
}

export { TorchController };