import { fillMetaDataEditorTable } from '../../common/utils';
import { toggleVisibility } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationCard';
import { dragCircleMove, dragCircleStart, dragCircleEnd } from '../targetBuilding/utils';
import { disablePolygonModification, disableRectangleModification } from '../targetBuilding/targetModification';
import { assignColor } from '../projectspecific/highlight';
// main drawing function for rectangles
// assigns moving and modifying functionalities on mouse click
export function drawRectangle(x, y, width, height, color, id, idEncoded, hooks = {}) {
  let rectangle = window.paper.rect(x, y, width, height);
  rectangle.attr({
    stroke: color,
    'stroke-opacity': 1,
    'stroke-width': 10,
    fill: color,
    'fill-opacity': 0.01,
  });
  rectangle.annoId = id;
  rectangle.annoIdEncoded = idEncoded;
  rectangle.click(function () {
    window.paper.forEach(function (element) {
      // deselect all previously selected shapes and remove all Raphael
      // events for view and create mode
      if (element.selected && element.id !== rectangle.id) {
        if (window.MODE.name !== 'modify') {
          // TODO: stimmt das wirklich so?
          disableRectangleModification(element);
          toggleShapeSelect(element);
        }
      }
    });
    if (window.MODE.name === 'modify') {
      // for now: nothing can be selected during modification mode
      // TODO: discuss this approach
      // if shape was selected before remove the Raphael events
      //if (this.selected) {
      //    disableRectangleModification(this);
      //} else {
      //    enableRectangleModification(this);
      //};
      //toggleShapeSelect(this);
    }
    if (window.MODE.name === 'view') {
      const $annotationCard = document.getElementById('annotationCard');
      if (this.selected) {
        if (!$annotationCard.classList.contains('invisible')) {
          toggleVisibility($annotationCard);
        }
      } else {
        selectAnnotation(null, this.annoIdEncoded, hooks);
        if ($annotationCard.classList.contains('invisible')) {
          toggleVisibility($annotationCard);
        }
      }
      toggleShapeSelect(this);
    }
  });
  return rectangle;
}

// main drawing function for polygons
// assigns moving and modifying functionalities on mouse click
export function drawPolygon(path, color, id, idEncoded, hooks = {}) {
  let polygon = window.paper.path(path).attr({
    stroke: color,
    'stroke-width': 10,
    fill: color,
    'fill-opacity': 0.01,
  });
  polygon.points = [];
  polygon.annoId = id;
  polygon.annoIdEncoded = idEncoded;
  polygon.click(function () {
    console.log(window.MODE.name);
    window.paper.forEach(function (element) {
      if (element.selected && element.id !== polygon.id) {
        if (window.MODE.name !== 'modify') {
          disablePolygonModification(element);
          toggleShapeSelect(element);
        }
      }
    });
    if (window.MODE.name === 'modify') {
      // for now: nothing can be selected during modification mode
      // TODO: discuss this approach
      //if (this.selected) {
      //    disablePolygonModification(this);
      //} else {
      //    enablePolygonModification(this);
      //};
      //toggleShapeSelect(this);
    }
    if (window.MODE.name === 'view') {
      const $annotationCard = document.getElementById('annotationCard');
      if (this.selected) {
        if ($annotationCard.classList.contains('invisible')) {
          toggleVisibility($annotationCard);
        }
      } else {
        selectAnnotation(null, this.annoIdEncoded, hooks);
        if ($annotationCard.classList.contains('invisible')) {
          toggleVisibility($annotationCard);
        }
      }
      toggleShapeSelect(this);
    }
  });
  return polygon;
}

// changes the fill opacity of the shape on the canvas to indicate selection
export function toggleShapeSelect(shape) {
  if (shape.selected) {
    shape.selected = false;
    shape.attr({ 'fill-opacity': 0.01 });
  } else {
    shape.selected = true;
    shape.attr({ 'fill-opacity': 0.2 });
  }
}

export function extractInformationFromSvg(svgString, annoJson, hooks = {}) {
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

    let polygonPath = drawPolygon(polygonTempPath, 'purple', null, null, hooks).hide();
    annoJson.height = Math.round(polygonPath.getBBox().height);
    annoJson.width = Math.round(polygonPath.getBBox().width);
    polygonPath.remove();
  }
}

export function drawAnnos(annoJson, hooks = {}) {
  for (let anno in annoJson) {
    // check if there is a value for svg as page-annotations will not have a value
    // and should print an error on the console
    annoJson[anno].svg[0]?.value
      ? extractInformationFromSvg(annoJson[anno].svg[0].value, annoJson[anno], hooks)
      : console.warn('annotation is page anno: ', annoJson[anno].id);
  }

  // assign the color based on projectspecific needs
  annoJson.map((anno) => assignColor(anno));
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
          hooks,
        );
      } else if (sortedAnnoJson[anno].type === 'Polygon') {
        // if shape color has not been set, set it to default
        // otherwise it won't be visible on the Raphael paper
        if (!sortedAnnoJson[anno].color) {
          sortedAnnoJson[anno].color = '#ff8d00';
        }
        let polygonPath = drawPolygon(
          annoJson[anno].path,
          sortedAnnoJson[anno].color,
          sortedAnnoJson[anno].id,
          sortedAnnoJson[anno].idEncoded,
          hooks,
        );
        for (let point in annoJson[anno].points) {
          const coordinatePair = annoJson[anno].points[point].split(',');
          const x = parseInt(coordinatePair[0]);
          const y = parseInt(coordinatePair[1]);
          const polygonPoint = window.paper
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
}
