class Hit {
    constructor() {
        this.geometry = new Geometry();
        this.t0 = 1e12;
        
        this.position = vec4.create();
        this.normal = vec4.create();
        this.viewVec = vec4.create(); //points to camera
        this.isEntry = true;
        this.modelSpacePos = vec4.create();
        this.color = vec4.fromValues( 0,0,0,1);
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
        if(this.size > 0) {
            return this.hitPoints[this.minIndex];
        }
        else {
            var hit = new Hit();
            return hit;
        }
    }
    getMax() {
        if(this.size > 0) {
            return this.hitPoints[this.maxIndex];
        }
        else {
            var hit = new Hit();
            return hit;
        }
    }
}

const antiAliasing = {
    none : 0,
    jitteredSS: 1
}

class Scene {
    constructor() {
        this.epsilon = 1e-4;
        this.imageBuffer;

        this.eyeRay = new Ray();
        this.rayCam = new Camera();

        this.items = [];
        this.lights = [];

        this.skyColor = vec4.fromValues( 0.3,1.0,1.0,1.0);

        this.AAtype = antiAliasing.none;

        this.recursionDepth = 1;
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
        disk.rayRotate(45, 0, 1, 0);
        disk.initVbo(gl);
        this.items.push(disk);

        var sphere = new Sphere();
        sphere.rayTranslate(-1, 0, 1);
        sphere.initVbo(gl);
        this.items.push(sphere);
    }
    setImageBuffer(newImage) {
        this.rayCam.setSize(newImage.xSize, newImage.ySize);
        this.imageBuffer = newImage;
    }
    traceRay(eyeRay, hitList, depth) {
        for(const item of this.items) {
            item.trace(eyeRay, hitList);
        }
        for(const light of this.lights) {
            light.trace(eyeRay, hitList);
        }
        this.findShade(hitList, depth);
    }
    findShade(hitList, depth) {
        if(hitList.size == 0) {
            var hit = new Hit();
            hitList.insert(hit);
        }
        var closest = hitList.getMin();
        var material = closest.geometry.getMaterial(closest.modelSpacePos[0], closest.modelSpacePos[1], closest.modelSpacePos[2]);

        closest.viewVec = vec4.create();
        vec4.subtract(closest.viewVec, this.rayCam.eyePoint, closest.position);
        vec4.normalize(closest.viewVec, closest.viewVec);

        if(closest.geometry.shapeType == shapeTypes.light || closest.geometry.shapeType == shapeTypes.none) {
            closest.color = vec4.fromValues(material.Kd[0], material.Kd[1], material.Kd[2], 1);
        }
        else {
            for(var light of this.lights) {
                //spawn a shadow ray
                var shadowRay = new Ray();
                vec4.copy(shadowRay.origin, closest.position);
                var directionVec = vec4.create();

                var lightCenter = vec4.fromValues(0,0,0,1);
                vec4.transformMat4(lightCenter, lightCenter, light.modelMatrix);
    
                var L = vec4.create();
                vec4.subtract(L, lightCenter, closest.position);
                vec3.normalize(directionVec, L);
                vec4.copy(shadowRay.dir, directionVec);

                vec4.scaleAndAdd(shadowRay.origin, shadowRay.origin, closest.viewVec, this.epsilon);
    
                var shadowRayHitList = new HitList();
                if(depth < this.recursionDepth) {
                    this.traceRay(shadowRay, shadowRayHitList, depth+1);
                }
                
                if(shadowRayHitList.getMin().geometry.shapeType == shapeTypes.none || shadowRayHitList.getMin().geometry.shapeType == shapeTypes.light) {
                    var N = vec4.create();
                    vec4.copy(N, closest.normal);
                    var C = vec4.create();
                    let lambertian = vec4.dot(L,N);
                    vec4.scale(C, N, lambertian);
                    var R = vec4.create();
                    vec4.scale(R, C, 2);
                    vec4.subtract(R, R, L);
                    var V = vec4.create();
                    vec4.copy(V, closest.viewVec);

                    vec4.normalize(L, L);
                    vec4.normalize(R, R);
                    lambertian = vec4.dot(L,N);

                    closest.color[0] += light.Id[0] * material.Kd[0]*Math.max(0, lambertian);
                    closest.color[1] += light.Id[1] * material.Kd[1]*Math.max(0, lambertian);
                    closest.color[2] += light.Id[2] * material.Kd[2]*Math.max(0, lambertian);

                    closest.color[0] += light.Is[0] * material.Ks[0]* Math.pow(Math.max(0, vec4.dot(R,V)),material.s);
                    closest.color[1] += light.Is[1] * material.Ks[1]* Math.pow(Math.max(0, vec4.dot(R,V)),material.s);
                    closest.color[2] += light.Is[2] * material.Ks[2]* Math.pow(Math.max(0, vec4.dot(R,V)),material.s);
                }
                closest.color[0] += light.Ia[0] * material.Ka[0];
                closest.color[1] += light.Ia[1] * material.Ka[1];
                closest.color[2] += light.Ia[2] * material.Ka[2];
            }
        }
    }
    makeRayTracedImage(camController) {
        this.rayCam.rayPerspective(camController.fovy, camController.aspect, camController.near);
        this.rayCam.rayLookAt(camController.eyePosition, camController.aimPoint, camController.upVector);
        this.imageBuffer.setTestPattern();

        for(let i = 0; i < this.imageBuffer.xSize; i++) {
            for(let j = 0; j < this.imageBuffer.ySize; j++) {
        //for(let i = this.imageBuffer.xSize/2; i < this.imageBuffer.xSize/2+1; i++) {
        //    for(let j = this.imageBuffer.ySize/2; j < this.imageBuffer.ySize/2+1; j++) {
                if(this.AAtype == antiAliasing.none) {
                    var hitList = new HitList();

                    this.rayCam.setEyeRay(this.eyeRay, i+.5, j+.5);
                    this.traceRay(this.eyeRay, hitList, 0);
    
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

                            this.traceRay(this.eyeRay, hitList, 0);

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