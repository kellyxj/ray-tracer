class GeometryController {
    constructor() {
        this.name = "";

        this.translateX = 0;
        this.translateY = 0;
        this.translateZ = 0;

        this.materialType;

        this.Ke;
        this.Ka;
        this.Kd;
        this.Ks;
        this.shininess;

        this.reflectance;
        this.transparency;

        this.n_r;
        this.absorption;
        
        this.renderOn = true;

        this.index;

        this.bumpNormals = false;
    }
}

class LightController extends GeometryController {
    super() {
        this.Ia;
        this.Id;
        this.Is;
        this.brightness;
    }
}