/**
 * assign a color to an annotation based on custom logic.
 * Implement your logic here. You can access the complete annotation
 * and decide about the color based on that. For example you can use
 * the value of a body or the presence of a body with a specific purpose.
 *
 * @param {Object} annotation complete annotation
 */
export function assignColor(annotation) {
  // default color
  annotation.color = '#ff8d00';

  if (annotation.tags.length > 0) {
    annotation.color = '#00c7fe';
  }
  // annotations in the annoJson have textCards spelled with a lower case "c"
  if (annotation.textCards) {
    annotation.textCards.forEach((textCard) => {
      if (textCard.purpose) {
        switch (textCard.purpose) {
          case 'commenting':
            annotation.color = '#bdb51e';
            break;
          case 'classifying':
            annotation.color = '#b20000';
            break;
        }
      }
    });
  }
}
