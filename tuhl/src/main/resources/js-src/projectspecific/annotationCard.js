import { encodeAnnoId } from '../common/utils';
import { getMRWAnnoSelectedText } from './data';

// TODO: Cutsomize the following arrays. You can:
// - remove fields from the form entirely by removing them from "headerFields"
// (some are necessary though)
// - remove them from the display by adding them to "omitFields"
// - make certain fields in the horizontal view read-only
export const headerFieldsArray = ['created', 'creators', 'modified', 'generator', 'motivation', 'target', 'via'];
export const omitFieldsArray = ['type', 'selector', 'fullJson', 'annotationId', 'motivation', 'created'];
// fields (bodies with purposes listed here) that can be edited in the horizontal view
export const editableFieldsArray = ['tagging', 'commenting', 'identifying', 'classifying'];

// mandatory function

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
    case 'tagging':
      title = 'Tag: ';
      break;
    case 'linking':
      title = 'Linked mrw-annotation: ';
      break;
    case 'classifying':
      title = 'Classification: ';
      break;
    case 'describing':
      title = 'Selected text: ';
      break;
    case 'identifying':
      title = 'Label: ';
      break;
    case 'assessing':
      title = 'Analysis: ';
      break;
    case 'commenting':
      title = 'Comment: ';
      break;
    default:
      title = purpose + ': ';
  }

  return title;
}

// hooks
/**
 *
 * @param {Object} annotationData the annotation as JSON
 * @param {Element} $annotationDiv the div holding the annotation card
 * @returns {Element} $annotationDiv the div holding the annotation card, with an appended link
 */
export function addLinkToAnalysisTool(annotationData, $annotationDiv) {
  // adding link to the analysis tool, if
  // the annotation is a metaphor annotation
  if (annotationData.color === 'METAPHOR') {
    const $buttonToAnalysisTool = document.createElement('input');
    $buttonToAnalysisTool.classList.add('btn');
    $buttonToAnalysisTool.classList.add('btn-primary');
    $buttonToAnalysisTool.type = 'submit';
    $buttonToAnalysisTool.value = 'Analyze';
    $buttonToAnalysisTool.id = 'buttonToAnalysisTool';
    $buttonToAnalysisTool.disabled = true;

    const $linkToAnalysisTool = document.createElement('a');
    $linkToAnalysisTool.href = window.CONTEXTPATH + 'analysis/' + encodeAnnoId(annotationData.id);
    $linkToAnalysisTool.target = '_blank';
    $linkToAnalysisTool.rel = 'noreferrer noopener';
    $linkToAnalysisTool.append($buttonToAnalysisTool);

    $annotationDiv.append($linkToAnalysisTool);

    // enable the link, if no mrw-annotation is linked
    // to the metaphor annotation
    if (annotationData.textCards.some((textCard) => textCard.purpose === 'linking')) {
      $buttonToAnalysisTool.disabled = false;
    }
  }
  return $annotationDiv;
}

/**
 * Replaces the value of the body, which is an URI of an annotation, with the
 * selected text of that annotation
 *
 * @param {String} annoId single encoded id of the annotation
 * @param {Object} resourceHorizontal the body, that will get its value changed, if it is a linked
 * mrw-annotation
 * @returns {Object} resourceHorizontal (the body) with the new value
 */
export async function updateLinkingTextcard(annoId, resourceHorizontal) {
  if (resourceHorizontal.purpose === 'linking') {
    resourceHorizontal.value = await getMRWAnnoSelectedText(resourceHorizontal.value);
  }
  return resourceHorizontal;
}
