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
    DIAGRAM : "diagram",
    GLOSS : "gloss",
    PAGEREGION : "pageregion",
    MAINTEXT : "maintext",
    TARGETAUDIENCE : "targetaudience",
    NOTEMPLATE : "notemplate",
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
                    "tag" : {
                        "type" : "string",
                        "title" : "tag",
                        "default" : "mrw",
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
        
        case "MFLAG":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "tag" : {
                        "type" : "string",
                        "title" : "tag",
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
            dataModel = {
                "type" : "object",
                "properties" : {
                    "tag" : {
                        "type" : "string",
                        "title" : "tag",
                        "default" : "metaphor",
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
        
        case "CONTEXT":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "tag" : {
                        "type" : "string",
                        "title" : "tag",
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
        case "GLOSS":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "reference" : {
                        "type" : "string",
                        "title" : "Bekker reference"
                    },
                    "anchor" : {
                        "type" : "string",
                        "title" : "annotated content"
                    },
                    "transcription" : {
                        "type" : "string",
                        "title" : "transcription"
                    },
                    "classification" : {
                        "type" : "string",
                        "title" : "classification",
                        "enum" : ["", "Interlinearglosse", "Marginalglosse", "Scholie", "Kommentar"]
                    },
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#00edff",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    "reference",
                    "anchor",
                    {
                        "key": "transcription",
                        "type": "textarea"
                    },
                    "classification",
                    {
                        "key" : "color",
                        "readOnly" : true
                    }
                
            ]};
            break;
        case "DIAGRAM":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "reference" : {
                        "type" : "string",
                        "title" : "Bekker reference"
                    },
                    "tag" : {
                        "type" : "string",
                        "title" : "tag"
                    },
                    "transcription" : {
                        "type" : "string",
                        "title" : "transcription"
                    },
                    "classification" : {
                        "type" : "string",
                        "title" : "classification",
                        "enum" :["", "Syllogiusmusschema (1. Figur)", "Syllogiusmusschema (2. Figur)", "Syllogiusmusschema (3. Figur)", "Dihairese", "Kreuzdiagramm", "sonstiges erklärendes Diagramm/Schema"]
                    },
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#2e8da6",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    "reference",
                    "tag",
                    {
                        "key": "transcription",
                        "type": "textarea"
                    },
                    "classification",
                    {
                        "key" : "color",
                        "readOnly" : true
                    }
                
            ]};
            break;
        case "PAGEREGION":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#e2b8f7",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    {
                        "key" : "color",
                        "readOnly" : true
                    }
                ]
            };
            break;
        case "MAINTEXT":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "color" : {
                        "type" : "string",
                        "title" : "color",
                        "default" : "#00edff",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    {
                        "key" : "color",
                        "readOnly" : true
                    }
                ]
            };
            break;
            case "TARGETAUDIENCE":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "transcription" : {
                        "type" : "string",
                        "title" : "transcription"
                    },
                    "tag" : {
                        "type" : "string",
                        "title" : "tag",
                        "default" : "Zielgruppe",
                        "readOnly" : true
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : [
                    {
                        "key": "transcription",
                        "type": "textarea"
                    },
                    {
                        "key" : "tag",
                        "readOnly" : true
                    }
                
            ]};
            break;     
        case "NOTEMPLATE":
            dataModel = {
                "type" : "object",
                "properties" : {
                    "hidden" : {
                        "type" : "string",
                        "title" : "hiddenObject"
                    }
                }
            };
            uiForm = {
                "type" : "fieldset",
                "items" : []
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
                
                let color;
                if (jsonObject.color) {
                    color = jsonObject.color;
                } else {
                    color = "#89f099";
                }
                
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
                        console.log(responseData);
                        console.log("stop");
                        let responseJson = JSON.parse(responseData);
                        
                        // if needed: store the annotation ID within the 
                        // corresponding shape
                        console.log(annotationDataJson.svgCode);
                        let shape;
                        paper.forEach(function(element) {
                            if (element.type === "rect" || element.type === "path") {
                                
                                shape = element;
                                
                            }
                        });
                        if (document.getElementById("createAnnotationForm").title !== "") {
                            console.log(shape);
                            console.log(responseJson);
                            shape.annoId = responseJson.id;
                            shape.annoIdEncoded = encodeAnnoId(responseJson.id);
                            shape.attr({'stroke': color, 'fill': color});
                            toggleShapeSelect(shape);
                        };
                        
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

// recursive function to store all the necessary bodies  
// ensures sequential creation, otherwise body creation will fail due to etag mismatch
function storeBody(responseJson, jsonObject, index) {
     
    let endpoint;
    let bodyDataJson; 
    
    console.log(Object.keys(jsonObject)[index]);
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
                bodyDataJson = {"value" : jsonObject[Object.keys(jsonObject)[index]]};
            } else {
                endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(responseJson.id) + '/bodies';
                if (Object.keys(jsonObject)[index] === "transcription") {
                    bodyDataJson = {"purpose" : "tadirah:transcription", "value" : jsonObject[Object.keys(jsonObject)[index]]};
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
                    storeBody(responseJson, jsonObject, index + 1);
                },
        
                error: function(errorData) {
                    console.log(errorData);
                }
            });
        };
        
    } else {
        // if no more body needs to be created, hide modal and update global annotation list
        document.getElementById('createAnnotation').classList.toggle("show-modal");
        selectAnnotation(null, encodeAnnoId(responseJson.id));
        if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
            toggleOverview('annotationCard');
        };
        
        let newAnnotation = {"created" : new Date(responseJson.created * 1000).toISOString(), 
            "creator" : responseJson.creators, "id" : responseJson.id, "idEncoded" : encodeAnnoId(responseJson.id), 
            "modified" : new Date(responseJson.modified * 1000).toISOString(), 
            "motivation" : responseJson.motivation, "visible" : true};
        
        if (document.getElementById("createAnnotationForm").title !== "") {
            newAnnotation.svg = document.getElementById("createAnnotationForm").title;
            extractInformationFromSvg(newAnnotation.svg, newAnnotation);
        }; 
        
        annoJson.push(newAnnotation);
        fillMetaDataEditorTable(annoJson);
        
        document.getElementById('createRectangleButton').parentElement.classList.remove('active');
        document.getElementById('createPolygonButton').parentElement.classList.remove('active');
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