export class GoldMountain extends THREE.Group {
    constructor(position = new THREE.Vector3(0, 0, 0), radius = 0.5, height = 0.3) {
        super();
        this.position.copy(position);
        this.radius = radius;
        this.height = height;

        this.createMesh();
    }

    createMesh() {
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700, 
            roughness: 0.4, 
            metalness: 0.6
        });

        const singleCoint = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32);
        const mountainMesh = new THREE.Mesh(singleCoint, goldMaterial);
        mountainMesh.position.y = this.height / 2;
        mountainMesh.castShadow = true;
        mountainMesh.receiveShadow = true;
        
        for (let i = 0; i < 10; i++) {
            const offsetX = (Math.random() - 0.5) * this.radius * 2;
            const offsetZ = (Math.random() - 0.5) * this.radius * 2;
            const offsetY = Math.random() * this.height;
            const coinMesh = mountainMesh.clone();
            coinMesh.position.set(this.position.x + offsetX, this.position.y + offsetY, this.position.z + offsetZ);
            coinMesh.scale.setScalar(Math.random() * 0.5 + 0.5 ); // Random scale between 0.5 and 1.0
            coinMesh.castShadow = true;
            coinMesh.receiveShadow = true;
            this.add(coinMesh);
        }

    }
}