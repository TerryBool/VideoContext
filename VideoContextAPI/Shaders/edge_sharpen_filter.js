import Filter from "../vc_filter.js";

export default class EdgeSharpenFilter extends Filter {

    // New locations
    sharpnessLoc;

    // New Data
    sharpness = 1.0;

    constructor(gl) {
        super(gl, vertexShaderSource, edgeSharpFragSource);
        this.sharpnessLoc = gl.getUniformLocation(this.program, "factor");
    }

    setAttribsAndUniforms() {
        this.gl.useProgram(this.program);
        this.gl.uniform1i(this.textureLoc, this.texture);
        this.gl.uniform1f(this.sharpnessLoc, this.sharpness);
        this.gl.useProgram(null);
    }

    dispose() {
        super.dispose();
    }
}

const vertexShaderSource = `#version 300 es
    precision highp float;

    in vec2 position;
    in vec2 tex_coord;

    out vec2 v_tex_coord;

    void main() {
        gl_Position = vec4(position.x, position.y, 0, 1);
        v_tex_coord = vec2(tex_coord.x, tex_coord.y);
    }
`;

const edgeSharpFragSource=`#version 300 es
    precision highp float;

    in vec2 v_tex_coord;
    out vec4 outColor;

    uniform sampler2D u_texture;
    uniform float factor;

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

        color = texture(u_texture, v_tex_coord) + factor*color;

        outColor = color;
    }
`;