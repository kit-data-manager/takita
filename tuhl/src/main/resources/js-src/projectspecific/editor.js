import { createTargetList, getContentOfSelection, reduceWhitespaceInString } from '../texteditor-ng/targetBuilding';
import { findSelectedMRWAnnos } from './annotationCreation';

/**
 * Set the window variable holding the mrw-annotations present in a users selection.
 * This is necessary for the creation of metaphor annotations as they can refer
 * to the mrw-annotation.
 *
 * @param {Selection} selection created by the user by selecting text
 * @param {[Object]} annoJson all annotations of a page
 */
export function setMRWAnnos(selection, annoJson) {
  // emptying the globalMrwAnnos array to only store the mrw
  // annotations present in the current selection
  // so they can be accessed in creation_templates_text.js to generate
  // a list of selected mrws inside a metaphor and link the mrw annotations
  // to the metaphor annotation
  window.MRW_ANNOS = [];
  let targetRangeList = createTargetList(selection);
  // this loop is necessary as firefox can have multiple target ranges
  targetRangeList.forEach((range) => {
    // to prevent duplicates in the globalMrwAnnos array, it has to be cleaned
    // after more mrw-annotations got included, which might be duplicates. This is needed, because
    // for some texts multiple ranges get created and then for each individual
    // range the globalMrwAnno array is appended, which can cause duplicates
    // https://medium.com/@rivoltafilippo/javascript-merge-arrays-without-duplicates-3fbd8f4881be
    // TODO: this can be improved by using a set. This will affect storeSelectedMRWAnnos() and
    // the points in the creation_templates_text.js where the globalMrwAnno array is used.
    const tmpMrwAnnos = window.MRW_ANNOS.concat(findSelectedMRWAnnos(annoJson, range.targetList));
    window.MRW_ANNOS = tmpMrwAnnos.filter((item, idx) => tmpMrwAnnos.indexOf(item) === idx);
  });
}

/**
 * Set the window variable holding the text selected by a user. This is necessary
 * for the creation of the body storing this text.
 *
 * @param {Selection} selection created by the user by selecting text
 */
export function setSelectedText(selection) {
  const selectionRangeContents = getContentOfSelection(selection);
  // set globalSelectedText so it can be displayed in the modal and remove all whitespaces
  window.SELECTED_TEXT = reduceWhitespaceInString(selectionRangeContents.textContent);
  console.log('GlobalSelectedText: ', window.SELECTED_TEXT);
}
