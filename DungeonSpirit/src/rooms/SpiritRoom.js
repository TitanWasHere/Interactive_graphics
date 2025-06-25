import * as THREE from 'three';
import { Room } from '../skeletons/Room';
import { Door } from '../objects/interactable/Door';
import { Spirit } from '../skeletons/Spirit';

export class SpiritRoom extends Room{
    constructor(name = "Spirit Room", floorWidth = 20, floorDepth = 20, wallHeight = 13, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/floor_mold.jpg", wallTextureUrl = "../../textures/brick_grass_wall.png", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10) {
        const doorConfig = {
            back: {
                wallSide: "back",
                offset: 0,
                width: 0.3,
                height: 3,
                interactable: true,
                targetRoom: "altair_room",
                nameTargetRoom: "Altair Room",
                targetSpawnPoint: new THREE.Vector3(0, 1, floorDepth / 2 - 2), // Spawn point in the center of the room
            }
        };
        
        super(floorWidth, floorDepth, wallHeight, name, doorConfig, tileSize, tilePrimary, tileSecondary);
        if (floorTextureUrl || floorTextureUrl == "") {
            this.setFloor({
                type: "texture",
                textureUrl: floorTextureUrl,
                textureRepeatX: textureRepeatFloor.x || floorWidth / 10,
                textureRepeatY: 1 
            });
        }
        // If no floorTextureUrl is provided, _startFloor() in Room's constructor will handle default.

        if (wallTextureUrl || wallTextureUrl == "") {
            this.setWall({
                type: "texture",
                textureUrl: wallTextureUrl,
                textureRepeatX: textureRepeatWall.x || wallHeight / 5,
                textureRepeatY: 1
            });
        }

        this.setupRoom();

    }

    setupRoom(){
        const door = new Door(new THREE.Vector3(0, 0, -this.floorWidth / 2));
        door.rotateY(Math.PI / 2);
        this.addObject(door);
    }

    getLightsDefinition(){ // For now just an example, to customize
        return [
            {
                type: 'AmbientLight',
                color: 0x009e3d, 
                intensity: 1.9
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

