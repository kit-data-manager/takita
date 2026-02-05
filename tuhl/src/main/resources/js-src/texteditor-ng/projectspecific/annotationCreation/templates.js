// external imports
import { isEmpty } from 'underscore';
import $ from 'jquery';
import * as bootstrap from 'bootstrap';
// internal imports
import { makeAnnotationData, makeBodiesData } from './utils';
import { hooks } from '..';
import { createAnnotation } from '../../../common/annotationCreation';
import { selectAnnotation } from '../../../common/annotationCard';
import '../../../common/utils/metadataeditor';
import { createBodyData } from '../../../common/data';

// TODO: CUSTOMISE the four objects in here, which are necessary for annotation/body creation.
// Leave the exported objects/functions (annotationTemplate, bodyTemplate, getFormObjectCreateAnnotation,
// getFormObjectCreateBody, useJQueryPlugin, pickTemplate) untouched. They have to be exported to be
// mocked during the tests

// enum for different annotation templates (the values are shown in the dropdown after
// starting the process of creating a new annotation)
// for adding new: include name here and add dataModel in
// getFormModel(chosenTemplate)
export const annotationTemplate = {
  EXAMPLE: 'example',
  NOTEMPLATE: 'notemplate',
};

// enum for different body templates to create simple dropdown to choose body template
// (the values are shown in the dropdown after starting the process of creating a new body
// by clicking on the "+" icon in the top right corner of the annotation card)
// for adding new: include name here and add dataModel in
// getFormModel(chosenTemplate)
export const bodyTemplate = {
  TAG: 'tag',
  TEXTBODY: 'textbody',
};

/**
 * returns the ui form for the jsonForm object to create new annotation.
 * Upon choosing the corresponding MetadataEditor CREATE form is built
 * create button sends the information to the REST controller
 *
 * @param {[Object]} selectors array holding all the selectors
 * @returns {JSON} the ui form
 */
export function getFormObjectCreateAnnotation(selectors) {
  return {
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
          $('#createAnnotationForm').metadataeditorForm(options, async function onSubmitValid(formvalue) {
            // formvalue contains all the information from the jsonForm as a string
            const annotationData = makeAnnotationData(formvalue, selectors);
            // eslint-disable-next-line no-unused-vars
            const annotation = await createAnnotation(annotationData, hooks);
          });
        },
        titleMap: {},
      },
    ],
  };
}

/**
 * returns ui form for the jsonForm  object to create new body
 * upon choosing the corresponding MetadataEditor CREATE form is built
 * create button sends the information to the REST controller (bodies/tags)
 * depending on the chosen template
 *
 * @param {String} encodedAnnoId encoded id of the annotation
 * @returns {JSON} the ui form
 */
export function getFormObjectCreateBody(encodedAnnoId) {
  return {
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

          $('#createForm').metadataeditorForm(options, async function onSubmitValid(value) {
            let jsonObject = JSON.parse(value);
            //console.log(value);
            //console.log(jsonObject);

            console.log(jsonObject);
            if (jsonObject !== undefined && !isEmpty(jsonObject)) {
              try {
                if (jsonObject.purpose) {
                  // preventing creation of a body without a value
                  if (jsonObject.value) {
                    await createBodyData(encodedAnnoId, jsonObject);
                  } else {
                    throw new Error('No value given in: ', jsonObject);
                  }
                } else {
                  const bodies = makeBodiesData(jsonObject);
                  // trigger the body creation according to the template for each body
                  for (let body of bodies) {
                    // eslint-disable-next-line no-unused-vars
                    const newBody = await createBodyData(encodedAnnoId, body);
                  }
                }

                // hiding the modal.
                const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('createBody'));
                $modal.toggle();

                window.SELECTED_ANNOTATION = await selectAnnotation(null, encodedAnnoId, hooks);
              } catch (exception) {
                console.error('Adding another body failed with: ', exception);
              }
            }
          });
        },
        titleMap: {},
      },
    ],
  };
}

// assigns data model needed for MetadataEditor to specific template
// the actual thing where templating is done
// TODO: CUSTOMISE available annotations and their structure/content (dataModel)
// and how they are displayed in the modal (uiForm)
/**
 * gets data model needed for MetadataEditor/JSONForm of specific template
 *
 * @param {String} chosenTemplate the template that was chosen
 * @returns {[Object]} dataModel, uiForm associated with the template
 */
function getFormModel(chosenTemplate) {
  let dataModel;
  let uiForm;

  switch (chosenTemplate) {
    case 'EXAMPLE':
      dataModel = {
        type: 'object',
        properties: {
          freetext: {
            type: 'string',
            title: 'free text input',
          },
          enum: {
            type: 'string',
            title: 'enum input',
            enum: ['', 'Term1', 'Term2', 'Term3'],
          },
          tag: {
            type: 'string',
            title: 'tag input',
          },
        },
      };
      uiForm = {
        type: 'fieldset',
        items: [
          {
            key: 'freetext',
          },
          {
            key: 'enum',
          },
          {
            key: 'tag',
          },
        ],
      };
      break;

    case 'NOTEMPLATE':
      dataModel = {
        type: 'object',
        properties: {
          hidden: {
            type: 'string',
            title: 'hiddenObject',
          },
        },
      };
      uiForm = {
        type: 'fieldset',
        items: [],
      };
      break;

    case 'TAG':
      dataModel = {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: 'value',
          },
        },
        required: ['value'],
      };
      break;

    case 'TEXTBODY':
      dataModel = {
        type: 'object',
        properties: {
          purpose: {
            type: 'string',
            title: 'purpose',
            enum: [
              'assessing',
              'bookmarking',
              'classifying',
              'commenting',
              'describing',
              'editing',
              'highlighting',
              'identifying',
              'linking',
              'moderating',
              'questioning',
              'replying',
              'tagging',
            ],
          },
          value: {
            type: 'string',
            title: 'value',
          },
        },
        required: ['purpose', 'value'],
      };
      break;
  }

  console.log('dataModel: ', dataModel);
  console.log('uiForm: ', uiForm);
  return [dataModel, uiForm];
}

/**
 * test to see if $ and metadataeditor are imported correctly
 *
 * @param {Element} node to be wrapped in a jQuery selection
 * @returns the jQuery selection
 */
export function useJQueryPlugin(node) {
  return $(node);
}

/**
 * creates the JSONForm and shows the modal to create an annotation based on
 * the given template
 *
 * @param {[Object]} selectors array containing the selector objects
 * @param {String} encodedAnnoId encoded id of the annotation
 * @param {String} createFormId
 * @param {String} pickFormId
 * @param {String} template for body or annotation creation
 */
export function pickTemplate(selectors, encodedAnnoId, createFormId, pickFormId, template) {
  // clear out forms and content from former submissions
  let pickContent = document.getElementById(pickFormId);
  while (pickContent.firstChild) {
    pickContent.firstChild.remove();
  }
  let formContent = document.getElementById(createFormId);
  while (formContent.firstChild) {
    formContent.firstChild.remove();
  }

  // Philipp doesn't understand why this is necessary. Everything works without it.
  // The titleMap only contains the words (annotationTemplate or bodyTemplate)
  // split into a titleMap (index: letter -> 0:a, 1:n ...). The actual values used in
  // the dropdown selection are taken from getFormObjectCreateAnnotation().schema.template.enum.
  // creates title map needed for the dropdown selection
  // for (const tName in Object.keys(template)) {
  //   if (template === 'bodyTemplate') {
  //     getFormObjectCreateBody().form[0].titleMap[Object.keys(template)[tName]] = Object.values(template)[tName];
  //   } else {
  //     getFormObjectCreateAnnotation().form[0].titleMap[Object.keys(template)[tName]] = Object.values(template)[tName];
  //   }
  // }

  // creates dropdown from enum objects defined at the top
  if (template === 'bodyTemplate') {
    $('#' + pickFormId).jsonForm(getFormObjectCreateBody(encodedAnnoId));
  } else {
    $('#' + pickFormId).jsonForm(getFormObjectCreateAnnotation(selectors));
  }
}
