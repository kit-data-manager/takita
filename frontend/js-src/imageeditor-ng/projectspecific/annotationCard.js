// TODO: Cutsomize the following arrays. You can:
// - remove fields from the form entirely by removing them from "headerFields"
// (some are necessary though)
// - remove them from the display by adding them to "omitFields"
// - make certain fields in the horizontal view read-only
export const headerFieldsArray = ['created', 'creators', 'modified', 'generator', 'motivation', 'target', 'via'];
export const omitFieldsArray = ['type', 'selector', 'fullJson', 'annotationId', 'motivation', 'created'];
// fields (bodies with purposes listed here) that can be edited in the horizontal view
export const editableFieldsArray = ['commenting', 'classifying'];

/**
 * TODO: CUSTOMISE the label for the text to be displayed on the "quick-view" of the annotationCard.
 * By default the purpose of the body will be displayed as a label, but you can change the label based
 * on the purpose.
 *
 * @param {String} purpose of a body
 * @returns {String} to be displayed instead of the purpose as a label in the horizontal annotationCard
 */
export function changeLabel(purpose) {
  let title;

  switch (purpose) {
    case 'classifying':
      title = 'Classification: ';
      break;
    case 'tagging':
      title = 'Tag: ';
      break;
    default:
      title = purpose + ': ';
  }

  return title;
}

// hooks
