import * as THREE from 'three';
import { Inventory } from './Inventory.js';

export class Spirit {
    constructor(initPose = new THREE.Vector3(0, 10, 0)) {
        this.inventory = new Inventory();
        this.interactionDistance = 2.5;
        this.currentInteractableDoor = null; 
        this.currentInteractableObject = null;
        this.nearestDoor = null;

        this.initializeSpirit(initPose);
        this.setupLights(); 
        this.setupParticles();
        this.setupInput();
        
    }    
    
    initializeSpirit(initPose) {
        const sphereGeometry = new THREE.SphereGeometry(0.7, 8, 8);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0xff2222, // Main color of the spirit
            emissive: 0xaa0000, // Emissive color, makes it glow
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
        
        this.mainLight.shadow.mapSize.width = 1024;
        this.mainLight.shadow.mapSize.height = 1024;
        this.mainLight.shadow.bias = -0.001;
        this.mainLight.shadow.camera.near = 0.1;
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



    setupParticles() {
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
            new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true }), 
            new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true }),
            new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true }),
        ];
    }

    setupInput() {
        this.keys = { forward: false, backward: false, left: false, right: false };
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 's':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'a':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'd':
            case 'ArrowRight':
                this.keys.right = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 's':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'a':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'd':
            case 'ArrowRight':
                this.keys.right = false;
                break;
        }
    }

    checkNearbyObjects(room) {
        this.currentInteractableObject = null; 
        if (!room || !room.getInteractableObjects) return;
        const interactableObjects = room.getInteractableObjects();

        let closestObject = null;
        let minDistanceSq = this.interactionDistance * this.interactionDistance;

        for (const objectData of interactableObjects) {
            
            // Check distance to the object's visual center point
            const distanceSq = this.mesh.position.distanceToSquared(objectData.getMesh().position);
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestObject = objectData; 
                //console.log(`Closest object: ${objectData} at distance ${Math.sqrt(distanceSq)}`);
            }
        }
        
        this.currentInteractableObject = closestObject;
        //console.log("Current interactable object:", this.currentInteractableObject);
        
    }

    checkNearbyDoors(room) {
        this.currentInteractableDoor = null; 
        if (!room || !room.getInteractableDoors) return;

        const interactableDoors = room.getInteractableDoors();
        let closestDoor = null;
        let minDistanceSq = this.interactionDistance * this.interactionDistance;

        for (const doorData of interactableDoors) {
            // Check distance to the door's visual center point
            const distanceSq = this.mesh.position.distanceToSquared(doorData.mesh.position);
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestDoor = doorData; 
            }
        }
        if (closestDoor) {
            this.currentInteractableDoor = closestDoor.definition;
        }
    }


    update(deltaTime, elapsedTime, currentRoom) {

        this.roomWidth = currentRoom.floorWidth;
        this.roomDepth = currentRoom.floorDepth || this.roomWidth; 

        if (this.mesh && this.mesh.material) {
            const emissiveFactor = 0.5 + 0.3 * Math.sin(elapsedTime * 2);
            this.mesh.material.emissiveIntensity = emissiveFactor;
        }

        this.updateLights(deltaTime, elapsedTime);
        
        this.updateMovement(deltaTime, elapsedTime);
        this.updateBubbles(deltaTime, elapsedTime);
        this.updateFireParticles(deltaTime, elapsedTime);
        this.checkNearbyDoors(currentRoom);
        this.checkNearbyObjects(currentRoom);
    }    
      
    updateMovement(deltaTime, elapsedTime) {
        const floatY = Math.sin((elapsedTime + this.floatOffset) * Math.PI * this.floatSpeed) * this.floatAmplitude;
        this.mesh.position.y = this.baseYPosition + floatY; 

        const pulse = 1 + Math.sin((elapsedTime + this.floatOffset) * Math.PI * this.pulseSpeed) * this.pulseAmplitude;
        this.mesh.scale.set(pulse, pulse, pulse);

        this.targetVelocity.set(0, 0, 0);

        if (this.keys.forward) this.targetVelocity.z -= 1;
        if (this.keys.backward) this.targetVelocity.z += 1;
        if (this.keys.left) this.targetVelocity.x -= 1;
        if (this.keys.right) this.targetVelocity.x += 1;

        if (this.targetVelocity.lengthSq() > 0) {
            this.targetVelocity.normalize().multiplyScalar(this.movementSpeed);
        }

        const isMoving = this.targetVelocity.lengthSq() > 0;
        const lerpSpeed = isMoving ? this.acceleration : this.deceleration;
        
        this.currentVelocity.lerp(this.targetVelocity, lerpSpeed * deltaTime);

        // Apply movement if there's actual velocity
        if (this.currentVelocity.lengthSq() > 0.01) {
            const newPosX = this.mesh.position.x + this.currentVelocity.x * deltaTime;
            const newPosZ = this.mesh.position.z + this.currentVelocity.z * deltaTime;
            
            const halfWidth = this.roomWidth / 2;
            const halfDepth = this.roomDepth / 2;
            const spiritRadius = 0.7; 
            
            const constrainedX = Math.max(-halfWidth + spiritRadius, Math.min(halfWidth - spiritRadius, newPosX));
            const constrainedZ = Math.max(-halfDepth + spiritRadius, Math.min(halfDepth - spiritRadius, newPosZ));
            
            this.mesh.position.x = constrainedX;
            this.mesh.position.z = constrainedZ;
            
            const angle = Math.atan2(this.currentVelocity.x, this.currentVelocity.z);
            this.mesh.rotation.y = angle;
        }

        this.velocity.copy(this.currentVelocity);
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
            this.mainLight.shadow.camera.far = distance + 5; // Adjust shadow camera far plane
            this.mainLight.shadow.camera.updateProjectionMatrix();
        }
    }

    getInventory() {
        return this.inventory;
    }

    
}