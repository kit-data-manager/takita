import $ from 'jquery';
import { toggleVisibility } from '../../common/utils';
import { Mode } from '../../common/mode';
import { toggleShapeSelect } from '../highlighting';
import { toggleShapeVisibility } from '../utils';
import {
  dragPolygonMove,
  dragPolygonEnd,
  dragPolygonStart,
  dragRectangleMove,
  dragRectangleEnd,
  dragRectangleStart,
  changeCursor,
  createPolygonPath,
} from './utils';

export function enableRectangleModification(shape) {
  // Raphael event for rectangle movement
  shape.drag(dragRectangleMove, dragRectangleStart, dragRectangleEnd);
  // changing cursor to arrow cursor depending on the mouse position
  shape.mousemove(changeCursor);
}

export function disableRectangleModification(shape) {
  shape.undrag();
  shape.unmousemove(changeCursor);
  shape.attr({ cursor: 'default' });
}

export function enablePolygonModification(shape) {
  // Raphael event
  shape.drag(dragPolygonMove, dragPolygonStart, dragPolygonEnd);
  shape.attr({ cursor: 'move' });

  // show vertices of polygon
  for (let point in shape.points) {
    toggleShapeVisibility(shape.points[point]);
  }
}

export function disablePolygonModification(shape) {
  shape.undrag();
  shape.attr({ cursor: 'default' });
  // hiding vertices of polygon
  for (let point in shape.points) {
    // if not checked, polygons will get modifiable by accident
    if (shape.points[point].isVisible()) {
      toggleShapeVisibility(shape.points[point]);
    }
  }
}

export function modifyShape() {
  let modifyButton = document.getElementById('modifyButton').parentElement.classList;

  if (modifyButton.contains('active')) {
    confirmDiscardChanges();
    return;
  }

  window.paper.forEach(function (element) {
    // adding the Raphael events for modification if a shape was already
    // selected before the button click
    if (element.selected) {
      if (element.type === 'rect') {
        enableRectangleModification(element);
        window.MODE = Mode.Modify;
        modifyButton.add('active');
      }

      if (element.type === 'path') {
        enablePolygonModification(element);
        window.MODE = Mode.Modify;
        modifyButton.add('active');
      }
    }
  });

  if (window.MODE != Mode.Modify) {
    alert('Please select a shape first!');
  }
}

// undo also works for multiple objects and object creation
// if this is desired, the necessary information need to be added to window.drawingHistory
export function undo() {
  if (window.drawingHistory.length > 0) {
    // get the last changed element from your history
    const lastChangedElement = window.drawingHistory[window.drawingHistory.length - 1];
    // get the corresponding shape from the Raphael window.paper
    const lastChangedShape = window.paper.getById(lastChangedElement.id);
    // if the shape was created, delete it
    // otherwise restore the former state as stored in the history
    if (!lastChangedElement.attr) {
      // remove polygon vertices
      for (let point in lastChangedElement.points) {
        if (lastChangedElement.points[point].id) {
          window.paper.getById(lastChangedElement.points[point].id).remove();
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
        let pathShape = window.paper.getById(lastChangedElement.pathId);
        pathShape.attr({ path: createPolygonPath(pathShape.points) });
      }
    }
    window.drawingHistory.pop();
  }
}

export function saveShape() {
  if (window.drawingHistory) {
    // for now all entries have the same id - needs to be adjusted if the
    // design of the modification mode is altered
    let modifiedShape;
    let svgString;
    if (window.drawingHistory[0].pathId) {
      // modified shape is a polygon, vertex has been moved first
      modifiedShape = window.paper.getById(window.drawingHistory[0].pathId);
      svgString = '<svg><polygon points="';
      for (let point in modifiedShape.points) {
        svgString += modifiedShape.points[point].attrs.cx + ',' + modifiedShape.points[point].attrs.cy + ' ';
      }
      svgString += '"/></svg>';
    } else {
      if (window.drawingHistory[0].points) {
        // modified shape is a polygon, whole shape has been moved first
        modifiedShape = window.paper.getById(window.drawingHistory[0].id);
        svgString = '<svg><polygon points="';
        for (let point in modifiedShape.points) {
          svgString += modifiedShape.points[point].attrs.cx + ',' + modifiedShape.points[point].attrs.cy + ' ';
        }
        svgString += '"/></svg>';
      } else {
        // modified shape is a rectangle
        modifiedShape = window.paper.getById(window.drawingHistory[0].id);
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
        for (let anno in window.ANNOJSON) {
          if (window.ANNOJSON[anno].id === modifiedShape.annoId) {
            window.ANNOJSON[anno].svg = svgString;

            if (window.ANNOJSON[anno].type === 'Rectangle') {
              window.ANNOJSON[anno].x = modifiedShape.attrs.x;
              window.ANNOJSON[anno].y = modifiedShape.attrs.y;
              window.ANNOJSON[anno].width = modifiedShape.attrs.width;
              window.ANNOJSON[anno].height = modifiedShape.attrs.height;
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

              window.ANNOJSON[anno].path = polygonTempPath;
              window.ANNOJSON[anno].points = polygonPoints;
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

export function confirmDiscardChanges() {
  if (window.addingRectangle) {
    document.getElementById('createRectangleButton').parentElement.classList.add('active');
  }
  if (window.addingPolygon) {
    document.getElementById('createPolygonButton').parentElement.classList.add('active');
  }

  if (!document.getElementById('annotationCard').classList.contains('invisible')) {
    toggleVisibility(document.getElementById('annotationCard'));
  }

  if (window.drawingHistory.length > 0) {
    for (const item in window.drawingHistory) {
      console.log(window.drawingHistory[item]);
    }
    let confirmation = confirm('There are unsaved changes. Do you want to continue and discard them?');

    if (confirmation) {
      let modifiedShape = window.paper.getById(window.drawingHistory[0].id);
      // get modified shape to former state and deselect it
      while (window.drawingHistory.length > 0) {
        console.log(window.drawingHistory);
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
      window.addingRectangle = false;
      window.addingPolygon = false;
      document.getElementById('createRectangleButton').parentElement.classList.remove('active');
      document.getElementById('createPolygonButton').parentElement.classList.remove('active');
    }
  }

  if (window.MODE == Mode.Modify) {
    window.paper.forEach(function (element) {
      endModification(element);
    });
  }
}

export function endModification(shape) {
  document.getElementById('modifyButton').parentElement.classList.remove('active');
  // empty the undo stack
  window.drawingHistory.length = 0;

  // remove all modification functionalities
  if (shape.type === 'rect') {
    disableRectangleModification(shape);
  }

  if (shape.type === 'path') {
    disablePolygonModification(shape);
  }

  window.MODE = Mode.View;
}
