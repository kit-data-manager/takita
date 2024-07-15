import $ from 'jquery';
import '../utils/metadataeditor';
import { changeLabel } from '../../projectspecific/annotationCard';
import { updateBody, timestampsToISOString } from './utils';

// JSONForm creation
/**
 *
 * @param {Element} annotationDiv the div holding the annotationCard
 * @param {Object} annotationData the annotation as JSON
 * @param {Array} headerFields holds fields that should be present in the form
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Array} editableFields holds fields that should not be editeable
 * @param {Object} [hooks] containing an array for the hook to be called at "preHorizontalCreation"
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
 * @param {String} annotationId id of the annotation
 * @param {Object} [hooks] containing an array for the hook to be called at "preHorizontalCreation"
 */
export async function createAndAppendBodyForms(
  body,
  omitFields,
  editableFields,
  formDataModel,
  hooks = {},
  annotationId,
) {
  // create the two JSONForms and append them
  // create the expandable vertical JSONForm
  // using Destructuring assignment here, see:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  const [formBodyDataModel, uiForm] = getFormBodyDataModelAndUiForm(body, omitFields, formDataModel);
  createAndAppendBodyForm(formBodyDataModel, uiForm, body);
  // create the hoirzontal ("quick view") JSONForm
  const [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal] = getFormBodyDataModelAndUiFormHorizontal(
    body,
    omitFields,
    editableFields,
  );

  // deep copying the body as it might be useful at some point
  let modifiedBody = JSON.parse(JSON.stringify(body));
  if (hooks.preHorizontalBodyCardCreation) {
    // forEach and export async function calls can be messy and not executed in the expected order.
    // Therefore a "for of" loop is used
    // see: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for (let hook of hooks.preHorizontalBodyCardCreation) {
      modifiedBody = await hook(annotationId, body);
    }
  }

  createAndAppendBodyFormHorizontal(operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal, modifiedBody);
}

/**
 * Append the vertical form for a body created by the metadataEditor.js
 * (uses JSONForm) to the annotation div
 *
 * @param {Object} formBodyDataModel the dataModel used by JSONForms
 * @param {Object} uiForm the uiForm used by JSONForms
 * @param {Object} body the body as JSON
 */
export function createAndAppendBodyForm(formBodyDataModel, uiForm, body) {
  const options = { operation: 'UPDATE', dataModel: formBodyDataModel, uiForm: uiForm, resource: body };
  $('#form' + body.id).metadataeditorForm(options, async function onSubmitValid(value) {
    const annoId = document.getElementById('iconRowTop').title;
    await updateBody(annoId, value);
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
 * @returns {Element} the horizontal form
 */
export function createAndAppendBodyFormHorizontal(
  operationHorizontal,
  formBodyDataModelHorizontal,
  uiFormHorizontal,
  modifiedBody,
) {
  const optionsHorizontal = {
    operation: operationHorizontal,
    dataModel: formBodyDataModelHorizontal,
    uiForm: uiFormHorizontal,
    resource: modifiedBody,
  };
  $('#formHorizontal' + modifiedBody.id).metadataeditorForm(optionsHorizontal, async function onSubmitValid(value) {
    const annoId = document.getElementById('iconRowTop').title;
    await updateBody(annoId, value);
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
  }

  // the form contains multiple inputs elements. Apart from the one with "name === 'value'" all are hidden.
  $horizontalForm.querySelectorAll('input[type="text"]').forEach((input) => {
    if (input.name === 'value') {
      // The following lines have become unncessary after the modularisation process as
      // the input fields are not getting "disabled" anymore.
      // improve readibility of the value of the "disabled" input fields
      // input.style.color = 'black';
      // input.style.opacity = 1;

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
export function getFormBodyDataModelAndUiForm(body, omitFields, formDataModel) {
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
 * @param {Array} omitFields holds fields that should not be rendered
 * @param {Array} editableFields holds fields that should not be editeable
 * @returns {[String, Object, Object]} operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal
 * an Array containing the operation type of the form, the dataModel and uiForm used by JSONForm
 */
export function getFormBodyDataModelAndUiFormHorizontal(body, omitFields, editableFields) {
  let operationHorizontal = 'READ';

  let formBodyDataModelHorizontal = {
    type: 'object',
    properties: {},
  };

  let uiFormHorizontal = {
    type: 'fieldset',
    items: [],
  };

  Object.keys(body).forEach((key) => {
    //console.log(key);
    //console.log(bodies[body]);
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      formBodyDataModelHorizontal = completeFormDataModel(body, formBodyDataModelHorizontal, key, omitFields);
      // prepare the ui form
      // push the key and hide it, when its not the value key
      if (key !== 'value' && omitFields.indexOf(key) === -1) {
        // "type" : "hidden" doesn't work; for some reason this prevents
        // the form to be submitted. Instead chotas "is-hidden" class is being used
        uiFormHorizontal.items.push({ key: key, htmlClass: 'is-hidden' });
        if (key === 'purpose') {
          if (editableFields.includes(body.purpose)) {
            operationHorizontal = 'UPDATE';
          }
        }
      }
      if (key === 'value' && omitFields.indexOf(key) === -1) {
        uiFormHorizontal.items.push({ key: key, htmlClass: 'horizontalFormDiv' });
      }
    }
  });

  return [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal];
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
    // changes to work for the "quick-view"
    let title = addition;
    // if the formDataModel entry for the "value" of the body is created
    // relpace the title with the "purpose" of the body
    // Only bodies can have a value and a purpose. An annotation can have a
    // motivation, but never a value. This is relevant as the completeFormDataModel()
    // is called for the creation of the form for annotations AND bodies
    if (addition === 'value' && responseJson.purpose) {
      title = changeLabel(responseJson.purpose);
    }
    // console.log(title);
    if (omitFields.indexOf(addition) === -1) {
      formDataModel.properties[addition] = {
        type: 'string',
        title: title,
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
