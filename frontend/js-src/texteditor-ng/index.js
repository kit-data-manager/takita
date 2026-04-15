// internal modules
import { Mode } from '../common/mode';
import { enableTooltips, getTargetAnnotationId, getTargetFragment } from '../common/utils';
import { hooks } from './projectspecific';
import { initializeTextEditor } from './editor';
import { initializeSidebar } from './sidebar';
import { initializeAnnotationTable, textDisplayAnnotationFunction } from '../common/annotationTable';
import { initializeNavigation } from './navigation';
import { appendTEIDocument } from './textloader/textloader';
import { fetchText } from '../common/network';
import { drawAnnos } from './highlighting';
import { checkIsTargetCompatible, makeTargetsCompatible } from './utils';

window.textEditor = {
  initializeTextEditorComponent,
};

async function initializeTextEditorComponent(linkToResource, annotationsString, _thymeleafVariables) {
  // enable tooltips using bootstrap
  const $tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  enableTooltips($tooltipTriggerList);

  // initializing the state
  const annoJson = initializeState(annotationsString);

  // TODO: maybe the textEditor can be initilized after the text has loaded
  // as there is no need for the textEditor, if there is no text. Furthermore
  // textEditor.init() could then draw the annotations instead of the code
  // in the html template
  // initiliazing the editor
  initializeTextEditor(annoJson, hooks);

  // adding the TEI file to the DOM
  const $teiContatinerElement = document.getElementById('TEI');
  const xmlString = await fetchText(linkToResource);
  appendTEIDocument(xmlString, $teiContatinerElement, hooks);

  // highlight all the annotated words
  drawAnnos(annoJson);

  // initializing the sidebar
  const $sidebar = document.querySelector('.anno-side-bar');
  const $pagesDialog = document.getElementById('pages');
  const $tableContainer = document.getElementById('annotationTableBottomDiv');
  initializeSidebar($sidebar, $teiContatinerElement, $pagesDialog, $tableContainer, hooks);

  // Construct and display a navigation bar.
  const $navbarTop = document.getElementById('textNavBar');
  const $navbarLow = document.getElementById('textNavBarLow');
  const fragmentId = getTargetFragment(window.location);
  const annotationId = getTargetAnnotationId(window.location);
  await initializeNavigation($navbarTop, $navbarLow, $teiContatinerElement, fragmentId, annotationId, hooks);

  //initializing the annotation table
  const $annotationTable = document.getElementById('annotationTableBottom');
  initializeAnnotationTable(annoJson, $annotationTable, textDisplayAnnotationFunction, hooks);

  // initializes projectspecfic things by executing the hooks
  if (hooks.initializeProjectspecifics) {
    hooks.initializeProjectspecifics.forEach((hook) => hook());
  }
}

/**
 * called initially to create something like a "state" for the textEditor.
 * Attaching a couple of variables to the window object:
 * - stores the annotations of a page,
 * - declares the raphael paper object
 * - declares the varaible to store the currently selected annotation
 * - creates the mode class
 * - initiliazes the variable to storing the information, if text seelection is allowed.
 * TODO: This should be more thought out and imporived.
 */
function initializeState(annotationsString) {
  // setting the editortype, so the js-code can be executed based on that distinction
  window.EDITORTYPE = 'TEXT';

  window.ANNOJSON = createAnnoJson(annotationsString);
  // this is needed for annotationCard.js to work atm
  window.paper;

  // globalSelectedAnnotation stores the annotation, that gets
  // selected by right clicking on a highlighted word
  // it is needed to
  // - edit/update the target of that annotation
  // - cycle through multiple annotations on one target and select them
  // - (CRC1475: to add a mrw-annotation to a metaphor annotation)
  window.SELECTED_ANNOTATION;

  // TODO: check if the textEditor actualy needs a "Mode"
  // Philipp can only think that it is necessary for the "onmouseup"-event,
  // which is used for the text selection
  window.MODE_CLASS = Mode;

  // TODO: check if the textEditor needs a MODE and SELECTING_TEXT
  window.MODE = window.MODE_CLASS.View;
  window.SELECTING_TEXT = false;

  return window.ANNOJSON;
}

/**
 * Converts the String passed from the java-model via the thymeleaf template into a JSONObject.
 * It creates the data structure needed by the textEditor and converts the targets
 * into a compatible format.
 *
 * @param {String} annotationsString JSON string containing all annotations of a page
 * @returns {Object} containing all annotations of a page
 */
function createAnnoJson(annotationsString) {
  let annoJson = JSON.parse(annotationsString);
  // check if the annotations are compatible with the code, i.e. have
  // one xPath for each target and not one long xPath including all targets.
  // Make them compatible, if they are not
  annoJson = annoJson.map((annotation) => {
    if (!checkIsTargetCompatible(annotation)) {
      annotation.targets = makeTargetsCompatible(annotation);
    }
    return annotation;
  });
  return annoJson;
}
