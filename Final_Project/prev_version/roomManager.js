import * as THREE from 'three';
import { createRoom } from './roomUtils.js';
import {
    lineMaterial,
    blackFloorMaterial,
    blackWallMaterial,
    grayFloorSidesMaterial,
    brickWallMaterial,
    brickFloorMaterial,
    onBrickWallTextureLoaded,
    onBrickFloorTextureLoaded
} from './materials.js';

export class RoomManager {
    constructor(scene, lightingManager) {
        this.scene = scene;
        this.lightingManager = lightingManager;
        this.currentRoomGroup = null;
        this.currentRoomObject = null;
        this.currentRoomName = null;
        
        this.setupRoomConfigurations();
        this.setupTextureCallbacks();
    }
    
    setupRoomConfigurations() {
        this.roomConfigs = {
            brick: {
                name: 'brick',
                floorTopMaterial: brickFloorMaterial,
                floorSidesMaterial: grayFloorSidesMaterial,
                wallMaterial: brickWallMaterial,
                lineMaterial: lineMaterial,
                usesTorchLight: true
            },
            black: {
                name: 'black',
                floorTopMaterial: blackFloorMaterial,
                floorSidesMaterial: grayFloorSidesMaterial,
                wallMaterial: blackWallMaterial,
                lineMaterial: lineMaterial,
                usesTorchLight: false
            }
        };
    }
    
    setupTextureCallbacks() {
        onBrickWallTextureLoaded((loadedWallMaterial) => {
            console.log("Received notification: Brick wall texture is ready.");
            this.roomConfigs.brick.wallMaterial = loadedWallMaterial;
            
            if (this.currentRoomObject && this.currentRoomObject.name === 'brick') {
                console.log("Updating current brick room walls with loaded texture.");
                this.currentRoomObject.wall1Mesh.material = loadedWallMaterial;
                this.currentRoomObject.wall2Mesh.material = loadedWallMaterial;
            }
        });
        
        onBrickFloorTextureLoaded((loadedFloorMaterial) => {
            console.log("Received notification: Brick floor texture is ready.");
            this.roomConfigs.brick.floorTopMaterial = loadedFloorMaterial;
            
            if (this.currentRoomObject && this.currentRoomObject.name === 'brick') {
                console.log("Updating current brick room floor top with loaded texture.");
                if (Array.isArray(this.currentRoomObject.floorMesh.material) && 
                    this.currentRoomObject.floorMesh.material.length > 2) {
                    this.currentRoomObject.floorMesh.material[2] = loadedFloorMaterial;
                    this.currentRoomObject.floorMesh.material.needsUpdate = true;
                } else {
                    console.warn("Floor mesh material is not an array or is too small to update index 2.");
                }
            }
        });
    }
    
    showRoom(roomName) {
        this.currentRoomName = roomName;
        
        const config = this.roomConfigs[roomName];
        if (!config) {
            console.error(`Room configuration "${roomName}" not found.`);
            return;
        }
        
        // Create the new room using the configuration materials
        const roomObject = createRoom(
            config.floorTopMaterial,
            config.floorSidesMaterial,
            config.wallMaterial,
            config.lineMaterial
        );
        
        // Enable shadows on room meshes
        roomObject.floorMesh.receiveShadow = true;
        roomObject.wall1Mesh.castShadow = true;
        roomObject.wall2Mesh.castShadow = true;
        
        if (this.currentRoomGroup) {
            this.scene.remove(this.currentRoomGroup);
            // Could add disposal of geometries/materials here if needed
        }
        
        // Store references
        this.currentRoomGroup = roomObject.group;
        this.currentRoomObject = roomObject;
        this.currentRoomObject.name = roomName;
        
        // Position
        this.currentRoomGroup.position.y = -2;
        
        // Add to scene
        this.scene.add(this.currentRoomGroup);
        
        console.log(`Displayed room: ${roomName}`);
        
        // Control light visibility based on the current room
        if (this.lightingManager) {
            this.lightingManager.setTorchVisibility(config.usesTorchLight || false);
        }
        
        return roomObject;
    }
}