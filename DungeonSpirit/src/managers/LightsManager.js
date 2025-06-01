import * as THREE from 'three';

export class LightsManager {
    constructor(scene, renderer){
        this.scene = scene;
        this.renderer = renderer;

        this.cachedLights = {};
        this.currentRoomName = null;

        this.renderer.shadowMap.enabled = true; 
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

    }

    _createLightsInstance(config) {
        let light;
        switch (config.type) {
            case 'AmbientLight':
                light = new THREE.AmbientLight(config.color, config.intensity);
                break;
            case 'DirectionalLight':
                light = new THREE.DirectionalLight(config.color, config.intensity);
                light.castShadow = true;
                light.shadow.mapSize.width = config.shadowCamera.mapSize.width;
                light.shadow.mapSize.height = config.shadowCamera.mapSize.height;
                break;
            case 'PointLight':
                light = new THREE.PointLight(config.color, config.intensity, config.distance);
                light.castShadow = true;
                light.shadow.mapSize.width = config.shadowCamera.mapSize.width;
                light.shadow.mapSize.height = config.shadowCamera.mapSize.height;
                break;
            case 'SpotLight':
                light = new THREE.SpotLight(config.color, config.intensity, config.distance, config.angle, config.penumbra, config.decay);
                light.castShadow = true;
                light.shadow.mapSize.width = config.shadowCamera.mapSize.width;
                light.shadow.mapSize.height = config.shadowCamera.mapSize.height;
                break;
            case 'HemisphereLight':
                light = new THREE.HemisphereLight(config.skyColor, config.groundColor, config.intensity);
                if (config.position) {
                    light.position.set(config.position.x, config.position.y, config.position.z);
                }
                break;
            default:
                console.warn(`Unknown light type: ${config.type}`);
                return null;
        }
        if (config.position) {
            light.position.set(config.position.x, config.position.y, config.position.z);
        }
        return light;
    }

    setRoomLights(roomName, lightsConfig) {
        if (this.currentRoomName === roomName) return; // Already set for this room

        if(this.currentRoomName && this.cachedLights[this.currentRoomName]) {
            for(let light of this.cachedLights[this.currentRoomName]) {
                light.visible = false; // Hide lights of the previous room
            }
        }

        if(!this.cachedLights[roomName]) {
            this.cachedLights[roomName] = [];
            for(let config of lightsConfig) {
                let light = this._createLightsInstance(config);
                if (light) {
                    this.cachedLights[roomName].push(light);
                    this.scene.add(light);
                } else {
                    console.warn(`Failed to create light with config: ${JSON.stringify(config)}`);
                }
            }
            console.log(`Lights for room "${roomName}" initialized.`);
        }

        for(let light of this.cachedLights[roomName]) {
            light.visible = true;
        }
        this.currentRoomName = roomName;
        console.log(`Lights for room "${roomName}" set.`);

    }

    getCurrentActiveLights() {
        if (this.currentRoomName && this.cachedLights[this.currentRoomName]) {
            return this.cachedLights[this.currentRoomName];
        }
        return [];
    }

    disposeRoomLights(roomName) {
        if (this.cachedLights[roomName]) {
            this.cachedLights[roomName].forEach(light => {
                this.scene.remove(light);
                light.dispose();
            });
            delete this.cachedLights[roomName];
            console.log(`Lights for room "${roomName}" disposed.`);
        }
        if (this.currentRoomName === roomName) {
            this.currentRoomName = null;
        }
    }
    disposeAllLights() {
        for (let roomName in this.cachedLights) {
            this.disposeRoomLights(roomName);
        }
        this.currentRoomName = null;
        console.log("All lights disposed.");
    }

}