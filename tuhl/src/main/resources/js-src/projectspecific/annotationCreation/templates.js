import {
  spreadMRWArray,
  getEnumAndTitleMap,
  getSelectMRWButton,
  preselectAllMRWAnnos,
  findSelectedMRWAnnos,
} from './utils';
import { createAnnotation } from '../../common/annotationCreation';

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
        $('#createAnnotationForm').metadataeditorForm(options, async function onSubmitValid(formvalue) {
          // formvalue contains all the information from the jsonForm as a string
          const annotationData = makeAnnotationData(formvalue);
          const annotation = await createAnnotation(annotationData);
        });

        preselectAllMRWAnnos();
      },
      titleMap: {},
    },
  ],
};

/**
 * get content from the form and turn it into the data necessary for annotation creation (incl. target and bodies)
 *
 * @param {String} formvalue value of the JSONForm after a user submitted it/started the annotation creation process
 * @returns {Object} the data for the annotation creation
 */
function makeAnnotationData(formvalue) {
  // formvalue contains all the information from the jsonForm as a string
  console.log('value of the jsonForm/annotation creation modal', formvalue);
  let formDataJson = JSON.parse(formvalue);

  // CRC 1475 specific
  // as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
  // of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws)
  if ('mrws' in formDataJson) {
    formDataJson = spreadMRWArray(formDataJson);
  }

  // formDataJson.color?.color will return the value of the color (which is a truthy value), if a
  // color is available. If no color is available formDataJson.color?.color will return 'undefined (which
  // is a falsy value) and therefore the ternary operator will return a default color
  const color = formDataJson?.color ? formDataJson.color : '#89f099';

  const bodies = makeBodiesData(formDataJson);
  // window.location.pathname.split('/').pop() returns the last part of the url,
  // which is the pageId, which is required
  // to create an annotation
  let annotationData = {
    pageId: window.location.pathname.split('/').pop(),
    color: color,
    motivation: 'describing',
    bodies: bodies,
  };
  if (document.getElementById('createAnnotationForm').title !== '') {
    annotationData.svgCode = document.getElementById('createAnnotationForm').title;
  }
  console.log('finished annotation data', annotationData);

  return annotationData;
}

/**
 * create 1-n bodies based on the JSONForm and store them in an array, so they can be stored. 
 * 
 * @param {Object} formDataJson the value ofeach of the fields of the JSONForm, eg.
 * {
      "selectedText": "of the ungodly",
      "classification": "metaphor",
      "label": "Book_of_Psalms1715325572436",
      "color": "#000021",
      "mrws0": "https://example.org/wap/0da130fd"
    }
 * @returns {[Object]} holding all the bodies as JSONObjects in the format necessary to store them, eg.:
 * [
    { purpose: 'describing', value: 'of the ungodly' },
    { purpose: 'classifying', value: 'metaphor' },
    { purpose: 'identifying', value: 'Book_of_Psalms1715325572436' },
    { purpose: 'linking', value: 'https://example.org/wap/0da130fd' },
   ]
 */
function makeBodiesData(formDataJson) {
  let bodiesArray = [];
  Object.entries(formDataJson).forEach(([key, value]) => {
    const bodyObject = makeBodyData(key, value);
    // the bodyObject can be undefined for the "color", if the "color" isn't matching
    // the CRC980 stuff
    if (bodyObject) {
      bodiesArray.push(bodyObject);
    }
  });
  return bodiesArray;
}

/**
 * create the data for one body based on the JSONForm value.
 * Each body gets a 'purpose'. A body should have at least one of the following properties:
 * - value: value of the body comes from specific input into a field of of the form
 * - subject: similar to "value", but is based on the color
 * - source: see subject
 * An example looks like '"classification": "metaphor"'
 *
 * @param {String} formKey the key of the key value pair, eg. 'classification'
 * @param {String} formValue the value of the key value pair, eg. 'metaphor'
 * @returns {Object} a full body object, eg. {purpose: 'classifying', value: 'metaphor'}
 */
function makeBodyData(formKey, formValue) {
  let bodyObject;
  if (formKey === 'color') {
    // this is CRC980 specific stuff
    switch (formKey) {
      case '#e2b8f7':
        bodyObject = { purpose: 'classifying', subject: 'PageRegion' };
        break;
      case '#00edff':
        bodyObject = {
          purpose: 'classifying',
          subject: 'TextRegion',
          source: 'http://episteme.org/A04Vokabular#text_block',
        };
        break;
      // no default case given as most annotations will have a color and we don't want
      // an additional unnecessary body to be created
    }
  } else {
    const purpose = assignPurpose(formKey);
    bodyObject = { purpose: purpose, value: formValue };
  }

  return bodyObject;
}

/**
 * convert the type of a body into a wadm-purpose. The type is based on the dataModel.properties.$key of
 * the JSONForm
 *
 * @param {String} bodyType the type of a body. It gets assigned by the JSONForm
 * @returns {String} the purpose matching the type of a body
 */
function assignPurpose(bodyType) {
  // CRC980
  if (bodyType === 'reference' || bodyType === 'anchor' || bodyType === 'tag') {
    return 'tagging';
  } else if (bodyType === 'transcription') {
    return 'tadirah:transcription';
  } // CRC175
  else if (bodyType === 'selectedText') {
    return 'describing';
  } else if (bodyType.includes('mrws')) {
    return 'linking';
  } else if (bodyType === 'label') {
    return 'identifying';
  } else if (bodyType === 'comment') {
    return 'commenting';
  } else if (bodyType === 'classification') {
    return 'classifying';
  } else {
    return 'classifying';
  }
}
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
      let mrwAnnosForBody = findSelectedMRWAnnos(window.ANNOJSON, window.ANNOJSON.elementsTargeted);
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

export const formObjectCreateBody = {};
