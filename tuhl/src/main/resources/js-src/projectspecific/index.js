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
// mandatory exports
export { targetUpdateCallback, POSSIBLE_DIVISION_TYPES, highlightAnnotationFunction, possibleHighlightClasses };
export { hooks } from './hooks';
export { formObjectCreateAnnotation, formObjectCreateBody } from './annotationCreation';
export { Variant } from './textloader';
export { getColorHexFromEnumEntry, getColorNameFromEnumEntry } from './utils';

// TODO: CUSTOMIZE to be the correct function for your project case
// - updateTargetData is the standard function to update a target, it will only update the target
// - updateTargetAndBodyData is the function used by CRC1475 to update the target and the body, which
//   stores the selected text (describing body)
const targetUpdateCallback = updateTargetAndBodyData;

// TODO: move "subchapter" to the second navigation level
const POSSIBLE_DIVISION_TYPES = ['chapter', 'section', 'subchapter'];

/**
 * TODO: CUSTOMIZE to be the correct function for your project case
 * - defaultHighlighting is the standard function to highlight all targets of an annotation. Each
 *   a target, will get the 'defaultHighlight' class assigned, which just adds a background color
 * - crc1475Highlighting is the function used by CRC1475 to highlight all targets of an annotation.
 *   It assigns classes responsible for background colors and underlinings for the different
 *   annotation types.
 */
const highlightAnnotationFunction = crc1475Highlighting;

// add the "defaulthighlighting" class to the project specific classes. The project specific classes
// get "fetched" by calling the getProjectSpecificClasses function, that can be customized
// (see the import statements).
const possibleHighlightClasses = ['defaulthighlight'].concat(getSpecificClasses());

export function initializeCRC1475Specifics() {
  // selectedText stores the selected test as a string
  // it is needed to add it to the annotations body
  window.SELECTED_TEXT;

  // mrwAnnos stores the mrws that are contained in a selection
  // it is needed to link mrw annotations with metaphor annotations
  window.MRW_ANNOS = [];
}
