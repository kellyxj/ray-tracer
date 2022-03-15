const shapeTypes = {
    none : 0,
    grid : 1,
    disk : 2,
    sphere: 3,
    cylinder: 4,
    light: 5
}

class Geometry {
    constructor() {
        this.modelMatrix = mat4.create();
        this.worldToModel = mat4.create();
        this.normalToWorld = mat4.create();
        this.vboBox = new VBObox();
        this.shapeType = shapeTypes.none;

        this.animations = [];

        this.material = new Material();
        this.renderOn = true;

        this.bumpNormals = false;
    }
    initVbo(gl) {
        
    }
    setMaterial(m) {
        this.material = m;
    }
    //given x, y, z coordinates in model space, return world space normal
    getNormal(pos) {

    }
    setIdentity() {
        mat4.setIdentity(this.modelMatrix);
        mat4.setIdentity(this.worldToModel);
        mat4.setIdentity(this.normalToWorld);
    }

    rayTranslate(x,y,z) {
        mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(x,y,z));

        var a = mat4.create();
        a[12] = -x;
        a[13] = -y;
        a[14] = -z;

        mat4.multiply(this.worldToModel, a, this.worldToModel);
        mat4.transpose(this.normalToWorld, this.worldToModel);
    }

    //rotate by angle (in degrees) about vector (x,y,z)
    rayRotate(angle, ax, ay, az) {
        const radians = angle*Math.PI/180;
        mat4.rotate(this.modelMatrix, this.modelMatrix, radians, vec3.fromValues(ax,ay,az));

        var x = ax, y = ay, z = az,
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;
        if (Math.abs(len) < glMatrix.GLMAT_EPSILON) { 
            console.log("CGeom.rayRotate() ERROR!!! zero-length axis vector!!");
            return null; 
        }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(-radians); 
        c = Math.cos(-radians);
        t = 1-c;
        b00 = x * x * t + c;     b01 = x * y * t - z * s; b02 = x * z * t + y * s; 
        b10 = y * x * t + z * s; b11 = y * y * t + c;     b12 = y * z * t - x * s; 
        b20 = z * x * t - y * s; b21 = z * y * t + x * s; b22 = z * z * t + c;
        var b = mat4.create();
        b[ 0] = b00; b[ 4] = b01; b[ 8] = b02; b[12] = 0.0;
        b[ 1] = b10; b[ 5] = b11; b[ 9] = b12; b[13] = 0.0;
        b[ 2] = b20; b[ 6] = b21; b[10] = b22; b[14] = 0.0;
        b[ 3] = 0.0; b[ 7] = 0.0; b[11] = 0.0; b[15] = 1.0;

        mat4.multiply(this.worldToModel,
                    b, this.worldToModel); 
        mat4.transpose(this.normalToWorld, this.worldToModel);
    }

    rayScale(sx, sy, sz) {
        mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(sx, sy, sz));

        if(Math.abs(sx) < glMatrix.GLMAT_EPSILON ||
            Math.abs(sy) < glMatrix.GLMAT_EPSILON ||
            Math.abs(sz) < glMatrix.GLMAT_EPSILON) {
            console.log("CGeom.rayScale() ERROR!! zero-length scale!!!");
            return null;
        }
        var c = mat4.create();
        c[ 0] = 1/sx;
        c[ 5] = 1/sy;
        c[10] = 1/sz;
        mat4.multiply(this.worldToModel,
                      c, this.worldToModel);
        mat4.transpose(this.normalToWorld, this.worldToModel);
    }

    trace(inRay, hitList) {
        
    }
    animate(timeStep) {
        for(var animation of this.animations) {
            if(animation.type == animationTypes.rotate) {
                this.rayRotate(timeStep/1000*animation.amount, animation.ax, animation.ay, animation.az);
            }
            else if(animation.type == animationTypes.translate) {
                this.rayTranslate(timeStep/1000*animation.amount*animation.ax, timeStep/1000*animation.amount*animation.ay, timeStep/1000*animation.amount*animation.az);
            }
            else if(animation.type == animationTypes.scale) {
                this.rayScale(1+(animation.amount-1)*timeStep/1000, 1+(animation.amount-1)*timeStep/1000, 1+(animation.amount-1)*timeStep/1000);
            }
        }
    }

    drawPreview(mvpMatrix) {
        if(this.renderOn && this.vboBox.vboContents) {
            this.vboBox.switchToMe();
            this.vboBox.adjust(this.modelMatrix, mvpMatrix);
            this.vboBox.reload();
            this.vboBox.draw();
        }
    }
}

//plane z = 0
class Grid extends Geometry {
    constructor() {
        super();
        var gridMat = new GroundPlane();
        this.setMaterial(gridMat);
        this.shapeType = shapeTypes.grid;
    }
    initVbo(gl) {
        this.vboBox.init(gl, makeGroundGrid(), 404);
    }
    getNormal(pos) {
        var normVec = vec4.fromValues(0, 0, 1, 0);
        vec4.transformMat4(normVec, normVec, this.normalToWorld);
        vec3.normalize(normVec, normVec);
        normVec[3] = 0;
        return normVec;
    }
    trace(inRay, hitList) {
        var ray = new Ray();

        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        const t0 = -ray.origin[2]/ray.dir[2];

        if(t0 >= 0) {
            var hit = new Hit();
            hit.geometry = this;
            hit.t0 = t0;

            vec4.scaleAndAdd(hit.modelSpacePos, ray.origin, ray.dir, t0);
            vec4.scaleAndAdd(hit.position, inRay.origin, inRay.dir, t0);

            hit.normal = vec4.create();
            vec4.copy(hit.normal, this.getNormal(hit.modelSpacePos));

            hit.material = this.material;
            vec4.subtract(hit.viewVec, inRay.origin, hit.position);
            vec4.normalize(hit.viewVec, hit.viewVec);

            hitList.insert(hit);
        }
    }
}

class Disk extends Geometry {
    constructor(r = 2) {
        super();
        this.radius = r;
        this.shapeType = shapeTypes.disk;
    }
    initVbo(gl) {
        var color = this.material.getColor().Kd;
        this.vboBox.init(gl, makeDisk(this.radius, [color[0],color[1],color[2]]), 20*this.radius+4);
    }
    getNormal(pos) {
        var normVec = vec4.fromValues(0, 0, 1, 0);
        vec4.transformMat4(normVec, normVec, this.normalToWorld);
        vec3.normalize(normVec, normVec);
        normVec[3] = 0;
        return normVec;
    }
    trace(inRay, hitList) {
        var ray = new Ray();

        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        const t0 = -ray.origin[2]/ray.dir[2];
        var hit = new Hit();

        vec4.scaleAndAdd(hit.modelSpacePos, ray.origin, ray.dir, t0);
        var squareDist = hit.modelSpacePos[0]*hit.modelSpacePos[0]+hit.modelSpacePos[1]*hit.modelSpacePos[1];
        
        if(t0 >= 0 && squareDist <= this.radius * this.radius) {
            hit.geometry = this;
            hit.t0 = t0;

            vec4.scaleAndAdd(hit.modelSpacePos, ray.origin, ray.dir, t0);
            vec4.scaleAndAdd(hit.position, inRay.origin, inRay.dir, t0);

            hit.normal = vec4.create();
            vec4.copy(hit.normal, this.getNormal(hit.modelSpacePos));

            hit.material = this.material;
            vec4.subtract(hit.viewVec, inRay.origin,hit.position );
            vec4.normalize(hit.viewVec, hit.viewVec);

            hitList.insert(hit);
        }
    }
}

class Sphere extends Geometry {
    constructor() {
        super();
        this.shapeType = shapeTypes.sphere;
    }
    initVbo(gl) {
        var color = this.material.Kd;
        this.vboBox.init(gl, makeSphere(13, [color[0], color[1], color[2]]), 676);
        this.vboBox.drawMode = gl.LINE_STRIP;
    }
    getNormal(pos) {
        var normVec = vec4.fromValues(pos[0], pos[1], pos[2], pos[3]);
        vec4.transformMat4(normVec, normVec, this.normalToWorld);
        var randVec = vec4.fromValues(2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1, 0);
        vec4.scaleAndAdd(normVec, normVec, randVec, this.bumpNormals ? this.material.bumpAmount : 0);
        vec3.normalize(normVec, normVec);
        normVec[3] = 0;
        return normVec;
    }
    trace(inRay, hitList) {
        var ray = new Ray();

        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        var r2s = vec4.create();
        vec4.subtract(r2s, vec4.fromValues(0,0,0,1), ray.origin);
        var L2 = vec3.dot(r2s,r2s);
        var tcaS = vec3.dot(ray.dir, r2s);

        //rays originating inside sphere
        if(L2 <= 1) {
            var DL2 = vec3.dot(ray.dir, ray.dir);
            var tca2 = tcaS*tcaS/DL2;

            var LM2 = L2 - tca2;

            var L2hc = 1-LM2;
            var t0 = tcaS/DL2 + Math.sqrt(L2hc/DL2);

            var hit = new Hit();
            hit.t0 = t0;
            hit.isEntry = false;
            hit.geometry = this;

            vec4.scaleAndAdd(hit.modelSpacePos, ray.origin, ray.dir, t0);
            vec4.scaleAndAdd(hit.position, inRay.origin, inRay.dir, t0);

            hit.normal = vec4.create();
            vec4.negate(hit.normal, this.getNormal(hit.modelSpacePos));

            hit.material = this.material;
            vec4.subtract(hit.viewVec, inRay.origin, hit.position);
            vec4.normalize(hit.viewVec, hit.viewVec);

            hitList.insert(hit);
        }
     
        //rays originating outside sphere. if tcaS < 0, the sphere is behind the camera
        else if(tcaS >= 0) {
            var DL2 = vec3.dot(ray.dir, ray.dir);
            var tca2 = tcaS*tcaS/DL2;

            var LM2 = L2 - tca2;
            if(LM2 <= 1) {
                var L2hc = 1-LM2;
                var t0 = tcaS/DL2 - Math.sqrt(L2hc/DL2);
                var t1 = tcaS/DL2 + Math.sqrt(L2hc/DL2);

                var firstHit = new Hit();
                firstHit.t0 = t0;
                firstHit.geometry = this;

                vec4.scaleAndAdd(firstHit.modelSpacePos, ray.origin, ray.dir, t0);
                vec4.scaleAndAdd(firstHit.position, inRay.origin, inRay.dir, t0);

                firstHit.normal = vec4.create();
                vec4.copy(firstHit.normal, this.getNormal(firstHit.modelSpacePos));

                firstHit.material = this.material;
                vec4.subtract(firstHit.viewVec, inRay.origin, firstHit.position);
                vec4.normalize(firstHit.viewVec, firstHit.viewVec);

                hitList.insert(firstHit);

                var secondHit = new Hit();
                secondHit.t0 = t1;
                secondHit.geometry = this;
                secondHit.isEntry = false;

                vec4.scaleAndAdd(secondHit.modelSpacePos, ray.origin, ray.dir, t1);
                vec4.scaleAndAdd(secondHit.position, inRay.origin, inRay.dir, t1);

                secondHit.normal = vec4.create();
                vec4.negate(secondHit.normal, this.getNormal(secondHit.modelSpacePos));

                secondHit.material = this.material;
                vec4.subtract(secondHit.viewVec, inRay.origin, secondHit.position);
                vec4.normalize(secondHit.viewVec, secondHit.viewVec);

                hitList.insert(secondHit);
            }
        }
    }
}

class Light extends Sphere {
    constructor (x = 0, y = 0, z = 100, brightness = 1) {
        super();
        this.radius = 1;
        this.shapeType = shapeTypes.light;
        this.material = new Lamp(brightness);

        this.rayTranslate(x, y, z);
    }
    rayScale(sx, sy, sz) {
        mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(sx, sy, sz));
        this.radius *= Math.cbrt(sx*sx+sy*sy+sz*sz);

        if(Math.abs(sx) < glMatrix.GLMAT_EPSILON ||
            Math.abs(sy) < glMatrix.GLMAT_EPSILON ||
            Math.abs(sz) < glMatrix.GLMAT_EPSILON) {
            console.log("CGeom.rayScale() ERROR!! zero-length scale!!!");
            return null;
        }
        var c = mat4.create();
        c[ 0] = 1/sx;
        c[ 5] = 1/sy;
        c[10] = 1/sz;
        mat4.multiply(this.worldToModel,
                      c, this.worldToModel);
        mat4.transpose(this.normalToWorld, this.worldToModel);
    }
    initVbo(gl) {
        this.vboBox.init(gl, makeSphere(13, this.material.Is), 676);
        this.vboBox.drawMode = gl.LINE_STRIP;
    }
}

class Sun extends Light {
    constructor(x=0, y=0, z=10000, brightness = 5000) {
        super(x,y,z,brightness);

        this.rayScale(1000, 1000, 1000, 1);
        this.material = new SunMaterial(brightness);
    }
}

//really bad and buggy CSG implementation
//if using transformed primitives, after the CSG operation is applied, additional transformations applied to the combined CSG object will not work as expected
//i.e. model spaces of all primitives are assumed to be canonical

class CSG extends Geometry {
    constructor(A,B) {
        super();
        this.A = A;
        this.B = B;
    }
    initVbo(gl) {
        this.vboBox.init(gl,makeCube(-1,1,-1,1,-1,1), 16);
        this.vboBox.drawMode = gl.LINE_STRIP;
    }
    rayTranslate(x,y,z) {
        super.rayTranslate(x,y,z);
        this.A.rayTranslate(x,y,z);
        this.B.rayTranslate(x,y,z);
    }
    rayRotate(angle, ax, ay, az) {
        super.rayRotate(angle, ax, ay, az);
        this.A.rayRotate(angle, ax,ay,az);
        this.B.rayRotate(angle, ax,ay,az);
    }
    rayScale(ax, ay, az) {
        super.rayScale(ax,ay,az);
        this.A.rayScale(ax,ay,az);
        this.B.rayScale(ax,ay,az);
    }
    setMaterial(m) {
        this.A.setMaterial(m);
        this.B.setMaterial(m);
    }
}

class Union extends CSG {
    constructor(A,B) {
        super(A,B);
    }
    trace(inRay, hitList) {
        var ray = new Ray();
        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        var hitListA = new HitList();
        this.A.trace(inRay, hitListA);

        var hitListB = new HitList();
        this.B.trace(inRay, hitListB);

        for(var hit of hitListA.hitPoints) {
            hitList.insert(hit);
        }
        for(var hit of hitListB.hitPoints) {
            hitList.insert(hit);
        }
    }
}

class Intersection extends CSG {
    constructor(A,B) {
        super(A,B);
    }
    trace(inRay, hitList) {
        var hitListA = new HitList();
        this.A.trace(inRay, hitListA);

        var hitListB = new HitList();
        this.B.trace(inRay, hitListB);

        var aMin = hitListA.getMin().t0;
        var bMin = hitListB.getMin().t0;

        var aMax = hitListA.getMax().t0;
        var bMax = hitListB.getMax().t0;

        for(var hit of hitListA.hitPoints) {
            if(hit.t0 < bMax && hit.t0 > bMin) {
                hitList.insert(hit);
            }
        }
        for(var hit of hitListB.hitPoints) {
            if(hit.t0 < aMax && hit.t0 > aMin) {
                hitList.insert(hit);
            }
        }
    }
}


//infinitely tall cylinder of radius 1. Used for CFG
class Tube extends Geometry {
    constructor() {
        super();
        this.shapeType = shapeTypes.cylinder;
    }
    initVbo(gl) {
        var color = this.material.getColor().Kd;
        this.vboBox.init(gl, makeCylinder(1,[0,0,0], 1, [color[0],color[1],color[2],color[3]]), 88);
        this.vboBox.drawMode = gl.LINE_STRIP;
    }
    
    getNormal(pos) {
        var normVec = vec4.fromValues(pos[0], pos[1], 0, 0);
        vec4.transformMat4(normVec, normVec, this.normalToWorld);
        vec3.normalize(normVec, normVec);
        normVec[3] = 0;
        return normVec;
    }
    trace(inRay, hitList) {
        var ray = new Ray();

        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        var r2s = vec4.create();
        vec4.subtract(r2s, vec4.fromValues(0,0,ray.origin[2],1), ray.origin);
        var L2 = vec3.dot(r2s,r2s);
        var tcaS = vec3.dot(ray.dir, r2s);

        if(L2 <= 1) {
            var projection = vec4.fromValues(ray.dir[0], ray.dir[1], 0, 0);
            var DL2 = vec3.dot(projection, projection);
            var tca2 = tcaS*tcaS/DL2;

            var LM2 = L2 - tca2;

            var L2hc = 1-LM2;
            var t0 = tcaS/DL2 + Math.sqrt(L2hc/DL2);

            var hit = new Hit();
            hit.t0 = t0;
            hit.isEntry = false;
            hit.geometry = this;

            vec4.scaleAndAdd(hit.modelSpacePos, ray.origin, ray.dir, t0);
            vec4.scaleAndAdd(hit.position, inRay.origin, inRay.dir, t0);

            hit.normal = vec4.create();
            vec4.negate(hit.normal, this.getNormal(hit.modelSpacePos));

            hit.material = this.material;
            vec4.subtract(hit.viewVec, inRay.origin, hit.position);
            vec4.normalize(hit.viewVec, hit.viewVec);

            hitList.insert(hit);
        }
     
        else if(tcaS >= 0) {
            var projection = vec4.fromValues(ray.dir[0], ray.dir[1], 0, 0);
            var DL2 = vec3.dot(projection, projection);
            var tca2 = tcaS*tcaS/DL2;

            var LM2 = L2 - tca2;
            if(LM2 <= 1) {
                var L2hc = 1-LM2;
                var t0 = tcaS/DL2 - Math.sqrt(L2hc/DL2);
                var t1 = tcaS/DL2 + Math.sqrt(L2hc/DL2);

                var firstHit = new Hit();
                firstHit.t0 = t0;
                firstHit.geometry = this;

                vec4.scaleAndAdd(firstHit.modelSpacePos, ray.origin, ray.dir, t0);
                vec4.scaleAndAdd(firstHit.position, inRay.origin, inRay.dir, t0);

                firstHit.normal = vec4.create();
                vec4.copy(firstHit.normal, this.getNormal(firstHit.modelSpacePos));

                firstHit.material = this.material;
                vec4.subtract(firstHit.viewVec, inRay.origin, firstHit.position);
                vec4.normalize(firstHit.viewVec, firstHit.viewVec);

                hitList.insert(firstHit);

                var secondHit = new Hit();
                secondHit.t0 = t1;
                secondHit.geometry = this;
                secondHit.isEntry = false;

                vec4.scaleAndAdd(secondHit.modelSpacePos, ray.origin, ray.dir, t1);
                vec4.scaleAndAdd(secondHit.position, inRay.origin, inRay.dir, t1);

                secondHit.normal = vec4.create();
                vec4.negate(secondHit.normal, this.getNormal(secondHit.modelSpacePos));

                secondHit.material = this.material;
                vec4.subtract(secondHit.viewVec, inRay.origin, secondHit.position);
                vec4.normalize(secondHit.viewVec, secondHit.viewVec);

                hitList.insert(secondHit);
            }
        }
    }
}

//slab -1 <= z <= 1
class Slab extends Geometry {
    constructor() {
        super();
        this.shapeType = shapeTypes.grid;
    }
    getNormal(pos) {
        var normVec = vec4.create();
        if(pos[2] >= 1) {
            normVec = vec4.fromValues(0, 0, 1, 0);
            
        }
        else if(pos[2] <= 0) {
            normVec = vec4.fromValues(0,0,-1,0);
        }
        vec4.transformMat4(normVec, normVec, this.normalToWorld);
        vec3.normalize(normVec, normVec);
        normVec[3] = 0;
        return normVec;
    }
    trace(inRay, hitList) {
        var ray = new Ray();

        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        const t0 = (-1-ray.origin[2])/ray.dir[2];
        const t1 = (1-ray.origin[2])/ray.dir[2];

        var firstHit = new Hit();
        firstHit.geometry = this;
        firstHit.t0 = t0;

        vec4.scaleAndAdd(firstHit.modelSpacePos, ray.origin, ray.dir, t0);
        vec4.scaleAndAdd(firstHit.position, inRay.origin, inRay.dir, t0);

        firstHit.normal = vec4.create();
        vec4.copy(firstHit.normal, this.getNormal(firstHit.modelSpacePos));
        if(t1 < 0) {
            vec4.negate(firstHit.normal, firstHit.normal);
        }

        firstHit.material = this.material;
        vec4.subtract(firstHit.viewVec, inRay.origin, firstHit.position);
        vec4.normalize(firstHit.viewVec, firstHit.viewVec);

        hitList.insert(firstHit);

        var secondHit = new Hit();
        secondHit.geometry = this;
        secondHit.t0 = t1;

        vec4.scaleAndAdd(secondHit.modelSpacePos, ray.origin, ray.dir, t1);
        vec4.scaleAndAdd(secondHit.position, inRay.origin, inRay.dir, t1);

        secondHit.normal = vec4.create();
        vec4.copy(secondHit.normal, this.getNormal(secondHit.modelSpacePos));
        if(t0 < 0) {
            vec4.negate(secondHit.normal, secondHit.normal);
        }

        secondHit.material = this.material;
        vec4.subtract(secondHit.viewVec, inRay.origin, secondHit.position);
        vec4.normalize(secondHit.viewVec, secondHit.viewVec);

        hitList.insert(secondHit);
    }
}

class Cylinder extends Intersection {
    constructor() {
        var A = new Tube();
        var B = new Slab();
        super(A, B);
        this.shapeType = shapeTypes.cylinder;
    }
}
