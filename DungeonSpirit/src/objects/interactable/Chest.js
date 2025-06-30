export class Chest extends THREE.Group {
    constructor(
        position = new THREE.Vector3(0, 0, 0),
        chestWidth = 3.0,
        chestTotalHeight = 2,
        chestDepth = 2,
        lidHeightRatio = 0.3
    ) {
        super();
        this.position.copy(position);
        this.lidGroup = null;
        this.isOpen = false;

        this.isInteractable = true; 

        this.chestWidth = chestWidth;
        this.chestBodyHeight = chestTotalHeight * (1 - lidHeightRatio);
        this.lidHeight = chestTotalHeight * lidHeightRatio;
        this.chestDepth = chestDepth;

        this.woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9, metalness: 0.1 });
        this.darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x5C2E0E, roughness: 0.9, metalness: 0.1 });
        this.metalMaterial = new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 0.5, metalness: 0.8 });
        this.goldMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.4, metalness: 0.6 });

        this.createMesh();
        this.toggle();
        this.typeInteraction = this.isOpen ? "close" : "open";
        this.name = "chest";
    }

    createMesh() {
        // Chest Body
        const bodyGeo = new THREE.BoxGeometry(this.chestWidth, this.chestBodyHeight, this.chestDepth);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.woodMaterial);
        bodyMesh.position.y = this.chestBodyHeight / 2;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.add(bodyMesh);

        // Metal Bands for Body
        const bandThickness = 0.05;
        const bandGeo = new THREE.BoxGeometry(this.chestWidth + 0.02, bandThickness, this.chestDepth + 0.02);

        const band1Mesh = new THREE.Mesh(bandGeo, this.metalMaterial);
        band1Mesh.position.y = this.chestBodyHeight * 0.25; 
        band1Mesh.castShadow = true;
        band1Mesh.receiveShadow = true;
        this.add(band1Mesh);

        const band2Mesh = new THREE.Mesh(bandGeo, this.metalMaterial);
        band2Mesh.position.y = this.chestBodyHeight * 0.75; 
        band2Mesh.castShadow = true;
        band2Mesh.receiveShadow = true;
        this.add(band2Mesh);

        this.lidGroup = new THREE.Group();
        this.lidGroup.position.set(0, this.chestBodyHeight, -this.chestDepth / 2 + this.lidHeight / 2); 
        this.add(this.lidGroup);

        const lidGeo = new THREE.BoxGeometry(this.chestWidth, this.lidHeight, this.chestDepth);
        const lidMesh = new THREE.Mesh(lidGeo, this.darkWoodMaterial);
        lidMesh.position.y = 0; 
        lidMesh.position.z = this.chestDepth / 2 - this.lidHeight / 2;
        lidMesh.castShadow = true;
        lidMesh.receiveShadow = true;
        this.lidGroup.add(lidMesh);

        // Lid Bands (Simplified)
        const lidBandGeo = new THREE.BoxGeometry(this.chestWidth + 0.02, bandThickness, this.lidHeight * 0.8); 
        const lidBandMesh1 = new THREE.Mesh(lidBandGeo, this.metalMaterial);
        lidBandMesh1.position.z = (this.chestDepth / 2 - this.lidHeight / 2) + this.chestDepth * 0.2; 
        lidBandMesh1.castShadow = true;
        this.lidGroup.add(lidBandMesh1);

        const lidBandMesh2 = new THREE.Mesh(lidBandGeo, this.metalMaterial);
        lidBandMesh2.position.z = (this.chestDepth / 2 - this.lidHeight / 2) - this.chestDepth * 0.2; 
        lidBandMesh2.castShadow = true;
        this.lidGroup.add(lidBandMesh2);


        // Lock (on the main body)
        const lockGeo = new THREE.BoxGeometry(0.4, 0.3, 0.1);
        const lockMesh = new THREE.Mesh(lockGeo, this.goldMaterial);
        lockMesh.position.set(0, this.chestBodyHeight * 0.7, this.chestDepth / 2 + 0.05 / 2);
        lockMesh.castShadow = true;
        this.add(lockMesh);
    }

    open() {
        if (!this.isOpen && this.lidGroup) {
            this.lidGroup.rotation.x = -Math.PI / 1.5;
            this.isOpen = true;
        }
    }

    close() {
        if (this.isOpen && this.lidGroup) {
            this.lidGroup.rotation.x = 0;
            this.isOpen = false;
        }
    }
    toggle() { 
        (this.isOpen) ? this.close() : this.open(); 
        this.typeInteraction = this.isOpen ? "close" : "open";
    }

    getMesh() { return this; }
    dispose() {
        this.children.forEach(child => {
            if (child.isMesh) child.geometry.dispose();
            if (child instanceof THREE.Group) { // For the lidGroup
                 child.children.forEach(c => {
                    if (c.isMesh) c.geometry.dispose();
                 });
                 child.clear();
            }
        });
        if (this.lidGroup) this.lidGroup = null;
        this.clear();
    }
}
