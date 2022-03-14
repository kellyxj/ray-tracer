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
        this.camController.setEyePos(vec4.fromValues(-10, -5, 3, 1));
        this.camController.setLookDirection(-35,0);

        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);

        scene.recursionDepth = 1;

        scene.lights = [];

        var sun = new Sun();
        //scene.lights.push(sun);

        var light = new Light(0, 0, 5, 10);
        light.setMaterial(new Disco(2, 10));

        var rotateAnim = new AnimationRotate(10, 0, 0, 1);
        light.animations.push(rotateAnim);

        scene.lights.push(light);

        var light2 = new Light(-2, 4, 1, .5);
        light2.rayScale(.1,.1,.1);

        var translateAnim = new AnimationTranslate(3, 0, -1, 0);
        light2.animations.push(rotateAnim);
        light2.animations.push(translateAnim);

        scene.lights.push(light2);

        scene.items = [];
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
        this.camController.setEyePos(vec4.fromValues(5.5, -7.5, 1, 1));
        this.camController.setLookDirection(240,0);

        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);
        scene.recursionDepth = 4;
        scene.shadowRayCount = 1;

        scene.lights = [];

        var sun = new Sun();
        scene.lights.push(sun);

        scene.items = [];

        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var sphere = new Sphere();
        sphere.rayTranslate(0, 3, 1.5);
        var mirror = new Mirror();
        var plastic = new Plastic();

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

        var sphere4 = new Sphere();
        sphere4.rayTranslate(1, 0, 1.5);
        var glass = new Glass();
        sphere4.setMaterial(glass);
        sphere4.renderOn = false;
        scene.items.push(sphere4);

        this.initVbos();
    }

    initShadows() {
        var scene = this.scene;

        this.camController.setEyePos(vec4.fromValues(0, -15, 1, 1));
        this.camController.setLookDirection(-90, 0);

        scene.recursionDepth = 0;
        scene.shadowRayCount = 10;

        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);

        scene.lights = [];

        var light = new Light(0,10,2,15);
        light.rayScale(.5,.5,.5);
        scene.lights.push(light);

        var light2 = new Light(-1,-1,1,.5);
        light2.rayScale(.1,.1,.1);
        scene.lights.push(light2);

        scene.items = [];

        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var sphere = new Sphere();
        var plastic = new Plastic();
        sphere.setMaterial(plastic);
        sphere.rayTranslate(0,0,1);
        scene.items.push(sphere);

        this.initVbos();
    }

    initCSG() {
        var scene = this.scene;

        this.camController.setEyePos(vec4.fromValues(-10, 5, 2, 1));
        this.camController.setLookDirection(20, -5);

        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);

        scene.recursionDepth = 2;
        scene.shadowRayCount = 1;

        scene.lights = [];

        var sun = new Sun();
        scene.lights.push(sun);

        var light = new Light(5,0,1,1);
        scene.lights.push(light);

        scene.items = [];

        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var glass = new Glass();
        var plastic = new Plastic();

        var sphere = new Sphere();
        var mirror = new Mirror();
        sphere.setMaterial(glass);
        sphere.rayTranslate(0,-.5,0);

        var sphere2 = new Sphere();
        sphere2.setMaterial(glass);

        var cylinder = new Cylinder();
        cylinder.setMaterial(glass);
        cylinder.rayTranslate(3,3,1);
        scene.items.push(cylinder);

        var lens = new Intersection(sphere, sphere2);
        lens.rayTranslate(3,-4,1);
        scene.items.push(lens);

        var cylinder2 = new Cylinder();
        cylinder2.rayTranslate(0,0,1);
        
        var slab = new Slab();
        slab.rayTranslate(0,0,1.1);
        slab.rayRotate(85, 1, 0, 0);
        var intersect1 = new Intersection(cylinder2, slab);

        var slab2 = new Slab();
        slab2.rayTranslate(0,0,.5);
        slab2.rayRotate(-35, 1, 0, 0);

        var slab3 = new Slab();
        slab3.rayTranslate(0,0,.5);
        slab3.rayRotate(205, 1,0,0);

        var intersect2 = new Intersection(slab3, slab2);
        var intersect3 = new Intersection(intersect1, intersect2);

        intersect3.rayTranslate(12,0,0);

        intersect3.setMaterial(mirror);
        scene.items.push(intersect3);

        this.initVbos();
    }

    initNoise() {
        var scene = this.scene;

        this.camController.setEyePos(vec4.fromValues(0, -5, 1, 1));
        this.camController.setLookDirection(-90, 0);

        scene.recursionDepth = 1;
        scene.shadowRayCount = 1;

        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);

        scene.lights = [];

        var sun = new Sun();
        scene.lights.push(sun);

        var light = new Light(0, -6, 1, 2);
        light.rayScale(.1, .1, .1);
        scene.lights.push(light);

        scene.items = [];

        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var sphere = new Sphere();
        var noisemap = new NoiseMap(2, 2);
        noisemap.materials[0] = new Glass();
        noisemap.materials[1] = new Checkerboard();

        sphere.setMaterial(noisemap);
        sphere.rayTranslate(0,0,1);

        scene.items.push(sphere);

        this.initVbos();
    }
}