import * as THREE from 'three';
import { Room } from '../skeletons/Room.js';
import { Portal } from '../objects/non_interactable/Portal.js';
import { Column } from '../objects/non_interactable/Column.js';
import { DummyObject } from '../objects/interactable/DummyObject.js';

export class BalconyRoom extends Room{
    constructor(name = "Balcony Room",onPortalActivate = null, floorWidth = 20, floorDepth = 20, wallHeight = 3, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/floor_mold.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10) {
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
        
        this.onPortalActivate = onPortalActivate; 

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
        this.portal = new Portal(new THREE.Vector3(0, 5, -8), 10, 5);
        this.add(this.portal)
        
        // Create DummyObject with portal activation callback
        this.addInteractableStructure(new DummyObject(
            new THREE.Vector3(0, 1, -8), 
            "Portal", 
            "enter", 
            this.onPortalActivate
        ));

        this.add(new Column(new THREE.Vector3(-10, 0, 0), 1,1/2, 1 * 3 / 5,2));
        this.add(new Column(new THREE.Vector3(-10, 0, 7), 1,1/2,1* 3 / 5,7));
        this.add(new Column(new THREE.Vector3(-10, 0, -7), 1,1/2,1 * 3 / 5,2));

        this.add(new Column(new THREE.Vector3(0, 0, -10), 1,1/2,1 * 3 / 5,2));
        this.add(new Column(new THREE.Vector3(7, 0, -10), 1,1/2,1 * 3 / 5,2));
        this.add(new Column(new THREE.Vector3(-7, 0,-10), 1,1/2,1 * 3 / 5,2));

        this.add(new Column(new THREE.Vector3(10, 0, 0), 1,1/2, 1 * 3 / 5,2));
        this.add(new Column(new THREE.Vector3(10, 0, 7), 1,1/2,1* 3 / 5,7));
        this.add(new Column(new THREE.Vector3(10, 0, -7), 1,1/2,1 * 3 / 5,2));
    }

    getPortal() {
        return this.portal;
    }

    getLightsDefinition(){ // For now just an example, to customize
        return [
            {
                type: 'AmbientLight',
                color: 0x00ebcf, 
                intensity: 5.0
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