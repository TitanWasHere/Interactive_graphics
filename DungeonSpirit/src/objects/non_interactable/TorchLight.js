import * as THREE from 'three';

export class TorchLight extends THREE.Group {
    constructor(position = new THREE.Vector3(0, 0, 0), radius = 0.1, height = 1, color = 0xffa500) {
        super();
        this.position.copy(position);

        this.light = null;
        this.flame = null;
        this.handle = null;
        
        this.handleHeight = height;
        this.handleRadius = radius;
        this.flameHeight = 0.4;
        this.lightColor = color;

        this.setupHandle();
        this.setupFlame();
        this.setupLight();
        this.setupParticles();
    }

    setupHandle() {
        const geometry = new THREE.CylinderGeometry(this.handleRadius, this.handleRadius, this.handleHeight, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8B4513, 
            roughness: 0.8,
            metalness: 0.0,
        });

        this.handle = new THREE.Mesh(geometry, material);
        this.handle.position.y = this.handleHeight / 2;
        this.handle.castShadow = true;
        this.handle.receiveShadow = true;

        

        this.add(this.handle);
    }

    setupFlame() {
        const flameGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: this.lightColor,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        this.flame = new THREE.Mesh(flameGeometry, flameMaterial);
        this.flame.position.y = this.handleHeight + this.flameHeight / 2;
        this.add(this.flame);
    }
    
    setupLight() {
        this.light = new THREE.PointLight(this.lightColor, 20, 30, 1);
        this.light.castShadow = true;

        this.light.position.y = this.handleHeight + this.flameHeight / 2;
        this.add(this.light);
    }

    setupParticles() {
        this.fireGroup = new THREE.Group();
        this.add(this.fireGroup);
        
        this.fireConfig = {
            spawnRate: 0.5,         // Higher spawn rate for continuous fire
            maxFire: 50,            // More particles for denser fire
            radiusSpread: 0.3,      // Smaller spread for torch
            riseSpeed: 2,           // Speed of rising
            maxHeight: 1.5,         // Maximum height before particles die
            cubeSize: 0.08,         // Smaller particles
        };
        
        this.fireParticles = [];
        this.fireGeometry = new THREE.BoxGeometry(
            this.fireConfig.cubeSize,
            this.fireConfig.cubeSize,
            this.fireConfig.cubeSize
        );
        
        this.fireMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true }), // Red
            new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true }), // Orange-red
            new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true }), // Orange
            new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true }), // Yellow-orange
        ];
    }

    updateFireParticles(deltaTime, elapsedTime) {
        // Always try to spawn new fire particles if under max
        if (this.fireParticles.length < this.fireConfig.maxFire && 
            Math.random() < this.fireConfig.spawnRate) {
            this.createFireParticle(elapsedTime);
        }
        
        // Update existing fire particles
        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const particle = this.fireParticles[i];
            const startY = this.handleHeight + this.flameHeight / 2;
            const currentHeight = particle.mesh.position.y - startY;
            
            if (currentHeight >= this.fireConfig.maxHeight) {
                this.disposeFireParticle(particle, i);
                continue;
            }
            
            particle.mesh.position.y += this.fireConfig.riseSpeed * deltaTime;
            
            const driftAmount = 0.3 * deltaTime;
            particle.mesh.position.x += Math.sin(elapsedTime * 3 + particle.birth) * driftAmount;
            particle.mesh.position.z += Math.cos(elapsedTime * 2.5 + particle.birth) * driftAmount;
            
            const heightProgress = currentHeight / this.fireConfig.maxHeight;
            particle.mesh.material.opacity = THREE.MathUtils.lerp(1.0, 0.0, heightProgress);
            particle.mesh.scale.setScalar(THREE.MathUtils.lerp(1.0, 0.2, heightProgress));
        }
    }

    createFireParticle(elapsedTime) {
        const matIndex = Math.floor(Math.random() * this.fireMaterials.length);
        const cube = new THREE.Mesh(this.fireGeometry, this.fireMaterials[matIndex].clone()); 
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.fireConfig.radiusSpread;
        
        // Spawn at flame position with small random variation
        cube.position.set(
            radius * Math.cos(angle),
            this.handleHeight + this.flameHeight / 2 + (Math.random() - 0.5) * 0.1, // Small Y variation
            radius * Math.sin(angle)
        );
        
        // Random initial scale for variety
        const initialScale = 0.7 + Math.random() * 0.6;
        cube.scale.setScalar(initialScale);
        
        this.fireGroup.add(cube);
        this.fireParticles.push({ mesh: cube, birth: elapsedTime });
    }

    disposeFireParticle(particle, index) {
        this.fireGroup.remove(particle.mesh);
        if (particle.mesh.geometry !== this.fireGeometry) {
            particle.mesh.geometry.dispose();
        }
        particle.mesh.material.dispose();
        this.fireParticles.splice(index, 1);
    }

    update(elapsedTime, deltaTime = 0.016) {
    if (!this.light || !this.flame) return;

    const t = elapsedTime;

    const lightFlicker =
        Math.sin(t * 3) * 2 +
        Math.sin(t * 7) * 1;
    this.light.intensity = 20 + lightFlicker;


    const baseSin = Math.sin(t * 5);        // [-1,1]
    const flickerNorm = (baseSin + 1) / 2;  // [0,1]
    const flickerY = flickerNorm * 0.3;     // ora [0,0.3]

    const flickerXz = Math.sin(t * 4) * 0.1 

    const targetScale = new THREE.Vector3(
        1 + flickerXz,
        1 + flickerY * 5,   
        1 + flickerXz
    );

    const smoothFactor = Math.min(deltaTime * 5, 1);
    this.flame.scale.lerp(targetScale, smoothFactor);

    this.updateFireParticles(deltaTime, elapsedTime);
}


    dispose() {
        this.fireParticles.forEach(particle => {
            this.fireGroup.remove(particle.mesh);
            particle.mesh.material.dispose();
        });
        this.fireParticles = [];

        this.fireMaterials.forEach(mat => mat.dispose());
        this.fireGeometry.dispose();
    }
}