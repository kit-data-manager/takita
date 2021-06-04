var mousedown_position;
var rect;

var editable = false;

var width;
var height;

var canvas
var img;

function toggleEditable() {
  if (editable) {
    editable = false;
  } else {
    editable = true;
  }
  console.log(editable);
  console.log("editable")
}

function resizeViewbox() {
  width  = img.naturalWidth;
  height = img.naturalheight;
  canvas.viewbox(0, 0, width, height);
}

function drawSvg(svgString, color, id) {
  console.log("draw stuff " + svgString)
  var newShape = new SVG(svgString)
        .fill({opacity: 0.0})
        .stroke({ color: color, opacity: 1, width: 10 })
        .addTo(canvas);
  newShape.on('click', (e) => {
    console.log("clicked a shape!");
    selectAnnotation(e, id);
  })
}

function init(annotations) {
  console.log(annotations)

  img = document.getElementById("pageImage");
  width = img.naturalWidth;
  height = img.naturalHeight;

  // Create SVG element we can draw into
  canvas = SVG().addTo('#imageWorkspace')
    .attr({id: "canvas"})
    .size(img.width, img.height)
    .viewbox(0, 0, width, height);

  // Drawing anno svgs on first opening of page
  var annoJson = JSON.parse(annotations);
  for (var i = 0; i < annoJson.length; i++) {
    var anno = annoJson[i]; 
    drawSvg(anno["SVG"], anno["Color"], anno["ID"]);
  }
  

  // what to do when we press the mouse button down
  canvas.on('mousedown', (e) => {
    if (editable) {
      console.log("down")
      // Convert mouse coordinates into canvas coordinates and store them
      mousedown_position = canvas.point(e.clientX, e.clientY)
      console.log(mousedown_position)
      // draw a rectangle with size of zero (will get larger if mouse gets moved, see "mousemove" event)
      // note that the rect is stored so we can reference it on mousemove or mouseup
      // for the available manipulation methods used here, see: https://svgjs.com/docs/3.0/manipulating/
      rect = new SVG.Rect()
          .size(0, 0)
          .attr({x: mousedown_position.x, y: mousedown_position.y})
          .fill({opacity: 0.0})
          .stroke({ color: '#000000', opacity: 1, width: 5 })
          .addTo(canvas)
      // define for this rectangle what to do when we click on it (similar to mouseup)
      rect.on('click', (e) => {
          console.log("clicked a rectangle!")
      })
      console.log("new rectangle!");
      console.log(rect);
    }
  })

  // What to to when releasing the mouse button
  canvas.on('mouseup', (e) => {
      console.log("up")
      rect = null
  })

  // what to do on mouse movement
  canvas.on('mousemove', (e) => {
    if (editable) {
      console.log("move")
      if (rect == null) {return}
      // Convert mouse coordinates into canvas coordinates
      const {x, y} = canvas.point(e.clientX, e.clientY)
      var rect_height = Math.abs(x - mousedown_position.x)
      var rect_width = Math.abs(y - mousedown_position.y)
      top_left_x = Math.min(mousedown_position.x, x)
      top_left_y = Math.min(mousedown_position.y, y)
      bottom_right_x = Math.max(mousedown_position.x, x)
      bottom_right_y = Math.max(mousedown_position.y, y)
      rect.size(rect_height, rect_width)
      rect.attr({x: top_left_x, y: top_left_y})
    }
  })
}
