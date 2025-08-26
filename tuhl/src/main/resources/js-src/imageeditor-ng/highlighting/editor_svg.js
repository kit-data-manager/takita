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
  static View = new Mode('view');
  static Create = new Mode('create');
  static Modify = new Mode('modify');
  static Move = new Mode('move');

  constructor(name) {
    this.name = name;
  }
}

let mode = Mode.View;

// additional function for Raphael shape to determine shape visibility on the canvas
Raphael.el.isVisible = function () {
  return this.node.style.display !== 'none';
};

//function resizeViewbox() {
//width  = img.naturalWidth;
//height = img.naturalheight;
//canvas.viewbox(0, 0, width, height);
//}

function extractInformationFromSvg(svgString, annoJson) {
  const svgDoc = new DOMParser().parseFromString(svgString, 'text/xml');
  let svgRect = svgDoc.getElementsByTagName('rect')[0];
  let svgPolygon = svgDoc.getElementsByTagName('polygon')[0];
  if (svgRect) {
    annoJson.x = Math.round(parseInt(svgRect.getAttribute('x')));
    annoJson.y = Math.round(parseInt(svgRect.getAttribute('y')));
    annoJson.width = Math.round(parseInt(svgRect.getAttribute('width')));
    annoJson.height = Math.round(parseInt(svgRect.getAttribute('height')));
    annoJson.type = 'Rectangle';
    annoJson.icon = "<i class='bx bx-square'></i>";
  } else if (svgPolygon) {
    let polygonPoints = svgPolygon.getAttribute('points').split(' ');
    if (!polygonPoints[polygonPoints.length - 1]) {
      // remove the last empty element
      polygonPoints.pop();
    }

    let polygonTempPath = 'M' + polygonPoints[0];
    for (let i = 1; i < polygonPoints.length; i++) {
      polygonTempPath = polygonTempPath + 'L' + polygonPoints[i];
    }
    polygonTempPath = polygonTempPath + 'Z';

    annoJson.points = polygonPoints;
    annoJson.path = polygonTempPath;
    annoJson.type = 'Polygon';
    annoJson.icon = "<i class='bx bx-polygon'></i>";

    polygonPath = drawPolygon(polygonTempPath, 'purple', null, null).hide();
    annoJson.height = Math.round(polygonPath.getBBox().height);
    annoJson.width = Math.round(polygonPath.getBBox().width);
    polygonPath.remove();
  }
}

function drawAnnos(annoJson) {
  console.log(annoJson);
  for (let anno in annoJson) {
    annoJson[anno].svg[0]?.value
      ? extractInformationFromSvg(annoJson[anno].svg[0].value, annoJson[anno])
      : console.warn('annotation is page anno: ', annoJson[anno].id);
  }

  // sort all annotations resp. the corresponding shape area (descending)
  // annotations without shape are at the end of the array
  let sortedAnnoJson = annoJson.sort(function (a, b) {
    // if either anno has no width or height, then consider it as smaller
    if (!(a.height && a.width)) {
      return b.height * b.width;
    }
    if (!(b.height && b.width)) {
      return -(a.height * a.width);
    }
    return b.height * b.width - a.height * a.width;
  });

  // create Raphael objects according to the shape to draw them on the canvas
  for (let anno in sortedAnnoJson) {
    if (sortedAnnoJson[anno]['visible']) {
      if (sortedAnnoJson[anno].type === 'Rectangle') {
        // if shape color has not been set, set it to default
        // otherwise it won't be visible on the Raphael paper
        if (!sortedAnnoJson[anno].color) {
          sortedAnnoJson[anno].color = '#ff8d00';
        }
        drawRectangle(
          sortedAnnoJson[anno].x,
          sortedAnnoJson[anno].y,
          sortedAnnoJson[anno].width,
          sortedAnnoJson[anno].height,
          sortedAnnoJson[anno].color,
          sortedAnnoJson[anno].id,
          sortedAnnoJson[anno].idEncoded,
        );
      } else if (sortedAnnoJson[anno].type === 'Polygon') {
        // if shape color has not been set, set it to default
        // otherwise it won't be visible on the Raphael paper
        if (!sortedAnnoJson[anno].color) {
          sortedAnnoJson[anno].color = '#ff8d00';
        }
        polygonPath = drawPolygon(
          annoJson[anno].path,
          sortedAnnoJson[anno].color,
          sortedAnnoJson[anno].id,
          sortedAnnoJson[anno].idEncoded,
        );
        for (let point in annoJson[anno].points) {
          coordinatePair = annoJson[anno].points[point].split(',');
          x = parseInt(coordinatePair[0]);
          y = parseInt(coordinatePair[1]);
          polygonPoint = paper
            .circle(x, y, 20)
            .attr('fill', 'white')
            .drag(dragCircleMove, dragCircleStart, dragCircleEnd)
            .hide();
          polygonPoint.path = polygonPath;
          polygonPath.points.push(polygonPoint);
        }
        polygonPath = undefined;
      }
    }
  }

  fillMetaDataEditorTable(annoJson);
}

function fillMetaDataEditorTable(annoJson) {
  if (document.getElementById('editor-buttons')) {
    document.getElementById('editor-buttons').remove();
  }

  // decision to only show page annotations in the table
  // can be removed to simply show all annotations of the page
  let filteredAnnoJson = annoJson.filter((anno) => anno.type !== 'Rectangle' && anno.type !== 'Polygon');

  // to include the shape type of the annotation add:
  // "Type": {"type": "string", "title": "Type"}
  let dataModel = {
    type: 'object',
    properties: {
      ID: {
        type: 'string',
        title: 'ID',
      },
      Color: {
        type: 'string',
        title: 'Color',
      },
    },
  };

  let items = [
    {
      title: 'Identifier',
      field: 'id',
      headerSort: false,
      cellClick: function (e, cell) {
        selectAnnotation(null, encodeAnnoId(cell.getValue()));
        if (document.getElementById('annotationCard').classList.contains('invisible')) {
          toggleOverview('annotationCard');
        }
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
      },
    },
    //{title: "", field: "icon", formatter:"html", width:60, hozAlign: "center"},
    { title: '', field: 'color', formatter: 'color', width: 60 },
  ];

  let inputs = {
    dataModel: dataModel,
    uiForm: '*',
    resource: filteredAnnoJson,
    items: items,
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
    updateOperation: function (rowColumnvalue) {
      selectAnnotation(null, encodeAnnoId(rowColumnvalue.id));
      if (document.getElementById('annotationCard').classList.contains('invisible')) {
        toggleOverview('annotationCard');
      }
      // toggling shape selection on the canvas
      // not needed as long only page annotations are shown
      //
      //paper.forEach(function(element) {
      //    if (element.annoId === rowColumnvalue.id) {
      //        toggleShapeSelect(element);
      //    };
      //});
    },
    deleteOperation: function (rowColumnvalue) {
      deleteAnnotation(rowColumnvalue.id);
    },
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
}

function createPageAnnotation() {
  let createAnnotation = document.getElementById('createAnnotation');
  let createAnnotationModal = bootstrap.Modal.getOrCreateInstance(createAnnotation);
  createAnnotationModal.toggle();
  pickTemplate('', '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');
}

function imageZoomIn() {
  paper.currentWidth = paper.currentWidth - paper.originalWidth / 10;
  paper.currentHeight = paper.currentHeight - paper.originalHeight / 10;

  if (paper.currentWidth > 0 && paper.currentHeight > 0) {
    let image = document.getElementById('pageImage');
    image.style.width =
      (document.getElementById('imageWorkspace').clientWidth * paper.originalWidth) / paper.currentWidth + 'px';
    image.style.left = Math.round((-paper.currentX * image.clientWidth) / paper.originalWidth) + 'px';
    image.style.top = Math.round((-paper.currentY * image.clientHeight) / paper.originalHeight) + 'px';

    paper.setSize(image.clientWidth, image.clientHeight);
    let canvas = document.getElementById('canvas');
    canvas.style.left = Math.round((-paper.currentX * image.clientWidth) / paper.originalWidth) + 'px';
    canvas.style.top = Math.round((-paper.currentY * image.clientHeight) / paper.originalHeight) + 'px';
  } else {
    alert("Can't zoom in further!");
  }
}

function imageZoomOut() {
  paper.currentWidth = paper.currentWidth + paper.originalWidth / 10;
  paper.currentHeight = paper.currentHeight + paper.originalHeight / 10;

  let image = document.getElementById('pageImage');

  image.style.width =
    (document.getElementById('imageWorkspace').clientWidth * paper.originalWidth) / paper.currentWidth + 'px';
  image.style.left = Math.round((-paper.currentX * image.clientWidth) / paper.originalWidth) + 'px';
  image.style.top = Math.round((-paper.currentY * image.clientHeight) / paper.originalHeight) + 'px';

  paper.setSize(image.clientWidth, image.clientHeight);
  let canvas = document.getElementById('canvas');
  canvas.style.left = Math.round((-paper.currentX * image.clientWidth) / paper.originalWidth) + 'px';
  canvas.style.top = Math.round((-paper.currentY * image.clientHeight) / paper.originalHeight) + 'px';
}

function hideShape() {
  paper.forEach(function (element) {
    if (element.selected) {
      toggleShapeVisibility(element);
    }
  });
}

function resetView() {
  paper.currentWidth = paper.originalWidth;
  paper.currentHeight = paper.originalHeight;
  paper.currentX = 0;
  paper.currentY = 0;

  paper.forEach(function (element) {
    if (!element.isVisible() && element.type !== 'circle') {
      toggleShapeVisibility(element);
    }
  });
  let image = document.getElementById('pageImage');
  image.style.width = document.getElementById('imageWorkspace').clientWidth + 'px';
  image.style.left = 0 + 'px';
  image.style.top = 0 + 'px';
  paper.setSize(image.clientWidth, image.clientHeight);
  let canvas = document.getElementById('canvas');
  canvas.style.left = 0 + 'px';
  canvas.style.top = 0 + 'px';
}

function addRectangle() {
  if (addingRectangle) {
    addingRectangle = false;
    document.getElementById('createRectangleButton').parentElement.classList.remove('active');
  } else {
    addingRectangle = true;
    if (addingPolygon) {
      addingPolygon = false;
      document.getElementById('createPolygonButton').parentElement.classList.remove('active');
    }
  }
}

function addPolygon() {
  if (addingPolygon) {
    addingPolygon = false;
    document.getElementById('createPolygonButton').parentElement.classList.remove('active');
  } else {
    addingPolygon = true;
    if (addingRectangle) {
      addingRectangle = false;
      document.getElementById('createRectangleButton').parentElement.classList.remove('active');
    }
  }
}

function modifyShape() {
  let modifyButton = document.getElementById('modifyButton').parentElement.classList;

  if (modifyButton.contains('active')) {
    confirmDiscardChanges();
    return;
  }

  paper.forEach(function (element) {
    // adding the Raphael events for modification if a shape was already
    // selected before the button click
    if (element.selected) {
      if (element.type === 'rect') {
        enableRectangleModification(element);
        mode = Mode.Modify;
        modifyButton.add('active');
      }

      if (element.type === 'path') {
        enablePolygonModification(element);
        mode = Mode.Modify;
        modifyButton.add('active');
      }
    }
  });

  if (mode != Mode.Modify) {
    alert('Please select a shape first!');
  }
}

// undo also works for multiple objects and object creation
// if this is desired, the necessary information need to be added to drawingHistory
function undo() {
  if (drawingHistory.length > 0) {
    // get the last changed element from your history
    lastChangedElement = drawingHistory[drawingHistory.length - 1];
    // get the corresponding shape from the Raphael paper
    lastChangedShape = paper.getById(lastChangedElement.id);
    // if the shape was created, delete it
    // otherwise restore the former state as stored in the history
    if (!lastChangedElement.attr) {
      // remove polygon vertices
      for (let point in lastChangedElement.points) {
        if (lastChangedElement.points[point].id) {
          paper.getById(lastChangedElement.points[point].id).remove();
        }
      }
      lastChangedShape.remove();
    } else {
      lastChangedShape.attr(lastChangedElement.attr);
      // move back polygon vertices after dragging operation
      for (let point in lastChangedElement.points) {
        lastChangedShape.points[point].attr(lastChangedElement.points[point]);
      }
      //
      if (lastChangedElement.pathId) {
        let pathShape = paper.getById(lastChangedElement.pathId);
        pathShape.attr({ path: createPolygonPath(pathShape.points) });
      }
    }
    drawingHistory.pop();
  }
}

function saveShape() {
  if (drawingHistory) {
    // for now all entries have the same id - needs to be adjusted if the
    // design of the modification mode is altered
    let modifiedShape;
    let svgString;
    if (drawingHistory[0].pathId) {
      // modified shape is a polygon, vertex has been moved first
      modifiedShape = paper.getById(drawingHistory[0].pathId);
      svgString = '<svg><polygon points="';
      for (let point in modifiedShape.points) {
        svgString += modifiedShape.points[point].attrs.cx + ',' + modifiedShape.points[point].attrs.cy + ' ';
      }
      svgString += '"/></svg>';
    } else {
      if (drawingHistory[0].points) {
        // modified shape is a polygon, whole shape has been moved first
        modifiedShape = paper.getById(drawingHistory[0].id);
        svgString = '<svg><polygon points="';
        for (let point in modifiedShape.points) {
          svgString += modifiedShape.points[point].attrs.cx + ',' + modifiedShape.points[point].attrs.cy + ' ';
        }
        svgString += '"/></svg>';
      } else {
        // modified shape is a rectangle
        modifiedShape = paper.getById(drawingHistory[0].id);
        svgString =
          '<svg><rect x="' +
          modifiedShape.attrs.x +
          '" y="' +
          modifiedShape.attrs.y +
          '" width="' +
          modifiedShape.attrs.width +
          '" height="' +
          modifiedShape.attrs.height +
          '"/></svg>';
      }
    }

    const selectors = [{ type: 'SvgSelector', value: svgString }];
    let annotationDataJson = { color: modifiedShape.attrs.fill, motivation: 'describing', selectors: selectors };

    $.ajax({
      type: 'PUT',
      url: window.CONTEXTPATH + 'editor_rest/annotations/' + modifiedShape.annoIdEncoded,
      data: JSON.stringify(annotationDataJson),
      headers: {
        'Content-Type': 'application/json',
      },

      success: function (responseData) {
        for (let anno in annoJson) {
          if (annoJson[anno].id === modifiedShape.annoId) {
            annoJson[anno].svg = svgString;

            if (annoJson[anno].type === 'Rectangle') {
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
              }
              polygonTempPath = polygonTempPath + 'Z';

              annoJson[anno].path = polygonTempPath;
              annoJson[anno].points = polygonPoints;
            }
          }
        }
        endModification(modifiedShape);
      },

      error: function (errorData) {
        console.log(errorData);
      },
    });
  }
}

function endModification(shape) {
  document.getElementById('modifyButton').parentElement.classList.remove('active');
  // empty the undo stack
  drawingHistory.length = 0;

  // remove all modification functionalities
  if (shape.type === 'rect') {
    disableRectangleModification(shape);
  }

  if (shape.type === 'path') {
    disablePolygonModification(shape);
  }

  mode = Mode.View;
}

function init(annotations) {
  let image = document.getElementById('pageImage');
  image.style.width = document.getElementById('imageWorkspace').clientWidth + 'px';
  paper = Raphael('canvas', image.width, image.height);

  paper.currentWidth = image.naturalWidth;
  paper.currentHeight = image.naturalHeight;
  paper.currentX = 0;
  paper.currentY = 0;
  paper.originalWidth = image.naturalWidth;
  paper.originalHeight = image.naturalHeight;
  paper.setViewBox(0, 0, paper.originalWidth, paper.originalHeight);

  document.getElementById('canvas').oncontextmenu = function (e) {
    e.preventDefault();
    if (addingPolygon) {
      document.getElementById('createPolygonButton').parentElement.classList.remove('active');
      for (let point in polygonPath.points) {
        polygonPath.points[point].remove();
      }
      polygonPath.remove();
      mode = Mode.View;
      firstPolygonPoint = undefined;
      polygonPath = undefined;
      polygonPoint = undefined;
      invisiblePolygonPoint = undefined;
      addingPolygon = false;
    }
  };
  document.getElementById('canvas').onmousedown = function (coordinates) {
    if (addingRectangle) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();

      let scaledX = Math.round(relativeCoordinates[0] / scalingRatios[0] + paper.currentX);
      let scaledY = Math.round(relativeCoordinates[1] / scalingRatios[1] + paper.currentY);

      mouseDownX = Math.round(relativeCoordinates[0]);
      mouseDownY = Math.round(relativeCoordinates[1]);

      newRectangle = drawRectangle(scaledX, scaledY, 0, 0, '#ff8d00', null, null);
    }

    if (movingImage || coordinates.ctrlKey) {
      initiated = true;
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      mouseDownX = Math.round(relativeCoordinates[0]);
      mouseDownY = Math.round(relativeCoordinates[1]);
    }

    if (mode.name === 'move' && !movingImage) {
      mode = Mode.View;
    }
  };
  document.getElementById('canvas').onclick = function (coordinates) {
    if (mode.name === 'move' && !movingImage) {
      mode = Mode.View;
    }

    if (addingPolygon) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();
      let scaledX = Math.round(relativeCoordinates[0] / scalingRatios[0] + paper.currentX);
      let scaledY = Math.round(relativeCoordinates[1] / scalingRatios[1] + paper.currentY);

      if (!firstPolygonPoint) {
        firstPolygonPoint = { x: scaledX, y: scaledY };
        polygonPath = drawPolygon('M' + scaledX + ' ' + scaledY, '#ff8d00', null);
      }

      let dx = Math.abs(scaledX - firstPolygonPoint.x);
      let dy = Math.abs(scaledY - firstPolygonPoint.y);

      if ((dx > 0 && dx < 50 && dy < 50) || (dy > 0 && dx < 50 && dy < 50)) {
        polygonPath.attr({
          path:
            polygonPath.attrs.path.toString().substring(0, polygonPath.attrs.path.toString().lastIndexOf('L')) + 'Z',
          fill: '#ff8d00',
          'fill-opacity': 0.01,
        });
        //let undoInformation = [{"id" : invisiblePolygonPoint.id}];
        //for (point in polygonPath.points) {
        //    undoInformation.push({"id" : polygonPath.points[point].id})
        //}
        //polygonPath.points.push(invisiblePolygonPoint)
        //drawingHistory.push({"id" : polygonPath.id, "element": null, "points" : undoInformation});
        mode = Mode.View;

        let svgString = '<svg><polygon points="';
        for (let point in polygonPath.points) {
          svgString += polygonPath.points[point].attrs.cx + ',' + polygonPath.points[point].attrs.cy + ' ';
        }
        svgString += '"/></svg>';

        let createAnnotation = document.getElementById('createAnnotation');
        let createAnnotationModal = bootstrap.Modal.getOrCreateInstance(createAnnotation);
        createAnnotationModal.toggle();
        const selectors = [{ type: 'SvgSelector', value: svgString }];
        pickTemplate(
          JSON.stringify(selectors),
          '',
          'createAnnotationForm',
          'pickAnnotationTemplateForm',
          'annotationTemplate',
        );

        firstPolygonPoint = undefined;
        //polygonPath = undefined;
        polygonPoint = undefined;
        invisiblePolygonPoint = undefined;
        addingPolygon = false;
      } else {
        polygonPoint = paper
          .circle(scaledX, scaledY, 30)
          .attr('fill', 'white')
          .drag(dragCircleMove, dragCircleStart, dragCircleEnd)
          .hide();
        polygonPoint.path = polygonPath;
        polygonPath.points.push(polygonPoint);
        if (invisiblePolygonPoint) {
          invisiblePolygonPoint.attr({ cx: scaledX, cy: scaledY });
        } else {
          invisiblePolygonPoint = paper.circle(scaledX, scaledY, 1).hide();
        }

        polygonPath.attr({ path: polygonPath.attrs.path.toString() + 'L' + scaledX + ' ' + scaledY });
      }
    }
    if (addingRectangle) {
      mode = Mode.View;
      addingRectangle = false;
    }
  };
  document.getElementById('canvas').onmousemove = function (coordinates) {
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
      }
      if (rectangleHeight < 0) {
        rectangleHeight = -rectangleHeight;
        scaledY = Math.round(mouseDownY / scalingRatios[1] - rectangleHeight);
      } else {
        scaledY = Math.round(mouseDownY / scalingRatios[1]);
      }

      newRectangle.attr({
        x: scaledX + paper.currentX,
        y: scaledY + paper.currentY,
        width: rectangleWidth,
        height: rectangleHeight,
      });
    }
    if (addingPolygon && polygonPoint && invisiblePolygonPoint) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();

      let polygonX = Math.round(relativeCoordinates[0] / scalingRatios[0] + paper.currentX);
      let polygonY = Math.round(relativeCoordinates[1] / scalingRatios[1] + paper.currentY);
      invisiblePolygonPoint.attr({ cx: polygonX, cy: polygonY });

      polygonPath.attr({
        path:
          polygonPath.attrs.path.toString().substring(0, polygonPath.attrs.path.toString().lastIndexOf('L')) +
          'L' +
          polygonX +
          ' ' +
          polygonY,
      });
    }
    if ((movingImage && initiated) || (coordinates.ctrlKey && initiated)) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();

      let deltaX = Math.round((relativeCoordinates[0] - mouseDownX) / scalingRatios[0] / 10);
      let deltaY = Math.round((relativeCoordinates[1] - mouseDownY) / scalingRatios[1] / 10);

      // if movement needs to be quicker, introduce a factor e.g. 2 before deltaX and deltaY
      paper.currentX = paper.currentX - deltaX;
      paper.currentY = paper.currentY - deltaY;

      let image = document.getElementById('pageImage');
      image.style.left = Math.round(-paper.currentX * scalingRatios[0]) + 'px';
      image.style.top = Math.round(-paper.currentY * scalingRatios[1]) + 'px';

      //paper.setViewBox(paper.currentX, paper.currentY, paper.currentWidth, paper.currentHeight);
      let canvas = document.getElementById('canvas');
      canvas.style.left = Math.round(-paper.currentX * scalingRatios[0]) + 'px';
      canvas.style.top = Math.round(-paper.currentY * scalingRatios[1]) + 'px';
    }
  };
  document.getElementById('canvas').onmouseup = function (coordinates) {
    let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
    // prevent rectangles with zero width and height if the user clicks
    if (
      addingRectangle &&
      Math.round(relativeCoordinates[0]) === mouseDownX &&
      Math.round(relativeCoordinates[1]) === mouseDownY
    ) {
      document.getElementById('createRectangleButton').parentElement.classList.remove('active');
      newRectangle.remove();
      //newRectangle = undefined;
      //addingRectangle = false;
      return;
    }

    if (addingRectangle) {
      //drawingHistory.push({"id" : newRectangle.id, "element" : null});

      let svgString =
        '<svg><rect x="' +
        newRectangle.attrs.x +
        '" y="' +
        newRectangle.attrs.y +
        '" width="' +
        newRectangle.attrs.width +
        '" height="' +
        newRectangle.attrs.height +
        '"/></svg>';

      let createAnnotation = document.getElementById('createAnnotation');
      let createAnnotationModal = bootstrap.Modal.getOrCreateInstance(createAnnotation);
      createAnnotationModal.toggle();
      const selectors = [{ type: 'SvgSelector', value: svgString }];
      pickTemplate(
        JSON.stringify(selectors),
        '',
        'createAnnotationForm',
        'pickAnnotationTemplateForm',
        'annotationTemplate',
      );

      // reset variables needed for rectangle creation
      //addingRectangle = false;
      // TODO: find a new place for that!
      //newRectangle = undefined;
      mouseDownX = undefined;
      mouseDownY = undefined;
    }

    if (movingImage) {
      movingImage = false;
    }

    // moved out of the if clause to prevent unintentional movement after ctrl-move
    initiated = false;
  };

  // Drawing anno svgs on first opening of page
  annoJson = JSON.parse(annotations);
  drawAnnos(annoJson);

  // Showing the annotation and highlighting the shape on first opening of page
  const editorURL = new URL(window.location);
  if (editorURL.searchParams.size > 0) {
    selectAnnotationOnLoad(editorURL);
  }
}

/* function to be called on load of the editor;
    simulates a click on the annotations shape on the canvas.
    The annotation id gets parsed from the search parameter of the
    url.
*/
function selectAnnotationOnLoad(editorURL) {
  const annotationId = editorURL.searchParams.get('annotationId');
  let targetShape = undefined;
  // getting the shape corresponding to the annotation
  // raphael doesn't offer a filter()-function
  paper.forEach((shape) => {
    if (shape.annoId === annotationId) {
      targetShape = shape;
    }
  });

  if (targetShape) {
    // display the annotation with the id stored in the url
    selectAnnotation(null, encodeAnnoId(annotationId));
    if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
      toggleOverview('annotationCard');
    }
    // highlight the shape on the canvas
    toggleShapeSelect(targetShape);
  }
}

function confirmDiscardChanges() {
  if (addingRectangle) {
    document.getElementById('createRectangleButton').parentElement.classList.add('active');
  }
  if (addingPolygon) {
    document.getElementById('createPolygonButton').parentElement.classList.add('active');
  }

  if (!document.getElementById('annotationCard').classList.contains('invisible')) {
    toggleOverview('annotationCard');
  }

  if (drawingHistory.length > 0) {
    for (item in drawingHistory) {
      console.log(drawingHistory[item]);
    }
    let confirmation = confirm('There are unsaved changes. Do you want to continue and discard them?');

    if (confirmation) {
      let modifiedShape = paper.getById(drawingHistory[0].id);
      // get modified shape to former state and deselect it
      while (drawingHistory.length > 0) {
        console.log(drawingHistory);
        undo();
      }
      if (modifiedShape.type === 'circle') {
        endModification(modifiedShape.path);
        toggleShapeSelect(modifiedShape.path);
      } else {
        endModification(modifiedShape);
        toggleShapeSelect(modifiedShape);
      }
    } else {
      addingRectangle = false;
      addingPolygon = false;
      document.getElementById('createRectangleButton').parentElement.classList.remove('active');
      document.getElementById('createPolygonButton').parentElement.classList.remove('active');
    }
  }

  if (mode == Mode.Modify) {
    paper.forEach(function (element) {
      endModification(element);
    });
  }
}

window.addEventListener('beforeunload', function (e) {
  if (drawingHistory.length > 0) {
    let confirmationMessage =
      'It looks like you have been editing something. ' + 'If you leave before saving, your changes will be lost.';

    // e.preventDefault();

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
  }
});

window.addEventListener(
  'wheel',
  function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
      let sign = Math.sign(e.deltaY);
      if (sign > 0) {
        imageZoomIn();
        console.log('Zooming in!');
      } else {
        imageZoomOut();
        console.log('Zooming out!');
      }
    }
  },
  {
    passive: false,
  },
);

window.addEventListener('mouseup', function (e) {
  // prevent unintended movement after ctrl moving
  // if the user gets out of the canvas while ctrl moving the variable is not resetted
  // if the ctrl button is pushed again, the image moves with every mouse move otherwise
  initiated = false;
});

// adding custom closing functionality to annotation creation modal
let createAnnotation = document.getElementById('createAnnotation');

// brings the image in front of the modal backdrop while annotating
// for now only for creating annotations not bodies
createAnnotation.addEventListener('shown.bs.modal', (event) => {
  document.getElementById('imageWorkspace').style.zIndex = '1100';
});

createAnnotation.addEventListener('hidden.bs.modal', (event) => {
  document.getElementById('imageWorkspace').style.zIndex = '1';
});

document.getElementById('dismissAnnotation').addEventListener('click', (event) => {
  // if modal was shown during creation of new rectangle, remove rectangle
  if (newRectangle) {
    newRectangle.remove();
    document.getElementById('createRectangleButton').parentElement.classList.remove('active');
  }

  // if modal was shown during creation of new polygon, remove polygon
  if (polygonPath) {
    polygonPath.remove();
    document.getElementById('createPolygonButton').parentElement.classList.remove('active');
  }
});

function hideExpandedSidebar() {
  let sideBar = document.querySelector('.anno-side-bar');
  if (!sideBar.classList.contains('annocollapse')) {
    toggleAnnoSideBar();
  }
}
