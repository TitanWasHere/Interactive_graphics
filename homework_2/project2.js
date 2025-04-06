

function multiplyMatrices(A, B) {
	let result = [];

	for (let i = 0; i < 3; i++) {
		result[i] = [];
		for (let j = 0; j < 3; j++) {
			result[i][j] = 0;
			for (let k = 0; k < 3; k++) {
				result[i][j] += A[i][k] * B[k][j];
			}
		}
	}

	return result;
}

function GetTransform( positionX, positionY, rotation, scale )
{
	const rotationRad = rotation * Math.PI / 180.0;
	const cosTheta = Math.cos(rotationRad);
	const sinTheta = Math.sin(rotationRad);

	let scaleMatrix = [
		[scale, 0, 0],
		[0, scale, 0],
		[0, 0, 1]
	];
	let rotationMatrix = [
		[cosTheta, -sinTheta, 0],
		[sinTheta, cosTheta, 0],
		[0, 0, 1]
	];
	let translationMatrix = [
		[1, 0, positionX],
		[0, 1, positionY],
		[0, 0, 1]
	];

	let rotationScaleMatrix = multiplyMatrices(rotationMatrix, scaleMatrix);
	let finalMatrix = multiplyMatrices(translationMatrix, rotationScaleMatrix);

	return Array (
		finalMatrix[0][0], finalMatrix[1][0], finalMatrix[2][0],
		finalMatrix[0][1], finalMatrix[1][1], finalMatrix[2][1],
		finalMatrix[0][2], finalMatrix[1][2], finalMatrix[2][2]
	);

}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{

	return Array (
        trans2[0] * trans1[0] + trans2[3] * trans1[1] + trans2[6] * trans1[2],
        trans2[1] * trans1[0] + trans2[4] * trans1[1] + trans2[7] * trans1[2],
        trans2[2] * trans1[0] + trans2[5] * trans1[1] + trans2[8] * trans1[2],
        
        trans2[0] * trans1[3] + trans2[3] * trans1[4] + trans2[6] * trans1[5],
        trans2[1] * trans1[3] + trans2[4] * trans1[4] + trans2[7] * trans1[5],
        trans2[2] * trans1[3] + trans2[5] * trans1[4] + trans2[8] * trans1[5],
        
        trans2[0] * trans1[6] + trans2[3] * trans1[7] + trans2[6] * trans1[8],
        trans2[1] * trans1[6] + trans2[4] * trans1[7] + trans2[7] * trans1[8],
        trans2[2] * trans1[6] + trans2[5] * trans1[7] + trans2[8] * trans1[8]
	);

}
