import * as bootstrap from 'bootstrap';
import * as Raphael from 'raphael';

import { Mode } from '../common/mode';
import { pickTemplate } from '../common/annotationCreation';
import { selectAnnotation } from '../common/annotationCard';
import { encodeAnnoId, enableTooltips, toggleVisibility } from '../common/utils';

import { imageZoomIn, imageZoomOut } from './sidebar/sidebar';
import { initializeSidebar } from './sidebar';
import { initializeAnnotationTable, defaultDisplayAnnotationFunction } from '../common/annotationTable';
import { toggleShapeSelect } from './highlighting';
import { getRelativeCoordinates } from './utils';
import { getScalingRatios } from './targetBuilding/utils';
import { drawRectangle, drawPolygon, drawAnnos } from './highlighting';
import { dragCircleMove, dragCircleEnd, dragCircleStart } from './targetBuilding/utils';

// global state
window.addingRectangle = false;
window.addingPolygon = false;
window.drawingHistory = [];
window.movingImage = false;
window.paper;
window.MODE_CLASS = Mode;
window.MODE = window.MODE_CLASS.View;
window.EDITORTYPE = 'IMAGE';
window.ANNOJSON;

// local state
let mouseDownX;
let mouseDownY;
let newRectangle;
let polygonPoint;
let firstPolygonPoint;
let invisiblePolygonPoint;
let polygonPath;

let initiated = false;

window.imageEditor = {
  initializeImageEditorComponent,
};

function initializeImageEditorComponent(annotations, thymeleafVariables) {
  // enable tooltips using bootstrap
  const $tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  enableTooltips($tooltipTriggerList);

  let image = document.getElementById('pageImage');
  image.style.width = document.getElementById('imageWorkspace').clientWidth + 'px';

  // additional function for Raphael shape to determine shape visibility on the canvas
  Raphael.el.isVisible = function () {
    return this.node.style.display !== 'none';
  };

  window.paper = Raphael('canvas', image.width, image.height);

  window.paper.currentWidth = image.naturalWidth;
  window.paper.currentHeight = image.naturalHeight;
  window.paper.currentX = 0;
  window.paper.currentY = 0;
  window.paper.originalWidth = image.naturalWidth;
  window.paper.originalHeight = image.naturalHeight;
  window.paper.setViewBox(0, 0, window.paper.originalWidth, window.paper.originalHeight);

  document.getElementById('canvas').oncontextmenu = function (e) {
    e.preventDefault();
    if (window.addingPolygon) {
      document.getElementById('createPolygonButton').parentElement.classList.remove('active');
      for (let point in polygonPath.points) {
        polygonPath.points[point].remove();
      }
      polygonPath.remove();
      window.MODE = Mode.View;
      firstPolygonPoint = undefined;
      polygonPath = undefined;
      polygonPoint = undefined;
      invisiblePolygonPoint = undefined;
      window.addingPolygon = false;
    }
  };
  document.getElementById('canvas').onmousedown = function (coordinates) {
    if (window.addingRectangle) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();

      let scaledX = Math.round(relativeCoordinates[0] / scalingRatios[0] + window.paper.currentX);
      let scaledY = Math.round(relativeCoordinates[1] / scalingRatios[1] + window.paper.currentY);

      mouseDownX = Math.round(relativeCoordinates[0]);
      mouseDownY = Math.round(relativeCoordinates[1]);

      newRectangle = drawRectangle(scaledX, scaledY, 0, 0, '#ff8d00', null, null);
    }

    if (window.movingImage || coordinates.ctrlKey) {
      initiated = true;
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      mouseDownX = Math.round(relativeCoordinates[0]);
      mouseDownY = Math.round(relativeCoordinates[1]);
    }

    if (window.MODE.name === 'move' && !window.movingImage) {
      window.MODE = Mode.View;
    }
  };
  document.getElementById('canvas').onclick = function (coordinates) {
    if (window.MODE.name === 'move' && !window.movingImage) {
      window.MODE = Mode.View;
    }

    if (window.addingPolygon) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();
      let scaledX = Math.round(relativeCoordinates[0] / scalingRatios[0] + window.paper.currentX);
      let scaledY = Math.round(relativeCoordinates[1] / scalingRatios[1] + window.paper.currentY);

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
        window.MODE = Mode.View;

        let svgString = '<svg><polygon points="';
        for (let point in polygonPath.points) {
          svgString += polygonPath.points[point].attrs.cx + ',' + polygonPath.points[point].attrs.cy + ' ';
        }
        svgString += '"/></svg>';

        let createAnnotation = document.getElementById('createAnnotation');
        let createAnnotationModal = bootstrap.Modal.getOrCreateInstance(createAnnotation);
        createAnnotationModal.toggle();
        const selectors = [{ type: 'SvgSelector', value: svgString }];
        pickTemplate(selectors, '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');

        firstPolygonPoint = undefined;
        //polygonPath = undefined;
        polygonPoint = undefined;
        invisiblePolygonPoint = undefined;
        window.addingPolygon = false;
      } else {
        polygonPoint = window.paper
          .circle(scaledX, scaledY, 30)
          .attr('fill', 'white')
          .drag(dragCircleMove, dragCircleStart, dragCircleEnd)
          .hide();
        polygonPoint.path = polygonPath;
        polygonPath.points.push(polygonPoint);
        if (invisiblePolygonPoint) {
          invisiblePolygonPoint.attr({ cx: scaledX, cy: scaledY });
        } else {
          invisiblePolygonPoint = window.paper.circle(scaledX, scaledY, 1).hide();
        }

        polygonPath.attr({ path: polygonPath.attrs.path.toString() + 'L' + scaledX + ' ' + scaledY });
      }
    }
    if (window.addingRectangle) {
      window.MODE = Mode.View;
      window.addingRectangle = false;
    }
  };
  document.getElementById('canvas').onmousemove = function (coordinates) {
    if (window.addingRectangle && newRectangle) {
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
        x: scaledX + window.paper.currentX,
        y: scaledY + window.paper.currentY,
        width: rectangleWidth,
        height: rectangleHeight,
      });
    }
    if (window.addingPolygon && polygonPoint && invisiblePolygonPoint) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();

      let polygonX = Math.round(relativeCoordinates[0] / scalingRatios[0] + window.paper.currentX);
      let polygonY = Math.round(relativeCoordinates[1] / scalingRatios[1] + window.paper.currentY);
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
    if ((window.movingImage && initiated) || (coordinates.ctrlKey && initiated)) {
      let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
      let scalingRatios = getScalingRatios();

      let deltaX = Math.round((relativeCoordinates[0] - mouseDownX) / scalingRatios[0] / 10);
      let deltaY = Math.round((relativeCoordinates[1] - mouseDownY) / scalingRatios[1] / 10);

      // if movement needs to be quicker, introduce a factor e.g. 2 before deltaX and deltaY
      window.paper.currentX = window.paper.currentX - deltaX;
      window.paper.currentY = window.paper.currentY - deltaY;

      let image = document.getElementById('pageImage');
      image.style.left = Math.round(-window.paper.currentX * scalingRatios[0]) + 'px';
      image.style.top = Math.round(-window.paper.currentY * scalingRatios[1]) + 'px';

      //window.paper.setViewBox(window.paper.currentX, window.paper.currentY, window.paper.currentWidth, window.paper.currentHeight);
      let canvas = document.getElementById('canvas');
      canvas.style.left = Math.round(-window.paper.currentX * scalingRatios[0]) + 'px';
      canvas.style.top = Math.round(-window.paper.currentY * scalingRatios[1]) + 'px';
    }
  };
  document.getElementById('canvas').onmouseup = function (coordinates) {
    let relativeCoordinates = getRelativeCoordinates(coordinates.pageX, coordinates.pageY);
    // prevent rectangles with zero width and height if the user clicks
    if (
      window.addingRectangle &&
      Math.round(relativeCoordinates[0]) === mouseDownX &&
      Math.round(relativeCoordinates[1]) === mouseDownY
    ) {
      document.getElementById('createRectangleButton').parentElement.classList.remove('active');
      newRectangle.remove();
      //newRectangle = undefined;
      //addingRectangle = false;
      return;
    }

    if (window.addingRectangle) {
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
      pickTemplate(selectors, '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');

      // reset variables needed for rectangle creation
      //addingRectangle = false;
      // TODO: find a new place for that!
      //newRectangle = undefined;
      mouseDownX = undefined;
      mouseDownY = undefined;
    }

    if (window.movingImage) {
      window.movingImage = false;
    }

    // moved out of the if clause to prevent unintentional movement after ctrl-move
    initiated = false;
  };

  // Drawing anno svgs on first opening of page
  window.ANNOJSON = JSON.parse(annotations);
  drawAnnos(window.ANNOJSON);

  initializeAnnotationTable(
    window.ANNOJSON,
    document.getElementById('annotationTableBottom'),
    defaultDisplayAnnotationFunction,
  );

  // Showing the annotation and highlighting the shape on first opening of page
  const editorURL = new URL(window.location);
  if (editorURL.searchParams.size > 0) {
    selectAnnotationOnLoad(editorURL);
  }

  window.addEventListener('beforeunload', function (e) {
    if (window.drawingHistory.length > 0) {
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

  // initializing the sidebar
  const $sidebar = document.querySelector('.anno-side-bar');
  const $pagesDialog = document.getElementById('pages');
  const $tableContainer = document.getElementById('annotationTableBottomDiv');
  initializeSidebar($sidebar, $pagesDialog, $tableContainer);
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
  window.paper.forEach((shape) => {
    if (shape.annoId === annotationId) {
      targetShape = shape;
    }
  });

  if (targetShape) {
    // display the annotation with the id stored in the url
    selectAnnotation(null, encodeAnnoId(annotationId));
    if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
      toggleVisibility(document.getElementById('annotationCard'));
    }
    // highlight the shape on the canvas
    toggleShapeSelect(targetShape);
  }
}
