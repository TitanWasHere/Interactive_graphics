import * as THREE from 'three';

export class AudioManager {
    constructor(camera, track = "./src/audio/Soundtrackv1.mp3") {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        this.soundtrack = new THREE.Audio(this.listener);
        this.soundtrack.loop = true;
        this.soundtrack.autoplay = false;
        this.audioLoader = new THREE.AudioLoader();
        this.track = track;
        this.volume = 0.2;
    }

    playTrackAudio() {
        this.loadAndPlayTrack(this.track);
    }

    loadAndPlayTrack(file = "./src/audio/Soundtrackv1.mp3") {
        this.stopTrack(); 
        
        console.log(`Attempting to load audio file: ${file}`);
        
        this.audioLoader.load(
            file,           
            (buffer) => {
                console.log('Audio loaded successfully');
                this.soundtrack.setBuffer(buffer);
                this.soundtrack.setLoop(true);
                this.soundtrack.setVolume(this.volume);
                this.soundtrack.play();
            },
            undefined,
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
    }    setTrack(track) {
        this.track = track;
    }

    getTrack() {
        return this.track;
    }

    togglePlayPause() {
        if (this.soundtrack.isPlaying) {
            this.stopTrack();
            console.log('Audio paused');
        } else {
            this.playTrackAudio();
            console.log('Audio playing');
        }
    }   
    isPlaying() {
        return this.soundtrack.isPlaying;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume)); 
        if (this.soundtrack.getVolume !== undefined) {
            this.soundtrack.setVolume(this.volume);
        }
        console.log(`Volume set to: ${this.volume}`);
    }

    // Get current volume
    getVolume() {
        return this.volume;
    }
}