/* eslint-disable no-unused-vars */
import { enableLanguageViewToggleButton } from './sidebar';

/**
 * add functions to the hook. The API definition can be found below
 */
export const hooks = {
  initializeProjectspecifics: [],
  preMakeHTML: [],
  postApplyStyles: [],
  postSidebarCreation: [enableLanguageViewToggleButton],
  postTargetCreation: [],
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
 * called at texteditor-ng/index.js (initializeTextEditorComponent()) with no parameters/return value.
 * Can be called to initiliaze window.variables etc.
 */
function initializeProjectspecifics() {}

// SIDEBAR
/**
 * called at texteditor-ng/sidebar/sidebar.js (initializeSidebar()).
 * Can be used to manipulate the sidebar (eg. adding/removing buttons).
 *
 * @param {Element} $sidebar the sidebar
 * @param {Class} variant specifies if the current text document has special requirements. The
 * class definition can be found in projectspecific/textloader.js
 */
function postSidebarCreation($sidebar, variant) {}

// TEXTLOADER
/**
 * called at texteditor-ng/textloader/textloader.js (prepareTEIDocument())
 * Can be used to change the contents of the xml file (text) BEFORE being
 * passed to CETEIcean, which will convert the file (text) to custom HTML-elements.
 *
 * @param {String} xmlString the xml file to be added to the DOM
 * @returns {String} newXmlString changed xml file to be added to the DOM
 */
function preMakeHTML(xmlString) {
  let newXmlString;
  // do stuff
  return newXmlString;
}

/**
 * called at texteditor-ng/textloader/textloader.js (applyStyles())
 * Can be used to change the text AFTER CETEIcean converted it, but BEFORE it gets
 * added to the DOM.
 *
 * @param {Element} $processedHTML the element containing the TEI-xml
 * @param {String} language the language of the text
 * @returns $newProcessedHTML the element containing the cahnged TEI-xml
 */
function postApplyStyles($processedHTML, language) {
  let $newProcessedHTML;
  // do stuff
  return $newProcessedHTML;
}

// TEXTEDITOR
/**
 * called at texteditor-ng/editor/editor.js (annotateSelectedText())
 * Can be used to store information from the selection in window.variables, which can then be used
 * in the creation templates/during the annotation creation procedure.
 *
 * @param {Selection} selection the selection cerated by the user
 * @param {JSONArray} annoJson contains all the annotation of the pages as JSONObjects
 */
function postTargetCreation(selection, annoJson) {}

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
 * @param {Element} $annotationDiv holding the annotationCard
 */
function postAnnotationCardCreation($annotationDiv) {}

/**
 * called at common/annotationCard/annotationCard.js (createAnnotationDiv())
 * Can be used to change to influence the look and behavior of the annotationCard BEFORE
 * the cards for each body gets appended. You can interact with the finished element/the
 * DOM directly.
 * @Laura add the copy button here
 *
 * @param {Element} $annotationDiv holding the annotationCard
 */
function preAppendingBodies($annotationDiv) {}

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
  let $newAnnotationDiv;
  // do stuff
  return $newAnnotationDiv;
}

/**
 * called at common/annotationCard/annotationCard.js (createAndAppendBodyForms())
 * Can be used to change the data of an individual body passed to the horizontal bodyCard creation
 * and therefore influence the displayed values of the horizontal bodyCard PRIOR to its creation.
 *
 * @param {String} annotationId id of the annotation
 * @param {Object} body the body as JSON
 * @returns {Object} modifiedBody manipulated/changed body
 */
async function preHorizontalBodyCardCreation(annotationId, body) {
  let modifiedBody;
  // do stuff. This can be asynchronous as well.
  return modifiedBody;
}
// ------ HOOK API DEFINITION END ------
