import { encodeAnnoId } from '../../common/utils';

// gets the describing body of an annotation (mrw-annotation)
// used by src/main/resources/js-src/common/annotationDisplay/selection.js
async function getMRWAnnoSelectedText(annoId) {
  console.log('Trying to get annotation ', annoId, ' which is linked to ', globalSelectedAnnotation);
  const response = await fetch(window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(annoId), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    const mrwAnno = await response.json();
    const describingBody = mrwAnno.textCards.filter((textCard) => textCard.purpose === 'describing')[0];
    return describingBody.value;
  } else {
    // if the mrw-annotation linked to the metaphor-annotation got deleted the code will end up here
    return 'ERROR: Something is wrong with the linked mrw-annotation; most likely it got deleted, please contact the developers.';
  }
}

export function addLinkToAnalysisTool(responseJson, annoId, annotationDiv) {
  // adding link to the analysis tool, if
  // the annotation is a metaphor annotation
  if (responseJson.color === 'METAPHOR') {
    var buttonToAnalysisTool = document.createElement('input');
    buttonToAnalysisTool.classList.add('btn');
    buttonToAnalysisTool.classList.add('btn-primary');
    buttonToAnalysisTool.type = 'submit';
    buttonToAnalysisTool.value = 'Analyze';
    buttonToAnalysisTool.id = 'buttonToAnalysisTool';
    buttonToAnalysisTool.disabled = true;

    var linkToAnalysisTool = document.createElement('a');
    linkToAnalysisTool.href = window.CONTEXTPATH + 'analysis/' + annoId;
    linkToAnalysisTool.target = '_blank';
    linkToAnalysisTool.rel = 'noreferrer noopener';
    linkToAnalysisTool.append(buttonToAnalysisTool);

    annotationDiv.append(linkToAnalysisTool);

    // enable the link, if no mrw-annotation is linked
    // to the metaphor annotation
    if (responseJson.textCards.some((textCard) => textCard.purpose === 'linking')) {
      console.log('link');
      document.getElementById('buttonToAnalysisTool').disabled = false;
    }
  }
}

export async function updateLinkingTextcard(resourceHorizontal) {
  if (resourceHorizontal.purpose === 'linking') {
    resourceHorizontal.value = await getMRWAnnoSelectedText(resourceHorizontal.value);
  }
  return resourceHorizontal;
}
