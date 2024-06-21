import { getContentOfSelection, removeWhitespaceFromSelectionTextContent } from '../texteditor-ng/targetBuilding/utils';
import { createTargetList } from '../texteditor-ng/targetBuilding/targetCreation';
import { getMRWAnnoSelectedText } from './data';
import { sanskritSpecificButton, hebrewSpecificButton } from './sidebar';
import { Variant } from './textloader';
import { findSelectedMRWAnnos } from './annotationCreation';
import { addLinkToAnalysisTool, updateLinkingTextcard } from './annotationCard';
import { initializeCRC1475Specifics } from '.';

/**
 * add functions to the hook. The API definition can be found below
 */
export const hooks = {
  initializeProjectspecifics: [initializeCRC1475Specifics],
  postSidebarCreation: [enableLanguageViewToggleButton],
  preMakeHTML: [],
  postApplyStyles: [applyStylesB03, applyStylesB04],
  postTargetCreation: [setMRWAnnos, setSelectedText],
  manipulatingData: [],
  preAppendingBodies: [],
  postAppendingBodies: [addLinkToAnalysisTool],
  preHorizontalBodyCardCreation: [updateLinkingTextcard],
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

/**
 * Set the window variable holding the mrw-annotations present in a users selection.
 * This is necessary for the creation of metaphor annotations as they can refer
 * to the mrw-annotation.
 *
 * @param {Selection} selection created by the user by selecting text
 * @param {[Object]} annoJson all annotations of a page
 */
function setMRWAnnos(selection, annoJson) {
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
function setSelectedText(selection) {
  const selectionRangeContents = getContentOfSelection(selection);
  // set globalSelectedText so it can be displayed in the modal and remove all whitespaces
  window.SELECTED_TEXT = removeWhitespaceFromSelectionTextContent(selectionRangeContents.textContent);
  console.log('GlobalSelectedText: ', window.SELECTED_TEXT);
}

/**
 * adds a css-class to render punctuation for and removes whitespace from Sanskrit texts
 *
 * @param {Element} $processedHTML the xml file converted by CETEIcean into HTML
 * @param {String} language of the text
 * @returns {Element} modified $processedHTML
 */
export function applyStylesB04($processedHTML, language) {
  // B04 sanskrit specific:
  // adding of a syllable marker between the unsandhied words
  if ($processedHTML.querySelector('tei-choice') != undefined) {
    if (language === 'sa-Latn' || $processedHTML.querySelector('tei-choice').n === 'sandhi') {
      let regW = $processedHTML.querySelectorAll('tei-reg>tei-w');
      regW.forEach((word) => {
        if (word.nextElementSibling !== null) {
          // delete whitespace between the tei-reg>tei-w elements
          if (word.nextSibling.nodeType == 3 && word.nextSibling.nodeValue.trim() === '') {
            word.nextSibling.remove();
          }
          word.classList.add('sandhiSyllableMarkerAfter');
        }
      });
    }
  }
  return $processedHTML;
}

/**
 * adds a css-class to render punctuation for Hebrew texts
 *
 * @param {Element} $processedHTML the xml file converted by CETEIcean into HTML
 * @param {String} language of the text
 * @returns {Element} modified $processedHTML
 */
export function applyStylesB03($processedHTML, language) {
  /**
   * Please NOTE: this test currently does not work!
   */
  // B03 hebrew specific:
  // the "paseq" sign "׀" will be removed, but it needs to be displayed
  // so any word followed by a "paseq" will get a class "paseq", so the css rule applies
  // TODO: orig should have thepaseq class, if choice is followed by the symbol
  if (language === 'hbo') {
    /*$text.querySelectorAll('tei-w').forEach((word) => {
      if (!word.id.includes('_')) {
        //if (word.nextElementSibling !== null && word.nextElementSibling.localName === "tei-pc"){
        /*if (word.nextElementSibling !== null && word.nextElementSibling.innerHTML === "־"){
                  word.classList.add("maqqef");
              }*/ /*
        if (word.nextElementSibling !== null && word.nextElementSibling.innerHTML === '׀') {
          word.classList.add('paseq');
        }
      }
    });*/
    // delete all the "paseq" signs as they will be rendered via css
    $processedHTML.querySelectorAll('tei-pc').forEach((punct) => {
      // if (punct.innerHTML === "־" || punct.innerHTML === "׀"){
      if (punct.innerHTML === '׀') {
        punct.classList.add('paseq');
        punct.innerHTML = '';
      }
    });
  }

  return $processedHTML;
}

function enableLanguageViewToggleButton($sidebar, variant) {
  /**
   * Set up project/language specific buttons and their callbacks.
   */
  if (variant === Variant.B04) {
    /* Sanskrit / B04 specific */
    sanskritSpecificButton($sidebar);
  } else if (variant === Variant.Hebrew) {
    /* Hebrew specific */
    hebrewSpecificButton($sidebar);
  }
}
