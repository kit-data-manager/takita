// external imports
import { isEmpty } from 'underscore';
import $ from 'jquery';
// internal imports
import {
  preselectAllMRWAnnos,
  makeAnnotationData,
  getEnumAndTitleMap,
  getSelectMRWButton,
  findSelectedMRWAnnos,
  spreadMRWArray,
  makeBodiesData,
} from './utils';
import { hooks } from '..';
import { createAnnotation } from '../../common/annotationCreation';
import { selectAnnotation } from '../../common/annotationCard';
import '../../common/utils/metadataeditor';
import { createBodyData } from '../../texteditor-ng/data';

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

// enum for different body templates
// for adding new: include name here and add dataModel in
// getFormModel(chosenTemplate)
const bodyTemplate = {
  COMMENT: 'comment',
  MRW: 'mrw',
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
        $('#createAnnotationForm').metadataeditorForm(options, async function onSubmitValid(formvalue) {
          // formvalue contains all the information from the jsonForm as a string
          const annotationData = makeAnnotationData(formvalue);
          const annotation = await createAnnotation(annotationData, hooks);
        });

        preselectAllMRWAnnos();
      },
      titleMap: {},
    },
  ],
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

        $('#createForm').metadataeditorForm(options, async function onSubmitValid(value) {
          let jsonObject = JSON.parse(value);
          const annotationId = document.getElementById('createForm').title;
          //console.log(value);
          //console.log(jsonObject);

          // CRC 1475 specific
          // as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
          // of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws)
          if ('mrws' in jsonObject) {
            jsonObject = spreadMRWArray(jsonObject);
          }

          console.log(jsonObject);
          if (jsonObject !== undefined && !isEmpty(jsonObject)) {
            try {
              if (jsonObject.purpose) {
                // preventing creation of a body without a value
                if (jsonObject.value) {
                  await createBodyData(annotationId, jsonObject);
                } else {
                  throw new Error('No value given in: ', jsonObject);
                }
              } else {
                const bodies = makeBodiesData(jsonObject);
                // trigger the body creation according to the template for each body
                for (let body of bodies) {
                  const newBody = await createBodyData(annotationId, body);
                }
              }

              // hiding the modal.
              document.getElementById('createBody').classList.toggle('show-modal');
              window.SELECTED_ANNOTATION = selectAnnotation(null, document.getElementById('createForm').title, hooks);
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

// assigns data model needed for MetadataEditor to specific template
// the actual thing where templating is done
// TODO: CUSTOMISE available annotations and their structure/content (dataModel)
//      (when adjusting the "color.default.value", make sure to add those to the enum in
//      "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java" and the code in
//      "takita/tuhl/src/main/resources/static/js/editor_xml.js" at
//          - drawAnnos(annoJson)
//          - getColorNameFromEnumEntry(colorEnumEntry)/getColorHexFromEnumEntry(colorEnumEntry)
//      and that the color hexcodes match)
// and how they are displayed in the modal (uiForm)
/**
 * gets data model needed for MetadataEditor/JSONForm of specific template
 *
 * @param {String} chosenTemplate the template that was chosen
 * @returns {[Object]} dataModel, uiForm associated with the template
 */
export function getFormModel(chosenTemplate) {
  let dataModel;
  let uiForm;

  switch (chosenTemplate) {
    case 'MRWDIRECT': {
      dataModel = {
        type: 'object',
        properties: {
          selectedText: {
            type: 'string',
            title: 'Selected text',
            default: window.SELECTED_TEXT,
            readOnly: true,
          },
          classification: {
            type: 'string',
            title: 'Classification',
            default: 'mrw (direct)',
            readOnly: true,
          },
          color: {
            type: 'string',
            title: 'color',
            default: '#000011',
            readOnly: true,
          },
        },
      };
      uiForm = {
        type: 'fieldset',
        items: [
          'selectedText',
          {
            key: 'classification',
            readOnly: true,
          },
          {
            key: 'color',
            readOnly: true,
            htmlClass: 'is-hidden',
          },
        ],
      };
      break;
    }
    case 'MRWINDIRECT': {
      dataModel = {
        type: 'object',
        properties: {
          selectedText: {
            type: 'string',
            title: 'Selected text',
            default: window.SELECTED_TEXT,
            readOnly: true,
          },
          classification: {
            type: 'string',
            title: 'Classification',
            default: 'mrw (indirect)',
            readOnly: true,
          },
          color: {
            type: 'string',
            title: 'color',
            default: '#000012',
            readOnly: true,
          },
        },
      };
      uiForm = {
        type: 'fieldset',
        items: [
          'selectedText',
          {
            key: 'classification',
            readOnly: true,
          },
          {
            key: 'color',
            readOnly: true,
            htmlClass: 'is-hidden',
          },
        ],
      };
      break;
    }
    case 'MRWIMPLICIT': {
      dataModel = {
        type: 'object',
        properties: {
          selectedText: {
            type: 'string',
            title: 'Selected text',
            default: window.SELECTED_TEXT,
            readOnly: true,
          },
          classification: {
            type: 'string',
            title: 'Classification',
            default: 'mrw (implicit)',
            readOnly: true,
          },
          color: {
            type: 'string',
            title: 'color',
            default: '#000013',
            readOnly: true,
          },
        },
      };
      uiForm = {
        type: 'fieldset',
        items: [
          'selectedText',
          {
            key: 'classification',
            readOnly: true,
          },
          {
            key: 'color',
            readOnly: true,
            htmlClass: 'is-hidden',
          },
        ],
      };
      break;
    }
    case 'MFLAG': {
      dataModel = {
        type: 'object',
        properties: {
          selectedText: {
            type: 'string',
            title: 'Selected text',
            default: window.SELECTED_TEXT,
            readOnly: true,
          },
          classification: {
            type: 'string',
            title: 'Classification',
            default: 'mflag',
            readOnly: true,
          },
          color: {
            type: 'string',
            title: 'color',
            default: '#000014',
            readOnly: true,
          },
        },
      };
      uiForm = {
        type: 'fieldset',
        items: [
          'selectedText',
          {
            key: 'classification',
            readOnly: true,
          },
          {
            key: 'color',
            readOnly: true,
            htmlClass: 'is-hidden',
          },
        ],
      };
      break;
    }
    case 'METAPHOR': {
      // a user can either use the default label or create a humanreadable
      // label for the metaphor annotation
      let defaultLabel = window.CURRENTPAGENUMBER + Date.now();

      let dataModelProperties = {
        selectedText: {
          type: 'string',
          title: 'Selected text',
          default: window.SELECTED_TEXT,
          readOnly: true,
        },
        classification: {
          type: 'string',
          title: 'Classification',
          default: 'metaphor',
          readOnly: true,
        },
        label: {
          type: 'string',
          title: 'Label',
          default: defaultLabel,
        },
        comment: {
          type: 'string',
          title: 'Comment',
        },
        color: {
          type: 'string',
          title: 'color',
          default: '#000021',
          readOnly: true,
        },
      };

      let uiFormItems = [
        {
          key: 'selectedText',
          type: 'textarea',
        },
        {
          key: 'classification',
          readOnly: true,
        },
        {
          key: 'label',
        },
        {
          key: 'comment',
          type: 'textarea',
        },
        {
          key: 'color',
          readOnly: true,
          htmlClass: 'is-hidden',
        },
      ];

      // if there are mrw-annotations present in the current selection
      // modify the dataModel and uiForm in a way to show a checkbox
      // for each mrw-annotation present
      if (window.MRW_ANNOS.length > 0) {
        // if a user wants to create a metaphor annotation,
        // get all the mrws that are present in his selection (window.MRW_ANNOS)
        // and store them in the enum to hold all the mrwAnnoIds, so the user can
        // choose a mrw to link it to a metaphor

        let enumAndTitleMap = getEnumAndTitleMap(window.MRW_ANNOS);
        let mrwEnum = enumAndTitleMap[0];
        // metaphorTitleMap is necessary to have the actual words displayed,
        // but to have the annoId as a value on the submission of the form
        let mrwTitleMap = enumAndTitleMap[1];
        let selectMRWButton = getSelectMRWButton(mrwEnum);

        dataModelProperties = {
          selectedText: {
            type: 'string',
            title: 'Selected text',
            default: window.SELECTED_TEXT,
            readOnly: true,
          },
          classification: {
            type: 'string',
            title: 'Classification',
            default: 'metaphor',
            readOnly: true,
          },
          mrws: {
            type: 'array',
            title: 'Metaphor related words (direct, indirect, implicit and mflags)',
            items: {
              type: 'string',
              title: 'Option',
              enum: mrwEnum,
            },
          },
          label: {
            type: 'string',
            title: 'Label',
            default: defaultLabel,
          },
          comment: {
            type: 'string',
            title: 'Comment',
          },
          color: {
            type: 'string',
            title: 'color',
            default: '#000021',
            readOnly: true,
          },
        };
        uiFormItems = [
          {
            key: 'selectedText',
            type: 'textarea',
          },
          {
            key: 'classification',
            readOnly: true,
          },
          {
            type: 'checkboxes',
            key: 'mrws',
            titleMap: mrwTitleMap,
          },
          selectMRWButton,
          {
            key: 'label',
          },
          {
            key: 'comment',
            type: 'textarea',
          },
          {
            key: 'color',
            readOnly: true,
            htmlClass: 'is-hidden',
          },
        ];
      }

      dataModel = {
        type: 'object',
        properties: dataModelProperties,
      };
      uiForm = {
        type: 'fieldset',
        items: uiFormItems,
      };
      break;
    }
    case 'CONTEXT': {
      dataModel = {
        type: 'object',
        properties: {
          classification: {
            type: 'string',
            title: 'Classification',
            default: 'context',
            readOnly: true,
          },
        },
      };
      uiForm = {
        type: 'fieldset',
        items: [
          {
            key: 'classification',
            readOnly: true,
          },
        ],
      };
      break;
    }
    case 'COMMENT': {
      dataModel = {
        type: 'object',
        properties: {
          purpose: {
            type: 'string',
            title: 'purpose',
            default: 'commenting',
            readonly: true,
          },
          value: {
            type: 'string',
            title: 'Comment',
          },
        },
        required: ['purpose', 'value'],
      };
      uiForm = {
        type: 'fieldset',
        items: [
          'purpose',
          {
            key: 'value',
            type: 'textarea',
            label: 'Comment',
          },
        ],
      };
      break;
    }
    case 'MRW': {
      // if a user wants to link another mrw annotation to a metaphor annotation,
      // get all the mrws that share their target with the metaphor annotation
      // and store them in the enum to hold all the mrwAnnoIds, so the user can
      // choose a mrw to link it to a metaphor

      // store all elements targeted by the metaphor annotation and mrw annotations
      let elementsTargeted = [];
      window.SELECTED_ANNOTATION.targets.forEach((target) => {
        elementsTargeted.push(document.getElementById(target.selector.xPath.split('"')[1]));
      });
      // get all mrwAnnos that target the same words as the metaphor annotation
      let mrwAnnosForBody = findSelectedMRWAnnos(window.ANNOJSON, elementsTargeted);
      // remove all mrw annotations, which are linked to the metaphor annotation already
      // from mrwAnnosForBody to prevent users from linking the same mrwAnno
      // multiple times
      window.SELECTED_ANNOTATION.textCards.forEach((textCard) => {
        if (textCard.purpose === 'linking') {
          mrwAnnosForBody = mrwAnnosForBody.filter((anno) => textCard.value !== anno.id);
        }
      });

      let enumAndTitleMapForBody = getEnumAndTitleMap(mrwAnnosForBody);
      let mrwEnumForBody = enumAndTitleMapForBody[0];
      // mrwTitleMapForBody is necessary to have the actual words displayed,
      // but the have the annoId as a value on the submission of the form
      let mrwTitleMapForBody = enumAndTitleMapForBody[1];
      let selectMRWButtonForBody = getSelectMRWButton(mrwEnumForBody);

      dataModel = {
        type: 'object',
        properties: {
          mrws: {
            type: 'array',
            title: 'Metaphor related words (direct, indirect, implicit and mflags)',
            items: {
              type: 'string',
              title: 'Option',
              enum: mrwEnumForBody,
            },
          },
        },
        required: ['mrws'],
      };
      uiForm = {
        type: 'fieldset',
        items: [
          {
            type: 'checkboxes',
            key: 'mrws',
            titleMap: mrwTitleMapForBody,
          },
          selectMRWButtonForBody,
        ],
      };
      break;
    }
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
