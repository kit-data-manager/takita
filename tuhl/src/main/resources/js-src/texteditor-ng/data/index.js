
export function deleteBodyFromAnnotation(annoId, bodyId) {
    let confirmation = confirm('Are you sure to delete this body?');
  
    if (confirmation) {
      //console.log(annoId);
      //console.log(bodyId);
  
      let annoIdEncoded = encodeAnnoId(annoId);
  
      $.ajax({
        type: 'DELETE',
        url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId,
  
        success: function (_responseData) {
          //console.log(responseData);
          selectAnnotation(null, annoIdEncoded);
          // updating the display for text annotation
          // checking if TEI-element is null. it is defined for text annotation,
          // but not for image annotation
          if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
            // redrawing all annotations
            updateDisplay();
          }
        },
  
        error: function (errorData) {
          console.log(errorData);
  
          $.ajax({
            type: 'DELETE',
            url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + bodyId,
  
            success: function (_responseData) {
              //console.log(responseData);
              selectAnnotation(null, annoIdEncoded);
              // TODO: this is just a bandaid for now as it empties the tags array completly
              // so if there would be multiple tags none would be left, even if only one got
              // deleted. For now in (CRC1475) an annotation only has one tag anyways.
  
              // updating the display for text annotation
              // checking if TEI-element is null. it is defined for text annotation,
              // but not for image annotation
              if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
                // redrawing all annotations
                updateDisplay();
              }
            },
          });
        },
      });
    }
  }
  
  export function deleteAnnotation(annoId) {
    let confirmation = confirm('Are you sure to delete this annotation?');
  
    if (confirmation) {
      let annoIdEncoded = encodeAnnoId(annoId);
  
      $.ajax({
        type: 'DELETE',
        url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded,
  
        success: function (_responseData) {
          //console.log(responseData);
          if (!document.getElementById('annotationCard').classList.contains('is-hidden')) {
            toggleOverview('annotationCard');
          }
  
          // updating the display for image annotation
          // checking if paper is defined. it is defined for image annotation,
          // but not for text annotation
          if (window.EDITORTYPE == 'IMAGE' && window.PAPER != undefined) {
            window.PAPER.forEach(function (element) {
              if (element.annoId === annoId) {
                element.remove();
              }
            });
          }
  
          // this for-loop is unnecessary for the textEditor
          // as the updateDisplay()-function updates the annoJson as well
          // the imageEditor still needs the for-loop
          for (let anno in window.ANNOJSON) {
            if (window.ANNOJSON[anno].id === annoId) {
              //console.log(annoId + " this must go!")
              window.ANNOJSON.splice(anno, 1);
            }
          }
  
          // updating the display for text annotation
          // checking if TEI-element is null. it is defined for text annotation,
          // but not for image annotation
          if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
            // redrawing all annotations
            updateDisplay();
          }
  
          // maybe move it within the if clause?
          //console.log(annoJson);
          fillMetaDataEditorTable(window.ANNOJSON);
        },
      });
    }
  }
  

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
        window.SELECTED_ANNOTATION = JSON.parse(JSON.stringify(responseJson));
        // check if the annotation is compatible with the code, i.e. has
        // one xPath for each target and not one long xPath including all targets.
        // Make it compatible, if is are not
        if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
          if (!checkIsTargetCompatible(window.SELECTED_ANNOTATION)) {
            window.SELECTED_ANNOTATION.targets = makeTargetsCompatible(window.SELECTED_ANNOTATION);
          }
          // highlight words targetted by the currently selected annotation
          // remove old highlights (TODO: include this in removeStyles(el) in editor_xml.js)
          document.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'));
          // add a class to all the targets of the selected annotation
          window.SELECTED_ANNOTATION.targets.forEach((target) => {
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
  
        for (let field in headerFields) {
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
            // eslint-disable-next-line no-prototype-builtins
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
            // eslint-disable-next-line no-prototype-builtins
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
          resourceHorizontal = await projectSpecificTextCardCreation(annoId, resourceHorizontal);
  
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
  
          //document.getElementById(expand.id).parentNode.previousElementSibling.classList.add("is-hidden");
          //document.getElementById(bodyDiv.id).childNodes[0].classList.add("is-hidden");
          //bodyDiv.childNodes[2].classList.add("is-hidden");
          formRowDiv.classList.add('is-hidden');
        }
  
        projectSpecificAnnoDivCreation(responseJson, annoId, annotationDiv);
  
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
  
          annotationDiv.append(buttonModifySelection);
          document.getElementById('buttonModifySelection').addEventListener('mousedown', (event) => {
            modifySelection(event, window.SELECTED_ANNOTATION);
          });
          annotationDiv.append(buttonSaveModification);
          document.getElementById('buttonSaveModification').addEventListener('mousedown', (event) => {
            saveModification(event, window.getSelection(), window.SELECTED_ANNOTATION);
          });
          annotationDiv.append(buttonCancelModification);
          document.getElementById('buttonCancelModification').addEventListener('mousedown', cancelModification);
        }
      },
    });
  }

  // gets the describing body of an annotation (mrw-annotation)
// used by src/main/resources/js-src/common/annotationDisplay/selection.js
async function getMRWAnnoSelectedText(metaphorAnnoId, mrwAnnoId) {
    console.log('Trying to get annotation ', mrwAnnoId, ' which is linked to ', metaphorAnnoId);
    const response = await fetch(window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(mrwAnnoId), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const mrwAnno = await response.json();
      const describingBody = mrwAnno.textCards.filter((textCard) => textCard.purpose === 'describing')[0];
      return describingBody.value;
    } else {
      // if the mrw-annotation linked to the metaphor-annotation got deleted the code will end up here
      return (
        'ERROR: Something is wrong with the linked mrw-annotation;' +
        'most likely it got deleted, please contact the developers.'
      );
    }
  }

  // recursive function to store all the necessary bodies
// ensures sequential creation, otherwise body creation will fail due to etag mismatch
export function storeBody(responseJson, jsonObject, index) {
    let endpoint;
    let bodyDataJson;
  
    console.log('Key of the json object for body-creation: ', Object.keys(jsonObject)[index]);
    if (Object.keys(jsonObject)[index]) {
      if (Object.keys(jsonObject)[index] === 'color') {
        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/bodies';
        switch (jsonObject.color) {
          case '#e2b8f7':
            bodyDataJson = { purpose: 'classifying', subject: 'PageRegion' };
            $.ajax({
              type: 'POST',
              url: endpoint,
              data: JSON.stringify(bodyDataJson),
              headers: {
                'Content-Type': 'application/json',
              },
  
              success: function (responseData) {
                console.log(responseData);
                storeBody(responseJson, jsonObject, index + 1);
              },
  
              error: function (errorData) {
                console.log(errorData);
              },
            });
            break;
          case '#00edff':
            bodyDataJson = {
              purpose: 'classifying',
              subject: 'TextRegion',
              source: 'http://episteme.org/A04Vokabular#text_block',
            };
            $.ajax({
              type: 'POST',
              url: endpoint,
              data: JSON.stringify(bodyDataJson),
              headers: {
                'Content-Type': 'application/json',
              },
  
              success: function (responseData) {
                console.log(responseData);
                storeBody(responseJson, jsonObject, index + 1);
              },
  
              error: function (errorData) {
                console.log(errorData);
              },
            });
            break;
          default:
            storeBody(responseJson, jsonObject, index + 1);
        }
      } else {
        // defines the correct endpoints and purposes for the AJAX call
        if (
          Object.keys(jsonObject)[index] === 'reference' ||
          Object.keys(jsonObject)[index] === 'anchor' ||
          Object.keys(jsonObject)[index] === 'tag'
        ) {
          endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/tags';
          console.log('Tag to store: ', Object.keys(jsonObject)[index]);
          bodyDataJson = { value: jsonObject[Object.keys(jsonObject)[index]] };
        } else {
          endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/bodies';
  
          console.log('Body to store: ', Object.keys(jsonObject)[index]);
          // TODO: CUSTOMISE assignment of purpose to an annotation body
          if (Object.keys(jsonObject)[index] === 'transcription') {
            bodyDataJson = { purpose: 'tadirah:transcription', value: jsonObject[Object.keys(jsonObject)[index]] };
          } else if (Object.keys(jsonObject)[index] === 'selectedText') {
            // storing the selected text
            bodyDataJson = { purpose: 'describing', value: jsonObject[Object.keys(jsonObject)[index]] };
          } else if (Object.keys(jsonObject)[index].includes('mrws')) {
            // linking mrw and metaphor annotation; includes has to be used here
            // as there can be multiple keys=mrws, with ascending numbers appended
            bodyDataJson = { purpose: 'linking', value: jsonObject[Object.keys(jsonObject)[index]] };
          } else if (Object.keys(jsonObject)[index] === 'label') {
            // human readable label
            bodyDataJson = { purpose: 'identifying', value: jsonObject[Object.keys(jsonObject)[index]] };
          } else if (Object.keys(jsonObject)[index] === 'comment') {
            // user entered comment, if no comment given, the key will not be present and no body will be created
            bodyDataJson = { purpose: 'commenting', value: jsonObject[Object.keys(jsonObject)[index]] };
          } else if (Object.keys(jsonObject)[index] === 'classification') {
            // classification of the text as something (eg. mrw-direct or metaphor)
            bodyDataJson = { purpose: 'classifying', value: jsonObject[Object.keys(jsonObject)[index]] };
          } else {
            bodyDataJson = { purpose: 'classifying', value: jsonObject[Object.keys(jsonObject)[index]] };
          }
        }
  
        $.ajax({
          type: 'POST',
          url: endpoint,
          data: JSON.stringify(bodyDataJson),
          headers: {
            'Content-Type': 'application/json',
          },
  
          success: function (_responseData) {
            storeBody(responseJson, jsonObject, index + 1);
          },
  
          error: function (errorData) {
            console.log(errorData);
          },
        });
      }
    } else {
      // if no more body needs to be created, hide modal and update global annotation list
      // and highlight the new annotation
  
      // the following check needs to be done as this storeBody function is used since June 2023
      // for the addition of multiple bodies to an annotation. The function was implemented to
      // be used while creating annotations and not adding bodies, so it previously just toggled
      // the display of the createAnnotation-modal, but now it only toggles the modal, if it
      // is shown.
      if (document.getElementById('createAnnotation').classList.contains('show-modal')) {
        document.getElementById('createAnnotation').classList.toggle('show-modal');
      }
      selectAnnotation(null, encodeAnnoId(responseJson.id));
      if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
        toggleOverview('annotationCard');
      }
  
      // this is not needed anymore for the textEditor since commit 0f347413a3250dd7b79c4a9171630b7556a28f9b on 14.06.23
      // as tAkita js now gets a new annoJson from tAkita core and doesn't update it by itself
      /* let newAnnotation = {
      "created" : new Date(responseJson.created.seconds * 1000 + responseJson.created.nanos / 1000000).toISOString(), 
      "creator" : responseJson.creators, "id" : responseJson.id, "idEncoded" : encodeAnnoId(responseJson.id), 
      "modified" : new Date(responseJson.modified.seconds * 1000 + responseJson.modified.nanos / 1000000).toISOString(), 
      "motivation" : responseJson.motivation, "visible" : true}; 
      */
  
      // redrawing all annotations
      updateDisplay();
  
      fillMetaDataEditorTable(window.ANNOJSON);
      //document.getElementById('createRectangleButton').parentElement.classList.remove('active');
      //document.getElementById('createPolygonButton').parentElement.classList.remove('active');
      document.getElementById('createAnnotationForm').removeAttribute('title');
  
      return;
    }
  }

  /**
 * function called by an eventHandler attached to `document.getElementById('updateTargetButton')`
 * to update the target of an annotation
 *
 * @param {event} _event
 * @param {JSONObject} annotation the curretnly selected annotation, which will have its target updated
 * @param {String} targetXPath the new xPath
 * @param {String} newSelectedText the new selected text
 */
export function updateTarget(_event, annotation, targetXPath, newSelectedText) {
    let idOfAnnotationToUpdate = encodeAnnoId(annotation.id);
  
    // update the target of an annotation (and the "purpose:describing" body, if it exists) by sending a put request
    let colorName = getColorNameFromEnumEntry(annotation.color);
    let annotationDataJson = { color: colorName, motivation: 'describing', svgCode: targetXPath };
    $.ajax({
      type: 'PUT',
      url: window.CONTEXTPATH + 'editor_rest/annotations/' + idOfAnnotationToUpdate,
      data: JSON.stringify(annotationDataJson),
      headers: {
        'Content-Type': 'application/json',
      },
  
      success: function (responseData) {
        console.log('Response data from succesfull target update: ', responseData);
  
        let responseDataJson = JSON.parse(responseData);
  
        // TODO: only temporary solution to update the body containing the selected text
        // if the purpose changes, the following needs to be changed
        let result = null;
        result = responseDataJson.textCards.filter((textCard) => textCard.purpose === 'describing');
        if (result != null && result.length > 0) {
          // TODO: fix, when it goes into production, bc then the innerHTML will only be
          // the selected text without any "|"s
          // let newSelectedText = document.getElementById('newSelectedText').children[0].innerHTML.split('|')[0];
          // TODO: this following call makes no sense as its return is not stored
          // newSelectedText.slice(0, newSelectedText.length - 1);
          // TODO: should there not be a field to store, who modified the body in addition
          // to the timestamp of the modification?
          // console.log(responseDataJson.creators);
          let updatedBody = {
            created: new Date(
              responseDataJson.created.seconds * 1000 + responseDataJson.created.nanos / 1000000,
            ).toISOString(),
            creators: responseDataJson.creators,
            id: result[0].id,
            modified: new Date(
              responseDataJson.modified.seconds * 1000 + responseDataJson.modified.nanos / 1000000,
            ).toISOString(),
            purpose: result[0].purpose,
            value: newSelectedText,
          };
          console.log('Updated body: ', updatedBody);
  
          let annoIdEncoded = encodeAnnoId(responseDataJson.id);
          let endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + result[0].id;
          console.log('Endpoint for body update: ', endpoint);
  
          $.ajax({
            type: 'PUT',
            url: endpoint,
            data: JSON.stringify(updatedBody),
            headers: {
              'Content-Type': 'application/json',
            },
  
            success: function (responseData) {
              // show the updated annotation
              selectAnnotation(null, encodeAnnoId(responseDataJson.id));
              console.log('Response data from succesfull body update: ', responseData);
            },
  
            error: function (errorData) {
              console.log('Error data from failed body update: ', errorData);
            },
          });
        }
  
        // redraw
        updateDisplay();
  
        // hide modal
        document.getElementById('updateSelection').classList.toggle('show-modal');
        //document.getElementById('modifyButton').parentElement.classList.remove('active');
        window.MODE = window.MODE_CLASS.View;
        window.SELECTING_TEXT = false;
  
        // show the updated annotation
        selectAnnotation(null, encodeAnnoId(responseDataJson.id));
      },
  
      error: function (errorData) {
        console.log('Error data from failed target update: ', errorData);
      },
    });
  }


// get all displayable annotations and store them in the annoJson
// this function is used to get an updated annoJson after an
// annotation got created/modified/deleted
export async function getAnnoJson() {
    const response = await fetch(window.CONTEXTPATH + 'editor/' + window.CURRENTPAGEID + '/displayableAnnotationsJSON', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return await response.json();
  }


  function createAnnotation(){
  $.ajax({
    type: 'POST',
    url: window.CONTEXTPATH + 'editor_rest/annotations',
    data: JSON.stringify(annotationDataJson),
    headers: {
      'Content-Type': 'application/json',
    },

    success: function (responseData) {
      let responseJson = JSON.parse(responseData);
      // philipp: why does the id not exist? i needed to add it here manually
      // philipp: what did i mean here?

      // if needed: store the annotation ID within the
      // corresponding shape
      /*this might be needed later to highlight a selection
                  let shape;
                  paper.forEach(function(element) {
                      if (element.type === "rect" || element.type === "path") {
                          shape = element;
                      }
                  });
                  if (document.getElementById("createAnnotationForm").title !== "") {
                      shape.annoId = responseJson.id;
                      shape.annoIdEncoded = encodeAnnoId(responseJson.id);
                      shape.attr({'stroke': color, 'fill': color});
                      toggleShapeSelect(shape);
                  };*/

      // trigger the body creation according to the template
      storeBody(responseJson, jsonObject, 0);
    },

    error: function (errorData) {
      console.log(errorData);
    },
  });
}

function createBody(){
    let endpoint;
    if ('purpose' in jsonObject) {
      endpoint =
        window.CONTEXTPATH +
        'editor_rest/annotations/' +
        document.getElementById('createForm').title +
        '/bodies';
    } else {
      endpoint =
        window.CONTEXTPATH + 'editor_rest/annotations/' + document.getElementById('createForm').title + '/tags';
    }

    $.ajax({
      type: 'POST',
      url: endpoint,
      data: value,
      headers: {
        'Content-Type': 'application/json',
      },

      success: function (responseData) {
        console.log(responseData);
        selectAnnotation(null, document.getElementById('createForm').title);
        document.getElementById('createBody').classList.toggle('show-modal');
      },

      error: function (errorData) {
        console.log(errorData);
      },
    });
  }