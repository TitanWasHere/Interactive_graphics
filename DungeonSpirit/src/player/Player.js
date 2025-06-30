import * as THREE from 'three';
import { Inventory } from './Inventory.js';
import { Spirit } from '../skeletons/Spirit.js';

export class Player extends Spirit {
    constructor(initPose = new THREE.Vector3(0, 10, 0), sphereColor = 0xff2222, fireMaterial1 = 0xff3300, fireMaterial2 = 0xff8800, fireMaterial3 = 0xffff00) {
        
        super(initPose, sphereColor, fireMaterial1, fireMaterial2, fireMaterial3);
        
        this.inventory = new Inventory();

        this.keyGiven = false;

        this.setupInput();
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

    checkNearbyNPCs(room) {
        this.currentInteractableNPC = null; 
        if (!room || !room.getInteractableNPCs) return;

        const interactableNPCs = room.getInteractableNPCs();
        //console.log("Interactable NPCs:", interactableNPCs);
        let closestNPC = null;
        let minDistanceSq = this.interactionDistance * this.interactionDistance;

        for (const npcData of interactableNPCs) {
            // Check distance to the NPC's visual center point
            const distanceSq = this.mesh.position.distanceToSquared(npcData.mesh.position);
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestNPC = npcData; 
            }
        }
        if (closestNPC) {
            this.currentInteractableNPC = closestNPC;
            //console.log(`Closest NPC: ${this.currentInteractableNPC.name} at distance ${Math.sqrt(minDistanceSq)}`);
        }
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

    checkNearbyStructures(room) {
        this.currentInteractableStructure = null; 
        if (!room || !room.getInteractableStructures) return;

        const interactableStructures = room.getInteractableStructures();
        let closestStructure = null;
        let minDistanceSq = this.interactionDistance * this.interactionDistance;

        for (const structureData of interactableStructures) {
            // Check distance to the structure's visual center point
            const distanceSq = this.mesh.position.distanceToSquared(structureData.position);
            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestStructure = structureData; 
            }
        }
        if (closestStructure) {
            this.currentInteractableStructure = closestStructure;
        }
    }

    getInventory() {
        return this.inventory;
    }

    update(deltaTime, elapsedTime, currentRoom) {

        this.roomWidth = currentRoom.floorWidth;
        this.roomDepth = currentRoom.floorHeight || this.roomWidth; 

        if (this.mesh && this.mesh.material) {
            const emissiveFactor = 0.5 + 0.3 * Math.sin(elapsedTime * 2);
            this.mesh.material.emissiveIntensity = emissiveFactor;
        }

        this.updateLights(deltaTime, elapsedTime);
        this.updateWobble(1, elapsedTime);
        this.updateMovement(deltaTime, elapsedTime);
        this.updateBubbles(deltaTime, elapsedTime);
        this.updateFireParticles(deltaTime, elapsedTime);

        this.checkNearbyDoors(currentRoom);
        this.checkNearbyObjects(currentRoom);
        this.checkNearbyNPCs(currentRoom);
        this.checkNearbyStructures(currentRoom);
    }    

    updateMovement(deltaTime, elapsedTime) {
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


    
}