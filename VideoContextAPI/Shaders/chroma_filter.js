import Filter from "../vc_filter.js";

export default class ChromaFilter extends Filter {

    // New locations
    chromaClrLoc;
    innerToleranceLoc;
    outerToleranceLoc;

    // New Data
    chromaColorRGB = [0.0, 1.0, 0.0];
    innerTolerance = 0.1;
    outerTolerance = 0.2;

    constructor(gl) {
        super(gl, vertexShaderSource, chromaKeyFragSource);
        this.chromaClrLoc = gl.getUniformLocation(this.program, "chromaClr");
        this.innerToleranceLoc = gl.getUniformLocation(this.program, "innerTol");
        this.outerToleranceLoc = gl.getUniformLocation(this.program, "outerTol");
    }

    setAttribsAndUniforms() {
        this.gl.useProgram(this.program);
        this.gl.uniform1i(this.textureLoc, this.texture);
        this.gl.uniform1f(this.innerToleranceLoc, this.innerTolerance);
        this.gl.uniform1f(this.outerToleranceLoc, this.outerTolerance);
        this.gl.uniform4f(this.chromaClrLoc, this.chromaColorRGB[0], this.chromaColorRGB[1], this.chromaColorRGB[2], 1.0);
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


const chromaKeyFragSource=`#version 300 es
    precision highp float;
        
    in vec2 v_tex_coord;
    out vec4 outColor;

    uniform sampler2D u_texture;

    uniform float innerTol;
    uniform float outerTol;
    uniform vec4 chromaClr;

    void main() {
        vec4 color = texture(u_texture, v_tex_coord);

        float dist = length(color - chromaClr);
        float alpha;
        
        if (dist < innerTol) {
            alpha = 0.0;
        } else if (dist < outerTol) {
            alpha = (dist - innerTol)/(outerTol-innerTol);
        } else {
            alpha = 1.0;
        }

        outColor = color*alpha;
    }
`;