// external modules
import 'jsonform';
//internal modules
import { encodeAnnoId, toggleOverview, fillMetaDataEditorTable } from '../../../../common/utils';
import { selectAnnotation } from '../../../../common/annotationDisplay/selection';
import { updateDisplay, storeSelectedMRWAnnos } from '../../../annotationEditor';
import { formObjectCreateAnnotation } from './creationTemplateTextCRC1475';
import { formObjectCreateBody } from './creationTemplateTextCRC1475body';

// preselect all checkboxes for the mrw-annos present in the current selection
// during metaphor annotation creation via the template
function preselectAllMRWAnnos() {
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
// a message on how to enable it.
// currently not used as users are allowed to create a metaphor
// annotation without a mrw-annotation
// eslint-disable-next-line no-unused-vars
function disableAnnotationCreation() {
  document.querySelector('#createAnnotationForm > div:nth-child(1) > input:nth-child(2)').remove();
  let explanationDiv = document.createElement('div');
  explanationDiv.innerText = 'Please include a mrw-annotation in your selection after closing this window.';
  document.querySelector('#createAnnotationForm').append(explanationDiv);
}

// function to check/uncheck all inputs
function toggleCheckedInputs(inputs) {
  // to select/unselect all inputs the first input will be checked,
  // wether it is selected or not. Based on that all inputs will be
  // checked or unchecked
  let isInputChecked = false;

  if (inputs[0].checked) {
    isInputChecked = true;
  }

  inputs.forEach((input) => {
    if (isInputChecked) {
      input.checked = false;
    } else {
      input.checked = true;
    }
  });
}

// returns a button to select/unselect all mrws; is used by
// - the METAPHOR annotation template
// - the MRW body template
function getSelectMRWButton(mrwEnum) {
  const selectMRWButton = {
    type: 'button',
    title: 'Select/unselect all mrws',
    onClick: function (_e) {
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
    },
  };
  // if less than two mrws are present in the selection, the
  // "is-hidden"-class (defined in chota.css) is added to the button and
  // the button won't be displayed
  if (mrwEnum.length < 2) {
    selectMRWButton['htmlClass'] = 'is-hidden';
  }

  return selectMRWButton;
}

// takes a list of mrwAnnos and returns
// - an enum holding all the ids of these annotations
// - a titleMap linking the ids to targeted strings and the type of the mrw annotation
//   which is set according to its color, which is based on the classifying body
export function getEnumAndTitleMap(mrwAnnos) {
  const idEnum = mrwAnnos.map((anno) => anno.id);
  const mrwTitleMap = {};

  mrwAnnos.forEach((anno) => {
    // getting the words targetted by the annotation
    // and concatenate them into one string
    const targetedString = anno.svg
      .map((svgs) => {
        const id = svgs.split('"')[1];
        return document.getElementById(id).innerHTML;
      })
      .join(' ');

    // adding the value of the classifying body (which is stored in the color)
    // to the string, that will be displayed in the modal.
    let mrwType = 'DEFAULT';
    switch (anno.color) {
      case '#000011':
        mrwType = 'mrw (direct)';
        break;
      case '#000012':
        mrwType = 'mrw (indirect)';
        break;
      case '#000013':
        mrwType = 'mrw (implicit)';
        break;
      case '#000014':
        mrwType = 'mflag';
        break;
    }
    mrwTitleMap[anno.id] = targetedString + ' | ' + mrwType;
  });

  return [idEnum, mrwTitleMap];
}

// as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
// of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws0-n)
export function spreadMRWArray(jsonObject) {
  let mrws = [...jsonObject.mrws];
  delete jsonObject.mrws;
  mrws.forEach((mrw, index) => (jsonObject['mrws' + index] = mrw));

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
      let mrwAnnosForBody = storeSelectedMRWAnnos(window.ANNOJSON.elementsTargeted);
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

// wrapper function to hold all functions to be called after the
// modal to create an annotation is being displayed
// TODO: CUSTOMISE: add code/functions to be called
export function projectSpecifics() {
  // if a user wants to create a metaphor-annotation, preselect the checkboxes
  // for the linking of mrw-annotations
  if (
    window.MRW_ANNOS.length > 0 &&
    document.querySelector(
      '#pickAnnotationTemplateForm > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > select:nth-child(1)',
    ).value === 'METAPHOR'
  ) {
    preselectAllMRWAnnos();
  }

  // if a user wants to create a metaphor-annotation, but there is no
  // mrw-annotation present in the selection, disable annotation creation
  //if (window.MRW_ANNOS.length === 0 &&
  //document.querySelector("#pickAnnotationTemplateForm > div:nth-child(1) > div:nth-child(1)
  // > div:nth-child(2) > select:nth-child(1)").value === "METAPHOR"){
  //disableAnnotationCreation();
  //}
}



export function pickTemplate(svgCode, encodedId, createFormId, pickFormId, template) {
  // clear out forms and content from former submissions
  let pickContent = document.getElementById(pickFormId);
  while (pickContent.firstChild) {
    pickContent.firstChild.remove();
  }
  let formContent = document.getElementById(createFormId);
  while (formContent.firstChild) {
    formContent.firstChild.remove();
  }

  // creates title map needed for the dropdown selection
  for (const tName in Object.keys(template)) {
    if (template === 'bodyTemplate') {
      formObjectCreateBody.form[0].titleMap[Object.keys(template)[tName]] = Object.values(template)[tName];
    } else {
      formObjectCreateAnnotation.form[0].titleMap[Object.keys(template)[tName]] = Object.values(template)[tName];
    }
  }

  // stores annotation id in title in case of body creation
  // TODO: find better solution for this
  if (encodedId !== '') {
    document.getElementById(createFormId).title = encodedId;
  }

  // stores svg code in title in case of annotation creation for shape
  // TODO: find better solution for this
  if (svgCode !== '') {
    document.getElementById(createFormId).title = svgCode;
  }

  console.log($('#' + pickFormId));
  // creates dropdown from enum objects defined at the top
  if (template === 'bodyTemplate') {
    $('#' + pickFormId).jsonForm(formObjectCreateBody);
  } else {
    $('#' + pickFormId).jsonForm(formObjectCreateAnnotation);
  }
}

// TODO: CUSTOMISE the colors based
// see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "takita/tuhl/src/main/resources/static/js/creation_templates_text.js"
export function getColorHexFromEnumEntry(colorEnumEntry) {
  let colorHex = '#89f099';
  switch (colorEnumEntry) {
    case 'MRW_DIRECT':
      colorHex = '#000011';
      break;
    case 'MRW_INDIRECT':
      colorHex = '#000012';
      break;
    case 'MRW_IMPLICIT':
      colorHex = '#000013';
      break;
    case 'MFLAG':
      colorHex = '#000014';
      break;
    case 'METAPHOR':
      colorHex = '#000021';
      break;
  }
  return colorHex;
}

// TODO: CUSTOMISE the colors based
// see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "takita/tuhl/src/main/resources/static/js/creation_templates_text.js"
export function getColorNameFromEnumEntry(colorEnumEntry) {
  let colorName = 'Default';
  switch (colorEnumEntry) {
    case 'MRW_DIRECT':
      colorName = 'mrw (direct)';
      break;
    case 'MRW_INDIRECT':
      colorName = 'mrw (indirect)';
      break;
    case 'MRW_IMPLICIT':
      colorName = 'mrw (implicit)';
      break;
    case 'MFLAG':
      colorName = 'mflag';
      break;
    case 'METAPHOR':
      colorName = 'metaphor';
      break;
  }
  return colorName;
}
