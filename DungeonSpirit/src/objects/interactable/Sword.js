import * as THREE from 'three';

export class Sword extends THREE.Group {
    constructor(position = new THREE.Vector3(0, 0, 0), swordData = null, radius = 0.1, height = 1.0) {
        super();
        this.position.copy(position);
        this.radius = radius;
        this.height = height;
        this.name = "sword";
        this.isInteractable = true; 
        this.itemData = swordData || {
            name: "Sword",
            description: "A sharp sword for combat.",
            quantity: 1,
            id: "3"
        };

        this.createMesh();
    }

    createMesh() {
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0, 
            metalness: 0.9,
            roughness: 0.4,
        });

        const hiltMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321, 
            metalness: 0.1,
            roughness: 0.8,
        });

        const bladeGeo = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32);
        const bladeMesh = new THREE.Mesh(bladeGeo, metalMaterial);
        bladeMesh.position.y = this.height / 2;
        this.add(bladeMesh);

        const tipHeight = this.height * 0.25; 
        const tipGeometry = new THREE.ConeGeometry(this.radius, tipHeight, 32);
        const tipMesh = new THREE.Mesh(tipGeometry, metalMaterial);
        tipMesh.position.y = this.height + (tipHeight / 2);
        this.add(tipMesh);

        const guardGeometry = new THREE.TorusGeometry(this.radius * 2.5, this.radius * 0.5, 16, 100);
        const guardMesh = new THREE.Mesh(guardGeometry, metalMaterial);
        guardMesh.position.y = 0;
        guardMesh.rotation.x = Math.PI / 2;
        this.add(guardMesh);

        const hiltHeight = this.height * 0.3;
        const hiltGeometry = new THREE.CylinderGeometry(this.radius * 0.8, this.radius * 0.7, hiltHeight, 32);
        const hiltMesh = new THREE.Mesh(hiltGeometry, hiltMaterial);
        hiltMesh.position.y = -hiltHeight / 2;
        this.add(hiltMesh);

        const pommelGeometry = new THREE.SphereGeometry(this.radius, 32, 16);
        const pommelMesh = new THREE.Mesh(pommelGeometry, metalMaterial);
        pommelMesh.position.y = -hiltHeight;
        this.add(pommelMesh);

    }

    getMesh() {
        return this;
    }

    onInteract(spirit) {
        if (spirit && spirit.inventory) {
            spirit.inventory.addItem(this.itemData);
            console.log(`${this.itemData.name} added to inventory!`);
            console.log("Current Inventory:", spirit.inventory.items);
        }
        
        this.isInteractable = false;
        return true; 
    }

    dispose() {
        if (this.mesh && this.mesh.geometry) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        this.clear(); 
    }
}