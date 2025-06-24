// Door.js
import * as THREE from 'three';

export class Door extends THREE.Group {
    constructor(
        position = new THREE.Vector3(0, 0, 0), // Posizione del centro della base della porta
        width = 1.2,
        height = 2.2,
        depth = 0.1, // Sottile per una porta
        orientation = 'z', // 'x' or 'z' per indicare se è allineata lungo l'asse x o z
        doorDefinition = {} // Oggetto per memorizzare dati extra come targetRoom, targetSpawnPoint
    ) {
        super();
        this.position.copy(position);
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.orientation = orientation; // 'x' o 'z'
        this.definition = doorDefinition; // { name: 'Door to X', targetRoom: 'room_y', targetSpawnPoint: new THREE.Vector3(...), interactable: true/false, toUnlock: null/'key_id' }

        this.boundingBox = new THREE.Box3(); // Bounding box per l'interazione, non necessariamente per la collisione fisica se la si può attraversare.
                                            // Se la porta deve bloccare, allora questa BB è anche per la collisione.

        this.createMesh();
        this.updateBoundingBox();
    }

    createMesh() {
        let doorGeo;
        // La geometria della porta viene creata in modo che la sua base sia a y=0 locale
        // e il suo centro sia a x=0, z=0 locale.
        if (this.orientation === 'x') { // Porta allineata lungo l'asse X (larga sull'asse X)
            doorGeo = new THREE.BoxGeometry(this.width, this.height, this.depth);
        } else { // Porta allineata lungo l'asse Z (larga sull'asse Z, default)
            doorGeo = new THREE.BoxGeometry(this.depth, this.height, this.width);
        }

        // Usa un materiale appropriato per la porta
        const material = new THREE.MeshStandardMaterial({
            color: this.definition.color || 0x7a5230, // Colore di default se non specificato
            roughness: 0.8,
            map: this.definition.texture || null // Permetti una texture opzionale
        });

        this.mesh = new THREE.Mesh(doorGeo, material); // Salva un riferimento alla mesh principale della porta
        this.mesh.position.y = this.height / 2; // Posiziona la base della porta a y=0
        this.mesh.castShadow = true; // Dipende se vuoi che le porte proiettino ombre
        this.mesh.receiveShadow = true;
        this.add(this.mesh);

        // Potresti aggiungere una maniglia o altri dettagli come mesh figlie qui
    }

    updateBoundingBox() {
        this.updateMatrixWorld(true);
        // Per l'interazione, potremmo voler un bounding box leggermente più grande o diverso
        // dalla geometria visiva, ma per ora usiamo l'oggetto stesso.
        this.boundingBox.setFromObject(this, true);
    }

    // Metodo per aggiornare l'aspetto o lo stato (es. aperta/chiusa, colore)
    setState(newState) {
        if (newState === 'unlocked' && this.mesh) {
            this.mesh.material.color.set(0x8fbc8f); // Esempio: verde chiaro se sbloccata
            this.definition.interactable = true;
            this.definition.toUnlock = null;
        }
        // Aggiungi altre logiche di stato se necessario
    }


    getMesh() { return this; } // Il gruppo stesso è la porta

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            // Non eliminare il materiale se potrebbe essere condiviso o se è standard
            if (this.mesh.material.map) this.mesh.material.map.dispose(); // Elimina la texture se presente e unica
            this.mesh.material.dispose(); // Elimina il materiale se unico per questa porta
        }
        this.clear();
    }
}