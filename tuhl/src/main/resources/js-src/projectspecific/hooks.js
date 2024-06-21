import { getContentOfSelection, removeWhitespaceFromSelectionTextContent } from '../texteditor-ng/targetBuilding/utils';
import { createTargetList } from '../texteditor-ng/targetBuilding/targetCreation';
import { getMRWAnnoSelectedText } from './data';
import { sanskritSpecificButton, hebrewSpecificButton } from './sidebar';
import { Variant } from './textloader';
import { findSelectedMRWAnnos } from './annotationCreation';
import { addLinkToAnalysisTool } from '.';
import { initializeProjectspecifics } from '.';

/**
 * available hooks for various modules are:
 *
 * - projectspecific/index: initializeProjectspecifics
 * - common/annotationCard: preAppendingBodies, postAppendingBodies, preHorizontalBodyCardCreation,
 * postAnnotationCardCreation, manipulatingData
 * - texteditor/textloader: preMakeHTML, postApplyStyles
 * - texteditor/editor: postTargetCreation
 */
export const hooks = {
  initializeProjectspecifics: [initializeProjectspecifics],
  postSidebarCreation: [enableLanguageViewToggleButton],
  manipulatingData: [],
  preAppendingBodies: [],
  postAppendingBodies: [addLinkToAnalysisTool],
  preHorizontalBodyCardCreation: [getLinkingAnno],
  postAnnotationCardCreation: [],
  preMakeHTML: [],
  postApplyStyles: [applyStylesB03, applyStylesB04],
  postTargetCreation: [setMRWAnnos, setSelectedText],
};

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

/**
 * Replaces the value of the body, which is an URI of an annotation, with the
 * selected text of that annotation
 *
 * @param {String} annoId single encoded id of the annotation
 * @param {Object} body that will get its value changed, if it is a linked
 * mrw-annotation
 * @returns {Object} body with the new value
 */
async function getLinkingAnno(annoId, body) {
  if (body.purpose === 'linking') {
    body.value = await getMRWAnnoSelectedText(annoId, body.value);
  }
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
