// wip imports
import { completeFormDataModel } from '../../commonOLD/utils';
import { pickTemplate } from '../../texteditor/annotationEditor';
import { deleteAnnotation } from '../../commonOLD/annotationDisplay';
import { toggleExpand } from '../../commonOLD/utils';
import { deleteBodyFromAnnotation } from '../../commonOLD/annotationDisplay';
import { updateDisplay } from '../../texteditor/annotationEditor';
import { projectSpecificTextCardCreation } from '../utils';
import { selectAnnotation } from '../../commonOLD/annotationDisplay';
import { modifySelection, saveModification, cancelModification } from '../../texteditor/annotationEditor';
import { addLinkToAnalysisTool } from '../../projectspecific/crc1475';
// correct imorts
import $ from 'jquery';
import { getAnnotation } from '../../texteditor-ng/network/annotation';
import { encodeAnnoId } from '../utils/url';

export function createTextcard(annoId, annotationData, hooks = {}) {
  // TODO: CUSTOMISE these fields. You can remove fields from the display with "omitFields"
  // and make certain fields in the horizontal view read-only
  const headerFields = ['created', 'creators', 'modified', 'generator', 'motivation', 'target', 'via'];
  const omitFields = ['type', 'selector', 'fullJson', 'annotationId', 'motivation', 'created'];
  // editableFields in the horizontal bodyDivs
  const editableFields = ['tagging', 'commenting', 'identifying', 'classifying'];
  var $annotationDiv = document.getElementById('annotationCard');

  // create elements
  // create annotation div
  // TODO: atm this is just doing sideeffect stuff, but should return an element
  createAnnotationDiv(annotationData, $annotationDiv, headerFields, omitFields);

  if (hooks.preBodyCreation) {
    hooks.preBodyCreation.forEach((hook) => {
      hook();
    });
  }
  // create and append bodies
  // merge bodies and textcards into one array
  annotationData = mergeTagsWithTextcards(annotationData);
  // TODO: use forEach
  for (let body in annotationData.tags) {
    const $bodyDiv = createBodyDiv(body, annotationData.tags, annoId, headerFields, omitFields, editableFields, hooks);
    $annotationDiv.append($bodyDiv);
  }

  if (hooks.postBodyCreation) {
    hooks.postBodyCreation.forEach((hook) => {
      hook();
    });
  }
  return $annotationDiv;
}

// maybe only create the div and return it
function createAnnotationDiv(annotationData, annotationDiv, headerFields, omitFields) {
  if (annotationData.created.seconds) {
    annotationData.created = new Date(
      annotationData.created.seconds * 1000 + annotationData.created.nanos / 1000000,
    ).toISOString();
    if (annotationData.modified.seconds) {
      annotationData.modified = new Date(
        annotationData.modified.seconds * 1000 + annotationData.modified.nanos / 1000000,
      ).toISOString();
    }
  }

  //toggleOverview('annotationCard');

  //var annotationData = JSON.parse(responseData);
  //console.log(annotationDiv);
  //console.log(annotationDiv.childElementCount);
  while (annotationDiv.lastElementChild) {
    annotationDiv.removeChild(annotationDiv.lastElementChild);
  }

  var iconRowTop = document.createElement('div');
  iconRowTop.id = 'iconRowTop';
  iconRowTop.title = annotationData.id;

  var addBody = document.createElement('i');
  addBody.id = 'addBody';
  addBody.classList.add('bx');
  addBody.classList.add('bx-plus');
  addBody.onclick = function () {
    //console.log("create");
    //var modal = document.createElement("div");
    //modal.classList.add("modal");
    //modal.style.display = "block";
    const modal = document.getElementById('createBody');
    modal.classList.toggle('show-modal');
    pickTemplate('', encodeAnnoId(annotationData.id), 'createForm', 'pickBodyTemplateForm', 'bodyTemplate');
  };

  var deleteAnnotationIcon = document.createElement('i');
  deleteAnnotationIcon.id = 'deleteAnnotation';
  deleteAnnotationIcon.classList.add('bx');
  deleteAnnotationIcon.classList.add('bx-trash');
  deleteAnnotationIcon.onclick = function () {
    console.log('Hier wird gelöscht!');
    deleteAnnotation(document.getElementById(this.id).parentNode.title);
  };

  iconRowTop.append(addBody);
  iconRowTop.append(deleteAnnotationIcon);
  iconRowTop.classList.add('is-right');
  iconRowTop.classList.add('is-full-width');

  var formDataModel = {
    type: 'object',
    properties: {},
  };

  for (let field in headerFields) {
    if (annotationData[headerFields[field]]) {
      //console.log(annotationData[headerFields[field]]);
      formDataModel = completeFormDataModel(annotationData, formDataModel, headerFields[field], omitFields);
    }
  }

  //console.log(formDataModel);

  let options = { operation: 'READ', dataModel: formDataModel, uiForm: '*', resource: annotationData };
  $('#annotationCard').metadataeditorForm(options, function onSubmitValid(_value) {
    //console.log(value);
  });

  annotationDiv.prepend(iconRowTop);
}

async function createBodyDiv(body, bodies, annoId, headerFields, omitFields, editableFields, hooks) {
  if (bodies[body].created) {
    bodies[body].created = new Date(
      bodies[body].created.seconds * 1000 + bodies[body].created.nanos / 1000000,
    ).toISOString();
  }

  // bodies can have a modified date without having a created date
  // 'legacy annotations'
  if (bodies[body].modified) {
    bodies[body].modified = new Date(
      bodies[body].modified.seconds * 1000 + bodies[body].modified.nanos / 1000000,
    ).toISOString();
  }

  //console.log(bodies[body]);

  var bodyCard = document.createElement('div');
  bodyCard.classList.add('card');

  var bodyRowDiv = document.createElement('div');
  bodyRowDiv.classList.add('row');
  bodyRowDiv.classList.add('is-full-width');
  bodyCard.append(bodyRowDiv);

  var bodyDiv = document.createElement('div');
  // the innerText is no longer necessary as this div is the anchor for the
  // horizontal form
  //bodyDiv.innerText = bodies[body].purpose;
  bodyDiv.id = bodies[body].id;
  bodyDiv.title = bodies[body].annotationId;
  bodyDiv.classList.add('is-left');
  bodyDiv.classList.add('col');
  bodyDiv.classList.add('formBodyDiv');
  bodyRowDiv.append(bodyDiv);

  var formRowDiv = document.createElement('div');
  formRowDiv.classList.add('row');
  formRowDiv.classList.add('is-full-width');
  bodyCard.append(formRowDiv);

  // vertical form (needs to be expanded)
  var bodyForm = document.createElement('form');
  bodyForm.id = 'form' + bodies[body].id;
  bodyForm.addEventListener('submit', function (e) {
    e.preventDefault();
  });
  //bodyForm.style.paddingLeft = "20rem";
  //bodyForm.classList.add("is-full-width");
  bodyForm.classList.add('col');
  formRowDiv.append(bodyForm);

  // horizontal form (collapsed "quick-view")
  var bodyFormHorizontal = document.createElement('form');
  bodyFormHorizontal.id = 'formHorizontal' + bodies[body].id;
  bodyFormHorizontal.addEventListener('submit', function (e) {
    e.preventDefault();
  });
  //bodyForm.style.paddingLeft = "20rem";
  //bodyForm.classList.add("is-full-width");
  bodyFormHorizontal.classList.add('col');
  bodyFormHorizontal.classList.add('horizontalFormForm');
  bodyDiv.append(bodyFormHorizontal);

  var iconRow = document.createElement('div');
  iconRow.id = 'iconRow' + body;
  //iconRow.classList.add("is-full-width");
  //iconRow.style.paddingRight = "1rem";
  // TODO: this can maybe be "inherit", if the parentNode has inline-flex
  //iconRow.style.display = "inline-flex";

  var expand = document.createElement('i');
  expand.id = 'expand' + body;
  expand.classList.add('bx');
  expand.classList.add('bx-chevron-right');
  //expand.style.color = "#b5b5be";
  expand.onclick = function () {
    console.log(this.id);
    toggleExpand(document.getElementById(this.id).parentNode.parentNode.parentNode.nextElementSibling);
  };

  var deleteBody = document.createElement('i');
  deleteBody.id = 'delete' + body;
  deleteBody.classList.add('bx');
  deleteBody.classList.add('bx-trash');
  //deleteBody.style.color = "#b5b5be";
  deleteBody.onclick = function () {
    console.log('Hier wird gelöscht!');
    deleteBodyFromAnnotation(
      document.getElementById(this.id).parentNode.parentNode.title,
      document.getElementById(this.id).parentNode.parentNode.id,
    );
  };

  iconRow.append(expand);
  iconRow.append(deleteBody);
  bodyDiv.prepend(iconRow);
  document.getElementById('annotationCard').append(bodyCard);

  var formBodyDataModel = {
    type: 'object',
    properties: {},
  };

  let uiForm = {
    type: 'fieldset',
    items: [],
  };

  for (let key in bodies[body]) {
    //console.log(key);
    // eslint-disable-next-line no-prototype-builtins
    if (bodies[body].hasOwnProperty(key)) {
      // TODO: what is this line even doing?
      let formDataModel = completeFormDataModel(bodies[body], formBodyDataModel, key, omitFields);
      if (key !== 'value' && omitFields.indexOf(key) === -1) {
        uiForm.items.push(key);
      }
    }
  }

  if (bodies[body].value && bodies[body].purpose === 'tadirah:transcription') {
    uiForm.items.push({ key: 'value', type: 'textarea' });
  } else {
    if (bodies[body].value) {
      uiForm.items.push('value');
    }
  }

  //console.log(uiForm);

  //console.log(formBodyDataModel);

  //console.log(bodies[body]);

  let options = { operation: 'UPDATE', dataModel: formBodyDataModel, uiForm: uiForm, resource: bodies[body] };
  $('#form' + bodies[body].id).metadataeditorForm(options, function onSubmitValid(value) {
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
        if (document.getElementById('TEI') != null) {
          // redraw
          updateDisplay();
        }
      },

      error: function (errorData) {
        console.log(errorData);
      },
    });
  });

  // TODO: this should return an element instead of doing some sideffects to create
  // and append an element in the same go
  createHorizontalTextcard(body, bodies, annoId, headerFields, omitFields, editableFields, hooks);
  //document.getElementById(expand.id).parentNode.previousElementSibling.classList.add("is-hidden");
  //document.getElementById(bodyDiv.id).childNodes[0].classList.add("is-hidden");
  //bodyDiv.childNodes[2].classList.add("is-hidden");
  formRowDiv.classList.add('is-hidden');

  return bodyCard;
}

async function createHorizontalTextcard(body, bodies, annoId, headerFields, omitFields, editableFields, hooks) {
  // horizontal form (collapsed "quick-view") creation start
  let operationHorizontal = 'READ';

  let formBodyDataModelHorizontal = {
    type: 'object',
    properties: {},
  };

  let uiFormHorizontal = {
    type: 'fieldset',
    items: [],
  };

  for (let key in bodies[body]) {
    //console.log(key);
    //console.log(bodies[body]);
    // eslint-disable-next-line no-prototype-builtins
    if (bodies[body].hasOwnProperty(key)) {
      formBodyDataModelHorizontal = completeFormDataModel(bodies[body], formBodyDataModelHorizontal, key, omitFields);
      // prepare the ui form
      // push the key and hide it, when its not the value key
      if (key !== 'value' && omitFields.indexOf(key) === -1) {
        // "type" : "hidden" doesn't work; for some reason this prevents
        // the form to be submitted. Instead chotas "is-hidden" class is being used
        uiFormHorizontal.items.push({ key: key, htmlClass: 'is-hidden' });
        // TODO: CUSTOMISE decide which purpose bodies/fields should be editable
        if (key === 'purpose') {
          if (editableFields.includes(bodies[body].purpose)) {
            operationHorizontal = 'UPDATE';
          }
        }
      }
      if (key === 'value' && omitFields.indexOf(key) === -1) {
        uiFormHorizontal.items.push({ key: key, htmlClass: 'horizontalFormDiv' });
      }
    }
  }
  //console.log(formBodyDataModelHorizontal);

  // as we don't want to display the URI, but the actual text of the linked mrw-annotation
  // the resource passed to the metadataeditorForm() via the options needs to have the URI
  // replaced with the text of the linked mrw-annotation. The actual bodies[body] should stay
  // intact though, so bodies[body] will be deep copied
  let resourceHorizontal = JSON.parse(JSON.stringify(bodies[body]));
  // TODO: the following line should be used in the following hooks
  resourceHorizontal = await projectSpecificTextCardCreation(annoId, resourceHorizontal);

  if (hooks.preHorizontalBodyCreation) {
    hooks.preHorizontalBodyCreation.forEach((hook) => {
      hook();
    });
  }

  let optionsHorizontal = {
    operation: operationHorizontal,
    dataModel: formBodyDataModelHorizontal,
    uiForm: uiFormHorizontal,
    resource: resourceHorizontal,
  };
  //console.log(optionsHorizontal);
  $('#formHorizontal' + bodies[body].id).metadataeditorForm(optionsHorizontal, function onSubmitValid(value) {
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
        if (document.getElementById('TEI') != null) {
          // redraw
          updateDisplay();
        }
      },

      error: function (errorData) {
        console.log(errorData);
      },
    });
  });

  // styling of the horizontal form
  // this is done after the form is created as the forms style can't be changed during creation
  // TODO: move parts of this to css

  // remove the wrapping fieldset. the form can't be created without the fieldset
  // due to the code in metadataeditor.js (eg. line 485) requires a JSON object
  // eslint-disable-next-line @stylistic/js/max-len
  // https://stackoverflow.com/questions/19261197/how-can-i-remove-wrapper-parent-element-without-removing-the-child
  let fieldsetHorizontal = document.getElementById('formHorizontal' + bodies[body].id).firstChild.firstChild;
  fieldsetHorizontal.replaceWith(...fieldsetHorizontal.childNodes);

  const formHorizontal = document.getElementById('formHorizontal' + bodies[body].id);
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
      if (input.value !== bodies[body].value) {
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
  // horizontal form (collapsed "quick-view") creation end
  return;
}

function mergeTagsWithTextcards(annotationData) {
  return annotationData.tags.concat(annotationData.textCards);
}

function postBodyCreationModificationButtons($annotationDiv) {
  // adding the functionality to modify the selected text of an annotation
  // to the textCard display
  if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
    var buttonModifySelection = document.createElement('button');
    buttonModifySelection.innerHTML = 'Modify Selection';
    buttonModifySelection.id = 'buttonModifySelection';

    var buttonSaveModification = document.createElement('button');
    buttonSaveModification.type = 'submit';
    buttonSaveModification.innerHTML = 'Save Modification';
    buttonSaveModification.id = 'buttonSaveModification';
    buttonSaveModification.disabled = true;
    buttonSaveModification.classList.add('is-hidden');

    var buttonCancelModification = document.createElement('button');
    buttonCancelModification.type = 'submit';
    buttonCancelModification.innerHTML = 'Cancel Modifcation';
    buttonCancelModification.id = 'buttonCancelModification';
    buttonCancelModification.style.backgroundColor = '#c82525';
    buttonCancelModification.disabled = true;
    buttonCancelModification.classList.add('is-hidden');

    $annotationDiv.append(buttonModifySelection);
    buttonModifySelection.addEventListener('mousedown', (event) => {
      modifySelection(event, window.SELECTED_ANNOTATION);
    });
    $annotationDiv.append(buttonSaveModification);
    buttonSaveModification.addEventListener('mousedown', (event) => {
      saveModification(event, window.getSelection(), window.SELECTED_ANNOTATION);
    });
    $annotationDiv.append(buttonCancelModification);
    buttonCancelModification.addEventListener('mousedown', cancelModification);
  }
}

function postBodyCreationAddLinkToAnalysisTool(annotationData, annoId, $annotationDiv) {
  addLinkToAnalysisTool(annotationData, annoId, $annotationDiv);
}
