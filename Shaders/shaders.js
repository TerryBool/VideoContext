export const vertexShaderSource = `#version 300 es
    precision highp float;

    in vec2 position;
    in vec2 tex_coord;

    out vec2 v_tex_coord;

    void main() {
        gl_Position = vec4(position.x, position.y, 0, 1);
        v_tex_coord = vec2(tex_coord.x, tex_coord.y);
    }
`;

export const edFragSource=`#version 300 es
    precision highp float;

    in vec2 v_tex_coord;
    out vec4 outColor;

    uniform sampler2D u_texture;

    void main() {
        vec2 imageSize = vec2(textureSize(u_texture, 0));
        vec2 onePixel = vec2(1, 1) / imageSize;
        vec4 color = vec4(0);
        
        color += 8.0 * texture(u_texture, v_tex_coord);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(-1, -1) * onePixel);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(-1, 0) * onePixel);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(0, -1) * onePixel);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(1, 0) * onePixel);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(0, 1) * onePixel);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(1, 1) * onePixel);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(-1, 1) * onePixel);
        color += -1.0 * texture(u_texture, v_tex_coord + vec2(1, -1) * onePixel);
        color.a = 1.0;
        outColor = color;
    }
`;

export const blurFragSource=`#version 300 es
    precision highp float;

    in vec2 v_tex_coord;
    out vec4 outColor;

    uniform sampler2D u_texture;

    void main() {
        vec2 imageSize = vec2(textureSize(u_texture, 0));
        vec2 onePixel = vec2(1, 1) / imageSize;
        vec4 color = vec4(0);

        float f = (1.0/273.0);

        color += f*41.0 * texture(u_texture, v_tex_coord);
        color += f*16.0 * texture(u_texture, v_tex_coord + vec2(-1, -1) * onePixel);
        color += f*16.0 * texture(u_texture, v_tex_coord + vec2(-1, 1) * onePixel);
        color += f*16.0 * texture(u_texture, v_tex_coord + vec2(1, -1) * onePixel);
        color += f*16.0 * texture(u_texture, v_tex_coord + vec2(1, 1) * onePixel);
        color += f*26.0 * texture(u_texture, v_tex_coord + vec2(-1, 0) * onePixel);
        color += f*26.0 * texture(u_texture, v_tex_coord + vec2(0, -1) * onePixel);
        color += f*26.0 * texture(u_texture, v_tex_coord + vec2(1, 0) * onePixel);
        color += f*26.0 * texture(u_texture, v_tex_coord + vec2(0, 1) * onePixel);
        color += f*1.0 * texture(u_texture, v_tex_coord + vec2(-2, -2) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(-2, -1) * onePixel);
        color += f*7.0 * texture(u_texture, v_tex_coord + vec2(-2, -0) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(-2, 1) * onePixel);
        color += f*1.0 * texture(u_texture, v_tex_coord + vec2(-2, 2) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(-1, -2) * onePixel);
        color += f*7.0 * texture(u_texture, v_tex_coord + vec2(0, -2) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(1, -2) * onePixel);
        color += f*1.0 * texture(u_texture, v_tex_coord + vec2(2, -2) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(2, -1) * onePixel);
        color += f*7.0 * texture(u_texture, v_tex_coord + vec2(2, 0) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(2, 1) * onePixel);
        color += f*1.0 * texture(u_texture, v_tex_coord + vec2(2, 2) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(2, 1) * onePixel);
        color += f*7.0 * texture(u_texture, v_tex_coord + vec2(2, 0) * onePixel);
        color += f*4.0 * texture(u_texture, v_tex_coord + vec2(2, -1) * onePixel);

        outColor = color;
}
`;