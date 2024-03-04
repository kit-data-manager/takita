// external modules
import { $ } from 'jquery';
// internal modules
import { encodeAnnoId, completeFormDataModel, toggleExpand } from '../utils';
import { deleteAnnotation, deleteBodyFromAnnotation } from './deletion';
import {
  updateDisplay,
  checkIsTargetCompatible,
  makeTargetsCompatible,
  pickTemplate,
  modifySelection,
  saveModification,
  cancelModification,
} from '../../texteditor/annotationEditor';

// TODO: CUSTMOISE add project specific imports
import { addLinkToAnalysisTool, updateLinkingTextcard } from '../../projectspecific/crc1475';

// called when you select an annotation to display the textCard.
export function selectAnnotation(_event, annoId) {
  $.ajax({
    type: 'GET',
    url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoId,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    // Needs to be async for the textCard of a metaphor-annotation
    // to display the text selected by the mrw-annotation (see switch/case)
    // as it needs to await the response of a HTTP-request
    success: async function (responseJson) {
      console.log(responseJson);

      // this globalSelectedAnnotation variable is needed for the
      // - edit/update function in editor_xml.js
      // - for the highlighting of the words targeted by the currently
      //   selected annotation/displayed textCard
      globalSelectedAnnotation = JSON.parse(JSON.stringify(responseJson));
      // check if the annotation is compatible with the code, i.e. has
      // one xPath for each target and not one long xPath including all targets.
      // Make it compatible, if is are not
      if (document.getElementById('TEI') != null) {
        if (!checkIsTargetCompatible(globalSelectedAnnotation)) {
          makeTargetsCompatible(globalSelectedAnnotation);
        }
        // highlight words targetted by the currently selected annotation
        // remove old highlights (TODO: include this in removeStyles(el) in editor_xml.js)
        document.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'));
        // add a class to all the targets of the selected annotation
        globalSelectedAnnotation.targets.forEach((target) => {
          const targetId = target.selector.xPath.split('"')[1];
          document.getElementById(targetId).classList.add('selected');
        });
      }

      if (responseJson.created.seconds) {
        responseJson.created = new Date(
          responseJson.created.seconds * 1000 + responseJson.created.nanos / 1000000,
        ).toISOString();
        if (responseJson.modified.seconds) {
          responseJson.modified = new Date(
            responseJson.modified.seconds * 1000 + responseJson.modified.nanos / 1000000,
          ).toISOString();
        }
      }

      //toggleOverview('annotationCard');

      //var responseJson = JSON.parse(responseData);
      var annotationDiv = document.getElementById('annotationCard');
      //console.log(annotationDiv);
      //console.log(annotationDiv.childElementCount);
      while (annotationDiv.lastElementChild) {
        annotationDiv.removeChild(annotationDiv.lastElementChild);
      }

      var iconRowTop = document.createElement('div');
      iconRowTop.id = 'iconRowTop';
      iconRowTop.title = responseJson.id;

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
        pickTemplate('', encodeAnnoId(responseJson.id), 'createForm', 'pickBodyTemplateForm', 'bodyTemplate');
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

      const headerFields = ['created', 'creators', 'modified', 'generator', 'motivation', 'target', 'via'];
      const omitFields = ['type', 'selector', 'fullJson', 'annotationId', 'motivation', 'created'];

      for (field in headerFields) {
        if (responseJson[headerFields[field]]) {
          //console.log(responseJson[headerFields[field]]);
          formDataModel = completeFormDataModel(responseJson, formDataModel, headerFields[field], omitFields);
        }
      }

      //console.log(formDataModel);

      let options = { operation: 'READ', dataModel: formDataModel, uiForm: '*', resource: responseJson };

      $('#annotationCard').metadataeditorForm(options, function onSubmitValid(_value) {
        //console.log(value);
      });

      annotationDiv.prepend(iconRowTop);

      var bodies = responseJson.tags.concat(responseJson.textCards);

      for (let body in bodies) {
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
          if (bodies[body].hasOwnProperty(key)) {
            formDataModel = completeFormDataModel(bodies[body], formBodyDataModel, key, omitFields);
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
          if (bodies[body].hasOwnProperty(key)) {
            formBodyDataModelHorizontal = completeFormDataModel(
              bodies[body],
              formBodyDataModelHorizontal,
              key,
              omitFields,
            );
            // prepare the ui form
            // push the key and hide it, when its not the value key
            if (key !== 'value' && omitFields.indexOf(key) === -1) {
              // "type" : "hidden" doesn't work; for some reason this prevents
              // the form to be submitted. Instead chotas "is-hidden" class is being used
              uiFormHorizontal.items.push({ key: key, htmlClass: 'is-hidden' });
              // TODO: CUSTOMISE decide which purpose bodies/fields should be editable
              if (key === 'purpose') {
                const editableFields = ['tagging', 'commenting', 'identifying', 'classifying'];
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
        resourceHorizontal = await projectSpecificTextCardCreation(resourceHorizontal);

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

            success: function (responseData) {
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
              //console.log(errorData);
            },
          });
        });

        // styling of the horizontal form
        // this is done after the form is created as the forms style can't be changed during creation
        // TODO: move parts of this to css

        // remove the wrapping fieldset. the form can't be created without the fieldset
        // due to the code in metadataeditor.js (eg. line 485) requires a JSON object
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

        //document.getElementById(expand.id).parentNode.previousElementSibling.classList.add("is-hidden");
        //document.getElementById(bodyDiv.id).childNodes[0].classList.add("is-hidden");
        //bodyDiv.childNodes[2].classList.add("is-hidden");
        formRowDiv.classList.add('is-hidden');
      }

      projectSpecificAnnoDivCreation(responseJson, annoId, annotationDiv);

      // adding the functionality to modify the selected text of an annotation
      // to the textCard display
      if (document.getElementById('TEI') != null) {
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

        annotationDiv.append(buttonModifySelection);
        document.getElementById('buttonModifySelection').addEventListener('mousedown', modifySelection);
        annotationDiv.append(buttonSaveModification);
        document.getElementById('buttonSaveModification').addEventListener('mousedown', saveModification);
        annotationDiv.append(buttonCancelModification);
        document.getElementById('buttonCancelModification').addEventListener('mousedown', cancelModification);
      }
    },
  });
}

// TODO: CUSTOMISE this function and add corresponding imports
// to change the horizontal display of a textcard
async function projectSpecificTextCardCreation(resourceHorizontal) {
  return await updateLinkingTextcard(resourceHorizontal);
}

// TODO: CUSTOMISE this function and add corresponding imports
// to change the div displaying the annotation
function projectSpecificAnnoDivCreation(responseJson, annoId, annotationDiv) {
  addLinkToAnalysisTool(responseJson, annoId, annotationDiv);
}
