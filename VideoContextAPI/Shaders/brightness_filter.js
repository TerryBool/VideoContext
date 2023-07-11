import Filter from "../vc_filter.js";

export default class BrightnessFilter extends Filter {

    // New locations
    brightnessLoc;

    // New Data
    brightness = 1.0;

    constructor(gl) {
        super(gl, vertexShaderSource, brightFragSource);
        this.brightnessLoc = gl.getUniformLocation(this.program, "factor");
    }

    setAttribsAndUniforms() {
        this.gl.useProgram(this.program);
        this.gl.uniform1i(this.textureLoc, this.texture);
        this.gl.uniform1f(this.brightnessLoc, this.brightness);
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

const brightFragSource = `#version 300 es
    precision highp float;

    in vec2 v_tex_coord;
    out vec4 outColor;

    uniform sampler2D u_texture;
    uniform float factor;

    void main() {
        vec4 color = vec4(0);

        color += texture(u_texture, v_tex_coord);

        outColor = factor*color;
    }
`;