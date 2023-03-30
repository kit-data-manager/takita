// enum for different body templates
// for adding new: include name here and add dataModel in 
// getFormModel(chosenTemplate)
const bodyTemplate = {
    TAG : "tag",
    TEXTBODY : "textbody"
    
};

// enum for different annotation templates
// for adding new: include name here and add dataModel in 
// getFormModel(chosenTemplate)
const annotationTemplate = {
    MRW : "mrw",
    MFLAG : "mFlag",
    METAPHOR : "metaphor",
    CONTEXT : "context"
    
};

// assigns data model needed for MetadataEditor to specific template
function getFormModel(chosenTemplate) {
    let dataModel;
    let uiForm;
    
    switch (chosenTemplate) {
        case "MRW":
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
                        "default" : "mrw",
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
                    }                
            ]};
            break;  
        
        case "MFLAG":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "tag" : {
                        "type" : "string",
                        "title" : "Tag",
                        "default" : "mflag",
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
        
        case "METAPHOR":
			// if a user wants to create a metaphor annotation,
	        // get all the mrws that are present in his selection
	        // and update the enum to hold all the mrwAnnoIds, so the user can
	        // choose a mrw to link it to a metaphor
			//let mrwSet = new Set();
			let mrwEnum = [];
			// metaphorTitleMap is necessary to have the actual words displayed,
			// but the have the annoId as a value on the submission of the form
			let mrwTitleMap = {};
			let targetMRW = "";
			// TODO: this iteration nesting needs to be improved; it got created due 
			// to annotations having multiple targets
			mrwAnnos.forEach(anno =>{
				//console.log(anno);
				// getting the text
				anno.svg.forEach( svgs => {
					targetMRW += document.getElementById(svgs.split("\"")[1]).innerHTML +
							 " = " + svgs.split("\"")[1] + " | ";
				});
				targetMRW = targetMRW.slice(0, (targetMRW.length-3));
				//console.log(targetMRW);
				mrwTitleMap[anno.id] = targetMRW;
				// emptying the string, so it can be filled during next iteration cycle
				targetMRW = "";
				mrwEnum.push(anno.id);
				//console.log(mrwEnum);
			});
            // a user can either use the default label or create a humanreadable
            // label for the metaphor annotation
            let defaultLabel = currentPageNumber + Date.now();

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
	                    "default" : "metaphor",
	                    "readOnly" : true
	                },
	                "mrws" : {
	                    "type" : "array",
	                    "title" : "Metaphor related words",
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
	                }
	            }
	        };
			uiForm = {
	        	"type" : "fieldset",
	        	"items" : [
					
					{
                        "key": "selectedText",
                        "type": "textarea"
                    },
					{
						
		                "key" : "tag",
                        "readOnly" : true
	                    
	                },{
						"type" : "checkboxes",
						"key" : "mrws",
	                    "titleMap": mrwTitleMap
	                    	
	                },{
                        "key": "label"
                    },{
                        "key": "comment",
                        "type": "textarea"
                    }
                ]
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
                
        case "TAG":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "value" : {
                        "type" : "string",
                        "title" : "value"
                    }
                },
                "required" : ["value"]
            };
            break;
        case "TEXTBODY":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "purpose" : {
                        "type" : "string",
                        "title" : "purpose"
                    },
                    "value" : {
                        "type" : "string",
                        "title" : "value"
                    }
                },
                "required" : ["purpose", "value"]
            };
            break;

    }
    
    console.log(dataModel);
    console.log(uiForm);
    return [dataModel, uiForm];
    
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
            let dataModel = getFormModel(value);
            
            let options = {operation: "CREATE", dataModel: dataModel[0], uiForm: "*"};
            
            // preventing form submission to allow customized handling
            createFormElement.addEventListener('submit', function(e) {e.preventDefault();});
            
            $('#createForm').metadataeditorForm(options, function onSubmitValid(value) {
                let jsonObject = JSON.parse(value);
                console.log(value);
                console.log(jsonObject);
                let endpoint;
                if ("purpose" in jsonObject) {
                    endpoint = '/editor_rest/annotations/' + document.getElementById("createForm").title + '/bodies';
                } else {
                    endpoint = '/editor_rest/annotations/' + document.getElementById("createForm").title + '/tags';
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
                    let mrws = [...jsonObject.mrws];
                    delete jsonObject.mrws;
                    for (var i = 0; i < mrws.length; i++) {
                        let keyCounter = "mrws" + i;
                        jsonObject[keyCounter] = mrws[i];
                    }
                }

                let color;
                if (jsonObject.color) {
                    color = jsonObject.color;
                } else {
                    color = "#89f099";
                }
                
                let annotationDataJson = {"pageId" : window.location.pathname.split('/')[2], "color" : color, "motivation" : "describing"};
                if (document.getElementById("createAnnotationForm").title !== "") {
                    annotationDataJson.svgCode = document.getElementById("createAnnotationForm").title;
                }
                console.log(annotationDataJson);
                
                $ .ajax({
                    type : 'POST',
                    url : '/editor_rest/annotations',
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
        },
        "titleMap" : {}
        }
    ]
};

// storing tags needed for highlighting; name needs to be specific so it doesn't clash with other variables
var tagsIOP = [];
// recursive function to store all the necessary bodies  
// ensures sequential creation, otherwise body creation will fail due to etag mismatch
function storeBody(responseJson, jsonObject, index) {
     
    let endpoint;
    let bodyDataJson;

    
    console.log(Object.keys(jsonObject)[index]);
    if (Object.keys(jsonObject)[index]) {
        if (Object.keys(jsonObject)[index] === 'color') {
            endpoint = '/editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/bodies';
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
                endpoint = '/editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/tags';
                bodyDataJson = {"value" : jsonObject[Object.keys(jsonObject)[index]]};
            } else {
                endpoint = '/editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/bodies';

                console.log("Body to store: ", Object.keys(jsonObject)[index]);
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
                    console.log(responseData);
                    // putting the tag value in the tag array, so they can be stored in the annoJson later
                    let responseDataJson = JSON.parse(responseData);
                    tagsIOP.push({"value" : responseDataJson.value});
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
        document.getElementById('createAnnotation').classList.toggle("show-modal");
        selectAnnotation(null, encodeAnnoId(responseJson.id));
        if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
            toggleOverview('annotationCard');
        };
        
        // added "tags" to the annotation
        let newAnnotation = {"created" : new Date(responseJson.created.seconds * 1000 + responseJson.created.nanos / 1000000).toISOString(), 
            "creator" : responseJson.creators, "id" : responseJson.id, "idEncoded" : encodeAnnoId(responseJson.id), 
            "modified" : new Date(responseJson.modified.seconds * 1000 + responseJson.modified.nanos / 1000000).toISOString(), 
            "motivation" : responseJson.motivation, "visible" : true, "tags" : tagsIOP};
        
        if (document.getElementById("createAnnotationForm").title !== "") {
            newAnnotation.svg = document.getElementById("createAnnotationForm").title;
            //extractInformationFromSvg(newAnnotation.svg, newAnnotation);
            // this conversion needs to be done, so the drawAnno code works, as it epects the svg to be an array
            var svgArray = [];
	        if (newAnnotation.svg.includes("§")){
				newAnnotation.svg.split("§").forEach(svgCode =>{
					svgArray.push(svgCode);
				});
			} else {
				svgArray.push(newAnnotation.svg)
			}
			newAnnotation.svg = svgArray;
        }; 
        
        annoJson.push(newAnnotation);
        fillMetaDataEditorTable(annoJson);
        
        // redrawing all annotations
        removeStyles(document.getElementById("TEI"));
    	drawAnnos(annoJson);
        
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