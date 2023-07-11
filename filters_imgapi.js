const video = document.getElementById("video");
const rightSelect = document.getElementById("selected-shaders");

const canvasContainer = document.getElementById("canvas-container");

const frontCanvas = document.createElement('canvas');
const fCtx = frontCanvas.getContext("2d");
const backCanvas = document.createElement('canvas');
const bCtx = backCanvas.getContext("2d", { willReadFrequently: true });

const sharpness = document.getElementById("sharpness");
const brightness = document.getElementById("brightness");
const chromaColor = document.getElementById("chroma-clr");
const chromaTolA = document.getElementById("tol-a");
const chromaTolB = document.getElementById("tol-b");

var width;
var height;

canvasContainer.appendChild(frontCanvas);
/*
window.navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facing: 'user'
    }
    })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
      video.style.display = "none";
      window.devicePixelRatio = 1;
    })
    .catch((err) => console.log('There was an error.', err));
*/

function render() {
    console.timeEnd("idle");
    console.time("idle");
    console.time("render");

    bCtx.drawImage(video, 0, 0, width, height);
    const frame = bCtx.getImageData(0, 0, width, height);
    const secFrame = new ImageData(width, height);
    const frames = [frame, secFrame];
    const fbs = [frame.data, frames[1].data];

    var selShaders = rightSelect.options;
    var nShaders = selShaders.length;
    var fbIdx = 0;

    for(var i = 0; i < nShaders; i++) {
        var shader = selShaders.item(i).value;
        if (shader == 0) {
            console.time("brighten");
            brighten(fbs[fbIdx], fbs[1 - fbIdx]);
            console.timeEnd("brighten");
        } else if (shader == 1) {
            console.time("sharpen");
            sharpen(fbs[fbIdx], fbs[1 - fbIdx]);
            console.timeEnd("sharpen");
        } else if (shader == 2) {
            console.time("chroma");
            chroma(fbs[fbIdx], fbs[1 - fbIdx]);
            console.timeEnd("chroma");
        } else {
            fbIdx = 1 - fbIdx;
        }
        fbIdx = 1 - fbIdx;
    }
    fCtx.putImageData(frames[fbIdx], 0, 0);

    console.timeEnd("render");

    window.requestAnimationFrame(render);
}

function measurements() {
    console.timeEnd("fps");
    console.time("fps");
    bCtx.drawImage(video, 0, 0, width, height);
    const frame = bCtx.getImageData(0, 0, width, height);
    const secFrame = new ImageData(width, height);
    const frames = [frame, secFrame];
    const fbs = [frame.data, frames[1].data];

    //console.time("sharp");
    brighten(fbs[0], fbs[1]);
    //console.timeEnd("sharp");

    fCtx.putImageData(frames[1], 0, 0);

    if (video.ended) return;
    window.requestAnimationFrame(measurements);
}

function initialize() {
    video.style.display = "none";
    video.muted = true;
    video.play();

    width = video.videoWidth;
    height = video.videoHeight;
    frontCanvas.width = width;
    frontCanvas.height = height;
    backCanvas.width = width;
    backCanvas.height = height;
    //console.time("idle");
    //window.requestAnimationFrame(render);
    window.requestAnimationFrame(measurements);
}

function brighten(srcFb, destFb) {
    var f = 1.0*brightness.value;
    var len = srcFb.length;
    
    for (var i = 0; i < len; i += 4) {
        destFb[i] = Math.floor(f*srcFb[i]);
        destFb[i + 1] = Math.floor(f*srcFb[i + 1]);
        destFb[i + 2] = Math.floor(f*srcFb[i + 2]);
        destFb[i + 3] = Math.floor(srcFb[i + 3]);
    }
}

function sharpen(srcFb, destFb) {
    var f = 1.0*sharpness.value;
    var len = srcFb.length;
    
    for(var i = 0; i < len; i += 4) {
        var pxIdx = i / 4;
        rgb = edgeDetect(pxIdx, srcFb);
        destFb[i] = Math.floor(srcFb[i] + f*rgb[0]);
        destFb[i + 1] = Math.floor(srcFb[i + 1] + f*rgb[1]);
        destFb[i + 2] = Math.floor(srcFb[i + 2] + f*rgb[2]);
        destFb[i + 3] = Math.floor(srcFb[i + 3]);
    }
    
}

function edgeDetect(pxIdx, data) {
    var rT = 0.0;
    var gT = 0.0;
    var bT = 0.0;

    var pxX = pxIdx % width;
    var pxY = Math.floor(pxIdx / width);

    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) {
                rT += 8*data[pxIdx*4];
                gT += 8*data[pxIdx*4 + 1];
                bT += 8*data[pxIdx*4 + 2];
            } else {
                var readX = pxX + i < 0 ? 0 : pxX + i;
                readX = readX >= width ? width - 1 : readX;
                var readY = pxY + j < 0 ? 0 : pxY + j;
                readY = readY >= height ? height - 1 : readY;

                var pxPos = 4*(readY*width + readX);
                rT -= data[pxPos];
                gT -= data[pxPos + 1];
                bT -= data[pxPos + 2];
            }
        }
    }
    return [rT, gT, bT];
}

function chroma(srcFb, destFb) {
    // RGB is in 0-255 format, so we have to multiply the tolerances (they were made for 0 - 1 format)
    var rgb = getRGB(chromaColor.value);
    var tolA = chromaTolA.value * 255.0;
    var tolB = chromaTolB.value * 255.0;
    var len = srcFb.length;

    for (var i = 0; i < len; i += 4) {
        var r = srcFb[i];           // R
        var g = srcFb[i + 1];       // G
        var b = srcFb[i + 2];       // B
        var rD = r - rgb[0];
        var gD = g - rgb[1];
        var bD = b - rgb[2];
        var dist = Math.sqrt(rD*rD + gD*gD + bD*bD);
        var alpha;
        if (dist < tolA) {
            alpha = 0.0;
        } else if (dist < tolB) {
            alpha = (dist - tolA)/(tolB - tolA);
        } else {
            alpha = 1.0;
        }
        destFb[i] = Math.floor(r*alpha);
        destFb[i + 1] = Math.floor(g*alpha);
        destFb[i + 2] = Math.floor(b*alpha);
        destFb[i + 3] = Math.floor(srcFb[i + 3]*alpha);
    }
}

function getRGB(color) {
    var clr = color.substring(1);
    var aRgbHex = clr.match(/.{1,2}/g);
    return [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16)];
}

video.addEventListener('canplay', initialize);
//initialize()
