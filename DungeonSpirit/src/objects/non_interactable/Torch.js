export class Torch extends THREE.Group {
    constructor(
        position = new THREE.Vector3(0, 0, 0),
        handleHeight = 1.0,
        handleSize = 0.1,
        flameSize = 0.3,
        addLight = true
    ) {
        super();
        this.position.copy(position);
        this.pointLight = null;
        this.createMesh(handleHeight, handleSize, flameSize, addLight);

        this.orange = 0xFFA500;
        this.flameOrangeMaterial = new THREE.MeshBasicMaterial({ color: this.orange });
        this.flameRedMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        this.flameYellowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        this.woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9, metalness: 0.1 });
        this.darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x5C2E0E, roughness: 0.9, metalness: 0.1 });

    }

    createMesh(handleHeight, handleSize, flameSize, addLight) {
        const handleGeo = new THREE.BoxGeometry(handleSize, handleHeight, handleSize);
        const handleMesh = new THREE.Mesh(handleGeo, this.woodMaterial);
        handleMesh.position.y = handleHeight / 2;
        handleMesh.castShadow = true;
        handleMesh.receiveShadow = true;
        this.add(handleMesh);

        const blackPin = new THREE.BoxGeometry(handleSize / 4, handleHeight / 15 , handleSize / 4);
        const blackMesh = new THREE.Mesh(blackPin, new THREE.MeshBasicMaterial({color: 0xffffff}));
        blackMesh.position.y = handleHeight + handleHeight / 15 / 2;
        this.add(blackMesh);

        if (addLight) {
            this.pointLight = new THREE.PointLight(this.orange, 2, 5);
            this.pointLight.position.set(0, handleHeight + flameSize * 0.7, 0);
            this.pointLight.castShadow = true;
            this.pointLight.shadow.mapSize.width = 256;
            this.pointLight.shadow.mapSize.height = 256;
            this.pointLight.shadow.bias = -0.01;
            this.add(this.pointLight);
        }
    }

    getMesh() { return this; }
    dispose() {
        this.children.forEach(child => {
            if (child.isMesh) {
                child.geometry.dispose();
            } else if (child.isLight) {
                child.dispose();
            }
        });
        if (this.pointLight) this.pointLight = null;
        this.clear();
    }
}
