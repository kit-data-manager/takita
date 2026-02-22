var mousedown_position;
var rect;

var editable = false;

var width;
var height;

var canvas
var img;
var annoJson;
var paper; 

var MouseDownX;
var MouseDownY;
var newRectangle;
var polygonPoint;
var firstPolygonPoint;
var invisiblePolygonPoint;
var polygonPath;

var addingRectangle = false;
var addingPolygon = false;

// returns relative coordinates to the upper left corner of the image
function getRelativeCoordinates(x, y) {
    var imageWorkspaceBoundingRect = document.getElementById("imageWorkspace").getBoundingClientRect();
    var relativeX = x - imageWorkspaceBoundingRect.left;
    var relativeY = y - imageWorkspaceBoundingRect.top;
    return [relativeX, relativeY];
};

// return scaling ratios for x and y coordinates, can also be used for width / height
function getScalingRatios() {
    var imageWorkspaceBoundingRect = document.getElementById("imageWorkspace").getBoundingClientRect();
    var scalingRatioX = imageWorkspaceBoundingRect.width / width;
    var scalingRatioY = imageWorkspaceBoundingRect.height / height;
    return [scalingRatioX, scalingRatioY];
};

// main drawing function for rectangles
// assigns moving and modifying functionalities on mouse click
function drawRectangle(x, y, width, height, color){
   var rectangle = paper.rect(x, y, width, height);
   console.log(rectangle);
   rectangle.attr({
       'stroke' : color, 
       'stroke-opacity' : 1, 
       'stroke-width' : 10, 
       'fill' : color, 
       'fill-opacity' : 0.01
   });
   rectangle.click(function() {
      if (this.selected) {
        this.selected = false;
        this.attr({'fill-opacity' : 0.01});
        this.undrag();
        this.unmousemove(changeCursor);
        this.attr({'cursor' : 'default'});
      } else {
        this.selected = true;
        this.attr({'fill-opacity' : 0.2});
        // Raphael event
        this.drag(dragRectangleMove, dragRectangleStart, dragRectangleEnd);
        // changing cursor to arrow cursor depending on the mouse position
        this.mousemove(changeCursor);
      };
    });
    return rectangle;
};

// Storing original rectangle values (coordinates, width, height) before modifying
var dragRectangleStart = function() {
    this.ox = this.attr('x');
    this.oy = this.attr('y');
    this.ow = this.attr('width');
    this.oh = this.attr('height');
    this.dragging = true;
};

// Storing the original polygon points before modifying
var dragPolygonStart = function() {
    console.log("Start");
    this.opoints = [];
    for (circle in this.points) {
        this.opoints.push(this.points[circle].clone().attr({'r' : 1}));
        
    }
    //this.opoints = JSON.parse(JSON.stringify(this.points));
    //this.opoints = this.points;
};

// resizing or dragging rectangles
// x and y input coordinates are scaled to match the resolution of the image
var dragRectangleMove = function(screenDx, screenDy) {
    var scalingRatios = getScalingRatios();
                    
    var dx = screenDx / scalingRatios[0];
    var dy = screenDy / scalingRatios[1];
    
    console.log(dx + ", " + dy);
                    
    // Inspect cursor to determine which resize/move process to use
    switch (this.attr('cursor')) {

	case 'nw-resize' :
            this.attr({
		x: this.ox + dx, 
		y: this.oy + dy, 
		width: this.ow - dx, 
		height: this.oh - dy
            });
            break;

	case 'ne-resize' :
            this.attr({ 
		y: this.oy + dy , 
		width: this.ow + dx, 
		height: this.oh - dy
            });
            break;

	case 'se-resize' :
            this.attr({
		width: this.ow + dx, 
		height: this.oh + dy
            });
            break;

	case 'sw-resize' :
            this.attr({ 
		x: this.ox + dx, 
		width: this.ow - dx, 
		height: this.oh + dy
            });
            break;

	case 'w-resize' :
            this.attr({
		x: this.ox + dx,
		width: this.ow - dx
            });
            break;

	case 'e-resize' :
            this.attr({
		width: this.ow + dx
            });
            break;

	case 's-resize' :
            this.attr({
		height: this.oh + dy
            });
            break;

	case 'n-resize' :
            this.attr({
		y: this.oy + dy,
		height: this.oh - dy
            });
            break;

	default :
            this.attr({
                x: this.ox + dx, 
		y: this.oy + dy
            });
            break;

    }
};

var dragPolygonMove = function(screenDx, screenDy) {
    console.log("Move");
    this.attr('cursor', 'move');
    
    var scalingRatios = getScalingRatios();
                    
    var dx = screenDx / scalingRatios[0];
    var dy = screenDy / scalingRatios[1];
    
    for (circle in this.opoints) {
        movedX = this.opoints[circle].attrs.cx + dx;
        movedY = this.opoints[circle].attrs.cy + dy;
        //coordinatePair = this.opoints[point].split(',');
        //movedX = parseInt(coordinatePair[0]) + dx;
        //movedY = parseInt(coordinatePair[1]) + dy;
        //this.points[point] = movedX.toString() + ',' + movedY.toString(); 
        this.points[circle].attr({'cx' : movedX, 'cy' : movedY});
    };
    
    var polygonTempPath = 'M' + this.points[0].attrs.cx + ',' + this.points[0].attrs.cy;
    for (let i = 1; i < this.points.length; i++) {
        polygonTempPath = polygonTempPath + 'L' + this.points[i].attrs.cx + ',' + this.points[i].attrs.cy;  
    };
    polygonTempPath = polygonTempPath + 'Z';

    this.attr({'path' : polygonTempPath});
};

var dragRectangleEnd = function() {
    this.dragging = false;
};

var dragPolygonEnd = function() {
    console.log("End")
    this.attr({'cursor' : 'default'});
    for (circle in this.opoints) {
        this.opoints[circle].remove();
    }
};

var changeCursor = function(e, mouseX, mouseY) {

    // Don't change cursor during a drag operation
    if (this.dragging === true) {
	return;
    };

    var scalingRatios = getScalingRatios();
    var relativeCoordinates = getRelativeCoordinates(mouseX, mouseY);
    
    // X,Y Coordinates relative to shape's orgin
    var relativeX = relativeCoordinates[0] - (this.attr('x') * scalingRatios[0]);
    var relativeY = relativeCoordinates[1] - (this.attr('y') * scalingRatios[1]);
    
    var shapeWidth = this.attr('width') * scalingRatios[0];
    var shapeHeight = this.attr('height') * scalingRatios[1];
    
    // area around exact line where events will be triggered
    var resizeBorder = 10;
                       
    // Change cursor
    if (relativeX < resizeBorder && relativeY < resizeBorder) { 
	this.attr('cursor', 'nw-resize');
    } else if (relativeX > shapeWidth-resizeBorder && relativeY < resizeBorder) { 
	this.attr('cursor', 'ne-resize');
    } else if (relativeX > shapeWidth-resizeBorder && relativeY > shapeHeight-resizeBorder) { 
	this.attr('cursor', 'se-resize');
    } else if (relativeX < resizeBorder && relativeY > shapeHeight-resizeBorder) { 
	this.attr('cursor', 'sw-resize');
    } else if (relativeX < resizeBorder && relativeY < shapeHeight-resizeBorder) {
	this.attr('cursor', 'w-resize');
    } else if (relativeX > shapeWidth-resizeBorder && relativeY < shapeHeight-resizeBorder) {
	this.attr('cursor', 'e-resize');
    } else if (relativeX > resizeBorder && relativeY > shapeHeight-resizeBorder) {
	this.attr('cursor', 's-resize');
    } else if (relativeX > resizeBorder && relativeY < resizeBorder) {
	this.attr('cursor', 'n-resize');
    } else { 
	this.attr('cursor', 'move');
    }
};

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
  //width  = img.naturalWidth;
  //height = img.naturalheight;
  //canvas.viewbox(0, 0, width, height);
}

function drawAnnos(annoJson) {
  for (anno in annoJson) {
      console.log(annoJson[anno]);
      const svgDoc = new DOMParser().parseFromString(annoJson[anno].SVG, "text/xml");
      var svgRect = svgDoc.getElementsByTagName('rect')[0];
      var svgPolygon = svgDoc.getElementsByTagName('polygon')[0];
      if (svgRect) {
        annoJson[anno].x = parseInt(svgRect.getAttribute('x'));
        annoJson[anno].y = parseInt(svgRect.getAttribute('y'));
        annoJson[anno].width = parseInt(svgRect.getAttribute('width'));
        annoJson[anno].height = parseInt(svgRect.getAttribute('height'));
        annoJson[anno].type = "Rectangle";
      } else {
        console.log(svgPolygon.getAttribute('points'));
        var polygonPoints = svgPolygon.getAttribute('points').split(' ');
        var polygonTempPath = 'M' + polygonPoints[0];
        for (let i = 1; i < polygonPoints.length; i++) {
          polygonTempPath = polygonTempPath + 'L' + polygonPoints[i];  
        };
        polygonTempPath = polygonTempPath + 'Z';
        console.log(polygonTempPath);
        if (annoJson[anno]['Visible']) {
            polygonPath = paper.path(polygonTempPath)
                                .attr({'stroke':"purple", 'stroke-width' : 10,
                                        'fill' : "purple", 'fill-opacity' : 0.01});
            polygonPath.points = [];
            for (point in polygonPoints) {
                coordinatePair = polygonPoints[point].split(',');
                x = parseInt(coordinatePair[0]);
                y = parseInt(coordinatePair[1]);
                polygonPath.points.push(paper.circle(x, y, 20).attr("fill", "white"));
            }
            console.log(polygonPath);
            polygonPath.click(function() {
                this.drag(dragPolygonMove, dragPolygonStart, dragPolygonEnd);
            });
        };
      };
      
  }; 
  var sortedAnnoJson = annoJson.sort(function(a,b) {return (b.height*b.width)-(a.height*a.width);});
  console.log(sortedAnnoJson);
  for (anno in sortedAnnoJson) {
      if (sortedAnnoJson[anno]["Visible"]) {
          drawRectangle(sortedAnnoJson[anno].x, sortedAnnoJson[anno].y, sortedAnnoJson[anno].width, sortedAnnoJson[anno].height, sortedAnnoJson[anno].Color);
      };
  };
}

function toggleVisible(id, button) {
  console.log("clear");
  canvas.clear();

  for (i = 0; i < annoJson.length; i++) {
    var thisAnno = annoJson[i];
    if (id === thisAnno["ID"]) {
      var newColor;
      if (thisAnno["Visible"])  {
        newColor = 'grey'
      } else {
        newColor = 'blue'
      }
      button.style.background = newColor;

      thisAnno["Visible"] = !thisAnno["Visible"];
    }
  }
  drawAnnos(annoJson);
}

//function zoom(z) {
//  img.style.transform=" scale("+z+", "+z+")";
//  img.style.width=(z*100)+"%";
//  canvas.zoom(z/6, { x:width/2, y:height/2});
// }

function init(annotations) {

  console.log(currentPageId);
  var image = new Image();
  image.onload = function (){
    width = image.naturalWidth;
    height = image.naturalHeight;
    console.log(width + ", " + height);
    paper = Raphael("imageWorkspace", '100%', '100%');
    paper.image(currentPageId, 0, 0, width, height);
    paper.setViewBox(0, 0, width, height);
    document.getElementById("imageWorkspace").oncontextmenu = function(e) {
        e.preventDefault();
        if (addingPolygon) {
            for (point in polygonPath.points) {
                polygonPath.points[point].remove();
            };
            polygonPath.remove();
            firstPolygonPoint = undefined;
            polygonPath = undefined;
            polygonPoint = undefined;
            invisiblePolygonPoint = undefined;
            addingPolygon = false;
        };
    };
    document.getElementById("imageWorkspace").onmousedown = function(coordinates) {
        if (addingRectangle) {
            var relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            var scalingRatios = getScalingRatios();
            mouseDownX = relativeCoordinates[0];
            mouseDownY = relativeCoordinates[1];
            console.log(mouseDownX);
            console.log(mouseDownY);
            newRectangle = drawRectangle(relativeCoordinates[0] / scalingRatios[0], relativeCoordinates[1] / scalingRatios[1], 0, 0, '#880088');
        }
    };
    document.getElementById("imageWorkspace").onclick = function(coordinates){
        if (addingPolygon) {
            var relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            var scalingRatios = getScalingRatios();
            var scaledX = relativeCoordinates[0] / scalingRatios[0];
            var scaledY = relativeCoordinates[1] / scalingRatios[1];
        
            if (!firstPolygonPoint) {
                firstPolygonPoint = {'x' : scaledX, 'y' : scaledY};
                polygonPath = paper.path("M" + scaledX + " " + scaledY)
                                .attr({'stroke':"purple", 'stroke-width' : 10});
                polygonPath.click(function() {
                    this.drag(dragPolygonMove, dragPolygonStart, dragPolygonEnd);
                });
                polygonPath.points = [];
            };
        
            var dx = Math.abs(scaledX - firstPolygonPoint.x);
            console.log(dx);
            var dy = Math.abs(scaledY - firstPolygonPoint.y);
            console.log(dy);
        
            if (dx > 0 && dx < 50 && dy < 50 || dy > 0 && dx < 50 && dy < 50) {
                console.log("Bin wieder am Start!");
                    polygonPath.attr({
                        'path' : polygonPath.attrs.path.toString().substring(0,polygonPath.attrs.path.toString().lastIndexOf('L')) + 'Z',
                        'fill' : "purple", 
                        'fill-opacity' : 1});
                firstPolygonPoint = undefined;
                polygonPath = undefined;
                polygonPoint = undefined;
                invisiblePolygonPoint = undefined;
                addingPolygon = false;
            } else {
                polygonPoint = paper.circle(scaledX, scaledY, 30).attr("fill", "yellow");
                polygonPath.points.push(polygonPoint);
                if (invisiblePolygonPoint) {
                    invisiblePolygonPoint.attr({'cx' : scaledX, 'cy' : scaledY});
                } else {
                    invisiblePolygonPoint = paper.circle(scaledX, scaledY, 1);
                };
                console.log(polygonPath.attrs.path);
                console.log(polygonPath.attrs.path.toString());
                polygonPath.attr({'path' : polygonPath.attrs.path.toString() + 'L' + scaledX + " " + scaledY});
            };
        };   
    };
    document.getElementById("imageWorkspace").onmousemove = function(coordinates) {
        if (addingRectangle && newRectangle) {
            console.log(coordinates);
            var relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            var scalingRatios = getScalingRatios();

            var rectangleWidth = (relativeCoordinates[0] - mouseDownX) / scalingRatios[0];
            var rectangleHeight = (relativeCoordinates[1] - mouseDownY) / scalingRatios[1];
            console.log(rectangleWidth);
            console.log(rectangleHeight);
        
            var scaledX, scaledY;
        
            if (rectangleWidth < 0) {
                rectangleWidth = -rectangleWidth;
                scaledX = mouseDownX / scalingRatios[0] - rectangleWidth;
            } else {
                scaledX = mouseDownX / scalingRatios[0];
            };
            if (rectangleHeight < 0) {
                rectangleHeight = -rectangleHeight;
                scaledY = mouseDownY / scalingRatios[1] - rectangleHeight;
            } else {
                scaledY = mouseDownY / scalingRatios[1];
            };
         
            newRectangle.attr({
                'x' : scaledX,
                'y' : scaledY,
                'width' : rectangleWidth,
                'height' : rectangleHeight
            });
        };
        if (addingPolygon && polygonPoint) {
            var relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            var scalingRatios = getScalingRatios();
            var polygonX = relativeCoordinates[0] / scalingRatios[0];
            var polygonY = relativeCoordinates[1] / scalingRatios[1];
            invisiblePolygonPoint.attr({'cx' : polygonX, 'cy' : polygonY});
            console.log(invisiblePolygonPoint);
            console.log(polygonPoint);
            
            polygonPath.attr({'path' : polygonPath.attrs.path.toString().substring(0,polygonPath.attrs.path.toString().lastIndexOf('L')) + 'L' + polygonX + " " + polygonY});
            //polygonPath.attrs.path[polygonPath.attrs.path.length-1]=['L', polygonX, polygonY];
            console.log(polygonPath);
            
            //var path = invisiblePolygonPoint.connections[0]; // temp path
            //console.log(path);
            //var startElement = path.startElement.attrs;
            //var endElement = path.endElement.attrs;
            //console.log("M" + startElement.cx + " " + startElement.cy
            //            + "L" + endElement.cx + " " + endElement.cy);
            //
            //path.attr({
            //    'path' : "M" + startElement.cx + " " + startElement.cy
            //            + "L" + endElement.cx + " " + endElement.cy
            //});
        }
    };
    document.getElementById("imageWorkspace").onmouseup = function (coordinates) {
        var relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
        // prevent rectangles with zero width and height if the user clicks
        if (addingRectangle && relativeCoordinates[0] === mouseDownX && relativeCoordinates[1] === mouseDownY) {
            newRectangle.remove();
        };
        // reset variables needed for rectangle creation
        addingRectangle = false;
        newRectangle = undefined;
        mouseDownX = undefined;
        mouseDownY = undefined;
    };
    
    // Drawing anno svgs on first opening of page
    annoJson = JSON.parse(annotations);
    drawAnnos(annoJson);


var p1 = paper.circle(1500, 500, 30).attr("fill", "blue");
var p2 = paper.circle(2000, 1000, 30).attr("fill", "blue");
var p3 = paper.circle(2000, 2000, 30).attr("fill", "blue");
var p4 = paper.circle(1000, 2000, 30).attr("fill", "blue");
var p5 = paper.circle(1000, 1000, 30).attr("fill", "blue");

// Modified from: https://stackoverflow.com/questions/9956186/raphael-js-maintain-path-between-two-objects
// Call paper.connect(obj1,obj2,attributes)
// That draws a line between the two objects and maintains the line when the objects are animated
Raphael.fn.connect = function(obj1, obj2, attribs) {
    // list of paths each object has
    if (!obj1.connections) obj1.connections = []
    if (!obj2.connections) obj2.connections = []
    // get the bounding box of each object
    var box1 = obj1.getBBox()
    var box2 = obj2.getBBox()
    // create a line/path from object 1 to object 2
    var p = this.path("M" + (box1.x + box1.width / 2) + ","
            + (box1.y + box1.height / 2) + "L" + (box2.x + box2.width / 2)
            + "," + (box2.y + box2.height / 2))
    // adjust attributes of the path
    p.attr(attribs)
    // set the start and end element for this path
    p.startElement = obj1;
    p.endElement = obj2;
    // add the path to each of the object
    obj1.connections.push(p)
    obj2.connections.push(p)
    // mark each object as being connected
    obj1.connected = true;
    obj2.connected = true;
    // listen for the Raphael frame event
    eve.on("raphael.drag.*", function(obj) {
        // if the object the frame event is fired on is connected
        if (this.connected) {
            // for each connection on this object
            for ( var c in this.connections) {
                var path = this.connections[c]; // temp path
                var b1 = path.startElement.getBBox(); // get the current
                                                        // location of start
                                                        // element
                var b2 = path.endElement.getBBox();// get the current location
                                                    // of end element
                // move the path to the new locations
                path.attr({
                    'path' : "M " + (b1.x + b1.width / 2) + " "
                            + (b1.y + b1.height / 2) + "L "
                            + (b2.x + b2.width / 2) + " "
                            + (b2.y + b2.height / 2),
                    'opacity' : Math.max(path.startElement.attr('opacity'),
                            path.endElement.attr('opacity'))
                });
            }
        }
    });
}

// connect adjacent polygon points
paper.connect(p1,p2,{'stroke':"red", 'stroke-width' : 10});
paper.connect(p2,p3,{'stroke':"red", 'stroke-width' : 10});
paper.connect(p3,p4,{'stroke':"red", 'stroke-width' : 10});
paper.connect(p4,p5,{'stroke':"red", 'stroke-width' : 10});
paper.connect(p5,p1,{'stroke':"red", 'stroke-width' : 10});

// make points draggable
var startPolygon = function () {
    this.ox = this.attr("cx");
    this.oy = this.attr("cy");
},
movePolygon = function (dx, dy) {
    this.attr({cx: this.ox + dx, cy: this.oy + dy});
},
upPolygon = function () {};
paper.set(p1,p2,p3,p4,p5).drag(movePolygon, startPolygon, upPolygon);

  };
  image.src = currentPageId;
}