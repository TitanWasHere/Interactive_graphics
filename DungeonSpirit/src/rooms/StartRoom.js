import * as THREE from 'three';

import { Room } from './../skeletons/Room.js';
import { Column } from '../objects/non_interactable/Column.js';
import { Door } from '../objects/interactable/Door.js';
import { Torch } from '../objects/non_interactable/Torch.js';

import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

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
                targetRoom: "gem_room",
                nameTargetRoom: "Gem Room",
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
        //const chest = new Chest();
        
        this.addObject(new Door(new THREE.Vector3(-this.floorWidth / 2, 0, 0)));
        
        this.addObject(new Torch(new THREE.Vector3(-8.3, 6, 5)));
        this.addObject(new Torch(new THREE.Vector3(-8.3, 6, -5)));
        this.addObject(new Torch(new THREE.Vector3(8.3, 6, 5)));
        this.addObject(new Torch(new THREE.Vector3(8.3, 6, -5)));

        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('../../assets/'); // Path to where .mtl and textures are
        mtlLoader.load('skeleton.mtl', (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.load('../../assets/skeleton.obj', (object) => {
                object.position.set(-8, 0, -10);
                object.scale.set(3, 3, 3);
                this.addObject(object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded (OBJ)');
            },
            (error) => {
                console.error('An error happened loading OBJ:', error);
            });
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded (MTL)');
        },
        (error) => {
            console.error('An error happened loading MTL:', error);
        });

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
                    mapSize: { width: 1024, height: 1024 } 
                }
            }
        ];
    }

}