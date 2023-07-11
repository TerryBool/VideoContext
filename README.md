# VideoContext
Small API for applying effects on images and videos via GLSL shaders in JavaScript.

The project contains the API itself in "VideoContextAPI" folder and a demo web app.

## Usage
To use `VideoContext` you first need to import your javascript file as a module in HTML. Afterwards you can use VideoContext like so.

```javascript
import VideoContext from "./VideoContextAPI/videocontext.js";
// Prepare container for canvas inside of HTML code
const canvasContainer = document.getElementById("canvas-container");
const image = document.getElementById("image");

// Initialize VideoContext
const vc = new VideoContext();
// Put VideoContext's canvas into the container
canvasContainer.appendChild(vc.canvas);

// Here you can create filters
const chroma = vc.createChromaFilter();
const sharpen = vc.createSharpenFilter();

// You can apply multiple filters
vc.queue = [chroma, sharpen];
// Start drawing
vc.drawFromImage(image);
```

For drawing from video use `vc.drawFromVideo(video)`. There are few filters implemented, to see how to create them, you can check out `"\VideoContextAPI\videocontext.js"`.

To implement your own filters you can either give strings with GLSL 3.0 shader code into `vc.createFilterFromSources(vertextShader, fragmentShader)` or extend `Filter` class found in `"\VideoContextAPI\vc_filter.js"`. Extending the class will allow you to pass in parameters and other things.
