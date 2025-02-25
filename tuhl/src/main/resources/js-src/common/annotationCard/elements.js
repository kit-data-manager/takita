// external modules
import * as bootstrap from 'bootstrap';
//internal modules
import {
  modifySelection,
  saveModification,
  updateTarget,
  cancelModification,
} from '../../texteditor-ng/targetBuilding';
import { pickTemplate } from '../annotationCreation';
import { encodeAnnoId, toggleExpand } from '../utils';
import { deleteAnnotation, deleteBody } from './utils';
// projectspecific
import { targetUpdateCallback } from '../../projectspecific';

/**
 * Fills the div with all the information from an annotation
 *
 * @param {Object} annotationData the annotation as JSON
 * @param {Element} $annotationDiv the div to be filled
 * @param {Object} [hooks] containing an array for the hook to be called at "preAppendingBodies",
 * "preHorizontalCreation" and "postAppendingBodies"
 * @returns {Element} filled div
 */
export async function createAnnotationDiv(annotationData, $annotationDiv, hooks = {}) {
  // adding the icon row at the top of the annotation div
  const $iconRowTop = createIconRow(true, annotationData.id, hooks);
  $annotationDiv.prepend($iconRowTop);

  // adding a container to add buttons to the top of the annotationcard
  const $topButtonContainer = document.createElement('div');
  $topButtonContainer.id = 'topButtonContainer';
  $annotationDiv.append($topButtonContainer);

  // preAppendingBodiesHook
  if (hooks.preAppendingBodies) {
    hooks.preAppendingBodies.forEach((hook) => {
      $annotationDiv = hook(annotationData, $annotationDiv);
    });
  }

  // creating the container for and adding the JSONForms for each body.
  // The container has to be created first, as JSONForm appends the form
  // to the container. If the container is not present in the DOM, JSONForm
  // can't append the form to it.
  annotationData.bodies.forEach(async (body, index) => {
    // create the bodyCard (container for the JSONForm) and append it to the DOM
    const $bodyCard = createBodyCard(annotationData.id, body, index, hooks);
    $annotationDiv.append($bodyCard);
  });

  // adding a container to add buttons to the bottom of the annotationcard
  const $bottomButtonContainer = document.createElement('div');
  $bottomButtonContainer.id = 'bottomButtonContainer';
  $annotationDiv.append($bottomButtonContainer);

  // postAppendingBodiesHook
  if (hooks.postAppendingBodies) {
    hooks.postAppendingBodies.forEach((hook) => {
      $annotationDiv = hook(annotationData, $annotationDiv);
    });
  }

  if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
    appendTextTargetModificationButtons(annotationData, $annotationDiv, hooks);
  }

  return $annotationDiv;
}

/**
 * Create a div element holding the information from one body
 *
 * @param {String} annoId single encoded the id of the annotaiton
 * @param {Object} body the body as JSON
 * @param {number} index the index of the body in the bodies array
 * @param {Object} [hooks] containing an array for the hooks to be passed to "selectAnnotation()"
 * @returns {Element} the finished body card (div element)
 */
export function createBodyCard(annoId, body, index, hooks = {}) {
  const $bodyCard = document.createElement('div');
  $bodyCard.classList.add('card');

  // create the bodyRowDiv
  const $bodyRowDiv = createBodyRowDiv();
  $bodyCard.append($bodyRowDiv);
  // create the bodyDiv and append it to the bodyRowDiv
  const $bodyDiv = createBodyDiv(body);
  const $iconRow = createIconRow(false, annoId, body, index, hooks);
  $bodyDiv.append($iconRow);
  const $bodyFormHorizontal = createBodyFormHorizontal(body);
  $bodyDiv.append($bodyFormHorizontal);
  $bodyRowDiv.append($bodyDiv);

  // create the formRowDiv
  const $formRowDiv = createFormRowDiv();
  const $bodyForm = createBodyForm(body);
  $formRowDiv.append($bodyForm);
  $bodyCard.append($formRowDiv);
  return $bodyCard;
}

/**
 * Creates a div element to hold a body div
 *
 * @returns {Element} a div element
 */
function createBodyRowDiv() {
  const $bodyRowDiv = document.createElement('div');
  $bodyRowDiv.classList.add('row');
  return $bodyRowDiv;
}

/**
 * Creates a div element to hold an icon row
 *
 * @param {Object} body the body as JSON
 * @returns {Element} a div element
 */
function createBodyDiv(body) {
  const $bodyDiv = document.createElement('div');
  // the innerText is no longer necessary as this div is the anchor for the
  // horizontal form
  //bodyDiv.innerText = bodies[body].purpose;
  $bodyDiv.id = body.id;
  $bodyDiv.title = body.annotationId;
  $bodyDiv.classList.add('d-flex');
  $bodyDiv.classList.add('align-items-center');
  $bodyDiv.classList.add('formBodyDiv');
  return $bodyDiv;
}

/**
 * Create a div to hold a form
 *
 * @returns {Element} a div element
 */
function createFormRowDiv() {
  const $formRowDiv = document.createElement('div');
  $formRowDiv.classList.add('row');
  $formRowDiv.classList.add('collapse');
  return $formRowDiv;
}

/**
 * Create a form for the vertical view
 *
 * @param {Object} body the body as JSON
 * @returns {Element} a form element
 */
function createBodyForm(body) {
  // vertical form (needs to be expanded)
  const $bodyForm = document.createElement('form');
  $bodyForm.id = 'form' + body.id;
  $bodyForm.addEventListener('submit', function (e) {
    e.preventDefault();
  });
  //bodyForm.style.paddingLeft = "20rem";
  $bodyForm.classList.add('col');

  return $bodyForm;
}

/**
 * Create a form for the horizontal view
 *
 * @param {Object} body the body as JSON
 * @returns {Element} a form element
 */
function createBodyFormHorizontal(body) {
  const $bodyFormHorizontal = document.createElement('form');
  $bodyFormHorizontal.id = 'formHorizontal' + body.id;
  $bodyFormHorizontal.addEventListener('submit', function (e) {
    e.preventDefault();
  });
  //bodyForm.style.paddingLeft = "20rem";
  $bodyFormHorizontal.classList.add('horizontalFormForm');
  $bodyFormHorizontal.classList.add('flex-fill');
  $bodyFormHorizontal.style.marginLeft = '0.5rem';
  return $bodyFormHorizontal;
}

/**
 * Create an icon html element with a callback to delete an annotation/body
 *
 * @param {String} elementId of the delete icon
 * Note: This should match 'deleteAnnotation' or 'deleteBody' depending on what
 * you want to delete and match the corresponding callback
 * @param {Function} callback to be added to the delete icon for the onClick event.
 * Note: This callback should be async and deleteAnnotation/deleteBody depending on what you
 * want to delete and match the corresponding elementId
 */
export function createDeleteIcon(elementId, callback) {
  const $deleteIcon = document.createElement('i');
  $deleteIcon.id = elementId;
  /*
    // delete anno id
    deleteIcon.id = 'deleteAnnotation';
    //delete body id
    deleteBody.id = 'delete' + body;
    */
  $deleteIcon.classList.add('bx');
  $deleteIcon.classList.add('bx-trash');

  $deleteIcon.addEventListener('click', callback);
  /*
    // delete annotation callback
    deleteIcon.onclick = function () {
      console.log('Hier wird gelöscht!');
      deleteAnnotation(document.getElementById(this.id).parentNode.title);
    };
    // delete body callback
    deleteBody.onclick = function () {
      console.log('Hier wird gelöscht!');
      deleteBodyFromAnnotation(
        document.getElementById(this.id).parentNode.parentNode.title,
        document.getElementById(this.id).parentNode.parentNode.id,
      );
    };
    */
  return $deleteIcon;
}

/**
 * Create an icon html element to add a body
 *
 * @param {String} annoId single encoded id of the annotation
 * @returns {Element} $addBodyIcon that was created
 */
export function createAddBodyIcon(annoId) {
  var $addBodyIcon = document.createElement('i');
  $addBodyIcon.id = 'addBody';
  $addBodyIcon.classList.add('bx');
  $addBodyIcon.classList.add('bx-plus');
  $addBodyIcon.addEventListener('click', () => {
    //console.log("create");
    //var modal = document.createElement("div");
    //modal.classList.add("modal");
    //modal.style.display = "block";
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('createBody'));
    $modal.toggle();
    pickTemplate('', encodeAnnoId(annoId), 'createForm', 'pickBodyTemplateForm', 'bodyTemplate');
  });
  return $addBodyIcon;
}

/**
 * Create an icon html element to expand a body
 *
 * @param {String} bodyIndex the index of the body to be expanded
 * @returns {Element} $expandIcon that was created
 */
export function createExpandIcon(bodyIndex) {
  const $expandIcon = document.createElement('i');
  $expandIcon.id = 'expand' + bodyIndex;
  $expandIcon.classList.add('bx');
  $expandIcon.classList.add('bx-chevron-right');
  //expand.style.color = "#b5b5be";
  $expandIcon.addEventListener('click', () => {
    //console.log(this.id);
    const $ancestorDiv = $expandIcon.parentNode.parentNode.parentNode.nextElementSibling;
    toggleExpand($ancestorDiv, $expandIcon);
    //toggleExpand(document.getElementById(this.id).parentNode.parentNode.parentNode.nextElementSibling);
  });
  return $expandIcon;
}

/**
 * Create a div element holding two icons.
 * Note: this can be used for the icon row for the whole annotation card
 * (isAnnotationRow == true) or for indivudal body cards (isAnnotationRow == false).
 *
 * @param {Boolean} isAnnotationRow to decide if the icon row should be created
 * for the annotation card or for a body card
 * @param {String} annoId single encoded id of the annotation
 * The following parameters are needed in the case a
 * body card row has to be created (if 'isAnnotationRow' is false)
 * @param {String} bodyId id of the body
 * @param {String} bodyIndex the index/number of the body
 * @param {Object} [hooks] containing an array for the hooks to be passed to "selectAnnotation()"
 * @returns {Element} $iconRow that was created
 */
export function createIconRow(isAnnotationRow, annoId, body, bodyIndex, hooks = {}) {
  const $iconRow = document.createElement('div');
  if (isAnnotationRow) {
    // create icon row for annotation card
    $iconRow.id = 'iconRowTop';
    $iconRow.title = annoId;
    // create and append child elements
    const $addBodyIcon = createAddBodyIcon(annoId);
    $iconRow.append($addBodyIcon);
    const $annoDeleteIcon = createDeleteIcon('deleteAnnotation', async (_event) => {
      await deleteAnnotation(annoId, hooks);
    });
    $iconRow.append($annoDeleteIcon);
    // add stlying
    $iconRow.classList.add('text-end');
  } else {
    // create icon row for body card
    $iconRow.id = 'iconRow' + bodyIndex;
    // create and append child elements
    const $expandIcon = createExpandIcon('expand' + bodyIndex);
    $iconRow.append($expandIcon);
    const $bodyDeleteIcon = createDeleteIcon('delete' + bodyIndex, async (_event) => {
      await deleteBody(annoId, body, hooks);
    });
    $iconRow.append($bodyDeleteIcon);
  }
  return $iconRow;
}

/**
 * appends buttons to edit the selected text/target of an annotation to the annotationCard div
 *
 * @param {Element} $annotationDiv the div holding the annotationCard
 * @returns {Element} $annotationDiv after the buttons got appended
 */
function appendTextTargetModificationButtons(annotationData, $annotationDiv, hooks = {}) {
  if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
    const $buttonModifySelection = document.createElement('button');
    $buttonModifySelection.innerHTML = 'Modify Selection';
    $buttonModifySelection.id = 'buttonModifySelection';
    $buttonModifySelection.classList.add('btn');
    $buttonModifySelection.classList.add('btn-secondary');
    $buttonModifySelection.addEventListener('mousedown', (event) => {
      modifySelection(event, annotationData);
    });

    var $buttonSaveModification = document.createElement('button');
    $buttonSaveModification.type = 'submit';
    $buttonSaveModification.innerHTML = 'Save Modification';
    $buttonSaveModification.id = 'buttonSaveModification';
    $buttonSaveModification.disabled = true;
    $buttonSaveModification.classList.add('d-none');
    $buttonSaveModification.classList.add('btn');
    $buttonSaveModification.classList.add('btn-success');
    $buttonSaveModification.addEventListener('mousedown', (event) => {
      saveModification(event, window.getSelection(), annotationData);
    });

    var $buttonCancelModification = document.createElement('button');
    $buttonCancelModification.type = 'submit';
    $buttonCancelModification.innerHTML = 'Cancel Modifcation';
    $buttonCancelModification.id = 'buttonCancelModification';
    $buttonCancelModification.disabled = true;
    $buttonCancelModification.classList.add('d-none');
    $buttonCancelModification.classList.add('btn');
    $buttonCancelModification.classList.add('btn-danger');
    $buttonCancelModification.addEventListener('mousedown', cancelModification);

    const $buttonContainer = $annotationDiv.querySelector('#bottomButtonContainer');
    $buttonContainer.append($buttonModifySelection);
    $buttonContainer.append($buttonSaveModification);
    $buttonContainer.append($buttonCancelModification);

    // strictly speaking this is not part of the annotation card, but it is the
    // last step of the target update for texts and all the other buttons/eventListeners
    // are getting attached here
    // updateTargetButton, which is present in the modal
    const $updateTargetButton = document.getElementById('updateTargetButton');
    // cloning the elemnt, attaching the eventListner to the clone and then replacing the element
    // with the clone to prevent the eventListener to get attached multiple times
    // see https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/issues/60 for more information
    // TODO: improve this procedure
    // const $updateTargetButtonClone = $updateTargetButton.cloneNode(true);
    // $updateTargetButtonClone.addEventListener('click', async (event) => {
    //   // pass the current selected annotation, the new Xpath stored in the 'updateSelection' element
    //   // and the newly selected text stored in the 'newSelectedText' element
    //   // TODO: fix, when it goes into production, bc then the innerHTML will only be
    //   // the selected text without any "|"s
    //   const newXPath = document.getElementById('updateSelection').dataset.newTargetXmlId;
    //   const newSelectedText = document.getElementById('newSelectedText').children[0].innerHTML.split('|')[0];
    //   await updateTarget(event, targetUpdateCallback, annotationData, newXPath, newSelectedText, hooks);
    // });
    // $updateTargetButton.replaceWith($updateTargetButtonClone);
    $updateTargetButton.onclick = (event) => {
      // pass the current selected annotation, the new Xpath stored in the 'updateSelection' element
      // and the newly selected text stored in the 'newSelectedText' element
      // TODO: fix, when it goes into production, bc then the innerHTML will only be
      // the selected text without any "|"s
      const newXPath = document.getElementById('updateSelection').dataset.newTargetXmlId;
      const newSelectedText = document.getElementById('newSelectedText').children[0].innerHTML.split('|')[0];
      updateTarget(event, targetUpdateCallback, annotationData, newXPath, newSelectedText, hooks);
    };
  }

  // strictly speaking this is not part of the annotation card, but it cancels
  // the target update for texts and all the other buttons/eventListeners
  // are getting attached here
  // adding the closing functionality to text selection update modal
  // TODO: this attaching of the eventListener has the same problem as the above attechment of
  // the eventListener to "#updateTargetButton", but doesn't have big consequences.
  // const $dismissTargetUpdate = document.getElementById('dismissTargetUpdate');
  // const $dismissTargetUpdateClone = $dismissTargetUpdate.cloneNode(true);
  // $dismissTargetUpdateClone.addEventListener('click', function (_e) {
  //   document.getElementById('updateSelection').classList.toggle('show-modal');
  //   // document.getElementById('modifyButton').parentElement.classList.remove('active');
  //   cancelModification();
  //   // disabling the option to create an annotation. needed, because selecting text
  //   // can be done before the mode was set to create by clicking the button after the text selection process
  //   window.MODE = window.MODE_CLASS.View;
  //   window.SELECTING_TEXT = false;
  // });
  // $dismissTargetUpdate.replaceWith($dismissTargetUpdateClone);
  document.getElementById('dismissTargetUpdate').onclick = (_event) => {
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    $modal.hide();
    // document.getElementById('modifyButton').parentElement.classList.remove('active');
    cancelModification();
    // disabling the option to create an annotation. needed, because selecting text
    // can be done before the mode was set to create by clicking the button after the text selection process
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
  };

  return $annotationDiv;
}
