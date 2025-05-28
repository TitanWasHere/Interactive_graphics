import * as THREE from 'three';

import { Room } from './../skeletons/Room.js';

class StartRoom extends Room {
    constructor(floorWidth = 20, floorDepth = 20, wallHeight = 11, textureRepeatFloor = {}, textureRepeatWall = {}, name = "Start Room", floorTextureUrl = "../../textures/brick_floor.jpg", wallTextureUrl = "../../textures/brick_wall.jpg", tilePrimary = 0x777777, tileSecondary = 0x555555, tileSize = 10 ) {
        
        super(floorWidth, floorDepth, wallHeight, name, tileSize, tilePrimary, tileSecondary);
        
        // Override default materials if textures are provided
        if (floorTextureUrl) {
            this.setFloor({
                type: "texture",
                textureUrl: floorTextureUrl,
                textureRepeatX: textureRepeatFloor.x || floorWidth / 10,
                textureRepeatY: textureRepeatFloor.y || floorDepth / 10 
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


}

export { StartRoom };