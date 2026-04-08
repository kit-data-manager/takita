import { drawPolygon, toggleShapeSelect } from './target';

/**
 * helper function to deselct all shapes on the canvas
 *
 * @param {*} paper the paper/canvas object of raphael
 */
export function unselectAllShapes(paper) {
  // Note: raphael doesn't offer a filter()-function
  paper.forEach((shape) => {
    // unselecting the previously selected shape
    if (shape.selected) {
      toggleShapeSelect(shape);
    }
  });
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
