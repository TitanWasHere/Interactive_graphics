import * as THREE from 'three';
import checkerboardVert from './../shaders/checkerboard.vert?raw';
import checkerboardFrag from './../shaders/checkerboard.frag?raw';

const TextureLoader = new THREE.TextureLoader();

class Room extends THREE.Group {

    constructor(floorWidth, floorHeight, wallHeight, name = "Default room", tileSize = 10, tilePrimary = 0x777777, tileSecondary = 0x555555) {
        super();

        this.defaultColor = 0x555555;
        
        this.tilePrimary = tilePrimary;
        this.tileSecondary = tileSecondary;

        this.name = name;
        this.scene = null;

        this.floorWidth = floorWidth;
        this.floorHeight = floorHeight;
        this.wallHeight = wallHeight;
        this.tileSize = tileSize;
        this.materials = {};

        this._startFloor();
        this._startWalls();

    }

    _createCheckerboard(){
        return new THREE.ShaderMaterial({
            vertexShader: checkerboardVert,
            fragmentShader: checkerboardFrag,
            uniforms: {
                uTileSize: { value: this.tileSize },
                uPrimaryColor: { value: new THREE.Color(this.tilePrimary) },
                uSecondaryColor: { value: new THREE.Color(this.tileSecondary) }
            },
            side: THREE.DoubleSide
        });
    }

    _createMaterial(config){
        if(!config)
            return new THREE.MeshStandardMaterial({
                color: this.defaultColor,
                roughness: 0.8,
                metalness: 0.1,
            });

        if(config instanceof THREE.Material){
            return config;
        }


        if(config.type == "color"){
            return new THREE.MeshStandardMaterial({
                color: config.color || this.defaultColor,
                roughness: config.roughness || 0.8,
                metalness: config.metalness || 0.1,
            });
        }else if(config.type == "texture"){
            const texture = TextureLoader.load(config.textureUrl, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(config.textureRepeatX || 3, config.textureRepeatY || 2);
                texture.colorSpace = THREE.SRGBColorSpace;
            }, undefined, (err) => {
                console.error('An error happened loading the texture:', err);
                return this._createCheckerboard();
            });

            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: config.roughness || 0.8,
                metalness: config.metalness || 0.1,
            });
        }else return this._createCheckerboard();
        
    }
    
    _createDefaultMaterials() {
        this.materials.floor = new THREE.MeshStandardMaterial({
            color: this.defaultColor,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide,
        });

        this.materials.wall = new THREE.MeshStandardMaterial({
            color: this.defaultColor,
            roughness: 0.8,
            metalness: 0.1,
        });

    }

    _startWalls(){
        const wallBackGeometry = new THREE.PlaneGeometry(this.floorHeight, this.wallHeight);
        const wallSideGeometry = new THREE.PlaneGeometry(this.floorWidth, this.wallHeight);
        const backWall = new THREE.Mesh(wallBackGeometry, this.materials.wall);
        backWall.position.set(0, this.wallHeight / 2, -this.floorHeight / 2);
        this.add(backWall);

        const sideWall = new THREE.Mesh(wallSideGeometry, this._createDefaultMaterials());
        sideWall.rotation.y = Math.PI / 2;
        sideWall.position.set(-this.floorWidth / 2, this.wallHeight / 2, 0);        
        this.add(sideWall);

        this.wallMesh = {
            back: backWall,
            side: sideWall
        };
    }

    _startFloor(){
        const floorGeometry = new THREE.PlaneGeometry(this.floorWidth, this.floorHeight);
        const floor = new THREE.Mesh(floorGeometry, this._createDefaultMaterials());
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.add(floor);

        this.floorMesh = floor;

    }

    addObject(object) {
        if (object instanceof THREE.Object3D) {
            this.add(object);
            this.scene.add(object);
        } else {
            console.error("Object must be an instance of THREE.Object3D");
        }
    }

    setFloor(config){

        if(!config.type){
            console.warn("No type specified for floor material, using default.");
            config.type = "color";
        }
        if(!this.floorMesh){
            console.warn("Floor mesh not initialized, creating default floor.");
            this._startFloor();
        }

        this._disposeMaterial(this.floorMesh.material);
        this.floorMesh.material = this._createMaterial(config);
    }

    setWall(config){
        if(!config.type){
            console.warn("No type specified for wall material, using default.");
            config.type = "color";
        }
        if(!this.wallMesh){
            console.warn("Wall mesh not initialized, creating default walls.");
            this._startWalls();
        }

        this._disposeMaterial(this.wallMesh.back.material);
        this._disposeMaterial(this.wallMesh.side.material);

        if(config.type == "texture"){
            this.wallMesh.back.material = this._createMaterial(config);
            this.wallMesh.side.material = this._createMaterial(config);
        }else{
            const material = this._createMaterial(config);
            this.wallMesh.back.material = material;
            this.wallMesh.side.material = material;
        }
    }

    _disposeMaterial(material) {
        if (!material) return;
        if (material.map) {
            material.map.dispose();
        }
        if (material instanceof THREE.ShaderMaterial && material.uniforms) {
            for (const key in material.uniforms) {
                if (material.uniforms[key].value && material.uniforms[key].value.dispose) {
                    material.uniforms[key].value.dispose();
                }
            }
        }
        material.dispose();
    }

    dispose(){
        if(this.floorMesh){
            this._disposeMaterial(this.floorMesh.material);
        }
        if(this.wallMesh){
            this._disposeMaterial(this.wallMesh.back.material);
            this._disposeMaterial(this.wallMesh.side.material);
        }
        this.clear();
    }

    
}
export { Room };