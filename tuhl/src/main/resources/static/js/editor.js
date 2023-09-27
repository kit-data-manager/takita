// gets the describing body of an annotation (mrw-annotation)
async function getMRWAnnoSelectedText(annoId){
    console.log("Trying to get annotation ", annoId, " which is linked to ", globalSelectedAnnotation);
    const response = await fetch(window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(annoId), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    if (response.ok){
        const mrwAnno = await response.json();
        const describingBody = mrwAnno.textCards.filter(textCard => textCard.purpose === "describing")[0];
        return describingBody.value;
    } else {
        // if the mrw-annotation linked to the metaphor-annotation got deleted the code will end up here
        return "ERROR: Something is wrong with the linked mrw-annotation; most likely it got deleted, please contact the developers.";
    }
};

// called when you select an annotation to display the textCard.
function selectAnnotation(event, annoId) {
    $ .ajax({
        type: 'GET',
        url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoId,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        // Needs to be async for the textCard of a metaphor-annotation
        // to display the text selected by the mrw-annotation (see switch/case)
        // as it needs to await the response of a HTTP-request
        success: async function(responseJson) {
            console.log(responseJson);

            // this globalSelectedAnnotation variable is needed for the
            // - edit/update function in editor_xml.js
            // - for the highlighting of the words targeted by the currently 
            //   selected annotation/displayed textCard
            globalSelectedAnnotation = JSON.parse(JSON.stringify(responseJson));
            // check if the annotation is compatible with the code, i.e. has
            // one xPath for each target and not one long xPath including all targets.
            // Make it compatible, if is are not
            if (document.getElementById("TEI") != null) {
                if (!checkIsTargetCompatible(globalSelectedAnnotation)){
                    makeTargetsCompatible(globalSelectedAnnotation);
                }
                // highlight words targetted by the currently selected annotation
                // remove old highlights (TODO: include this in removeStyles(el) in editor_xml.js)
                document.querySelectorAll(".selected").forEach(element => element.classList.remove("selected"));
                // add a class to all the targets of the selected annotation
                globalSelectedAnnotation.targets.forEach(target => {
                    const targetId = target.selector.xPath.split("\"")[1];
                    document.getElementById(targetId).classList.add("selected");
                });
            }



            if (responseJson.created.seconds) {
                responseJson.created = new Date(responseJson.created.seconds * 1000 + responseJson.created.nanos / 1000000).toISOString();
                if(responseJson.modified.seconds) {
                    responseJson.modified = new Date(responseJson.modified.seconds * 1000 + responseJson.modified.nanos / 1000000).toISOString();
                };
            };
  
            //toggleOverview('annotationCard');
            
            //var responseJson = JSON.parse(responseData);
            var annotationDiv = document.getElementById("annotationCard");
            //console.log(annotationDiv);
            //console.log(annotationDiv.childElementCount);
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
                //console.log("create");
                //var modal = document.createElement("div");
                //modal.classList.add("modal");
                //modal.style.display = "block";
                const modal = document.getElementById("createBody");
                modal.classList.toggle("show-modal");
                pickTemplate("",encodeAnnoId(responseJson.id), "createForm", "pickBodyTemplateForm", "bodyTemplate");
            };
                
            var deleteAnnotationIcon = document.createElement("i");
            deleteAnnotationIcon.id = "deleteAnnotation";
            deleteAnnotationIcon.classList.add("bx");
            deleteAnnotationIcon.classList.add("bx-trash");
            deleteAnnotationIcon.onclick = function() {console.log("Hier wird gelöscht!"); deleteAnnotation(document.getElementById(this.id).parentNode.title)};
            
            iconRowTop.append(addBody);
            iconRowTop.append(deleteAnnotationIcon);
            iconRowTop.classList.add("is-right");
            iconRowTop.classList.add("is-full-width");
            
            
            var formDataModel = {
                "type": "object",
                "properties": {}
            };
            
            const headerFields = ["created", "creators", "modified", "generator", "motivation", "target", "via"];
            const omitFields = ["type", "selector", "fullJson", "annotationId", "motivation", "created"];
            
            for (field in headerFields) {
                if (responseJson[headerFields[field]]) {
                    //console.log(responseJson[headerFields[field]]);
                    formDataModel = completeFormDataModel(responseJson, formDataModel, headerFields[field], omitFields);    
                };
            };
            
            //console.log(formDataModel);
            
            options = {operation: "READ", dataModel: formDataModel, uiForm: "*", resource: responseJson};
            
            $('#annotationCard').metadataeditorForm(options, function onSubmitValid(value) {
                //console.log(value);
            });
            
            annotationDiv.prepend(iconRowTop);
            
            var bodies = responseJson.tags.concat(responseJson.textCards);

            for (let body in bodies) {
                if (bodies[body].created) {
                    bodies[body].created = new Date(bodies[body].created.seconds * 1000 + bodies[body].created.nanos / 1000000).toISOString();
                };
                
                // bodies can have a modified date without having a created date
                // 'legacy annotations'
                if (bodies[body].modified) {
                    bodies[body].modified = new Date(bodies[body].modified.seconds * 1000 + bodies[body].modified.nanos / 1000000).toISOString();
                };
                
                //console.log(bodies[body]);
                
                var bodyCard = document.createElement("div");
                bodyCard.classList.add("card");
                
                var bodyRowDiv = document.createElement("div");
                bodyRowDiv.classList.add("row");
                bodyRowDiv.classList.add("is-full-width");
                bodyCard.append(bodyRowDiv);
                
                var bodyDiv = document.createElement("div");
                // the innerText is no longer necessary as this div is the anchor for the
                // horizontal form
                //bodyDiv.innerText = bodies[body].purpose;
                bodyDiv.id = bodies[body].id;
                bodyDiv.title = bodies[body].annotationId;
                bodyDiv.classList.add("is-left");
                bodyDiv.classList.add("col");
                bodyDiv.classList.add("formBodyDiv");
                bodyRowDiv.append(bodyDiv);

                var formRowDiv = document.createElement("div");
                formRowDiv.classList.add("row");
                formRowDiv.classList.add("is-full-width");
                bodyCard.append(formRowDiv);
                
                // vertical form (needs to be expanded)
                var bodyForm = document.createElement("form");
                bodyForm.id = "form" + bodies[body].id;
                bodyForm.addEventListener('submit', function(e) {e.preventDefault();});
                //bodyForm.style.paddingLeft = "20rem";
                //bodyForm.classList.add("is-full-width");
                bodyForm.classList.add("col");
                formRowDiv.append(bodyForm);

                // horizontal form (collapsed "quick-view")
                var bodyFormHorizontal = document.createElement("form");
                bodyFormHorizontal.id = "formHorizontal" + bodies[body].id;
                bodyFormHorizontal.addEventListener('submit', function(e) {e.preventDefault();});
                //bodyForm.style.paddingLeft = "20rem";
                //bodyForm.classList.add("is-full-width");
                bodyFormHorizontal.classList.add("col");
                bodyFormHorizontal.classList.add("horizontalFormForm");
                bodyDiv.append(bodyFormHorizontal);
                
                var iconRow = document.createElement("div");
                iconRow.id = "iconRow" + body;
                //iconRow.classList.add("is-full-width");
                //iconRow.style.paddingRight = "1rem";
                // TODO: this can maybe be "inherit", if the parentNode has inline-flex
                //iconRow.style.display = "inline-flex";
                
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
                
                iconRow.append(expand);
                iconRow.append(deleteBody);
                bodyDiv.prepend(iconRow);
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
                    //console.log(key);
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
                
                //console.log(uiForm);
                
                //console.log(formBodyDataModel);

                //console.log(bodies[body]);
                
                options = {operation: "UPDATE", dataModel: formBodyDataModel, uiForm: uiForm, resource: bodies[body]};
            
                $('#form' + bodies[body].id).metadataeditorForm(options, function onSubmitValid(value) {
                    //console.log(value);
                    var jsonObject = JSON.parse(value);
    
                    var endpoint;
                    var annoIdEncoded = encodeAnnoId(document.getElementById("iconRowTop").title);
                    //console.log(document.activeElement);
                    
                    if (jsonObject.purpose==="tagging") {
                        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + jsonObject.id;
                    } else {
                        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + jsonObject.id;
                    };
                    
                    $ .ajax({
                        type: 'PUT',
                        url: endpoint,
                        data: value,
                        headers: {
                            'Content-Type' : 'application/json'
                        },

                        success: function(responseData) {
                            //console.log(responseData);
                            selectAnnotation(null, annoIdEncoded);
                            // TODO: this is just a bandaid for now as it only updates the first 
                            // entry of the tags array and not only the updated tag
                            // For now in (CRC1475) an annotation only has one tag anyways.

                            // updating the display for text annotation
                            // checking if TEI-element is null. it is defined for text annotation,
                            // but not for image annotation
                            if (document.getElementById("TEI") != null) {
                                // redraw
                                updateDisplay();
                            }
                        },
        
                        error: function(errorData) {
                            //console.log(errorData);
                        }
                    });
                });

                // horizontal form (collapsed "quick-view") creation start
                let operationHorizontal = "READ";

                let formBodyDataModelHorizontal = {
                    "type": "object",
                    "properties": {}
                };

                let uiFormHorizontal = { 
                    "type": "fieldset",
                    "items":[]
                };

                for (let key in bodies[body]) {
                    //console.log(key);
                    //console.log(bodies[body]);
                    if(bodies[body].hasOwnProperty(key)) {
                        formBodyDataModelHorizontal = completeFormDataModel(bodies[body], formBodyDataModelHorizontal, key, omitFields);
                        // prepare the ui form
                         // push the key and hide it, when its not the value key
                        if (key !== "value" && omitFields.indexOf(key) === -1) {
                            // "type" : "hidden" doesn't work; for some reason this prevents
                            // the form to be submitted. Instead chotas "is-hidden" class is being used
                            uiFormHorizontal.items.push({"key" : key, "htmlClass" : "is-hidden"});
                            // TODO: CUSTOMISE decide which purpose bodies/fields should be editable
                            if (key === "purpose"){
                                const editableFields = ["tagging", "commenting", "identifying", "classifying"];
                                if (editableFields.includes(bodies[body].purpose)) {
                                    operationHorizontal = "UPDATE";
                                }
                            }  
                        }
                        if (key === "value" && omitFields.indexOf(key) === -1){
                            uiFormHorizontal.items.push({"key" : key, "htmlClass" : "horizontalFormDiv"});
                        }
                    };
                };
                //console.log(formBodyDataModelHorizontal);

                // as we don't want to display the URI, but the actual text of the linked mrw-annotation
                // the resource passed to the metadataeditorForm() via the options needs to have the URI
                // replaced with the text of the linked mrw-annotation. The actual bodies[body] should stay
                // intact though, so bodies[body] will be deep copied
                let resourceHorizontal = JSON.parse(JSON.stringify(bodies[body]));
                if (resourceHorizontal.purpose === "linking"){
                    resourceHorizontal.value = await getMRWAnnoSelectedText(resourceHorizontal.value);
                }
                
                let optionsHorizontal = {operation: operationHorizontal, dataModel: formBodyDataModelHorizontal, uiForm: uiFormHorizontal, resource: resourceHorizontal};
                //console.log(optionsHorizontal);
                $('#formHorizontal' + bodies[body].id).metadataeditorForm(optionsHorizontal, function onSubmitValid(value) {
                    console.log(value);
                    var jsonObject = JSON.parse(value);
    
                    var endpoint;
                    var annoIdEncoded = encodeAnnoId(document.getElementById("iconRowTop").title);
                    //console.log(document.activeElement);
                    
                    if (jsonObject.purpose==="tagging") {
                        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + jsonObject.id;
                    } else {
                        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + jsonObject.id;
                    };
                    
                    $ .ajax({
                        type: 'PUT',
                        url: endpoint,
                        data: value,
                        headers: {
                            'Content-Type' : 'application/json'
                        },

                        success: function(responseData) {
                            //console.log(responseData);
                            selectAnnotation(null, annoIdEncoded);
                            // TODO: this is just a bandaid for now as it only updates the first 
                            // entry of the tags array and not only the updated tag
                            // For now in (CRC1475) an annotation only has one tag anyways.

                            // updating the display for text annotation
                            // checking if TEI-element is null. it is defined for text annotation,
                            // but not for image annotation
                            if (document.getElementById("TEI") != null) {
                                // redraw
                                updateDisplay();
                            }
                        },
        
                        error: function(errorData) {
                            //console.log(errorData);
                        }
                    });
                });

                // styling of the horizontal form
                // this is done after the form is created as the forms style can't be changed during creation
                // TODO: move parts of this to css
                
                // remove the wrapping fieldset. the form can't be created without the fieldset
                // due to the code in metadataeditor.js (eg. line 485) requires a JSON object
                // https://stackoverflow.com/questions/19261197/how-can-i-remove-wrapper-parent-element-without-removing-the-child
                let fieldsetHorizontal = document.getElementById("formHorizontal" + bodies[body].id).firstChild.firstChild;
                fieldsetHorizontal.replaceWith(...fieldsetHorizontal.childNodes);

                const formHorizontal = document.getElementById("formHorizontal" + bodies[body].id);
                const inputButtonHorizontal = formHorizontal.querySelectorAll('input[type="submit"]')[0];
                // display everything in one line
                // improve readibility of the value of the "disabled" input fields
                formHorizontal.querySelectorAll('input[type="text"]').forEach( input => {
                    if (input.name === "value"){
                        input.style.color = "black";
                        input.style.opacity = 1;
                    }
                    // enable the input submit button if the value of the input field changes
                    // from the original body value
                    input.addEventListener("input", (event) => {
                        if (input.value !== bodies[body].value){
                            inputButtonHorizontal.disabled = false;
                        } else {
                            inputButtonHorizontal.disabled = true;
                        }
                    });
                });
                // TODO: maybe use an icon instead of the "save" text to save some space
                // change the value/text of the submit "button" and if one is available (as the field can be edited)
                // disable the button by default
                if (inputButtonHorizontal !== undefined){
                    inputButtonHorizontal.value = "Save";
                    inputButtonHorizontal.disabled = true;
                    inputButtonHorizontal.classList.add("horizontalFormInput");
                }
                // horizontal form (collapsed "quick-view") creation end

                //document.getElementById(expand.id).parentNode.previousElementSibling.classList.add("is-hidden");
                //document.getElementById(bodyDiv.id).childNodes[0].classList.add("is-hidden");
                //bodyDiv.childNodes[2].classList.add("is-hidden");
                formRowDiv.classList.add("is-hidden");
                
            };
            // adding link to the analysis tool, if 
            // the annotation is a metaphor annotation	
			if (responseJson.tags.some(tag => tag.value === "metaphor")){
				var buttonToAnalysisTool = document.createElement("input");
	            buttonToAnalysisTool.classList.add("btn");
	            buttonToAnalysisTool.classList.add("btn-primary");
	            buttonToAnalysisTool.type = "submit";
	            buttonToAnalysisTool.value = "Analyze";
	            buttonToAnalysisTool.id = "buttonToAnalysisTool";
                buttonToAnalysisTool.disabled = true;
	
	            var linkToAnalysisTool = document.createElement("a");
	            linkToAnalysisTool.href= window.CONTEXTPATH + "analysis/" + annoId;
	            linkToAnalysisTool.target="_blank";
	            linkToAnalysisTool.rel="noreferrer noopener";
	            linkToAnalysisTool.append(buttonToAnalysisTool);
	
	            annotationDiv.append(linkToAnalysisTool);

                // enable the link, if no mrw-annotation is linked
                // to the metaphor annotation
                if (responseJson.textCards.some(textCard => textCard.purpose === "linking")){
                    console.log("link");
                    document.getElementById("buttonToAnalysisTool").disabled = false;
                }
			}

            // adding the functionality to modify the selected text of an annotation
            // to the textCard display
            if (document.getElementById("TEI") != null) {
                var buttonModifySelection = document.createElement("button");
	            buttonModifySelection.innerHTML = "Modify Selection";
	            buttonModifySelection.id = "buttonModifySelection";

                var buttonSaveModification = document.createElement("button");
	            buttonSaveModification.type = "submit";
	            buttonSaveModification.innerHTML = "Save Modification";
	            buttonSaveModification.id = "buttonSaveModification";
                buttonSaveModification.disabled = true;
                buttonSaveModification.classList.add("is-hidden");
                
                var buttonCancelModification = document.createElement("button");
	            buttonCancelModification.type = "submit";
	            buttonCancelModification.innerHTML = "Cancel Modifcation";
	            buttonCancelModification.id = "buttonCancelModification";
                buttonCancelModification.style.backgroundColor = "#c82525";
                buttonCancelModification.disabled = true;
                buttonCancelModification.classList.add("is-hidden");

                annotationDiv.append(buttonModifySelection);
                document.getElementById("buttonModifySelection").addEventListener("mousedown", modifySelection);
                annotationDiv.append(buttonSaveModification);
                document.getElementById("buttonSaveModification").addEventListener("mousedown", saveModification);
                annotationDiv.append(buttonCancelModification);
                document.getElementById("buttonCancelModification").addEventListener("mousedown", cancelModification);
            }


        }                
    });
};

function deleteBodyFromAnnotation(annoId, bodyId) {
    let confirmation = confirm("Are you sure to delete this body?");
    
    if (confirmation) {
        //console.log(annoId);
        //console.log(bodyId);
    
        let annoIdEncoded = encodeAnnoId(annoId);
    
        $ .ajax({
            type: 'DELETE',
            url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId,

            success: function(responseData) {
                //console.log(responseData);
                selectAnnotation(null, annoIdEncoded);
                // updating the display for text annotation
                // checking if TEI-element is null. it is defined for text annotation,
                // but not for image annotation
                if (document.getElementById("TEI") != null) {
                    // redrawing all annotations
                    updateDisplay();
                }
            },
        
            error: function(errorData) {
                //console.log(errorData);
            
                $ .ajax({
                    type: 'DELETE',
                    url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + bodyId,

                    success: function(responseData) {
                        //console.log(responseData);
                        selectAnnotation(null, annoIdEncoded);
                        // TODO: this is just a bandaid for now as it empties the tags array completly
                        // so if there would be multiple tags none would be left, even if only one got
                        // deleted. For now in (CRC1475) an annotation only has one tag anyways.
                        
                        // updating the display for text annotation
                        // checking if TEI-element is null. it is defined for text annotation,
                        // but not for image annotation
                        if (document.getElementById("TEI") != null) {
                            // redrawing all annotations
                            updateDisplay();
                        }
                    }
                });    
            }
        });
    }; 
}

function encodeAnnoId(annoId) {
    var annoIdEncoded = encodeURIComponent(annoId);
    //console.log(annoIdEncoded);
    var annoIdEncodedDouble = encodeURIComponent(annoIdEncoded);
    //console.log(annoIdEncodedDouble);
    return annoIdEncodedDouble;
}

function deleteAnnotation(annoId) {
    let confirmation = confirm("Are you sure to delete this annotation?");
    
    if(confirmation) {
        let annoIdEncoded = encodeAnnoId(annoId);
        
        $ .ajax({
            type : 'DELETE',
            url : window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded,
            
            success: function(responseData) {
                //console.log(responseData);
                if (!document.getElementById('annotationCard').classList.contains('is-hidden')) {
                    toggleOverview('annotationCard');
                };
                
                // updating the display for image annotation
                // checking if paper is defined. it is defined for image annotation,
                // but not for text annotation
                if (paper != undefined){
                    paper.forEach(function(element) {
                        if (element.annoId === annoId) {
                            element.remove();
                        };
                    });
                }
                            
                // this for-loop is unnecessary for the textEditor
                // as the updateDisplay()-function updates the annoJson as well
                // the imageEditor still needs the for-loop
                for (let anno in annoJson) {
                    if (annoJson[anno].id === annoId) {
                        //console.log(annoId + " this must go!")
                        annoJson.splice(anno, 1);
                    };
                };
                
                // updating the display for text annotation
                // checking if TEI-element is null. it is defined for text annotation,
                // but not for image annotation
                if (document.getElementById("TEI") != null) {
                    // redrawing all annotations
                    updateDisplay();
                }

                // maybe move it within the if clause?
                //console.log(annoJson);
                fillMetaDataEditorTable(annoJson);
            }
        });
    };
};

//function readAnnotation(event, annoId) {
    //event.preventDefault();
//    let params = {
//        id: annoId
//    }
//    postEditorDeleteController("get_annotation", params);
//}

//function postEditorDeleteController(endpoint, params) {
//    $ .ajax({
//        type: 'POST',
//        url: '/editor_stub/' + endpoint,
//        headers: {
//            'Accept': 'application/json',
//            'Content-Type': 'application/json'
//        },
//        dataType: 'text',
//        data: JSON.stringify(params),
//
//        success: function(responseData) {
//            console.log(responseData);
//        }
//    });
//};




//function showSvgs(annotations) {
//    console.log("show svgs " + annotations)
//    annotations.forEach(element => {
//        drawSvg(element.getSvgCode());
//    });
//}

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
            // changes to work for the "quick-view"
            let title = addition;
            // if the formDataModel entry for the "value" of the body is created
            // relpace the title with the "purpose" of the body
            if (addition === "value"){
                // title = responseJson.purpose;
                // TODO: CUSTOMISE the text to be displayed on the "quick-view" of the
                // textCard
                switch (responseJson.purpose) {
                    case "tagging":
                        title = "Tag: ";
                        break;
                    case "linking":
                        title = "Linked mrw-annotation: ";
                        break;
                    case "classifying":
                        title = "Classification: ";
                        break;
                    case "describing":
                        title = "Selected text: ";
                        break;
                    case "identifying":
                        title = "Label: ";
                        break;
                    case "assessing":
                        title = "Analysis: ";
                        break;
                    case "commenting":
                        title = "Comment: ";
                        break;
                    default:
                        title = responseJson.purpose + ": ";
                }
            }
            // console.log(title);
            if (omitFields.indexOf(addition) === -1) {
                formDataModel.properties[addition] = {
                    "type" : "string",
                    "title" : title
                };
            };
        
        };
    return formDataModel;    
};

// returning to table view of repository data
function goHome() {
    location.href= window.CONTEXTPATH;
};

// toggling the side bar
// all text elements should not be hoverable when side bar is collapsed
function toggleAnnoSideBar() {
    let sideBar = document.querySelector('.anno-side-bar');
    let arrowCollapse = document.querySelector('#logo-name__icon');
    let textElements = document.querySelectorAll('.features-item-text');
    sideBar.classList.toggle('annocollapse');
    arrowCollapse.classList.toggle('annocollapse');
    if (arrowCollapse.classList.contains('annocollapse')) {
      arrowCollapse.classList =
        'bx bx-arrow-from-left logo-name__icon annocollapse';
        for (let element in textElements) {
            if (textElements[element].classList) {
               textElements[element].classList.add('annocollapse'); 
            };  
        };   
    } else {
      arrowCollapse.classList = 'bx bx-arrow-from-right logo-name__icon';
      for (let element in textElements) {
          if(textElements[element].classList) {
              textElements[element].classList.remove('annocollapse');
          };
        };
    };
};

// toggle for book and annotation overwiew
// can be used for all divs / cards
function toggleOverview(divId) {
    var classDomTokens = document.getElementById(divId).classList;
    let buttonElement = document.getElementById(divId + 'Button');
    if (classDomTokens.contains('is-hidden')) {
        classDomTokens.remove('is-hidden');
        if (buttonElement) {
            buttonElement.parentElement.classList.add('active');
            document.getElementById(divId).scrollIntoView();
        };
    } else {
        classDomTokens.add('is-hidden');
        if (buttonElement) {
            buttonElement.parentElement.classList.remove('active');
        };
    };
};

// toggling the bodies within the annotation selection
function toggleExpand(div) {
    var classDomTokens = div.classList;
    var expandIcon = div.previousElementSibling.firstChild.firstChild.firstChild; 
    if (classDomTokens.contains('is-hidden')) {
        classDomTokens.remove('is-hidden');
        expandIcon.classList.remove('bx-chevron-right');
        expandIcon.classList.add('bx-chevron-down');
    } else {
        classDomTokens.add('is-hidden');
        expandIcon.classList.remove('bx-chevron-down');
        expandIcon.classList.add('bx-chevron-right');
    };
};

// enables tooltips for the sidebar by creating a new div-element, which
// is placed based on the item hovered by the user.
// https://stackoverflow.com/questions/66382585/tooltip-inside-a-scrollable-component
function enableTooltips() {
    const
        hoverAreas = document.querySelectorAll('.features-item'),
        hoverTooltip = document.createElement('div');
    hoverTooltip.className = 'hoverTooltip';
    document.body.appendChild(hoverTooltip);

    hoverAreas.forEach(hoverArea => {
        console.log(hoverArea);
        // Show the tooltip
        hoverArea.addEventListener('mouseenter', () => {
            hoverTooltip.innerHTML = hoverArea.querySelector('.tooltip').innerHTML;
            //tooltips.style.left = `${item.offsetLeft - cardContainer.scrollLeft}px`;
            hoverTooltip.style.top = `${hoverArea.getBoundingClientRect().top + 25}px`;
            hoverTooltip.style.display = 'block';
        });
        // Hide to tooltip
        hoverArea.addEventListener('mouseleave', () => {
            hoverTooltip.style.display = 'none';
        });
    });
};

// show the animated book as loading icon whenever an ajax call is running
$(document).ajaxStart(function(){
    const modal = document.getElementById("loading");
    modal.classList.toggle("show-modal");
 }).ajaxStop(function(){
    const modal = document.getElementById("loading"); 
    modal.classList.toggle("show-modal"); 
 });

 /*
                // creating the divs displaying the textCard/tag values
                var bodyDiv = document.createElement("div");
                // backup on updateAnnoJson2
                // CUSTOMIZE: display the value of the body and
                // prepending it by a description to create a "non-expert/debugging" display
                // instead of "tagging", "Tag: tagxyz" will be displayed
                // let innerText;
                let innerForm = document.createElement("form");
                //innerForm.style.display = "inline-flex";
                //innerForm.classList.add("col");
                let innerLabel = document.createElement("label");
                // TODO: move this styling somewhere more appropriate
                innerLabel.style.marginRight = "0.3em";
                innerLabel.style.whiteSpace = "nowrap";
                let innerInput = document.createElement("input");
                let innerButton = document.createElement("button");
                innerButton.classList.add("saveButtonTextCard");
                innerButton.classList.add("bx");
                innerButton.classList.add("bx-save");
                innerButton.type = "button";
                innerButton.dataset.bodyId = bodies[body].id;
                innerButton.dataset.annotationId = bodies[body].annotationId;
                innerButton.dataset.purpose = bodies[body].purpose;
                let innerSaveIcon = document.createElement("i");
                // TODO: move this styling somewhere more appropriate
                //innerSaveIcon.classList.add("bx");
                //innerSaveIcon.classList.add("bx-save");
                //innerSaveIcon.classList.add("features-item-icon");
                //innerSaveIcon.marginLeft = "0.1em";
                switch (bodies[body].purpose) {
                    case "tagging":
                        innerLabel.innerText = "Tag:";
                        innerInput.defaultValue = bodies[body].value;
                        break;
                    case "linking":
                        // get the linked mrw-annotation to display the describing-body of it,
                        // so a user can see the selected text of the mrw-annotation
                        const linkedMRWAnnoSelectedText = await getMRWAnnoSelectedText(bodies[body].value);
                        innerLabel.innerText = "Linked mrw-annotation:";
                        innerInput.defaultValue = linkedMRWAnnoSelectedText;
                        // TODO: find a better solution to hide the button without breaking the layout
                        innerButton.disabled = true;
                        //innerSaveIcon.style.color = "white";
                        break;
                    case "describing":
                        innerLabel.innerText = "Selected text:";
                        innerInput.defaultValue = bodies[body].value;
                        innerButton.disabled = true;
                        //innerSaveIcon.style.color = "white";
                        break;
                    case "identifying":
                        innerLabel.innerText = "Label:";
                        innerInput.defaultValue = bodies[body].value;
                        break;
                    case "assessing":
                        innerLabel.innerText = "Analysis:";
                        innerInput.defaultValue = bodies[body].value;
                        //innerButton.disabled = true;
                        innerSaveIcon.style.color = "white";
                        break;
                    case "commenting":
                        innerLabel.innerText = "Comment:";
                        innerInput.defaultValue = bodies[body].value;
                        //innerText = "Comment: " + bodies[body].value;
                        break;
                    default:
                        innerLabel.innerText = bodies[body].purpose + ":";
                        innerInput.defaultValue = bodies[body].value;
                }
                // TODO: improve this
                //console.log(innerSaveIcon);
                //innerButton.insertAdjacentHTML("afterbegin", innerSaveIcon.outerHTML);
                //innerForm.insertAdjacentHTML("afterbegin", innerLabel.outerHTML + innerInput.outerHTML + innerButton.outerHTML)
                
                // the following is the right one
                //bodyDiv.insertAdjacentHTML("afterbegin", innerLabel.outerHTML + innerInput.outerHTML + innerButton.outerHTML);
                // adding the eventListeners to save an update on a body
                document.querySelectorAll(".saveButtonTextCard").forEach(button => {
                    button.addEventListener("mousedown", updateBody);
                });
 

// called by the saveButtonTextCard to update a body
function updateBody(event){
    console.log(event);

    //storing variables needed for the request body
    const eventTarget = event.target;
    const bodyId = eventTarget.dataset.bodyId;
    const creators = document.getElementById("pseudonymInput").value;
    const currentdate = new Date(); 
    const modifiedDate = currentdate.toISOString();
    const newValue = eventTarget.previousElementSibling.value;
    // creating the request body
    const value = {
        "id" : bodyId,
        "creators" : [
            creators
        ],
        "modified" : modifiedDate,
        "purpose" : eventTarget.dataset.purpose,
        "value" : newValue
    };
    console.log(value);
    
    var endpoint;
    //var annoIdEncoded = encodeAnnoId(document.getElementById("iconRowTop").title);
    var annoIdEncoded = encodeAnnoId(eventTarget.dataset.annotationId);
    
    if (eventTarget.dataset.purpose==="tagging") {
        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + bodyId;
    } else {
        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId;
    };
    
    $ .ajax({
        type: 'PUT',
        url: endpoint,
        data: JSON.stringify(value),
        headers: {
            'Content-Type' : 'application/json'
        },

        success: function(responseData) {
            //console.log(responseData);
            selectAnnotation(null, annoIdEncoded);
            // TODO: this is just a bandaid for now as it only updates the first 
            // entry of the tags array and not only the updated tag
            // For now in (CRC1475) an annotation only has one tag anyways.

            // updating the display for text annotation
            // checking if TEI-element is null. it is defined for text annotation,
            // but not for image annotation
            if (document.getElementById("TEI") != null) {
                // redraw
                updateDisplay();
            }
        },

        error: function(errorData) {
            //console.log(errorData);
        }
    });

};
*/