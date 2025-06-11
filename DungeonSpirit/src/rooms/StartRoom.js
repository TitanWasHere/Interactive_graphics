import * as THREE from 'three';

import { Room } from './../skeletons/Room.js';
import { AltairRoom } from './AltairRoom.js';

export class StartRoom extends Room {
    constructor(name = "Start Room", floorWidth = 20, floorDepth = 20, wallHeight = 13, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/floor_mold.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10 ) {

        const doorConfig = {
            left:{
                wallSide: "left",
                offset: 0,
                width: 4,
                height: 0.3,
                interactable: true,
                targetRoom: "altair_room",
                nameTargetRoom: "Altair Room",
                targetSpawnPoint: new THREE.Vector3(8, 1, 0), 
            },
            right: { 
                wallSide: "right",
                offset: 0,
                width: 3,
                height: 0.3,
                interactable: false, // Red door
                targetRoom: "altair_room",
                nameTargetRoom: "Altair Room",
                targetSpawnPoint: new THREE.Vector3(-floorWidth / 2 + 2, 1, 0), // Spawn point in the center of the room
                toUnlock: "1", // ID 1 for key
            },

        }

        super(floorWidth, floorDepth, wallHeight, name, doorConfig, tileSize, tilePrimary, tileSecondary);
        
        // Override default materials if textures are provided
        if (floorTextureUrl) {
            this.setFloor({
                type: "texture",
                textureUrl: floorTextureUrl,
                textureRepeatX: textureRepeatFloor.x || floorWidth / 10,
                textureRepeatY: textureRepeatFloor.y || floorDepth / 10 ,
                floorMesh: new THREE.MeshStandardMaterial({
                    color: 0x333333,          
                    roughness: 0.1,           
                    metalness: 0.5,           
                    emissive: 0x111111,       
                    emissiveIntensity: 0.1    
                })
            });
        }

        if (wallTextureUrl) {
            this.setWall({
                type: "texture",
                textureUrl: wallTextureUrl,
                textureRepeatX: textureRepeatWall.x || wallHeight / 5,
                textureRepeatY: textureRepeatWall.y || wallHeight / 5
            });
        }


    }

    getLightsDefinition(){ // For now just an example, to customize
        return [
            {
                type: 'AmbientLight',
                color: 0xffffff, 
                intensity: 0.0
            },
            {
                type: 'DirectionalLight',
                color: 0xffffff, 
                intensity: 1.0,  
                position: { x: 5, y: 10, z: 5 }, 
                castShadow: true, 
                shadowCamera: {
                    left: -15, right: 15, top: 15, bottom: -15, 
                    near: 0.1, far: 50,
                    mapSize: { width: 1024, height: 1024 } // Risoluzione delle ombre
                }
            }
        ];
    }

}