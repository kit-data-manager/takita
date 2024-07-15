// internal modules
import { highlightSelectedAnnotationsTarget } from '../../texteditor-ng/highlighting';
import { createAnnotationDiv } from './elements';
import { getData } from './utils';
// projectspecific
import { headerFieldsArray, omitFieldsArray, editableFieldsArray } from '../../projectspecific';
import { appendForms } from './formManipulation';

/**
 * Main entry point to handle a user interaction to select an annotation
 * by clicking on it. It will get the annotations data, create the annotationCard
 * and highlight the selected words (if a text is present).
 *
 * @param {Event} _event the event trgiggered by a user. It is not used and can be "null" as well
 * @param {String} annoId single encoded ID of the annotation, that was selected
 * @param {Object} [hooks] containing an array for various hooks
 * @returns {Object} selectedAnnotation the selected annotation or an empty object, if the
 * card could not be created
 */
export async function selectAnnotation(_event, annoId, hooks = {}) {
  const selectedAnnotation = await getData(annoId);

  // exit if there is a problem with the data
  if (selectedAnnotation == null) {
    console.error('Could not get data and create the annotation card for ', annoId);
    return {};
  }

  // deep cloning the the data of the selected annotation, so it can be manipulated
  // by hooks (manipulatingData, preHorizontalBodyCardCreation etc.). The data manipulation
  // necessary for the rendering should not affect the data returned by "selectAnnotation()"
  let annotationData = JSON.parse(JSON.stringify(selectedAnnotation));
  if (hooks.manipulatingData) {
    hooks.manipulatingData.forEach((hook) => {
      annotationData = hook(annotationData);
    });
  }

  // creating new annotationCard
  const $annotationDiv = await fillAnnotationDiv(annotationData, hooks);
  if (hooks.postAnnotationCardCreation) {
    hooks.postAnnotationCardCreation.forEach((hook) => {
      hook($annotationDiv);
    });
  }

  // highlight the selected words
  const $text = document.getElementById('TEI');
  if (window.EDITORTYPE == 'TEXT' && $text != null) {
    highlightSelectedAnnotationsTarget(selectedAnnotation, $text);
  }

  return selectedAnnotation;
}

/**
 * wrapper to take care about displaying the selected annotation on the right side
 * of the screen. Removes the old displayed information, creates new elements
 * and appends the jsonForms to it.
 *
 * @param {Object} annotationData the annotation as JSON
 * @param {*} hooks
 * @returns {Element} filled div
 */
async function fillAnnotationDiv(annotationData, hooks) {
  // storing the imported arrays
  const [headerFields, omitFields, editableFields] = [headerFieldsArray, omitFieldsArray, editableFieldsArray];

  let $annotationDiv = document.getElementById('annotationCard');

  // removing old annotationCard
  while ($annotationDiv.lastElementChild) {
    $annotationDiv.removeChild($annotationDiv.lastElementChild);
  }

  // create the container for the jsonForms and then append the jsonForms
  $annotationDiv = await createAnnotationDiv(annotationData, $annotationDiv, hooks);
  $annotationDiv = appendForms($annotationDiv, annotationData, headerFields, omitFields, editableFields, hooks);
  // as the jsonForm of the annotation gets "appended" after the icon row, the
  // row is displayed below the form. However the row should be displayed at the
  // top of the container, so it has to be moved there
  const $iconRowTop = $annotationDiv.querySelector('#iconRowTop');
  $iconRowTop.remove();
  $annotationDiv.prepend($iconRowTop);

  return $annotationDiv;
}
