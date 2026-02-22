// gets the describing body of an annotation (mrw-annotation)
async function getMRWAnnoSelectedText(annoId) {
  console.log('Trying to get annotation ', annoId, ' which is linked to ', globalSelectedAnnotation);
  const response = await fetch(window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(annoId), {
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
    return 'ERROR: Something is wrong with the linked mrw-annotation; most likely it got deleted, please contact the developers.';
  }
}

// called when you select an annotation to display the textCard.
function selectAnnotation(event, annoId) {
  $.ajax({
    type: 'GET',
    url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoId,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

        success: function(responseJson) {
            console.log(responseJson);
            if (responseJson.created) {
                responseJson.created = new Date(responseJson.created * 1000).toISOString();
                if(responseJson.modified) {
                    responseJson.modified = new Date(responseJson.modified * 1000).toISOString();
                };
            };
  
            //toggleOverview('annotationCard');
            
            //var responseJson = JSON.parse(responseData);
            var annotationDiv = document.getElementById("annotationCard");

            while (annotationDiv.lastElementChild) {
              annotationDiv.removeChild(annotationDiv.lastElementChild);  
            };
            
            var iconRowTop = document.createElement("div");
            iconRowTop.id = "iconRowTop";
            iconRowTop.title = responseJson.id;
                
            var addBody = document.createElement("i");
            addBody.id = "addBody";
            addBody.classList.add("bx");
            addBody.classList.add("bx-plus");
            addBody.onclick = function() {
                console.log("create");
                let createBody = document.getElementById('createBody');
                let createBodyModal = bootstrap.Modal.getOrCreateInstance(createBody);
                createBodyModal.toggle();
                pickTemplate("",encodeAnnoId(responseJson.id), "createForm", "pickBodyTemplateForm", "bodyTemplate");
            };
                
            var deleteAnnotationIcon = document.createElement("i");
            deleteAnnotationIcon.id = "deleteAnnotation";
            deleteAnnotationIcon.classList.add("bx");
            deleteAnnotationIcon.classList.add("bx-trash");
            deleteAnnotationIcon.onclick = function() {console.log("Hier wird gelöscht!"); deleteAnnotation(document.getElementById(this.id).parentNode.title)};
            
            iconRowTop.append(addBody);
            iconRowTop.append(deleteAnnotationIcon);
            iconRowTop.classList.add("text-end");
            
            var formDataModel = {
                "type": "object",
                "properties": {}
            };
            
            const headerFields = ["created", "creators", "modified", "generator", "motivation", "target", "via"];
            const omitFields = ["type", "selector", "fullJson", "annotationId"];
            
            for (field in headerFields) {
                if (responseJson[headerFields[field]]) {
                    formDataModel = completeFormDataModel(responseJson, formDataModel, headerFields[field], omitFields);    
                };
            };
            
            options = {operation: "READ", dataModel: formDataModel, uiForm: "*", resource: responseJson};
            
            $('#annotationCard').metadataeditorForm(options, function onSubmitValid(value) {
                console.log(value);
            });
            
            annotationDiv.prepend(iconRowTop);
            
            var bodies = responseJson.tags.concat(responseJson.textCards);
            
            for (let body in bodies) {
                if (bodies[body].created) {
                    bodies[body].created = new Date(bodies[body].created * 1000).toISOString();
                };
                
                // bodies can have a modified date without having a created date
                // 'legacy annotations'
                if (bodies[body].modified) {
                    bodies[body].modified = new Date(bodies[body].modified * 1000).toISOString();
                };
                
                var bodyCard = document.createElement("div");
                bodyCard.classList.add("card");
                
                var bodyRowDiv = document.createElement("div");
                bodyRowDiv.classList.add("row");
                bodyCard.append(bodyRowDiv);
                
                var bodyDiv = document.createElement("div");
                bodyDiv.id = bodies[body].id;
                bodyDiv.title = bodies[body].annotationId;
                bodyDiv.classList.add("text-start");
                bodyDiv.classList.add("col");
                bodyRowDiv.append(bodyDiv);
                
                var formRowDiv = document.createElement("div");
                formRowDiv.classList.add("row");
                bodyCard.append(formRowDiv);
                
                var bodyForm = document.createElement("form");
                bodyForm.id = "form" + bodies[body].id;
                bodyForm.addEventListener('submit', function(e) {e.preventDefault();});
                bodyForm.classList.add("col");
                formRowDiv.append(bodyForm);
                
                var iconRow = document.createElement("div");
                iconRow.id = "iconRow" + body;
                iconRow.style.paddingRight = "1rem";
                
                var expand = document.createElement("i");
                expand.id = "expand" + body;
                expand.classList.add("bx");
                expand.classList.add("bx-chevron-right");
                //expand.style.color = "#b5b5be";
                expand.onclick = function() {console.log(this.id); toggleExpand(document.getElementById(this.id).parentNode.parentNode.parentNode.nextElementSibling);};
                
                var deleteBody = document.createElement("i");
                deleteBody.id = "delete" + body;
                deleteBody.classList.add("bx");
                deleteBody.classList.add("bx-trash");
                //deleteBody.style.color = "#b5b5be";
                deleteBody.onclick = function() {console.log("Hier wird gelöscht!"); deleteBodyFromAnnotation(document.getElementById(this.id).parentNode.parentNode.title, document.getElementById(this.id).parentNode.parentNode.id);};
                
                var purpose = document.createElement('span');
                purpose.textContent = bodies[body].purpose;

                iconRow.append(expand);
                iconRow.append(deleteBody);
                iconRow.append(purpose);
                document.getElementById('annotationCard').append(bodyCard);
                
                var formBodyDataModel = {
                "type": "object",
                "properties": {}
                };
                
                let uiForm = {
                    "type" : "fieldset",
                    "items" : []
                };
                
                for (let key in bodies[body]) {
                    if(bodies[body].hasOwnProperty(key)) {
                        formDataModel = completeFormDataModel(bodies[body], formBodyDataModel, key, omitFields);
                        if (key !== "value" && omitFields.indexOf(key) === -1) {
                            uiForm.items.push(key);    
                        }
                    };
                };
                
                if(bodies[body].value && bodies[body].purpose === "tadirah:transcription") {
                    uiForm.items.push({"key": "value", "type": "textarea"});
                } else {
                    if(bodies[body].value) {
                        uiForm.items.push("value");
                    };
                };
                
                options = {operation: "UPDATE", dataModel: formBodyDataModel, uiForm: uiForm, resource: bodies[body]};
            
                $('#form' + bodies[body].id).metadataeditorForm(options, function onSubmitValid(value) {
                    var jsonObject = JSON.parse(value);
    
                    var endpoint;
                    var annoIdEncoded = encodeAnnoId(document.getElementById("iconRowTop").title);
                    
                    if (jsonObject.purpose==="tagging") {
                        endpoint = '/editor_rest/annotations/' + annoIdEncoded + '/tags/' + jsonObject.id;
                    } else {
                        endpoint = '/editor_rest/annotations/' + annoIdEncoded + '/bodies/' + jsonObject.id;
                    };
                    
                    $ .ajax({
                        type: 'PUT',
                        url: endpoint,
                        data: value,
                        headers: {
                            'Content-Type' : 'application/json'
                        },

                        success: function(responseData) {
                            console.log(responseData);
                            selectAnnotation(null, annoIdEncoded);
                        },
        
                        error: function(errorData) {
                            console.log(errorData);
                        }
                    });
                });
                bodyDiv.prepend(iconRow);
                formRowDiv.classList.add("collapse");
                
            };
        }                
    });
};

function deleteBodyFromAnnotation(annoId, bodyId) {
    let confirmation = confirm("Are you sure to delete this body?");
    
    if (confirmation) {
    
        let annoIdEncoded = encodeAnnoId(annoId);
    
        $ .ajax({
            type: 'DELETE',
            url: '/editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId,

  if (confirmation) {

    let annoIdEncoded = encodeAnnoId(annoId);

    $.ajax({
      type: 'DELETE',
      url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId,

      success: function (responseData) {
        //console.log(responseData);
        selectAnnotation(null, annoIdEncoded);
        // updating the display for text annotation
        // checking if TEI-element is null. it is defined for text annotation,
        // but not for image annotation
        if (document.getElementById('TEI') != null) {
          // redrawing all annotations
          updateDisplay();
        }
      },

      error: function (errorData) {
        //console.log(errorData);

        $.ajax({
          type: 'DELETE',
          url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + bodyId,

          success: function (responseData) {
            //console.log(responseData);
            selectAnnotation(null, annoIdEncoded);
            // TODO: this is just a bandaid for now as it empties the tags array completly
            // so if there would be multiple tags none would be left, even if only one got
            // deleted. For now in (CRC1475) an annotation only has one tag anyways.

            // updating the display for text annotation
            // checking if TEI-element is null. it is defined for text annotation,
            // but not for image annotation
            if (document.getElementById('TEI') != null) {
              // redrawing all annotations
              updateDisplay();
            }
          },
        });
      },
    });
  }
}

function encodeAnnoId(annoId) {
    var annoIdEncoded = encodeURIComponent(annoId);
    var annoIdEncodedDouble = encodeURIComponent(annoIdEncoded);
    return annoIdEncodedDouble;
}

function deleteAnnotation(annoId) {
    let confirmation = confirm("Are you sure to delete this annotation?");
    
    if(confirmation) {
        let annoIdEncoded = encodeAnnoId(annoId);
        
        $ .ajax({
            type : 'DELETE',
            url : window.CONTEXTPATH + '/editor_rest/annotations/' + annoIdEncoded,
            
            success: function(responseData) {
                console.log(responseData);
                if (!document.getElementById('annotationCard').classList.contains('invisible')) {
                    toggleOverview('annotationCard');
                };
                
                paper.forEach(function(element) {
                    if (element.annoId === annoId) {
                        element.remove();
                    };
                });
                
                for (let anno in annoJson) {
                    if (annoJson[anno].id === annoId) {
                        console.log(annoId + " this must go!")
                        annoJson.splice(anno, 1);
                    };
                };
                
                // maybe move it within the if clause?
                console.log(annoJson);
                fillMetaDataEditorTable(annoJson);
            }
          });
        };
    };
    

function completeFormDataModel (responseJson, formDataModel, addition, omitFields) {
    if (Array.isArray(responseJson[addition])) {
        if (responseJson[addition][0] instanceof Object && (omitFields.indexOf(addition) === -1)) {
            var properties = {};
            var keys = [];
            for (let jsonObject in responseJson[addition]) {
                keys.push(Object.keys(responseJson[addition][jsonObject]));
            };
                            
            var uniqueKeys = [...new Set(keys.flat())];
                            
            for (let key in uniqueKeys) {
                if (omitFields.indexOf(uniqueKeys[key]) === -1) {
                    properties[uniqueKeys[key]] = {
                        "type" : "string",
                        "title" : uniqueKeys[key]
                    };
                };
            };
         
            formDataModel.properties[addition] = {
                "type" : "array",
                "items" : {
                    "type" : "object",
                    "title" : addition,
                    "properties" : properties
                }
            };
        } else
            if(omitFields.indexOf(addition) === -1) {
                formDataModel.properties[addition] = {
                    "type" : "array",
                    "items" : {
                        "type" : "string",
                        "title" : addition
                    }
                };
            };
                        
    } else 
        if (responseJson[addition] instanceof Object && (omitFields.indexOf(addition) === -1)) {
            var objectKeys = Object.keys(responseJson[addition]);
                                
            var objectProperties = {
                "type" : "object",
                "properties" : {}
            };
            
            for (let key in objectKeys) {
                if (omitFields.indexOf(objectKeys[key]) === -1) {
                    objectProperties.properties[objectKeys[key]] = {
                        "type" : "string",
                        "title" : objectKeys[key]
                    };
                };
            };
                                
            formDataModel.properties[addition] = objectProperties;
        
        } else {
            if (omitFields.indexOf(addition) === -1) {
                formDataModel.properties[addition] = {
                    "type" : "string",
                    "title" : addition
                };
            };
        
        };
      }
    }

    formDataModel.properties[addition] = objectProperties;
  } else {
    // changes to work for the "quick-view"
    let title = addition;
    // if the formDataModel entry for the "value" of the body is created
    // relpace the title with the "purpose" of the body
    if (addition === 'value') {
      // title = responseJson.purpose;
      // TODO: CUSTOMISE the text to be displayed on the "quick-view" of the
      // textCard
      switch (responseJson.purpose) {
        case 'tagging':
          title = 'Tag: ';
          break;
        case 'linking':
          title = 'Linked mrw-annotation: ';
          break;
        case 'classifying':
          title = 'Classification: ';
          break;
        case 'describing':
          title = 'Selected text: ';
          break;
        case 'identifying':
          title = 'Label: ';
          break;
        case 'assessing':
          title = 'Analysis: ';
          break;
        case 'commenting':
          title = 'Comment: ';
          break;
        default:
          title = responseJson.purpose + ': ';
      }
    }
    // console.log(title);
    if (omitFields.indexOf(addition) === -1) {
      formDataModel.properties[addition] = {
        type: 'string',
        title: title,
      };
    }
  }
  return formDataModel;
}

// returning to table view of repository data
function goHome() {
  location.href = window.CONTEXTPATH;
}

// toggling the side bar
// all text elements should not be hoverable when side bar is collapsed
function toggleAnnoSideBar() {
  let sideBar = document.querySelector('.anno-side-bar');
  let arrowCollapse = document.querySelector('#logo-name__icon');
  let textElements = document.querySelectorAll('.features-item-text');
  sideBar.classList.toggle('annocollapse');
  arrowCollapse.classList.toggle('annocollapse');
  if (arrowCollapse.classList.contains('annocollapse')) {
    arrowCollapse.classList = 'bx bx-arrow-from-left logo-name__icon annocollapse';
    for (let element in textElements) {
      if (textElements[element].classList) {
        textElements[element].classList.add('annocollapse');
      }
    }
  } else {
    arrowCollapse.classList = 'bx bx-arrow-from-right logo-name__icon';
    for (let element in textElements) {
      if (textElements[element].classList) {
        textElements[element].classList.remove('annocollapse');
      }
    }
  }
}

// toggle for book and annotation overwiew
// can be used for all divs / cards
function toggleOverview(divId) {
    var classDomTokens = document.getElementById(divId).classList;
    let buttonElement = document.getElementById(divId + 'Button');
    if (classDomTokens.contains('invisible')) {
        classDomTokens.remove('invisible');
        if (buttonElement) {
            buttonElement.parentElement.classList.add('active');
            document.getElementById(divId).scrollIntoView();
            if (classDomTokens.contains('collapse')) {
                classDomTokens.remove('collapse');
            };
        };
    } else {
        classDomTokens.add('invisible');
        if (buttonElement) {
            buttonElement.parentElement.classList.remove('active');
            classDomTokens.add('collapse');
        };
    };
};

// toggling the bodies within the annotation selection
function toggleExpand(div) {
    var classDomTokens = div.classList;
    var expandIcon = div.previousElementSibling.firstChild.firstChild.firstChild; 
    if (classDomTokens.contains('collapse')) {
        classDomTokens.remove('collapse');
        expandIcon.classList.remove('bx-chevron-right');
        expandIcon.classList.add('bx-chevron-down');
    } else {
        classDomTokens.add('collapse');
        expandIcon.classList.remove('bx-chevron-down');
        expandIcon.classList.add('bx-chevron-right');
    };
};

// show the animated book as loading icon whenever an ajax call is running
$(document).ajaxStart(function(){
    let loadingModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loading'));
    loadingModal.toggle();
 }).ajaxStop(function(){
    let loadingModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loading'));
    loadingModal.toggle(); 
 });
