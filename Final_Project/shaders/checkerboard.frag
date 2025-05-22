uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_tileSize;

varying vec2 vUv;

void main() {
    // Determine which "tile" the fragment is in
    vec2 checker = floor(vUv * u_tileSize);

    // If sum of checker coordinates is even, use color1, otherwise use color2
    if (mod(checker.x + checker.y, 2.0) == 0.0) {
        gl_FragColor = vec4(u_color1, 1.0);
    } else {
        gl_FragColor = vec4(u_color2, 1.0);
    }
}