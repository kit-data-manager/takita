//external modules
import $ from 'jquery';
import 'jsonform';
//internal modules
import { fillMetaDataEditorTable, toggleVisibility, encodeAnnoId } from '../utils';
import { updateDisplay } from '../../texteditor-ng/highlighting';
import { selectAnnotation } from '../annotationCard';
import { createBodyData, createAnnotationData, getAnnotationData } from '../../texteditor-ng/data/annotations';
import { formObjectCreateAnnotation, formObjectCreateBody } from '../../projectspecific';

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

  //console.log($('#' + pickFormId));
  // creates dropdown from enum objects defined at the top
  if (template === 'bodyTemplate') {
    $('#' + pickFormId).jsonForm(formObjectCreateBody);
  } else {
    $('#' + pickFormId).jsonForm(formObjectCreateAnnotation);
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
async function resetFormAndUpdateDisplay(annotation, hooks = {}) {
  // the following check needs to be done as this storeBody function is used since June 2023
  // for the addition of multiple bodies to an annotation. The function was implemented to
  // be used while creating annotations and not adding bodies, so it previously just toggled
  // the display of the createAnnotation-modal, but now it only toggles the modal, if it
  // is shown.
  const $modal = document.getElementById('createAnnotation');
  if ($modal.classList.contains('show-modal')) {
    $modal.classList.toggle('show-modal');
  }
  window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(annotation.id), hooks);
  const $annotationCard = document.getElementById('annotationCard');
  if ($annotationCard.classList.contains('is-hidden')) {
    toggleVisibility($annotationCard);
  }

  // updating the display for text annotation
  // checking if TEI-element is null. it is defined for text annotation,
  // but not for image annotation
  if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
    // redraw
    await updateDisplay();
  }

  fillMetaDataEditorTable(window.ANNOJSON);
  //document.getElementById('createRectangleButton').parentElement.classList.remove('active');
  //document.getElementById('createPolygonButton').parentElement.classList.remove('active');
  document.getElementById('createAnnotationForm').removeAttribute('title');
}
