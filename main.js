var imageBuffer = new ImageBuffer(512, 512);
var scene = new Scene();
var rayView = new TextureMapVBO();

var g_timeStep = 1000/60;
var g_last = Date.now();

var paused = true;

const gui = new dat.GUI;
var lightCount;
var itemCount;

var canvas = document.getElementById('webgl');

//handles user interface for camera controls
var cameraController = new CameraController([-10, 0, 2], 0, 0, false, 45, 1, 100);

var itemControllers = [];
var lightControllers = [];

function main() {

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
    sceneSelector.initNoise();

    imageBuffer.setTestPattern();

    rayView.init(gl, imageBuffer);
    rayView.switchToMe();
    rayView.reload(imageBuffer);

    var container = document.getElementById("gui-container");
    container.appendChild(gui.domElement);

    const shadowButton = document.getElementById("shadow");
    const reflectionButton = document.getElementById("reflection");
    const materialButton = document.getElementById("material");
    const CSGButton = document.getElementById("CSG");
    const noiseButton = document.getElementById("noise");
    const nextButton = document.getElementById("nextButton");

    gui.add(scene, "recursionDepth", 0, 8, 1).listen();
    gui.add(scene, "sampleRate", 1, 10, 1);
    gui.add(scene, "shadowRayCount", 1, 1000, 1).listen();
    gui.add(scene, "AAtype", 0, 1, 1);

    gui.add(sceneSelector, "index", 0, sceneSelector.maxIndex-1, 1).listen();

    gui.add(cameraController, "fovy", -90, 90).listen();
    gui.add(cameraController, "aspect",.1,10).listen();
    gui.add(cameraController, "speed", .01, 1).listen();
    gui.add(cameraController, "angularVel", .01, 10).listen();

    addLightControllers(scene.lights);
    addItemControllers(scene.items);

    shadowButton.addEventListener("click", ev => {
        removeControllers();
        sceneSelector.initShadows();
        addLightControllers(scene.lights);
        addItemControllers(scene.items);

        var currentScene = document.getElementById("currentScene");
        currentScene.innerHTML = "shadows";

        nextButton.style.display = "none";
    });
    reflectionButton.addEventListener("click", ev => {
        removeControllers();
        sceneSelector.initReflections();
        addLightControllers(scene.lights);
        addItemControllers(scene.items);

        var currentScene = document.getElementById("currentScene");
        currentScene.innerHTML = "reflections";

        nextButton.style.display = "none";
    });
    materialButton.addEventListener("click", ev => {
        removeControllers();
        sceneSelector.initMaterials();
        addLightControllers(scene.lights);
        addItemControllers(scene.items);

        var currentScene = document.getElementById("currentScene");
        currentScene.innerHTML = "materials";

        nextButton.style.display = "none";
    });
    CSGButton.addEventListener("click", ev => {
        removeControllers();
        sceneSelector.initCSG();
        addLightControllers(scene.lights);
        addItemControllers(scene.items);

        var currentScene = document.getElementById("currentScene");
        currentScene.innerHTML = "CSG";

        nextButton.style.display = "none";
    });
    noiseButton.addEventListener("click", ev => {
        removeControllers();
        sceneSelector.initNoise();
        addLightControllers(scene.lights);
        addItemControllers(scene.items);

        var currentScene = document.getElementById("currentScene");
        currentScene.innerHTML = "noise";

        nextButton.style.display = "block";
    });
    nextButton.addEventListener("click", ev => {
        sceneSelector.index = (sceneSelector.index+1) % sceneSelector.maxIndex;
        removeControllers();
        sceneSelector.initNoise();
        addLightControllers(scene.lights);
        addItemControllers(scene.items);
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
    scene.updateMaterials(itemControllers, lightControllers, gl);
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

function removeControllers() {
    for(var itemController of itemControllers) {
        gui.removeFolder(gui.__folders[itemController.name]);
    }
    for(var lightController of lightControllers) {
        gui.removeFolder(gui.__folders[lightController.name]);
    }

    lightControllers = [];
    itemControllers = [];
}

const shapeNames = ["none", "grid", "disk", "sphere", "cylinder"];
function addItemControllers(items) {
    for(var item of items) {
        var controller = new GeometryController();
        controller.index = itemControllers.length;
        controller.name = shapeNames[item.shapeType] + " " + controller.index;
    
        controller.materialType = item.material.materialType;

        controller.Ke = toRGB(item.material.Ke);
        controller.Ka = toRGB(item.material.Ka);
        controller.Kd = toRGB(item.material.Kd);
        controller.Ks = toRGB(item.material.Ks);
        controller.shininess = item.material.s;
        controller.reflectance = item.material.reflectance;
        controller.transparency = item.material.transparency;

        controller.renderOn = item.renderOn;
    
        var folder = gui.addFolder(controller.name);

        folder.addColor(controller, "Ke").listen();
        folder.addColor(controller, "Ka").listen();
        folder.addColor(controller, "Kd").listen();
        folder.addColor(controller, "Ks").listen();
        folder.add(controller, "shininess", 0, 200, .1).listen();
        folder.add(controller, "reflectance", 0, 1, .01).listen();
        folder.add(controller, "transparency",0, 1, .01).listen();
        folder.add(controller, "renderOn").listen();

        itemControllers.push(controller);
    }
}

const lightNames = ["lamp", "sun", "disco"];
function addLightControllers(lights) {
    for(var light of lights) {
        var controller = new LightController();
        controller.index = lightControllers.length;
        controller.name = lightNames[light.material.lightType] + " " + controller.index;
    
        controller.materialType = light.material.lightType;
        controller.Ia = toRGB(light.material.Ia);
        controller.Id = toRGB(light.material.Id);
        controller.Is = toRGB(light.material.Is);
        controller.brightness = light.material.brightness;

        controller.renderOn = light.renderOn;
    
        var folder = gui.addFolder(controller.name);
        folder.addColor(controller, "Ia").listen();
        folder.addColor(controller, "Id").listen();
        folder.addColor(controller, "Is").listen();
        folder.add(controller, "brightness", 0).listen();
        folder.add(controller, "renderOn").listen();

        lightControllers.push(controller);
    }
}

function toRGB(color) {
    var r = Math.min(1.0, Math.max(color[0]));
    var g = Math.min(1.0, Math.max(color[1]));
    var b = Math.min(1.0, Math.max(color[2]));

    var intColor = [];

    intColor[0] = Math.min(255, Math.floor(r*256));
    intColor[1] = Math.min(255, Math.floor(g*256));
    intColor[2] = Math.min(255, Math.floor(b*256));

    return intColor;
}
function toFloatColor(color) {
    var r = color[0]/255;
    var g = color[1]/255;
    var b = color[2]/255;
    return [r,g,b];
}

main();