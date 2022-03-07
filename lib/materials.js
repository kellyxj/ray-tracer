class Material {
    constructor (Ke = [0,0,0], Ka = [0,0,0], Kd = [.4, .6, .9], Ks = [0,0,0], s=0, r=0, t=0) {
        this.Ke = Ke;
        this.Ka = Ka;
        this.Kd = Kd;
        this.Ks = Ks;
        this.s = s;
        this.reflectance = r;
        this.transparency = t;
    }
    //given model space vec4(x,y,z,w) return the color at that point
    getColor(pos) {
        var phong = {
            Ke: this.Ke,
            Ka: this.Ka,
            Kd: this.Kd,
            Ks: this.Ks,
            s: this.s
        }
        return phong;
    }
    getReflectance(pos) {
        return this.reflectance;
    }
    getTransparency(pos) {
        return this.transparency;
    }
}
class Mirror extends Material {
    constructor() {
        super([0,0,0],[.1, .1, .1], [.5+.5*Math.random(), .5+.5*Math.random(), .5+.5*Math.random()], [1,1,1], 80, .2+.8*Math.random(), 0);
    }
}

class GroundPlane extends Material {
    constructor() {
        super([0,0,0],[.1,.1,.1], [0,0,0], [0,0,0], 0, 0, 0);
        this.xgap = 1.0;
    	this.ygap = 1.0;
    	this.lineWidth = 0.1;
    	this.lineColor = vec4.fromValues(0.1,0.1,0.1,1.0);
    	this.gapColor = vec4.fromValues( 1,1,1,1.0);
    }
    getColor(pos) {
        var xfrac = Math.abs(pos[0]) / this.xgap;
        var yfrac = Math.abs(pos[1]) / this.ygap;
        var phong = {
            Ke: this.Ke,
            Ka: this.Ka,
            Kd: [0,0,0],
            Ks: this.Ks,
            s: this.s
        }
        if(xfrac % 1 >= this.lineWidth && yfrac % 1 >= this.lineWidth) {
            phong.Kd = [this.gapColor[0], this.gapColor[1], this.gapColor[2]];
        }
        else {
            phong.Kd = [this.lineColor[0], this.lineColor[1], this.lineColor[2]];
        }
        return phong;
    }
}

class Lamp extends Material {
    constructor(brightness) {
        super([0,0,0],[0, 0, 0], [1, 1, 1], [0,0,0] ,0, 0, 0);
        this.Ia = [0,0,0];
        this.Id = [1,1,1];
        this.Is = [1,1,1];
        this.brightness = brightness;
    }
    getLight(pos) {
        var phong = {
            Ia: this.Ia,
            Id: this.Id,
            Is: this.Is,
            brightness: this.brightness
        }
        return phong;
    }
    getAmbient() {
        return this.Ia;
    }
}

class SunMaterial extends Lamp {
    constructor(brightness) {
        super(brightness);
        this.Ia = [1,1,1];
    }
}