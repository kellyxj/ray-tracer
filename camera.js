class Ray {
    constructor() {
        this.origin = vec4.create();
        this.dir = 	vec4.create();
    }
}

class Camera {
    constructor() {
        this.eyePoint = vec4.fromValues(0,0,0,1);

	    this.uAxis = vec4.fromValues(1,0,0,0);			
        this.vAxis = vec4.fromValues(0,1,0,0);
        this.nAxis = vec4.fromValues(0,0,1,0);

        this.left = -1.0;		
	    this.right = 1.0;
	    this.bot =  -1.0;
	    this.top =   1.0; 
	    this.near = 1.0;

        //resolution
        this.xmax = 512;
	    this.ymax = 512;

        //pixel width and height
        this.ufrac = (this.right - this.left) / this.xmax;
	    this.vfrac = (this.top   - this.bot ) / this.ymax;
    }

    setSize(xMax, yMax) {
        this.xMax = xMax;
        this.yMax = yMax;

        this.ufrac = (this.right - this.left) / this.xmax;
	    this.vfrac = (this.top   - this.bot ) / this.ymax;
    }

    rayFrustum(left, right, bot, top, near) {
        this.left = left;
        this.right = right;
        this.bot = bot;
        this.top = top;
        this.near = near;
    }

    rayPerspective(fovy, aspect, near) {
        var top = near * Math.tan(.5 * fovy * Math.PI/180);
        this.rayFrustum(-top * aspect, top * aspect, -top, top, near);
    }

    rayLookAt(eyePoint, aimPoint, upVec) {
        vec4.copy(this.eyePoint, eyePoint);
        vec4.subtract(this.nAxis, this.eyePoint, aimPoint);
        vec4.normalize(this.nAxis, this.nAxis);

        vec3.cross(this.uAxis, upVec, this.nAxis);
        vec4.normalize(this.uAxis, this.uAxis);
        vec3.cross(this.vAxis, this.nAxis, this.uAxis);
    }

    setEyeRay(eyeRay, xPos, yPos) {
        var posU = this.left + xPos * this.ufrac;
        var posV = this.bot + yPos * this.vfrac;

        var worldPos = vec4.create();
        vec4.scaleAndAdd(worldPos, worldPos, this.uAxis, posU);
        vec4.scaleAndAdd(worldPos, worldPos, this.vAxis, posV);
        vec4.scaleAndAdd(worldPos, worldPos, this.nAxis, -this.near);

        vec4.copy(eyeRay.origin, this.eyePoint);
        vec4.copy(eyeRay.dir, worldPos);
    }
}