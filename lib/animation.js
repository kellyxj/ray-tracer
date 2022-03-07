const animationTypes = {
    none: 0,
    translate: 1,
    rotate: 2,
    scale: 3
}

//applies a uniform animation to a geometry object each time step
class Animation {
    constructor(amount = 0, ax = 0, ay = 0, az = 0) {
        this.type = animationTypes.none;
        this.amount = amount;
        this.ax = ax;
        this.ay = ay;
        this.az = az;
    }
}
class AnimationRotate extends Animation{
    constructor(amount, ax, ay, az) {
        super(amount, ax, ay, az);
        this.type = animationTypes.rotate;
        //amount (degrees) to rotate by each second
    }
}
class AnimationTranslate extends Animation {
    constructor(amount, x, y, z) {
        super(amount, x, y, z);
        this.type = animationTypes.translate;
    }
}

//only supports uniform scaling
class AnimationScale extends Animation {
    constructor(amount) {
        super(amount, 1, 1, 1);
        this.type = animationTypes.scale;
    }
}