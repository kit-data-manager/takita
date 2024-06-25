/**
 * Functions which are specific to a subproject or which provide
 * specialized functionality which is only needed for certain documents.
 *
 * @module projectSpecific
 */

// IMPORTS
// imports from outside the module
import { updateTargetData } from '../texteditor-ng/data';
import { defaultHighlighting } from '../texteditor-ng/highlighting';
// imports from inside the module
import { updateTargetAndBodyData } from './data';
import { crc1475Highlighting, getSpecificClasses } from './highlight';
// EXPORTS
// mandatory exports (optional exports can be found further down)
export { targetUpdateCallback, POSSIBLE_DIVISION_TYPES, highlightAnnotationFunction, possibleHighlightClasses };
export { hooks } from './hooks';
export { formObjectCreateAnnotation, formObjectCreateBody } from './annotationCreation';
export { headerFieldsArray, omitFieldsArray, editableFieldsArray } from './annotationCard';
export { Variant } from './textloader';
export { getColorHexFromEnumEntry, getColorNameFromEnumEntry } from './utils';

// TODO: CUSTOMIZE to be the correct function for your project case. The function is called
// when the buttons appended to the annotationCard are used to update the target of an annotation
// targetting text (common/annotationCard/annotationCard.js).
// - updateTargetData is the standard function to update a target, it will only update the target
// - updateTargetAndBodyData is the function used by CRC1475 to update the target and the body, which
//   stores the selected text (describing body)
const targetUpdateCallback = updateTargetAndBodyData;

// TODO: CUSTOMIZE the divisions used in the project for dividing texts into chapters, sections. etc.
// This is used by the navigation module.
// TODO: move "subchapter" to the second navigation level
const POSSIBLE_DIVISION_TYPES = ['chapter', 'section', 'subchapter'];

/**
 * TODO: CUSTOMIZE to be the correct function for your project case
 * - defaultHighlighting is the standard function to highlight all targets of an annotation. Each
 *   a target, will get the 'defaultHighlight' class assigned, which just adds a background color
 * - crc1475Highlighting is the function used by CRC1475 to highlight all targets of an annotation.
 *   It assigns classes responsible for background colors and underlinings for the different
 *   annotation types.
 * The function is called at "drawAnnos" in texteditor-ng/highlight/target.js.
 */
const highlightAnnotationFunction = crc1475Highlighting;

// add the "defaulthighlighting" class to the project specific classes. The project specific classes
// get "fetched" by calling the getProjectSpecificClasses function, that can be customized
// (see the import statements).
// This is used by the highlight module (texteditor-ng/highlight/target.js).
const possibleHighlightClasses = ['defaulthighlight'].concat(getSpecificClasses());

// optional exports
// add your things here
/**
 * Declares global variables
 */
export function initializeCRC1475Specifics() {
  // selectedText stores the selected test as a string
  // it is needed to add it to the annotations body
  window.SELECTED_TEXT;

  // mrwAnnos stores the mrws that are contained in a selection
  // it is needed to link mrw annotations with metaphor annotations
  window.MRW_ANNOS = [];
}
