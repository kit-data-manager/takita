// external modules
import { $ } from 'jquery';

// dummy functions, which have to be replaced/implemented
function deleteAnnotation(annoId) {
  return;
}
function deleteBody(annoId, bodyIndex) {
  return;
}
function toggleExpand() {
  return;
}
function pickTemplate() {
  return;
}
function encodeAnnoId() {
  return;
}
function modifySelection() {
  return;
}
function saveModification() {
  return;
}
function cancelModification() {
  return;
}
function completeFormDataModel() {
  return;
}
function getMRWAnnoSelectedText() {
  return;
}
function updateDisplay() {
  return;
}
function checkIsTargetCompatible() {
  return;
}
function makeTargetsCompatible() {
  return;
}

/**
 * Main entry point to handle a user interaction to select an annotation
 * by clicking on it. It will get the annotations data, create the textCard
 * and highlight the selected words (if a text is present).
 *
 * @param {String} annoId ID of the annotation, that was selected
 * @param {Object} [hooks] containing an array for various hooks
 * @returns {Object} selectedAnnotation the selected annotation
 */
export async function selectAnnotation(annoId, hooks = {}) {
  let data = getData(annoId);

  let $annotationDiv = document.getElementById('annotationCard');

  // removing old textCard
  while ($annotationDiv.lastElementChild) {
    $annotationDiv.removeChild($annotationDiv.lastElementChild);
  }

  // creating new textCard
  $annotationDiv = createAnnotationDiv(data, $annotationDiv, hooks);
  if (hooks.postTextCardCreation) {
    hooks.postTextCardCreation.forEach((hook) => {
      hook($annotationDiv);
    });
  }

  const selectedAnnotation = data;

  // highlight the selected words
  if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
    highlightSelectedWords(selectedAnnotation);
  }

  return selectedAnnotation;
}

// creation of various elements

/**
 * Fills the div with all the information from an annotation
 *
 * @param {Object} annotationData the annotation as JSON
 * @param {Element} $annotationDiv the div to be filled
 * @param {Object} [hooks] containing an array for the hook to be called at "preAppendingBodies",
 * "preHorizontalCreation" and "postAppendingBodies"
 * @returns {Element} filled div
 */
function createAnnotationDiv(annotationData, $annotationDiv, hooks = {}) {
  // adding the JSONForm for the full annotation
  const headerFields = ['created', 'creators', 'modified', 'generator', 'motivation', 'target', 'via'];
  const omitFields = ['type', 'selector', 'fullJson', 'annotationId', 'motivation', 'created'];
  // field (bodies with purposes listed here) that can be edited in the horizontal view
  const editableFields = ['tagging', 'commenting', 'identifying', 'classifying'];
  let formDataModel;
  // using Destructuring assignment here, see:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  [$annotationDiv, formDataModel] = appendAnnotationForm($annotationDiv, annotationData, headerFields, omitFields);

  // adding the icon row at the top of the annotation div
  const $iconRowTop = createIconRow(true, annotationData.id);
  $annotationDiv.prepend($iconRowTop);

  // preAppendingBodiesHook
  // add Lauras copy button
  if (hooks.preAppendingBodies) {
    hooks.preAppendingBodies.forEach((hook) => hook());
  }
  // merging the tags and textCards
  const bodies = mergeBodies(annotationData);

  // adding the JSONForms for each body
  bodies.forEach((body, index) => {
    body = timestampsToISOString(body);

    const $bodyCard = createBodyCard(annotationData.id, body, index, omitFields, editableFields, formDataModel, hooks);

    $annotationDiv.append($bodyCard);
  });

  // postAppendingBodiesHook
  // add link to analysisTool here
  if (hooks.postAppendingBodies) {
    hooks.postAppendingBodies.forEach((hook) => hook());
  }
  return $annotationDiv;
}

/**
 * Create a div element holding the information from one body
 *
 * @param {String} annoId the id of the annotaiton
 * @param {Object} body the body as JSON
 * @param {number} index the index of the body in the bodies array
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Array} editableFields holds fields that should not be editeable
 * @param {Object} formDataModel used while creating the annotation form
 * @param {Object} [hooks] containing an array for the hook to be called at "preHorizontalCreation"
 * @returns {Element} the finished body card (div element)
 */
function createBodyCard(annoId, body, index, omitFields, editableFields, formDataModel, hooks = {}) {
  const $bodyCard = document.createElement('div');
  $bodyCard.classList.add('card');

  // create the bodyRowDiv
  const $bodyRowDiv = createBodyRowDiv();
  $bodyCard.append($bodyRowDiv);
  // create the bodyDiv and append it to the bodyRowDiv
  const $bodyDiv = createBodyDiv(body);
  const $bodyFormHorizontal = createBodyFormHorizontal();
  $bodyDiv.append($bodyFormHorizontal);
  const $iconRow = createIconRow(false, annoId, index);
  $bodyDiv.append($iconRow);
  $bodyRowDiv.append($bodyDiv);

  // create the formRowDiv
  const $formRowDiv = createFormRowDiv();
  const $bodyForm = createBodyForm(body);
  $formRowDiv.append($bodyForm);
  $bodyCard.append($formRowDiv);

  // create the two JSONForms and append them
  // create the expandable vertical JSONForm
  // using Destructuring assignment here, see:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  const [formBodyDataModel, uiForm] = getFormBodyDataModelAndUiForm(body, omitFields, formDataModel);
  appendBodyForm(formBodyDataModel, uiForm, body);
  // create the hoirzontal ("quick view") JSONForm
  const [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal] = getFormBodyDataModelAndUiFormHorizontal(
    body,
    omitFields,
    editableFields,
  );

  // as we don't want to display the URI, but the actual text of the linked mrw-annotation
  // the resource passed to the metadataeditorForm() via the options needs to have the URI
  // replaced with the text of the linked mrw-annotation. The actual bodies[body] should stay
  // intact though, so bodies[body] will be deep copied
  let modifiedBody = JSON.parse(JSON.stringify(body));
  if (hooks.preHorizontalCreation) {
    modifiedBody = hooks.preHorizontalCreation.forEach((hook) => hook(body));
  }

  appendBodyFormHorizontal(operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal, modifiedBody);
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
  $bodyRowDiv.classList.add('is-full-width');
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
  $bodyDiv.classList.add('is-left');
  $bodyDiv.classList.add('col');
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
  $formRowDiv.classList.add('is-full-width');
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
  //bodyForm.classList.add("is-full-width");
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
  //bodyForm.classList.add("is-full-width");
  $bodyFormHorizontal.classList.add('col');
  $bodyFormHorizontal.classList.add('horizontalFormForm');
  return $bodyFormHorizontal;
}

/**
 * Create an icon html element with a callback to delete an annotation/body
 *
 * @param {String} elementId of the delete icon
 * Note: This should match 'deleteAnnotation' or 'delete$bodyId' depending on what
 * you want to delete and match the corresponding callback
 * @param {Function} callback to be added to the delete icon for the onClick event.
 * Note: This callback should be deleteAnnotation/deleteBody depending on what you
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
 * @param {String} annoId id of the annotation
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
    const modal = document.getElementById('createBody');
    modal.classList.toggle('show-modal');
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
    console.log(this.id);
    toggleExpand($expandIcon.parentNode.parentNode.parentNode.nextElementSibling);
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
 * @param {String} annoId id of the annotation
 * @param {String} bodyIndex the index/number of the body. It is needed in the case a
 * body card row has to be created (if 'isAnnotationRow' is false)
 * @returns {Element} $iconRow that was created
 */
export function createIconRow(isAnnotationRow, annoId, bodyIndex) {
  const $iconRow = document.createElement('div');
  if (isAnnotationRow) {
    // create icon row for annotation card
    $iconRow.id = 'iconRowTop';
    $iconRow.title = annoId;
    // create and append child elements
    const $addBodyIcon = createAddBodyIcon(annoId);
    $iconRow.append($addBodyIcon);
    const $annoDeleteIcon = createDeleteIcon('deleteAnnotation', deleteAnnotation(annoId));
    $iconRow.append($annoDeleteIcon);
    // add stlying
    $iconRow.classList.add('is-right');
    $iconRow.classList.add('is-full-width');
  } else {
    // create icon row for body card
    $iconRow.id = 'iconRow' + bodyIndex;
    // create and append child elements
    const $expandIcon = createExpandIcon('expand' + bodyIndex);
    $iconRow.append($expandIcon);
    const $bodyDeleteIcon = createDeleteIcon('delete' + bodyIndex, deleteBody(annoId, bodyIndex));
    $iconRow.append($bodyDeleteIcon);
  }
  return $iconRow;
}

// TODO: implement this
async function getData(annoId) {
  let data; // fetch data =
  // converting timestamps to ISOStrings
  data = timestampsToISOString(data);

  // make targets compatible for the new textEditor, if necessary
  if (document.getElementById('TEI') != null) {
    if (!checkIsTargetCompatible(data)) {
      data.targets = makeTargetsCompatible(data);
    }
  }

  return data;
}

/**
 * highlight the ttarget (selected words) of the selected annotation
 *
 * @param {Object} selectedAnnotation annotation selected
 */
function highlightSelectedWords(selectedAnnotation) {
  // highlight words targetted by the currently selected annotation
  // remove old highlights (TODO: include this in removeStyles(el) in editor_xml.js)
  document.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'));
  // add a class to all the targets of the selected annotation
  selectedAnnotation.targets.forEach((target) => {
    const targetId = target.selector.xPath.split('"')[1];
    document.getElementById(targetId).classList.add('selected');
  });
}

// JSONForm creation
/**
 * Append the annotation form created by the metadataEditor.js (uses JSONForm) to the
 * annotation div
 *
 * @param {Element} annotationDiv the div holding the textcard
 * @param {Object} data the annotation as JSON
 * @param {Array} headerFields holds the fields to be added to the form
 * @param {Array} omitFields holds the fields to NOT be added to the form
 * @returns {Element} $annotationDiv after the form got appended
 */
function appendAnnotationForm($annotationDiv, data, headerFields, omitFields) {
  let formDataModel = {
    type: 'object',
    properties: {},
  };

  headerFields.forEach((headerField) => {
    if (data[headerField]) {
      formDataModel = completeFormDataModel(data, formDataModel, headerField, omitFields);
    }
  });

  const options = { operation: 'READ', dataModel: formDataModel, uiForm: '*', resource: data };

  $('#annotationCard').metadataeditorForm(options, function onSubmitValid(_value) {
    //console.log(value);
  });

  return [$annotationDiv, formDataModel];
}

/**
 * Append the vertical form for a body created by the metadataEditor.js
 * (uses JSONForm) to the annotation div
 *
 * @param {Object} formBodyDataModel the dataModel used by JSONForms
 * @param {Object} uiForm the uiForm used by JSONForms
 * @param {Object} body the body as JSON
 */
function appendBodyForm(formBodyDataModel, uiForm, body) {
  const options = { operation: 'UPDATE', dataModel: formBodyDataModel, uiForm: uiForm, resource: body };
  $('#form' + body.id).metadataeditorForm(options, async function onSubmitValid(value) {
    await updateBody(value);
  });
}

async function updateBody(value) {
  //console.log(value);
  var jsonObject = JSON.parse(value);

  var endpoint;
  var annoIdEncoded = encodeAnnoId(document.getElementById('iconRowTop').title);
  //console.log(document.activeElement);

  if (jsonObject.purpose === 'tagging') {
    endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + jsonObject.id;
  } else {
    endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + jsonObject.id;
  }

  $.ajax({
    type: 'PUT',
    url: endpoint,
    data: value,
    headers: {
      'Content-Type': 'application/json',
    },

    success: function (_responseData) {
      //console.log(responseData);
      selectAnnotation(null, annoIdEncoded);
      // TODO: this is just a bandaid for now as it only updates the first
      // entry of the tags array and not only the updated tag
      // For now in (CRC1475) an annotation only has one tag anyways.

      // updating the display for text annotation
      // checking if TEI-element is null. it is defined for text annotation,
      // but not for image annotation
      if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
        // redraw
        updateDisplay();
      }
    },

    error: function (errorData) {
      console.error('Body update failed: ', errorData);
    },
  });
}

/**
 * Append the horizontal ("quick view") form for a body created by the metadataEditor.js
 * (uses JSONForm) to the annotation div
 *
 * @param {String} operationHorizontal the operation type of the form
 * @param {Object} formBodyDataModelHorizontal the dataModel used by JSONForms
 * @param {Object} uiFormHorizontal the uiForm used by JSONForms
 * @param {Object} modifiedBody the body as JSON
 */
function appendBodyFormHorizontal(operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal, modifiedBody) {
  const optionsHorizontal = {
    operation: operationHorizontal,
    dataModel: formBodyDataModelHorizontal,
    uiForm: uiFormHorizontal,
    resource: modifiedBody,
  };
  $('#formHorizontal' + modifiedBody.id).metadataeditorForm(optionsHorizontal, function onSubmitValid(value) {
    console.log(value);
    var jsonObject = JSON.parse(value);

    var endpoint;
    var annoIdEncoded = encodeAnnoId(document.getElementById('iconRowTop').title);
    //console.log(document.activeElement);

    if (jsonObject.purpose === 'tagging') {
      endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + jsonObject.id;
    } else {
      endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + jsonObject.id;
    }

    $.ajax({
      type: 'PUT',
      url: endpoint,
      data: value,
      headers: {
        'Content-Type': 'application/json',
      },

      success: function (_responseData) {
        //console.log(responseData);
        selectAnnotation(null, annoIdEncoded);
        // TODO: this is just a bandaid for now as it only updates the first
        // entry of the tags array and not only the updated tag
        // For now in (CRC1475) an annotation only has one tag anyways.

        // updating the display for text annotation
        // checking if TEI-element is null. it is defined for text annotation,
        // but not for image annotation
        if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
          // redraw
          updateDisplay();
        }
      },

      error: function (errorData) {
        console.error('Body update failed: ', errorData);
      },
    });
  });
  // styling of the horizontal form
  // this is done after the form is created as the forms style can't be changed during creation
  // TODO: move parts of this to css

  // remove the wrapping fieldset. the form can't be created without the fieldset
  // due to the code in metadataeditor.js (eg. line 485) requires a JSON object
  // https://stackoverflow.com/questions/19261197/how-can-i-remove-wrapper-parent-element-without-removing-the-child
  let fieldsetHorizontal = document.getElementById('formHorizontal' + modifiedBody.id).firstChild.firstChild;
  fieldsetHorizontal.replaceWith(...fieldsetHorizontal.childNodes);

  const formHorizontal = document.getElementById('formHorizontal' + modifiedBody.id);
  const inputButtonHorizontal = formHorizontal.querySelectorAll('input[type="submit"]')[0];
  // display everything in one line
  // improve readibility of the value of the "disabled" input fields
  formHorizontal.querySelectorAll('input[type="text"]').forEach((input) => {
    if (input.name === 'value') {
      input.style.color = 'black';
      input.style.opacity = 1;
    }
    // enable the input submit button if the value of the input field changes
    // from the original body value
    input.addEventListener('input', (_event) => {
      if (input.value !== modifiedBody.value) {
        inputButtonHorizontal.disabled = false;
      } else {
        inputButtonHorizontal.disabled = true;
      }
    });
  });
  // TODO: maybe use an icon instead of the "save" text to save some space
  // change the value/text of the submit "button" and if one is available (as the field can be edited)
  // disable the button by default
  if (inputButtonHorizontal !== undefined) {
    inputButtonHorizontal.value = 'Save';
    inputButtonHorizontal.disabled = true;
    inputButtonHorizontal.classList.add('horizontalFormInput');
  }
}

// JSONForm dataModel and uiForm
/**
 * Get operation type, dataModel and uiForm used by JSONForm for the vertical form
 *
 * @param {Object} body the body as JSON
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Object} formDataModel used while creating the annotation form
 * @returns {[Object, Object]} formBodyDataModel, uiForm an array holding the dataModel
 * and uiForm used by JSONForm
 */
function getFormBodyDataModelAndUiForm(body, omitFields, formDataModel) {
  let formBodyDataModel = {
    type: 'object',
    properties: {},
  };
  let uiForm = {
    type: 'fieldset',
    items: [],
  };

  body.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      // TODO: The following line might be useles. Check if it can be left out and
      // then remove "formDataModel" from the function parameters and calls
      formDataModel = completeFormDataModel(body, formBodyDataModel, key, omitFields);
      if (key !== 'value' && omitFields.indexOf(key) === -1) {
        uiForm.items.push(key);
      }
    }
  });

  if (body.value && body.purpose === 'tadirah:transcription') {
    uiForm.items.push({ key: 'value', type: 'textarea' });
  } else {
    if (body.value) {
      uiForm.items.push('value');
    }
  }

  // TODO: try the following lines instead of the lines above
  // if (body.value) {
  //   if (body.purpose === 'tadirah:transcription') {
  //     uiForm.items.push({ key: 'value', type: 'textarea' });
  //   } else {
  //     uiForm.items.push('value');
  //   }
  // }
  return [formBodyDataModel, uiForm];
}

/**
 * Get operation type, dataModel and uiForm used by JSONForm for the horizontal form
 *
 * @param {Object} body the body as JSON
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Array} editableFields holds fields that should not be editeable
 * @returns {[String, Object, Object]} operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal
 * an Array containing the operation type of the form, the dataModel and uiForm used by JSONForm
 */
function getFormBodyDataModelAndUiFormHorizontal(body, omitFields, editableFields) {
  let operationHorizontal = 'READ';

  let formBodyDataModelHorizontal = {
    type: 'object',
    properties: {},
  };

  let uiFormHorizontal = {
    type: 'fieldset',
    items: [],
  };

  body.forEach((key) => {
    //console.log(key);
    //console.log(bodies[body]);
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      formBodyDataModelHorizontal = completeFormDataModel(body, formBodyDataModelHorizontal, key, omitFields);
      // prepare the ui form
      // push the key and hide it, when its not the value key
      if (key !== 'value' && omitFields.indexOf(key) === -1) {
        // "type" : "hidden" doesn't work; for some reason this prevents
        // the form to be submitted. Instead chotas "is-hidden" class is being used
        uiFormHorizontal.items.push({ key: key, htmlClass: 'is-hidden' });
        // TODO: CUSTOMISE decide which purpose bodies/fields should be editable
        if (key === 'purpose') {
          if (editableFields.includes(body.purpose)) {
            operationHorizontal = 'UPDATE';
          }
        }
      }
      if (key === 'value' && omitFields.indexOf(key) === -1) {
        uiFormHorizontal.items.push({ key: key, htmlClass: 'horizontalFormDiv' });
      }
    }
  });

  return [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal];
}

// data manipulation
/**
 * Merges all the bodies of an annotation (tags and textcards) into one array
 *
 * @param {Object} data
 * @returns {Array} of Objects
 */
function mergeBodies(data) {
  return data.tags.concat(data.bodies);
}

/**
 * Converts timestamps into ISOStrings for the creation/modifcation date of annotations
 * and bodies.
 *
 * @param {Object} object can be a body or annotation JSONObject
 * @returns {Object} with timestamps converted to ISOString
 */
function timestampsToISOString(object) {
  if (object.created) {
    object.created = new Date(object.created.seconds * 1000 + object.created.nanos / 1000000).toISOString();
  }
  // bodies can have a modified date without having a created date
  // 'legacy annotations'
  if (object.modified) {
    object.modified = new Date(object.modified.seconds * 1000 + object.modified.nanos / 1000000).toISOString();
  }
  return object;
}

// HOOKS
/**
 * Replaces the value of the body, which is an URI of an annotation, with the
 * selected text of that annotation
 *
 * @param {String} annoId id of the annotation
 * @param {Object} body that will get its value changed, if it is a linked
 * mrw-annotation
 * @returns {Object} body with the new value
 */
async function preHorizontalCreationGetLinkingAnno(annoId, body) {
  if (body.purpose === 'linking') {
    body.value = await getMRWAnnoSelectedText(annoId, body.value);
  }
}

/**
 * appends buttons to edit the selected text/target of an annotation to the textcard div
 *
 * @param {Element} $annotationDiv the div holding the textcard
 * @returns {Element} $annotationDiv after the buttons got appended
 */
function postTextCardCreationTargetModificationButtons($annotationDiv) {
  if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
    var $buttonModifySelection = document.createElement('button');
    $buttonModifySelection.innerHTML = 'Modify Selection';
    $buttonModifySelection.id = 'buttonModifySelection';
    $buttonModifySelection.addEventListener('mousedown', (event) => {
      modifySelection(event, window.SELECTED_ANNOTATION);
    });

    var $buttonSaveModification = document.createElement('button');
    $buttonSaveModification.type = 'submit';
    $buttonSaveModification.innerHTML = 'Save Modification';
    $buttonSaveModification.id = 'buttonSaveModification';
    $buttonSaveModification.disabled = true;
    $buttonSaveModification.classList.add('is-hidden');
    $buttonSaveModification.addEventListener('mousedown', (event) => {
      saveModification(event, window.getSelection(), window.SELECTED_ANNOTATION);
    });

    var $buttonCancelModification = document.createElement('button');
    $buttonCancelModification.type = 'submit';
    $buttonCancelModification.innerHTML = 'Cancel Modifcation';
    $buttonCancelModification.id = 'buttonCancelModification';
    $buttonCancelModification.style.backgroundColor = '#c82525';
    $buttonCancelModification.disabled = true;
    $buttonCancelModification.classList.add('is-hidden');
    $buttonCancelModification.addEventListener('mousedown', cancelModification);

    $annotationDiv.append($buttonModifySelection);
    $annotationDiv.append($buttonSaveModification);
    $annotationDiv.append($buttonCancelModification);
    document.getElementById('buttonCancelModification').addEventListener('mousedown', cancelModification);
  }
  return $annotationDiv;
}
