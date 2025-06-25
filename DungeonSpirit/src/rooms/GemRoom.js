import * as THREE from "three";
import { Room } from "../skeletons/Room";
import { Chest } from "../objects/interactable/Chest";
import { Door } from "../objects/interactable/Door";
import { Barrel } from "../objects/non_interactable/Barrel";
import { Column } from "../objects/non_interactable/Column";


export class GemRoom extends Room {
    constructor(name = "Gem Room", floorWidth = 20, floorDepth = 20, wallHeight = 13, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/floor_mold.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10 ){

        const doorConfig = {
            left:{
                wallSide: "left",
                offset: 0,
                width: 4,
                height: 0.3,
                interactable: true,
                targetRoom: "corridor_room",
                nameTargetRoom: "Corridor Room",
                targetSpawnPoint: new THREE.Vector3(8, 1, 0), 
            },
            
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
        const chest = new Chest(new THREE.Vector3(5, 0, 0));
        chest.rotateY(-Math.PI / 2);
        this.addObject(chest); 

        const door = new Door(new THREE.Vector3(-this.floorWidth / 2, 0))
        this.addObject(door);

        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 0, this.floorWidth / 2 -1)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 0, this.floorWidth / 2 -3)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 3, 0, this.floorWidth / 2 -1)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 2, this.floorWidth / 2 -1)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 0, -this.floorWidth / 2 +1)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 0, -this.floorWidth / 2 +3)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 3, 0, -this.floorWidth / 2 +1)));
        //this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 2, -this.floorWidth / 2 +1)));
        this.addObject(new Barrel(new THREE.Vector3(5, 0, -3)));

        this.addObject(new Column(new THREE.Vector3(6, 0, -6)));
    }

    getLightsDefinition(){ 
        return [
            {
                type: 'AmbientLight',
                color: 0xffffff, 
                intensity: 0.0
            },
            {
                type: 'DirectionalLight',
                color: 0xff3d3d, 
                intensity: 2.62,  
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