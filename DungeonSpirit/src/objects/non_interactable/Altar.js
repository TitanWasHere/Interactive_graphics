import { Torch } from "./Torch";

export class Altar extends THREE.Group {
    constructor(
        position = new THREE.Vector3(0, 0, -5),
        baseWidth = 5,
        baseDepth = 3.0,
        baseHeight = 2,
        topSlabHeight = 0.2,
        detailSize = baseDepth / 3,
        detailHeight = 0.1
    ) {
        super();
        this.darkStoneMaterial = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.8, metalness: 0.2 });
        this.stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8, metalness: 0.2 });
        this.goldMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.4, metalness: 0.6 });

        this.position.copy(position);
        this.createMesh(baseWidth, baseDepth, baseHeight, topSlabHeight, detailSize, detailHeight);
    }

    createMesh(baseWidth, baseDepth, baseHeight, topSlabHeight, detailSize, detailHeight) {

        const baseParallelogram = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
        const baseMesh = new THREE.Mesh(baseParallelogram, this.darkStoneMaterial);
        baseMesh.castShadow = true;
        baseMesh.position.y = baseHeight / 2;
        this.add(baseMesh);

        const signsX = [1, 1, -1, -1];
        const signsY = [1, -1, 1, -1];

        for(var i = 0 ; i < 4 ; i++){
            const cc = new THREE.BoxGeometry(baseWidth / 4, baseHeight, baseDepth / 5);
            const ccMesh = new THREE.Mesh(cc, this.darkStoneMaterial);
            ccMesh.position.y = baseHeight / 2;
            
            ccMesh.position.x = signsX[i] * baseWidth * 1/4;
            ccMesh.position.z = signsY[i] * baseDepth/2;

            this.add(ccMesh);
        }
        const detailGeo = new THREE.BoxGeometry(baseWidth+0.2, baseHeight, detailSize);
        const detailMesh = new THREE.Mesh(detailGeo, this.goldMaterial);
        detailMesh.position.y = baseHeight / 2 + (detailHeight / 2);
        detailMesh.castShadow = true;
        detailMesh.receiveShadow = true;
        this.add(detailMesh);

        const torchMesh = new Torch(
            new THREE.Vector3(baseWidth / 4, baseHeight, -baseDepth / 3),
            0.8
            ).getMesh();

        const torchMesh2 = new Torch(
            new THREE.Vector3(baseWidth / 4 + 0.2, baseHeight, -baseDepth / 3 + 0.2),
            0.5,
            0.1,
            0.3,
            true).getMesh();

        const torchMesh3 = new Torch(
            new THREE.Vector3(baseWidth / 3, baseHeight, -baseDepth / 3 - 0.2),
            0.65,
            0.1,
            0.3,
            true).getMesh();
        this.add(torchMesh);
        this.add(torchMesh2);
        this.add(torchMesh3);
        
    }

    getMesh() { return this; }
    dispose() {
        this.children.forEach(child => {
            if (child.isMesh) child.geometry.dispose();
        });
        this.clear();
    }
}
