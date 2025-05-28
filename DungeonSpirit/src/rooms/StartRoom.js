import * as THREE from 'three';

import { Room } from './../skeletons/Room.js';

class StartRoom extends Room {
    constructor(floorWidth = 20, floorDepth = 20, wallHeight = 10, name = "Start Room", tileSize = 10, tilePrimary = 0x777777, tileSecondary = 0x555555, floorTextureUrl = "../../textures/brick_floor.jpg", wallTextureUrl = "../../textures/brick_wall.jpg") {
        // Call parent constructor to create the room structure and default materials
        super(floorWidth, floorDepth, wallHeight, name, tileSize, tilePrimary, tileSecondary);
        
        // Override default materials if textures are provided
        if (floorTextureUrl) {
            this.setFloor({
                type: "texture",
                textureUrl: floorTextureUrl,
                textureRepeatX: floorWidth / 5, // Example: repeat texture 5 units per meter
                textureRepeatY: floorDepth / 5
            });
        }
        // If no floorTextureUrl is provided, _startFloor() in Room's constructor will handle default.

        if (wallTextureUrl) {
            this.setWall({
                type: "texture",
                textureUrl: wallTextureUrl,
                textureRepeatX: floorWidth / 5, // Example: repeat texture 5 units per meter for wall width
                textureRepeatY: wallHeight / 5 // Example: repeat texture 5 units per meter for wall height
            });
        }
    }


}

export { StartRoom };