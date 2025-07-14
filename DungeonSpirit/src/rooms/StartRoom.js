import * as THREE from 'three';
import { Room } from '../skeletons/Room.js';
import { Door } from '../objects/interactable/Door.js';
import { Column } from '../objects/non_interactable/Column.js';
import { TorchLight } from '../objects/non_interactable/TorchLight.js';

export class StartRoom extends Room {
    constructor(name = "Start Room", floorWidth = 20, floorDepth = 20, wallHeight = 13, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/floor_mold.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10) {
        const doorConfig = {
            front: {
                wallSide: "front",
                offset: 0,
                width: 0.3,
                height: 3,
                interactable: true,
                targetRoom: "corridor_room",
                nameTargetRoom: "Corridor Room",
                targetSpawnPoint: new THREE.Vector3(0, 1, -floorDepth / 2 + 2), // Spawn point in the center of the room
            },
            back: {
                wallSide: "back",
                offset: 0,
                width: 0.3,
                height: 3,
                interactable: false,
                targetRoom: "balcony_room",
                nameTargetRoom: "Balcony Room",
                targetSpawnPoint: new THREE.Vector3(0, 1, floorDepth / 2 - 2), // Spawn point in the center of the room
                toUnlock: "2", 
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
                textureRepeatX: textureRepeatWall.x || wallHeight / 5,
                textureRepeatY: textureRepeatWall.y || wallHeight / 5
            });
        }

        this.setupRoom();
    }

    setupRoom(){
        const door = new Door(new THREE.Vector3(0, 0, -this.floorWidth / 2));
        door.rotateY(Math.PI / 2);
        this.addObject(door);

        //this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 0, this.floorWidth / 2 -1)));
        this.addObject(new Column(new THREE.Vector3(-this.floorWidth/2 + 4 ,0, -this.floorHeight/4)));
        this.addObject(new Column(new THREE.Vector3(-this.floorWidth/2 + 4,0, this.floorHeight/4)));

        this.addObject(new Column(new THREE.Vector3(this.floorWidth/2 - 4,0, -this.floorHeight/4)));
        this.addObject(new Column(new THREE.Vector3(this.floorWidth/2 - 4,0, this.floorHeight/4), 1,0.5,1,1));

        const torch1 = new TorchLight(new THREE.Vector3(-this.floorWidth/2 + 4 , 7,-this.floorHeight/4 + 0.7), 0.1, 1, 0xffa500);
        this.torches.push(torch1);
        this.addObject(torch1);

        const torch2 = new TorchLight(new THREE.Vector3(this.floorWidth/2 - 4, 7,-this.floorHeight/4 + 0.7), 0.1, 1, 0xffa500);
        this.torches.push(torch2);
        this.addObject(torch2);

        
    }

    

    getLightsDefinition(){ 
        return [
            {
                type: 'AmbientLight',
                color: 0x070066, 
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