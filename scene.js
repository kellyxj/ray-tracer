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
        this.epsilon = 1e-6;
        this.imageBuffer;

        this.eyeRay = new Ray();
        this.rayCam = new Camera();

        this.items = [];
        this.lights = [];

        this.AAtype = antiAliasing.none;

        this.recursionDepth = 1;
        this.sampleRate = 4;
    }
    init(gl, pic, camController) {
        this.rayCam.rayPerspective(camController.fovy, camController.aspect, camController.near);
        this.rayCam.rayLookAt(camController.eyePosition, camController.aimPoint, camController.upVector);
        this.setImageBuffer(pic);

        this.lights = [];

        var light = new Light(20, 0, 1, 10);
        light.initVbo(gl);
        this.lights.push(light);

        var light2 = new Light(-20, 0, 1, 5);
        light2.initVbo(gl);
        this.lights.push(light2);

        var light2 = new Light(0, 20, 5, 3);
        light2.initVbo(gl);
        this.lights.push(light2);

        this.items = [];
        //var groundGrid = new Grid();
        //groundGrid.initVbo(gl);
        //this.items.push(groundGrid);

        var sphere = new Sphere();
        sphere.rayTranslate(-3, 0, 1);
        sphere.initVbo(gl);
        this.items.push(sphere);

        var sphere2 = new Sphere();
        sphere2.rayTranslate(0, 0, 1);
        sphere2.initVbo(gl);
        this.items.push(sphere2);

        var sphere3 = new Sphere();
        sphere3.rayTranslate(0, 3, 1);
        sphere3.initVbo(gl);
        this.items.push(sphere3);

        var disk = new Disk();
        disk.rayTranslate(0, -4, 1);
        disk.rayRotate(90, 1, 0, 0);
        disk.initVbo(gl);
        this.items.push(disk);
        
        var disk2 = new Disk();
        disk2.rayTranslate(4, 4, 1);
        disk2.rayRotate(90, 0, 1, 0);
        disk2.rayRotate(-45, 1, 0, 0);
        disk2.initVbo(gl);
        this.items.push(disk2);
    }
    setImageBuffer(newImage) {
        this.rayCam.setSize(newImage.xSize, newImage.ySize);
        this.imageBuffer = newImage;
    }
    traceRay(eyeRay, hitList, depth, inShadow) {
        for(const item of this.items) {
            item.trace(eyeRay, hitList);
        }
        for(const light of this.lights) {
            light.trace(eyeRay, hitList);
        }
        if(!inShadow) {
            this.findShade(hitList, depth, inShadow);
        }
    }
    findShade(hitList, depth, inShadow) {
        if(hitList.size == 0) {
            var hit = new Hit();
            hitList.insert(hit);
        }
        var closest = hitList.getMin();
        var material = closest.geometry.getMaterial(closest.modelSpacePos[0], closest.modelSpacePos[1], closest.modelSpacePos[2]);

        closest.viewVec = vec4.create();
        vec4.subtract(closest.viewVec, this.rayCam.eyePoint, closest.position);
        vec4.normalize(closest.viewVec, closest.viewVec);

        if(closest.geometry.shapeType == shapeTypes.none || closest.geometry.shapeType == shapeTypes.light ) {
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
                this.traceRay(shadowRay, shadowRayHitList, depth+1, true);

                var d = Math.sqrt(vec4.dot(L,L));
                
                //direct illumination case
                if(shadowRayHitList.getMin().geometry.shapeType == shapeTypes.none || shadowRayHitList.getMin().geometry.shapeType == shapeTypes.light ) {
                    var N = vec4.create();
                    vec4.copy(N, closest.normal);
                    var C = vec4.create();
                    vec4.scale(C, N, vec4.dot(L,N));
                    var R = vec4.create();
                    vec4.scale(R, C, 2);
                    vec4.subtract(R, R, L);
                    vec4.normalize(R, R);
                    vec4.normalize(L, L);
                    const lambertian = vec4.dot(L,N);

                    var attenuation = 1;

                    if(closest.geometry.shapeType != shapeTypes.grid) {
                        attenuation = 1/d;
                    }

                    closest.color[0] += attenuation*light.brightness*light.Id[0] * material.Kd[0]*Math.max(0, lambertian);
                    closest.color[1] += attenuation*light.brightness*light.Id[1] * material.Kd[1]*Math.max(0, lambertian);
                    closest.color[2] += attenuation*light.brightness*light.Id[2] * material.Kd[2]*Math.max(0, lambertian);

                    closest.color[0] += attenuation*light.brightness*light.Is[0] * material.Ks[0]* Math.pow(Math.max(0, vec4.dot(R,closest.viewVec)),material.s);
                    closest.color[1] += attenuation*light.brightness*light.Is[1] * material.Ks[1]* Math.pow(Math.max(0, vec4.dot(R,closest.viewVec)),material.s);
                    closest.color[2] += attenuation*light.brightness*light.Is[2] * material.Ks[2]* Math.pow(Math.max(0, vec4.dot(R,closest.viewVec)),material.s);
                }
            }
            closest.color[0] += light.Ia[0] * material.Ka[0];
            closest.color[1] += light.Ia[1] * material.Ka[1];
            closest.color[2] += light.Ia[2] * material.Ka[2];

            if(closest.geometry.getMaterial().reflectance > 0) {
                //spawn a reflected ray
                var reflectedRay = new Ray();
                var reflectedRayHitList = new HitList();

                vec4.copy(reflectedRay.origin, closest.position);
                vec4.scaleAndAdd(reflectedRay.origin, reflectedRay.origin, closest.viewVec, this.epsilon);
                
                var N = vec4.create();
                vec4.copy(N, closest.normal);
                var V = vec4.create();
                vec4.copy(V, closest.viewVec);

                var C = vec4.create();
                vec4.scale(C, N, vec4.dot(V, N));
                var R = vec4.create();
                vec4.scale(R, C, 2);
                vec4.subtract(R, R, L);
                vec4.normalize(R,R);

                vec4.copy(reflectedRay.dir, R);

                if(depth < this.recursionDepth) {
                    this.traceRay(reflectedRay, reflectedRayHitList, depth+1, inShadow);
                }
                var bounceHit = reflectedRayHitList.getMin();
                var bounceMat = bounceHit.geometry.getMaterial(bounceHit.modelSpacePos[0], bounceHit.modelSpacePos[1], bounceHit.modelSpacePos[2]);
                if(bounceHit.geometry.shapeType == shapeTypes.none) {
                    closest.color[0] += .5*bounceMat.Kd[0];
                    closest.color[1] += .5*bounceMat.Kd[1];
                    closest.color[2] += .5*bounceMat.Kd[2];
                }
                else {
                    closest.color[0] += .5*bounceHit.color[0];
                    closest.color[1] += .5*bounceHit.color[1];
                    closest.color[2] += .5*bounceHit.color[2];
                }
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
                    this.traceRay(this.eyeRay, hitList, 0, false);
    
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

                            this.traceRay(this.eyeRay, hitList, 0, false);

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