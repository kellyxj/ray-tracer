const shapeTypes = {
    none : 0,
    grid : 1
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
    setIdentity() {
        mat4.setIdentity(this.modelMatrix);
        mat4.setIdentity(this.worldToModel);
        mat4.setIdentity(this.normalToWorld);
    }

    rayTranslate() {

    }

    rayRotate() {

    }

    rayScale() {

    }

    trace(inRay, hitList) {
        
    }

    drawPreview(mvpMatrix) {
        this.vboBox.switchToMe();
        this.vboBox.adjust(this.modelMatrix, mvpMatrix);
        this.vboBox.reload();
        this.vboBox.draw();
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

            var xfrac = Math.abs(hit.modelSpacePos[0]) / this.xgap;
            var yfrac = Math.abs(hit.modelSpacePos[1]) / this.ygap;
            if(xfrac % 1 >= this.lineWidth && yfrac % 1 >= this.lineWidth) {
                hit.color = this.gapColor;
            }
            else {
                hit.color = this.lineColor;
            }
        }
        hitList.insert(hit);
    }
}

class Disk extends Geometry {
    initVbo(gl) {

    }
    trace() {

    }
}

class Sphere extends Geometry {
    initVbo(gl) {
        
    }
    trace() {

    }
}