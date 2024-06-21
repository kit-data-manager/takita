import { encodeAnnoId } from '../common/utils';
import { getMRWAnnoSelectedText } from './data';

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
    var buttonToAnalysisTool = document.createElement('input');
    buttonToAnalysisTool.classList.add('btn');
    buttonToAnalysisTool.classList.add('btn-primary');
    buttonToAnalysisTool.type = 'submit';
    buttonToAnalysisTool.value = 'Analyze';
    buttonToAnalysisTool.id = 'buttonToAnalysisTool';
    buttonToAnalysisTool.disabled = true;

    var linkToAnalysisTool = document.createElement('a');
    linkToAnalysisTool.href = window.CONTEXTPATH + 'analysis/' + encodeAnnoId(annotationData.id);
    linkToAnalysisTool.target = '_blank';
    linkToAnalysisTool.rel = 'noreferrer noopener';
    linkToAnalysisTool.append(buttonToAnalysisTool);

    $annotationDiv.append(linkToAnalysisTool);

    // enable the link, if no mrw-annotation is linked
    // to the metaphor annotation
    if (annotationData.textCards.some((textCard) => textCard.purpose === 'linking')) {
      document.getElementById('buttonToAnalysisTool').disabled = false;
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
