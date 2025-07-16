import * as THREE from 'three';

export class Portal extends THREE.Object3D {

    constructor(position = new THREE.Vector3(0, 4, 0), height = 4, width = 1.8) {
        super();

        this.position.copy(position);
        this.height = height;
        this.width = width;
        
        this.wisps = [];

        this.createPortalMeshes();
    }

    createPortalMeshes() {
        const portalColor = 0x3355ff;

        const ellipseCurve = new THREE.EllipseCurve(
            0, 0,             
            this.width / 2, this.height / 2,
            0, 2 * Math.PI,   
            false,            
            0              
        );

        const innerShape = new THREE.Shape(ellipseCurve.getPoints(50));
        const innerGeometry = new THREE.ShapeGeometry(innerShape);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x050010,
            side: THREE.DoubleSide
        });
        const portalInterior = new THREE.Mesh(innerGeometry, innerMaterial);
        portalInterior.position.z = -0.01; 
        this.add(portalInterior);


        const wispCount = 60;
        const wispGeometry = new THREE.SphereGeometry(0.05, 8, 8); 
        const wispMaterial = new THREE.MeshStandardMaterial({
            color: portalColor,
            emissive: portalColor,
            emissiveIntensity: 1.5
        });

        for (let i = 0; i < wispCount; i++) {
            const wisp = new THREE.Mesh(wispGeometry, wispMaterial);

            const maxRadius = this.width / 2;
            const radius = maxRadius + 0.5;
            const angle = Math.random() * Math.PI * 2;

            wisp.position.x = Math.cos(angle) * radius;
            wisp.position.y = (Math.random() - 0.5) * this.height;

            wisp.scale.set(
                1 + Math.random(),
                2 + Math.random() * 2,
                1 + Math.random()
            );
            wisp.rotation.z = Math.random() * Math.PI;

            this.add(wisp);

            this.wisps.push({
                mesh: wisp,
                radiusX: radius * (this.width / this.height), 
                radiusY: radius, 
                angle: angle,
                speed: 0.5 + Math.random() * 0.8, 
                baseY: wisp.position.y 
            });
        }

        const light = new THREE.PointLight(portalColor, 2, 15);
        this.add(light);
    }


    update(deltaTime = 0.3) {
        for (const wisp of this.wisps) {
            wisp.angle += wisp.speed * deltaTime;
            
            const ellipseX = Math.cos(wisp.angle) * wisp.radiusX;
            const ellipseY = Math.sin(wisp.angle) * wisp.radiusY;
            
            wisp.mesh.position.x = ellipseX;
            wisp.mesh.position.y = ellipseY + wisp.baseY * 0.3; 
            
            wisp.mesh.position.z = Math.sin(wisp.angle * 3) * 0.1;
            
            const maxY = (this.height / 2) - 0.2;
            const minY = -(this.height / 2) + 0.2;
            wisp.mesh.position.y = Math.max(minY, Math.min(maxY, wisp.mesh.position.y));
            
            wisp.mesh.rotation.z += wisp.speed * deltaTime * 0.5;
        }
    }
}