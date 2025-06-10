import * as THREE from 'three';

export class AudioManager {
    constructor(camera, track = "./../audio/Soundtrackv1.mp3") {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        this.soundtrack = new THREE.Audio(this.listener);
        this.soundtrack.loop = true;
        this.soundtrack.autoplay = true;
        this.audioLoader = new THREE.AudioLoader();
        this.track = track;
    }

    playTrackAudio() {
        this.loadAndPlayTrack(this.track);
    }

    loadAndPlayTrack(file = "./../audio/Soundtrackv1.mp3") {
        this.stopTrack(); 
        
        console.log(`Attempting to load audio file: ${file}`);
        
        // Add error handling and success callback
        this.audioLoader.load(
            file, 
            // Success callback
            (buffer) => {
                console.log('Audio loaded successfully');
                this.soundtrack.setBuffer(buffer);
                this.soundtrack.setLoop(true);
                this.soundtrack.play();
            },
            // Progress callback (optional)
            (progress) => {
                console.log('Loading progress:', progress);
            },
            // Error callback
            (error) => {
                console.error('Error loading audio file:', error);
                console.error('File path:', file);
                console.error('Make sure the file exists and is in a supported format (mp3, ogg, wav)');
            }
        );
    }

    stopTrack() {
        if (this.soundtrack.isPlaying) {
            this.soundtrack.stop();
        }
    }

    getListener() {
        return this.listener;
    }

    getSoundtrack() {
        return this.soundtrack;
    }

    setTrack(track) {
        this.track = track;
    }

    getTrack() {
        return this.track;
    }
}