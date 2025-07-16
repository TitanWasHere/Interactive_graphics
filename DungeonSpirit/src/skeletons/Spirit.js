import * as THREE from 'three';

export class Spirit {
    constructor(initPose = new THREE.Vector3(0, 10, 0), sphereColor = 0xff2222, fireMaterial1 = 0xff3300, fireMaterial2 = 0xff8800, fireMaterial3 = 0xffff00) {
        this.interactionDistance = 2.5;
        this.currentInteractableDoor = null; 
        this.currentInteractableObject = null;
        this.nearestDoor = null;

        this.initializeSpirit(initPose, sphereColor);
        this.setupLights(); 
        this.setupParticles(fireMaterial1, fireMaterial2, fireMaterial3);
    }    
    
    initializeSpirit(initPose, sphereColor = 0xff2222) {
        const sphereGeometry = new THREE.SphereGeometry(0.7, 8, 8);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: sphereColor,
            emissive: new THREE.Color(sphereColor).multiplyScalar(0.8),
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 0.6,
        });
        
        this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.mesh.position.copy(initPose);
        this.mesh.castShadow = true; // The spirit mesh itself can cast shadows if needed
        
        this.baseYPosition = initPose.y;
        
        this.floatAmplitude = 0.2;
        this.floatSpeed = 1.2;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.pulseAmplitude = 0.15;
        this.pulseSpeed = 1.0;
        
        this.movementSpeed = 8.0;
        this.velocity = new THREE.Vector3();
        
        this.acceleration = 15.0; 
        this.deceleration = 12.0;
        this.currentVelocity = new THREE.Vector3(); 
        this.targetVelocity = new THREE.Vector3(); 
    }

    update(deltaTime, elapsedTime) {
        if (this.mesh && this.mesh.material) {
            const emissiveFactor = 0.5 + 0.3 * Math.sin(elapsedTime * 2);
            this.mesh.material.emissiveIntensity = emissiveFactor;
        }

        this.updateLights(deltaTime, elapsedTime);
        this.updateWobble(0.5, elapsedTime);
        this.updateBubbles(deltaTime, elapsedTime);
        this.updateFireParticles(deltaTime, elapsedTime);
    }

    updateWobble(deltaTime, elapsedTime) {
        const floatY = Math.sin((elapsedTime + this.floatOffset) * Math.PI * this.floatSpeed) * this.floatAmplitude * deltaTime;
        this.mesh.position.y = this.baseYPosition + floatY; 

        const pulse = 1 + Math.sin((elapsedTime + this.floatOffset) * Math.PI * this.pulseSpeed) * this.pulseAmplitude * deltaTime;
        this.mesh.scale.set(pulse, pulse, pulse);
    }

    setupLights() {
        this.lightDistance = 25;
        
        this.mainLight = new THREE.PointLight(
            this.mesh.material.color,
            6.0,                     
            this.lightDistance,
            1                        
        );
        
        this.mainLight.position.copy(this.mesh.position);
        this.mainLight.castShadow = true;
        


        this.mainLight.shadow.camera.near = -0.1;
        this.mainLight.shadow.camera.far = this.lightDistance;

        this.ambientContribution = new THREE.AmbientLight(
            this.mesh.material.color,
            0.3 
        );

        this.lightIntensityBase = 40.0;
        this.lightIntensityVariation = 1.5;
        this.lightAnimSpeed = 0.6;
    }    
    
    updateLights(deltaTime, elapsedTime) {
        if (!this.mainLight) return;

        this.mainLight.position.copy(this.mesh.position);

        const intensityPulse = Math.sin(elapsedTime * this.lightAnimSpeed * Math.PI) * this.lightIntensityVariation;
        this.mainLight.intensity = this.lightIntensityBase + intensityPulse;

        this.mainLight.color.copy(this.mesh.material.color);
        
        if (this.ambientContribution) {
            this.ambientContribution.color.copy(this.mesh.material.color);
            this.ambientContribution.intensity = 0.2 + Math.sin(elapsedTime * 0.5) * 0.1;
        }
    }

    // Enhanced setLightDistance method for room coverage
    setLightDistance(distance) {
        this.lightDistance = Math.max(distance, 20); 
        if (this.mainLight) {
            this.mainLight.distance = this.lightDistance;
            this.mainLight.shadow.camera.far = this.lightDistance;
            this.mainLight.shadow.camera.updateProjectionMatrix();
        }
    }

    setLightIntensity(intensity) {
        this.lightIntensityBase = Math.max(intensity, 2.0); 
        this.lightIntensityVariation = this.lightIntensityBase * 0.3;
    }



    setupParticles(fireMaterial1 = 0xff3300, fireMaterial2 = 0xff8800, fireMaterial3 = 0xffff00) {
        this.bubbleGroup = new THREE.Group();
        this.mesh.add(this.bubbleGroup);
        
        this.bubbleConfig = {
            spawnRate: 0.05,
            maxBubbles: 50,
            radiusSpread: 0.8,
            riseSpeed: 1.0,
            lifespan: 2.0,
        };
        
        this.bubbles = [];
        this.bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        this.bubbleMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            roughness: 0.2,
            metalness: 0,
            depthWrite: false,
        });

        // Fire particles
        this.fireGroup = new THREE.Group();
        this.mesh.add(this.fireGroup);
        
        this.fireConfig = {
            spawnRate: 1,
            maxFire: 70,
            radiusSpread: 0.8,
            riseSpeed: 3.0,
            lifespan: 0.4,
            cubeSize: 0.15,
        };
        
        this.fireParticles = [];
        this.fireGeometry = new THREE.BoxGeometry(
            this.fireConfig.cubeSize,
            this.fireConfig.cubeSize,
            this.fireConfig.cubeSize
        );
        
        this.fireMaterials = [
            new THREE.MeshBasicMaterial({ color: fireMaterial1, transparent: true }), 
            new THREE.MeshBasicMaterial({ color: fireMaterial2, transparent: true }),
            new THREE.MeshBasicMaterial({ color: fireMaterial3, transparent: true }),
        ];
    }

    

    updateBubbles(deltaTime, elapsedTime) {
        if (this.bubbles.length < this.bubbleConfig.maxBubbles && 
                Math.random() < this.bubbleConfig.spawnRate) {
            this.createBubble(elapsedTime);
        }

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const age = elapsedTime - bubble.birth;
            
            if (age >= this.bubbleConfig.lifespan) {
                this.disposeBubble(bubble, i);
                continue;
            }
            
            bubble.mesh.position.y += this.bubbleConfig.riseSpeed * deltaTime;
            const t = age / this.bubbleConfig.lifespan;
            bubble.mesh.material.opacity = THREE.MathUtils.lerp(0.6, 0.0, t);
            bubble.mesh.scale.setScalar(THREE.MathUtils.lerp(1, 1.6, t));
        }
    }

    createBubble(elapsedTime) {
        const bubble = new THREE.Mesh(this.bubbleGeometry, this.bubbleMaterial.clone());
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.bubbleConfig.radiusSpread;
        
        bubble.position.set(
            radius * Math.cos(angle),
            -0.7 + Math.random() * 0.1, 
            radius * Math.sin(angle)
        );
        
        bubble.material.opacity = 0.6 + Math.random() * 0.2;
        this.bubbleGroup.add(bubble);
        this.bubbles.push({ mesh: bubble, birth: elapsedTime });
    }

    disposeBubble(bubble, index) {
        this.bubbleGroup.remove(bubble.mesh);
        bubble.mesh.geometry.dispose();
        bubble.mesh.material.dispose();
        this.bubbles.splice(index, 1);
    }

    updateFireParticles(deltaTime, elapsedTime) {
        if (this.fireParticles.length < this.fireConfig.maxFire && 
                Math.random() < this.fireConfig.spawnRate) {
            this.createFireParticle(elapsedTime);
        }

        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const particle = this.fireParticles[i];
            const age = elapsedTime - particle.birth;
            
            if (age >= this.fireConfig.lifespan) {
                this.disposeFireParticle(particle, i);
                continue;
            }
            
            particle.mesh.position.y += this.fireConfig.riseSpeed * deltaTime;
            const t = age / this.fireConfig.lifespan;
            particle.mesh.material.opacity = THREE.MathUtils.lerp(1.0, 0.0, t);
            particle.mesh.scale.setScalar(THREE.MathUtils.lerp(1.0, 0.2, t));
        }
    }

    createFireParticle(elapsedTime) {
        const matIndex = Math.floor(Math.random() * this.fireMaterials.length);
        const cube = new THREE.Mesh(this.fireGeometry, this.fireMaterials[matIndex].clone()); 
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.fireConfig.radiusSpread;
        
        cube.position.set(
            radius * Math.cos(angle),
            0.63, 
            radius * Math.sin(angle)
        );
        
        this.fireGroup.add(cube);
        this.fireParticles.push({ mesh: cube, birth: elapsedTime });
    }

    disposeFireParticle(particle, index) {
        this.fireGroup.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        this.fireParticles.splice(index, 1);
    }

    setLightIntensity(intensity) {
        this.lightIntensityBase = intensity;
    }

    

    setColor(color) {
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.set(color);
            this.mesh.material.emissive.set(new THREE.Color(color).multiplyScalar(0.5));
        }
    }    setLightDistance(distance){
        this.lightDistance = distance;
        if (this.mainLight) {
            this.mainLight.distance = distance;
            this.mainLight.shadow.camera.far = distance + 5; 
            this.mainLight.shadow.camera.updateProjectionMatrix();
        }
    }

}