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
    }
    init() {
        
    }
    setImageBuffer(newImage) {
        this.imageBuffer = newImage;
    }
    makeRayTracedImage() {
        
    }
}