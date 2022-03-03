class Ray {
    constructor() {
        this.origin = vec4.fromValues(0,0,0,1);
        this.dir = 	vec4.fromValues(0,0,-1,0);
    }
}

class Camera {
    constructor() {
        this.eyePt = vec4.fromValues(0,0,0,1);

	    this.uAxis = vec4.fromValues(1,0,0,0);			
        this.vAxis = vec4.fromValues(0,1,0,0);
        this.nAxis = vec4.fromValues(0,0,1,0);

        this.left = -1.0;		
	    this.right = 1.0;
	    this.bot =  -1.0;
	    this.top =   1.0; 
	    this.near = 1.0;

        //resolution
        this.xmax = 256;
	    this.ymax = 256;

        //pixel width and height
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

    rayPerspective() {

    }

    rayLookAt() {

    }

    setEyeRay() {
        
    }
}