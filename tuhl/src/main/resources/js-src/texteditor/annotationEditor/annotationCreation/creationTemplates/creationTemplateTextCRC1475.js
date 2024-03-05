// external modules
import { $ } from 'jquery';

// internal modules
import { getFormModel, spreadMRWArray, storeBody, projectSpecifics } from './utils';

// enum for different annotation templates
// TODO: CUSTOMISE available annotations (will be shown during the annotation process)
// for adding new: include name here and add dataModel in
// getFormModel(chosenTemplate)
const annotationTemplate = {
  MRWDIRECT: 'mrwdirect',
  MRWINDIRECT: 'mrwindirect',
  MRWIMPLICIT: 'mrwimplicit',
  MFLAG: 'mflag',
  METAPHOR: 'metaphor',
};

// jsonForm object to create simple dropdown to choose annotation template
// upon choosing the corresponding MetadataEditor CREATE form is built
// create button sends the information to the REST controller
export const formObjectCreateAnnotation = {
  // adding blank first option, to allow the functionalities on change
  schema: {
    template: {
      type: 'string',
      enum: [''].concat(Object.keys(annotationTemplate)),
    },
  },
  form: [
    {
      key: 'template',
      title: 'Choose your template',
      onChange: function (e) {
        let value = $(e.target).val();

        // clearing the modal
        let createFormElement = document.getElementById('createAnnotationForm');
        while (createFormElement.firstChild) {
          createFormElement.firstChild.remove();
        }

        if (!value) {
          return;
        }
        let formModel = getFormModel(value);

        let options = { operation: 'CREATE', dataModel: formModel[0], uiForm: formModel[1] };

        // preventing form submission to allow customized handling
        createFormElement.addEventListener('submit', function (e) {
          e.preventDefault();
        });

        // if no template is chosen, this will create a 'blank' annotation
        // otherwise create annotation with bodies according to template values
        $('#createAnnotationForm').metadataeditorForm(options, function onSubmitValid(value) {
          console.log(value);
          let jsonObject = JSON.parse(value);

          // CRC 1475 specific
          // as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
          // of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws)
          if ('mrws' in jsonObject) {
            jsonObject = spreadMRWArray(jsonObject);
          }
          let color;
          if (jsonObject.color) {
            color = jsonObject.color;
          } else {
            color = '#89f099';
          }

          // window.location.pathname.split('/').pop() returns the last part of the url,
          // which is the pageId, which is required
          // to create an annotation
          let annotationDataJson = {
            pageId: window.location.pathname.split('/').pop(),
            color: color,
            motivation: 'describing',
          };
          if (document.getElementById('createAnnotationForm').title !== '') {
            annotationDataJson.svgCode = document.getElementById('createAnnotationForm').title;
          }
          console.log(annotationDataJson);

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
        });
        projectSpecifics();
      },
      titleMap: {},
    },
  ],
};
