// js/SceneManager.js
import * as THREE from 'three';

export class SceneManager {
    constructor(color = 0x282C34) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(color); 
    }

    addObject(object) {
        this.scene.add(object);
    }

    removeObject(object) {
        this.scene.remove(object);
    }

    getScene() {
        return this.scene;
    }

    clear() {
        while (this.scene.children.length > 0) {
            const object = this.scene.children[0];
            this.removeObject(object);
            object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        }
    }
}