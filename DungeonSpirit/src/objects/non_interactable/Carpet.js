import * as THREE from 'three';

export class Carpet extends THREE.Group {
    constructor(position = new THREE.Vector3(0, 0, 0), width = 5, depth = 3, carpetColor = 0x8B0000, goldColor = 0xFFD700) {
        super();
        this.position.copy(position);
        this.width = width;
        this.depth = depth;

        this.carpetColor = carpetColor;
        this.goldColor = goldColor;

        this.createMesh();   
    }

    createMesh(){
        const carpetMaterial = new THREE.MeshStandardMaterial({ color: this.carpetColor, roughness: 1, metalness: 0 });
        const goldMaterial = new THREE.MeshStandardMaterial({ color: this.goldColor, roughness: 0.4, metalness: 0.6 });

        const carpetGeo = new THREE.BoxGeometry(this.width, 0.01, this.depth);
        const goldGeo = new THREE.BoxGeometry(this.width, 0.01, this.depth * (1 / 20));

        const carpetMesh = new THREE.Mesh(carpetGeo, carpetMaterial);
        carpetMesh.position.y = 0.05; 
        carpetMesh.castShadow = true;
        //carpetMesh.receiveShadow = true;

        this.add(carpetMesh);

        const goldMesh1 = new THREE.Mesh(goldGeo, goldMaterial);
        goldMesh1.position.set(0, 0.08, this.depth / 2 - 4*(1/12));
        goldMesh1.castShadow = true;
        goldMesh1.receiveShadow = true;
        this.add(goldMesh1);

        const goldMesh2 = new THREE.Mesh(goldGeo, goldMaterial);
        goldMesh2.position.set(0, 0.08, -this.depth / 2 + 4*(1/12));
        goldMesh2.castShadow = true;
        goldMesh2.receiveShadow = true;
        this.add(goldMesh2);
        
    }

    getMesh() {
        return this;
    }

    dispose() {
        this.children.forEach(child => {
            if (child.isMesh) {
                child.geometry.dispose();
            }
        });
        this.clear();
    }
}