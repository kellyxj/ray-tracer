class SceneSelector {
    constructor(scene, gl, pic, camController) {
        this.scene = scene;
        this.gl = gl;
        this.pic = pic;
        this.camController = camController;
    }
    initVbos() {
        for(var light of scene.lights) {
            light.initVbo(this.gl);
        }

        for(var item of scene.items) {
            if(item.shapeType != shapeTypes.grid) {
                
                item.initVbo(this.gl);
            }
        }
    }
    initMaterials() {
        var scene = this.scene;
        scene.rayCam.rayPerspective(this.camController.fovy, this.camController.aspect, this.camController.near);
        scene.rayCam.rayLookAt(this.camController.eyePosition, this.camController.aimPoint, this.camController.upVector);

        scene.setImageBuffer(this.pic);

        this.lights = [];

        var light = new Sun();
        scene.lights.push(light);

        var light2 = new Light(0, 0, 1, 10);
        light2.setMaterial(new Disco(1, 10));

        var rotateAnim = new AnimationRotate(10, 0, 0, 1);
        light2.animations.push(rotateAnim);

        scene.lights.push(light2);

        var light4 = new Light(-5, 0, 1, .25);
        light4.rayScale(.1,.1,.1);

        var translateAnim = new AnimationTranslate(10, 0, -1, 0);
        light4.animations.push(rotateAnim);
        light4.animations.push(translateAnim);

        scene.lights.push(light4);

        this.items = [];
        var groundGrid = new Grid();
        groundGrid.initVbo(this.gl);
        scene.items.push(groundGrid);

        var sphere3 = new Sphere();
        sphere3.rayTranslate(0, 4, 1.5);
        var checker = new Checkerboard();
        sphere3.setMaterial(checker);

        var rotateAnim2 = new AnimationRotate(-5, 0, 0, 1);
        sphere3.animations.push(rotateAnim2);

        scene.items.push(sphere3);

        this.initVbos();
    }
}