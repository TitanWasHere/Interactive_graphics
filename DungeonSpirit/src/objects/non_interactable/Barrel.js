import * as THREE from 'three';

export class Barrel extends THREE.Group {
    constructor(position = new THREE.Vector3(-5, 0, 0), radius = 2, height = 4.0) {
        super();
        this.position.copy(position);
        this.radius = radius;
        this.height = height;

        // Define colors
        this.Colors = {
            woodLight: 0x8B4513,
            metal: 0x555555
        };

        this.createMesh();
    }

    

    createMesh() {
        const addCylinder = (radiusTop, radiusBottom, height, radialSegments, x, y, z, material, group, unit = 0.5) => {
            const geometry = new THREE.CylinderGeometry(radiusTop * unit, radiusBottom * unit, height * unit, radialSegments);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x * unit, y * unit, z * unit);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            return mesh;
        };
        const barrelGroup = new THREE.Group();
        barrelGroup.position.set(this.position);

        // Corpo del barile
        addCylinder(this.radius, this.radius, this.height, 8, 0, this.height / 2, 0, new THREE.MeshStandardMaterial({ color: 0xD2A679 }), this);

        // Cerchi metallici
        addCylinder(this.radius + 0.1, this.radius + 0.1, this.height / 10, 8, 0, this.height / 2 + (this.height / 3), 0, new THREE.MeshStandardMaterial({ color: 0xA9A9A9 }), this); // Basso
        addCylinder(this.radius + 0.1, this.radius + 0.1, this.height / 10, 8, 0, this.height / 6, 0, new THREE.MeshStandardMaterial({ color: 0xA9A9A9 }), this); // Alto


        
    }
}