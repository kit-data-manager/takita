import { toggleShapeSelect } from './target';

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
