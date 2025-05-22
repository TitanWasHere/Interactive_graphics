let varFloorWidth = 8;
let varFloorDepth = 8;
let varFloorHeight = 0.5;
let varWallThickness = 0.1;
let varWallHeight = 4.5;


export function createRoom(floorTopMaterial, floorSidesMaterial, wallMaterial, lineMaterial) {
    const roomGroup = new THREE.Group();

    const floorWidth = varFloorWidth;
    const floorDepth = varFloorDepth;
    const floorHeight = varFloorHeight;
    const wallThickness = varWallThickness;
    const wallHeight = varWallHeight;

    const floorGeometry = new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth);

    // Define the material array for the floor mesh
    // Indices: +X, -X, +Y, -Y, +Z, -Z
    const floorMaterials = [
        floorSidesMaterial, // Right (+X)
        floorSidesMaterial, // Left (-X)
        floorTopMaterial,   // Top (+Y)
        floorSidesMaterial, // Bottom (-Y)
        floorSidesMaterial, // Front (+Z)
        floorSidesMaterial  // Back (-Z)
    ];

    const floorEdges = new THREE.EdgesGeometry(floorGeometry);
    const floorLines = new THREE.LineSegments(floorEdges, lineMaterial);
    floorLines.position.y = -floorHeight / 2;
    roomGroup.add(floorLines);


    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterials); 
    floorMesh.position.y = -floorHeight / 2;
    roomGroup.add(floorMesh);

    // Wall 1 (along Z axis)
    const wall1Geometry = new THREE.BoxGeometry(floorWidth, wallHeight, wallThickness);
    const wall1Edges = new THREE.EdgesGeometry(wall1Geometry);
    const wall1Lines = new THREE.LineSegments(wall1Edges, lineMaterial);
    wall1Lines.position.x = 0;
    wall1Lines.position.y = wallHeight / 2;
    wall1Lines.position.z = -floorDepth / 2 + wallThickness / 2;
    roomGroup.add(wall1Lines);

    const wall1Mesh = new THREE.Mesh(wall1Geometry, wallMaterial);
    wall1Mesh.position.x = 0;
    wall1Mesh.position.y = wallHeight / 2;
    wall1Mesh.position.z = -floorDepth / 2 + wallThickness / 2;
    roomGroup.add(wall1Mesh);

    // Wall 2 (along X axis)
    const wall2Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, floorDepth);
    const wall2Edges = new THREE.EdgesGeometry(wall2Geometry);
    const wall2Lines = new THREE.LineSegments(wall2Edges, lineMaterial);
    wall2Lines.position.x = -floorWidth / 2 + wallThickness / 2;
    wall2Lines.position.y = wallHeight / 2 ;
    wall2Lines.position.z = 0;
    roomGroup.add(wall2Lines);

    const wall2Mesh = new THREE.Mesh(wall2Geometry, wallMaterial);
    wall2Mesh.position.x = -floorWidth / 2 + wallThickness / 2;
    wall2Mesh.position.y = wallHeight / 2;
    wall2Mesh.position.z = 0;
    roomGroup.add(wall2Mesh);


    return {
        group: roomGroup,
        floorMesh: floorMesh,
        wall1Mesh: wall1Mesh,
        wall2Mesh: wall2Mesh
    };
}

export const ROOM_CONSTANTS = {
    floorWidth: varFloorWidth,
    floorDepth: varFloorDepth,
    floorHeight: varFloorHeight,
    wallThickness: varWallThickness,
    wallHeight: varWallHeight,
};