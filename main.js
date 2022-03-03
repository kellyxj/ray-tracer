var worldBox = new VBObox();

function main() {

    var canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    worldBox.init(gl, makeGroundGrid(), 400);
    worldBox.drawMode = gl.LINES;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) { 
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    var modelMatrix = new Matrix4();

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) { 
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }

    var mvpMatrix = new Matrix4();

}

function drawAll() {
    
}

main();