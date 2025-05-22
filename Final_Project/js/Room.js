import * as THREE from 'three';

import checkerboardVert from './../shaders/checkerboard.vert?raw';
import checkerboardFrag from './../shaders/checkerboard.frag?raw';

class Room {
    constructor(
        scene,
        size = 20,
        wallHeight = 10,
        floorConfig, // { type: 'colors'/'texture', colors: [], textureUrl: '', textureRepeat: N }
        wallConfig, // New: similar to floorConfig but for walls
        tileSize = 10 // For wall checkers
    ) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.size = size;
        this.wallHeight = wallHeight;
        this.tileSize = tileSize;

        this.floorConfig = floorConfig;
        this.wallConfig = wallConfig || { type: 'colors', colors: [0x555555, 0x444444] }; // Default if not provided

        this.materials = {};
        this.textures = {}; // Store textures for later scaling

        this.createMaterials();
        this.createFloor();
        this.createWalls();

        this.scene.add(this.group);
    }

    createMaterials() {
        // --- Floor Material ---
        if (this.floorConfig.type === 'texture' && this.floorConfig.textureUrl) {
            const textureLoader = new THREE.TextureLoader();
            const floorTexture = textureLoader.load(
                this.floorConfig.textureUrl,
                // On load callback
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(this.floorConfig.textureRepeat, this.floorConfig.textureRepeat);
                    texture.colorSpace = THREE.SRGBColorSpace; // Critical for correct color rendering
                },
                undefined,
                (err) => {
                    console.error('An error happened loading the floor texture:', err);
                }
            );
            
            this.textures.floor = floorTexture; // Store for later reference
            
            this.materials.floor = new THREE.MeshStandardMaterial({
                map: floorTexture,
                roughness: 0.8,
                metalness: 0.1,
                side: THREE.DoubleSide,
            });
        } else {
            // Fallback to shader material if no texture URL or type is 'colors'
            this.materials.floor = new THREE.ShaderMaterial({
                uniforms: {
                    u_color1: { value: new THREE.Color(this.floorConfig.colors[0]) },
                    u_color2: { value: new THREE.Color(this.floorConfig.colors[1]) },
                    u_tileSize: { value: this.tileSize }
                },
                vertexShader: checkerboardVert,
                fragmentShader: checkerboardFrag,
                side: THREE.FrontSide,
            });
        }

        // --- Wall Material (now supports textures too) ---
        if (this.wallConfig.type === 'texture' && this.wallConfig.textureUrl) {
            const textureLoader = new THREE.TextureLoader();
            const wallTexture = textureLoader.load(
                this.wallConfig.textureUrl,
                // On load callback
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(this.wallConfig.textureRepeat, this.wallConfig.textureRepeat);
                    texture.colorSpace = THREE.SRGBColorSpace;
                },
                undefined,
                (err) => {
                    console.error('An error happened loading the wall texture:', err);
                }
            );
            
            this.textures.wall = wallTexture; // Store for later reference
            
            this.materials.wall = new THREE.MeshStandardMaterial({
                map: wallTexture,
                roughness: 0.7,
                metalness: 0.1,
                side: THREE.DoubleSide,
            });
        } else {
            // Use shader material for checkerboard pattern
            this.materials.wall = new THREE.ShaderMaterial({
                uniforms: {
                    u_color1: { value: new THREE.Color(this.wallConfig.colors[0]) },
                    u_color2: { value: new THREE.Color(this.wallConfig.colors[1]) },
                    u_tileSize: { value: this.tileSize }
                },
                vertexShader: checkerboardVert,
                fragmentShader: checkerboardFrag,
                side: THREE.FrontSide,
            });
        }
    }
    
    updateTextureScale(textureType, scale) {
    const texture = this.textures[textureType]; // 'floor' or 'wall'
    if (texture) {
        texture.repeat.set(scale, scale);
        texture.needsUpdate = true;
    }
}

    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(this.size, this.size);
        const floor = new THREE.Mesh(floorGeometry, this.materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.group.add(floor);
    }

    createWalls() {
        const wallGeometry = new THREE.PlaneGeometry(this.size, this.wallHeight);

        const backWall = new THREE.Mesh(wallGeometry, this.materials.wall);
        backWall.position.set(0, this.wallHeight / 2, -this.size / 2);
        this.group.add(backWall);

        const sideWall = new THREE.Mesh(wallGeometry, this.materials.wall);
        sideWall.rotation.y = Math.PI / 2;
        sideWall.position.set(-this.size / 2, this.wallHeight / 2, 0);
        this.group.add(sideWall);
    }

    getGroup() {
        return this.group;
    }

    dispose() {
        if (this.group) {
            this.scene.remove(this.group);
            this.group.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    // Dispose of texture map if it exists
                    if (child.material.map) {
                        child.material.map.dispose();
                    }
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            // Also dispose the materials directly if not attached to children
            if (this.materials.floor) this.materials.floor.dispose();
            if (this.materials.wall) this.materials.wall.dispose();
        }
    }
}

export { Room };