// external modules
import { $ } from 'jquery';
// internal modules
import { getFormModel, spreadMRWArray, storeBody } from './utils';
import { selectAnnotation } from '../../../../common/annotationDisplay/selection';

// enum for different body templates
// for adding new: include name here and add dataModel in
// getFormModel(chosenTemplate)
const bodyTemplate = {
  COMMENT: 'comment',
  MRW: 'mrw',
};

// jsonForm object to create simple dropdown to choose body template
// upon choosing the corresponding MetadataEditor CREATE form is built
// create button sends the information to the REST controller (bodies/tags)
// depending on the chosen template
export const formObjectCreateBody = {
  // adding blank first option, to allow the functionalities on change
  schema: {
    template: {
      type: 'string',
      enum: [''].concat(Object.keys(bodyTemplate)),
    },
  },
  form: [
    {
      key: 'template',
      title: 'Choose your template',
      onChange: function (e) {
        let value = $(e.target).val();

        // clearing the modal
        let createFormElement = document.getElementById('createForm');
        while (createFormElement.firstChild) {
          createFormElement.firstChild.remove();
        }

        if (!value) {
          return;
        }
        let formModel = getFormModel(value);
        //console.log(formModel);
        // if no uiForm is given in getFormModel() for a body template, a wildcard is used.
        // previously a wildcard was always used, but the change in this commit changed the
        // following options variable
        if (formModel[1] === undefined) {
          formModel[1] = '*';
        }

        let options = { operation: 'CREATE', dataModel: formModel[0], uiForm: formModel[1] };

        // preventing form submission to allow customized handling
        createFormElement.addEventListener('submit', function (e) {
          e.preventDefault();
        });

        $('#createForm').metadataeditorForm(options, function onSubmitValid(value) {
          let jsonObject = JSON.parse(value);
          //console.log(value);
          //console.log(jsonObject);

          // CRC 1475 specific
          // as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
          // of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws)
          if ('mrws' in jsonObject) {
            jsonObject = spreadMRWArray(jsonObject);
          }

          // this if condition necessary for CRC1475, it should always be skipped for NON-CRC1475 body creations
          console.log(jsonObject);
          if (jsonObject.mrws0 !== undefined) {
            // the storeBody() was not implemented to be used to add more bodies to an annotation, but
            // it offers the needed funtionality to add more bodies, so it is used, but a "dummy"
            // responseJson is needed.
            // The only thing that storeBody(responseJson, jsonObject, index) needs from the responseJson is the
            // id of the annotation. So a "dummy" responseJson is created holding only the annotation id.
            storeBody({ id: globalSelectedAnnotation.id }, jsonObject, 0);
            // hiding the modal.
            document.getElementById('createBody').classList.toggle('show-modal');
          } else {
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
        });
      },
      titleMap: {},
    },
  ],
};
