class SceneSelector {
    constructor(scene, gl, pic, camController) {
        this.scene = scene;
        this.gl = gl;
        this.pic = pic;
        this.camController = camController;
        
        this.maxIndex = 13;
        this.index = Math.floor(Math.random()*this.maxIndex);
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
        scene.shadowRayCount = 1;

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

        scene.recursionDepth = 2;
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

        var light2 = new Light(0, 0, .15, .1);
        light2.rayScale(.1, .1, .1);
        scene.lights.push(light2);

        scene.items = [];

        var groundGrid = new Grid();
        scene.items.push(groundGrid);

        var shuffler = [];

        var air = new Air();
        var mirror = new Mirror();
        var glass = new Glass();
        var plastic = new Plastic();
        var plastic2 = new Plastic();
        var noisemap = new NoiseMap(4,2);
        var noisemap2 = new NoiseMap(2, 2);
        glass.Kd = [0,.6,.6];
        var checker = new NoisedCheckerboard(3, 2, 2, 1);
        checker.materials[0] = mirror;
        checker.materials[1] = air;
        checker.materials[2] = air;

        var sphere = new Sphere();

        sphere.setMaterial(checker);
        sphere.rayTranslate(0,0,1);

        shuffler.push(sphere);

        var checker2 = new NoisedCheckerboard(10, 5, 5, .2);
        for(var material of checker2.materials) {
            material.Ke[0] = material.Kd[0]/3;
            material.Ke[1] = material.Kd[1]/3;
            material.Ke[2] = material.Kd[2]/3;
        }

        var sphere2 = new Sphere();

        sphere2.setMaterial(checker2);
        sphere2.rayTranslate(0,0,1);
        
        shuffler.push(sphere2);

        var sphere3 = new Sphere();
        sphere3.setMaterial(noisemap);
        noisemap.materials[0].Kd = [.5, 1, .5];
        noisemap.materials[1].Kd = [1, .4, .4];
        noisemap.materials[2].Kd = [.4, .5, 1];
        noisemap.materials[3].Kd = [1, 1, 1];
        for(var material of noisemap.materials) {
            material.Ke[0] = material.Kd[0]/3;
            material.Ke[1] = material.Kd[1]/3;
            material.Ke[2] = material.Kd[2]/3;
        }
        noisemap.partition[0] = -.7;
        noisemap.partition[1] = -.1;
        noisemap.partition[2] = .4;
        sphere3.rayTranslate(0,0,1);

        shuffler.push(sphere3);

        var sphere4 = new Sphere();
        noisemap2.materials[0] = mirror;
        noisemap2.materials[1] = air;
        sphere4.setMaterial(noisemap2);
        sphere4.rayTranslate(0,0,1);

        shuffler.push(sphere4);

        var sphere5 = new Sphere();
        var noisemap3 = new LerpedColors(2, mirror, air);
        sphere5.setMaterial(noisemap3);
        sphere5.rayTranslate(0,0,1);

        shuffler.push(sphere5);

        var sphere6 = new Sphere();
        glass.n_r = 2.5;
        var noisemap4 = new LerpedColors(2, glass, air);
        sphere6.setMaterial(noisemap4);
        sphere6.rayTranslate(0,0,1);

        shuffler.push(sphere6);

        var sphere7 = new Sphere();
        var glass2 = new Glass();
        glass2.Kd = [.8,.6,.8];
        var noisemap5 = new LerpedColors(1, glass2, mirror);
        sphere7.setMaterial(noisemap5);
        sphere7.rayTranslate(0,0,1);

        shuffler.push(sphere7);

        var sphere8 = new Sphere();
        var black = new Plastic();
        black.Kd = [1,1,1];
        var white = new Plastic();
        white.Kd = [0,0,0];

        var noisemap6 = new LerpedColors(1, black, white);
        sphere8.setMaterial(noisemap6);
        sphere8.rayTranslate(0,0,1);

        shuffler.push(sphere8);

        var sphere9 = new Sphere();
        var checker3 = new Checkerboard(mirror, air);
        sphere9.setMaterial(checker3);
        sphere9.rayTranslate(0,0,1);

        shuffler.push(sphere9);

        var sphere10 = new Sphere();
        var noisemap7 = new NoiseMap(2, 2);
        var noisemap8 = new LerpedColors(4, plastic, plastic2);
        noisemap7.materials[0] = air;
        noisemap7.materials[1] = noisemap8;
        sphere10.setMaterial(noisemap7);
        sphere10.rayTranslate(0,0,1);

        shuffler.push(sphere10);

        var checker4 = new NoisedCheckerboard(3, 1, 2, .6);
        checker4.materials[0] = mirror;
        checker4.materials[1] = plastic;
        checker4.materials[2] = air;

        var sphere11 = new Sphere();
        sphere11.setMaterial(checker4);
        sphere11.rayTranslate(0,0,1);

        shuffler.push(sphere11);

        var sphere12 = new Sphere();
        var noisemap9 = new NoiseMap(3, 4);
        noisemap9.materials[1] = air;
        noisemap9.partition[0] = -.5;
        noisemap9.partition[1] = .5;
        noisemap9.materials[0] = mirror;
        sphere12.setMaterial(noisemap9);
        sphere12.rayTranslate(0,0,1);

        shuffler.push(sphere12);

        var sphere13 = new Sphere();
        var mirror2 = new Mirror();
        var glass2 = new Glass();
        
        sphere13.bumpNormals = true;
        glass2.bumpAmount = .02;

        sphere13.setMaterial(plastic);
        sphere13.rayTranslate(0,0,1);

        shuffler.push(sphere13);

        scene.items.push(shuffler[this.index]);

        this.initVbos();
    }
}