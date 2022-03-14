const materialTypes = {
    sky: 0,
    air: 1,
    plastic: 2,
    mirror: 3,
    glass: 4,
    groundPlane: 5,
    checkerboard: 6
}

class Material {
    constructor (Ke = [0,0,0], Ka = [0,0,0], Kd = [.4, .6, .9], Ks = [0,0,0], s=0, r=0, t=0) {
        this.materialType = materialTypes.sky;

        this.Ke = Ke;
        this.Ka = Ka;
        this.Kd = Kd;
        this.Ks = Ks;
        this.s = s;
        this.reflectance = r;
        this.transparency = t;

        //index of refraction
        this.n_r = 1;
        this.absorption = 0;
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
    getRefraction(pos) {
        return this.n_r;
    }
}
class Air extends Material {
    constructor() {
        super([0,0,0], [0,0,0], [0, 0, 0], [0,0,0], 0, 0, 1);
        this.materialType = materialTypes.air;

        this.n_r = 1;
        this.absoprtion = 0;
    }
}

class Plastic extends Material {
    constructor() {
        super([0,0,0], [.1,.1,.1], [.5+.5*Math.random(), .5+.5*Math.random(), .5+.5*Math.random()], [1,1,1], 80, 0, 0);
        this.materialType = materialTypes.plastic;
    }
}

class Mirror extends Material {
    constructor() {
        super([0,0,0],[.1, .1, .1], [.5+.5*Math.random(), .5+.5*Math.random(), .5+.5*Math.random()], [1,1,1], 80, .4+.6*Math.random(), 0);
    }
}

class Glass extends Material {
    constructor() {
        super([0,0,0],[0, 0, 0], [0, 0, 0], [0,0,0], 80, .1, .9);
        this.materialType = materialTypes.glass;

        this.n_r = 1.3;
        this.absorption = .1;
    }
}

class GroundPlane extends Material {
    constructor() {
        super([0,0,0],[.15,.15,.15], [0,0,0], [0,0,0], 0, 0, 0);
        this.materialType = materialTypes.groundPlane;
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

const lightTypes = {
    lamp: 0,
    sun: 1,
    disco: 2
}
class Lamp extends Material {
    constructor(brightness) {
        super([1,1,1],[0, 0, 0], [1, 1, 1], [0,0,0] ,0, 0, 0);
        this.lightType = lightTypes.lamp;

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
        this.lightType = lightTypes.sun;
        this.Ia = [1,1,1];
    }
}

class Checkerboard extends Material {
    constructor(material1, material2) {
        super([0,0,0], [.1,.1,.1], [1, 0, 0], [1,1,1], 40, .2, 0);
        this.materialType = materialTypes.checkerboard;
        this.gridFrequency = 3;
        this.material1 = new Air();
        if(material1) {
            this.material1 = material1
        }
        else {
            this.material1 = new Plastic();
            this.material1.Kd = [0,0,0];
        }
        
        this.material2 = new Air();
        if(material2) {
            this.material2 = material2
        }
        else {
            this.material2 = new Plastic();
            this.material2.Kd = [1,1,1];
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
        if(Math.abs(xWhole+yWhole+zWhole)%2<=.1) {
            phong = this.material1.getColor(pos);
        }
        else {
            phong = this.material2.getColor(pos);
        }
        return phong;
    }
    getReflectance(pos) {
        var xWhole = Math.floor(pos[0]*this.gridFrequency);
        var yWhole = Math.floor(pos[1]*this.gridFrequency);
        var zWhole = Math.floor(pos[2]*this.gridFrequency);
        var reflectance = 0;
        if(Math.abs(xWhole+yWhole+zWhole)%2<=.1) {
            reflectance= this.material1.getReflectance(pos);
        }
        else {
            reflectance = this.material2.getReflectance(pos);
        }
        return reflectance;
    }
    getTransparency(pos) {
        var xWhole = Math.floor(pos[0]*this.gridFrequency);
        var yWhole = Math.floor(pos[1]*this.gridFrequency);
        var zWhole = Math.floor(pos[2]*this.gridFrequency);
        var transparency = 0;
        if(Math.abs(xWhole+yWhole+zWhole)%2<=.1) {
            transparency= this.material1.getTransparency(pos);
        }
        else {
            transparency = this.material2.getTransparency(pos);
        }
        return transparency;
    }
    getRefraction(pos) {
        var xWhole = Math.floor(pos[0]*this.gridFrequency);
        var yWhole = Math.floor(pos[1]*this.gridFrequency);
        var zWhole = Math.floor(pos[2]*this.gridFrequency);
        var n_r = 1;
        if(Math.abs(xWhole+yWhole+zWhole)%2<=.1) {
            n_r= this.material1.getRefraction(pos);
        }
        else {
            n_r = this.material2.getRefraction(pos);
        }
        return n_r;
    }
}

class Disco extends Lamp {
    constructor(brightness, nColors) {
        super(brightness);
        this.lightType = lightTypes.disco;
        this.Ks = [1,1,1];
        this.s = 200;
        this.reflectance = .1;
        this.gridFrequency = 4;
        
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

//abstract class for quantized noise mapped surfaces. n specifies the number of material bands
class NoiseMap extends Material {
    constructor(n, frequency) {
        super([0,0,0], [.1,.1,.1], [.8, .52, .25], [1, 1, 1,], 80, 0, 0);
        this.perlin = new PerlinNoise();
        this.nBands = n;
        this.partition = [];
        this.materials = [];
        this.frequency = frequency;
        for(var i = 1; i <= n; i++) {
            this.partition.push(-1+i*2/n);
            var m = new Plastic();
            this.materials.push(m);
        }

        //how much to bump normals
        this.bumpAmount = 0;
    }
    getPerlin(pos) {
        return this.perlin.noise([pos[0]*this.frequency, pos[1]*this.frequency, pos[2]*this.frequency]);
    }
    getColor(pos) {
        var noise = this.getPerlin(pos);
        var phong = this.materials[this.nBands-1].getColor(pos);
        for(let i = this.nBands-1; i >= 0; i--) {
            if(noise < this.partition[i]) {
                phong = this.materials[i].getColor(pos);
            }
        }
        return phong;
    }
    getReflectance(pos) {
        var noise = this.getPerlin(pos);
        var reflectance = this.materials[this.nBands-1].getReflectance(pos);

        for(let i = this.nBands-1; i >= 0; i--) {
            if(noise < this.partition[i]) {
                reflectance = this.materials[i].getReflectance(pos);
            }
        }
        return reflectance;
    }
    getTransparency(pos) {
        var noise = this.getPerlin(pos);
        var transparency = this.materials[this.nBands-1].getTransparency(pos);

        for(let i = this.nBands-1; i >= 0; i--) {
            if(noise < this.partition[i]) {
                transparency = this.materials[i].getTransparency(pos);
            }
        }
        return transparency;
    }
    getRefraction(pos) {
        var noise = this.getPerlin(pos);
        var n_r = this.materials[this.nBands-1].getRefraction(pos);

        for(let i = this.nBands-1; i >= 0; i--) {
            if(noise < this.partition[i]) {
                n_r = this.materials[i].getRefraction(pos);
            }
        }
        return n_r;
    }
}

//abstract class for a material that lerps between two colors with perlin noise
class LerpedColors extends NoiseMap{
    constructor(frequency, material1, material2) {
        super(2, frequency);
        this.materials[0]= material1;
        this.materials[1] = material2;
    }
    getColor(pos) {
        var noise = this.getPerlin([pos[0]*this.frequency, pos[1]*this.frequency, pos[2]*this.frequency]);
        var t = noise-Math.floor(noise);
        var color1 = this.materials[0].getColor(pos).Kd;
        var color2 = this.materials[1].getColor(pos).Kd;
        var phong = {
            Ke: this.Ke,
            Ka: this.Ka,
            Kd: [t*color1[0]+(1-t)*color2[0], t*color1[1]+(1-t)*color2[1], t*color1[2]+(1-t)*color2[2]],
            Ks: this.Ks,
            s: this.s
        }
        return phong;
    }
    getReflectance(pos) {
        var noise = this.getPerlin([pos[0]*this.frequency, pos[1]*this.frequency, pos[2]*this.frequency]);
        var t = noise-Math.floor(noise);
        return t*this.materials[0].getReflectance(pos)+(1-t)*this.materials[1].getReflectance(pos);
    }
    getTransparency(pos) {
        var noise = this.getPerlin([pos[0]*this.frequency, pos[1]*this.frequency, pos[2]*this.frequency]);
        var t = noise-Math.floor(noise);
        return t*this.materials[0].getTransparency(pos)+(1-t)*this.materials[1].getTransparency(pos);
    }
    getRefraction(pos) {
        var noise = this.getPerlin([pos[0]*this.frequency, pos[1]*this.frequency, pos[2]*this.frequency]);
        var t = noise-Math.floor(noise);
        return t*this.materials[0].getRefraction(pos)+(1-t)*this.materials[1].getRefraction(pos);
    }
}

class NoisedCheckerboard extends NoiseMap {
    constructor(n, frequency, gridFrequency = 1, noiseAmount = 0) {
        super(n, frequency);
        this.gridFrequency = gridFrequency;
        this.noiseAmount = noiseAmount;
    }
    getColor(pos) {
        var noise = this.getPerlin(pos);
        var xWhole = Math.floor(pos[0]*this.gridFrequency+noise*this.noiseAmount);
        var yWhole = Math.floor(pos[1]*this.gridFrequency+noise*this.noiseAmount);
        var zWhole = Math.floor(pos[2]*this.gridFrequency+noise*this.noiseAmount);

        var total = Math.abs(xWhole+yWhole+zWhole);

        var phong = this.materials[this.nBands-1].getColor(pos);
            
        var nColors = this.nBands;
        for(let i = 0; i < nColors; i++) {
            if(total % nColors == i) {
                phong = this.materials[i].getColor(pos);
            }
        }
        return phong;
    }
    getReflectance(pos) {
        var noise = this.getPerlin(pos);
        var xWhole = Math.floor(pos[0]*this.gridFrequency+noise*this.noiseAmount);
        var yWhole = Math.floor(pos[1]*this.gridFrequency+noise*this.noiseAmount);
        var zWhole = Math.floor(pos[2]*this.gridFrequency+noise*this.noiseAmount);

        var total = Math.abs(xWhole+yWhole+zWhole);

        var reflectance = this.materials[this.nBands-1].getReflectance(pos);
            
        var nColors = this.nBands;
        for(let i = 0; i < nColors; i++) {
            if(total % nColors == i) {
                reflectance = this.materials[i].getReflectance(pos);
            }
        }
        return reflectance;
    }
    getTransparency(pos) {
        var noise = this.getPerlin(pos);
        var xWhole = Math.floor(pos[0]*this.gridFrequency+noise*this.noiseAmount);
        var yWhole = Math.floor(pos[1]*this.gridFrequency+noise*this.noiseAmount);
        var zWhole = Math.floor(pos[2]*this.gridFrequency+noise*this.noiseAmount);

        var total = Math.abs(xWhole+yWhole+zWhole);

        var transparency = this.materials[this.nBands-1].getTransparency(pos);
            
        var nColors = this.nBands;
        for(let i = 0; i < nColors; i++) {
            if(total % nColors == i) {
                transparency = this.materials[i].getTransparency(pos);
            }
        }
        return transparency;
    }
    getRefraction(pos) {
        var noise = this.getPerlin(pos);
        var xWhole = Math.floor(pos[0]*this.gridFrequency+noise*this.noiseAmount);
        var yWhole = Math.floor(pos[1]*this.gridFrequency+noise*this.noiseAmount);
        var zWhole = Math.floor(pos[2]*this.gridFrequency+noise*this.noiseAmount);

        var total = Math.abs(xWhole+yWhole+zWhole);

        var refraction = this.materials[this.nBands-1].getRefraction(pos);
            
        var nColors = this.nBands;
        for(let i = 0; i < nColors; i++) {
            if(total % nColors == i) {
                refraction = this.materials[i].getRefraction(pos);
            }
        }
        return refraction;
    }
}