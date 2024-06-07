export { addLinkToAnalysisTool, updateLinkingTextcard } from './crc1475';
export { hooks } from './hooks';

export function init() {
  // selectedText stores the selected test as a string
  // it is needed to add it to the annotations body
  window.SELECTED_TEXT;

  // mrwAnnos stores the mrws that are contained in a selection
  // it is needed to link mrw annotations with metaphor annotations
  window.MRW_ANNOS = [];
}
