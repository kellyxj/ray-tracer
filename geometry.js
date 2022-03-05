class Material {
    constructor (Ka, Ki, Ks, s) {
        this.Ka = Ka;
        this.Ki = Ki;
        this.Ks = Ks;
        this.s = s;
    }
}

const shapeTypes = {
    none : 0,
    grid : 1,
    disk : 2,
    sphere: 3
}

class Geometry {
    constructor() {
        this.modelMatrix = mat4.create();
        this.worldToModel = mat4.create();
        this.normalToWorld = mat4.create();
        this.vboBox = new VBObox();
        this.shapeType = shapeTypes.none;
    }
    initVbo(gl) {
        
    }
    //given x, y, z coordinates in model space, return material value
    getMaterial(x, y, z) {
        var material = new Material([0,0,0], [.3, 1, 1], [0,0,0], 0);
        return material;
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

    drawPreview(mvpMatrix) {
        if(this.vboBox.vboContents) {
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
        this.xgap = 1.0;
    	this.ygap = 1.0;
    	this.lineWidth = 0.1;
    	this.lineColor = vec4.fromValues(0.1,0.5,0.1,1.0);
    	this.gapColor = vec4.fromValues( 0.9,0.9,0.9,1.0);
        this.shapeType = shapeTypes.grid;
    }
    initVbo(gl) {
        this.vboBox.init(gl, makeGroundGrid(), 404);
    }
    getMaterial(x, y, z) {
        var xfrac = Math.abs(x) / this.xgap;
        var yfrac = Math.abs(y) / this.ygap;
        if(xfrac % 1 >= this.lineWidth && yfrac % 1 >= this.lineWidth) {
            var material = new Material([0,0,0], [this.gapColor[0], this.gapColor[1], this.gapColor[2]], [0,0,0], 0);
            return material;
        }
        else {
            var material = new Material([0,0,0], [this.lineColor[0], this.lineColor[1], this.lineColor[2]], [0,0,0], 0);
            return material;
        }
    }
    trace(inRay, hitList) {
        var ray = new Ray();

        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        const t0 = -ray.origin[2]/ray.dir[2];

        var hit = new Hit();
        if(t0 >= 0) {
            hit.geometry = this;
            hit.t0 = t0;

            vec4.scaleAndAdd(hit.modelSpacePos, ray.origin, ray.dir, t0);
            vec4.scaleAndAdd(hit.position, inRay.origin, inRay.dir, t0);

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
        this.vboBox.init(gl, makeDisk(this.radius), 20*this.radius+4)
    }
    getMaterial(x, y, z) {
        var material = new Material([0,0,0], [1, 0, 0], [0,0,0], 0);
        return material;
    }
    trace(inRay, hitList) {
        var ray = new Ray();

        vec4.transformMat4(ray.origin, inRay.origin, this.worldToModel);
        vec4.transformMat4(ray.dir, inRay.dir, this.worldToModel);

        const t0 = -ray.origin[2]/ray.dir[2];
        var hit = new Hit();

        vec4.scaleAndAdd(hit.modelSpacePos, ray.origin, ray.dir, t0);
        var squareDist = hit.modelSpacePos[0]*hit.modelSpacePos[0]+hit.modelSpacePos[1]*hit.modelSpacePos[1];
        
        if(t0 >= 0 && squareDist <= this.radius) {
            hit.geometry = this;
            hit.t0 = t0;

            hitList.insert(hit);
        }
    }
}

class Sphere extends Geometry {
    constructor(r = 1) {
        super();
        this.radius = r;
        this.shapeType = shapeTypes.sphere;
    }
    initVbo(gl) {
        this.vboBox.init(gl, makeSphere(13, [0, 0, 1]), 676);
        this.vboBox.drawMode = gl.LINE_STRIP;
    }
    getMaterial(x, y, z) {
        var material = new Material([0,0,0], [0, 0, 1], [0,0,0], 0);
        return material;
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

                hitList.insert(firstHit);

                var secondHit = new Hit();
                secondHit.t0 = t1;
                secondHit.geometry = this;
                secondHit.isEntry = false;

                hitList.insert(secondHit);
            }
        }
    }
}

class Light extends Sphere {
    constructor (x = 0, y = 0, z = 100) {
        super(.1);
        this.Ia = [1,1,1];
        this.Id = [1,1,1];
        this.Is = [1,1,1];

        this.rayTranslate(x, y, z);
    }
    initVbo(gl) {
        this.vboBox.init(gl, makeSphere(13, [1,1,1]), 676);
        this.vboBox.drawMode = gl.LINE_STRIP;
    }
}