#version 300 es

precision mediump float;

in vec4 v_position;
out vec4 FragColor;
uniform vec2 u_resolution;
uniform float u_time;

// Function to interpolate between a and b
float lerp(float a, float b, float t) {
    return a + t * (b - a);
}

// Simple 2D Perlin noise function
float noise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    vec2 u = f*f*(3.0-2.0*f);
    return lerp(lerp(dot(i, vec2(127.1,311.7)), 
                     dot(i + vec2(1.0, 0.0), vec2(127.1,311.7)), u.x),
                lerp(dot(i + vec2(0.0, 1.0), vec2(127.1,311.7)), 
                     dot(i + vec2(1.0, 1.0), vec2(127.1,311.7)), u.x), u.y);
}

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // Time-dependent red value
    float red = sin(u_time + uv.x * 2.0 + noise(uv)) * 0.5 + 0.5;

    // Time-dependent green value
    float green = cos(u_time + uv.y * 2.0 + noise(uv)) * 0.5 + 0.5;

    // Time-dependent blue value
    float blue = sin(u_time + uv.y * uv.x + noise(uv)) * 0.5 + 0.5;

    // Output to screen
    FragColor = vec4(red, green, blue, 1.0);
}
