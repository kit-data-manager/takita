import { getRelativeCoordinates } from '../utils';
// return scaling ratios (image size rendered at client vs original size)
// for x and y coordinates, can also be used for width / height
export function getScalingRatios() {
  //let imageWorkspaceBoundingRect = document.getElementById("imageWorkspace").getBoundingClientRect();
  let image = document.getElementById('pageImage');
  let scalingRatioX2 = image.clientWidth / window.paper.originalWidth;
  let scalingRatioY2 = image.clientHeight / window.paper.originalHeight;

  return [scalingRatioX2, scalingRatioY2];
}

// create path string from vertices of the polygon, needed for shape creation
export function createPolygonPath(points) {
  let polygonPath = 'M' + points[0].attrs.cx + ',' + points[0].attrs.cy;
  for (let i = 1; i < points.length; i++) {
    polygonPath = polygonPath + 'L' + points[i].attrs.cx + ',' + points[i].attrs.cy;
  }
  polygonPath = polygonPath + 'Z';
  return polygonPath;
}

// Storing original rectangle values (coordinates, width, height) before modifying
// This is a re-use from Ethan Zimmerman's code published on GitHub Gist under MIT licence:
// https://gist.github.com/thebinarypenguin/1558194
export function dragRectangleStart() {
  this.ox = this.attr('x');
  this.oy = this.attr('y');
  this.ow = this.attr('width');
  this.oh = this.attr('height');
  this.dragging = true;
}

// Storing the original polygon points before modifying
export function dragPolygonStart() {
  this.opoints = [];
  for (let circle in this.points) {
    this.opoints.push(this.points[circle].clone().attr({ r: 1 }));
  }
}

// Storing the original circle values before modifying
export function dragCircleStart() {
  this.ox = this.attr('cx');
  this.oy = this.attr('cy');
}

// resizing or dragging rectangles
// x and y input coordinates are scaled to match the resolution of the image
// This is an adaption from Ethan Zimmerman's code published on GitHub Gist under MIT licence:
// https://gist.github.com/thebinarypenguin/1558194
export function dragRectangleMove(screenDx, screenDy) {
  let scalingRatios = getScalingRatios();

  let dx = ((screenDx / scalingRatios[0]) * window.paper.currentWidth) / window.paper.originalWidth;
  let dy = ((screenDy / scalingRatios[1]) * window.paper.currentHeight) / window.paper.originalHeight;

  // Inspect cursor to determine which resize/move process to use
  switch (this.attr('cursor')) {
    case 'nw-resize':
      this.attr({
        x: Math.round(this.ox + dx),
        y: Math.round(this.oy + dy),
        width: Math.round(this.ow - dx),
        height: Math.round(this.oh - dy),
      });
      break;

    case 'ne-resize':
      this.attr({
        y: Math.round(this.oy + dy),
        width: Math.round(this.ow + dx),
        height: Math.round(this.oh - dy),
      });
      break;

    case 'se-resize':
      this.attr({
        width: Math.round(this.ow + dx),
        height: Math.round(this.oh + dy),
      });
      break;

    case 'sw-resize':
      this.attr({
        x: Math.round(this.ox + dx),
        width: Math.round(this.ow - dx),
        height: Math.round(this.oh + dy),
      });
      break;

    case 'w-resize':
      this.attr({
        x: Math.round(this.ox + dx),
        width: Math.round(this.ow - dx),
      });
      break;

    case 'e-resize':
      this.attr({
        width: Math.round(this.ow + dx),
      });
      break;

    case 's-resize':
      this.attr({
        height: Math.round(this.oh + dy),
      });
      break;

    case 'n-resize':
      this.attr({
        y: Math.round(this.oy + dy),
        height: Math.round(this.oh - dy),
      });
      break;

    default:
      this.attr({
        x: Math.round(this.ox + dx),
        y: Math.round(this.oy + dy),
      });
      break;
  }
}

export function dragPolygonMove(screenDx, screenDy) {
  this.attr('cursor', 'move');

  let scalingRatios = getScalingRatios();

  // scale screen movement to orginal image size
  let dx = ((screenDx / scalingRatios[0]) * window.paper.currentWidth) / window.paper.originalWidth;
  let dy = ((screenDy / scalingRatios[1]) * window.paper.currentHeight) / window.paper.originalHeight;

  for (let circle in this.opoints) {
    const movedX = Math.round(this.opoints[circle].attrs.cx + dx);
    const movedY = Math.round(this.opoints[circle].attrs.cy + dy);
    this.points[circle].attr({ cx: movedX, cy: movedY });
  }

  this.attr({ path: createPolygonPath(this.points) });
}

export function dragCircleMove(screenDx, screenDy) {
  let scalingRatios = getScalingRatios();

  let dx = screenDx / scalingRatios[0];
  let dy = screenDy / scalingRatios[1];

  // change the corresponding polygon as well
  this.path.attr({ path: createPolygonPath(this.path.points) });
  this.attr({ cx: Math.round(this.ox + dx), cy: Math.round(this.oy + dy) });
}

export function dragRectangleEnd() {
  window.drawingHistory.push({ id: this.id, attr: { x: this.ox, y: this.oy, width: this.ow, height: this.oh } });
  this.dragging = false;
}

export function dragPolygonEnd() {
  if (!window.firstPolygonPoint) {
    let undoInformation = [];
    for (let point in this.opoints) {
      undoInformation.push({
        id: this.opoints[point].id,
        cx: this.opoints[point].attrs.cx,
        cy: this.opoints[point].attrs.cy,
      });
    }
    window.drawingHistory.push({
      id: this.id,
      attr: { path: createPolygonPath(this.opoints) },
      points: undoInformation,
    });
  }

  this.attr({ cursor: 'default' });
  for (let circle in this.opoints) {
    this.opoints[circle].remove();
  }
}
export function dragCircleEnd() {
  if (!window.firstPolygonPoint) {
    window.drawingHistory.push({ id: this.id, attr: { cx: this.ox, cy: this.oy }, pathId: this.path.id });
  }
}

// This is an adaption from Ethan Zimmerman's code published on GitHub Gist under MIT licence:
// https://gist.github.com/thebinarypenguin/1558194
export function changeCursor(e, mouseX, mouseY) {
  // Don't change cursor during a drag operation
  if (this.dragging === true) {
    return;
  }

  let scalingRatios = getScalingRatios();
  let relativeCoordinates = getRelativeCoordinates(mouseX, mouseY);

  // X,Y Coordinates relative to shape's orgin
  let relativeX = relativeCoordinates[0] - this.attr('x') * scalingRatios[0] + window.paper.currentX * scalingRatios[0];
  let relativeY = relativeCoordinates[1] - this.attr('y') * scalingRatios[1] + window.paper.currentY * scalingRatios[1];

  let shapeWidth = this.attr('width') * scalingRatios[0];
  let shapeHeight = this.attr('height') * scalingRatios[1];

  // area around exact line where events will be triggered
  let resizeBorder = 5;

  // Change cursor
  if (relativeX < resizeBorder && relativeY < resizeBorder) {
    this.attr('cursor', 'nw-resize');
  } else if (relativeX > shapeWidth - resizeBorder && relativeY < resizeBorder) {
    this.attr('cursor', 'ne-resize');
  } else if (relativeX > shapeWidth - resizeBorder && relativeY > shapeHeight - resizeBorder) {
    this.attr('cursor', 'se-resize');
  } else if (relativeX < resizeBorder && relativeY > shapeHeight - resizeBorder) {
    this.attr('cursor', 'sw-resize');
  } else if (relativeX < resizeBorder && relativeY < shapeHeight - resizeBorder) {
    this.attr('cursor', 'w-resize');
  } else if (relativeX > shapeWidth - resizeBorder && relativeY < shapeHeight - resizeBorder) {
    this.attr('cursor', 'e-resize');
  } else if (relativeX > resizeBorder && relativeY > shapeHeight - resizeBorder) {
    this.attr('cursor', 's-resize');
  } else if (relativeX > resizeBorder && relativeY < resizeBorder) {
    this.attr('cursor', 'n-resize');
  } else {
    this.attr('cursor', 'move');
  }
}
