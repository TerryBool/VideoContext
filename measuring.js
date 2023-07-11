import VideoContext from "./VideoContextAPI/videocontext.js";

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

const edgeDetectpFragSource=`#version 300 es
    precision highp float;

    in vec2 v_tex_coord;
    out vec4 outColor;

    uniform sampler2D u_texture;
    uniform float factor;

    void main() {
        vec2 imageSize = vec2(textureSize(u_texture, 0));
        vec2 onePixel = vec2(1, 1) / imageSize;
        vec4 color = vec4(0);

        color += 0.25 * texture(u_texture, v_tex_coord);
        color += 0.125 * texture(u_texture, v_tex_coord + vec2(-1, -1) * onePixel);
        color += 0.125 * texture(u_texture, v_tex_coord + vec2(1, 1) * onePixel);
        color += 0.125 * texture(u_texture, v_tex_coord + vec2(-1, 1) * onePixel);
        color += 0.125 * texture(u_texture, v_tex_coord + vec2(1, -1) * onePixel);
        color += 0.0625 * texture(u_texture, v_tex_coord + vec2(-1, 0) * onePixel);
        color += 0.0625 * texture(u_texture, v_tex_coord + vec2(0, -1) * onePixel);
        color += 0.0625 * texture(u_texture, v_tex_coord + vec2(1, 0) * onePixel);
        color += 0.0625 * texture(u_texture, v_tex_coord + vec2(0, 1) * onePixel);

        color = texture(u_texture, v_tex_coord) - color;
        color.a = 1.0;
        outColor = color;
    }
`;
const video = document.getElementById("video");
//const image = document.createElement("img");
//image.src = "./Assets/Controller.png";

const canvasContainer = document.getElementById("canvas-container");
const sharpness = document.getElementById("sharpness");
const brightness = document.getElementById("brightness");
const chromaColor = document.getElementById("chroma-clr");
const chromaTolA = document.getElementById("tol-a");
const chromaTolB = document.getElementById("tol-b");

const videocontext = new VideoContext();
canvasContainer.appendChild(videocontext.canvas);

const brightnessProg = videocontext.createBrightnessFilter();
const sharpenProg = videocontext.createSharpenFilter();
const edgeSharpenProg = videocontext.createEdgeSharpenFilter();
const chromaProg = videocontext.createChromaFilter();
const edgeDetect = videocontext.createFilterFromSources(vertexShaderSource, edgeDetectpFragSource);

function initialize() {
    window.requestAnimationFrame(render);
}

function render() {
    console.timeEnd("render-period");
    console.time("render-period");

    setProgramValues();

    videocontext.queue = [edgeDetect, edgeDetect, edgeDetect, edgeDetect, edgeDetect];
    videocontext.drawFromImage(video);
    window.requestAnimationFrame(render);
    //window.requestAnimationFrame(waitForQuery);
}

function waitForQuery() {
    if (videocontext.checkQuery()) {
        window.requestAnimationFrame(render);
    } else {
        window.requestAnimationFrame(waitForQuery);
    }
}

function setProgramValues() {
    var rgb = getRGB(chromaColor.value);
    brightnessProg.brightness = 1.0*brightness.value;
    sharpenProg.sharpness = 1.0*sharpness.value;
    edgeSharpenProg.sharpness = 1.0*sharpness.value;
    chromaProg.chromaColorRGB = rgb;
    chromaProg.innerTolerance = 1.0*chromaTolA.value;
    chromaProg.outerTolerance = 1.0*chromaTolB.value;
}

function getRGB(color) {
    var clr = color.substring(1);
    var aRgbHex = clr.match(/.{1,2}/g);
    return [parseInt(aRgbHex[0], 16) / 255.0, parseInt(aRgbHex[1], 16) / 255.0, parseInt(aRgbHex[2], 16)/ 255.0];
}


//image.addEventListener('onload', initialize);
initialize();