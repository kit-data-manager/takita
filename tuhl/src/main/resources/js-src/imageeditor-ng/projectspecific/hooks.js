/* eslint-disable no-unused-vars */
import { enableLanguageViewToggleButton } from './sidebar';

/**
 * add functions to the respective array (eg. postSidebarCreation: [enableLanguageViewToggleButton]).
 * The API definition can be found below
 */
export const hooks = {
  initializeProjectspecifics: [],
  postSidebarCreation: [],
  preAnnotationTableCreation: [],
  manipulatingData: [],
  postAnnotationCreation: [],
  preAppendingBodies: [],
  postAppendingBodies: [],
  preHorizontalBodyCardCreation: [],
  postAnnotationCardCreation: [],
};

// ------ HOOK API DEFINITION START ------
/* You can find the documentation for the individual hooks here as empty functions. These
   empty functions act as dummies, but mirror how they are called and their return values.
   Furthermore the location, where they are called is given.
 */

/**
 * called at imageeditor-ng/index.js (initializeTextEditorComponent()) with no parameters/return value.
 * Can be called to initiliaze window.variables etc.
 */
function initializeProjectspecifics() {}

// SIDEBAR
/**
 * called at imageeditor-ng/sidebar/sidebar.js (initializeSidebar()).
 * Can be used to manipulate the sidebar (eg. adding/removing buttons).
 *
 * @param {Element} $sidebar the sidebar
 * @param {Class} variant specifies if the current text document has special requirements. The
 * class definition can be found in projectspecific/textloader.js
 */
function postSidebarCreation($sidebar, variant) {}

// ANNOTATIONTABLE (in the editor)
/**
 * called at common/annotationTable/annotationTable.js (initializeAnnotationTable()).
 * Can be used to modify the data and column definitions passed to tabulator to
 * create the table of annotations displayed at the bottom of the screen after
 * clicking on the "Show Annotations" button in the sidebar.
 *
 * @param {JSONArray} tableData the data to be put into the table
 * @param {JSONArray} columns the column definitions of the table
 * @returns {[JSONArray, JSONArray]} the modified [tableData, columns]
 */
function preAnnotationTableCreation(tableData, columns) {
  // do stuff
  return [tableData, columns];
}

// ANNOTATIONCREATION
/**
 * called at common/annotationCreation/annotationCreation.js (createAnnotation())
 * Can be used to interact with the DOM after annotation creation. THe image editor
 * might use this to store the annotation ID within the corresponding shape.
 *
 * @param {Object} newAnnotation the newly created annotation fetched from tAkita core
 */
function postAnnotationCreation(newAnnotation) {}

// ANNOTATIONCARD
/**
 * called at common/annotationCard/annotationCard.js (selectAnnotation())
 * Can be used to change the annotation data passed to the annotationCard creation and therefore
 * influence the look and behavior of the annotationCard as a whole PRIOR its creation.
 *
 * @param {Object} annotationData holding all the data for an annotation fetched from tAkita core
 * @returns {Object} newAnnotationData manipulated/changed annotation data
 */
function manipulatingData(annotationData) {
  let newAnnotationData;
  // do stuff
  return newAnnotationData;
}

/**
 * called at common/annotationCard/annotationCard.js (selectAnnotation())
 * Can be used to change to influence the look and behavior of the annotationCard as a whole
 * AFTER its creation. You can interact with the finished element/the DOM directly.
 *
 * @param {Object} annotationData holding all the data for an annotation fetched from tAkita core
 * @param {Element} $annotationDiv holding the annotationCard
 * @returns {Element} $newAnnotationDiv modified div holding the annotationCard
 */
function postAnnotationCardCreation(annotationData, $annotationDiv) {
  // do stuff
  return $annotationDiv;
}

/**
 * called at common/annotationCard/annotationCard.js (createAnnotationDiv())
 * Can be used to change to influence the look and behavior of the annotationCard BEFORE
 * the cards for each body gets appended. You can interact with the finished element/the
 * DOM directly.
 *
 * @param {Object} annotationData the annotation as JSON
 * @param {Element} $annotationDiv holding the annotationCard
 * @returns {Element} $newAnnotationDiv modified div holding the annotationCard
 */
function preAppendingBodies(annotationData, $annotationDiv) {
  // do stuff
  return $annotationDiv;
}

/**
 * called at common/annotationCard/annotationCard.js (createAnnotationDiv())
 * Can be used to change to influence the look and behavior of the annotationCard AFTER
 * the cards for each body gets appended. You can interact with the finished element/the
 * DOM directly.
 *
 * @param {Object} annotationData the annotation as JSON
 * @param {Element} $annotationDiv holding the annotationCard
 * @returns {Element} $newAnnotationDiv modified div holding the annotationCard
 */
function postAppendingBodies(annotationData, $annotationDiv) {
  // do stuff
  return $annotationDiv;
}

/**
 * called at common/annotationCard/annotationCard.js (createAndAppendBodyForms())
 * Can be used to change the various configuration objects and/or the data of an individual
 * body passed to the horizontal bodyCard creation and therefore influence the display and/or
 * the displayed values of the horizontal bodyCard PRIOR to its creation.
 *
 * @param {String} annotationId id of the annotation
 * @param {String} operationHorizontal the operation type of the form
 * @param {Object} formBodyDataModelHorizontal the dataModel used by JSONForms
 * @param {Object} uiFormHorizontal the uiForm used by JSONForms
 * @param {Object} body the body as JSON
 * @returns {[Object]} holding the manipulated inputs
 * - operationHorizontal
 * - formBodyDataModelHorizontal
 * - uiFormHorizontal
 * - modifiedBody manipulated/changed body
 * NOTE: all implementations for this hook take the same input, they must always return all four
 * objects. If one object is not modified just return it anyways as the code calling the hook
 * will not function properly otherwise.
 */
async function preHorizontalBodyCardCreation(
  operationHorizontal,
  formBodyDataModelHorizontal,
  uiFormHorizontal,
  annotationId,
  body,
) {
  let modifiedBody;
  // do stuff. This can be asynchronous as well.
  return [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal, modifiedBody];
}
// ------ HOOK API DEFINITION END ------
