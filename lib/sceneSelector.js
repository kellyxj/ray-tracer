class SceneSelector {
    constructor(scene, gl, pic, camController) {
        this.scene = scene;
        this.gl = gl;
        this.pic = pic;
        this.camController = camController;
    }
    initVbos() {
        for(var light of this.scene.lights) {
            light.initVbo(this.gl);
        }

        for(var item of this.scene.items) {
            item.initVbo(this.gl);
        }
    }
    initMaterials() {
        var scene = this.scene;
        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);
        
        scene.recursionDepth = 2;

        this.lights = [];

        //var sun = new Sun();
        //scene.lights.push(sun);

        var light = new Light(0, 0, 5, 10);
        light.setMaterial(new Disco(2, 10));

        var rotateAnim = new AnimationRotate(10, 0, 0, 1);
        light.animations.push(rotateAnim);

        scene.lights.push(light);

        var light2 = new Light(-5, 0, 3, .5);
        light2.rayScale(.1,.1,.1);

        var translateAnim = new AnimationTranslate(10, 0, -1, 0);
        light2.animations.push(rotateAnim);
        light2.animations.push(translateAnim);

        scene.lights.push(light2);

        this.items = [];
        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var sphere = new Sphere();
        sphere.rayTranslate(0, 4, 1.5);
        var checker = new Checkerboard();
        sphere.setMaterial(checker);

        var rotateAnim2 = new AnimationRotate(-5, 0, 0, 1);
        sphere.animations.push(rotateAnim2);

        scene.items.push(sphere);

        this.initVbos();
    }

    initReflections() {
        var scene = this.scene;
        this.camController.setEyePos(vec4.fromValues(4, -4, 1, 1));
        this.camController.setLookDirection(225,0);

        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);

        scene.recursionDepth = 4;

        scene.lights = [];

        var sun = new Sun();
        scene.lights.push(sun);

        var light = new Light(1, 1, 1, .2);
        light.rayScale(.1, .1, .1);
        scene.lights.push(light);

        var light2 = new Light(5, 5, 1, .2);
        light2.rayScale(.1,.1,.1);
        scene.lights.push(light2);

        var light3 = new Light(-5, 5, 1, .2);
        light3.rayScale(.1,.1,.1);
        scene.lights.push(light3);

        var light4 = new Light(-5, -5, 1, .2);
        light4.rayScale(.1,.1,.1);
        scene.lights.push(light4);

        var light5 = new Light(5, -5, 1, .2);
        light5.rayScale(.1,.1,.1);
        scene.lights.push(light5);

        scene.items = [];

        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var sphere = new Sphere();
        sphere.rayTranslate(0, 3, 1.5);
        var mirror = new Mirror();
        sphere.setMaterial(mirror);
        scene.items.push(sphere);

        var sphere2 = new Sphere();
        sphere2.rayTranslate(3, 2, 1);
        mirror = new Mirror();
        sphere2.setMaterial(mirror);
        scene.items.push(sphere2);

        var sphere3 = new Sphere();
        sphere3.rayTranslate(-1, 0, 2);
        mirror = new Mirror();
        sphere3.setMaterial(mirror);
        scene.items.push(sphere3);

        this.initVbos();
    }

    initTransparency() {
        var scene = this.scene;

        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);

        scene.lights = [];

        var sun = new Sun();
        scene.lights.push(sun);

        scene.items = [];

        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var sphere = new Sphere();
        sphere.rayTranslate(0, 0, 1.5);
        var glass = new Glass();
        sphere.setMaterial(glass);
        scene.items.push(sphere);

        this.initVbos();
    }
}