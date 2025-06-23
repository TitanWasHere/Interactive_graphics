import * as THREE from 'three';

import { Room } from './../skeletons/Room.js';
import { Column } from '../objects/non_interactable/Column.js';
import { Altar } from '../objects/non_interactable/Altar.js';
import { Chest } from '../objects/interactable/Chest.js';
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

        this.setupRoom();
    }

    setupRoom(){
        this.#setupColumns();
        //this.addObject(new Altar());
        const chest = new Chest();
        
        this.addObject(chest);
        
        
    }

    #setupColumns(){
        const base_width = 2;
        const base_height = 1;

        //this.column = new Column(new THREE.Vector3(0, 0, -this.floorWidth / 2 + base_width / 2), base_width, base_height, base_width * 3/5, this.wallHeight - base_height*2 , base_width, base_height );
        this.column = new Column(new THREE.Vector3(-this.floorWidth/2 + base_width / 2, 0, -this.floorHeight / 4));
        this.addObject(this.column);

        this.column2 = new Column(new THREE.Vector3(-this.floorWidth/2 + base_width / 2, 0, this.floorHeight / 4));
        this.addObject(this.column2);

        this.column3 = new Column(new THREE.Vector3(this.floorWidth/2 - base_width / 2, 0, -this.floorHeight / 4));
        this.addObject(this.column3);

        this.column4 = new Column(new THREE.Vector3(this.floorWidth/2 - base_width / 2, 0, this.floorHeight / 4));
        this.addObject(this.column4);
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