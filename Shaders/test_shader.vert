#version 300 es
precision highp float;

in vec2 position;
in vec2 tex_coord;

out vec2 v_tex_coord;

void main() {
    gl_Position = vec4(position.x, position.y, 0, 1);
    v_tex_coord = vec2(tex_coord.x, tex_coord.y);
}
