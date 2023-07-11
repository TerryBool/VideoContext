#version 300 es
precision highp float;

in vec2 v_tex_coord;
out vec4 outColor;

uniform sampler2D u_texture;

void main() {
    vec2 imageSize = vec2(textureSize(u_texture, 0));
    vec2 onePixel = vec2(1, 1) / imageSize;
    vec4 color = vec4(0.9529, 0.4078, 0.0431, 1.0);
    
    color *= texture(u_texture, v_tex_coord);

    outColor = color;
}
