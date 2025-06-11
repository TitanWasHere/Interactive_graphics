import * as THREE from 'three';
import checkerboardVert from './../shaders/checkerboard.vert?raw';
import checkerboardFrag from './../shaders/checkerboard.frag?raw';

const TextureLoader = new THREE.TextureLoader();

class Room extends THREE.Group {
    

    constructor(floorWidth, floorHeight, wallHeight, name = "Default room", doorConfig = null, tileSize = 10, tilePrimary = 0x777777, tileSecondary = 0x555555) {
        super();

        this.door_visual_height = 0.2; 
        this.door_visual_thickness = 0.1;
        this.door_visual_y_offset = 0.1; 

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
        this.doors = [];

        this._startFloor();
        this._startWalls();
        this._createDoors(doorConfig);
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

    _createDoors(doorConfig) {
        if(!doorConfig || Object.keys(doorConfig).length === 0) {
            return;
        }

        // Position doors on the floor surface instead of walls
        const doorYPosition = 0.01; // Just slightly above the floor to avoid z-fighting

        for(let doorDef in doorConfig) {
            doorDef = doorConfig[doorDef];
            console.log(`Creating door with definition: ${doorDef}`);
            
            // Create door geometry as a horizontal plane (on the floor)
            const doorGeometry = new THREE.PlaneGeometry(doorDef.width, doorDef.height || 2); // Use height from config or default
            const doorMaterial = new THREE.MeshBasicMaterial({
                color: doorDef.interactable ? 0x00ff00 : 0xff0000, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8 // Make it slightly transparent so it's clearly a floor indicator
            });
            const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

            // Rotate the door to lay flat on the floor
            doorMesh.rotation.x = -Math.PI / 2; // Rotate 90 degrees to lay flat

            switch(doorDef.wallSide) {
                case 'back':
                    doorMesh.position.set(
                        doorDef.offset || 0,
                        doorYPosition,
                        -this.floorHeight / 2 + (doorDef.height || 2) / 2 // Position near back wall
                    );
                    break;
                    
                case 'front':
                    doorMesh.position.set(
                        doorDef.offset || 0,
                        doorYPosition,
                        this.floorHeight / 2 - (doorDef.height || 2) / 2 // Position near front wall
                    );
                    break;
                    
                case 'left':
                    doorMesh.position.set(
                        -this.floorWidth / 2 + (doorDef.height || 2) / 2, // Position near left wall
                        doorYPosition,
                        doorDef.offset || 0
                    );
                    break;
                    
                case 'right':
                    doorMesh.position.set(
                        this.floorWidth / 2 - (doorDef.height || 2) / 2, // Position near right wall
                        doorYPosition,
                        doorDef.offset || 0
                    );
                    break;
                    
                default:
                    console.warn(`Unknown wallSide: ${doorDef.wallSide} for a door.`);
                    doorGeometry.dispose();
                    doorMaterial.dispose(); 
                    return; 
            }
            
            this.doors.push({
                mesh: doorMesh,
                definition: doorDef
            });
            this.add(doorMesh);
        }
    }

    
    _createDoors(doorConfig) {
        if(!doorConfig || Object.keys(doorConfig).length === 0) {
            return;
        }

        // Position doors on the floor surface instead of walls
        const doorYPosition = 0.01; // Just slightly above the floor to avoid z-fighting

        for(let doorDef in doorConfig) {
            doorDef = doorConfig[doorDef];
            console.log(`Creating door with definition: ${doorDef}`);
            
            // Create door geometry as a horizontal plane (on the floor)
            const doorGeometry = new THREE.PlaneGeometry(doorDef.height, doorDef.width); 
            const doorMaterial = new THREE.MeshBasicMaterial({
                color: doorDef.interactable ? 0x00ff00 : 0xff0000, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8 
            });
            const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

            // Rotate the door to lay flat on the floor
            doorMesh.rotation.x = -Math.PI / 2; // Rotate 90 degrees to lay flat

            switch(doorDef.wallSide) {
                case 'back':
                    doorMesh.position.set(
                        0,
                        doorYPosition,
                        -this.floorHeight / 2 + (doorDef.height || 2) / 2 // Position near back wall
                    );
                    break;
                    
                case 'front':
                    doorMesh.position.set(
                        0,
                        doorYPosition,
                        this.floorHeight / 2 - (doorDef.height || 2) / 2 // Position near front wall
                    );
                    break;
                    
                case 'left':
                    doorMesh.position.set(
                        -this.floorWidth / 2 + doorDef.height, // Position near left wall
                        doorYPosition,
                        0
                    );
                    break;
                    
                case 'right':
                    doorMesh.position.set(
                        this.floorWidth / 2 - doorDef.height, // Position near right wall
                        doorYPosition,
                        0
                    );
                    break;
                    
                default:
                    console.warn(`Unknown wallSide: ${doorDef.wallSide} for a door.`);
                    doorGeometry.dispose();
                    doorMaterial.dispose(); 
                    return; 
            }
            
            this.doors.push({
                mesh: doorMesh,
                definition: doorDef
            });
            this.add(doorMesh);
        }
    }
    

    _createMaterial(config){
        //console.log("Creating material with config:", config);
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
            //this.scene.add(object);
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
    getLightsDefinition(){
        return [];
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

    setInteractableDoor(doorName){
        if(!this.doors || this.doors.length === 0) {
            console.warn("No doors defined in this room.");
            return;
        }
        if(!doorName || typeof doorName !== 'string') {
            console.warn("No door name provided to set as interactable.");
            return;
        }

        if(doorName != "left" && doorName != "right" && doorName != "back" && doorName != "front") {
            console.warn(`Invalid door name: ${doorName}. Valid names are 'left', 'right', 'back', 'front'.`);
            return;
        }

        const door = this.doors.find(d => d.definition && d.definition.wallSide === doorName);
        if(!door) {
            console.warn(`No door found with name: ${doorName}`);
            return;
        }
        door.mesh.material.color.set(0x00ff00);
        door.mesh.material.transparent = true;
        door.mesh.material.opacity = 0.8; 
        door.definition.interactable = true; 
    }

    getInteractableDoors() {
        return this.doors.filter(door => door.definition);
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
            this.remove(this.floorMesh);
            this.floorMesh.geometry.dispose();
        }
        if(this.wallMesh){
            this._disposeMaterial(this.wallMesh.back.material);
            this._disposeMaterial(this.wallMesh.side.material);
            this.remove(this.wallMesh.back);
            this.remove(this.wallMesh.side);
            this.wallMesh.back.geometry.dispose();
            this.wallMesh.side.geometry.dispose();
        }
        this.clear();
    }

    getDimensions() {
        return {
            floorWidth: this.floorWidth,
            floorHeight: this.floorHeight,
            wallHeight: this.wallHeight
        };
    }
}
export { Room };