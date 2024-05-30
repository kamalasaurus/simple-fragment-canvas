#version 300 es

precision mediump float;

in vec4 v_position;
in vec2 v_texcoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_prevFrame;

out vec4 FragColor;

// // Function to interpolate between a and b
// float lerp(float a, float b, float t) {
//     return a + t * (b - a);
// }

// // Simple 2D Perlin noise function
// float noise(vec2 uv) {
//     vec2 i = floor(uv);
//     vec2 f = fract(uv);
//     vec2 u = f*f*(3.0-2.0*f);
//     return lerp(lerp(dot(i, vec2(127.1,311.7)), 
//                      dot(i + vec2(1.0, 0.0), vec2(127.1,311.7)), u.x),
//                 lerp(dot(i + vec2(0.0, 1.0), vec2(127.1,311.7)), 
//                      dot(i + vec2(1.0, 1.0), vec2(127.1,311.7)), u.x), u.y);
// }

// void main() {
//     // Normalized pixel coordinates (from 0 to 1)
//     vec2 uv = gl_FragCoord.xy / u_resolution;
//     // Get previous frame color
//     vec4 prevColor = texture(u_prevFrame, v_texCoord);
//     // Time-dependent red value
//     float red = sin(u_time + uv.x * 2.0 + noise(uv)) * 0.5 + 0.5;

//     // Time-dependent green value
//     float green = cos(u_time + uv.y * 2.0 + noise(uv)) * 0.5 + 0.5;

//     // Time-dependent blue value
//     float blue = sin(u_time + uv.y * uv.x + noise(uv)) * 0.5 + 0.5;

//     // Output to screen
//     FragColor = vec4(red, green, blue, 1.0);
// }

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

//https://www.shadertoy.com/view/mtyGWy
void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i*.4 + u_time*.4);

        d = sin(d*8. + u_time)/8.;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }
        
    FragColor = vec4(finalColor, 1.0);
}