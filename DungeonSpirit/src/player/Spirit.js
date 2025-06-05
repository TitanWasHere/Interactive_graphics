// src/player/Spirit.js

import * as THREE from 'three';

export class Spirit {
  constructor(initPose = new THREE.Vector3(0, 2, 0)) {
    this._createSpirit(initPose);
  }

  _createSpirit(initPose) {
    // ────── 1) CORE SPIRIT SPHERE ──────────────────────────────────────────
    const sphereGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xff2222,
      emissive: 0xaa0000,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.mesh.position.copy(initPose);

    // ────── 2) FLOATING PARAMETERS ─────────────────────────────────────────
    this.floatAmplitude = 0.2;   // ±0.2 units up/down
    this.floatSpeed     = 1.2;   // cycles per second
    this._floatOffset   = Math.random() * Math.PI * 2;

    // ────── 2’) PULSING SCALE PARAMETERS ────────────────────────────────────
    this.pulseAmplitude = 0.15;  // how much to grow/shrink from 1.0
    this.pulseSpeed     = 1.0;   // cycles per second; can match floatSpeed or differ

    // ────── 3) KEYBOARD MOVEMENT ───────────────────────────────────────────
    this.movementSpeed = 4.0;    // units per second (tweak to taste)
    this.velocity      = new THREE.Vector3();
    this.keys          = { forward: false, backward: false, left: false, right: false };
    this._bindKeyEvents();

    // ────── 4) BUBBLE PARTICLE SETUP ────────────────────────────────────────
    this.bubbleGroup = new THREE.Group();
    this.mesh.add(this.bubbleGroup);

    this._bubbleParams = {
      spawnRate:    0.05,   // 5% chance each frame
      maxBubbles:   50,
      radiusSpread: 0.8,
      riseSpeed:    1.0,    // units/sec
      lifespan:     2.0,    // seconds
    };
    this._bubbles  = [];    // holds { mesh, birth }
    this._bubbleGeo = new THREE.SphereGeometry(0.1, 8, 8);
    this._bubbleMat = new THREE.MeshStandardMaterial({
      color:       0x88ccff,
      transparent: true,
      opacity:     0.6,
      roughness:   0.2,
      metalness:   0,
      depthWrite:  false,
    });

    // ────── 5) FIRE “PIXEL” SETUP ───────────────────────────────────────────
    this.fireGroup = new THREE.Group();
    this.mesh.add(this.fireGroup);

    this._fireParameters = {
      spawnRate:    0.4,  // 8% chance each frame
      maxFire:      80,
      radiusSpread: 0.8,
      riseSpeed:    2.0,   // units/sec
      lifespan:     1.0,   // seconds
      cubeSize:     0.15,
    };
    this._fireParts = [];  // holds { mesh, birth }
    this._fireGeo   = new THREE.BoxGeometry(
      this._fireParameters.cubeSize,
      this._fireParameters.cubeSize,
      this._fireParameters.cubeSize
    );
    this._fireMats = [
      new THREE.MeshBasicMaterial({ color: 0xff3300 }),
      new THREE.MeshBasicMaterial({ color: 0xff8800 }),
      new THREE.MeshBasicMaterial({ color: 0xffff00 }),
    ];
  }

  // ────── KEYBOARD BINDINGS ─────────────────────────────────────────────────
  _bindKeyEvents() {
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup',   (e) => this._onKeyUp(e));
  }

  _onKeyDown(event) {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 's':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'a':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'd':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      default:
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 's':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'a':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'd':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      default:
        break;
    }
  }

  /**
   * Call this each frame from your animate() loop.
   * @param {Number} deltaTime   Seconds since last frame (clock.getDelta()).
   * @param {Number} elapsedTime Total elapsed clock time (clock.getElapsedTime()).
   */
  update(deltaTime, elapsedTime) {
    // ────── A) FLOATING UP/DOWN ─────────────────────────────────────────────
    const floatY =
      Math.sin((elapsedTime + this._floatOffset) * Math.PI * this.floatSpeed) *
      this.floatAmplitude;
    this.mesh.position.y = floatY + 0.7; // keep bottom of sphere ≥ 0

    // ────── A’) PULSING SCALE ────────────────────────────────────────────────
    const pulse =
      1 +
      Math.sin((elapsedTime + this._floatOffset) * Math.PI * this.pulseSpeed) *
        this.pulseAmplitude;
    this.mesh.scale.set(pulse, pulse, pulse);

    // ────── B) MOVEMENT (WASD/ARROWS ON XZ-PLANE) ────────────────────────────
    // Reset velocity every frame:
    this.velocity.set(0, 0, 0);

    if (this.keys.forward)  this.velocity.z -= 1;
    if (this.keys.backward) this.velocity.z += 1;
    if (this.keys.left)     this.velocity.x -= 1;
    if (this.keys.right)    this.velocity.x += 1;

    if (this.velocity.lengthSq() > 0) {
      this.velocity
        .normalize()
        .multiplyScalar(this.movementSpeed * deltaTime);

      // Move the mesh:
      this.mesh.position.x += this.velocity.x;
      this.mesh.position.z += this.velocity.z;

      // Rotate to face movement direction:
      const angle = Math.atan2(this.velocity.x, this.velocity.z);
      this.mesh.rotation.y = angle;
    }

    // ────── C) SPAWN + UPDATE BUBBLES ───────────────────────────────────────
    if (
      this._bubbles.length < this._bubbleParams.maxBubbles &&
      Math.random() < this._bubbleParams.spawnRate
    ) {
      const bubble = new THREE.Mesh(this._bubbleGeo, this._bubbleMat.clone());
      const angle  = Math.random() * Math.PI * 2;
      const r      = Math.random() * this._bubbleParams.radiusSpread;
      bubble.position.set(
        r * Math.cos(angle),
        -0.7 + Math.random() * 0.1,
        r * Math.sin(angle)
      );
      bubble.material.opacity = 0.6 + Math.random() * 0.2;
      this.bubbleGroup.add(bubble);
      this._bubbles.push({ mesh: bubble, birth: elapsedTime });
    }

    for (let i = this._bubbles.length - 1; i >= 0; i--) {
      const entry = this._bubbles[i];
      const age   = elapsedTime - entry.birth;
      if (age >= this._bubbleParams.lifespan) {
        this.bubbleGroup.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.mesh.material.dispose();
        this._bubbles.splice(i, 1);
        continue;
      }
      entry.mesh.position.y += this._bubbleParams.riseSpeed * deltaTime;
      const t = age / this._bubbleParams.lifespan;
      entry.mesh.material.opacity = THREE.MathUtils.lerp(0.6, 0.0, t);
      entry.mesh.scale.setScalar(THREE.MathUtils.lerp(1, 1.6, t));
    }

    // ────── D) SPAWN + UPDATE FIRE “PIXELS” ─────────────────────────────────
    if (
      this._fireParts.length < this._fireParameters.maxFire &&
      Math.random() < this._fireParameters.spawnRate
    ) {
      const matIndex = Math.floor(Math.random() * this._fireMats.length);
      const cube     = new THREE.Mesh(this._fireGeo, this._fireMats[matIndex].clone());
      const angle    = Math.random() * Math.PI * 2;
      const r        = Math.random() * this._fireParameters.radiusSpread;
      cube.position.set(
        r * Math.cos(angle),
        +0.7 * 0.9,
        r * Math.sin(angle)
      );
      this.fireGroup.add(cube);
      this._fireParts.push({ mesh: cube, birth: elapsedTime });
    }

    for (let i = this._fireParts.length - 1; i >= 0; i--) {
      const entry = this._fireParts[i];
      const age   = elapsedTime - entry.birth;
      if (age >= this._fireParameters.lifespan) {
        this.fireGroup.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.mesh.material.dispose();
        this._fireParts.splice(i, 1);
        continue;
      }
      entry.mesh.position.y += this._fireParameters.riseSpeed * deltaTime;
      const t = age / this._fireParameters.lifespan;
      entry.mesh.material.opacity = THREE.MathUtils.lerp(1.0, 0.0, t);
      const s = THREE.MathUtils.lerp(1.0, 0.2, t);
      entry.mesh.scale.setScalar(s);
    }
  }
}
