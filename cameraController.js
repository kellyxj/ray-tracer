class CameraController {
    constructor(eyePosition, panAngle = 0, tiltAngle = 0, inverted, fovy, near, far) {
        this.eyePosition = vec4.fromValues(eyePosition[0], eyePosition[1], eyePosition[2], 1);

        //angles are in degrees
        this.panAngle = panAngle;
        this.tiltAngle = tiltAngle;
        this.fovy = fovy;
        this.near = near;
        this.far = far;

        this.aimPoint = vec4.fromValues(this.eyePosition[0]+Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[1]+Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[2]+Math.sin(Math.PI*this.tiltAngle/180),
                                        1);
        this.upVector = vec4.fromValues(Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(Math.PI*(this.tiltAngle+90)/180),
                                        0);

        this.speed = .3;
        this.angularVel = 1;

        this.inverted = inverted;

        this.aspect = 1;
    }

    moveForward() {
        var d = vec4.create();
        vec4.sub(d, this.aimPoint, this.eyePosition);
        vec4.normalize(d, d); 

        vec4.scale(d, d, this.speed);
        vec4.add(this.aimPoint, this.aimPoint, d);
        vec4.add(this.eyePosition, this.eyePosition, d);
    }
    moveBack() {
        var d = vec4.create();
        vec4.sub(d, this.eyePosition, this.aimPoint);
        vec4.normalize(d, d); 

        vec4.scale(d, d, this.speed);
        vec4.add(this.aimPoint, this.aimPoint, d);
        vec4.add(this.eyePosition, this.eyePosition, d);
    }
    moveLeft() {
        var d = vec4.fromValues(Math.sin(Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180), 
                                Math.cos(Math.PI*-this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180), 0, 0);
        vec4.scale(d, d, this.inverted? -this.speed : this.speed);
        vec4.add(this.aimPoint, this.aimPoint, d);
        vec4.add(this.eyePosition, this.eyePosition, d);
    }
    moveRight() {
        var d = vec4.fromValues(Math.sin(Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                Math.cos(Math.PI*-this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180), 0, 0);
        vec4.scale(d, d, this.inverted? this.speed : -this.speed);
        vec4.add(this.aimPoint, this.aimPoint, d);
        vec4.add(this.eyePosition, this.eyePosition, d);
    }
    moveUp() {
        var d = vec4.clone(this.upVector);
        vec4.scale(d, d, this.speed);
        vec4.add(this.aimPoint, this.aimPoint, d);
        vec4.add(this.eyePosition, this.eyePosition, d);
    }
    moveDown() {
        var d = vec4.clone(this.upVector);
        vec4.scale(d, d, -this.speed);
        vec4.add(this.aimPoint, this.aimPoint, d);
        vec4.add(this.eyePosition, this.eyePosition, d);
    }

    panLeft() {
        if(this.inverted) {
            this.panAngle += this.angularVel;
        }
        else {
            this.panAngle -= this.angularVel;
        }
        this.aimPoint = vec4.fromValues(this.eyePosition[0]+Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[1]+Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[2]+Math.sin(Math.PI*this.tiltAngle/180),
                                        1);
        this.upVector = vec4.fromValues(Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(Math.PI*(this.tiltAngle+90)/180),
                                        0);
    }
    panRight() {
        if(this.inverted) {
            this.panAngle -= this.angularVel;
        }
        else {
            this.panAngle += this.angularVel;
        }
        this.aimPoint = vec4.fromValues(this.eyePosition[0]+Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[1]+Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[2]+Math.sin(Math.PI*this.tiltAngle/180),
                                        1);
        this.upVector = vec4.fromValues(Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(Math.PI*(this.tiltAngle+90)/180),
                                        0);
    }
    tiltUp() {
        this.tiltAngle += 1;
        if(Math.abs(this.tiltAngle % 360) > 90 && Math.abs(this.tiltAngle % 360) < 270) {
            this.inverted = true;
        }
        else {
            this.inverted = false;
        }
        this.aimPoint = vec4.fromValues(this.eyePosition[0]+Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[1]+Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[2]+Math.sin(Math.PI*this.tiltAngle/180),
                                        1);
        this.upVector = vec4.fromValues(Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(Math.PI*(this.tiltAngle+90)/180),
                                        0);
    }
    tiltDown() {
        this.tiltAngle -= 1;
        if(Math.abs(this.tiltAngle % 360) > 90 && Math.abs(this.tiltAngle) % 360 < 270) {
            this.inverted = true;
        }
        else {
            this.inverted = false;
        }
        this.aimPoint = vec4.fromValues(this.eyePosition[0]+Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[1]+Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*this.tiltAngle/180),
                                        this.eyePosition[2]+Math.sin(Math.PI*this.tiltAngle/180),
                                        1);
        this.upVector = vec4.fromValues(Math.cos(Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(-Math.PI*this.panAngle/180)*Math.cos(Math.PI*(this.tiltAngle+90)/180),
                                        Math.sin(Math.PI*(this.tiltAngle+90)/180),
                                        0);
    }
}