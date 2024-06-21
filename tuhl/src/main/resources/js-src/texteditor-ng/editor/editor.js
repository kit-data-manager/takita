import { encodeAnnoId, toggleVisibility } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationCard';
import { collapseSidebar } from '../sidebar';
import { createTargetString } from '../targetBuilding';
import { pickTemplate } from '../../common/annotationCreation';
import { hooks, possibleHighlightClasses } from '../../projectspecific';

/**
 * Initialize the textEditor with given annotations; currently the annotations
 * are not used
 * Add eventlisteners for annotation selection, for starting/stopping annotation creation.
 *
 * @param {Object} annotations annotations of a page, not used currently as they are only necessary
 * for the eventListeners, which always need the current annotations stored in the window object.
 */
export function initializeTextEditor(_annotations) {
  // bind eventHandlers to clicks and buttons
  // open textcard if rightclicking on a word that is highlighted due to it
  // having a css class, i.e. has an annotation
  document.getElementById('TEI').addEventListener('contextmenu', async function (event) {
    event.preventDefault();
    const $annotationCard = document.getElementById('annotationCard');
    const currentSelectedAnnotation = window.SELECTED_ANNOTATION;
    const newSelectedAnnotation = await cycleAnnotations(
      event,
      window.ANNOJSON,
      $annotationCard,
      currentSelectedAnnotation,
      hooks,
    );
    window.SELECTED_ANNOTATION = newSelectedAnnotation;
  });

  document.getElementById('TEI').addEventListener('mousedown', (_event) => {
    // only get a selection, if a user actually wants to select text
    if (window.MODE === window.MODE_CLASS.Create && window.SELECTING_TEXT) {
      annotateSelectedText(window.getSelection(), window.ANNOJSON);
    }
  });

  // adding eventhandler for text selection
  document.getElementById('selectTextListItem').addEventListener('mousedown', (event) => {
    onclickSelectText(event, window.getSelection(), window.ANNOJSON);
  });

  // adding the closing functionality to annotation creation modal
  document.getElementById('closeButtonAnno').addEventListener('click', function (_e) {
    document.getElementById('createAnnotation').classList.toggle('show-modal');

    // disabling the option to create an annotation. needed, because selecting text
    // can be done before the mode was set to create by clicking the button after the text selection process
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
  });

  // adding the closing functionality to body creation modal
  document.getElementById('closeButton').addEventListener('click', function (_e) {
    document.getElementById('createBody').classList.toggle('show-modal');
    // disabling the option to create an annotation. needed, because selecting text
    // can be done before the mode was set to create by clicking the button after the text selection process
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
  });
}

/**
 *
 * @param {Selection} selection the selection cerated by the user
 * @param {JSONArray} annoJson contains all the annotation of the pages as JSONObjects
 * @param {Object} [hooks] containing an array for various hooks
 * @returns nothing. The return statement only cancels the function
 */
export function annotateSelectedText(selection, annoJson, hooks = {}) {
  const targetXPath = createTargetString(selection);

  // newXPath will be an empty string/a "falsy" variable, if the target could
  // not be created and therefore this saveModification function will return
  if (targetXPath) {
    if (hooks.postTargetCreation) {
      hooks.postTargetCreation.forEach((hook) => {
        hook(selection, annoJson);
      });
    }

    // showing the modal/dropdown to select the annotation template, which can be populated
    // by the user
    const modal = document.getElementById('createAnnotation');
    modal.classList.toggle('show-modal');
    pickTemplate(targetXPath, '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');

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
 */
function onclickSelectText(_event, selection, annoJson) {
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
 * @param {Event} event triggered by a user by clicking (right or left click) on a highlighted word
 * @param {[Object]} annoJson containing all annotations
 * @param {Element} $annotationCard the div-element displaying an annotation on the right side of the screen
 */
async function cycleAnnotations(event, annoJson, $annotationCard, currentSelectedAnnotation, hooks = {}) {
  let annotationsOnTarget = [];
  let annoIdEncoded;

  // check if the targeted element has a class specified in possibleHighlightClasses, which is imported
  // from the projectspecific module
  if (possibleHighlightClasses.some((cls) => event.target.classList.contains(cls))) {
    // add all the annotations targeting the selected word to an array
    annoJson.forEach((item) => {
      item.svg.forEach((target) => {
        if (event.target.id == target.split('"')[1]) {
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
      annoIdEncoded = encodeAnnoId(annotationsOnTarget[0].id);
    } else {
      // check if the next index would be out off bounds, if yes select the first annotaiton in the list
      // to start at the beginning of the list again and cycle through
      if (
        annotationsOnTarget.findIndex((annotation) => annotation.id === window.SELECTED_ANNOTATION.id) + 1 >
        annotationsOnTarget.length - 1
      ) {
        annoIdEncoded = encodeAnnoId(annotationsOnTarget[0].id);
        //console.log('first annotationsOntarget 2 ', annotationsOnTarget[0]);
      } else {
        annoIdEncoded = encodeAnnoId(
          annotationsOnTarget[
            annotationsOnTarget.findIndex((annotation) => annotation.id === currentSelectedAnnotation.id) + 1
          ].id,
        );
        // console.log(
        //   '2-n annotationsOntarget ',
        //   annotationsOnTarget[
        //     annotationsOnTarget.findIndex((annotation) => annotation.id === currentSelectedAnnotation.id) + 1
        //   ],
        // );
      }
    }

    const [selectedAnnotation, $filledAnnotationCard] = await selectAnnotation(null, annoIdEncoded, hooks);
    //alert("asd");
    console.log('New selected annotation: ', selectedAnnotation);
    if ($annotationCard.classList.contains('is-hidden')) {
      toggleVisibility($annotationCard);
    }
    return selectedAnnotation;
  } else {
    return undefined;
  }
}
