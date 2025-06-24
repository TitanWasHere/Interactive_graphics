import * as THREE from 'three';
import { grayscale } from 'three/tsl';

export class Door extends THREE.Group {
    constructor(
        position = new THREE.Vector3(0, 0, 0), 
        width = 4,
        height = 6,
        depth = 0.1, 
        orientation = 'z', // 'x' or 'z' per indicare se è allineata lungo l'asse x o z
        doorDefinition = { texture: "../../textures/door.png", color: 0x7a5230 } 
    ) {
        super();
        this.position.copy(position);
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.orientation = orientation; 
        this.definition = doorDefinition; 

        this.boundingBox = new THREE.Box3();  // TODO (In all game)

        this.createMesh();
        this.updateBoundingBox();
    }

    createMesh() {
        

        if (this.orientation === 'z') {
            const aus = this.width;
            this.width = this.depth;
            this.depth = aus; 
        }

        const doorGeo = new THREE.BoxGeometry(this.width, this.height, this.depth);

        
        const texture = new THREE.TextureLoader().load(this.definition.texture, (texture) => {
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
               
        }, undefined, (error) => {
            console.error('Error loading door texture:', error);
        });

        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(doorGeo, mat); 
        this.mesh.position.y = this.height / 2;
        this.mesh.castShadow = true; 
        this.mesh.receiveShadow = true;
        this.add(this.mesh);
        
        

    }


    // TO IMPLEMENT 
    updateBoundingBox() {
        this.updateMatrixWorld(true);

        this.boundingBox.setFromObject(this, true);
    }



    getMesh() { return this; } 

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            if (this.mesh.material.map) this.mesh.material.map.dispose(); 
            this.mesh.material.dispose(); 
        }
        this.clear();
    }
}