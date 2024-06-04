import { toggleButtonState } from '../../common/utils';
import { createTargetString } from './targetCreation';
let checkIsNodeOnWorkspace,
  getContentOfSelection,
  createTargetList,
  createXPath,
  removeWhitespaceFromSelectionTextContent,
  checkIsTargetCompatible,
  makeTargetsCompatible,
  updateDisplay,
  selectAnnotation,
  encodeAnnoId;

// eventHandlers for buttons
/**
 * function called by an eventHandler attached to `document.getElementById('buttonModifySelection')`
 * to start the process of updating the target of an annotation. It mainly enables the buttons
 * to start the saving process or to cancel the modification and changes the MODE.
 *
 * @param {*} _event
 * @param {JSONObject} annotation the curretnly selected annotation, which will have its target updated
 * @returns a boolean (false), if no annotation is selected by a user and the function
 * needs to be stopped early
 */
export function modifySelection(_event, annotation) {
  //document.getElementById('modifyButton').parentElement.classList.add('active');
  if (annotation === undefined) {
    //document.getElementById('modifyButton').parentElement.classList.remove('active');
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
    return false;
  }
  console.log('Selected annotation: ', annotation);
  window.SELECTING_TEXT = true;
  window.MODE = window.MODE_CLASS.Modify;
  // disable/enable and hide/show the buttons connected
  // to the modifaction of a text selection
  const $buttonModifySelection = document.getElementById('buttonModifySelection');
  const $buttonSaveModification = document.getElementById('buttonSaveModification');
  const $buttonCancelModification = document.getElementById('buttonCancelModification');

  // hiding and disabling $buttonModifySelectionm showing and enabling the other two
  toggleButtonState($buttonModifySelection);
  toggleButtonState($buttonSaveModification);
  toggleButtonState($buttonCancelModification);
}

/**
 * function called by an eventHandler attached to `document.getElementById('buttonSaveModification')`
 * to get store the new/old selected text and create the new Xpath during the process of updating
 * the target of an annotation
 *
 * @param {Event} _event
 * @param {Selection} selection the selection created by a user
 * @param {JSONObject} annotation the curretnly selected annotation, which will have its target updated
 */
export function saveModification(_event, selection, annotation) {
  // create new xPath
  const newXPath = createTargetString(selection);

  // newXPath will be an empty string/a "falsy" variable, if the target could
  // not be created and therefore this saveModification function will return
  if (newXPath) {
    // store the selected text
    const oldSelectedText = getOldSelectedText(annotation);
    const selectionRangeContents = getContentOfSelection(selection);
    const newSelectedText = removeWhitespaceFromSelectionTextContent(selectionRangeContents.textContent);

    // ask user if the new selection should be saved in a modal
    // create and show the modal used to save the new target
    const modal = document.getElementById('updateSelection');
    showSaveTargetModal(modal, oldSelectedText, newSelectedText, newXPath);
  } else {
    return;
  }
}

/**
 * Update a target, hide the modal shown for target update, reselect the annotation
 * to update the textCard and update the display. Function called by an eventHandler attached
 * to `document.getElementById('updateTargetButton')`
 *
 * @param {event} _event
 * @param {Function} targetUpdateCallback the callback to be executed. It is either updateTargetAndBodyData
 * or updateTargetData.
 * @param {JSONObject} annotation the curretnly selected annotation, which will have its target updated
 * @param {String} targetXPath the new xPath
 * @param {String} newSelectedText the new selected text
 * @returns {Boolean} true, if the body was succesfully updated, false, if the update failed
 */
export async function updateTarget(_event, targetUpdateCallback, annotation, targetXPath, newSelectedText) {
  // update the target (and body depending on the callback)
  let targetUpdated = false;
  try {
    // update the target (and body depending on the callback)
    const response = await targetUpdateCallback(annotation, targetXPath, newSelectedText);
    targetUpdated = true;

    // hide modal
    document.getElementById('updateSelection').classList.toggle('show-modal');
    //document.getElementById('modifyButton').parentElement.classList.remove('active');
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;

    // show the updated annotation
    selectAnnotation(null, encodeAnnoId(annotation.id));

    // updating the display for text annotation
    // checking if TEI-element is null. it is defined for text annotation,
    // but not for image annotation
    if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
      // redraw
      updateDisplay();
    }
  } catch (exception) {
    console.error(exception);
  }
  return targetUpdated;
}

/**
 * function called by an eventHandler attached to `document.getElementById('cancelnModifySelection')`
 * to cancel the process of updating the target of an annotation. It mainly disables/hides the buttons
 * to start the saving process and cancel the the modification; it shows the buttons to modify
 * a target.
 */
export function cancelModification() {
  // disable/enable and hiding/showing the buttons connected
  // to the modifaction of a text selection
  const $buttonModifySelection = document.getElementById('buttonModifySelection');
  const $buttonSaveModification = document.getElementById('buttonSaveModification');
  const $buttonCancelModification = document.getElementById('buttonCancelModification');

  // showing and enabling $buttonModifySelection, hiding and disabling the other two
  toggleButtonState($buttonModifySelection);
  toggleButtonState($buttonSaveModification);
  toggleButtonState($buttonCancelModification);

  // setting the MODEs
  window.MODE = window.MODE_CLASS.View;
  window.SELECTING_TEXT = false;
}

// utils
/**
 * get the xPath from a user selection
 *
 * @param {Selection} selection the text selected by the user as a selection object
 * @returns {String} the new xPath of the selection
 */
function getNewXPath(selection) {
  // let selectionRange = window.getSelection().getRangeAt(0);
  const selectionRangeContents = getContentOfSelection(selection);
  // stop the function, if the selection does not contain any text, only whitespace
  if (selectionRangeContents.textContent.trim() == '') {
    console.log('No text selected, therefore early return.');
    // TODO: check if this causes problems. It might prevent users from saving
    // their updated selection, if the selected whitespace once
    // document.getElementById('modifyButton').parentElement.classList.remove('active');
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
    alert('No text selected. Please redo');
    return false;
  }

  // targetRangeList holds all the nodes from the selection, that are <w> elements
  let targetRangeList = createTargetList(selection);
  console.log('Filled targetRangeList for annotation target update: ', targetRangeList);

  // targetXPath hold the xPath resolving to the elements in targeRangetList
  const targetXPath = createXPath(targetRangeList);
  console.log('Target/XPath of the NEW selection: ', targetXPath);
  return targetXPath;
}

/**
 * get the previously selected text from the respective body (purpose: describing),
 * or reconstruct it from the target
 *
 * @param {Object} annotation
 * @returns {String} the old selected text
 */
function getOldSelectedText(annotation) {
  let oldSelectedText;
  let describingBody = annotation.textCards.find((textCard) => textCard.purpose === 'describing');
  if (describingBody != undefined) {
    oldSelectedText = describingBody.value;
  } else {
    // TODO: this ordering seems to be unnecessary as we store only one long xPath,
    // which should have the proper order. This function
    // can't deal with substrings. This needs to be checked
    // make targets compatible, if necessary
    if (!checkIsTargetCompatible(annotation)) {
      annotation.targets = makeTargetsCompatible(annotation);
    }

    // store the ids of the words
    let idArray = [];
    annotation.targets.forEach((target) => {
      idArray.push(target.selector.xPath.split('"')[1]);
    });
    // this sorts the xml:ids to retrieve a somehow appropriate reconstruction of the text out of the targets
    // in cases, where the ids are not in an ascending nummerical order, the reconstruction will be off
    // especially regarding the punctuation
    idArray = idArray.sort((a, b) => {
      return a - b;
    });
    idArray = idArray.sort((a, b) => {
      const na = a.split('.').slice(-1)[0];
      const nb = b.split('.').slice(-1)[0];
      return na - nb;
    });
    // get the text of each element
    let stringArray = idArray.map((id) => {
      return document.getElementById(id).textContent;
    });
    // merge the text of each element into one string
    oldSelectedText = stringArray.join(' ');
  }
  return oldSelectedText;
}

/**
 * Store all information needed for the target update in a modal and show it
 *
 * @param {Element} modal to hold the information and to be shown
 * @param {String} oldSelectedText
 * @param {String} newSelectedText
 * @param {String} targetXPath
 * @returns {Element} the modal containing the inforamtion from the parameters
 */
function showSaveTargetModal(modal, oldSelectedText, newSelectedText, targetXPath) {
  // modal stuff should be optimised
  let $oldSelectedTextDiv = document.createElement('div');
  $oldSelectedTextDiv.innerHTML = oldSelectedText;
  // + window.SELECTED_ANNOTATION.targets.toString();
  //  + " | id: " + window.SELECTED_ANNOTATION.svgCode.split("\"")[1];
  document.getElementById('oldSelectedText').innerHTML = 'Current Selection:';
  document.getElementById('oldSelectedText').append($oldSelectedTextDiv);

  let $newSelectedTextDiv = document.createElement('div');
  $newSelectedTextDiv.innerHTML = newSelectedText; // + " | id: " + newTargetsXmlIds;
  document.getElementById('newSelectedText').innerHTML = 'New Selection:';
  document.getElementById('newSelectedText').append($newSelectedTextDiv);

  modal.classList.toggle('show-modal');
  modal.dataset.newTargetXmlId = targetXPath;
  //modal.dataset.SelectedAnnotationId = selectedAnnotation.id;

  return modal;
}
