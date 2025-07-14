
import * as THREE from 'three';

export class DummyObject extends THREE.Group{
    constructor(position, name, interaction, onPortalActivate = null){
        super();
        this.name = name;
        this.typeInteraction = interaction;
        this.isInteractable = true; 
        this.position.copy(position);
        this.onPortalActivate = onPortalActivate; 
        this.createMesh();
    }

    createMesh(){
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0.5, 0);
        this.add(this.mesh);
    }

    toggle(){
        if (this.name === "Portal" && this.onPortalActivate) {
            this.isInteractable = false; 
            this.onPortalActivate();
        }
    }

    getMesh(){
        return this;
    }
}