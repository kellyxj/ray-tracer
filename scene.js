class Hit {
    constructor() {
        this.geometry;
        this.t0 = 1e12;
        
        this.position = vec4.create();
        this.normal = vec4.create();
        this.viewVec = vec4.create(); //points to camera
        this.isEntry = true;
        this.modelSpacePos = vec4.create();
        this.color = vec4.fromValues( 0.3,1.0,1.0,1.0);
    }
}

class HitList {
    constructor() {
        this.hitPoints = [];
        this.minIndex = 0;
        this.maxIndex = 0;
        this.max_t0 = 0;
        this.min_t0 = 1e12;
    }
    insert(hit) {
        const index = this.hitPoints.push(hit) - 1;
        if(hit.t0 < this.min_t0) {
            this.minIndex = index;
            this.min_t0 = hit.t0;
        }
        if(hit.t0 > this.max_t0) {
            this.maxIndex = index;
            this.max_t0 = hit.t0;
        }
    }
    getMin() {
        return this.hitPoints[this.minIndex];
    }
    getMax() {
        return this.hitPoints[this.maxIndex];
    }
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
    init(gl, pic, camController) {
        this.rayCam.rayPerspective(camController.fovy, camController.aspect, camController.near);
        this.rayCam.rayLookAt(camController.eyePosition, camController.aimPoint, camController.upVector);
        this.setImageBuffer(pic);

        this.items = [];
        var groundGrid = new Grid();
        groundGrid.initVbo(gl);
        this.items.push(groundGrid);

        var disk = new Disk();
        //this.items.push(disk);
    }
    setImageBuffer(newImage) {
        this.rayCam.setSize(newImage.xSize, newImage.ySize);
        this.imageBuffer = newImage;
    }
    traceRay(eyeRay, hitList) {
        for(const item of this.items) {
            item.trace(eyeRay, hitList);
        }
    }
    findShade(hitList) {

    }
    makeRayTracedImage(camController) {
        this.rayCam.rayPerspective(camController.fovy, camController.aspect, camController.near);
        this.rayCam.rayLookAt(camController.eyePosition, camController.aimPoint, camController.upVector);

        for(let i = 0; i < this.imageBuffer.xSize; i++) {
            for(let j = 0; j < this.imageBuffer.ySize; j++) {
                var hitlist = new HitList();

                this.rayCam.setEyeRay(this.eyeRay, i, j);
                this.traceRay(this.eyeRay, hitlist);

                const index = (j * this.imageBuffer.xSize + i) * 4;
                this.imageBuffer.floatBuffer[index] = hitlist.getMin().color[0];
                this.imageBuffer.floatBuffer[index+1] = hitlist.getMin().color[1];
                this.imageBuffer.floatBuffer[index+2] = hitlist.getMin().color[2];
                this.imageBuffer.floatBuffer[index+3] = hitlist.getMin().color[3];
            }
        }
        this.imageBuffer.toInt();
    }
}