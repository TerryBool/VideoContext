import {initFbTexture, initFrameBuffer, initTexture, setSizeOfFramebuffers} from "./vc_utils.js";
import Shader from "./vc_filter.js";
import SharpenShader from "./Shaders/sharpen_filter.js";
import BrightnessShader from "./Shaders/brightness_filter.js";
import ChromaShader from "./Shaders/chroma_filter.js";
import EdgeSharpenShader from "./Shaders/edge_sharpen_filter.js";

export default class VideoContext {
    // Queue of shaders for rendering
    queue = [];
    // Canvas that will be drawn on
    canvas;
    // GL context of canvas
    gl;

    // Filter that draws exactly what is on received texture
    #idFilter;
    // Texture for rendering videos and images as input data
    #vidTexture;
    // Framebuffers for rendering multiple shaders
    #framebuffers = [];
    // Framebuffer textures for rendering multiple shaders
    #fbTextures = [];

    #lastRenderWidth = 1;
    #lastRenderHeight = 1;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.gl = this.canvas.getContext("webgl2");

        //this.ext = this.gl.getExtension('EXT_disjoint_timer_query_webgl2');

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        this.gl.clearColor(1, 1, 1, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.#idFilter = this.createIdentityFilter();
        this.#vidTexture = initTexture(this.gl);

        this.#fbTextures.push(initFbTexture(this.gl, 1, 1));
        this.#fbTextures.push(initFbTexture(this.gl, 1, 1));

        this.#framebuffers.push(initFrameBuffer(this.gl, this.#fbTextures[0]));
        this.#framebuffers.push(initFrameBuffer(this.gl, this.#fbTextures[1]));

        this.canvas.width = 1;
        this.canvas.height = 1;
    }

    drawFromTexture(texture, width, height) {
        this.#setSize(width, height);
        this.#firstPass(texture);
        if (this.queue.length < 2) return;
        this.#drawBetweenFbs();
    }

    drawFromVideo(video) {
        var width = video.videoWidth;
        var height = video.videoHeight;
        this.#setSize(width, height);
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.#vidTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, video);

        this.#firstPass(this.#vidTexture);
    
        if (this.queue.length < 2) return;
        this.#drawBetweenFbs();
    }

    drawFromImage(image) {
        var width = image.width;
        var height = image.height;
        this.#setSize(width, height);

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.#vidTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.#firstPass(this.#vidTexture);

        if (this.queue.length < 2) return;
        this.#drawBetweenFbs();
    }

    #drawBetweenFbs() {
        // We have rendered into fb[0], next render will be into fb[1]
        var fbIdx = 1;
        const nFilters = this.queue.length;
        // Don't render the first shader (already done), start from second to the one before last
        for(var i = 1; i < (nFilters - 1); i++) {
            var filter = this.queue[i];
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.#framebuffers[fbIdx]);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.#fbTextures[1 - fbIdx]);
            this.#render(filter);
            // Switching between framebuffers: fbIdx (1 -> 0, 0 -> 1)
            fbIdx = 1 - fbIdx;
        }
        // Render the last shader to canvas
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.#fbTextures[1 - fbIdx]);
        this.#render(this.queue[nFilters - 1]);
    }

    #firstPass(texture) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        if (this.queue.length == 0) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.#render(this.#idFilter);
        } else if (this.queue.length == 1) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.#render(this.queue[0]);
        } else {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.#framebuffers[0]);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.#render(this.queue[0]);
            this.#drawBetweenFbs();
        }
    }

    #render(filter) {
        //this.query = this.gl.createQuery();
        //this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.query);
        filter.setAttribsAndUniforms();

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.useProgram(filter.program);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        //this.gl.finish();
        //this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);

        this.gl.useProgram(null);
    }

    #setSize(width, height) {
        if (this.#lastRenderWidth != width || this.#lastRenderHeight != height) {
            setSizeOfFramebuffers(this.gl, this.#fbTextures[0], this.#framebuffers[0], width, height);
            setSizeOfFramebuffers(this.gl, this.#fbTextures[1], this.#framebuffers[1], width, height);
            this.canvas.width = width;
            this.canvas.height = height;
            this.#lastRenderWidth = width;
            this.#lastRenderHeight = height;
        }
    }

    createIdentityFilter() {
        var shader = new Shader(this.gl);
        if (shader.success) return shader;
        console.log("Error occured during shader creation");
        return null;
    }

    createSharpenFilter() {
        var shader = new SharpenShader(this.gl);
        if (shader.success) return shader;
        console.log("Error occured during shader creation");
        return null;
    }

    createEdgeSharpenFilter() {
        var shader = new EdgeSharpenShader(this.gl);
        if (shader.success) return shader;
        console.log("Error occured during shader creation");
        return null;
    }

    createBrightnessFilter() {
        var shader = new BrightnessShader(this.gl);
        if (shader.success) return shader;
        console.log("Error occured during shader creation");
        return null;
    }

    createChromaFilter() {
        var shader = new ChromaShader(this.gl);
        if (shader.success) return shader;
        console.log("Error occured during shader creation");
        return null;
    }

    createFilterFromSources(vertSrc, fragSrc) {
        var shader = new Shader(this.gl, vertSrc, fragSrc);
        if (shader.success) return shader;
        console.log("Error occured during shader creation");
        return null;
    }

    getMaxTextureSize() {
        return this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    }

    checkQuery() {
        if (this.query) {
            let available = this.gl.getQueryParameter(this.query, this.gl.QUERY_RESULT_AVAILABLE);
            let disjoint = this.gl.getParameter(this.ext.GPU_DISJOINT_EXT);

            if (available && !disjoint) {
                // See how much time the rendering of the object took in nanoseconds.
                let timeElapsed = this.gl.getQueryParameter(this.query, this.gl.QUERY_RESULT);

                // Do something useful with the time.  Note that care should be
                // taken to use all significant bits of the result, not just the
                // least significant 32 bits.
                console.log(timeElapsed / 1000000.0);
                return true;
            }
  
            if (available || disjoint) {
                // Clean up the query object.
                this.gl.deleteQuery(this.query);
                // Don't re-enter this polling loop.
                this.query = null;
                return true;
            }

            return false;
        }
    }
}