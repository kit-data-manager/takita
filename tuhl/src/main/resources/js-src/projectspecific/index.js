/**
 * Functions which are specific to a subproject or which provide
 * specialized functionality which is only needed for certain documents.
 *
 * @module projectSpecific
 */

// IMPORTS
// imports from outside the module. Don't touch these.
// The imports for updateTargetData and defaultHighlighting have to stay like this. You
// can not use indirection with these imports (ie. importing the functions from the
// index.js of the module) without breaking the tests
// eslint-disable-next-line no-unused-vars
import { updateTargetData } from '../texteditor-ng/data/annotations';
// eslint-disable-next-line no-unused-vars
import { defaultHighlighting } from '../texteditor-ng/highlighting/target';
// END of imports form outside the module

// imports from inside the module. Change these accordingly
import { getSpecificClasses } from './highlight';

// EXPORTS
// mandatory exports (optional exports can be found further down)
export { targetUpdateCallback, POSSIBLE_DIVISION_TYPES, highlightAnnotationFunction, possibleHighlightClasses };
export { hooks } from './hooks';
export { formObjectCreateAnnotation, formObjectCreateBody } from './annotationCreation';
export { headerFieldsArray, omitFieldsArray, editableFieldsArray } from './annotationCard';
export { Variant } from './textloader';
export { getColorHexFromEnumEntry, getColorNameFromEnumEntry } from './utils';

// TODO: CUSTOMISE to be the correct function for your project case. The function is called
// when the buttons appended to the annotationCard are used to update the target of an annotation
// targetting text (common/annotationCard/annotationCard.js).
// - updateTargetData is the standard function to update a target, it will only update the target
// - updateTargetAndBodyData is the function used by CRC1475 to update the target and the body, which
//   stores the selected text (describing body)
const targetUpdateCallback = updateTargetData;

// TODO: CUSTOMISE the divisions used in the project for dividing texts into chapters, sections. etc.
// This is used by the navigation module. Currently a two-level navigation is possible, i.e. you
// can navigate chapters and subchapters, if available.
// NOTE: this has to be a json-object, so that it can be mocked by jest for testing
const POSSIBLE_DIVISION_TYPES = {
  top: ['chapter', 'section', 'book'],
  low: ['chapter', 'subchapter', 'section', 'subsection'],
};

/**
 * TODO: CUSTOMISE to be the correct function for your project case
 * - defaultHighlighting is the standard function to highlight all targets of an annotation. Each
 *   a target, will get the 'defaultHighlight' class assigned, which just adds a background color
 * - crc1475Highlighting is the function used by CRC1475 to highlight all targets of an annotation.
 *   It assigns classes responsible for background colors and underlinings for the different
 *   annotation types.
 * The function is called at "drawAnnos" in texteditor-ng/highlight/target.js.
 */
const highlightAnnotationFunction = defaultHighlighting;

// add the "defaulthighlighting" class to the project specific classes. The project specific classes
// get "fetched" by calling the getProjectSpecificClasses function, that can be customized
// (see the import statements). So leave this array untouched
// This is used by the highlight module (texteditor-ng/highlight/target.js).
const possibleHighlightClasses = ['defaulthighlight'].concat(getSpecificClasses());

// optional exports
// add your things here
