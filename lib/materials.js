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
        super([0,0,0],[.1, .1, .1], [.5+.5*Math.random(), .5+.5*Math.random(), .5+.5*Math.random()], [1,1,1], 80, .4+.6*Math.random(), 0);
    }
}

class GroundPlane extends Material {
    constructor() {
        super([.1,.1,.1],[.1,.1,.1], [0,0,0], [0,0,0], 0, 0, 0);
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
        super([1,1,1],[0, 0, 0], [1, 1, 1], [0,0,0] ,0, 0, 0);
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

class Checkerboard extends Material {
    constructor() {
        super([0,0,0], [.1,.1,.1], [1, 0, 0], [0,0,0], 80, .1, 0);
        this.gridFrequency = 3;
        this.color1 = vec4.fromValues(1,1,1,1);
        this.color2 = vec4.fromValues(0,0,0,1);
    }
    getColor(pos) {
        var xWhole = Math.floor(pos[0]*this.gridFrequency);
        var yWhole = Math.floor(pos[1]*this.gridFrequency);
        var zWhole = Math.floor(pos[2]*this.gridFrequency);
        var phong = {
            Ke: this.Ke,
            Ka: this.Ka,
            Kd: this.Kd,
            Ks: this.Ks,
            s: this.s
        }
        if(Math.abs(xWhole+yWhole+zWhole)%2<=.1) {
            phong.Kd = [this.color1[0], this.color1[1], this.color1[2]];
        }
        else {
            phong.Kd = [this.color2[0], this.color2[1], this.color2[2]];
        }
        return phong;
    }
}

class Disco extends Lamp {
    constructor(brightness, nColors) {
        super(brightness);
        this.Ks = [1,1,1];
        this.s = 200;
        this.reflectance = .1;
        this.gridFrequency = 3;
        
        this.colors = [];
        for(let i = 0; i < nColors; i++) {
            var color = vec4.fromValues(Math.random(), Math.random(), Math.random(), 1);
            this.colors.push(color);
        }
    }
    getColor(pos) {
        var xWhole = Math.floor(pos[0]*this.gridFrequency);
        var yWhole = Math.floor(pos[1]*this.gridFrequency);
        var zWhole = Math.floor(pos[2]*this.gridFrequency);
        var phong = {
            Ke: this.Ke,
            Ka: this.Ka,
            Kd: this.Kd,
            Ks: this.Ks,
            s: this.s
        }
        var total = Math.abs(xWhole+yWhole+zWhole);
        var nColors = this.colors.length;
        for(let i = 0; i < nColors; i++) {
            if(total % nColors == i) {
                phong.Ke = [.5*this.colors[i][0], .5*this.colors[i][1], .5*this.colors[i][2]];
            }
        }
        return phong;
    }
    getLight(pos) {
        var xWhole = Math.floor(pos[0]*this.gridFrequency);
        var yWhole = Math.floor(pos[1]*this.gridFrequency);
        var zWhole = Math.floor(pos[2]*this.gridFrequency);
        var phong = {
            Ia: this.Ia,
            Id: this.Id,
            Is: this.Is,
            brightness: this.brightness
        }
        var total = Math.abs(xWhole+yWhole+zWhole);
        var nColors = this.colors.length;
        for(let i = 0; i < nColors; i++) {
            if(total % nColors == i) {
                phong.Id = [this.colors[i][0], this.colors[i][1], this.colors[i][2]];
                phong.Is = [this.colors[i][0], this.colors[i][1], this.colors[i][2]];
            }
        }
        return phong;
    }
}