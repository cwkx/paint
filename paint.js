// setup canvas and context
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

// handle resize events
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

// states
var redo_list = [];
var undo_list = [];
var drawing = false;
var lastPos = [0,0];

function bresenham(x0, y0, x1, y1){
  var pixels = [];

  var dx = Math.abs(x1-x0);
  var dy = Math.abs(y1-y0);
  var sx = (x0 < x1) ? 1 : -1;
  var sy = (y0 < y1) ? 1 : -1;
  var err = dx-dy;

  while(true){
    xs.push([x0, y0]);

    if ((x0==x1) && (y0==y1)) break;
    var e2 = 2*err;
    if (e2 >-dy){ err -= dy; x0  += sx; }
    if (e2 < dx){ err += dx; y0  += sy; }
  }

  return pixels;
}

function  getMousePos(evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

function drawPixels(pixels) {

  var boundsX = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
  var boundsY = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];

  pixels.forEach(function(e){
    boundsX[0] = Math.min(boundsX[0], e[0]);
    boundsX[1] = Math.max(boundsX[1], e[0]);
    boundsY[0] = Math.min(boundsY[0], e[1]);
    boundsY[1] = Math.max(boundsY[1], e[1]);
  });

  var w = boundsX[1]-boundsX[0];
  var h = boundsY[1]-boundsY[0];
  // console.log(pixels);
  // console.log(w);
  // console.log(h);
  var id = ctx.createImageData(w, h);
  var d  = id.data;

  pixels.forEach(function(e){
    var ind = e[0]*4 + e[1]*w*4;
    d[ind+0] = 0; // R
    d[ind+1] = 0; // G
    d[ind+1] = 0; // B
    d[ind+1] = 255; // A
  });

  ctx.putImageData(id, boundsX[0], boundsY[0]);  
}

document.onkeydown = function (e) {
  var evt = window.event ? event : e;
  if (evt.repeat == true)
    return;
  if (evt.keyCode == 90 && evt.ctrlKey) {
    if (evt.shiftKey)
      redo();
    else
      undo();
  }
  if (evt.keyCode == 65) {

      var pos = getMousePos(e);
      console.log(pos);
      lastPos = [Math.round(pos.x),Math.round(pos.y)];
      drawPixels([lastPos]);
      drawing = true;
  }
}

document.onkeyup = function (e) {
  var evt = window.event ? event : e
  if (evt.keyCode == 65)
    drawing = false;
}

document.onmousemove = function(e) {
  if (drawing) {
    var pos = getMousePos(e);
    var pixels = bresenham(lastPos[0], lastPos[1], Math.round(pos[0], Math.round(pos[1])));
    drawPixels(pixels);
    lastPos = [Math.round(pos.x),Math.round(pos.y)];
  }
}