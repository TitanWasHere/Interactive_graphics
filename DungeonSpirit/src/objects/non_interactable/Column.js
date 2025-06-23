import * as THREE from 'three';

export class Column extends THREE.Group {
    constructor(
        position = new THREE.Vector3(0, 0, 0),
        baseSize = 2,
        baseHeight = 1,
        shaftWidth = 2 * 3 / 5,
        shaftHeight = 13 - baseHeight * 2,
        capitalSize = baseSize,
        capitalHeight = baseHeight
    ) {
        super();

        this.stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8, metalness: 0.2 });

        this.position.copy(position);
        this.createMesh(baseSize, baseHeight, shaftWidth, shaftHeight, capitalSize, capitalHeight);
    }

    createMesh(baseSize, baseHeight, shaftWidth, shaftHeight, capitalSize, capitalHeight) {
        const baseGeo = new THREE.BoxGeometry(baseSize, baseHeight, baseSize);
        const baseMesh = new THREE.Mesh(baseGeo, this.stoneMaterial);
        baseMesh.position.y = baseHeight / 2; // Center of box at half its height
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        this.add(baseMesh);

        const shaftGeo = new THREE.BoxGeometry(shaftWidth, shaftHeight, shaftWidth);
        const shaftMesh = new THREE.Mesh(shaftGeo, this.stoneMaterial);
        shaftMesh.position.y = baseHeight + (shaftHeight / 2);
        shaftMesh.castShadow = true;
        shaftMesh.receiveShadow = true;
        this.add(shaftMesh);

        const capitalGeo = new THREE.BoxGeometry(capitalSize, capitalHeight, capitalSize);
        const capitalMesh = new THREE.Mesh(capitalGeo, this.stoneMaterial);
        capitalMesh.position.y = baseHeight + shaftHeight + (capitalHeight / 2);
        capitalMesh.castShadow = true;
        capitalMesh.receiveShadow = true;
        this.add(capitalMesh);

        this.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(this, true);
        this.boundingBox = box;
    }

    getMesh() { return this; }
    dispose() {
        this.children.forEach(child => {
            if (child.isMesh) {
                child.geometry.dispose();
                // Materials are shared, so don't dispose them here unless they are unique to this object.
            }
        });
        this.clear(); // Removes all children from the group
    }
}
