import * as THREE from 'three';

class RotatingCube {
    constructor(scene, position = new THREE.Vector3(0, 2, 0), size = 2) {
        this.scene = scene;
        this.mesh = null;
        this.position = position;
        this.size = size;

        this.createMesh();
    }

    createMesh() {
        // Use an IcosahedronGeometry for a gem-like appearance
        const geometry = new THREE.IcosahedronGeometry(this.size, 0); // radius, detail
        const material = new THREE.MeshStandardMaterial({
            color: 0x88CCFF, // Light blue/cyan
            roughness: 0.2,
            metalness: 0.5,
            transparent: true,
            opacity: 0.9,
            emissive: 0x002244, // Subtle glow
            emissiveIntensity: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (this.mesh) {
            this.mesh.rotation.y += 0.5 * deltaTime;
            this.mesh.rotation.x += 0.2 * deltaTime;
        }
    }

    getMesh() {
        return this.mesh;
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

export { RotatingCube };