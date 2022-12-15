let annoJson;
let paper;

let MouseDownX;
let MouseDownY;
let newRectangle;
let polygonPoint;
let firstPolygonPoint;
let invisiblePolygonPoint;
let polygonPath;

let addingRectangle = false;
let addingPolygon = false;
let movingImage = false;
let initiated = false;

let drawingHistory = [];

class Mode {
  static View = new Mode("view");
  static Create = new Mode("create");
  static Modify = new Mode("modify");
  static Move = new Mode("move");

  constructor(name) {
      this.name = name;
  }
};

let mode = Mode.View;

// returns relative coordinates to the upper left corner of the image
// also includes scrolling offsets
// ToDo: check browser compatibility!
function getRelativeCoordinates(x, y) {
    let imageWorkspaceBoundingRect = document.getElementById("imageWorkspace").getBoundingClientRect();
    let relativeX = (x - imageWorkspaceBoundingRect.left - window.pageXOffset); //* paper.currentWidth / paper.originalWidth;
    let relativeY = (y - imageWorkspaceBoundingRect.top - window.pageYOffset); //* paper.currentHeight / paper.originalHeight;

    return [relativeX, relativeY];
};

// return scaling ratios (image size rendered at client vs original size)
// for x and y coordinates, can also be used for width / height
function getScalingRatios() {
    //let imageWorkspaceBoundingRect = document.getElementById("imageWorkspace").getBoundingClientRect();
    let image = document.getElementById('pageImage');
    let scalingRatioX2 = image.clientWidth / paper.originalWidth;
    let scalingRatioY2 = image.clientHeight / paper.originalHeight;

    return [scalingRatioX2, scalingRatioY2];
};

// create path string from vertices of the polygon, needed for shape creation
function createPolygonPath(points) {
    let polygonPath = 'M' + points[0].attrs.cx + ',' + points[0].attrs.cy;
    for (let i = 1; i < points.length; i++) {
        polygonPath = polygonPath + 'L' + points[i].attrs.cx + ',' + points[i].attrs.cy;
    };
    polygonPath = polygonPath + 'Z';
    return polygonPath;
};

// main drawing function for rectangles
// assigns moving and modifying functionalities on mouse click
function drawRectangle(x, y, width, height, color, id, idEncoded){
    let rectangle = paper.rect(x, y, width, height);
    rectangle.attr({
       'stroke' : color,
       'stroke-opacity' : 1,
       'stroke-width' : 10,
       'fill' : color,
       'fill-opacity' : 0.01
    });
    rectangle.annoId = id;
    rectangle.annoIdEncoded = idEncoded;
    rectangle.click(function() {
        paper.forEach(function(element) {
            // deselect all previously selected shapes and remove all Raphael
            // events for view and create mode
            if (element.selected && element.id !== rectangle.id) {
                if (mode.name !== "modify") {
                    // TODO: stimmt das wirklich so?
                    disableRectangleModification(element);
                toggleShapeSelect(element);
                }
            };
        });
        if (mode.name === "modify") {
            // for now: nothing can be selected during modification mode
            // TODO: discuss this approach
            // if shape was selected before remove the Raphael events
            //if (this.selected) {
            //    disableRectangleModification(this);
            //} else {
            //    enableRectangleModification(this);
            //};
            //toggleShapeSelect(this);
        };
        if (mode.name === "view") {
            if (this.selected) {
                if (!document.getElementById('annotationCard').classList.contains('is-hidden')) {
                    toggleOverview('annotationCard');
                };
            } else {
                selectAnnotation(null, this.annoIdEncoded);
                if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
                    toggleOverview('annotationCard');
                };
            };
            toggleShapeSelect(this);
        };
    });
    return rectangle;
};

function enableRectangleModification (shape) {
    // Raphael event for rectangle movement
    shape.drag(dragRectangleMove, dragRectangleStart, dragRectangleEnd);
    // changing cursor to arrow cursor depending on the mouse position
    shape.mousemove(changeCursor);
};

function disableRectangleModification (shape) {
    shape.undrag();
    shape.unmousemove(changeCursor);
    shape.attr({'cursor' : 'default'});
};

// main drawing function for polygons
// assigns moving and modifying functionalities on mouse click
function drawPolygon(path, color, id, idEncoded) {
    let polygon = paper.path(path)
                       .attr({
                            'stroke': color,
                            'stroke-width' : 10,
                            'fill' : color,
                            'fill-opacity' : 0.01
                        });
    polygon.points = [];
    polygon.annoId = id;
    polygon.annoIdEncoded = idEncoded;
    polygon.click(function() {
        console.log(mode.name);
        paper.forEach(function(element) {
            if (element.selected && element.id !== polygon.id) {
                if (mode.name !== "modify") {
                    disablePolygonModification(element);
                toggleShapeSelect(element);
                };

            };
        });
        if (mode.name === "modify") {
            // for now: nothing can be selected during modification mode
            // TODO: discuss this approach
            //if (this.selected) {
            //    disablePolygonModification(this);
            //} else {
            //    enablePolygonModification(this);
            //};
            //toggleShapeSelect(this);
        };
        if (mode.name === "view") {
            if (this.selected) {
                if (!document.getElementById('annotationCard').classList.contains('is-hidden')) {
                    toggleOverview('annotationCard');
                };
            } else {
                selectAnnotation(null, this.annoIdEncoded);
                if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
                    toggleOverview('annotationCard');
                };
            };
            toggleShapeSelect(this);
        };
    });
    return polygon;
};

function enablePolygonModification (shape) {
    // Raphael event
    shape.drag(dragPolygonMove, dragPolygonStart, dragPolygonEnd);
    shape.attr({'cursor' : 'move'});

    // show vertices of polygon
    for (let point in shape.points) {
        toggleShapeVisibility(shape.points[point]);
    };
};

function disablePolygonModification (shape) {
    shape.undrag();
    shape.attr({'cursor' : 'default'});
    // hiding vertices of polygon
    for (let point in shape.points) {
        // if not checked, polygons will get modifiable by accident
        if (shape.points[point].isVisible()) {
            toggleShapeVisibility(shape.points[point]);
        };
    };
};

// changes the fill opacity of the shape on the canvas to indicate selection
function toggleShapeSelect(shape) {
  if (shape.selected) {
    shape.selected = false;
    shape.attr({'fill-opacity' : 0.01});
  } else {
    shape.selected = true;
    shape.attr({'fill-opacity' : 0.2});
  };
};

// toggling the visibility of the Raphael shape on the canvas
function toggleShapeVisibility(shape) {
    if (shape.isVisible()) {
        shape.hide();
    } else {
        shape.show();
    }
};

// additional function for Raphael shape to determine shape visibility on the canvas
Raphael.el.isVisible = function() {
    return (this.node.style.display !== "none");
};

// Storing original rectangle values (coordinates, width, height) before modifying
let dragRectangleStart = function() {
    this.ox = this.attr('x');
    this.oy = this.attr('y');
    this.ow = this.attr('width');
    this.oh = this.attr('height');
    this.dragging = true;
};

// Storing the original polygon points before modifying
let dragPolygonStart = function() {
    this.opoints = [];
    for (let circle in this.points) {
        this.opoints.push(this.points[circle].clone().attr({'r' : 1}));

    }
};

// Storing the original circle values before modifying
let dragCircleStart = function() {
    this.ox = this.attr("cx");
    this.oy = this.attr("cy");
};

// resizing or dragging rectangles
// x and y input coordinates are scaled to match the resolution of the image
let dragRectangleMove = function(screenDx, screenDy) {
    let scalingRatios = getScalingRatios();

    let dx = screenDx / scalingRatios[0] * paper.currentWidth / paper.originalWidth;
    let dy = screenDy / scalingRatios[1] * paper.currentHeight / paper.originalHeight;

    // Inspect cursor to determine which resize/move process to use
    switch (this.attr('cursor')) {

	case 'nw-resize' :
            this.attr({
		x: Math.round(this.ox + dx),
		y: Math.round(this.oy + dy),
		width: Math.round(this.ow - dx),
		height: Math.round(this.oh - dy)
            });
            break;

	case 'ne-resize' :
            this.attr({
		y: Math.round(this.oy + dy),
		width: Math.round(this.ow + dx),
		height: Math.round(this.oh - dy)
            });
            break;

	case 'se-resize' :
            this.attr({
		width: Math.round(this.ow + dx),
		height: Math.round(this.oh + dy)
            });
            break;

	case 'sw-resize' :
            this.attr({
		x: Math.round(this.ox + dx),
		width: Math.round(this.ow - dx),
		height: Math.round(this.oh + dy)
            });
            break;

	case 'w-resize' :
            this.attr({
		x: Math.round(this.ox + dx),
		width: Math.round(this.ow - dx)
            });
            break;

	case 'e-resize' :
            this.attr({
		width: Math.round(this.ow + dx)
            });
            break;

	case 's-resize' :
            this.attr({
		height: Math.round(this.oh + dy)
            });
            break;

	case 'n-resize' :
            this.attr({
		y: Math.round(this.oy + dy),
		height: Math.round(this.oh - dy)
            });
            break;

	default :
            this.attr({
                x: Math.round(this.ox + dx),
		y: Math.round(this.oy + dy)
            });
            break;

    }
};

let dragPolygonMove = function(screenDx, screenDy) {
    this.attr('cursor', 'move');

    let scalingRatios = getScalingRatios();

    // scale screen movement to orginal image size
    let dx = screenDx / scalingRatios[0] * paper.currentWidth / paper.originalWidth;
    let dy = screenDy / scalingRatios[1] * paper.currentHeight / paper.originalHeight;

    for (let circle in this.opoints) {
        movedX = Math.round(this.opoints[circle].attrs.cx + dx);
        movedY = Math.round(this.opoints[circle].attrs.cy + dy);
        this.points[circle].attr({'cx' : movedX, 'cy' : movedY});
    };

    this.attr({'path' : createPolygonPath(this.points)});
};

let dragCircleMove = function(screenDx, screenDy) {
    let scalingRatios = getScalingRatios();

    let dx = screenDx / scalingRatios[0];
    let dy = screenDy / scalingRatios[1];

    // change the corresponding polygon as well
    this.path.attr({'path' : createPolygonPath(this.path.points)});
    this.attr({cx: Math.round(this.ox + dx), cy: Math.round(this.oy + dy)});

};

let dragRectangleEnd = function() {
    drawingHistory.push({"id" : this.id, "attr": {"x" : this.ox, "y" : this.oy, "width" : this.ow, "height" : this.oh}});
    this.dragging = false;
};

let dragPolygonEnd = function() {
    if (!firstPolygonPoint) {
       let undoInformation = [];
        for (let point in this.opoints) {
            undoInformation.push({"id" : this.opoints[point].id, "cx" : this.opoints[point].attrs.cx, "cy" : this.opoints[point].attrs.cy});
        };
        drawingHistory.push({"id" : this.id, "attr" : {"path" : createPolygonPath(this.opoints)}, "points" : undoInformation});
    };

    this.attr({'cursor' : 'default'});
    for (let circle in this.opoints) {
        this.opoints[circle].remove();
    }
};
let dragCircleEnd = function() {
    if (!firstPolygonPoint) {
        drawingHistory.push({"id" : this.id, "attr" : {"cx" : this.ox, "cy" : this.oy}, "pathId" : this.path.id});
    };
};

let changeCursor = function(e, mouseX, mouseY) {

    // Don't change cursor during a drag operation
    if (this.dragging === true) {
	return;
    };

    let scalingRatios = getScalingRatios();
    let relativeCoordinates = getRelativeCoordinates(mouseX, mouseY);

    // X,Y Coordinates relative to shape's orgin
    let relativeX = relativeCoordinates[0] - (this.attr('x') * scalingRatios[0]) + (paper.currentX * scalingRatios[0]);
    let relativeY = relativeCoordinates[1] - (this.attr('y') * scalingRatios[1]) + (paper.currentY * scalingRatios[1]);

    let shapeWidth = this.attr('width') * scalingRatios[0];
    let shapeHeight = this.attr('height') * scalingRatios[1];

    // area around exact line where events will be triggered
    let resizeBorder = 5;

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

//function resizeViewbox() {
  //width  = img.naturalWidth;
  //height = img.naturalheight;
  //canvas.viewbox(0, 0, width, height);
//}

function extractInformationFromTarget (targetString, annoJson) {
    const svgDoc = new DOMParser().parseFromString(targetString, "text/xml");
    /*let svgRect = svgDoc.getElementsByTagName('rect')[0];
    let svgPolygon = svgDoc.getElementsByTagName('polygon')[0];
    if (svgRect) {
        annoJson.x = Math.round(parseInt(svgRect.getAttribute('x')));
        annoJson.y = Math.round(parseInt(svgRect.getAttribute('y')));
        annoJson.width = Math.round(parseInt(svgRect.getAttribute('width')));
        annoJson.height = Math.round(parseInt(svgRect.getAttribute('height')));
        annoJson.type = "Rectangle";
        annoJson.icon = "<i class='bx bx-square'></i>";
    } else if (svgPolygon) {
        let polygonPoints = svgPolygon.getAttribute('points').split(' ');
        if (!polygonPoints[polygonPoints.length-1]) {
          // remove the last empty element
          polygonPoints.pop();
        };

        let polygonTempPath = 'M' + polygonPoints[0];
        for (let i = 1; i < polygonPoints.length; i++) {
          polygonTempPath = polygonTempPath + 'L' + polygonPoints[i];
        };
        polygonTempPath = polygonTempPath + 'Z';

        annoJson.points = polygonPoints;
        annoJson.path = polygonTempPath;
        annoJson.type = "Polygon";
        annoJson.icon = "<i class='bx bx-polygon'></i>";

        polygonPath = drawPolygon(polygonTempPath, "purple", null, null).hide();
        annoJson.height = Math.round(polygonPath.getBBox().height);
        annoJson.width = Math.round(polygonPath.getBBox().width);
        polygonPath.remove();
    };*/
}

function drawAnnos(annoJson) {
    console.log(annoJson);
  for (let anno in annoJson) {
     extractInformationFromTarget(annoJson[anno].target, annoJson[anno]);
  };

    // sort all annotations resp. the corresponding shape area (descending)
    // annotations without shape are at the end of the array
    let sortedAnnoJson = annoJson.sort(function(a,b) {
        // if either anno has no width or height, then consider it as smaller
        if (!(a.height && a.width)) {
            return (b.height*b.width);
        };
        if (!(b.height && b.width)) {
            return -(a.height*a.width);
        };
        return (b.height*b.width)-(a.height*a.width);
    });

    // create Raphael objects according to the shape to draw them on the canvas
    for (let anno in sortedAnnoJson) {
      if (sortedAnnoJson[anno]["visible"]) {
        if (sortedAnnoJson[anno].type === "Rectangle") {
            // if shape color has not been set, set it to default
            // otherwise it won't be visible on the Raphael paper
            if (!sortedAnnoJson[anno].color) {
                sortedAnnoJson[anno].color = '#ff8d00';
            };
            drawRectangle(sortedAnnoJson[anno].x, sortedAnnoJson[anno].y, sortedAnnoJson[anno].width, sortedAnnoJson[anno].height, sortedAnnoJson[anno].color, sortedAnnoJson[anno].id, sortedAnnoJson[anno].idEncoded);
        } else if (sortedAnnoJson[anno].type === "Polygon") {
            // if shape color has not been set, set it to default
            // otherwise it won't be visible on the Raphael paper
            if (!sortedAnnoJson[anno].color) {
                sortedAnnoJson[anno].color = '#ff8d00';
            };
            polygonPath = drawPolygon(annoJson[anno].path, sortedAnnoJson[anno].color, sortedAnnoJson[anno].id, sortedAnnoJson[anno].idEncoded);
            for (let point in annoJson[anno].points) {
                coordinatePair = annoJson[anno].points[point].split(',');
                x = parseInt(coordinatePair[0]);
                y = parseInt(coordinatePair[1]);
                polygonPoint = paper.circle(x, y, 20)
                                    .attr("fill", "white")
                                    .drag(dragCircleMove, dragCircleStart, dragCircleEnd)
                                    .hide();
                polygonPoint.path = polygonPath;
                polygonPath.points.push(polygonPoint);
            };
        };
      };
  };

  fillMetaDataEditorTable(annoJson);
}

function fillMetaDataEditorTable(annoJson) {

    if (document.getElementById('editor-buttons')) {
        document.getElementById('editor-buttons').remove();
    };

    // decision to only show page annotations in the table
    // can be removed to simply show all annotations of the page
    let filteredAnnoJson = annoJson.filter(anno => anno.type !== "Rectangle" && anno.type !== "Polygon");

    // to include the shape type of the annotation add:
    // "Type": {"type": "string", "title": "Type"}
    let dataModel = {
                "type": "object",
                "properties": {
                    "ID": {
                        "type": "string",
                        "title": "ID"
                    },
                    "Color": {
                        "type": "string",
                        "title": "Color"
                    }
                }
    };

    let items = [{title: "Identifier", field: "id", headerSort: false, cellClick: function (e, cell) {
                selectAnnotation(null, encodeAnnoId(cell.getValue()));
                if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
                    toggleOverview('annotationCard');
                };
                // function to select shape on the canvas
                // not needed as long only page annotations are shown
                //
                //paper.forEach(function(element) {
                    // select the shape corresponding to the row
                //    if (element.annoId === cell.getValue()) {
                //        toggleShapeSelect(element);
                //    };
                    // deselect former selections
                //    if (element.selected && element.annoId !== cell.getValue()) {
                //        toggleShapeSelect(element);
                //    }
                //});
                }},
                //{title: "", field: "icon", formatter:"html", width:60, hozAlign: "center"},
                {title: "", field: "color", formatter:"color", width:60}];

    let inputs = {dataModel: dataModel, uiForm: "*", resource: filteredAnnoJson, items: items,
            // toggling shape visibility on the canvas
            // not needed as long only page annotations are shown
            //
            //readOperation: function (rowColumnvalue){
            //    paper.forEach(function(element) {
            //        if (element.annoId === rowColumnvalue.id) {
            //            toggleShapeVisibility(element);
            //        };
            //    });
            //},
            updateOperation: function (rowColumnvalue){
                selectAnnotation(null, encodeAnnoId(rowColumnvalue.id));
                if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
                    toggleOverview('annotationCard');
                };
                // toggling shape selection on the canvas
                // not needed as long only page annotations are shown
                //
                //paper.forEach(function(element) {
                //    if (element.annoId === rowColumnvalue.id) {
                //        toggleShapeSelect(element);
                //    };
                //});
            },
            deleteOperation: function (rowColumnvalue){
                deleteAnnotation(rowColumnvalue.id);
            }
            //creation of page annotations is moved to the sidebar
            //
            //createOperation: { callback: function (){
            //    const modal = document.getElementById("createAnnotation");
            //    modal.classList.toggle("show-modal");
            //    pickTemplate("", "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
            //}, buttonTitle: "Create New Annotation"},

            // list operation not needed in our use case right now
            //
            //listOperation: function(rowColumnvalue){
                //project-specific implementation.
            //}
            };

            $('#table').metadataeditorTable(inputs);

};

function createPageAnnotation() {
    const modal = document.getElementById("createAnnotation");
    modal.classList.toggle("show-modal");
    pickTemplate("", "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
};

function imageZoomIn() {
    paper.currentWidth = paper.currentWidth - paper.originalWidth/10;
    paper.currentHeight = paper.currentHeight - paper.originalHeight/10;

    if (paper.currentWidth > 0 && paper.currentHeight > 0) {
       paper.setViewBox(paper.currentX, paper.currentY, paper.currentWidth, paper.currentHeight);

       let image = document.getElementById('pageImage');
       image.style.width = document.getElementById('imageWorkspace').clientWidth * paper.originalWidth / paper.currentWidth + 'px';
       //image.style.left = Math.round(-paper.currentX * document.getElementById('imageWorkspace').clientWidth / paper.originalWidth)  + 'px';
       image.style.left = Math.round(-paper.currentX * image.clientWidth / paper.originalWidth)  + 'px';
       //image.style.top = Math.round(-paper.currentY * document.getElementById('imageWorkspace').clientHeight / paper.originalHeight) + 'px';
       image.style.top = Math.round(-paper.currentY * image.clientHeight / paper.originalHeight) + 'px';
    } else {
        alert("Can't zoom in further!");
    };

};

function imageZoomOut() {
    paper.currentWidth = paper.currentWidth + paper.originalWidth/10;
    paper.currentHeight = paper.currentHeight + paper.originalHeight/10;
    paper.setViewBox(paper.currentX, paper.currentY, paper.currentWidth, paper.currentHeight);

    let image = document.getElementById('pageImage');
    image.style.width = document.getElementById('imageWorkspace').clientWidth * paper.originalWidth / paper.currentWidth + 'px';
    image.style.left = Math.round(-paper.currentX * image.clientWidth / paper.originalWidth)  + 'px';
    image.style.top = Math.round(-paper.currentY * image.clientHeight / paper.originalHeight) + 'px';
};

function hideShape() {
    paper.forEach(function(element) {
        if (element.selected) {
            toggleShapeVisibility(element);
        };
    });
}

function resetView() {
    paper.currentWidth = paper.originalWidth;
    paper.currentHeight = paper.originalHeight;
    paper.currentX = 0;
    paper.currentY = 0;
    paper.setViewBox(0, 0, paper.originalWidth, paper.originalHeight);
    paper.forEach(function(element) {
        if (!element.isVisible() && element.type !== "circle") {
            toggleShapeVisibility(element);
        };
    });
    let image = document.getElementById('pageImage');
    image.style.width = document.getElementById('imageWorkspace').clientWidth + 'px';
    image.style.left = 0  + 'px';
    image.style.top = 0 + 'px';
};

function modifyShape() {
    mode = Mode.Modify;

    document.getElementById('modifyButton').parentElement.classList.add('active');

    paper.forEach(function(element) {
        // adding the Raphael events for modification if a shape was already
        // selected before the button click
        if (element.selected) {
            if (element.type === "rect") {
                enableRectangleModification(element);
            };

            if (element.type === "path") {
                enablePolygonModification(element);
            };
        };
    });
}

// undo also works for multiple objects and object creation
// if this is desired, the necessary information need to be added to drawingHistory
function undo() {
    if (drawingHistory.length > 0) {
        // get the last changed element from your history
        lastChangedElement = drawingHistory[drawingHistory.length-1];
        // get the corresponding shape from the Raphael paper
        lastChangedShape = paper.getById(lastChangedElement.id);
        // if the shape was created, delete it
        // otherwise restore the former state as stored in the history
        if (!lastChangedElement.attr) {
            // remove polygon vertices
            for (let point in lastChangedElement.points) {
                if (lastChangedElement.points[point].id) {
                    paper.getById(lastChangedElement.points[point].id).remove();
                };
            };
            lastChangedShape.remove();
        } else {
            lastChangedShape.attr(lastChangedElement.attr);
            // move back polygon vertices after dragging operation
            for (let point in lastChangedElement.points) {
                lastChangedShape.points[point].attr(lastChangedElement.points[point]);
            };
            //
            if (lastChangedElement.pathId) {
                let pathShape = paper.getById(lastChangedElement.pathId);
                pathShape.attr({'path' : createPolygonPath(pathShape.points)});
            }
        };
        drawingHistory.pop();
    };
};

function saveShape() {
    if (drawingHistory) {
        // for now all entries have the same id - needs to be adjusted if the
        // design of the modification mode is altered
        let modifiedShape;
        let svgString;
        if (drawingHistory[0].pathId) {
            // modified shape is a polygon
            modifiedShape = paper.getById(drawingHistory[0].pathId);
            svgString = "<svg><polygon points=\"";
            for (let point in modifiedShape.points) {
                svgString += modifiedShape.points[point].attrs.cx + "," + modifiedShape.points[point].attrs.cy + " ";
            };
            svgString += "\"/></svg>";
        } else {
            // modified shape is a rectangle
            modifiedShape = paper.getById(drawingHistory[0].id);
            svgString = "<svg><rect x=\"" + modifiedShape.attrs.x + "\" y=\"" + modifiedShape.attrs.y + "\" width=\"" + modifiedShape.attrs.width + "\" height=\"" + modifiedShape.attrs.height + "\"/></svg>";
        };

        let annotationDataJson = {"color" : modifiedShape.attrs.fill, "motivation" : "describing", "svgCode" : svgString};

        $ .ajax({
            type : 'PUT',
            url : '/editor_rest/annotations/' + modifiedShape.annoIdEncoded,
            data : JSON.stringify(annotationDataJson),
            headers : {
                'Content-Type' : 'application/json'
            },

            success : function(responseData) {
                for (let anno in annoJson) {
                    if (annoJson[anno].id === modifiedShape.annoId) {
                        annoJson[anno].svg = svgString;

                        if (annoJson[anno].type === "Rectangle") {
                            annoJson[anno].x = modifiedShape.attrs.x;
                            annoJson[anno].y = modifiedShape.attrs.y;
                            annoJson[anno].width = modifiedShape.attrs.width;
                            annoJson[anno].height = modifiedShape.attrs.height;
                        } else {
                            let polygonPoints = [];
                            for (let point in modifiedShape.points) {
                                polygonPoints.push(modifiedShape.points[point].attrs.cx + ',' + modifiedShape.points[point].attrs.cy);
                            }

                            let polygonTempPath = 'M' + polygonPoints[0];
                            for (let i = 1; i < polygonPoints.length; i++) {
                                polygonTempPath = polygonTempPath + 'L' + polygonPoints[i];
                            };
                            polygonTempPath = polygonTempPath + 'Z';

                            annoJson[anno].path = polygonTempPath;
                            annoJson[anno].points = polygonPoints;
                        };
                    };
                };
                endModification(modifiedShape);
            },

            error : function(errorData) {
                 console.log(errorData);
            }
        });
    };
};

function endModification (shape) {
    document.getElementById('modifyButton').parentElement.classList.remove('active');
    // empty the undo stack
    drawingHistory.length = 0;

    // remove all modification functionalities
    if (shape.type === "rect") {
        disableRectangleModification(shape);
    };

    if (shape.type === "path") {
        disablePolygonModification(shape);
    };

    mode = Mode.View;
};

function init(annotations) {
	document.getElementById("TEI").onmouseup = function (event) {
		
		// only get a selection, if a user actually wants to select text
		//if (selectingText) {
			// paste the finished code here; ich könnte auch if (selectingText && window.getSelection().toString()) nehmen, macht das was?
			// diasbling the text selection after a successfull one, ot reenable it, a user needs to click on the selectTextButton
			//selectingText = false;}
		
		// check if the string is filled, because on a double click the first onmouseup
		// will have no selection and therefore no string
		if (window.getSelection().toString()){
			let selection = window.getSelection();
			let selectedText = selection.toString();
			let selectionRange = window.getSelection().getRangeAt(0);
			// i had extractContents at first, but that just screwed the dom i think
			let selectionRangeContents = selectionRange.cloneContents();
			// targetList holds all the nodes from the selection, that are <w> elements
			let targetList = [];
			// targetListJson is a list of all the <w> elements id to be used as targets for
			// the web annotations; its a STRING
			// targetListJsonAsJson is the same as targetListJson but as JSON
			let targetsXmlIds = "";
			let targetListJson;
			let targetListJsonAsJson;
			// following variables are needed to vreate a jsonish target
			let valueId; 
			let selectorObject;
			let targetJson = {};
			let targetArray = [];
			console.log("here");
			//console.log(event);
			console.log(selection);
			console.log(selectionRange);
			console.log(selectionRangeContents);
			
			// storing all the <w> elements from the selection in targetList
			selectionRangeContents.childNodes.forEach( entry => {
				if (entry.id) {
					console.log(entry);
					targetList.push(entry);
				}
			});
			console.log(targetList);
			
			// if the targetList holds only one <w> element, as only one word got selected
			// only that will be stored in targetListJson
			if (targetList.length === 1){
				// storing values to build a JSON
				valueId = "//w[@xml:id =\"" + targetList[0].id + "\"]";
				selectorObject = {type: "XPathSelector", value: valueId};
				targetJson = {source: currentPageId, selector: selectorObject};
				targetListJson = targetJson;
				targetsXmlIds = valueId;
			// if holds multiple <w> elements, as multiple words got selected
			} else if (targetList.length !== 0){
				targetListJson = "[";
				targetList.forEach( item => {
					// storing values to build a JSON and convert it to a STRING
					valueId = "//w[@xml:id =\"" + item.id + "\"]";
					selectorObject = {type: "XPathSelector", value: valueId};
					targetJson = {source: currentPageId, selector: selectorObject};
					targetListJson = targetListJson + JSON.stringify(targetJson) + ",";
					targetsXmlIds = targetsXmlIds + valueId + "§"; 
				});
				// slice removes the last komma, as its not needed; and then remove the "\"
				targetListJson = (targetListJson.slice(0,-1) + "]").replaceAll("\\","");
				targetsXmlIds = targetsXmlIds.slice(0,-1);
				
				/*targetList.forEach( item => {
					// storing values to build a JSON
					targetJson = {};
					valueId = "//w[@xml:id =\"" + item.id + "\"]";
					selectorObject = {type: "XPathSelector", value: valueId};
					targetJson = {source: currentPageId, selector: selectorObject};
					targetArray.push(targetJson);
					
				});*/
				//targetListAsJson = {target: targetArray};
				console.log(targetListJson);
				//console.log(JSON.stringify(targetListAsJson));
				console.log(targetsXmlIds);
			}
			
			const modal = document.getElementById("createAnnotation");
            modal.classList.toggle("show-modal");
            pickTemplate(targetsXmlIds, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
			
			
			
			/*
			{
    "source": "http://example.org/page1.html",
    "selector": {
      "type": "XPathSelector",
      "value": "/html/body/p[2]/table/tr[2]/td[3]/span"
    }*/
			
			/*let target = [];
			
			for (element in selection) {
				target.push(element);
			}
			const modal = document.getElementById("createAnnotation");
            modal.classList.toggle("show-modal");
            pickTemplate(target, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
            
            mode = Mode.View;*/
		}
		
	}
	// this if check stops the code to fail on the editor_text as there is no image present
	if (document.getElementById('pageImage') !== null){
  let image = document.getElementById('pageImage');
  image.style.width = document.getElementById('imageWorkspace').clientWidth + 'px';
  paper = Raphael("canvas", image.width, image.height);

  paper.currentWidth = image.naturalWidth;
  paper.currentHeight = image.naturalHeight;;
  paper.currentX = 0;
  paper.currentY = 0;
  paper.originalWidth = image.naturalWidth;
  paper.originalHeight = image.naturalHeight;
  paper.setViewBox(0, 0, paper.originalWidth, paper.originalHeight);

    document.getElementById("imageWorkspace").oncontextmenu = function(e) {
        e.preventDefault();
        if (addingPolygon) {
            document.getElementById('createPolygonButton').parentElement.classList.remove('active');
            for (let point in polygonPath.points) {
                polygonPath.points[point].remove();
            };
            polygonPath.remove();
            mode = Mode.View;
            firstPolygonPoint = undefined;
            polygonPath = undefined;
            polygonPoint = undefined;
            invisiblePolygonPoint = undefined;
            addingPolygon = false;
        };
    };
    document.getElementById("imageWorkspace").onmousedown = function(coordinates) {
        if (addingRectangle) {

            let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            let scalingRatios = getScalingRatios();

            let scaledX = Math.round((relativeCoordinates[0]) / scalingRatios[0] + paper.currentX);
            let scaledY = Math.round((relativeCoordinates[1]) / scalingRatios[1] + paper.currentY);

            mouseDownX = Math.round(relativeCoordinates[0]);
            mouseDownY = Math.round(relativeCoordinates[1]);

            newRectangle = drawRectangle(scaledX, scaledY, 0, 0, '#ff8d00', null, null);
        };

        if (movingImage) {

            initiated = true;
            let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            mouseDownX = Math.round(relativeCoordinates[0]);
            mouseDownY = Math.round(relativeCoordinates[1]);
        };

        if (mode.name === "move" && !movingImage) {
          mode = Mode.View;
        };
    };
    document.getElementById("imageWorkspace").onclick = function(coordinates){
        if (mode.name === "move" && !movingImage) {
          mode = Mode.View;
        };

        if (addingPolygon) {

            let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            let scalingRatios = getScalingRatios();
            let scaledX = Math.round(relativeCoordinates[0] / scalingRatios[0] + paper.currentX);
            let scaledY = Math.round(relativeCoordinates[1] / scalingRatios[1] + paper.currentY);

            if (!firstPolygonPoint) {
                firstPolygonPoint = {'x' : scaledX, 'y' : scaledY};
                polygonPath = drawPolygon("M" + scaledX + " " + scaledY, '#ff8d00', null);
            };

            let dx = Math.abs(scaledX - firstPolygonPoint.x);
            let dy = Math.abs(scaledY - firstPolygonPoint.y);

            if (dx > 0 && dx < 50 && dy < 50 || dy > 0 && dx < 50 && dy < 50) {
                    polygonPath.attr({
                        'path' : polygonPath.attrs.path.toString().substring(0,polygonPath.attrs.path.toString().lastIndexOf('L')) + 'Z',
                        'fill' : "#ff8d00",
                        'fill-opacity' : 0.01});
                    //let undoInformation = [{"id" : invisiblePolygonPoint.id}];
                    //for (point in polygonPath.points) {
                    //    undoInformation.push({"id" : polygonPath.points[point].id})
                    //}
                    //polygonPath.points.push(invisiblePolygonPoint)
                    //drawingHistory.push({"id" : polygonPath.id, "element": null, "points" : undoInformation});
                    mode = Mode.View;

                    let svgString = "<svg><polygon points=\"";
                    for (let point in polygonPath.points) {
                        svgString += polygonPath.points[point].attrs.cx + "," + polygonPath.points[point].attrs.cy + " ";
                    };
                    svgString += "\"/></svg>";

                    const modal = document.getElementById("createAnnotation");
                    modal.classList.toggle("show-modal");
                    pickTemplate(svgString, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");

                firstPolygonPoint = undefined;
                //polygonPath = undefined;
                polygonPoint = undefined;
                invisiblePolygonPoint = undefined;
                addingPolygon = false;
            } else {
                polygonPoint = paper.circle(scaledX, scaledY, 30)
                                    .attr("fill", "white")
                                    .drag(dragCircleMove, dragCircleStart, dragCircleEnd)
                                    .hide();
                polygonPoint.path = polygonPath;
                polygonPath.points.push(polygonPoint);
                if (invisiblePolygonPoint) {
                    invisiblePolygonPoint.attr({'cx' : scaledX, 'cy' : scaledY});
                } else {
                    invisiblePolygonPoint = paper.circle(scaledX, scaledY, 1)
                                                 .hide();
                };

                polygonPath.attr({'path' : polygonPath.attrs.path.toString() + 'L' + scaledX + " " + scaledY});
            };
        };
        if (addingRectangle) {
            mode = Mode.View;
            addingRectangle = false;
        }

    };
    document.getElementById("imageWorkspace").onmousemove = function(coordinates) {
        if (addingRectangle && newRectangle) {
            let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            let scalingRatios = getScalingRatios();

            let rectangleWidth = Math.round((relativeCoordinates[0] - mouseDownX) / scalingRatios[0]);
            let rectangleHeight = Math.round((relativeCoordinates[1] - mouseDownY) / scalingRatios[1]);

            let scaledX, scaledY;

            if (rectangleWidth < 0) {
                rectangleWidth = -rectangleWidth;
                scaledX = Math.round(mouseDownX / scalingRatios[0] - rectangleWidth);
            } else {
                scaledX = Math.round(mouseDownX / scalingRatios[0]);
            };
            if (rectangleHeight < 0) {
                rectangleHeight = -rectangleHeight;
                scaledY = Math.round(mouseDownY / scalingRatios[1] - rectangleHeight);
            } else {
                scaledY = Math.round(mouseDownY / scalingRatios[1]);
            };

            newRectangle.attr({
                'x' : scaledX + paper.currentX,
                'y' : scaledY + paper.currentY,
                'width' : rectangleWidth,
                'height' : rectangleHeight
            });
        };
        if (addingPolygon && polygonPoint) {
            let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            let scalingRatios = getScalingRatios();

            let polygonX = Math.round(relativeCoordinates[0] / scalingRatios[0] + paper.currentX);
            let polygonY = Math.round(relativeCoordinates[1] / scalingRatios[1] + paper.currentY);
            invisiblePolygonPoint.attr({'cx' : polygonX, 'cy' : polygonY});

            polygonPath.attr({'path' : polygonPath.attrs.path.toString().substring(0,polygonPath.attrs.path.toString().lastIndexOf('L')) + 'L' + polygonX + " " + polygonY});

        };
        if (movingImage && initiated) {
            let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
            let scalingRatios = getScalingRatios();

            //let deltaX = Math.round((relativeCoordinates[0] - mouseDownX) * paper.currentWidth / scalingRatios[0] / 10 / paper.originalWidth);
            //let deltaY = Math.round((relativeCoordinates[1] - mouseDownY) * paper.currentHeight / scalingRatios[1] / 10 / paper.originalHeight);

            let deltaX = Math.round((relativeCoordinates[0] - mouseDownX) / scalingRatios[0] / 100);
            let deltaY = Math.round((relativeCoordinates[1] - mouseDownY) / scalingRatios[1] / 100);


            paper.currentX = paper.currentX - deltaX;
            paper.currentY = paper.currentY - deltaY;

            let image = document.getElementById('pageImage');
            image.style.left = Math.round(-paper.currentX * scalingRatios[0]) + 'px';//*  document.getElementById('imageWorkspace').clientWidth / paper.originalWidth  + 'px';
            image.style.top = Math.round(-paper.currentY * scalingRatios[1]) + 'px';//*  document.getElementById('imageWorkspace').clientHeight / paper.originalHeight + 'px';

            paper.setViewBox(paper.currentX, paper.currentY, paper.currentWidth, paper.currentHeight);
        };
    };
    document.getElementById("imageWorkspace").onmouseup = function (coordinates) {
        let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
        // prevent rectangles with zero width and height if the user clicks
        if (addingRectangle && Math.round(relativeCoordinates[0]) === mouseDownX && Math.round(relativeCoordinates[1]) === mouseDownY) {
            document.getElementById('createRectangleButton').parentElement.classList.remove('active');
            newRectangle.remove();
            //newRectangle = undefined;
            //addingRectangle = false;
            return;
        };

        if (addingRectangle) {
            //drawingHistory.push({"id" : newRectangle.id, "element" : null});

            let svgString = "<svg><rect x=\"" + newRectangle.attrs.x + "\" y=\"" + newRectangle.attrs.y + "\" width=\"" + newRectangle.attrs.width + "\" height=\"" + newRectangle.attrs.height + "\"/></svg>";

            //document.getElementById('closeButtonAnno').hide();
            const modal = document.getElementById("createAnnotation");
            modal.classList.toggle("show-modal");
            pickTemplate(svgString, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");

            // reset variables needed for rectangle creation
            //addingRectangle = false;
            // TODO: find a new place for that!
            //newRectangle = undefined;
            mouseDownX = undefined;
            mouseDownY = undefined;
        };


        if (movingImage) {
          movingImage = false;
          initiated = false;
        };
    };

    // Drawing anno svgs on first opening of page
    annoJson = JSON.parse(annotations);
    drawAnnos(annoJson);}
}

function confirmDiscardChanges() {
    if (addingRectangle) {
        document.getElementById('createRectangleButton').parentElement.classList.add('active');
    };
    if (addingPolygon) {
        document.getElementById('createPolygonButton').parentElement.classList.add('active');
    };

    if (!document.getElementById('annotationCard').classList.contains('is-hidden')) {
        toggleOverview('annotationCard');
    };

    if (drawingHistory.length > 0) {
        let confirmation = confirm("There are unsaved changes. Do you want to continue and discard them?");

        if (confirmation) {
            let modifiedShape = paper.getById(drawingHistory[0].id);
            // get modified shape to former state and deselect it
            while (drawingHistory.length > 0) {
                console.log(drawingHistory);
                undo();
            };
            toggleShapeSelect(modifiedShape);
            endModification(modifiedShape);
        } else {
            addingRectangle = false;
            addingPolygon = false;
            document.getElementById('createRectangleButton').parentElement.classList.remove('active');
            document.getElementById('createPolygonButton').parentElement.classList.remove('active');
        };
    };
};

window.addEventListener("beforeunload", function (e) {
    if (drawingHistory.length > 0) {
        let confirmationMessage = 'It looks like you have been editing something. '
                            + 'If you leave before saving, your changes will be lost.';

        // e.preventDefault();

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    };

});

// adding the closing functionality to annotation creation modal
document.getElementById('closeButtonAnno').addEventListener('click', function (e) {
    document.getElementById("createAnnotation").classList.toggle("show-modal");

    // if modal was shown during creation of new rectangle, remove rectangle
    if (newRectangle) {
        newRectangle.remove();
        document.getElementById('createRectangleButton').parentElement.classList.remove('active');
    };

    // if modal was shown during creation of new polygon, remove polygon
    if (polygonPath) {
        polygonPath.remove();
        document.getElementById('createPolygonButton').parentElement.classList.remove('active');
    };
});

// adding the closing functionality to body creation modal
document.getElementById('closeButton').addEventListener('click', function (e) {
    document.getElementById("createBody").classList.toggle("show-modal");
});

function hideExpandedSidebar() {
    let sideBar = document.querySelector('.anno-side-bar');
    if (!sideBar.classList.contains('annocollapse')) {
        toggleAnnoSideBar();
    };
};
