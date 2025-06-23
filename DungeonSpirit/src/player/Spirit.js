import * as THREE from 'three';
import { Inventory } from './Inventory.js';

export class Spirit {
    constructor(initPose = new THREE.Vector3(0, 1, 0)) {
        this.inventory = new Inventory();
        this.interactionDistance = 2.5;
        this.currentInteractableDoor = null;
        this.nearestDoor = null;

        // Collision Properties
        this.collisionSize = new THREE.Vector3(0.7, 1.5, 0.7); // Width, Height, Depth for collision
        this.boundingBox = new THREE.Box3();

        this.initializeSpirit(initPose);
        this.setupLights();
        this.setupParticles();
        this.setupInput();

        this.updateBoundingBox(); // Initial bounding box calculation
    }

    initializeSpirit(initPose) {
        const sphereGeometry = new THREE.SphereGeometry(0.7, 8, 8);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0xff2222,
            emissive: 0xaa0000,
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 0.6,
        });

        this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.mesh.position.copy(initPose);
        this.mesh.castShadow = true;

        this.baseYPosition = initPose.y;

        this.floatAmplitude = 0.2;
        this.floatSpeed = 1.2;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.pulseAmplitude = 0.15;
        this.pulseSpeed = 1.0;

        // Velocities as per your original structure
        this.movementSpeed = 8.0;       // Max speed
        this.velocity = new THREE.Vector3();        // Final velocity applied (after collisions) - NON USATA DIRETTAMENTE PER MOVIMENTO MA POTREBBE SERVIRE PER ALTRE LOGICHE
        this.acceleration = 15.0;
        this.deceleration = 12.0;
        this.currentVelocity = new THREE.Vector3(); // Smoothed velocity, tending towards targetVelocity
        this.targetVelocity = new THREE.Vector3();  // Desired velocity based on input
    }

    updateBoundingBox() {
        if (!this.mesh) return;
        const center = new THREE.Vector3(
            this.mesh.position.x,
            this.baseYPosition + this.collisionSize.y / 2,
            this.mesh.position.z
        );
        this.boundingBox.setFromCenterAndSize(center, this.collisionSize);
    }

    setupLights() {
        this.lightDistance = 25;
        this.mainLight = new THREE.PointLight(this.mesh.material.color, 6.0, this.lightDistance, 1);
        this.mainLight.position.copy(this.mesh.position);
        this.mainLight.castShadow = true;
        this.mainLight.shadow.mapSize.width = 1024;
        this.mainLight.shadow.mapSize.height = 1024;
        this.mainLight.shadow.bias = -0.001;
        this.mainLight.shadow.camera.near = 0.1;
        this.mainLight.shadow.camera.far = this.lightDistance;
        this.ambientContribution = new THREE.AmbientLight(this.mesh.material.color, 0.3);
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

    setLightDistance(distance) {
        this.lightDistance = Math.max(distance, 20);
        if (this.mainLight) {
            this.mainLight.distance = this.lightDistance;
            this.mainLight.shadow.camera.far = this.lightDistance;
            this.mainLight.shadow.camera.updateProjectionMatrix();
        }
    }

    // setLightIntensity method was duplicated, ensure only one good one
    setLightIntensity(intensity) {
        this.lightIntensityBase = Math.max(intensity, 2.0);
        this.lightIntensityVariation = this.lightIntensityBase * 0.3;
    }


    setupParticles() {
        this.bubbleGroup = new THREE.Group();
        this.mesh.add(this.bubbleGroup);
        this.bubbleConfig = { spawnRate: 0.05, maxBubbles: 50, radiusSpread: 0.8, riseSpeed: 1.0, lifespan: 2.0 };
        this.bubbles = [];
        this.bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        this.bubbleMaterial = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6, roughness: 0.2, metalness: 0, depthWrite: false });
        this.fireGroup = new THREE.Group();
        this.mesh.add(this.fireGroup);
        this.fireConfig = { spawnRate: 1, maxFire: 70, radiusSpread: 0.8, riseSpeed: 3.0, lifespan: 0.4, cubeSize: 0.15 };
        this.fireParticles = [];
        this.fireGeometry = new THREE.BoxGeometry(this.fireConfig.cubeSize, this.fireConfig.cubeSize, this.fireConfig.cubeSize);
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
        switch (event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.keys.forward = true; break;
            case 's': case 'arrowdown': this.keys.backward = true; break;
            case 'a': case 'arrowleft': this.keys.left = true; break;
            case 'd': case 'arrowright': this.keys.right = true; break;
        }
    }

    handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.keys.forward = false; break;
            case 's': case 'arrowdown': this.keys.backward = false; break;
            case 'a': case 'arrowleft': this.keys.left = false; break;
            case 'd': case 'arrowright': this.keys.right = false; break;
        }
    }

    checkNearbyDoors(room) {
        this.currentInteractableDoor = null;
        if (!room || !room.getInteractableDoors) return;
        const interactableDoors = room.getInteractableDoors();
        let closestDoor = null;
        let minDistanceSq = this.interactionDistance * this.interactionDistance;
        for (const door of interactableDoors) {
            if (!door.mesh || !door.definition) continue;
            const distanceSq = this.mesh.position.distanceToSquared(door.mesh.position);
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestDoor = door;
            }
        }
        if (closestDoor) {
            this.currentInteractableDoor = closestDoor.definition;
        }
    }

    update(deltaTime, elapsedTime, currentRoom) {
        this.roomWidth = currentRoom.floorWidth;
        this.roomDepth = currentRoom.floorDepth || this.roomWidth;

        // Visual floating effect
        const floatY = Math.sin((elapsedTime + this.floatOffset) * Math.PI * this.floatSpeed) * this.floatAmplitude;
        this.mesh.position.y = this.baseYPosition + this.collisionSize.y / 2 + floatY;

        const pulse = 1 + Math.sin((elapsedTime + this.floatOffset) * Math.PI * this.pulseSpeed) * this.pulseAmplitude;
        this.mesh.scale.set(pulse, pulse, pulse);

        if (this.mesh && this.mesh.material) {
            const emissiveFactor = 0.5 + 0.3 * Math.sin(elapsedTime * 2);
            this.mesh.material.emissiveIntensity = emissiveFactor;
        }

        this.updateLights(deltaTime, elapsedTime);
        this.updateMovement(deltaTime, elapsedTime, currentRoom); // Pass currentRoom
        this.updateBubbles(deltaTime, elapsedTime);
        this.updateFireParticles(deltaTime, elapsedTime);
        this.checkNearbyDoors(currentRoom);
    }

    updateMovement(deltaTime, elapsedTime, currentRoom) {
        // 1. Calculate targetVelocity based on input
        this.targetVelocity.set(0, 0, 0);
        if (this.keys.forward) this.targetVelocity.z -= 1;
        if (this.keys.backward) this.targetVelocity.z += 1;
        if (this.keys.left) this.targetVelocity.x -= 1;
        if (this.keys.right) this.targetVelocity.x += 1;

        if (this.targetVelocity.lengthSq() > 0) {
            this.targetVelocity.normalize().multiplyScalar(this.movementSpeed);
        }

        // 2. Lerp currentVelocity towards targetVelocity (smoothing)
        const isMovingInput = this.targetVelocity.lengthSq() > 0;
        const lerpFactor = (isMovingInput ? this.acceleration : this.deceleration) * deltaTime;
        this.currentVelocity.lerp(this.targetVelocity, lerpFactor);

        // 3. Calculate proposed movement for this frame based on smoothed currentVelocity
        let proposedDeltaMove = this.currentVelocity.clone().multiplyScalar(deltaTime);

        // 4. Collision Detection and Response
        let collidables = [];
        if (currentRoom && typeof currentRoom.getCollidables === 'function') {
            collidables = currentRoom.getCollidables();
        }

        // Store current position before attempting moves
        const originalPosition = this.mesh.position.clone();

        // Attempt X-axis movement
        let tempPositionX = originalPosition.x + proposedDeltaMove.x;
        let tempCenterX = this.baseYPosition + this.collisionSize.y / 2;
        let tempBoxForX = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(tempPositionX, tempCenterX, originalPosition.z),
            this.collisionSize
        );
        let collisionX = false;
        for (const object of collidables) {
            if (object.boundingBox && tempBoxForX.intersectsBox(object.boundingBox)) {
                collisionX = true;
                // Adjust tempPositionX to be just outside the collided object on X
                // This is a more precise stop than just setting proposedDeltaMove.x = 0
                // For simplicity now, we just stop X movement if collision
                proposedDeltaMove.x = 0;
                this.currentVelocity.x = 0; // Stop velocity on this axis
                break;
            }
        }

        // Attempt Z-axis movement (using potentially adjusted X position from previous step)
        // The actual application of position will be after both checks
        let tempPositionZ = originalPosition.z + proposedDeltaMove.z;
        let tempBoxForZ = new THREE.Box3().setFromCenterAndSize(
            // Use originalPosition.x + proposedDeltaMove.x for the X component here,
            // as this is where the spirit *would* be if X move was allowed.
            new THREE.Vector3(originalPosition.x + proposedDeltaMove.x, tempCenterX, tempPositionZ),
            this.collisionSize
        );
        let collisionZ = false;
        for (const object of collidables) {
            if (object.boundingBox && tempBoxForZ.intersectsBox(object.boundingBox)) {
                collisionZ = true;
                proposedDeltaMove.z = 0;
                this.currentVelocity.z = 0; // Stop velocity on this axis
                break;
            }
        }

        // 5. Apply the allowed delta movement
        this.mesh.position.x += proposedDeltaMove.x;
        this.mesh.position.z += proposedDeltaMove.z;
        // Y position is handled by floating effect, not by this movement logic

        // 6. Room Boundary Constraints
        const halfRoomWidth = this.roomWidth / 2;
        const halfRoomDepth = this.roomDepth / 2;
        const spiritCollisionRadiusX = this.collisionSize.x / 2;
        const spiritCollisionRadiusZ = this.collisionSize.z / 2;

        this.mesh.position.x = Math.max(-halfRoomWidth + spiritCollisionRadiusX, Math.min(halfRoomWidth - spiritCollisionRadiusX, this.mesh.position.x));
        this.mesh.position.z = Math.max(-halfRoomDepth + spiritCollisionRadiusZ, Math.min(halfRoomDepth - spiritCollisionRadiusZ, this.mesh.position.z));

        // 7. Update Bounding Box after all position changes
        this.updateBoundingBox();

        // 8. Update rotation based on target (input) direction
        if (this.targetVelocity.lengthSq() > 0.001) { // Rotate based on desired direction
            const angle = Math.atan2(this.targetVelocity.x, this.targetVelocity.z);
            // Smooth rotation (optional, but can look nice)
            // this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, angle, 0.1);
            this.mesh.rotation.y = angle; // Direct rotation
        }

        // 9. Update the 'velocity' variable if you use it elsewhere
        // This 'velocity' now represents the effective velocity after collisions for this frame
        if (deltaTime > 0) {
            this.velocity.set(
                (this.mesh.position.x - originalPosition.x) / deltaTime,
                0, // Y velocity is not handled by this system
                (this.mesh.position.z - originalPosition.z) / deltaTime
            );
        } else {
            this.velocity.set(0, 0, 0);
        }
    }


    updateBubbles(deltaTime, elapsedTime) {
        if (this.bubbles.length < this.bubbleConfig.maxBubbles && Math.random() < this.bubbleConfig.spawnRate * deltaTime) {
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

    setColor(color) {
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.set(color);
            this.mesh.material.emissive.set(new THREE.Color(color).multiplyScalar(0.5));
        }
    }

    getInventory() {
        return this.inventory;
    }
}