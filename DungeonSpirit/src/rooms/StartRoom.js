import * as THREE from 'three';

import { Room } from './../skeletons/Room.js';

export class StartRoom extends Room {
    constructor(name = "Start Room", floorWidth = 20, floorDepth = 20, wallHeight = 13, textureRepeatFloor = {}, textureRepeatWall = {}, floorTextureUrl = "../../textures/floor_mold.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10 ) {
        
        super(floorWidth, floorDepth, wallHeight, name, tileSize, tilePrimary, tileSecondary);
        
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
        // If no floorTextureUrl is provided, _startFloor() in Room's constructor will handle default.

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
                color: 0xffffff, // Luce ambiente bianca
                intensity: 0.6
            },
            {
                type: 'DirectionalLight',
                color: 0xffffff, // Luce direzionale bianca
                intensity: 1.0,  // Intensità standard
                position: { x: 5, y: 10, z: 5 }, // Da un angolo in alto
                castShadow: true, // Abilita le ombre per questa luce
                shadowCamera: {
                    left: -15, right: 15, top: 15, bottom: -15, // Area coperta dalle ombre
                    near: 0.1, far: 50,
                    mapSize: { width: 1024, height: 1024 } // Risoluzione delle ombre
                }
            },
            {
                type: 'PointLight',
                color: 0xffffaa, // Luce puntiforme calda
                intensity: 0.6,
                position: { x: 0, y: 5, z: 0 }, // Al centro della stanza, in alto
                distance: 15,
                decay: 2,
                shadowCamera: {
                    near: 0.1, far: 50,
                    mapSize: { width: 512, height: 512 } // Risoluzione delle ombre
                }
            }
        ];
    }

}