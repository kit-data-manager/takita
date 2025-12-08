/**
 * Functions which are specific to a subproject or which provide
 * specialized functionality which is only needed for certain documents.
 *
 * @module projectSpecific
 */

// eslint-disable-next-line no-unused-vars
import { defaultHighlighting } from '../highlighting/target';
// END of imports form outside the module

// imports from inside the module. Change these accordingly
import { getSpecificClasses } from './highlight';

// EXPORTS
// mandatory exports (optional exports can be found further down)
export { POSSIBLE_DIVISION_TYPES, highlightAnnotationFunction, possibleHighlightClasses };
export { hooks } from './hooks';
export { headerFieldsArray, omitFieldsArray, editableFieldsArray } from './annotationCard';
export { Variant } from './textloader';
export { getColorHexFromEnumEntry, getColorNameFromEnumEntry } from './utils';

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
