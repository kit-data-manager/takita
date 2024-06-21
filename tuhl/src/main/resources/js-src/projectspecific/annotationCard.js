import { getMRWAnnoSelectedText } from './data/annotations';

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

export async function updateLinkingTextcard(annoId, resourceHorizontal) {
  if (resourceHorizontal.purpose === 'linking') {
    resourceHorizontal.value = await getMRWAnnoSelectedText(annoId, resourceHorizontal.value);
  }
  return resourceHorizontal;
}
