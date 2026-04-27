import $ from 'jquery';
import '../utils/metadataeditor';
import { changeLabel as changeLabelText } from '../../texteditor-ng/projectspecific/annotationCard';
import { changeLabel as changeLabelImage } from '../../imageeditor-ng/projectspecific/annotationCard';
import { updateBody } from './utils';

// JSONForm creation
/**
 *
 * @param {Element} annotationDiv the div holding the annotationCard
 * @param {Object} annotationData the annotation as JSON
 * @param {Array} headerFields holds fields that should be present in the form
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Array} editableFields holds fields that should not be editeable
 * @param {Object} [hooks] containing an array for the hook to be called at "preHorizontalCreation" and
 * at "selectAnnotation" after a body update.
 * @returns
 */
export function appendForms($annotationDiv, annotationData, headerFields, omitFields, editableFields, hooks) {
  // adding the JSONForm for the full annotation
  let formDataModel;
  // using Destructuring assignment here, see:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  [$annotationDiv, formDataModel] = createAndAppendAnnotationForm(
    $annotationDiv,
    annotationData,
    headerFields,
    omitFields,
  );
  // create the JSONForms for the bodies
  annotationData.bodies.forEach(async (body) => {
    await createAndAppendBodyForms(body, omitFields, editableFields, formDataModel, annotationData.id, hooks);
  });
  return $annotationDiv;
}

/**
 * Append the annotation form created by the metadataEditor.js (uses JSONForm) to the
 * annotation div
 *
 * @param {Element} annotationDiv the div holding the annotationCard
 * @param {Object} annotationData the annotation as JSON
 * @param {Array} headerFields holds the fields to be added to the form
 * @param {Array} omitFields holds the fields to NOT be added to the form
 * @returns {Element} $annotationDiv after the form got appended
 */
export function createAndAppendAnnotationForm($annotationDiv, annotationData, headerFields, omitFields) {
  let formDataModel = {
    type: 'object',
    properties: {},
  };

  headerFields.forEach((headerField) => {
    if (annotationData[headerField]) {
      formDataModel = completeFormDataModel(annotationData, formDataModel, headerField, omitFields);
    }
  });

  const options = { operation: 'READ', dataModel: formDataModel, uiForm: '*', resource: annotationData };

  $('#annotationCard').metadataeditorForm(options, function onSubmitValid(_value) {
    //console.log(value);
  });
  return [$annotationDiv, formDataModel];
}

/**
 *
 * @param {Object} body the body as JSON
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Array} editableFields holds fields that should not be editeable
 * @param {Object} formDataModel used while creating the annotation form
 * @param {String} encodedAnnoId encoded id of the annotation
 * @param {Object} [hooks] containing an array for the hook to be called at "preHorizontalCreation" and
 * at "selectAnnotation" after a body update.
 */
export async function createAndAppendBodyForms(
  body,
  omitFields,
  editableFields,
  formDataModel,
  encodedAnnoId,
  hooks = {},
) {
  // create the two JSONForms and append them
  // create the expandable vertical JSONForm
  // using Destructuring assignment here, see:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  const [formBodyDataModel, uiForm] = getBodyFormDataModelAndUiForm(body, omitFields, formDataModel);
  createAndAppendBodyForm(formBodyDataModel, uiForm, body, encodedAnnoId, hooks);
  // create the hoirzontal ("quick view") JSONForm
  let [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal] = getBodyFormDataModelAndUiFormHorizontal(
    body,
    editableFields,
  );

  // deep copying the body as it might be useful at some point
  let modifiedBody = JSON.parse(JSON.stringify(body));
  if (hooks.preHorizontalBodyCardCreation) {
    // forEach and export async function calls can be messy and not executed in the expected order.
    // Therefore a "for of" loop is used
    // see: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for (let hook of hooks.preHorizontalBodyCardCreation) {
      [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal, modifiedBody] = await hook(
        operationHorizontal,
        formBodyDataModelHorizontal,
        uiFormHorizontal,
        encodedAnnoId,
        body,
      );
    }
  }

  createAndAppendBodyFormHorizontal(
    operationHorizontal,
    formBodyDataModelHorizontal,
    uiFormHorizontal,
    modifiedBody,
    encodedAnnoId,
    hooks,
  );
}

/**
 * Append the vertical form for a body created by the metadataEditor.js
 * (uses JSONForm) to the annotation div
 *
 * @param {Object} formBodyDataModel the dataModel used by JSONForms
 * @param {Object} uiForm the uiForm used by JSONForms
 * @param {Object} body the body as JSON
 * @param {String} encodedAnnoId encoded id of the annotation
 * @param {Object} [hooks] containing an array for the hook to be called at "selectAnnotation" after a body update.
 */
export function createAndAppendBodyForm(formBodyDataModel, uiForm, body, encodedAnnoId, hooks = {}) {
  const options = { operation: 'UPDATE', dataModel: formBodyDataModel, uiForm: uiForm, resource: body };
  $('#form' + body.id).metadataeditorForm(options, async function onSubmitValid(value) {
    await updateBody(encodedAnnoId, value, hooks);
  });
}

/**
 * Append the horizontal ("quick view") form for a body created by the metadataEditor.js
 * (uses JSONForm) to the annotation div
 *
 * @param {String} operationHorizontal the operation type of the form
 * @param {Object} formBodyDataModelHorizontal the dataModel used by JSONForms
 * @param {Object} uiFormHorizontal the uiForm used by JSONForms
 * @param {Object} modifiedBody the body as JSON
 * @param {String} encodedAnnoId encoded id of the annotation
 * @param {Object} [hooks] containing an array for the hook to be called at "selectAnnotation" after a body update.
 * @returns {Element} the horizontal form
 */
export function createAndAppendBodyFormHorizontal(
  operationHorizontal,
  formBodyDataModelHorizontal,
  uiFormHorizontal,
  modifiedBody,
  encodedAnnoId,
  hooks = {},
) {
  const optionsHorizontal = {
    operation: operationHorizontal,
    dataModel: formBodyDataModelHorizontal,
    uiForm: uiFormHorizontal,
    resource: modifiedBody,
  };
  $('#formHorizontal' + modifiedBody.id).metadataeditorForm(optionsHorizontal, async function onSubmitValid(value) {
    await updateBody(encodedAnnoId, value, hooks);
  });

  let $horizontalForm = document.getElementById('formHorizontal' + modifiedBody.id);
  $horizontalForm = modifyBodyFormHorizontal($horizontalForm, modifiedBody);
  return $horizontalForm;
}

/**
 * - remove a wrapping element from the form
 * - style each input of the form and attach an eventListener to the button, that checks if the value changes
 * - manipulate and disable the button of the form
 *
 * @param {Element} $horizontalForm
 * @param {Object} modifiedBody the body as JSON
 * @returns the modified form
 */
export function modifyBodyFormHorizontal($horizontalForm, modifiedBody) {
  // styling of the horizontal form
  // this is done after the form is created as the forms style can't be changed during creation
  // TODO: move parts of this to css

  // remove the wrapping fieldset. the form can't be created without the fieldset
  // due to the code in metadataeditor.js (eg. line 485) requires a JSON object
  // https://stackoverflow.com/questions/19261197/how-can-i-remove-wrapper-parent-element-without-removing-the-child
  let fieldsetHorizontal = $horizontalForm.firstChild.firstChild;
  fieldsetHorizontal.replaceWith(...fieldsetHorizontal.childNodes);

  const inputButtonHorizontal = $horizontalForm.querySelectorAll('input[type="submit"]')[0];
  // TODO: maybe use an icon instead of the "save" text to save some space
  // change the value/text of the submit "button" and if one is available (as the field can be edited)
  // disable the button by default
  if (inputButtonHorizontal !== undefined) {
    inputButtonHorizontal.value = 'Save';
    inputButtonHorizontal.disabled = true;
    inputButtonHorizontal.classList.add('horizontalFormInput');
    if (inputButtonHorizontal.classList.contains('btn-primary')) {
      inputButtonHorizontal.classList.add('btn-success');
      inputButtonHorizontal.classList.remove('btn-primary');
    }
  }

  // enabling/diasbling the "Save"-buttons for inputs, textareas, dropdowns (selects) of the form.
  // The form contains multiple inputs elements. Apart from the one with "name === 'value'" all are hidden.
  $horizontalForm.querySelectorAll('input[type="text"]').forEach((input) => {
    if (input.name === 'value') {
      // enable the input submit button if the value of the input field changes
      // from the original body value
      input.addEventListener('input', (_event) => {
        if (input.value !== modifiedBody.value) {
          inputButtonHorizontal.disabled = false;
        } else {
          inputButtonHorizontal.disabled = true;
        }
      });
    }
  });

  $horizontalForm.querySelectorAll('textarea').forEach((textarea) => {
    if (textarea.name === 'value') {
      // enable the input submit button if the value of the textarea changes
      // from the original body value
      textarea.addEventListener('input', (_event) => {
        if (textarea.value !== modifiedBody.value) {
          inputButtonHorizontal.disabled = false;
        } else {
          inputButtonHorizontal.disabled = true;
        }
      });
    }
  });

  $horizontalForm.querySelectorAll('select[class="form-control"]').forEach((select) => {
    if (select.name === 'value') {
      // enable the input submit button if the value of the input field changes
      // from the original body value
      select.addEventListener('input', (_event) => {
        if (select.value !== modifiedBody.value) {
          inputButtonHorizontal.disabled = false;
        } else {
          inputButtonHorizontal.disabled = true;
        }
      });
    }
  });

  return $horizontalForm;
}

// JSONForm dataModel and uiForm
/**
 * Get operation type, dataModel and uiForm used by JSONForm for the vertical form
 *
 * @param {Object} body the body as JSON
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Object} formDataModel used while creating the annotation form
 * @returns {[Object, Object]} formBodyDataModel, uiForm an array holding the dataModel
 * and uiForm used by JSONForm
 */
// eslint-disable-next-line no-unused-vars
export function getBodyFormDataModelAndUiForm(body, omitFields, formDataModel) {
  let formBodyDataModel = {
    type: 'object',
    properties: {},
  };
  let uiForm = {
    type: 'fieldset',
    items: [],
  };

  Object.keys(body).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      // TODO: The following line might be useles. Check if it can be left out and
      // then remove "formDataModel" from the export function parameters and calls
      formDataModel = completeFormDataModel(body, formBodyDataModel, key, omitFields);
      if (key !== 'value' && omitFields.indexOf(key) === -1) {
        uiForm.items.push(key);
      }
    }
  });

  if (body.value && body.purpose === 'tadirah:transcription') {
    uiForm.items.push({ key: 'value', type: 'textarea' });
  } else {
    if (body.value) {
      uiForm.items.push('value');
    }
  }

  // TODO: try the following lines instead of the lines above
  // if (body.value) {
  //   if (body.purpose === 'tadirah:transcription') {
  //     uiForm.items.push({ key: 'value', type: 'textarea' });
  //   } else {
  //     uiForm.items.push('value');
  //   }
  // }
  return [formBodyDataModel, uiForm];
}

/**
 * Get operation type, dataModel and uiForm used by JSONForm for the horizontal form
 *
 * @param {Object} body the body as JSON
 * @param {Array} editableFields holds fields that should not be editeable
 * @returns {[String, Object, Object]} operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal
 * an Array containing the operation type of the form, the dataModel and uiForm used by JSONForm
 */
export function getBodyFormDataModelAndUiFormHorizontal(body, editableFields) {
  // decide which imported function is used based on the type of the editor (IMAGE or TEXT)
  const changeLabel = window.EDITORTYPE == 'TEXT' ? changeLabelText : changeLabelImage;
  // only include the value and the id of a body in the horizotnal form. The value should be displayed and
  // the id is needed for updates.
  let dataModel = {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        title: body?.purpose ? changeLabel(body.purpose) : 'defaultTitle',
      },
      id: { type: 'string' },
    },
  };

  // decide if the value of a body can be edited based on the purpose.
  // By default the value can't be edited.
  let operationHorizontal = 'READ';
  let readOnly = true;
  if (body?.purpose) {
    if (editableFields.includes(body.purpose)) {
      operationHorizontal = 'UPDATE';
      readOnly = false;
    }
  }

  let uiForm = {
    type: 'fieldset',
    items: [
      { key: 'value', htmlClass: 'horizontalFormDiv', readOnly: readOnly },
      { key: 'id', htmlClass: 'd-none' },
    ],
  };

  // use a textarea instead of an input field to display the value, if it reaches a certain length
  if (document.getElementById('annotationCard').getBoundingClientRect().width > 700) {
    if (body?.value?.length > 35) {
      uiForm.items[0].type = 'textarea';
    }
  } else {
    if (body?.value?.length > 20) {
      uiForm.items[0].type = 'textarea';
    }
  }

  return [operationHorizontal, dataModel, uiForm];
}

// HELPER export functionS

// some helpers

export function completeFormDataModel(responseJson, formDataModel, addition, omitFields) {
  if (Array.isArray(responseJson[addition])) {
    if (responseJson[addition][0] instanceof Object && omitFields.indexOf(addition) === -1) {
      var properties = {};
      var keys = [];
      for (let jsonObject in responseJson[addition]) {
        keys.push(Object.keys(responseJson[addition][jsonObject]));
      }

      var uniqueKeys = [...new Set(keys.flat())];

      for (let key in uniqueKeys) {
        if (omitFields.indexOf(uniqueKeys[key]) === -1) {
          properties[uniqueKeys[key]] = {
            type: 'string',
            title: uniqueKeys[key],
          };
        }
      }

      formDataModel.properties[addition] = {
        type: 'array',
        items: {
          type: 'object',
          title: addition,
          properties: properties,
        },
      };
    } else if (omitFields.indexOf(addition) === -1) {
      formDataModel.properties[addition] = {
        type: 'array',
        items: {
          type: 'string',
          title: addition,
        },
      };
    }
  } else if (responseJson[addition] instanceof Object && omitFields.indexOf(addition) === -1) {
    var objectKeys = Object.keys(responseJson[addition]);

    var objectProperties = {
      type: 'object',
      properties: {},
    };

    for (let key in objectKeys) {
      if (omitFields.indexOf(objectKeys[key]) === -1) {
        objectProperties.properties[objectKeys[key]] = {
          type: 'string',
          title: objectKeys[key],
        };
      }
    }

    formDataModel.properties[addition] = objectProperties;
  } else {
    // console.log(title);
    if (omitFields.indexOf(addition) === -1) {
      formDataModel.properties[addition] = {
        type: 'string',
        title: addition,
      };
    }
  }
  return formDataModel;
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
