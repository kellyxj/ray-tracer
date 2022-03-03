class Geometry {
    constructor() {
        this.modelMatrix = mat4.create();
        this.worldToModel = mat4.create();
        this.normalToWorld = mat4.create();
        this.vboBox = new VBObox();
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

    drawPreview() {
        this.vboBox.switchToMe();
        this.vboBox.adjust();
        this.vboBox.reload();
        this.vboBox.draw();
    }
}

class Grid extends Geometry {

}

class Disc extends Geometry {

}

class Sphere extends Geometry {

}