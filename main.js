var imageBuffer = new ImageBuffer(512, 512);
var scene = new Scene();
var rayView = new TextureMapVBO();

var g_timeStep = 1000/60;
var g_last = Date.now();

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
            scene.makeRayTracedImage(cameraController);
            rayView.switchToMe();
            rayView.reload(imageBuffer);
            console.log("tracing");
        }
        else if(e.key == " ") {
            
        }
    });

    var sceneSelector = new SceneSelector(scene, gl, imageBuffer, cameraController);
    sceneSelector.initCFG();

    imageBuffer.setTestPattern();

    rayView.init(gl, imageBuffer);
    rayView.switchToMe();
    rayView.reload(imageBuffer);

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
          item.animate(elapsed);
      }
      for(var light of scene.lights) {
          light.animate(elapsed);
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