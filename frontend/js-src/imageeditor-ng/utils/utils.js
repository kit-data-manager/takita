// toggling the visibility of the Raphael shape on the canvas
export function toggleShapeVisibility(shape) {
  if (shape.isVisible()) {
    shape.hide();
  } else {
    shape.show();
  }
}

// returns relative coordinates to the upper left corner of the image
// also includes scrolling offsets
// ToDo: check browser compatibility!
export function getRelativeCoordinates(x, y) {
  let image = document.getElementById('pageImage');

  let relativeX = x - image.getBoundingClientRect().left - window.pageXOffset;
  let relativeY = y - image.getBoundingClientRect().top - window.pageYOffset;

  let styleLeft = parseInt(image.style.left);
  let styleTop = parseInt(image.style.top);

  // only adding the offset if a shape is created
  // otherwise the image flies out of bounds while moving
  if (!isNaN(styleLeft) && (window.addingRectangle || window.addingPolygon)) {
    relativeX = relativeX + styleLeft;
  }
  if (!isNaN(styleTop) && (window.addingRectangle || window.addingPolygon)) {
    relativeY = relativeY + styleTop;
  }

  return [relativeX, relativeY];
}
