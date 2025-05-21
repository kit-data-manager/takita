//external modules
import $ from 'jquery';
import 'jsonform';
import * as bootstrap from 'bootstrap';
//internal modules
import { toggleVisibility, encodeAnnoId } from '../utils';
import { updateDisplay } from '../../texteditor-ng/display';
import { selectAnnotation } from '../annotationCard';
import { createBodyData, createAnnotationData, getAnnotationData } from '../../texteditor-ng/data/annotations';
import { getFormObjectCreateAnnotation, getFormObjectCreateBody } from '../../projectspecific';

/**
 * creates the JSONForm and shows the modal to create an annotation based on
 * the given template
 *
 * @param {String} svgCode containing the target string (svgCode or xPath)
 * @param {String} encodedId of the annotation
 * @param {String} createFormId
 * @param {String} pickFormId
 * @param {String} template for body or annotation creation
 */
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

  // stores annotation id in data attribute in case of body creation
  if (encodedId !== '') {
    document.getElementById(createFormId).setAttribute('data-annotation-id', encodedId);
  }

  // stores targetcode in data attribute in case of annotation creation for shape
  if (svgCode !== '') {
    document.getElementById(createFormId).setAttribute('data-annotation-targetcode', svgCode);
  }

  // creates dropdown from enum objects defined at the top
  if (template === 'bodyTemplate') {
    $('#' + pickFormId).jsonForm(getFormObjectCreateBody());
  } else {
    $('#' + pickFormId).jsonForm(getFormObjectCreateAnnotation());
  }
}

/**
 *
 * @param {Object} annotationData the data necessary for annotaiton creation
 * @param {Object} [hooks] containing an array for the hooks to be called and
 * to be passed to "selectAnnotation()"
 * @returns {Object} finishedNewAnnotation the newly created annotation
 */
export async function createAnnotation(annotationData, hooks = {}) {
  try {
    // create the object nededed by the function to create an annotation (createAnnotationData);
    // it does not need the body information
    let annotationCreationData = {
      pageId: annotationData.pageId,
      color: annotationData.color,
      motivation: annotationData.motivation,
      svgCode: annotationData.svgCode,
    };

    const newAnnotation = await createAnnotationData(annotationCreationData);

    // trigger the body creation according to the template for each body
    for (let body of annotationData.bodies) {
      // eslint-disable-next-line no-unused-vars
      const newBody = await createBodyData(newAnnotation.id, body);
    }

    const finishedNewAnnotation = await getAnnotationData(encodeAnnoId(newAnnotation.id));
    if (hooks.postAnnotationCreation) {
      hooks.postAnnotationCreation.forEach((hook) => {
        hook(finishedNewAnnotation);
      });
    }
    resetFormAndUpdateDisplay(finishedNewAnnotation, hooks);
    return finishedNewAnnotation;
  } catch (exception) {
    console.error(exception);
  }
}

/**
 * close the annotation creation modal, select the new annotation and show the corresponding
 * annotation card
 *
 * @param {Object} annotation which was created
 * @param {Object} [hooks] containing an array for the hooks to be passed to "selectAnnotation()"
 */
export async function resetFormAndUpdateDisplay(annotation, hooks = {}) {
  // the following check needs to be done as this storeBody function is used since June 2023
  // for the addition of multiple bodies to an annotation. The function was implemented to
  // be used while creating annotations and not adding bodies, so it previously just toggled
  // the display of the createAnnotation-modal, but now it only toggles the modal, if it
  // is shown.
  const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('createAnnotation'));
  $modal.toggle();

  // updating the display for text annotation
  // checking if TEI-element is null. it is defined for text annotation,
  // but not for image annotation
  if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
    // redraw
    await updateDisplay(hooks);
  }

  window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(annotation.id), hooks);
  const $annotationCard = document.getElementById('annotationCard');
  if ($annotationCard.classList.contains('invisible')) {
    toggleVisibility($annotationCard);
  }

  // TODO: previuosly fillMetaDataEditorTable() was used. When modularizing the imageEditor
  // uncomment the next line and import the corresponding function. The textEditor doesn't
  // need it, as the function is included in updateDisplay()
  // initializeAnnotationTable(
  //   window.ANNOJSON,
  //   document.getElementById('annotationTableBottom'),
  //   document.getElementById('annotationCard'),
  //   hooks,
  // );
  //document.getElementById('createRectangleButton').parentElement.classList.remove('active');
  //document.getElementById('createPolygonButton').parentElement.classList.remove('active');
  document.getElementById('createAnnotationForm').removeAttribute('data-annotation-id');
}
