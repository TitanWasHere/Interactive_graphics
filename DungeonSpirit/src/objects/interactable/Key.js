import * as THREE from 'three';
import { Player } from '../../player/Player';

export class Key extends THREE.Group {

    constructor(position = new THREE.Vector3(0, 0, 0), keyData = null, radius = 0.1, height = 0.3) {
        super();
        this.position.copy(position);
        this.radius = radius;
        this.height = height;

        this.isInteractable = true; 
        this.itemData = keyData || {
            name: "Key",
            description: "A golden key that unlocks a door.",
            quantity: 1,
            id: "1"
        };


        this.createMesh();
    }

    createMesh() {
        const keyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.4, metalness: 0.6 });

        const keyGeo = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
        const keyMesh = new THREE.Mesh(keyGeo, keyMaterial);
        keyMesh.position.y = this.height / 2;
        keyMesh.castShadow = true;
        keyMesh.receiveShadow = true;
        this.add(keyMesh);

        const headGeo = new THREE.SphereGeometry(this.radius * 1.5, 16, 16);
        const headMesh = new THREE.Mesh(headGeo, keyMaterial);
        headMesh.position.y = this.height + this.radius * 0.75;
        headMesh.castShadow = true;
        headMesh.receiveShadow = true;
        this.add(headMesh);

        const teethGeo = new THREE.BoxGeometry(this.radius * 0.5, this.radius * 0.5, this.height * 0.5);
        const teethMesh = new THREE.Mesh(teethGeo, keyMaterial);
        teethMesh.position.set(0, this.height / 2, this.radius);
        teethMesh.castShadow = true;
        teethMesh.receiveShadow = true;
        this.add(teethMesh);
        
        const teethGeo2 = new THREE.BoxGeometry(this.radius * 0.5, this.radius * 0.5, this.height * 0.5);
        const teethMesh2 = new THREE.Mesh(teethGeo2, keyMaterial);
        teethMesh2.position.set(0, this.height / 8, this.radius); 
        teethMesh2.castShadow = true;
        teethMesh2.receiveShadow = true;

        this.add(teethMesh2);
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
        return true; // Indica che l'oggetto deve essere rimosso
    }

    dispose() {
        if (this.mesh && this.mesh.geometry) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        this.clear(); 
    }


}