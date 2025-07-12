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
        const tubeRadius = 0.1; 


        const ellipseCurve = new THREE.EllipseCurve(
            0, 0,             
            this.width / 2, this.height / 2,
            0, 2 * Math.PI,   
            false,            
            0              
        );


        const tubeGeometry = new THREE.TubeGeometry(ellipseCurve, 64, tubeRadius, 8, false);
        const tubeMaterial = new THREE.MeshStandardMaterial({
            color: portalColor,
            emissive: portalColor,
            emissiveIntensity: 2,
            side: THREE.DoubleSide
        });
        const portalBorder = new THREE.Mesh(tubeGeometry, tubeMaterial);
        this.add(portalBorder);

        const innerShape = new THREE.Shape(ellipseCurve.getPoints(50));
        const innerGeometry = new THREE.ShapeGeometry(innerShape);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x050010,
            side: THREE.DoubleSide
        });
        const portalInterior = new THREE.Mesh(innerGeometry, innerMaterial);
        portalInterior.position.z = -0.01; 
        this.add(portalInterior);


        const wispCount = 40;
        const wispGeometry = new THREE.SphereGeometry(0.05, 8, 8); 
        const wispMaterial = new THREE.MeshStandardMaterial({
            color: portalColor,
            emissive: portalColor,
            emissiveIntensity: 1.5
        });

        for (let i = 0; i < wispCount; i++) {
            const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
            
            const radius = Math.random() * (this.width / 2 - tubeRadius);
            const angle = Math.random() * Math.PI * 2;

            wisp.position.x = Math.cos(angle) * radius;
            wisp.position.y = (Math.random() - 0.5) * (this.height - tubeRadius * 2);
            
            // Allunghiamo le sfere per farle sembrare più delle "volute"
            wisp.scale.set(
                1 + Math.random(),
                2 + Math.random() * 2,
                1 + Math.random()
            );
            wisp.rotation.z = Math.random() * Math.PI;

            this.add(wisp);

            this.wisps.push({
                mesh: wisp,
                radius: radius,
                angle: angle,
                speed: 0.5 + Math.random()
            });
        }

        const light = new THREE.PointLight(portalColor, 2, 15);
        this.add(light);
    }


    update(deltaTime = 0.3) {
        for (const wisp of this.wisps) {
            wisp.angle += wisp.speed * deltaTime;
            
            wisp.mesh.position.x = Math.cos(wisp.angle) * wisp.radius;
            wisp.mesh.position.y += Math.sin(wisp.angle * 2.5) * 0.01;
            
            const verticalBounds = (this.height / 2) - 0.2;
            if (wisp.mesh.position.y > verticalBounds || wisp.mesh.position.y < -verticalBounds) {
                 wisp.mesh.position.y = Math.max(-verticalBounds, Math.min(verticalBounds, wisp.mesh.position.y));
            }
        }
    }
}