// external modules
import * as bootstrap from 'bootstrap';
// internal modules
import { encodeAnnoId } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationCard';
import { collapseSidebar } from '../sidebar';
import { createTextSelectors } from '../targetBuilding';
import { pickTemplate } from '../../common/annotationCreation';
import { possibleHighlightClasses } from '../../projectspecific';
import { drawAnnos, removeStyles } from '../highlighting';

/**
 * Initialize the textEditor with given annotations; currently the annotations
 * are not used
 * Add eventlisteners for annotation selection, for starting/stopping annotation creation.
 *
 * @param {Object} annotations annotations of a page, not used currently as they are only necessary
 * for the eventListeners, which always need the current annotations stored in the window object.
 * @param {Object} [hooks] containing an array for various hooks
 */
export function initializeTextEditor(_annotations, hooks = {}) {
  const $text = document.getElementById('TEI');
  // bind eventHandlers to clicks and buttons
  // open textcard if rightclicking on a word that is highlighted due to it
  // having a css class, i.e. has an annotation
  $text.addEventListener('contextmenu', async function (event) {
    event.preventDefault();
    const $annotationCard = document.getElementById('annotationCard');
    const currentSelectedAnnotation = window.SELECTED_ANNOTATION;
    const newSelectedAnnotationID = cycleAnnotations(
      event,
      event.target,
      window.ANNOJSON,
      currentSelectedAnnotation,
      hooks,
    );

    // based on the presence of an annotationId
    // - hiding/showing annotation card
    // - selecting/unslecting an annotation and its targets
    if (newSelectedAnnotationID) {
      window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(newSelectedAnnotationID), hooks);
      console.log('New selected annotation: ', window.SELECTED_ANNOTATION);
      $annotationCard.classList.remove('invisible');
    } else {
      window.SELECTED_ANNOTATION = undefined;
      // remove all styling/highlighting
      removeStyles(document.getElementById('TEI'), possibleHighlightClasses);
      // highlight all annotated words
      drawAnnos(window.ANNOJSON);
      $annotationCard.classList.add('invisible');
    }
  });

  // adding eventhandler for text selection, if a user presses the button first
  // and then selects text
  $text.addEventListener('mousedown', (_event) => {
    // only get a selection, if a user actually wants to select text
    if (window.MODE === window.MODE_CLASS.Create && window.SELECTING_TEXT) {
      annotateSelectedText(window.getSelection(), window.ANNOJSON, hooks);
    }
  });

  // adding eventhandler for text selection, if a user selects text first and then
  // presses the button
  document.getElementById('selectTextListItem').addEventListener('mousedown', (event) => {
    onclickSelectText(event, window.getSelection(), window.ANNOJSON, hooks);
  });

  // adding the closing functionality to annotation creation modal
  document.getElementById('dismissAnnotation').addEventListener('click', function (_e) {
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('createAnnotation'));
    $modal.hide();
    // disabling the option to create an annotation. needed, because selecting text
    // can be done before the mode was set to create by clicking the button after the text selection process
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
  });

  // adding the closing functionality to body creation modal
  // document.getElementById('closeButton').addEventListener('click', function (_e) {
  //   document.getElementById('createBody').classList.toggle('show-modal');
  // const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('createBody'));
  // $modal.toggle();
  //   // disabling the option to create an annotation. needed, because selecting text
  //   // can be done before the mode was set to create by clicking the button after the text selection process
  //   window.MODE = window.MODE_CLASS.View;
  //   window.SELECTING_TEXT = false;
  // });
}

/**
 *
 * @param {Selection} selection the selection cerated by the user
 * @param {JSONArray} annoJson contains all the annotation of the pages as JSONObjects
 * @param {Object} [hooks] containing an array for various hooks
 * @returns nothing. The return statement only cancels the function
 */
export function annotateSelectedText(selection, annoJson, hooks = {}) {
  const targetXPath = createTextSelectors(selection);

  // newXPath will be null/a "falsy" variable, if the target could
  // not be created and therefore this saveModification function will return
  if (targetXPath) {
    if (hooks.postTargetCreation) {
      hooks.postTargetCreation.forEach((hook) => {
        hook(selection, annoJson);
      });
    }

    // showing the modal/dropdown to select the annotation template, which can be populated
    // by the user
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('createAnnotation'));
    $modal.toggle();
    pickTemplate(
      JSON.stringify(targetXPath),
      '',
      'createAnnotationForm',
      'pickAnnotationTemplateForm',
      'annotationTemplate',
    );

    // resetting parameters, so no new annotation can be created without clicking on
    // the button at the sidebar, that enables annotation
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
  } else {
    return;
  }
}

/**
 * function to annotate selected text. It is bound to an eventHandler
 *
 * @param {Event} _event
 * @param {Selection} selection the selection cerated by the user
 * @param {JSONArray} annoJson contains all the annotation of the pages as JSONObjects
 * @param {Object} [hooks] containing an array for the hooks to be passed to "annotateSelectedText()"
 */
function onclickSelectText(_event, selection, annoJson, hooks = {}) {
  const $sidebar = document.querySelector('.anno-side-bar');
  collapseSidebar($sidebar);
  window.SELECTING_TEXT = true;
  window.MODE = window.MODE_CLASS.Create;
  annotateSelectedText(selection, annoJson, hooks);
}

/**
 * cycle through all annotations, that target an element clicked on by a user. It will
 * select the first annotation targetting the element and store that, when called first.
 * On subsequent calls on the same element, it will select the consequent annotations (second, third, ...)
 *
 * @param {Event} _event triggered by a user by clicking (right or left click) on a highlighted word
 * @param {Element} $element clicked on by a user (right or left click on a highlighted word)
 * @param {[Object]} annoJson containing all annotations
 * @param {Object} currentSelectedAnnotation the currently selected annotation, might be none
 * @returns {String} the id of the next annotation on target or undefined, if there isn't
 * another annotation on the target
 */
function cycleAnnotations(_event, $element, annoJson, currentSelectedAnnotation) {
  let annotationsOnTarget = [];
  let newAnnoId;

  // check if the targeted element has a class specified in possibleHighlightClasses, which is imported
  // from the projectspecific module
  if (possibleHighlightClasses.some((cls) => $element.classList.contains(cls))) {
    // add all the annotations targeting the selected word to an array
    annoJson.forEach((item) => {
      item.svg.forEach((target) => {
        if ($element.id == target.split('"')[1]) {
          annotationsOnTarget.push(item);
        }
      });
    });
    //console.log('annotationsOntarget ', annotationsOnTarget);
    // check if any annotation was selected previuosly or if the target word changed and therefore
    // the id of the previuosly selected annotation is not present in the list of annotations, that
    // target the word on which the onClick event was triggered
    //console.log('Currently selected annotation before reselection: ', currentSelectedAnnotation);
    if (
      currentSelectedAnnotation === undefined ||
      annotationsOnTarget.find((annotation) => annotation.id === window.SELECTED_ANNOTATION.id) === undefined
    ) {
      //console.log('first annotationsOntarget ', annotationsOnTarget[0]);
      newAnnoId = annotationsOnTarget[0].id;
    } else {
      // check if the next index would be out off bounds, if yes hide the annotation card and return undefined.
      // On the next call of this function "currentSelectedAnnotation" will be undefined and
      // the cycling will start at the beginning of the list again.
      if (
        annotationsOnTarget.findIndex((annotation) => annotation.id === window.SELECTED_ANNOTATION.id) + 1 >
        annotationsOnTarget.length - 1
      ) {
        console.log('Cycled through all annotations on the target.');
        return undefined;
        //console.log('first annotationsOntarget 2 ', annotationsOnTarget[0]);
      } else {
        newAnnoId =
          annotationsOnTarget[
            annotationsOnTarget.findIndex((annotation) => annotation.id === currentSelectedAnnotation.id) + 1
          ].id;
        // console.log(
        //   '2-n annotationsOntarget ',
        //   annotationsOnTarget[
        //     annotationsOnTarget.findIndex((annotation) => annotation.id === currentSelectedAnnotation.id) + 1
        //   ],
        // );
      }
    }
    return newAnnoId;
  } else {
    return undefined;
  }
}
