//external modules
import * as bootstrap from 'bootstrap';
// internal modules
import { toggleButtonState, encodeAnnoId } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationCard';
import { updateDisplay } from '../display';
import { createTextSelectors } from './targetCreation';
import {
  reduceWhitespaceInString,
  getContentOfSelection,
  getSelectedTextOfAnnotation,
  showSaveTargetModal,
} from './utils';

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
  if (annotation === undefined) {
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
 * to get and store the new/old selected text and create the new selectors during the process of updating
 * the target of an annotation
 *
 * @param {Event} _event
 * @param {Selection} selection the selection created by a user
 * @param {JSONObject} annotation the curretnly selected annotation, which will have its target updated
 */
export function saveModification(_event, selection, annotation) {
  // TODO: this should be inside the if-clause, but somehow the selection gets alters
  // by the creation of the textQuoteSelector
  const selectionRangeContents = getContentOfSelection(selection);
  const newSelectedText = reduceWhitespaceInString(selectionRangeContents.textContent);

  // create new selectors
  const newSelectors = createTextSelectors(selection);
  // selectors will empty, if the target could
  // not be created and therefore this saveModification function will return
  if (newSelectors?.length > 0) {
    // store the selected text
    const oldSelectedText = getSelectedTextOfAnnotation(annotation);
    // const selectionRangeContents = getContentOfSelection(selection);
    // const newSelectedText = reduceWhitespaceInString(selectionRangeContents.textContent);

    // ask user if the new selection should be saved in a modal
    // create and show the modal used to save the new target
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    showSaveTargetModal($modal, oldSelectedText, newSelectedText, newSelectors);
  } else {
    return false;
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
 * @param {[JSONObject]} newSelectors the new selectors (might be xPath and/or textQuote)
 * @param {String} newSelectedText the new selected text
 * @param {Object} [hooks] containing an array for the hooks to be passed to "selectAnnotation()"
 * @returns {Boolean} true, if the body was succesfully updated, false, if the update failed
 */
export async function updateTarget(
  _event,
  targetUpdateCallback,
  annotation,
  newSelectors,
  newSelectedText,
  hooks = {},
) {
  // update the target (and body depending on the callback)
  let targetUpdated = false;
  try {
    // update the target (and body depending on the callback)
    // eslint-disable-next-line no-unused-vars
    const response = await targetUpdateCallback(annotation, newSelectors, newSelectedText);
    targetUpdated = true;

    // hide modal
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    $modal.toggle();
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;

    // updating the display for text annotation
    // checking if TEI-element is null. it is defined for text annotation,
    // but not for image annotation
    if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
      // redraw
      await updateDisplay(hooks);
    }

    // show the updated annotation
    window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(annotation.id), hooks);
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
