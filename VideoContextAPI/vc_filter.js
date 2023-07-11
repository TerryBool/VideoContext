import {initProgram} from "./vc_utils.js";

export default class Filter {
    // Shader program
    program;
    // GL context
    gl;
    // Successful shader creation
    success = false;

    // Locations
    textureLoc;

    // Data
    texture = 0;

    constructor(gl, vertSource, fragSource) {
        this.gl = gl;
        if (vertSource === undefined || fragSource === undefined) {
            this.program = initProgram(gl, vertexShaderSource, idFragSource);
        } else {
            this.program = initProgram(gl, vertSource, fragSource);
        }

        if (this.program == null) return;
        this.success = true;

        gl.useProgram(this.program);

        const positionAttributeLocation = gl.getAttribLocation(this.program, "position");
        const texCoordAttributeLocation = gl.getAttribLocation(this.program, "tex_coord");
        
        this.textureLoc = gl.getUniformLocation(this.program, "u_texture");
        this.gl.uniform1i(this.textureLoc, this.texture);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData( gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, -1, 1, 1, -1, 1,  1, 1, -1, -1,  1]),
            gl.STATIC_DRAW);

        const texCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
        gl.enableVertexAttribArray(texCoordAttributeLocation);
        gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, 
            new Float32Array([0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1]), 
            gl.STATIC_DRAW);

        gl.useProgram(null);
    }

    setAttribsAndUniforms() {
        this.gl.useProgram(this.program);
        this.gl.uniform1i(this.textureLoc, this.texture);
        this.gl.useProgram(null);
    }

    dispose() {
        this.program.dispose();
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

const idFragSource = `#version 300 es
    precision highp float;
    
    in vec2 v_tex_coord;
    out vec4 outColor;

    uniform sampler2D u_texture;

    void main() {
        vec4 color = vec4(0);

        color += texture(u_texture, v_tex_coord);
        color.a = 1.0;
        outColor = color;
    }
`;
