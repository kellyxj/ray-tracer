class ImageBuffer {
    constructor(xSize, ySize) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.intBuffer = new Uint8Array(this.xSize * this.ySize * 4);
        this.floatBuffer = new Float32Array(this.xSize * this.ySize * 4)
    }
    setTestPattern() {
        for(let i = 0; i < this.xSize; i++) {
            for(let j = 0; j < this.ySize; j++) {
                const index = (j*this.xSize + i) * 4;
                this.intBuffer[index] = 255;
                this.intBuffer[index+1] = 0;
                this.intBuffer[index+2] = 0;
                this.intBuffer[index+3] = 255;
            }
        }
        this.toFloat();
    }
    toFloat() {
        for(let i = 0; i < this.xSize; i++) {
            for(let j = 0; j < this.ySize; j++) {
                const index = (j*this.xSize + i) * 4;
                this.floatBuffer[index] = this.intBuffer[index]/255;
                this.floatBuffer[index+1] = this.intBuffer[index+1]/255;
                this.floatBuffer[index+2] = this.intBuffer[index+2]/255;
                this.floatBuffer[index+3] = this.intBuffer[index+3]/255;
            }
        }
    }
    toInt() {
        for(let i = 0; i < this.xSize; i++) {
            for(let j = 0; j < this.ySize; j++) {
                const index = (j*this.xSize + i) * 4;
                var r = Math.min(1.0, Math.max(this.floatBuffer[index]));
                var g = Math.min(1.0, Math.max(this.floatBuffer[index+1]));
                var b = Math.min(1.0, Math.max(this.floatBuffer[index+2]));
                var a = Math.min(1.0, Math.max(this.floatBuffer[index+3]));

                this.intBuffer[index] = Math.min(255, Math.floor(r*256));
                this.intBuffer[index+1] = Math.min(255, Math.floor(g*256));
                this.intBuffer[index+2] = Math.min(255, Math.floor(b*256));
                this.intBuffer[index+3] = Math.min(255, Math.floor(a*256));
            }
        }
    }
}