class Hit {
    constructor() {
        this.geometry = new Geometry();
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
        this.size = 0;
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
        this.size = index+1;
    }
    getMin() {
        return this.hitPoints[this.minIndex];
    }
    getMax() {
        return this.hitPoints[this.maxIndex];
    }
}

const antiAliasing = {
    none : 0,
    jitteredSS: 1
}

class Scene {
    constructor() {
        this.epsilon = 1e-10;
        this.imageBuffer;

        this.eyeRay = new Ray();
        this.rayCam = new Camera();

        this.items = [];
        this.lights = [];

        this.skyColor = vec4.fromValues( 0.3,1.0,1.0,1.0);

        this.AAtype = antiAliasing.jitteredSS;
    }
    init(gl, pic, camController) {
        this.rayCam.rayPerspective(camController.fovy, camController.aspect, camController.near);
        this.rayCam.rayLookAt(camController.eyePosition, camController.aimPoint, camController.upVector);
        this.setImageBuffer(pic);

        this.lights = [];
        var light = new Light();
        light.initVbo(gl);
        this.lights.push(light);

        this.items = [];
        var groundGrid = new Grid();
        groundGrid.initVbo(gl);
        this.items.push(groundGrid);

        var disk = new Disk();
        disk.rayTranslate(0,0,3);
        disk.rayRotate(90, 0, 1, 0);
        disk.initVbo(gl);
        this.items.push(disk);

        var sphere = new Sphere();
        sphere.rayTranslate(2, 0, 1);
        sphere.initVbo(gl);
        this.items.push(sphere);
    }
    setImageBuffer(newImage) {
        this.rayCam.setSize(newImage.xSize, newImage.ySize);
        this.imageBuffer = newImage;
    }
    traceRay(eyeRay, hitList) {
        for(const item of this.items) {
            item.trace(eyeRay, hitList);
        }
        for(const light of this.lights) {
            light.trace(eyeRay, hitList);
        }
        this.findShade(hitList);
    }
    findShade(hitList) {
        if(hitList.size == 0) {
            var hit = new Hit();
            hitList.insert(hit);
        }
        var closest = hitList.getMin();
        var material = closest.geometry.getMaterial(closest.modelSpacePos[0], closest.modelSpacePos[1], closest.modelSpacePos[2]);
        closest.color = vec4.fromValues(material.Ki[0], material.Ki[1], material.Ki[2], 1);
    }
    makeRayTracedImage(camController) {
        this.rayCam.rayPerspective(camController.fovy, camController.aspect, camController.near);
        this.rayCam.rayLookAt(camController.eyePosition, camController.aimPoint, camController.upVector);
        this.imageBuffer.setTestPattern();

        for(let i = 0; i < this.imageBuffer.xSize; i++) {
            for(let j = 0; j < this.imageBuffer.ySize; j++) {
                if(this.AAtype == antiAliasing.none) {
                    var hitList = new HitList();

                    this.rayCam.setEyeRay(this.eyeRay, i+.5, j+.5);
                    this.traceRay(this.eyeRay, hitList);
    
                    const index = (j * this.imageBuffer.xSize + i) * 4;
                    
                    this.imageBuffer.floatBuffer[index] = hitList.getMin().color[0];
                    this.imageBuffer.floatBuffer[index+1] = hitList.getMin().color[1];
                    this.imageBuffer.floatBuffer[index+2] = hitList.getMin().color[2];
                    this.imageBuffer.floatBuffer[index+3] = hitList.getMin().color[3];
                }
                else if(this.AAtype == antiAliasing.jitteredSS) {
                    for(let k = 0; k < 4; k++) {
                        for(let m = 0; m < 4; m++) {
                            var hitList = new HitList();
                            this.rayCam.setEyeRay(this.eyeRay, i+.25*k+.5*(Math.random()-1), j+.25*m+.5*(Math.random()-1));

                            this.traceRay(this.eyeRay, hitList);

                            const index = (j * this.imageBuffer.xSize + i) * 4;
                            
                            this.imageBuffer.floatBuffer[index] += .0625*hitList.getMin().color[0];
                            this.imageBuffer.floatBuffer[index+1] += .0625*hitList.getMin().color[1];
                            this.imageBuffer.floatBuffer[index+2] += .0625*hitList.getMin().color[2];
                            this.imageBuffer.floatBuffer[index+3] += .0625*hitList.getMin().color[3];
                        }
                    }
                }
            }
        }
        this.imageBuffer.toInt();
    }
}