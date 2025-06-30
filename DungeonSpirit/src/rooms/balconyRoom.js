import * as THREE from 'three';
import { Room } from '../skeletons/Room.js';

export class BalconyRoom extends Room{
    constructor(name = "Balcony Room", floorWidth = 20, floorDepth = 20, wallHeight = 3, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/floor_mold.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10) {
        const doorConfig = {
            
            front: {
                wallSide: "front",
                offset: 0,
                width: 0.3,
                height: 3,
                interactable: true,
                targetRoom: "start_room",
                nameTargetRoom: "Start Room",
                targetSpawnPoint: new THREE.Vector3(0, 1, -floorDepth / 2 + 2), 
            }
        }

        super(floorWidth, floorDepth, wallHeight, name, doorConfig, tileSize, tilePrimary, tileSecondary);

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
                textureRepeatX: textureRepeatWall.x || wallHeight / 3,
                textureRepeatY: textureRepeatWall.y || wallHeight / 15
            });
        }

        this.setupRoom();
    }

    setupRoom(){

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
                    mapSize: { width: 1024, height: 1024 } 
                }
            }
        ];
    }
}