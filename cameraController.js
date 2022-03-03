class CameraController {
    constructor(eyePosition, panAngle = 0, tiltAngle = 0, fovy, near, far) {
        this.eyePosition = vec4.fromValues(eyePosition[0], eyePosition[1], eyePosition[2], 1);

        this.panAngle = panAngle;
        this.tiltAngle = tiltAngle;
        this.fovy = fovy;
        this.near = near;
        this.far = far;


    }

    moveForward() {

    }
    moveBack() {

    }
    moveLeft() {

    }
    moveRight() {

    }
    moveUp() {

    }
    moveDown() {

    }

    panLeft() {

    }
    panRight() {

    }
    tiltUp() {

    }
    tiltDown() {

    }
}