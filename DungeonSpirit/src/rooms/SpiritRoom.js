import * as THREE from 'three';
import { Room } from '../skeletons/Room';
import { Door } from '../objects/interactable/Door';

import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class SpiritRoom extends Room{
    constructor(name = "Spirit Room", floorWidth = 20, floorDepth = 20, wallHeight = 13, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/grass.jpg", wallTextureUrl = "../../textures/brick_grass_wall.png", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10) {
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

        // Grass
        const plantsPath = '../../assets/plants/';
        //this.addLoadableObject(plantsPath + "tree_in_OBJ", new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.2,0.2,0.2));

        const x_variation = [ 0.5, 0.3, -1.1, 1.4, -1.3, 1.2, -1.2, 1.1, -0.4, 0.3 ];
        const y_variation = [-6, -3, 0, 2, 7.5, 6];
        const rotation_Y = [Math.PI / 4, Math.PI / 2, -Math.PI / 4, 0, -Math.PI / 2, Math.PI, -Math.PI / 3, -2 * Math.PI / 3, Math.PI / 3, 2 * Math.PI / 3];

        for( let i = 0 ; i < y_variation.length; i++){
            for( let j = 0 ; j < x_variation.length / 2; j++){
                this.addLoadableObject(plantsPath + "SmallOrnamentalPlant1", new THREE.Vector3(-this.floorWidth/2 + 2 + x_variation[j], 0, y_variation[i]), new THREE.Vector3(5 + 1 * x_variation[j],5+ 1 * x_variation[j],5+ 1 * x_variation[j]), new THREE.Vector3(-Math.PI / 2, 0, rotation_Y[j]));
            }
            for( let j = x_variation.length / 2 ; j < x_variation.length; j++){
                this.addLoadableObject(plantsPath + "SmallOrnamentalPlant1", new THREE.Vector3(this.floorWidth/2 - 2 + x_variation[j], 0, y_variation[i]), new THREE.Vector3(5+ 1 * x_variation[j],5+ 1 * x_variation[j],5+ 1 * x_variation[j]), new THREE.Vector3(-Math.PI / 2, 0, rotation_Y[j]));
            }
        }

        this.addLoadableObject(plantsPath + "tree_in_OBJ", new THREE.Vector3(7, 0, 4), new THREE.Vector3(0.2, 0.2, 0.2));
        this.addLoadableObject(plantsPath + "tree_in_OBJ", new THREE.Vector3(5.5, 0, -this.floorHeight / 2  + 2), new THREE.Vector3(0.3, 0.3, 0.3), new THREE.Vector3(0, Math.PI / 2, 0));
        this.addLoadableObject(plantsPath + "tree_in_OBJ", new THREE.Vector3(-5, 0, -7), new THREE.Vector3(0.2, 0.2, 0.2));
        this.addLoadableObject(plantsPath + "tree_in_OBJ", new THREE.Vector3(-7, 0, 5), new THREE.Vector3(0.2, 0.2, 0.2), new THREE.Vector3(0, -Math.PI / 2, 0));
        this.addLoadableObject(plantsPath + "tree_in_OBJ", new THREE.Vector3(-4, 0, 4), new THREE.Vector3(0.3, 0.3, 0.3), new THREE.Vector3(0, 0, 0));
        this.addLoadableObject(plantsPath + "tree_in_OBJ", new THREE.Vector3(-10.8, 12, 0), new THREE.Vector3(0.2, 0.2, 0.2), new THREE.Vector3(0, 0, Math.PI));
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

