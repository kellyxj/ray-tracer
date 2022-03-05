class VBObox {
    constructor() {
        this.gl;
        this.VERT_SRC = 'uniform mat4 u_ModelMatrix;\n' +
                        'uniform mat4 u_MvpMatrix;\n'+
                        'attribute vec4 a_Pos;\n'+
                        'attribute vec3 a_Colr;\n'+
                        'varying vec4 v_Color;\n'+
                        'void main() {\n'+
                            'gl_Position = u_MvpMatrix * u_ModelMatrix * (a_Pos);\n'+
                            'gl_PointSize = 10.0;\n'+
                            'v_Color = vec4(a_Colr, 1);\n'+
                        '}';
        this.FRAG_SRC = '//  #ifdef GL_ES\n'+
                        'precision mediump float;\n'+
                        '//  #endif GL_ES\n'+ 
                        'varying vec4 v_Color;\n'+
                        'void main() {\n'+
                        '   gl_FragColor = vec4(v_Color.rgb,1);\n' +
                        '}';

        this.vboContents;
        this.nVerts;
        this.FSIZE;
        this.vboBytes;
        this.vboStride; 

        this.drawMode;

        this.vboFcount_a_Pos;
        this.vboFcount_a_Colr;
        this.vboOffset_a_Pos; 
        this.vboOffset_a_Colr;  

        this.vboLoc;									// GPU Location for Vertex Buffer Object, 

	    this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	
								          //------Attribute locations in our shaders:
	    this.a_PosLoc;								
	    this.a_ColrLoc;								

	            //---------------------- Uniform locations &values in our shaders
	    this.ModelMat = mat4.create();
	    this.u_ModelMatLoc;							

        this.mvpMatrix = mat4.create();
        this.u_MvpMatrixLoc;
    }

    init(gl, vboContents, n) {
        this.gl = gl;
        this.vboContents = vboContents;
        this.nVerts = n;
        this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

        this.drawMode = this.gl.LINES;

        this.vboFcount_a_Pos = 4;
        this.vboFcount_a_Colr = 4;
        this.vboOffset_a_Pos = 0; 

        this.vboBytes = this.vboContents.length * this.FSIZE;
        this.vboStride = this.vboBytes / this.nVerts; 
        this.vboOffset_a_Colr = this.vboFcount_a_Pos * this.FSIZE;
        this.shaderLoc = createProgram(this.gl, this.VERT_SRC, this.FRAG_SRC);
        if (!this.shaderLoc) {
        console.log(this.constructor.name + 
                                '.init() failed to create executable Shaders on the GPU. Bye!');
            return;
        }
    
        this.gl.program = this.shaderLoc;
    
    // b) Create VBO on GPU, fill it------------------------------------------------
        this.vboLoc = this.gl.createBuffer();	
        if (!this.vboLoc) {
            console.log(this.constructor.name + 
                                '.init() failed to create VBO in GPU. Bye!'); 
            return;
        }
      
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,	     
                                      this.vboLoc);				  
    
 
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 			 
                                          this.vboContents, 		
                                       this.gl.STATIC_DRAW);			
      // c1) Find All Attributes:---------------------------------------------------
        this.a_PosLoc = this.gl.getAttribLocation(this.shaderLoc, 'a_Pos');
        if(this.a_PosLoc < 0) {
            console.log(this.constructor.name + 
                                '.init() Failed to get GPU location of attribute a_Pos');
            return -1;	// error exit.
        }
        this.a_ColrLoc = this.gl.getAttribLocation(this.shaderLoc, 'a_Colr');
        if(this.a_ColrLoc < 0) {
            console.log(this.constructor.name + 
                                '.init() failed to get the GPU location of attribute a_Colr');
            return -1;	// error exit.
        }
      
      // c2) Find All Uniforms:-----------------------------------------------------
      //Get GPU storage location for each uniform var used in our shader programs: 
        this.u_ModelMatLoc = this.gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
        if (!this.u_ModelMatLoc) { 
            console.log(this.constructor.name + 
                                '.init() failed to get GPU location for u_ModelMatrix uniform');
            return;
        }  
    
        this.u_MvpMatrixLoc = this.gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
        if (!this.u_MvpMatrixLoc) { 
            console.log(this.constructor.name + 
                                '.init() failed to get GPU location for u_MvpMatrix uniform');
            return;
        }  
    }

    switchToMe() {
        this.gl.useProgram(this.shaderLoc);	
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,	        
							this.vboLoc);	

        this.gl.vertexAttribPointer(this.a_PosLoc,
                                this.vboFcount_a_Pos,// # of floats used by this attribute: 1,2,3 or 4?
                                this.gl.FLOAT,			// type
                                false,				// isNormalized
                                this.vboStride,// Stride
                                this.vboOffset_a_Pos);	
        this.gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr, 
                                                            this.gl.FLOAT, false, 
                                                            this.vboStride, this.vboOffset_a_Colr);
                                                                  
        this.gl.enableVertexAttribArray(this.a_PosLoc);
        this.gl.enableVertexAttribArray(this.a_ColrLoc);
    }

    isReady() {
        var isOK = true;
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) != this.shaderLoc)  {
            console.log(this.constructor.name + 
                                    '.isReady() false: shader program at this.shaderLoc not in use!');
            isOK = false;
        }
        if(this.gl.getParameter(this.gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
            console.log(this.constructor.name + 
                                  '.isReady() false: vbo at this.vboLoc not in use!');
            isOK = false;
        }
        return isOK;
    }

    adjust(modelMatrix, mvpMatrix) {
        if(this.isReady()==false) {
            console.log('ERROR! before' + this.constructor.name + 
                              '.adjust() call you needed to call this.switchToMe()!!');
        }
        
        mat4.copy(this.ModelMat, modelMatrix);
        this.gl.uniformMatrix4fv(this.u_ModelMatLoc,
            false, 				
            this.ModelMat);

        mat4.copy(this.mvpMatrix, mvpMatrix);
        this.gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, this.mvpMatrix);
    }

    draw() {
        if(this.isReady()==false) {
            console.log('ERROR! before' + this.constructor.name + 
                              '.draw() call you needed to call this.switchToMe()!!');
        }  

        this.gl.drawArrays(this.drawMode, 
                        0, 								
                        this.nVerts);	
    }

    reload() {
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER,
                            0,                  
                            this.vboContents); 
    }
}

class TextureMapVBO extends VBObox {
    constructor() {
        super();
        this.VERT_SRC = 'attribute vec4 a_Pos;\n' +	
        'attribute vec2 a_TexCoord;\n' +
        'varying vec2 v_TexCoord;\n' +
        //
        'void main() {\n' +
        '  gl_Position = a_Pos;\n' +
        '  v_TexCoord = a_TexCoord;\n' +
        '}\n';
        this.FRAG_SRC = 'precision mediump float;\n' +							// set default precision
        //
        'uniform sampler2D u_Sampler;\n' +
        'varying vec2 v_TexCoord;\n' +
        //
        'void main() {\n' +
        '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
        '}\n';

        this.vboFcount_a_TexCoord;
        this.vboOffset_a_TexCoord;

        this.u_TextureLoc;
        this.u_SamplerLoc;
    }
    init(gl, pic) {
        this.gl = gl;
        this.vboContents = new Float32Array([-1.00, 1.00, 0.0, 1.0,
                                             -1.00, -1.00, 0.0, 0.0,
                                              1.00,  1.00, 1.0, 1.0,
                                              1.00, -1.00, 1.0, 0.0,]);
        this.nVerts = 4;
        this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
        this.vboBytes = this.vboContents.length * this.FSIZE;   
        this.vboStride = this.vboBytes / this.nVerts;  
        
        this.drawMode = this.gl.TRIANGLE_STRIP;

        this.vboFcount_a_Pos = 2;
        this.vboFcount_a_TexCoord = 2;

        this.vboOffset_a_Pos = 0;
        this.vboOffset_a_TexCoord = (this.vboFcount_a_Pos) * this.FSIZE; 

        this.shaderLoc = createProgram(this.gl, this.VERT_SRC, this.FRAG_SRC);
	    if (!this.shaderLoc) {
            console.log(this.constructor.name + 
    					'.init() failed to create executable Shaders on the GPU. Bye!');
        return;
        }

        this.gl.program = this.shaderLoc;

        this.vboLoc = this.gl.createBuffer();	
        if (!this.vboLoc) {
            console.log(this.constructor.name + 
    					'.init() failed to create VBO in GPU. Bye!'); 
            return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboLoc);	
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vboContents, this.gl.STATIC_DRAW);

        this.u_TextureLoc = this.gl.createTexture(); // Create object in GPU memory to
                                          // to hold texture image.
        if (!this.u_TextureLoc) {
            console.log(this.constructor.name + 
    				    '.init() Failed to create the texture object on the GPU');
            return -1;	// error exit.
        }
        var u_SamplerLoc = this.gl.getUniformLocation(this.shaderLoc, 'u_Sampler');
        if (!u_SamplerLoc) {
            console.log(this.constructor.name + 
                                    '.init() Failed to find GPU location for texture u_Sampler');
            return -1;	// error exit.
        }

        pic.setTestPattern();
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.u_TextureLoc);

        this.gl.texImage2D(this.gl.TEXTURE_2D,    //  'target'--the use of this texture
  						   0, 									//  MIP-map level (default: 0)
  						   this.gl.RGBA, 					  // GPU's data format (RGB? RGBA? etc)
                           pic.xSize,         // texture image width in pixels
                           pic.ySize,         // texture image height in pixels.
						   0,									// byte offset to start of data
                           this.gl.RGBA, 					  // source/input data format (RGB? RGBA?)
                           this.gl.UNSIGNED_BYTE,	  // data type for each color channel				
                           pic.intBuffer);        // 8-bit RGB image data source.
                           // Set the WebGL texture-filtering parameters
        this.gl.texParameteri(this.gl.TEXTURE_2D,		// texture-sampling params: 
                              this.gl.TEXTURE_MIN_FILTER, 
                              this.gl.LINEAR);
        // Set the texture unit 0 to be driven by our texture sampler:
        this.gl.uniform1i(this.u_SamplerLoc, 0);

        this.a_PosLoc = this.gl.getAttribLocation(this.shaderLoc, 'a_Pos');
        if(this.a_PosLoc < 0) {
            console.log(this.constructor.name + 
                                '.init() Failed to get GPU location of attribute a_Pos');
            return -1;	// error exit.
        }
        this.a_TexCoordLoc = this.gl.getAttribLocation(this.shaderLoc, 'a_TexCoord');
        if(this.a_TexCoordLoc < 0) {
          console.log(this.constructor.name + 
                                  '.init() failed to get the GPU location of attribute a_TexCoord');
          return -1;	// error exit.
        }
    }
    switchToMe() {
        this.gl.useProgram(this.shaderLoc);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboLoc);

        this.gl.vertexAttribPointer(this.a_PosLoc,
            this.vboFcount_a_Pos,// # of floats used by this attribute: 1,2,3 or 4?
            this.gl.FLOAT,			// type
            false,				// isNormalized
            this.vboStride,// Stride
            this.vboOffset_a_Pos);	
        
        this.gl.vertexAttribPointer(this.a_TexCoordLoc, this.vboFcount_a_TexCoord,
            this.gl.FLOAT, false, 
            this.vboStride,  this.vboOffset_a_TexCoord);

        this.gl.enableVertexAttribArray(this.a_PosLoc);
        this.gl.enableVertexAttribArray(this.a_TexCoordLoc);
    }
    reload(pic) {
        if(this.isReady()==false) {
            console.log('ERROR! before' + this.constructor.name + 
  						'.reload() call you needed to call this.switchToMe()!!');
        }
        
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.vboContents);
        this.gl.texSubImage2D(this.gl.TEXTURE_2D, 	//  'target'--the use of this texture
                              0, 							//  MIP-map level (default: 0)
                              0,0,						// xoffset, yoffset (shifts the image)
                              pic.xSize,			// image width in pixels,
                              pic.ySize,			// image height in pixels,
                              this.gl.RGBA, 				// source/input data format (RGB? RGBA?)
                              this.gl.UNSIGNED_BYTE, 	// data type for each color channel				
                              pic.intBuffer);
    }
}

function makeGroundGrid() {
    var xcount = 101;			// # of lines to draw in x,y to make the grid.
      var ycount = 101;		
      var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
       var xColr = new Float32Array([.7, .7, 1, 1]);	// bright yellow
       var yColr = new Float32Array([1, .2, .7, 1]);	// bright green.
       
      // Create an (global) array to hold this ground-plane's vertices:
    var floatsPerVertex = 8;
      var gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
                          // draw a grid made of xcount+ycount lines; 2 vertices per line.
                          
      var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
      var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
      
      // First, step thru x values as we make vertical lines of constant-x:
      for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
          if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
              gndVerts[j  ] = -xymax + (v  )*xgap;	// x
              gndVerts[j+1] = -xymax;								// y
              gndVerts[j+2] = 0.0;									// z
              gndVerts[j+3] = 1.0;									// w.
          }
          else {				// put odd-numbered vertices at (xnow, +xymax, 0).
              gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
              gndVerts[j+1] = xymax;								// y
              gndVerts[j+2] = 0.0;									// z
              gndVerts[j+3] = 1.0;									// w.
          }
          gndVerts[j+4] = xColr[0];			// red
          gndVerts[j+5] = xColr[1];			// grn
          gndVerts[j+6] = xColr[2];			// blu
          gndVerts[j+7] = xColr[3];

      }
      // Second, step thru y values as wqe make horizontal lines of constant-y:
      // (don't re-initialize j--we're adding more vertices to the array)
      for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
          if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
              gndVerts[j  ] = -xymax;								// x
              gndVerts[j+1] = -xymax + (v  )*ygap;	// y
              gndVerts[j+2] = 0.0;									// z
              gndVerts[j+3] = 1.0;									// w.
          }
          else {					// put odd-numbered vertices at (+xymax, ynow, 0).
              gndVerts[j  ] = xymax;								// x
              gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
              gndVerts[j+2] = 0.0;									// z
              gndVerts[j+3] = 1.0;									// w.
          }
          gndVerts[j+4] = yColr[0];			// red
          gndVerts[j+5] = yColr[1];			// grn
          gndVerts[j+6] = yColr[2];			// blu
          gndVerts[j+7] = xColr[3];
      }
    return gndVerts;
}

function makeDisk(rad) {
    if(rad == undefined) rad = 3;   // default value.
    //Set # of lines in grid--------------------------------------
    var xyMax	= rad;
    var xCount = rad*5 +1;
    var yCount = rad*5 +1;
                                                      
    var vertsPerLine =2;

    var vertCount = (xCount + yCount) * vertsPerLine;
    const floatsPerVertex = 8;
    var vertSet = new Float32Array(vertCount * floatsPerVertex); 

    var xColr = vec4.fromValues(1.0, 1.0, 0.3, 1.0);	   // Light Yellow
    var yColr = vec4.fromValues(0.3, 1.0, 1.0, 1.0);    // Light Cyan
        
          // Local vars for vertex-making loops-------------------
    var xgap = 2*xyMax/(xCount-2);		// Spacing between lines in x,y;
    var ygap = 2*xyMax/(yCount-2);		// (why 2*xyMax? grid spans +/- xyMax).
    var xNow;           // x-value of the current line we're drawing
    var yNow;           // y-value of the current line we're drawing.
    var diff;           // half-length of each line we draw.
    var line = 0;       // line-number (we will draw xCount or yCount lines, each
                              // made of vertsPerLine vertices),
    var v = 0;          // vertex-counter, used for the entire grid;
    var idx = 0;        // vertSet[] array index.
    //----------------------------------------------------------------------------
    // 1st BIG LOOP: makes all lines of constant-x
    for(line=0; line<xCount; line++) {   // for every line of constant x,
        xNow = -xyMax + (line+0.5)*xgap;       // find the x-value of this line,    
         diff = Math.sqrt(rad*rad - xNow*xNow);  // find +/- y-value of this line,
        for(i=0; i<vertsPerLine; i++, v++, idx += floatsPerVertex) { 
            if(i==0) yNow = -diff;  // line start
            else yNow = diff;       // line end.
              // set all values for this vertex:
            vertSet[idx  ] = xNow;            // x value
            vertSet[idx+1] = yNow;            // y value
            vertSet[idx+2] = 0.0;             // z value
            vertSet[idx+3] = 1.0;             // w;
            vertSet[idx+4] = xColr[0];  // r
            vertSet[idx+5] = xColr[1];  // g
            vertSet[idx+6] = xColr[2];  // b
            vertSet[idx+7] = xColr[3];  // a;
        }
    }
          //---------------------------------------------------------------------------
          // 2nd BIG LOOP: makes all lines of constant-y
    for(line=0; line<yCount; line++) {   // for every line of constant y,
        yNow = -xyMax + (line+0.5)*ygap;       // find the y-value of this line,  
        diff = Math.sqrt(rad*rad - yNow*yNow);  // find +/- y-value of this line,  
        for(i=0; i<vertsPerLine; i++, v++, idx += floatsPerVertex) { 
              // and store them sequentially in vertSet[] array.
              // We already know  yNow; find the xNow:
              if(i==0) xNow = -diff;  // line start
              else xNow = diff;       // line end.
              // Set all values for this vertex:
              vertSet[idx  ] = xNow;            // x value
              vertSet[idx+1] = yNow;            // y value
              vertSet[idx+2] = 0.0;             // z value
              vertSet[idx+3] = 1.0;             // w;
              vertSet[idx+4] = yColr[0];  // r
              vertSet[idx+5] = yColr[1];  // g
              vertSet[idx+6] = yColr[2];  // b
              vertSet[idx+7] = yColr[3];  // a;
            }
        }
    return vertSet;
}