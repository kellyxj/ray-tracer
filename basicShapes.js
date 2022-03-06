//return Float32Array of wireframe vertices
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

function makeDisk(rad, color) {
    if(rad == undefined) rad = 3;   // default value.
    //Set # of lines in grid--------------------------------------
    var xyMax	= rad;
    var xCount = rad*5 +1;
    var yCount = rad*5 +1;
                                                      
    var vertsPerLine =2;

    var vertCount = (xCount + yCount) * vertsPerLine;
    const floatsPerVertex = 8;
    var vertSet = new Float32Array(vertCount * floatsPerVertex); 

    var xColr = vec4.fromValues(color[0], color[1], color[2], 1.0);	   // Light Yellow
    var yColr = vec4.fromValues(color[0], color[1], color[2], 1.0);    // Light Cyan
        
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

polar2xyz = function(out4, fracEW, fracNS) {
      var sEW = Math.sin(2.0*Math.PI*fracEW);
      var cEW = Math.cos(2.0*Math.PI*fracEW);
      var sNS = Math.sin(Math.PI*fracNS);
      var cNS = Math.cos(Math.PI*fracNS);
      vec4.set(out4,  cEW * sNS, 
                      sEW * sNS,
                      cNS, 1.0);
    }

makeSphere = function(NScount, color) {
    if(NScount == undefined) NScount =  13;    // default value.
    if(NScount < 3) NScount = 3;              // enforce minimums
    var EWcount = 2*(NScount);

    const floatsPerVertex = 8;
    
    var vertCount = 2* EWcount * NScount;
    var vertSet = new Float32Array(vertCount * floatsPerVertex); 

    var EWbgnColr = vec4.fromValues(color[0], color[1], color[2], 1);	  // Orange
    var EWendColr = vec4.fromValues(color[0], color[1], color[2], 1);   // Cyan
    var NSbgnColr = vec4.fromValues(color[0], color[1], color[2], 1);	  // White
    var NSendColr = vec4.fromValues(color[0], color[1], color[2], 1);   // White
    

    var EWcolrStep = vec4.create();
    var NScolrStep = vec4.create();
    
    vec4.subtract(EWcolrStep, EWendColr, EWbgnColr); // End - Bgn
    vec4.subtract(NScolrStep, NSendColr, NSbgnColr);
    vec4.scale(EWcolrStep, EWcolrStep, 2.0/(EWcount -1)); // double-step for arc colors
    vec4.scale(NScolrStep, NScolrStep, 1.0/(NScount -1)); // single-step for ring colors
    

    var EWgap = 1.0/(EWcount-1);
                                           
    var NSgap = 1.0/(NScount-1);		
    var EWint=0; 
    var NSint=0;
    var v = 0;
    var idx = 0; 
    var pos = vec4.create();  
    var colrNow = vec4.create(); 
    
      //----------------------------------------------------------------------------
      // 1st BIG LOOP: makes all horizontal rings of constant NSfrac.
    for(NSint=0; NSint<NScount; NSint++) { // for every ring of constant NSfrac,
        colrNow = vec4.scaleAndAdd(               // find the color of this ring;
                  colrNow, NSbgnColr, NScolrStep, NSint);	  
        for(EWint=0; EWint<EWcount; EWint++, v++, idx += floatsPerVertex) { 
            polar2xyz(pos,
            EWint * EWgap,
            NSint * NSgap); 
            vertSet[idx  ] = pos[0];            // x value
            vertSet[idx+1] = pos[1];            // y value
            vertSet[idx+2] = pos[2];            // z value
            vertSet[idx+3] = 1.0;               // w (it's a point, not a vector)
            vertSet[idx+4] = colrNow[0];  // r
            vertSet[idx+5] = colrNow[1];  // g
            vertSet[idx+6] = colrNow[2];  // b
            vertSet[idx+7] = colrNow[3];  // a;
        }
    }
    
      //----------------------------------------------------------------------------
      // 2nd BIG LOOP: makes all vertical arcs of constant EWfrac.
    for(EWint=0; EWint<EWcount; EWint++) { // for every arc of constant EWfrac,
        // find color of the arc:
        if(EWint < EWcount/2) {   // color INCREASES for first hemisphere of arcs:        
          colrNow = vec4.scaleAndAdd(             
                  colrNow, EWbgnColr, EWcolrStep, EWint);
        }
        else {  // color DECREASES for second hemisphere of arcs:
          colrNow = vec4.scaleAndAdd(             
                  colrNow, EWbgnColr, EWcolrStep, EWcount - EWint);
        }  	  
        for(NSint=0; NSint<NScount; NSint++, v++, idx += floatsPerVertex) { 
            polar2xyz(pos, // vec4 that holds vertex position in world-space x,y,z;
            EWint * EWgap,  // normalized East/west longitude (from 0 to 1)
            NSint * NSgap); // normalized North/South lattitude (from 0 to 1)      
          // now set the vertex values in the array:
          vertSet[idx  ] = pos[0];            // x value
          vertSet[idx+1] = pos[1];            // y value
          vertSet[idx+2] = pos[2];            // z value
          vertSet[idx+3] = 1.0;               // w (it's a point, not a vector)
          vertSet[idx+4] = colrNow[0];  // r
          vertSet[idx+5] = colrNow[1];  // g
          vertSet[idx+6] = colrNow[2];  // b
          vertSet[idx+7] = colrNow[3];  // a;
        }
      }
      return vertSet;
    }