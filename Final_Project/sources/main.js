import * as THREE from 'three';
// ----------- SETUP SCENE -----------
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x063970);
scene.background = new THREE.Color(0xffffff);
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 15;

const camera = new THREE.OrthographicCamera(
    -frustumSize * aspect,
    frustumSize * aspect,
    frustumSize,
    -frustumSize,
    0.1,
    1000
);

camera.position.set(15,15,15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ----------- MATERIALS -----------
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const surfaceMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1
});

// ----------- ROOM DEFINITION -----------
const roomGroup = new THREE.Group();

const floorWidth = 8;
const floorDepth = 8;
const floorHeight = 0.5;
const floorGeometry = new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth);

const floorEdges = new THREE.EdgesGeometry(floorGeometry);
const floorLines = new THREE.LineSegments(floorEdges, lineMaterial);

floorLines.position.set.y = -floorHeight / 2;
roomGroup.add(floorLines);

const floorMesh = new THREE.Mesh(floorGeometry, surfaceMaterial);
floorMesh.position.set.y = -floorHeight / 2;
roomGroup.add(floorMesh);

const wallThickness = 0;
const wallHeight = 4.5;

const wall1Geometry = new THREE.BoxGeometry(floorWidth, wallHeight, wallThickness); // Wall 1
const wall1Edges = new THREE.EdgesGeometry(wall1Geometry);
const wall1Lines = new THREE.LineSegments(wall1Edges, lineMaterial);

wall1Lines.position.x = 0; 
wall1Lines.position.y = wallHeight / 2 + floorHeight / 2 + 0.05; 
wall1Lines.position.z = -floorDepth / 2 + wallThickness / 2; 

roomGroup.add(wall1Lines);

const wall1Mesh = new THREE.Mesh(wall1Geometry, surfaceMaterial);
wall1Mesh.position.x = 0; 
wall1Mesh.position.y = wallHeight / 2 + floorHeight / 2; 
wall1Mesh.position.z = -floorDepth / 2 + wallThickness / 2; 

roomGroup.add(wall1Mesh);

const wall2Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, floorDepth); // CHANGED FIRST AND THIRD ARGUMENTS TO CHANGE ROTATION
const wall2Edges = new THREE.EdgesGeometry(wall2Geometry);
const wall2Lines = new THREE.LineSegments(wall2Edges, lineMaterial);
wall2Lines.position.x = -floorWidth / 2 + wallThickness / 2 + 0.01; // added 0.01 to make visible the line in the middle
wall2Lines.position.y = wallHeight / 2 + floorHeight / 2 + 0.05;
wall2Lines.position.z = 0; 

roomGroup.add(wall2Lines);

const wall2Mesh = new THREE.Mesh(wall2Geometry, surfaceMaterial);
wall2Mesh.position.x = -floorWidth / 2 + wallThickness / 2 ; 
wall2Mesh.position.y = wallHeight / 2 + floorHeight / 2; 
wall2Mesh.position.z = 0; 
roomGroup.add(wall2Mesh);
roomGroup.position.y = -2;
scene.add(roomGroup);



function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    // Update the camera's frustum based on the new aspect ratio
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix(); // Update camera's projection matrix
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();