var imageBuffer = new ImageBuffer(512, 512);
var scene = new Scene();
var rayView = new TextureMapVBO();

var g_timeStep = 1000/60;
var g_last = Date.now();

var paused = true;

//handles user interface for camera controls
var cameraController = new CameraController([-10, 0, 2], 0, 0, false, 45, 1, 100);

function main() {

    var canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    document.addEventListener("keydown", (e) => {
        if(e.key == "w") {
            cameraController.moveForward();
            console.log(cameraController.eyePosition);
        }
        else if(e.key == "s" ) {
            cameraController.moveBack();
            console.log(cameraController.eyePosition);
        }
        else if(e.key == "a") {
            cameraController.moveLeft();
            console.log(cameraController.eyePosition);
        }
        else if(e.key == "d") {
            cameraController.moveRight();
            console.log(cameraController.eyePosition);
        }
        else if(e.key == "e") {
            cameraController.moveUp();
            console.log(cameraController.eyePosition);
        }
        else if(e.key == "q") {
            cameraController.moveDown();
            console.log(cameraController.eyePosition);
        }
        else if(e.key == "ArrowUp") {
            cameraController.tiltUp();
            console.log(cameraController.tiltAngle);
        }
        else if(e.key == "ArrowDown") {
            cameraController.tiltDown();
            console.log(cameraController.tiltAngle);
        }
        else if(e.key == "ArrowLeft") {
            cameraController.panLeft();
            console.log(cameraController.panAngle);
        }
        else if(e.key == "ArrowRight") {
            cameraController.panRight();
            console.log(cameraController.panAngle);
        }
        else if(e.key == "t") {
            paused = true;
            console.log("tracing");
            scene.makeRayTracedImage(cameraController);
            rayView.switchToMe();
            rayView.reload(imageBuffer);
        }
        else if(e.key == " ") {
            paused = !paused;
        }
    });

    var sceneSelector = new SceneSelector(scene, gl, imageBuffer, cameraController);
    sceneSelector.initReflections();

    imageBuffer.setTestPattern();

    rayView.init(gl, imageBuffer);
    rayView.switchToMe();
    rayView.reload(imageBuffer);

    const gui = new dat.GUI;

    var container = document.getElementById("gui-container");
    container.appendChild(gui.domElement);

    const shadowButton = document.getElementById("shadow");
    const reflectionButton = document.getElementById("reflection");
    const materialButton = document.getElementById("material");
    const CSG = document.getElementById("CSG");

    gui.add(scene, "recursionDepth", 0, 8, 1);
    gui.add(scene, "sampleRate", 1, 10, 1);
    gui.add(scene, "shadowRayCount", 1, 1000, 1);
    gui.add(scene, "AAtype", 0, 1, 1);
    const itemFolder = gui.addFolder("items");
    const lightFolder = gui.addFolder("lights");

    shadowButton.addEventListener("click", ev => {
        sceneSelector.initShadows();
    });
    reflectionButton.addEventListener("click", ev => {
        sceneSelector.initReflections();
    });
    materialButton.addEventListener("click", ev => {
        sceneSelector.initMaterials();
    });
    CSG.addEventListener("click", ev => {
        sceneSelector.initCSG();
    });

    drawAll(gl);

    var tick = function() {
        g_timeStep = animate();
        drawAll(gl);
        
        requestAnimationFrame(tick, canvas);   
      };
      tick();			
}

function animate() {
    //==============================================================================  
    // Returns how much time (in milliseconds) passed since the last call to this fcn.
      var now = Date.now();	        
      var elapsed = now - g_last;	// amount of time passed, in integer milliseconds
      g_last = now;               // re-set our stopwatch/timer.

      for(var item of scene.items) {
          if(!paused) {
            item.animate(elapsed);
          }
      }
      for(var light of scene.lights) {
          if(!paused) {
            light.animate(elapsed);
          }
      }
    
      return elapsed;
    }

function drawAll(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawPreview(gl);
    drawTextureMap(gl);
}

function drawPreview(gl) {
    var perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, glMatrix.toRadian(cameraController.fovy), cameraController.aspect, cameraController.near, cameraController.far);

    var viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, cameraController.eyePosition, cameraController.aimPoint, cameraController.upVector);

    var mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, perspectiveMatrix, viewMatrix);

    gl.viewport(0,
                0,
                gl.drawingBufferWidth/2, 
                gl.drawingBufferHeight);
    

    for(var item of scene.items) {
        item.drawPreview(mvpMatrix);
    }
    for(var light of scene.lights) {
        light.drawPreview(mvpMatrix);
    }
}

function drawTextureMap(gl) {
    gl.viewport(gl.drawingBufferWidth/2,
                0,
                gl.drawingBufferWidth/2,
                gl.drawingBufferHeight);

    rayView.switchToMe();
    rayView.draw();
}

main();