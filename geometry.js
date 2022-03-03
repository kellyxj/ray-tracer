class Geometry {
    constructor() {
        this.modelMatrix = mat4.create();
        this.worldToModel = mat4.create();
        this.normalToWorld = mat4.create();
        this.vboBox = new VBObox();
    }
    initVbo(gl) {
        
    }
    setIdentity() {

    }

    rayTranslate() {

    }

    rayRotate() {

    }

    rayScale() {

    }

    trace() {

    }

    drawPreview(mvpMatrix) {
        this.vboBox.switchToMe();
        this.vboBox.adjust(this.modelMatrix, mvpMatrix);
        this.vboBox.reload();
        this.vboBox.draw();
    }
}

class Grid extends Geometry {
    initVbo(gl) {
        this.vboBox.init(gl, makeGroundGrid(), 400);
    }
}

class Disk extends Geometry {

}

class Sphere extends Geometry {

}