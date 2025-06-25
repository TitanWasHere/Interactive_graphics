import * as THREE from 'three';

import { Room } from './../skeletons/Room.js';
import { Altar } from '../objects/non_interactable/Altar.js';
import { Barrel } from '../objects/non_interactable/Barrel.js';
import { Column } from '../objects/non_interactable/Column.js';
import { Torch } from '../objects/non_interactable/Torch.js';
import { Key } from '../objects/interactable/Key.js';


export class AltairRoom extends Room {
    constructor(name = "Altair Room", floorWidth = 20, floorDepth = 20, wallHeight = 13, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/brick_floor.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10 ) {
        
        const doorConfig = {
            right: {
                wallSide: "right",
                offset: 0,
                width: 4,
                height: 0.3,
                interactable: true,
                targetRoom: "corridor_room",
                nameTargetRoom: "Corridor Room",
                targetSpawnPoint: new THREE.Vector3(-floorWidth / 2 + 2, 1, 0), 
            },
            front: {
                wallSide: "front",
                offset: 0,
                width: 0.3,
                height: 3,
                interactable: true,
                targetRoom: "spirit_room",
                nameTargetRoom: "Spirit Room",
                targetSpawnPoint: new THREE.Vector3(0, 1, -floorDepth / 2 + 2), 
            }
        };

        super(floorWidth, floorDepth, wallHeight, name, doorConfig, tileSize, tilePrimary, tileSecondary);
        
        // Override default materials if textures are provided
        if (floorTextureUrl || floorTextureUrl == "") {
            this.setFloor({
                type: "texture",
                textureUrl: floorTextureUrl,
                textureRepeatX: textureRepeatFloor.x || floorWidth / 10,
                textureRepeatY: textureRepeatFloor.y || floorDepth / 10 
            });
        }
        // If no floorTextureUrl is provided, _startFloor() in Room's constructor will handle default.

        if (wallTextureUrl || wallTextureUrl == "") {
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
        const altar = new Altar(new THREE.Vector3(0,0,0));
        altar.rotateY(Math.PI / 2);
        this.addObject(altar);

        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 0, this.floorWidth / 2 -1)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 0, this.floorWidth / 2 -3)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 3, 0, this.floorWidth / 2 -1)));
        this.addObject(new Barrel(new THREE.Vector3(-this.floorHeight / 2 + 1, 2, this.floorWidth / 2 -1)));
        this.addObject(new Column(new THREE.Vector3(-3.5, 0, 4)));
        this.addObject(new Column(new THREE.Vector3(-3.5, 0, -4)));

        this.addObject(new Torch(new THREE.Vector3(-2.9, 6, 4)));
        this.addObject(new Torch(new THREE.Vector3(-2.9, 6, -4)));

        this.key = new Key(new THREE.Vector3(0.6, 2.1, 0));
        this.key.rotateX(Math.PI / 2);
        this.key.rotateZ(Math.PI / 4);
        this.key.rotateY(Math.PI / 2);
        this.addInteractableObject(this.key);
    }

    getLightsDefinition() { 
        return [
            {
                type: 'AmbientLight',
                color: 0xffffff, 
                intensity: 0.0
            },
            {
                type: 'DirectionalLight',
                color: 0xfb00ff, 
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