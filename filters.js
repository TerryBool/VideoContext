import { vertexShaderSource, edFragSource, blurFragSource} from "./Shaders/shaders.js";
import VideoContext from "./VideoContextAPI/videocontext.js";

//const image = document.getElementById("image");
const video = document.createElement("video");
//const video = document.getElementById("video");
const leftSelect = document.getElementById("all-shaders");
const rightSelect = document.getElementById("selected-shaders");

const vertInput = document.getElementById("vert-selector");
const fragInput = document.getElementById("frag-selector");
const filterNameText = document.getElementById("filter-name");
const addFilterBtn = document.getElementById("add-filter-btn");

const canvasContainer = document.getElementById("canvas-container");
const sharpness = document.getElementById("sharpness");
const brightness = document.getElementById("brightness");
const chromaColor = document.getElementById("chroma-clr");
const chromaTolA = document.getElementById("tol-a");
const chromaTolB = document.getElementById("tol-b");

const videocontext = new VideoContext();
canvasContainer.appendChild(videocontext.canvas);
console.log(videocontext.getMaxTextureSize());

const filters = [];

const brightnessProg = videocontext.createBrightnessFilter();
const sharpenProg = videocontext.createSharpenFilter();
const edgeSharpenProg = videocontext.createEdgeSharpenFilter();
const chromaProg = videocontext.createChromaFilter();

createOption(brightnessProg, "Brightness");
createOption(sharpenProg, "Unsharp");
createOption(edgeSharpenProg, "Edge Sharpen");
createOption(chromaProg, "Chroma Key");
createOption(videocontext.createFilterFromSources(vertexShaderSource, edFragSource), "Edge Detect");
createOption(videocontext.createFilterFromSources(vertexShaderSource, blurFragSource), "Blur");

/*
programs.push(brightnessProg);
programs.push(sharpenProg);
programs.push(chromaProg);
programs.push(edgeSharpenProg);
programs.push(videocontext.createFilterFromSources(vertexShaderSource, edFragSource));
programs.push(videocontext.createFilterFromSources(vertexShaderSource, blurFragSource));
*/


async function initCamera() {
    const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facing: 'user'
        }
    });
    video.style.display = "none";
    window.devicePixelRatio = 1;
    video.srcObject = stream;
    video.play();
}

function initialize() {
    window.requestAnimationFrame(render);
}

function render() {
    setFilterParameters();

    var selShaders = rightSelect.options;
    var nShaders = selShaders.length;
    var queue = [];

    for (var i = 0; i < nShaders; i++) {
        queue.push(filters[selShaders.item(i).value]);
    }
    videocontext.queue = queue;

    videocontext.drawFromVideo(video);
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

function setFilterParameters() {
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

async function addFilter() {
    if (!vertInput.value.includes(".vert") || !fragInput.value.includes(".frag") || filterNameText.value == "") {
        console.log("Inputs missing!");
        return;
    }

    const vertFile = vertInput.files[0];
    const fragFile = fragInput.files[0];

    if (fragFile == null || vertFile == null) {
        console.log("Missing one of the shader sources");
        return;
    }
    
    const vertSrc = await readFile(vertFile);
    const fragSrc = await readFile(fragFile);

    const prog = videocontext.createFilterFromSources(vertSrc, fragSrc);
    if (!prog.success){ 
        console.log("Failed compilation error");
        return;
    }

    createOption(prog, filterNameText.value);
    /*
    programs.push(prog);
    var option = document.createElement("option");
    option.text = filterNameText.value;
    option.value = programs.length - 1;
    leftSelect.appendChild(option);*/

    filterNameText.value = "";
    vertInput.value = null;
    fragInput.value = null;
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = () => {
            resolve(fr.result);
        };
        fr.onerror = reject;
        fr.readAsText(file);
    });
}

function createOption(program, filterName) {
    filters.push(program);
    var option = document.createElement("option");
    option.text = filterName;
    option.value = filters.length - 1;
    leftSelect.appendChild(option);
}

initCamera();
video.addEventListener('canplay', initialize);
addFilterBtn.addEventListener("click", addFilter);
//initialize();