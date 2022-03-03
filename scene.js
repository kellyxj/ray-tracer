class Hit {
    init() {

    }
}

class HitList {

}

class Scene {
    constructor() {
        this.epsilon = 1e-10;
        this.imageBuffer;

        this.eyeRay = new Ray();
        this.rayCam = new Camera();

        this.items = [];

        this.skyColor = vec4.fromValues( 0.3,1.0,1.0,1.0);
    }
    init(gl) {
        this.rayCam.rayPerspective();
        this.rayCam.rayLookAt();
        this.setImageBuffer();

        this.items = [];
        var groundGrid = new Grid();
        groundGrid.initVbo(gl);
        this.items.push(groundGrid);

        var disk = new Disk();
        //this.items.push(disk);
    }
    setImageBuffer(newImage) {
        this.imageBuffer = newImage;
    }
    makeRayTracedImage() {
        
    }
}