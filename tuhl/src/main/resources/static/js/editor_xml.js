let annoJson;
let paper;

let MouseDownX;
let MouseDownY;
let newRectangle;
let polygonPoint;
let firstPolygonPoint;
let invisiblePolygonPoint;
let polygonPath;

let selectingText = false;
let addingRectangle = false;
let addingPolygon = false;
let movingImage = false;
let initiated = false;

let drawingHistory = [];

// globalSelectedAnnotation stores the annotation, that gets
// selected by right clicking on a highlighted word
// it is needed to 
// - edit/update the target of that annotation
// - cycle through multiple annotations on one target and select them
// - (CRC1475: to add a mrw-annotation to a metaphor annotation)
let globalSelectedAnnotation;

// selectedText stores the selected test as a string
// it is needed to add it to the annotations body
let globalSelectedText;

// mrwAnnos stores the mrws that are contained in a selection
// it is needed to link mrw annotations with metaphor annotations
let globalMrwAnnos = [];

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

function extractInformationFromSvg (svgString, annoJson) {
    const svgDoc = new DOMParser().parseFromString(svgString, "text/xml");
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

// converts a long concatenated/joined xPath consisting of
// multiple xPaths into multiple xPaths
function convertXPath(longXPath){
    let xPathArray = [];

    // if the xPath contains only joined xPaths resolving to nodes
    if (longXPath.includes("|")){
        // split the xPath into multiple xPaths and remove leading whitespace.
        // Turn string:
        // "//*[@xml:id=\"w.121\"] | //*[@xml:id=\"w.122\"]"
        // into array:
        // ["//*[@xml:id=\"w.121\"]", "//*[@xml:id=\"w.122\"]"]
        xPathArray = longXPath.split("|").map(entry => entry.trim());
    }

    // if the xPath contains concatenated xPaths resolving to a string
    if (longXPath.includes("concat(")){
        // remove the surrounding concat()-function from the long xPath 
        // and split it at the "," to reassemble each individual xPath.
        // Turn string:
        // "concat(//*[@xml:id=w.75], //*[@xml:id=pc.12], \"   \", substring(//*[@xml:id=w.76], 1, 5))"
        // into array:
        // ["//*[@xml:id=w.75]", "//*[@xml:id=pc.12]", "substring(//*[@xml:id=w.76], 1, 5)"]
        let xPaths = longXPath
            .split("concat(")[1].slice(0,-1)
            .split(",");
        xPathArray = xPaths
            // remove leading/trailing whitespace from the entries
            .map(xPath => xPath.trim())
            .map((xPath, index) => {
                if (xPath.startsWith("//*[@xml:id=")){
                    return xPath;
                } else if (xPath.startsWith("substring(//*[@xml:id=")){
                    // add the startingPosition and the length of the substring to the xPath
                    return (xPath + ", " + xPaths[index+1] + ", " + xPaths[index+2]);
                }})
            // remove the "empty"/undefined entries
            .filter(entry => entry !== undefined);
    }

    return xPathArray;
}

// converts the target of an annotation, which is only one long xPath
// (since commitXYZ, which implemented the substring selection and
// changed how the targets look like) to multiple targets. This is needed
// for backwards compatability until every project only has targets, which
// are one long xPath.
function makeTargetsCompatible(annotation){

    // annotation passed to the function is part of the annoJson
    if (annotation.svg){
            if (annotation.svg[0].includes("xml:id")){
                annotation.svg = convertXPath(annotation.svg[0]);
            }
    }

    // annotation passed to the function is the globalSelectedAnnotation
    let newTargets = [];
    if (annotation.targets){
        if (annotation.targets[0].selector.xPath){
            let xPathArray = convertXPath(annotation.targets[0].selector.xPath);
            xPathArray.forEach(xPath => {
                let newTarget = JSON.parse(JSON.stringify(annotation.targets[0]));
                newTarget.selector.xPath = xPath;
                newTargets.push(newTarget);
            });
            annotation.targets = newTargets;
        }
    }
};

// check if the annotation is compatible with the code
// returns:
// - true, if the annotation is compatible, i.e. has one xPath for each target
// - false, if the annotation is incompatible, i.e. has one long xPath including all targets
function checkIsTargetCompatible(annotation){
    
    let targetXPath = "default";

    // annotation passed to the function is part of the annoJson
    if (annotation.svg){
        targetXPath = annotation.svg[0];
    }

    // annotation passed to the function is the globalSelectedAnnotation
    if (annotation.targets){
        if (annotation.targets[0].selector.xPath){
            targetXPath = annotation.targets[0].selector.xPath;
        }
    }

    // check if the xPath is a joined (resolving to nodes) or concatenated
    // (resolving to a string) one
    if (targetXPath.includes("|") || targetXPath.includes("concat")){
        return false;
    }

    return true;
};

// remove the style from all elements
// https://stackoverflow.com/questions/9252839/simplest-way-to-remove-all-the-styles-in-a-page
function removeStyles(el) {

    // TODO: CUSTOMISE classes to remove (linked to classes assigned in
    // drawAnnos() function)
    // specify the classe to remove here
    let possibleClasses = ["mrw", "mflag", "metaphor", "metaphorSecond", "defaulthighlight"];

    possibleClasses.forEach(entry => {
        el.classList.remove(entry);
    });

    el.childNodes.forEach(childNode => {
        if(childNode.nodeType == 1) removeStyles(childNode)
    });
}

// highlighting all annotations
function drawAnnos(annoJson) {
    let targetXmlId;
    let alreadyAnnotated;
    annoJson.forEach(annotation => {
        // check if a target has the class "metaphor" and
        // therefore, is already highlighted
        alreadyAnnotated = false;
        annotation.svg.forEach( target => {
			targetXmlId = target.split("\"")[1];
            if(document.getElementById(targetXmlId).classList.contains("metaphor")){
                alreadyAnnotated = true;
            }
        });

        // adding classes to highlight annotations
		annotation.svg.forEach((target, index) => {
			targetXmlId = target.split("\"")[1];
            const targetElement = document.getElementById(targetXmlId);

            // if color is available assign css class
            if (annotation.color) {
                // different highlights for different annotation types
                switch (annotation.color){
                    // TODO: CUSTOMISE highlighting of different annotations, based on the color
                    // see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
                    // and "takita/tuhl/src/main/resources/static/js/creation_templates_text.js"
                    // (linked to classes to be removed in removeStyles() funtcion)
                    case "#000021":
                        // if a word is not highlighted add the "metaphor" class, if it is
                        // already highlighted add "metaphorSecond"
                        if (!alreadyAnnotated){
                            targetElement.classList.add("metaphor");
                        } else {
                            targetElement.classList.add("metaphorSecond");
                        }
                        
                        // if a word is followed only by whitespace add the "whitespaceAfter" class
                        // unless its the last word of the target.
                        // TODO: this doesn't work for overlapping annotations. The "whitespaceAfter" class will
                        // be assigned even if the word is the last target for one annotation as the word is part of multiple
                        // annotations and it might be the last target of one annotation but not the other one
                        // This is needed to create overlapping boxshadows.
                        // check if nextSibling is null first
                        if (targetElement.nextSibling !== null) {
                            if (targetElement.nextSibling.textContent.trim() === "" && !(index === (annotation.svg.length - 1))){
                                targetElement.classList.add("whitespaceAfter");
                            }
                        } else {
                            targetElement.classList.add("whitespaceAfter");
                        }
                        break;
                    case "#000011":
                        targetElement.classList.add("mrw");
                        break;
                    case "#000012":
                        targetElement.classList.add("mrw");
                        break;
                    case "#000013":
                        targetElement.classList.add("mrw");
                        break;
                    case "#000014":
                        targetElement.classList.add("mflag");
                        break;
                    default:
                        // this is not ideal, but without the if clause, most of words
                        // will get the defaulthighlighting class
                        if (annotation.color === "#000021" ||
                            annotation.color === "#000011" ||
                            annotation.color === "#000012" ||
                            annotation.color === "#000013" ||
                            annotation.color === "#000014"){
                                // nothing will happen
                        } else {
                            targetElement.classList.add("defaulthighlight");
                            //console.log("Tag value not matching the possible cases, 'defaulthighlight' class added for:", annotation);
                        }
                }
            } else { // if no tags are given (might be due to the tagging body being delted), assign default
                targetElement.classList.add("defaulthighlight");
            }
		});
	});

  fillMetaDataEditorTable(annoJson);
}

// get all displayable annotations and store them in the annoJson
// this function is used to get an updated annoJson after an 
// annotation got created/modified/deleted
async function getAnnoJson() {
    const response = await fetch(window.CONTEXTPATH + 'editor/' + window.CURRENTPAGEID + '/displayableAnnotationsJSON', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    return await response.json();
  }

// update the display of the textEditor
async function updateDisplay() {
    try {
        // update annoJson to get the current tagging-body-values
        // as they are the basis for the highlighting
        annoJson = await getAnnoJson();
        // check if the annotations are compatible with the code, i.e. have
        // one xPath for each target and not one long xPath including all targets.
        // Make them compatible, if they are not
        annoJson = annoJson.map(annotation => {
            if (!checkIsTargetCompatible(annotation)){
                makeTargetsCompatible(annotation);
            }
            return annotation;
        });
        // remove all styling/highlighting 
        removeStyles(document.getElementById("TEI"));
        // highlight all annotated words
        drawAnnos(annoJson);
        console.log("Display and annoJson: ", annoJson, " updated successfully.");
    } catch (error){
        console.error("Display update failed ", error);
    }

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


// font manipulation functions called by sidebar buttons
function changeFontSize(id, changeFactor){
	txt = document.getElementById(id);
    style = window.getComputedStyle(txt, null).getPropertyValue('font-size');
    currentSize = parseFloat(style);
    txt.style.fontSize = (currentSize + changeFactor) + 'px';
}

function increaseFontSize(){
	changeFontSize("TEI", 1);
	
}

function decreaseFontSize(){
	changeFontSize("TEI", -1);
	
}

function resetFontSize(){
	document.getElementById("TEI").style.fontSize = "initial";
}

// hebrew specific display
function toggleHebrewView(){
	document.querySelectorAll("tei-w").forEach(word => {
		if( !word.id.includes("_")) {
			if (word.getAttribute("vocalized") || word.getAttribute("unvocalized") !== undefined) {
				if (word.innerHTML === word.getAttribute("vocalized")){
					word.innerHTML = word.getAttribute("unvocalized");
				} else {
					word.innerHTML = word.getAttribute("vocalized");
				}
			}
		}
	});
}


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
            url : window.CONTEXTPATH + 'editor_rest/annotations/' + modifiedShape.annoIdEncoded,
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

// check if the selection happened on the textworkspace/tei element
function checkIsSelectionOnWorkspace(node){
	if (node.parentNode.id === "TEI") {
		return true;
	} else if (node.parentElement != null) {
		return checkIsSelectionOnWorkspace(node.parentElement);
	} else {
		return false;
	}
};

// get one range of the selection(s)
// old function, not necessary any more after 01.02.2023 (commit 1267ea6)
function getContentOfSelection(selection){
	let selectionRangeContents = selection.getRangeAt(0).cloneContents();
	// if there are multiple selection ranges (eg. in the B04 case)
	// add those
	if (selection.rangeCount > 1){
		for (let i = 1; i < selection.rangeCount; i++) {
			selectionRangeContents.append(selection.getRangeAt(i).cloneContents());
		}
	}
	return selectionRangeContents;
}


// get the smallest available nodes, that have an xmlId and store them in a list
function getSmallestNodesWithXmlIds(node, nodeList){
    if (node.children.length !== 0) {
        Array.from(node.children).forEach(child => {
	        getSmallestNodesWithXmlIds(child, nodeList);
        });
    } else {
        if (node.id) {
		    nodeList.push(node);
	    }                  
    }
};

// create a list, that for each selection contains a JSON-object,
// which contains all the selected nodes with an Id and the offsets
// of the selection
function createTargetList(selection){

    let targetRangeList = [];	
	
	for (let i = 0; i < selection.rangeCount; i++) {
        let targetList = [];
		let selectionRange = selection.getRangeAt(i);
		let selectionRangeContents = selectionRange.cloneContents();
        // selectionRangeOffsets is necessary as selectionRange.startOffset is a
        // read-only property, but it might need to change (if the selected text starts
        // with whitespace)
        let selectionRangeOffsets = {
            "startOffset" : selectionRange.startOffset,
            "endOffset" : selectionRange.endOffset
        }

        // check if the selected text starts with whitespace (/^\s/ = regex matching any whitespace at the start of a word from
        // https://stackoverflow.com/questions/10844294/how-to-check-whether-a-string-has-whitespace-at-the-beginning-in-javascript)
        // or if the first childs textContent is only whitespace. If it does
        // set the startOffest to 0 as the first selected element holding text
        // will have its start fully selected and the startOffset is used to
        // create the substring selector
        // TODO: find a better solution for this as there might be a time
        // where the first selected elment starts with whitespace for whatever reason
        // OR there are punctuation sign/other symbols, which are not part of the first element
        if (/^\s/.test(selectionRangeContents.textContent) &&
            selectionRangeContents.childNodes[0].textContent.trim() === ""){
                selectionRangeOffsets.startOffset = 0;
                console.log("Changed the selection startOffset to: 0");
        }

		// check how many words/elements got selected,
		// for some reason the selection always holds more than one element
		// even if, only one got selected. Only if a user selects the middle part
		// of a word, the selection holds only one elment
        // ------
        // TODO: firefox specific problem (works in
        // safari: just fine
        // chrome: only because double clicking selects all syllables):
        // double clicking on the first syllable of an unsandhied word (B04 specifc data) creates
        // a selection containing two text nodes. therefore no elementNode will be put into 
        // the targetList and no xml:id is present to create the annotation.
		if (selectionRangeContents.childNodes.length == 1){
			// if a user selects only the middle part of a word (eg. "or") the selection
			// won't return a w-element but a textNode, so we need to get the parent of
			// that text node (which should be a w-element)
			if (selectionRangeContents.childNodes.length == 1 && selectionRangeContents.childNodes[0].nodeType == 3) {
				if (selectionRange.startContainer.nodeValue == selectionRange.endContainer.nodeValue &&
					selectionRange.endContainer.nodeValue == selectionRange.commonAncestorContainer.nodeValue) {
					if (selectionRange.commonAncestorContainer.parentNode.nodeName === "TEI-W") {
                        // as createXPath() checks if the innerText of the targetNode is the same
                        // as of the node in the DOM with the same id to create the subStringSelector, 
                        // the selected string needs to be saved as the innerText of the targetNode.
                        // As the parentNode is not part of the selectionRange this step is necessary.
                        // To replace the innerText without altering the DOM the node has to be cloned.
                        let targetNode = selectionRange.commonAncestorContainer.parentNode.cloneNode();
                        targetNode.innerText = selectionRangeContents.textContent;
                        targetList.push(targetNode);
					} else {
						console.log("selectionRange.commonAncestorContainer.parentNode is not TEI-W. ", selectionRange.commonAncestorContainer.parentNode);
					}
				}
			// TODO: sometimes an element "A" only has one childNode, which is a tei-w.
            // In this case, the tei-w's id WONT be added to the targetList by calling the
            // getXmlIds funciton on this selection. This is the case for B04 data,
            // when the tei-reg element holds only one tei-w element)
            // temporary solution:
            // So if the element "A" is not a textNode, but something else (Philipp can only
            // think, that it would be an elementNode then, in B04 its an tei-reg element),
            // its xmlid should be retrieved and added to the targetList by calling getXmlIds()
            } else if (selectionRangeContents.childNodes[0].nodeType == 1){
                getSmallestNodesWithXmlIds(selectionRangeContents.children[0], targetList);
            } else {
                console.log("The following node is neither a text nor element node. ", selectionRangeContents.childNodes[0]);
            }
		} else {
			getSmallestNodesWithXmlIds(selectionRangeContents, targetList);
		}

        // "cleaning" the targetList, because sometimes an empty w-element will be included
        // in the bgeinning or at the end of the targetList as the user selected some
        // whitespace before/after the first word she wanted to select as well
        if (targetList.length > 1) {
            if (targetList[targetList.length-1].innerHTML.trim() == ""){
                targetList.pop();
            }
            if (targetList[0].innerHTML.trim() == ""){
                targetList.shift();
            }
        }

        // add the start/end offsets/character positions of the text
        // create the json object containing all information
        let rangeItem = {
            "targetList" : targetList,
            "startOffset" : selectionRangeOffsets.startOffset,
            "endOffset" : selectionRangeOffsets.endOffset
        };
        targetRangeList.push(rangeItem);
	}

	return targetRangeList;
}

// creates a concatenated list of each xPath resolving to one element, that
// is present in the selction
function createListOfIds(targetList){
	// targetListJson is a list of all the <w> elements id to be used as targets for
	// the web annotations; its a STRING
	// targetListJsonAsJson is the same as targetListJson but as JSON
	let targetsXmlIds = "";
	let targetListJson;
	let targetListJsonAsJson;
	// following variables are needed to create a jsonish target
	let valueId; 
	let selectorObject;
	let targetJson = {};
	let targetArray = [];
	
	// if the targetList holds only one element, as only one element got selected
	// only that will be stored in targetListJson
	if (targetList.length === 1){
		// storing values to build a JSON
		valueId = "//*[@xml:id=\"" + targetList[0].id + "\"]";
		//selectorObject = {type: "XPathSelector", value: valueId};
		//targetJson = {source: window.CURRENTPAGEURL, selector: selectorObject};
		//targetListJson = targetJson;
		targetsXmlIds = valueId;
	// if holds multiple elements, as multiple elements got selected
	} else if (targetList.length !== 0){
		targetListJson = "[";
		targetList.forEach( item => {
			// storing values to build a JSON and convert it to a STRING
			valueId = "//*[@xml:id=\"" + item.id + "\"]";
			//selectorObject = {type: "XPathSelector", value: valueId};
			//targetJson = {source: window.CURRENTPAGEURL, selector: selectorObject};
			//targetListJson = targetListJson + JSON.stringify(targetJson) + ",";
			targetsXmlIds = targetsXmlIds + valueId + "|"; 
		});
		// slice removes the last §, as its not needed; and then remove the "\"
		//targetListJson = (targetListJson.slice(0,-1) + "]").replaceAll("\\","");
		targetsXmlIds = targetsXmlIds.slice(0,-1);
		
		/*targetList.forEach( item => {
			// storing values to build a JSON
			targetJson = {};
			valueId = "//*[@xml:id =\"" + item.id + "\"]";
			selectorObject = {type: "XPathSelector", value: valueId};
			targetJson = {source: window.CURRENTPAGEURL, selector: selectorObject};
			targetArray.push(targetJson);
			
		});*/
		//targetListAsJson = {target: targetArray};
		//console.log(targetListJson);
		//console.log(JSON.stringify(targetListAsJson));
	}
	return targetsXmlIds;
}

// get the offset/substringPosition for a selected word
function getSubstringPosition(target, range){
    let substringPosition = {};
    
    // if the target is the first word of the selectionRange use
    // - the startOffset of the selectionRange as substringPosition.start
    // - and the length of the word as substringPosition.end
    // as then the startOffset of the selectionRange is the offset of the
    // first word and the rest of the word is fully selected
    if (target === range.targetList[0]){
        substringPosition.start = range.startOffset;
        substringPosition.end = document.getElementById(target.id).innerText.length;
    }

    // if the target is the last word of the selectionRange use
    // - 0 as substringPosition.start
    // - and the endOffset of the selectionRange as substringPosition.end
    // as then the endOffset of the selectionRange is the offset of the
    // last word and the rest of the word (the beginning) is fully selected
    if (target === range.targetList[range.targetList.length - 1]){
        substringPosition.start = 0;
        substringPosition.end = range.endOffset;
    }

    // (if the target is the first and last word of the selectionRange)
    // if the selectionRange holds only one word use
    // - the startOffset of the selectionRange as substringPosition.start
    // - and the endOffset of the selectionRange as substringPosition.end
    // as then the offsets of the selectionRange are the offsete of the
    // last word
    if (range.targetList.length === 1){
        substringPosition.start = range.startOffset;
        substringPosition.end = range.endOffset;
    }
    
    return substringPosition;
}

// get the nextSibling of a node
function getNextSibling(node){
    let nextSibling = node.nextSibling;
    // if the node has no nextSibling, get the nextSibling of the parentNode
    if (nextSibling === null){
        nextSibling = getNextSibling(node.parentNode);
    }
    return nextSibling;
}

function createXPath(targetRangeList){
    let xPaths = [];
    let xPathContainsSubstring = false;
    let longXPath = "";

    // create an xPath for each targeted element
    targetRangeList.forEach(range => {
        range.targetList.forEach(target => {
            let xPathToElement = "//*[@xml:id=\"" + target.id + "\"]";
            // check if the targetted words are fully selected
            if (target.innerText === document.getElementById(target.id).innerText) {
                xPaths.push(xPathToElement);
            } else {
                // if they are not fully selected get the offsets/substringPosition
                xPathContainsSubstring = true;
                let substringPosition = getSubstringPosition(target, range);
                // get the substring(string, start, length) function of xPath, but it works a bit different 
                // than the offsets of a selection
                // - it requires the start offset, but "As in other XPath functions, the position 
                //   is not zero-based. The first character in the string has a position of 1, not 0.
                //   https://developer.mozilla.org/en-US/docs/Web/XPath/Functions/substring ",
                //   so the start offset needs to be incremented by 1
                // - and it reuires the length of the substring instead of the endOffset
                let xPathSubstring = {};
                xPathSubstring.start = substringPosition.start + 1;
                xPathSubstring.length = target.innerText.length;
                xPaths.push("substring(" + 
                            xPathToElement + ", " + 
                            xPathSubstring.start + ", " + 
                            xPathSubstring.length + ")");
            }
        });
    });

    // create the long xPath depending on the xPaths of the selected words.
    // If a substring is present create a concatenated xPath otherwise
    // join the xPaths together
    if (xPathContainsSubstring){
        if (xPaths.length === 1) {
            longXPath = xPaths[0];
        } else {
            // add the trailing characters (most likely whitespace, maybe punctuation)
            // to each xPath, so that when they will be resolved, they are trailed by the
            // correct characters
            xPaths = xPaths.map(xPath => {
                let nextSibling = getNextSibling(document.getElementById(xPath.split("\"")[1]));
                if (nextSibling.nodeType === 3){
                     return xPath + ", \"" + nextSibling.nodeValue + "\"";
                } else {
                     return xPath;
                }
            });

            // remove the string trailing the last xPath (there might not even be one) 
            // as it was not selected by the user.
            // To do that, use a regex matching the substring function without its parameters
            // as they are different for each xPath
            let regex = /(substring\().*\)/;
            if (regex.test(xPaths[xPaths.length - 1])){
                xPaths[xPaths.length - 1] = regex.exec(xPaths[xPaths.length - 1])[0];
            }

            // create the final xPath
            longXPath = "concat(" + xPaths.join(", ") + ")";
        }
    } else {
        longXPath = xPaths.join(" | ");
    }

    return longXPath;
}

// store all the mrw annotations that are contained in a selection
function storeSelectedMRWAnnos(targetList){
	// empty the mrwAnno list beforehand
	let mrwAnnos = [];
	annoJson.forEach(annotation => {
		//annoXmlId = annotation.svg.split("\"")[1];
		//console.log(annotation);
        // checking if the annotation is a mrw-annotation by checking its color,
        // which is based on the classifying body.
        // See "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
        // for the corresponding hexes/mrw-annotation types
        if (annotation.color === "#000011" || 
            annotation.color === "#000012" || 
            annotation.color === "#000013" || 
            annotation.color === "#000014"){
				targetList.forEach( target => {
					annotation.svg.forEach( svg => {
						if (target.id === svg.split("\"")[1]){
							// this iteration should not be necessary as a Set
							// should not hold the same annotation twice
							if (mrwAnnos.size === 0) {
								mrwAnnos.push(annotation);
							} else {
								if (!mrwAnnos.some(entry => entry.id === annotation.id)){
									mrwAnnos.push(annotation);
								}
							}
							
						}
					});
				});
		}
	});
	console.log("MRW annotations present in current selection: ", mrwAnnos);

    return mrwAnnos;
}

function removeWhitespaceFromSelectionTextContent(text){
    console.log("Before cleaning: ",  text);
    text = text.replace(/\s{4}|[\t\n\r]|\s/g,' ');
    while (text.includes("  ")){
        text = text.replaceAll("  ",  " ");
    }
    text = text.trim();
    console.log("After cleaning: ", text);
    return text;
};

function annotateSelectedText(){
	// check if the string is filled, because on a double click the first onmouseup
	// will have no selection and therefore no string
	if (window.getSelection().toString() && checkIsSelectionOnWorkspace(window.getSelection().getRangeAt(0).commonAncestorContainer)){
		// selectionRange and selectionRangeContents are not used anymore and can 
		// be removed
		let selectionRange = window.getSelection().getRangeAt(0);
		let selectionRangeContents = getContentOfSelection(window.getSelection());

		console.log("Selection object: ", window.getSelection());
		console.log("SelectionRange[0] object: ", selectionRange);
		console.log("Contents of a Selection object: ", selectionRangeContents);
		
		// stop the function, if the selection does not contain any text, only whitespace
		if (getContentOfSelection(window.getSelection()).textContent.trim() == ""){
			console.log("No text selected, therefore early return.")
			return;
		}
		
		// targetRangeList holds all the nodes from the selection, that are <w> elements
		let targetRangeList = createTargetList(window.getSelection());
		console.log("Filled targetRangeList for annotation creation: ", targetRangeList);
		
		// targetXPath hold the xPath resolving to the elements in targeRangetList
		let targetXPath = createXPath(targetRangeList);
		console.log("Target/XPath of the selection: ", targetXPath);

        // emptying the globalMrwAnnos array to only store the mrw
        // annotations present in the current selection
		// so they can be accessed in creation_templates_text.js to generate
		// a list of selected mrws inside a metaphor and link the mrw annotations
		// to the metaphor annotation
        globalMrwAnnos = [];
        targetRangeList.forEach(range => {
            globalMrwAnnos = globalMrwAnnos.concat(storeSelectedMRWAnnos(range.targetList));
        });

		// set globalSelectedText so it can be displayed in the modal and remove all whitespaces
        // TODO: this should use removeWhitespaceFromSelectionTextContent()
		globalSelectedText = getContentOfSelection(window.getSelection()).
								textContent.replace(/\s{4}|[\t\n\r]|\s/g,' ');
		while (globalSelectedText.includes("  ")){
			globalSelectedText = globalSelectedText.replaceAll("  ",  " ");
		}
		globalSelectedText = globalSelectedText.trim();
		console.log("GlobalSelectedText: ", globalSelectedText);

		// showing the modal/dropdown to select the annotation template, which can be populated
		// by the user
		const modal = document.getElementById("createAnnotation");
	    modal.classList.toggle("show-modal");
	    pickTemplate(targetXPath, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
    	
    	// redrawing the annotations; TODO
    	/*console.log("redrawing");
    	removeStyles(document.getElementById("TEI"));
    	drawAnnos(annoJson);*/
    	
    	// resetting parameters, so no new annotation can be created without clicking on
		// the button at the sidebar, that enables annotation 
		mode = Mode.View;
		selectingText = false;
	}
};

function modifySelection(){
	selectingText = true;
	mode = Mode.Modify; 
	//document.getElementById('modifyButton').parentElement.classList.add('active');
	if (globalSelectedAnnotation === undefined) {
		//document.getElementById('modifyButton').parentElement.classList.remove('active');
        mode = Mode.View;
		selectingText = false;
		return;
	}
	console.log("Selected annotation: ", globalSelectedAnnotation);
    
    // disable/enable and hide/show the buttons connected 
    // to the modifaction of a text selection
    document.getElementById("buttonModifySelection").disabled = true;
    document.getElementById("buttonModifySelection").classList.add("is-hidden");
    document.getElementById("buttonSaveModification").disabled = false;
    document.getElementById("buttonSaveModification").classList.remove("is-hidden");
    document.getElementById("buttonCancelModification").disabled = false;     
    document.getElementById("buttonCancelModification").classList.remove("is-hidden");
	
}

function saveModification(){
	if (window.getSelection().toString() && checkIsSelectionOnWorkspace(window.getSelection().getRangeAt(0).commonAncestorContainer)){
		let selectionRange = window.getSelection().getRangeAt(0);
		let selectionRangeContents = getContentOfSelection(window.getSelection());

		/*
		console.log("hereSaveMod");
		console.log(window.getSelection());
		console.log(selectionRange);
		console.log(selectionRangeContents);
		*/
		
		// stop the function, if the selection does not contain any text, only whitespace
		if (selectionRangeContents.textContent.trim() == ""){
			console.log("No text selected, therefore early return.");
            // TODO: check if this causes problems. It might prevent users from saving
            // their updated selection, if the selected whitespace once
		    // document.getElementById('modifyButton').parentElement.classList.remove('active');
            mode = Mode.View;
			selectingText = false;
			alert("No text selected. Please redo");
			return;
		}
		

		// targetRangeList holds all the nodes from the selection, that are <w> elements
		let targetRangeList = createTargetList(window.getSelection());
		console.log("Filled targetRangeList for annotation target update: ", targetRangeList);
		
		// targetXPath hold the xPath resolving to the elements in targeRangetList
		let targetXPath = createXPath(targetRangeList);
		console.log("Target/XPath of the NEW selection: ", targetXPath);
		
		// ask user if the new selection should be saved in a modal

        // get the previously selected text from the respective body (purpose: describing), or reconstruct it from the target
        let oldSelectedText = globalSelectedAnnotation.textCards.find(textCard => textCard.purpose === "describing" );
        if (oldSelectedText != undefined){
            oldSelectedText = oldSelectedText.value;
        } else {
            let idArray = [];
            globalSelectedAnnotation.targets.forEach(target => {
                idArray.push(target.selector.xPath.split("\"")[1]);
            });
            // this sorts the xml:ids to retrieve a somehow appropriate reconstruction of the text out of the targets
            // in cases, where the ids are not in an ascending nummerical order, the reconstruction will be off
            idArray = idArray.sort((a, b) => {return a - b});
            idArray = idArray.sort((a, b) => {
                const na = a.split(".").slice(-1)[0];
                const nb = b.split(".").slice(-1)[0];
                return na - nb;
            });
            oldSelectedText = "";
            idArray.forEach( id => {oldSelectedText += document.getElementById(id).textContent + " "});
        }

        let newSelectedText = removeWhitespaceFromSelectionTextContent(selectionRangeContents.textContent);

		// modal stuff should be optimised
		let el = document.createElement("div");
		el.innerHTML = oldSelectedText; // + globalSelectedAnnotation.targets.toString(); //  + " | id: " + globalSelectedAnnotation.svgCode.split("\"")[1];
		document.getElementById("oldSelectedText").innerHTML = "Current Selection:";
		document.getElementById("oldSelectedText").append(el);
		
		let ele = document.createElement("div");
		ele.innerHTML = newSelectedText; // + " | id: " + newTargetsXmlIds;
		document.getElementById("newSelectedText").innerHTML = "New Selection:";
		document.getElementById("newSelectedText").append(ele);
		
		const modal = document.getElementById("updateSelection");
	    modal.classList.toggle("show-modal");
	    modal.dataset.newTargetXmlId = targetXPath;
	    //modal.dataset.SelectedAnnotationId = selectedAnnotation.id;
	}
}

// TODO: CUSTOMISE the colors based
// see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "takita/tuhl/src/main/resources/static/js/creation_templates_text.js"
function getColorHexFromEnumEntry(colorEnumEntry){
    let colorHex = "#89f099"
    switch (colorEnumEntry) {
        case "MRW_DIRECT":
            colorHex = "#000011";
            break;
        case "MRW_INDIRECT":
            colorHex = "#000012";
            break;
        case "MRW_IMPLICIT":
            colorHex = "#000013";
            break;
        case "MFLAG":
            colorHex = "#000014";
            break;
        case "METAPHOR":
            colorHex = "#000021";
            break;
    }
    return colorHex;
}

// TODO: CUSTOMISE the colors based
// see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "takita/tuhl/src/main/resources/static/js/creation_templates_text.js"
function getColorNameFromEnumEntry(colorEnumEntry){
    let colorName = "Default"
    switch (colorEnumEntry) {
        case "MRW_DIRECT":
            colorName = "mrw (direct)";
            break;
        case "MRW_INDIRECT":
            colorName = "mrw (indirect)";
            break;
        case "MRW_IMPLICIT":
            colorName = "mrw (implicit)";
            break;
        case "MFLAG":
            colorName = "mflag";
            break;
        case "METAPHOR":
            colorName = "metaphor";   
            break;
    }
    return colorName;
}

function updateTarget(){
	
	const modal = document.getElementById("updateSelection");
	let idOfAnnotationToUpdate = encodeAnnoId(globalSelectedAnnotation.id);
	//let idOfAnnotationToUpdate = encodeAnnoId(modal.dataset.SelectedAnnotationId);
	let targetXPath = modal.dataset.newTargetXmlId;
	
	// update the target of an annotation (and the "purpose:describing" body, if it exists) by sending a put request
    let colorName = getColorNameFromEnumEntry(globalSelectedAnnotation.color);
	let annotationDataJson = {"color" : colorName, "motivation" : "describing", "svgCode" : targetXPath};
	$ .ajax({
            type : 'PUT',
            url : window.CONTEXTPATH + 'editor_rest/annotations/' + idOfAnnotationToUpdate,
            data : JSON.stringify(annotationDataJson),
            headers : {
                'Content-Type' : 'application/json'
            },

            success : function(responseData) {
                
                console.log("Response data from succesfull target update: ", responseData);

                let responseDataJson = JSON.parse(responseData);
 
                // TODO: only temporary solution to update the body containing the selected text
                // if the purpose changes, the following needs to be changed
                let result = null;
                result = responseDataJson.textCards.filter(textCard => textCard.purpose === "describing");
                if (result != null && result.length > 0) {
                    // TODO: fix, when it goes into production, bc then the innerHTML will only be the selected text without any "|"s
                    let newSelectedText = document.getElementById("newSelectedText").children[0].innerHTML.split("|")[0];
                    newSelectedText.slice(0, (newSelectedText.length - 1));
                    // TODO: should there not be a field to store, who modified the body in addition to the timestamp of the modification?                    
                    // console.log(responseDataJson.creators);
                    let updatedBody = {"created" : new Date(responseDataJson.created.seconds * 1000 + responseDataJson.created.nanos / 1000000).toISOString(), 
                    "creators" : responseDataJson.creators, "id" : result[0].id,
                    "modified" : new Date(responseDataJson.modified.seconds * 1000 + responseDataJson.modified.nanos / 1000000).toISOString(), 
                    "purpose" : result[0].purpose, "value" : newSelectedText};
                    console.log("Updated body: ", updatedBody);

                    let annoIdEncoded = encodeAnnoId(responseDataJson.id);
                    let endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + result[0].id;
                    console.log("Endpoint for body update: ", endpoint);

                    $ .ajax({
                        type: 'PUT',
                        url: endpoint,
                        data: JSON.stringify(updatedBody),
                        headers: {
                            'Content-Type' : 'application/json'
                        },

                        success: function(responseData) {
                            // show the updated annotation
                            selectAnnotation(null, encodeAnnoId(responseDataJson.id));
                            console.log("Response data from succesfull body update: ", responseData);
                        },
        
                        error: function(errorData) {
                            console.log("Error data from failed body update: ", errorData);
                        }
                    });
                }
                
                // redraw
                updateDisplay();
                
                // hide modal
                document.getElementById("updateSelection").classList.toggle("show-modal");
                //document.getElementById('modifyButton').parentElement.classList.remove('active');
                mode = Mode.View;
				selectingText = false;

                // show the updated annotation
                selectAnnotation(null, encodeAnnoId(responseDataJson.id));
            },

            error : function(errorData) {
                 console.log("Error data from failed target update: ", errorData);
            }
        });
}

function cancelModification(){
        // disable/enable and hiding/showing the buttons connected 
        // to the modifaction of a text selection
        document.getElementById("buttonModifySelection").disabled = false;
        document.getElementById("buttonModifySelection").classList.remove("is-hidden");
        document.getElementById("buttonSaveModification").disabled = true;
        document.getElementById("buttonSaveModification").classList.add("is-hidden");
        document.getElementById("buttonCancelModification").disabled = true;     
        document.getElementById("buttonCancelModification").classList.add("is-hidden");

        mode = Mode.View;
        selectingText = false;
}

function init(annotations) {
	
    // enable the tooltips for the sidebar
    enableTooltips();

    // fill the annoJson with the annotations passed by the java backend
	annoJson = JSON.parse(annotations);
    // check if the annotations are compatible with the code, i.e. have
    // one xPath for each target and not one long xPath including all targets.
    // Make them compatible, if they are not
    annoJson = annoJson.map(annotation => {
        if (!checkIsTargetCompatible(annotation)){
            makeTargetsCompatible(annotation);
        }
        return annotation;
    });
	
	// open textcard if rightclicking on a word that is highlighted due to it 
    // having a css class, i.e. has an annotation
	document.getElementById("TEI").oncontextmenu = function(e) {
        e.preventDefault();
        
        let annotationOnTarget = [];
        let annoIdEncoded;
        // TODO: CUSTOMIZE textCard toggle (display of the annotation on the right side of the screen)
        if (e.target.classList.contains("mrw") ||
            e.target.classList.contains("mflag") ||
            e.target.classList.contains("metaphor") ||
            e.target.classList.contains("metaphorSecond") ||
            e.target.classList.contains("defaulthighlight")){
            // add all the annotations targeting the selected word to an array
			annoJson.forEach(item => {
				item.svg.forEach( target => {
					if (e.target.id == target.split("\"")[1]){
                        annotationOnTarget.push(item);
	              	  };
				});
			});
            console.log("annotationsOntarget ", annotationOnTarget);
            // check if any annotation was selected previuosly or if the target word changed and therefore
            // the id of the previuosly selected annotation is not present in the list of annotations, that
            // target the word on which the onClick event was triggered
            console.log("selectedAnnotation 1: ", globalSelectedAnnotation);
            if (globalSelectedAnnotation === undefined || 
                annotationOnTarget.find(annotation => annotation.id === globalSelectedAnnotation.id ) === undefined){
                    console.log("first annotationsOntarget ",annotationOnTarget[0])
                annoIdEncoded = encodeAnnoId(annotationOnTarget[0].id);
            } else {
                // check if the next index would be out off bounds, if yes select the first annotaiton in the list
                // to start at the beginning of the list again and cycle through
                if ((annotationOnTarget.findIndex(annotation => annotation.id === globalSelectedAnnotation.id) + 1) > annotationOnTarget.length - 1){
                    annoIdEncoded = encodeAnnoId(annotationOnTarget[0].id);
                    console.log("first annotationsOntarget 2 ",annotationOnTarget[0]);
                } else {
                    annoIdEncoded = encodeAnnoId(annotationOnTarget[annotationOnTarget.findIndex(annotation => annotation.id === globalSelectedAnnotation.id) + 1].id);
                    console.log("2-n annotationsOntarget ", annotationOnTarget[annotationOnTarget.findIndex(annotation => annotation.id === globalSelectedAnnotation.id) + 1]);
                }     
            }

            console.log("select anno id encoded: ", annoIdEncoded);
            selectAnnotation(null, annoIdEncoded);
            //alert("asd");
            console.log("selectedAnnotation 2: ", globalSelectedAnnotation);
	        if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
	            toggleOverview('annotationCard');
		    }
        } 
	}
	
	document.getElementById("TEI").onmouseup = function (event) {
		
		// only get a selection, if a user actually wants to select text		
		if (mode === Mode.Create && selectingText){
			annotateSelectedText();
			
			/*let target = [];
			
			for (element in selection) {
				target.push(element);
			}
			const modal = document.getElementById("createAnnotation");
            modal.classList.toggle("show-modal");
            pickTemplate(target, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
            
           */
		}
		if (mode === Mode.Modify && selectingText){
			modifySelection();
			
			/*let target = [];
			
			for (element in selection) {
				target.push(element);
			}
			const modal = document.getElementById("createAnnotation");
            modal.classList.toggle("show-modal");
            pickTemplate(target, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
            
           */
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

    // Drawing anno svgs on first opening of page moved to CETEIcean call in editor_text.html
    }
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
    // disabling the option to create an annotation. needed, because selecting text
	// can be done before the mode was set to create by clicking the button after the text selection process
    mode = Mode.View;
	selectingText = false;
});

// adding the closing functionality to body creation modal
document.getElementById('closeButton').addEventListener('click', function (e) {
    document.getElementById("createBody").classList.toggle("show-modal");
	// disabling the option to create an annotation. needed, because selecting text
	// can be done before the mode was set to create by clicking the button after the text selection process
    mode = Mode.View;
	selectingText = false;
});

// adding the closing functionality to text selection update modal
document.getElementById('closeButtonUpdate').addEventListener('click', function (e) {
    document.getElementById("updateSelection").classList.toggle("show-modal");
    // document.getElementById('modifyButton').parentElement.classList.remove('active');
    cancelModification();
	// disabling the option to create an annotation. needed, because selecting text
	// can be done before the mode was set to create by clicking the button after the text selection process
    mode = Mode.View;
	selectingText = false;
});

function hideExpandedSidebar() {
    let sideBar = document.querySelector('.anno-side-bar');
    if (!sideBar.classList.contains('annocollapse')) {
        toggleAnnoSideBar();
    };
};
