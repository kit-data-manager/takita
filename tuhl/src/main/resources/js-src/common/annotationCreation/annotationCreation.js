//external modules
import $ from 'jquery';
import 'jsonform';
import * as bootstrap from 'bootstrap';
//internal modules
import { toggleVisibility, encodeAnnoId } from '../utils';
import { updateDisplay } from '../../texteditor-ng/display';
import { selectAnnotation } from '../annotationCard';
import { createBodyData, createAnnotationData, getAnnotationData } from '../data/';
import { initializeAnnotationTable, defaultDisplayAnnotationFunction } from '../annotationTable';
import { extractInformationFromSvg } from '../../imageeditor-ng/highlighting';
import { Mode } from '../mode';
/**
 *
 * @param {Object} annotationData the data necessary for annotation creation
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
      motivation: annotationData.motivation,
      selectors: annotationData.selectors,
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

  if (window.EDITORTYPE == 'IMAGE') {
    window.ANNOJSON.push(transformImageAnnotation(annotation));
    // The textEditor doesn't need the following, as the function is included in updateDisplay()
    initializeAnnotationTable(
      window.ANNOJSON,
      document.getElementById('annotationTableBottom'),
      defaultDisplayAnnotationFunction,
    );
    document.getElementById('createRectangleButton').parentElement.classList.remove('active');
    document.getElementById('createPolygonButton').parentElement.classList.remove('active');
    resetImageVariables();
    window.MODE = Mode.View;
  }
}

/**
 * resets the global state variable used by the imageAnnotator at the end of
 * annotation creation process
 */
function resetImageVariables() {
  window.newRectangle = undefined;
  window.polygonPoint = undefined;
  window.firstPolygonPoint = undefined;
  window.invisiblePolygonPoint = undefined;
  window.polygonPath = undefined;
  window.addingRectangle = false;
  window.addingPolygon = false;
}

/**
 * transforms an annotation received from the backend (via getAnnotationData()) into the
 * format the imageAnnotator uses in the window.ANNOJSON.
 * - Converts the dates to ISOStrings,
 * - converts the creators arry into a simple String and stores it,
 * - encodes the ID of the annotation,
 * - extracts information from the svgCode stored in the target
 *
 * @param {Object} annotation the annotation to transform
 * @returns transformed annotation
 */
function transformImageAnnotation(annotation) {
  annotation.created = new Date(annotation.created * 1000).toISOString();
  annotation.creator = annotation.creators.toString();
  annotation.idEncoded = encodeAnnoId(annotation.id);
  annotation.modified = new Date(annotation.modified * 1000).toISOString();
  annotation.visible = true;
  // check wether the annotation has a selector or if it targets the whole page and
  // therefore does not have a selector from which the svgCode can be extracted
  if (annotation.targets.some((target) => target?.selector != null)) {
    const svgCode = annotation.targets.filter((target) => target.selector.svgcode)[0].selector.svgcode;
    extractInformationFromSvg(svgCode, annotation);
  }
  return annotation;
}
