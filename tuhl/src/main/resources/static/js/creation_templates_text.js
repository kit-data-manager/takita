// enum for different body templates
// for adding new: include name here and add dataModel in 
// getFormModel(chosenTemplate)
const bodyTemplate = {
    COMMENT : "comment",
    MRW : "mrw"
};

// enum for different annotation templates
// TODO: CUSTOMISE available annotations (will be shown during the annotation process)
// for adding new: include name here and add dataModel in 
// getFormModel(chosenTemplate)
const annotationTemplate = {
    MRWDIRECT : "mrwdirect",
    MRWINDIRECT : "mrwindirect",
    MRWIMPLICIT : "mrwimplicit",
    MFLAG : "mflag",
    METAPHOR : "metaphor"
};

// function to check/uncheck all inputs
function toggleCheckedInputs(inputs){
    // to select/unselect all inputs the first input will be checked,
    // wether it is selected or not. Based on that all inputs will be
    // checked or unchecked
    let isInputChecked = false;

    if(inputs[0].checked){
        isInputChecked = true;
    }

    inputs.forEach(input => {
        if(isInputChecked){
        input.checked = false;
        } else {
        input.checked = true;
        }
    })
}

// returns a button to select/unselect all mrws; is used by 
// - the METAPHOR annotation template
// - the MRW body template
function getSelectMRWButton(mrwEnum){
    const selectMRWButton = {
        "type": "button",
        "title": "Select/unselect all mrws",
        "onClick": function (e){
            // select all input fields, where the name starts with "mrws"
            // the input fields storing the mrws present in a selection
            // get their name from the ordering in the mrws-array: 
            // name="mrws[0]" and name="mrws[1]" etc.
            // to get the changing name I refered to
            // https://stackoverflow.com/questions/16791527/how-to-use-a-regular-expression-in-queryselectorall
            const inputs = document.querySelectorAll('input[name^=mrws');
            // checking if any mrws are present in the selection and allowing the toggle
            // only if there are. This prevents an error to be thrown, when no mrws are present
            if (inputs.length > 0) {
                toggleCheckedInputs(inputs);
            }
        }
    }
    // if less than two mrws are present in the selection, the
    // "is-hidden"-class (defined in chota.css) is added to the button and
    // the button won't be displayed
    if(mrwEnum.length < 2){
        selectMRWButton["htmlClass"] = "is-hidden";
    }

    return selectMRWButton;
}

// takes a list of mrwAnnos and returns 
// - an enum holding all the ids of these annotations
// - a titleMap linking the ids to the tag values and targeted strings
function getEnumAndTitleMap(mrwAnnos){
    const idEnum = mrwAnnos.map(anno => anno.id);
    const mrwTitleMap = {};

    mrwAnnos.forEach(anno =>{
        // getting the words targetted by the annotation
        // and concatenate them into one string
        const targetedString = anno.svg
            .map(svgs => {
                const id = svgs.split("\"")[1];
                return document.getElementById(id).innerHTML;
            })
            .join(" ");

        // adding the tag value to the string, that will be displayed in the modal.
        // Check if the tag has a value given in relevantTags
        // and add that value to the text
        const relevantTags = ["mrw (direct)", "mrw (indirect)", "mrw (implicit)", "mflag"];
        const tagValue = anno.tags.filter(tag => relevantTags.includes(tag.value))[0].value;
        mrwTitleMap[anno.id] = targetedString + " | " + tagValue;
    });

    return [idEnum, mrwTitleMap];
}

// as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
// of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws0-n)
function spreadMRWArray(jsonObject){
    let mrws = [...jsonObject.mrws];
    delete jsonObject.mrws;
    mrws.forEach((mrw, index) => jsonObject["mrws"+index] = mrw );

    return jsonObject;
}

// assigns data model needed for MetadataEditor to specific template
// TODO: CUSTOMISE available annotations and their structure/content (dataModel)
//      (when adjusting the "color.default.value", make sure to add those to the enum in
//      "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java" and the code in
//      "takita/tuhl/src/main/resources/static/js/editor_xml.js" at
//          - drawAnnos(annoJson)
//          - getColorNameFromEnumEntry(colorEnumEntry)/getColorHexFromEnumEntry(colorEnumEntry)
//      and that the color hexcodes match)
// and how they are displayed in the modal (uiForm)
function getFormModel(chosenTemplate) {
    let dataModel;
    let uiForm;
    
    switch (chosenTemplate) {
        case "MRWDIRECT":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "selectedText": {
						"type" : "string",
	                    "title" : "Selected text",
	                    "default" : globalSelectedText,
	                    "readOnly" : true	
					},
					"tag" : {
                        "type" : "string",
                        "title" : "Tag",
                        "default" : "mrw (direct)",
                        "readOnly" : true
                    },
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#000011",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    "selectedText",
                    {
                        "key" : "tag",
                        "readOnly" : true
                    },
                    {
                        "key" : "color",
                        "readOnly" : true,
                        "htmlClass" : "is-hidden"
                    }                
            ]};
            break;

        case "MRWINDIRECT":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "selectedText": {
                        "type" : "string",
                        "title" : "Selected text",
                        "default" : globalSelectedText,
                        "readOnly" : true	
                    },
                    "tag" : {
                        "type" : "string",
                        "title" : "Tag",
                        "default" : "mrw (indirect)",
                        "readOnly" : true
                    },
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#000012",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    "selectedText",
                    {
                        "key" : "tag",
                        "readOnly" : true
                    },
                    {
                        "key" : "color",
                        "readOnly" : true,
                        "htmlClass" : "is-hidden"
                    }                     
            ]};
            break;  

        case "MRWIMPLICIT":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "selectedText": {
                        "type" : "string",
                        "title" : "Selected text",
                        "default" : globalSelectedText,
                        "readOnly" : true	
                    },
                    "tag" : {
                        "type" : "string",
                        "title" : "Tag",
                        "default" : "mrw (implicit)",
                        "readOnly" : true
                    },
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#000013",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    "selectedText",
                    {
                        "key" : "tag",
                        "readOnly" : true
                    },
                    {
                        "key" : "color",
                        "readOnly" : true,
                        "htmlClass" : "is-hidden"
                    }                     
            ]};
            break;

        case "MFLAG":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "selectedText": {
						"type" : "string",
	                    "title" : "Selected text",
	                    "default" : globalSelectedText,
	                    "readOnly" : true	
					},
                    "tag" : {
                        "type" : "string",
                        "title" : "Tag",
                        "default" : "mflag",
                        "readOnly" : true
                    },
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#000014",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    "selectedText",
                    {
                        "key" : "tag",
                        "readOnly" : true
                    },
                    {
                        "key" : "color",
                        "readOnly" : true,
                        "htmlClass" : "is-hidden"
                    }     
                
            ]};
            break;  
        
        case "METAPHOR":

            // a user can either use the default label or create a humanreadable
            // label for the metaphor annotation
            let defaultLabel = window.CURRENTPAGENUMBER + Date.now();

            let dataModelProperties = {
                "selectedText": {
                    "type" : "string",
                    "title" : "Selected text",
                    "default" : globalSelectedText,
                    "readOnly" : true	
                },
                "tag" : {
                    "type" : "string",
                    "title" : "Tag",
                    "default" : "metaphor",
                    "readOnly" : true
                },
                "label" : {
                    "type" : "string",
                    "title" : "Label",
                    "default" : defaultLabel
                },
                "comment" : {
                    "type" : "string",
                    "title" : "Comment"
                },
                "color" : {
                    "type" : "string",
                    "title" : "color",
                    "default" : "#000021",
                    "readOnly" : true
                }
            };

            let uiFormItems = [					
                {
                    "key": "selectedText",
                    "type": "textarea"
                },
                {                    
                    "key" : "tag",
                    "readOnly" : true                    
                },
                {
                    "key": "label"
                },
                {
                    "key": "comment",
                    "type": "textarea"
                },
                {
                    "key" : "color",
                    "readOnly" : true,
                    "htmlClass" : "is-hidden"
                }     
            ];

            // if there are mrw-annotations present in the current selection
            // modify the dataModel and uiForm in a way to show a checkbox
            // for each mrw-annotation present
            if (globalMrwAnnos.length > 0){
                // if a user wants to create a metaphor annotation,
                // get all the mrws that are present in his selection (globalMrwAnnos)
                // and store them in the enum to hold all the mrwAnnoIds, so the user can
                // choose a mrw to link it to a metaphor
                
                let enumAndTitleMap = getEnumAndTitleMap(globalMrwAnnos);
                let mrwEnum = enumAndTitleMap[0];
                // metaphorTitleMap is necessary to have the actual words displayed,
                // but to have the annoId as a value on the submission of the form
                let mrwTitleMap = enumAndTitleMap[1];
                let selectMRWButton = getSelectMRWButton(mrwEnum);
                
                dataModelProperties = {
                    "selectedText": {
                        "type" : "string",
                        "title" : "Selected text",
                        "default" : globalSelectedText,
                        "readOnly" : true	
                    },
                    "tag" : {
                        "type" : "string",
                        "title" : "Tag",
                        "default" : "metaphor",
                        "readOnly" : true
                    },
                    "mrws" : {
                        "type" : "array",
                        "title" : "Metaphor related words (direct, indirect, implicit and mflags)",
                        "items": {
                            "type": "string",
                            "title": "Option",
                            "enum": mrwEnum
                          }
                    },
                    "label" : {
                        "type" : "string",
                        "title" : "Label",
                        "default" : defaultLabel
                    },
                    "comment" : {
                        "type" : "string",
                        "title" : "Comment"
                    },
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#000021",
                        "readOnly" : true
                    }
                };
                uiFormItems = [
                    {
                        "key": "selectedText",
                        "type": "textarea"
                    },
                    {                        
                        "key" : "tag",
                        "readOnly" : true                        
                    },
                    {
                        "type" : "checkboxes",
                        "key" : "mrws",
                        "titleMap": mrwTitleMap                            
                    }, 
                    selectMRWButton,
                    {
                        "key": "label"
                    },
                    {
                        "key": "comment",
                        "type": "textarea"
                    },
                    {
                        "key" : "color",
                        "readOnly" : true,
                        "htmlClass" : "is-hidden"
                    }     
                ];
            }

	        dataModel = {
	            "type" : "object",
	            "properties" : dataModelProperties
	        };
			uiForm = {
	        	"type" : "fieldset",
	        	"items" : uiFormItems
	        };
	    	break;
        
        case "CONTEXT":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "tag" : {
                        "type" : "string",
                        "title" : "Tag",
                        "default" : "context",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    {
                        "key" : "tag",
                        "readOnly" : true
                    }
                
            ]};
            break;  
                
        case "COMMENT":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "purpose" : {
                        "type" : "string",
                        "title" : "purpose",
                        "default": "commenting",
                        "readonly": true
                    },
                    "value" : {
                        "type" : "string",
                        "title" : "Comment"
                    }
                },
                "required" : ["purpose", "value"]
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    "purpose",
                    {
                        "key": "value",
                        "type": "textarea",
                        "label": "Comment"
                    }
                ]
            };
            break;

        case "MRW":
            // if a user wants to link another mrw annotation to a metaphor annotation,
	        // get all the mrws that share their target with the metaphor annotation
	        // and store them in the enum to hold all the mrwAnnoIds, so the user can
	        // choose a mrw to link it to a metaphor

            // store all elements targeted by the metaphor annotation and mrw annotations
            let elementsTargeted = [];
            globalSelectedAnnotation.targets.forEach(target => {
                elementsTargeted.push(document.getElementById(target.selector.xPath.split("\"")[1]));
            });
            // get all mrwAnnos that target the same words as the metaphor annotation
            let mrwAnnosForBody = storeSelectedMRWAnnos(elementsTargeted);
            // remove all mrw annotations, which are linked to the metaphor annotation already
            // from mrwAnnosForBody to prevent users from linking the same mrwAnno
            // multiple times
            globalSelectedAnnotation.textCards.forEach(textCard => {
                if (textCard.purpose === "linking") {
                    mrwAnnosForBody = mrwAnnosForBody.filter(anno => textCard.value !== anno.id);
                }
            })

            let enumAndTitleMapForBody = getEnumAndTitleMap(mrwAnnosForBody);
            let mrwEnumForBody = enumAndTitleMapForBody[0];
			// mrwTitleMapForBody is necessary to have the actual words displayed,
			// but the have the annoId as a value on the submission of the form
            let mrwTitleMapForBody = enumAndTitleMapForBody[1];
            let selectMRWButtonForBody = getSelectMRWButton(mrwEnumForBody);

            dataModel = {
                "type" : "object",
                "properties": {
                    "mrws" : {
	                    "type" : "array",
	                    "title" : "Metaphor related words (direct, indirect, implicit and mflags)",
	                    "items": {
					        "type": "string",
					        "title": "Option",
					        "enum": mrwEnumForBody
					      }
	                }
                },
                "required" : ["mrws"]
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    {
                        "type" : "checkboxes",
						"key" : "mrws",
                        "titleMap": mrwTitleMapForBody
                    }, 
                    selectMRWButtonForBody
                ]
            };
            break;

    }
    
    console.log("dataModel: ", dataModel);
    console.log("uiForm: ", uiForm);
    return [dataModel, uiForm];
    
}

// preselect all checkboxes for the mrw-annos present in the current selection
// during metaphor annotation creation via the template
function preselectAllMRWAnnos(){
    // select all input fields, where the name starts with "mrws"
    // the input fields storing the mrws present in a selection
    // get their name from the ordering in the mrws-array: 
    // name="mrws[0]" and name="mrws[1]" etc.
    // to get the changing name I refered to
    // https://stackoverflow.com/questions/16791527/how-to-use-a-regular-expression-in-queryselectorall
    const inputs = document.querySelectorAll('input[name^=mrws');
    // checking if any mrws are present in the selection and allowing the toggle
    // only if there are. This prevents an error to be thrown, when no mrws are present
    if (inputs.length > 0) {
        toggleCheckedInputs(inputs);
    }
}

// replace the button to create an annotation with
// a message on how to enable it
function disableAnnotationCreation(){
    document.querySelector("#createAnnotationForm > div:nth-child(1) > input:nth-child(2)").remove();
    let explanationDiv = document.createElement("div");
    explanationDiv.innerText = "Please include a mrw-annotation in your selection after closing this window." 
    document.querySelector("#createAnnotationForm").append(explanationDiv);
}

// wrapper function to hold all functions to be called after the
// modal to create an annotation is being displayed
// TODO: CUSTOMISE: add code/functions to be called
function projectSpecifics(){

    // if a user wants to create a metaphor-annotation, preselect the checkboxes
    // for the linking of mrw-annotations
    if (globalMrwAnnos.length > 0 &&
        document.querySelector("#pickAnnotationTemplateForm > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > select:nth-child(1)").value === "METAPHOR"){
        preselectAllMRWAnnos();
    }
    
    // if a user wants to create a metaphor-annotation, but there is no
    // mrw-annotation present in the selection, disable annotation creation
    //if (globalMrwAnnos.length === 0 &&
        //document.querySelector("#pickAnnotationTemplateForm > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > select:nth-child(1)").value === "METAPHOR"){
        //disableAnnotationCreation();
    //}
}

// jsonForm object to create simple dropdown to choose body template
// upon choosing the corresponding MetadataEditor CREATE form is built
// create button sends the information to the REST controller (bodies/tags) 
// depending on the chosen template
const formObjectCreateBody = {
    // adding blank first option, to allow the functionalities on change
    "schema": {
        "template": {
            "type": "string",
            "enum": [""].concat(Object.keys(bodyTemplate))
        }
    },
    "form": [
        {
        "key": "template",
        "title" : "Choose your template",
        "onChange" : function(e) {
            let value = $(e.target).val(); 
            
            // clearing the modal
            let createFormElement = document.getElementById("createForm");
            while (createFormElement.firstChild) {
                createFormElement.firstChild.remove();
            }
            
            if(!value) {return;};
            let formModel = getFormModel(value);
            //console.log(formModel);
            // if no uiForm is given in getFormModel() for a body template, a wildcard is used.
            // previously a wildcard was always used, but the change in this commit changed the
            // following options variable
            if (formModel[1] === undefined){
                formModel[1] = "*";
            }

            let options = {operation: "CREATE", dataModel: formModel[0], uiForm: formModel[1]};
            
            // preventing form submission to allow customized handling
            createFormElement.addEventListener('submit', function(e) {e.preventDefault();});
            
            $('#createForm').metadataeditorForm(options, function onSubmitValid(value) {
                let jsonObject = JSON.parse(value);
                //console.log(value);
                //console.log(jsonObject);

                // CRC 1475 specific
                // as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
                // of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws)
                if ("mrws" in jsonObject){
                    jsonObject = spreadMRWArray(jsonObject);
                }

                // this if condition necessary for CRC1475, it should always be skipped for NON-CRC1475 body creations
                console.log(jsonObject);
                if (jsonObject.mrws0 !== undefined){
                    // the storeBody() was not implemented to be used to add more bodies to an annotation, but
                    // it offers the needed funtionality to add more bodies, so it is used, but a "dummy" responseJson is needed.
                    // The only thing that storeBody(responseJson, jsonObject, index) needs from the responseJson is the
                    // id of the annotation. So a "dummy" responseJson is created holding only the annotation id.
                    storeBody({"id": globalSelectedAnnotation.id}, jsonObject, 0);
                    // hiding the modal. 
                    document.getElementById('createBody').classList.toggle("show-modal");
                } else {
                    let endpoint;
                    if ("purpose" in jsonObject) {
                        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + document.getElementById("createForm").title + '/bodies';
                    } else {
                        endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + document.getElementById("createForm").title + '/tags';
                    };
                    
                    $ .ajax({
                            type: 'POST',
                            url: endpoint,
                            data: value,
                            headers: {
                                'Content-Type' : 'application/json'
                            },
    
                            success: function(responseData) {
                                console.log(responseData);
                                selectAnnotation(null, document.getElementById("createForm").title);
                                document.getElementById('createBody').classList.toggle("show-modal");
                            },
            
                            error: function(errorData) {
                                console.log(errorData);
                            }
                        });
                }

            });
        },
        "titleMap" : {}
        }
    ]
};

// jsonForm object to create simple dropdown to choose annotation template
// upon choosing the corresponding MetadataEditor CREATE form is built
// create button sends the information to the REST controller  
const formObjectCreateAnnotation = {
    // adding blank first option, to allow the functionalities on change
    "schema": {
        "template": {
            "type": "string",
            "enum": [""].concat(Object.keys(annotationTemplate))
        }
    },
    "form": [
        {
        "key": "template",
        "title" : "Choose your template",
        "onChange" : function(e) {
            let value = $(e.target).val(); 
            
            // clearing the modal
            let createFormElement = document.getElementById("createAnnotationForm");
            while (createFormElement.firstChild) {
                createFormElement.firstChild.remove();
            }
            
            if(!value) {return;};
            let formModel = getFormModel(value);     
            
            let options = {operation: "CREATE", dataModel: formModel[0], uiForm: formModel[1]};
           
            // preventing form submission to allow customized handling
            createFormElement.addEventListener('submit', function(e) {e.preventDefault();});
            
            
            // if no template is chosen, this will create a 'blank' annotation
            // otherwise create annotation with bodies according to template values
            $('#createAnnotationForm').metadataeditorForm(options, function onSubmitValid(value) {
                console.log(value);
                let jsonObject = JSON.parse(value);

                // CRC 1475 specific
                // as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
                // of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws)
                if ("mrws" in jsonObject){
                    jsonObject = spreadMRWArray(jsonObject);
                }
                let color;
                if (jsonObject.color) {
                    color = jsonObject.color;
                } else {
                    color = "#89f099";
                }
               
		// window.location.pathname.split('/').pop() returns the last part of the url, which is the pageId, which is required
		// to create an annotation
                let annotationDataJson = {"pageId" : window.location.pathname.split('/').pop(), "color" : color, "motivation" : "describing"};
                if (document.getElementById("createAnnotationForm").title !== "") {
                    annotationDataJson.svgCode = document.getElementById("createAnnotationForm").title;
                }
                console.log(annotationDataJson);
                
                $ .ajax({
                    type : 'POST',
                    url : window.CONTEXTPATH + 'editor_rest/annotations',
                    data : JSON.stringify(annotationDataJson),
                    headers : {
                            'Content-Type' : 'application/json'
                    },
                    
                    success : function(responseData) {
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
                    
                    error : function(errorData) {
                        console.log(errorData);
                    }           
                });             
            });
            projectSpecifics();
        },
        "titleMap" : {}
        }
    ]
};

// recursive function to store all the necessary bodies  
// ensures sequential creation, otherwise body creation will fail due to etag mismatch
function storeBody(responseJson, jsonObject, index) {
     
    let endpoint;
    let bodyDataJson;
    
    console.log("Key of the json object for body-creation: ", Object.keys(jsonObject)[index]);
    if (Object.keys(jsonObject)[index]) {
        if (Object.keys(jsonObject)[index] === 'color') {
            endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/bodies';
            switch(jsonObject.color) {
                case "#e2b8f7":
                    bodyDataJson = {"purpose" : "classifying", "subject" : "PageRegion"};
                    $ .ajax({
                        type : 'POST',
                        url : endpoint,
                        data : JSON.stringify(bodyDataJson),
                        headers: {
                            'Content-Type' : 'application/json'
                         },
                        
                        success: function(responseData) {
                            console.log(responseData);
                            storeBody(responseJson, jsonObject, index + 1);
                        },
        
                        error: function(errorData) {
                            console.log(errorData);
                        }
                    });
                    break;
                case "#00edff":
                    bodyDataJson = {"purpose" : "classifying", "subject" : "TextRegion", "source" : "http://episteme.org/A04Vokabular#text_block"};
                    $ .ajax({
                        type : 'POST',
                        url : endpoint,
                        data : JSON.stringify(bodyDataJson),
                        headers: {
                            'Content-Type' : 'application/json'
                         },
                        
                        success: function(responseData) {
                            console.log(responseData);
                            storeBody(responseJson, jsonObject, index + 1);
                        },
        
                        error: function(errorData) {
                            console.log(errorData);
                        }
                    });
                    break;
                default:
                    storeBody(responseJson, jsonObject, index + 1);    
            };
            
            
        } else {
            // defines the correct endpoints and purposes for the AJAX call
            if (Object.keys(jsonObject)[index] === "reference" || Object.keys(jsonObject)[index] === "anchor" || Object.keys(jsonObject)[index] === "tag") {
                endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/tags';
                console.log("Tag to store: ", Object.keys(jsonObject)[index]);
                bodyDataJson = {"value" : jsonObject[Object.keys(jsonObject)[index]]};
            } else {
                endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/bodies';

                console.log("Body to store: ", Object.keys(jsonObject)[index]);
                // TODO: CUSTOMISE assignment of purpose to an annotation body
                if (Object.keys(jsonObject)[index] === "transcription") {
                    bodyDataJson = {"purpose" : "tadirah:transcription", "value" : jsonObject[Object.keys(jsonObject)[index]]};
                } else if (Object.keys(jsonObject)[index] === "selectedText"){ // storing the selected text
                    bodyDataJson = {"purpose" : "describing", "value" : jsonObject[Object.keys(jsonObject)[index]]};
                } else if (Object.keys(jsonObject)[index].includes("mrws")){ // linking mrw and metaphor annotation; includes has to be used here
                    // as there can be multiple keys=mrws, with ascending numbers appended
                    bodyDataJson = {"purpose" : "linking", "value" : jsonObject[Object.keys(jsonObject)[index]]};         
                } else if (Object.keys(jsonObject)[index] === "label"){ // human readable label
                    bodyDataJson = {"purpose" : "identifying", "value" : jsonObject[Object.keys(jsonObject)[index]]};
                } else if (Object.keys(jsonObject)[index] === "comment"){ // user entered comment, if no comment given, the key will not be present and no body will be created
                    bodyDataJson = {"purpose" : "commenting", "value" : jsonObject[Object.keys(jsonObject)[index]]};
                } else {
                    bodyDataJson = {"purpose" : "classifying", "value" : jsonObject[Object.keys(jsonObject)[index]]};
                }
            };
            
            $ .ajax({
                type : 'POST',
                url : endpoint,
                data : JSON.stringify(bodyDataJson),
                headers: {
                    'Content-Type' : 'application/json'
                },
                        
                success: function(responseData) {
                    storeBody(responseJson, jsonObject, index + 1);
                },
        
                error: function(errorData) {
                    console.log(errorData);
                }
            });
        };
        
    } else {
        // if no more body needs to be created, hide modal and update global annotation list
        // and highlight the new annotation

        // the following check needs to be done as this storeBody function is used since June 2023
        // for the addition of multiple bodies to an annotation. The function was implemented to
        // be used while creating annotations and not adding bodies, so it previously just toggled
        // the display of the createAnnotation-modal, but now it only toggles the modal, if it
        // is shown.
        if (document.getElementById('createAnnotation').classList.contains("show-modal")) {
            document.getElementById('createAnnotation').classList.toggle("show-modal");
        }
        selectAnnotation(null, encodeAnnoId(responseJson.id));
        if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
            toggleOverview('annotationCard');
        };
        
        // this is not needed anymore for the textEditor since commit 0f347413a3250dd7b79c4a9171630b7556a28f9b on 14.06.23
        // as tAkita js now gets a new annoJson from tAkita core and doesn't update it by itself
        /* let newAnnotation = {"created" : new Date(responseJson.created.seconds * 1000 + responseJson.created.nanos / 1000000).toISOString(), 
            "creator" : responseJson.creators, "id" : responseJson.id, "idEncoded" : encodeAnnoId(responseJson.id), 
            "modified" : new Date(responseJson.modified.seconds * 1000 + responseJson.modified.nanos / 1000000).toISOString(), 
            "motivation" : responseJson.motivation, "visible" : true}; */
        
        // redrawing all annotations
        updateDisplay();

        fillMetaDataEditorTable(annoJson);
        //document.getElementById('createRectangleButton').parentElement.classList.remove('active');
        //document.getElementById('createPolygonButton').parentElement.classList.remove('active');
        document.getElementById("createAnnotationForm").removeAttribute('title');
        
        newRectangle = undefined;
        polygonPoint = undefined;
        firstPolygonPoint = undefined;
        invisiblePolygonPoint = undefined;
        polygonPath = undefined;
        addingRectangle = false;
        addingPolygon = false;
        return;
    }
}

function pickTemplate(svgCode, encodedId, createFormId, pickFormId, template) {
    
    // clear out forms and content from former submissions
    let pickContent = document.getElementById(pickFormId);
    while (pickContent.firstChild) {
        pickContent.firstChild.remove();
    };
    let formContent = document.getElementById(createFormId);
    while (formContent.firstChild) {
        formContent.firstChild.remove();
    };
    
    // creates title map needed for the dropdown selection
    for (name in Object.keys(template)) {
        if (template === "bodyTemplate") {
            formObjectCreateBody.form[0].titleMap[Object.keys(template)[name]] = Object.values(template)[name];    
        } else {
            formObjectCreateAnnotation.form[0].titleMap[Object.keys(template)[name]] = Object.values(template)[name];
        };
    };
    
    // stores annotation id in title in case of body creation
    // TODO: find better solution for this
    if (encodedId !== "") {
        document.getElementById(createFormId).title = encodedId;
    }
    
    // stores svg code in title in case of annotation creation for shape
    // TODO: find better solution for this
    if (svgCode !== "") {
        document.getElementById(createFormId).title = svgCode;
    }
    
    // creates dropdown from enum objects defined at the top
    if (template === "bodyTemplate") {
        $('#' + pickFormId).jsonForm(formObjectCreateBody);
    } else {
        $('#' + pickFormId).jsonForm(formObjectCreateAnnotation);
    }
}
