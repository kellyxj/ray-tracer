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

        this.material = new Material();
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

        this.AAtype = antiAliasing.jitteredSS;

        this.recursionDepth = 2;
        this.sampleRate = 2;

        //used for soft shadows
        this.shadowRayCount = 1;

        this.frameRate = 60;
        this.exposureTime = 100;
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
        var phong = closest.material.getColor(closest.modelSpacePos);

        var V = vec4.create();
        vec4.copy(V, closest.viewVec);

        if(closest.geometry.shapeType == shapeTypes.none) {
            closest.color = vec4.fromValues(phong.Kd[0], phong.Kd[1], phong.Kd[2], 1);
        }
        else {
            for(var light of this.lights) {
                for(let i = 0; i < this.shadowRayCount; i++) {
                    //spawn a shadow ray
                    var shadowRay = new Ray();
                    vec4.copy(shadowRay.origin, closest.position);
                    var directionVec = vec4.create();

                    var lightCenter = vec4.fromValues(0,0,0,1);
                    vec4.transformMat4(lightCenter, lightCenter, light.modelMatrix);

                    var L = vec4.create();
                    vec4.subtract(L, lightCenter, closest.position);

                    vec3.normalize(directionVec, L);
                    if(this.shadowRayCount == 1) {
                        vec4.copy(shadowRay.dir, directionVec);
                    }

                    else{
                        var randVec = vec4.fromValues(2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1, 0);
                        var source = vec4.create();
                        vec4.scaleAndAdd(source, L, randVec, light.radius);
                        vec4.normalize(shadowRay.dir, source);
                    }
                    vec4.scaleAndAdd(shadowRay.origin, shadowRay.origin, V, this.epsilon);

                    var shadowRayHitList = new HitList();

                    this.traceRay(shadowRay, shadowRayHitList, depth, true);

                    var d = Math.sqrt(vec4.dot(L,L));

                    var shadowHitPoint = shadowRayHitList.getMin();
                    //direct illumination case
                    if(shadowHitPoint.geometry.shapeType == shapeTypes.none || shadowHitPoint.geometry.shapeType == shapeTypes.light) {
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

                        var attenuation = 1/d;
                        var scale = 1/this.shadowRayCount;

                        var lightProps = light.material.getLight(shadowHitPoint.modelSpacePos);

                        closest.color[0] += scale*attenuation*lightProps.brightness*lightProps.Id[0] * phong.Kd[0]*Math.max(0, lambertian);
                        closest.color[1] += scale*attenuation*lightProps.brightness*lightProps.Id[1] * phong.Kd[1]*Math.max(0, lambertian);
                        closest.color[2] += scale*attenuation*lightProps.brightness*lightProps.Id[2] * phong.Kd[2]*Math.max(0, lambertian);

                        closest.color[0] += scale*attenuation*lightProps.brightness*lightProps.Is[0] * phong.Ks[0]* Math.pow(Math.max(0, vec4.dot(R,V)),phong.s);
                        closest.color[1] += scale*attenuation*lightProps.brightness*lightProps.Is[1] * phong.Ks[1]* Math.pow(Math.max(0, vec4.dot(R,V)),phong.s);
                        closest.color[2] += scale*attenuation*lightProps.brightness*lightProps.Is[2] * phong.Ks[2]* Math.pow(Math.max(0, vec4.dot(R,V)),phong.s);
                    }
                }
                var ambient = light.material.getAmbient();

                closest.color[0] += ambient[0] * phong.Ka[0];
                closest.color[1] += ambient[1] * phong.Ka[1];
                closest.color[2] += ambient[2] * phong.Ka[2]; 
            }
            closest.color[0] += phong.Ke[0];
            closest.color[1] += phong.Ke[1];
            closest.color[2] += phong.Ke[2];

            var reflectance = closest.material.getReflectance(closest.modelSpacePos);
            if(reflectance > 0) {
                //spawn a reflected ray
                var reflectedRay = new Ray();
                var reflectedRayHitList = new HitList();

                vec4.copy(reflectedRay.origin, closest.position);
                vec4.scaleAndAdd(reflectedRay.origin, reflectedRay.origin, V, this.epsilon);
                
                var N = vec4.create();
                vec4.copy(N, closest.normal);

                var C = vec4.create();
                vec4.scale(C, N, vec4.dot(V, N));
                var R = vec4.create();
                vec4.scale(R, C, 2);
                vec4.subtract(R, R, V);
                vec4.normalize(R,R);

                vec4.copy(reflectedRay.dir, R);

                if(depth < this.recursionDepth) {
                    this.traceRay(reflectedRay, reflectedRayHitList, depth+1, false);
                }
                var bounceHit = reflectedRayHitList.getMin();
                var bouncePhong = bounceHit.material.getColor(bounceHit.modelSpacePos);
                if(bounceHit.geometry.shapeType == shapeTypes.none) {
                    closest.color[0] += reflectance*bouncePhong.Kd[0];
                    closest.color[1] += reflectance*bouncePhong.Kd[1];
                    closest.color[2] += reflectance*bouncePhong.Kd[2];
                }
                else{
                    closest.color[0] += reflectance*bounceHit.color[0];
                    closest.color[1] += reflectance*bounceHit.color[1];
                    closest.color[2] += reflectance*bounceHit.color[2];
                }
            }
            var transparency = closest.material.getTransparency(closest.modelSpacePos);
            if(transparency > 0) {
                //spawn a transparency ray
                var transparencyRay = new Ray();
                var transparencyRayHitList = new HitList();
                vec4.copy(transparencyRay.origin, closest.position);
                vec4.scaleAndAdd(transparencyRay.origin, transparencyRay.origin, V, -this.epsilon);

                vec4.negate(transparencyRay.dir, V);

                var N = vec4.create();
                vec4.copy(N, closest.normal);

                var n_i = 1;
                var n_t = 1;
                if(closest.isEntry) {
                    n_t = closest.material.n_r;
                }
                else {
                    n_i = closest.material.n_r;
                }
                var inwardNormal = vec4.create();
                vec4.negate(inwardNormal, N);
                var dot = vec4.dot(transparencyRay.dir, inwardNormal);
                var det = (n_i*n_i/(n_t*n_t) * (1-dot * dot));

                //if det > 1 we have total internal reflection
                if(det <= 1) {
                    var parallel = vec4.create();
                    var orthog = vec4.create();
                    vec4.scale(parallel, inwardNormal, Math.sqrt(1-det));
                    vec4.scaleAndAdd(orthog, transparencyRay.dir, inwardNormal, -dot);
                    vec4.scale(orthog, orthog, n_i/n_t);
                    vec4.add(transparencyRay.dir, parallel, orthog);
                    if(depth < this.recursionDepth) {
                        this.traceRay(transparencyRay, transparencyRayHitList, depth+1, false);
                    }
                }

                var transparencyHit = transparencyRayHitList.getMin();
                var transparencyPhong = transparencyHit.material.getColor(transparencyHit.modelSpacePos);
                var d = vec4.distance(closest.position, transparencyHit.position);

                var attenuation = Math.pow(Math.E, -transparencyHit.material.absorption*d);

                if(transparencyHit.geometry.shapeType == shapeTypes.none) {
                    closest.color[0] += attenuation*transparency*transparencyPhong.Kd[0];
                    closest.color[1] += attenuation*transparency*transparencyPhong.Kd[1];
                    closest.color[2] += attenuation*transparency*transparencyPhong.Kd[2];
                }
                else {
                    closest.color[0] += attenuation*transparency*transparencyHit.color[0];
                    closest.color[1] += attenuation*transparency*transparencyHit.color[1];
                    closest.color[2] += attenuation*transparency*transparencyHit.color[2];
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
                    var d = 1/this.sampleRate;
                    for(let k = 0; k < this.sampleRate; k++) {
                        for(let m = 0; m < this.sampleRate; m++) {
                            var hitList = new HitList();
                            this.rayCam.setEyeRay(this.eyeRay, .5*d+i+d*k+d*(Math.random()-1), .5*d+j+d*m+d*(Math.random()-1));

                            this.traceRay(this.eyeRay, hitList, 0, false);

                            const index = (j * this.imageBuffer.xSize + i) * 4;
                            
                            this.imageBuffer.floatBuffer[index] += d*d*hitList.getMin().color[0];
                            this.imageBuffer.floatBuffer[index+1] += d*d*hitList.getMin().color[1];
                            this.imageBuffer.floatBuffer[index+2] += d*d*hitList.getMin().color[2];
                            this.imageBuffer.floatBuffer[index+3] += d*d*hitList.getMin().color[3];
                        }
                    }
                }
            }
        }
        this.imageBuffer.toInt();
    }
}