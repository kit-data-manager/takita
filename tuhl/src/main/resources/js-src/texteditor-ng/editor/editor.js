import { encodeAnnoId, toggleOverview } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationDisplay';
import { hideExpandedSidebar } from '../sidebar';
import { checkIsTargetCompatible, makeTargetsCompatible } from './highlight';
import { createTargetString } from './targetCreation';
import { pickTemplate } from './annotationCreation/creationTemplates';
import { hooks } from '../../projectspecific';

window.ANNOJSON;

// this is needed for editor.js (l.575ff.) to work atm
window.PAPER;

// globalSelectedAnnotation stores the annotation, that gets
// selected by right clicking on a highlighted word
// it is needed to
// - edit/update the target of that annotation
// - cycle through multiple annotations on one target and select them
// - (CRC1475: to add a mrw-annotation to a metaphor annotation)
window.SELECTED_ANNOTATION;

// TODO: check if the textEditor actualy needs a "Mode"
// Philipp can only think that it is necessary for the "onmouseup"-event,
// which is used for the text selection
window.MODE_CLASS = class Mode {
  static View = new Mode('view');
  static Create = new Mode('create');
  static Modify = new Mode('modify');
  static Move = new Mode('move');

  constructor(name) {
    this.name = name;
  }
};

// TODO: check if the textEditor needs a MODE and SELECTING_TEXT
window.MODE = window.MODE_CLASS.View;
window.SELECTING_TEXT = false;

/**
 * Initialize the textEditor with given annotations.
 * Parse the annotations into a JSON Object and store it at the window.objetc
 * Add eventlisteners for annotation selection, for starting/stopping annotation creation.
 *
 * @param {String} annotations passed from the java-model via the thymeleaf template.
 * Contains all annotations of a page/necesseray for the textEditor to work
 */
export function initializeTextEditor(annotations) {
  // fill the annoJson with the annotations passed by the java backend
  window.ANNOJSON = JSON.parse(annotations);
  // check if the annotations are compatible with the code, i.e. have
  // one xPath for each target and not one long xPath including all targets.
  // Make them compatible, if they are not
  window.ANNOJSON = window.ANNOJSON.map((annotation) => {
    if (!checkIsTargetCompatible(annotation)) {
      annotation.svg = makeTargetsCompatible(annotation);
    }
    return annotation;
  });

  // bind eventHandlers to clicks and buttons
  // open textcard if rightclicking on a word that is highlighted due to it
  // having a css class, i.e. has an annotation
  document.getElementById('TEI').oncontextmenu = function (event) {
    event.preventDefault();
    const annotationCard = document.getElementById('annotationCard');
    cycleAnnotations(event, window.ANNOJSON, annotationCard);
  };

  document.getElementById('TEI').onmouseup = function (_event) {
    // only get a selection, if a user actually wants to select text
    if (window.MODE === window.MODE_CLASS.Create && window.SELECTING_TEXT) {
      annotateSelectedText(window.getSelection(), window.ANNOJSON);
    }
  };

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
  hideExpandedSidebar();
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
function cycleAnnotations(event, annoJson, $annotationCard) {
  let annotationOnTarget = [];
  let annoIdEncoded;
  // TODO: CUSTOMIZE textCard toggle (display of the annotation on the right side of the screen)
  // TODO: Just add a standard annotation class, which eistence can be checked here
  if (
    event.target.classList.contains('mrw') ||
    event.target.classList.contains('mflag') ||
    event.target.classList.contains('metaphor') ||
    event.target.classList.contains('metaphorSecond') ||
    event.target.classList.contains('defaulthighlight')
  ) {
    // add all the annotations targeting the selected word to an array
    annoJson.forEach((item) => {
      item.svg.forEach((target) => {
        if (event.target.id == target.split('"')[1]) {
          annotationOnTarget.push(item);
        }
      });
    });
    console.log('annotationsOntarget ', annotationOnTarget);
    // check if any annotation was selected previuosly or if the target word changed and therefore
    // the id of the previuosly selected annotation is not present in the list of annotations, that
    // target the word on which the onClick event was triggered
    console.log('selectedAnnotation 1: ', window.SELECTED_ANNOTATION);
    if (
      window.SELECTED_ANNOTATION === undefined ||
      annotationOnTarget.find((annotation) => annotation.id === window.SELECTED_ANNOTATION.id) === undefined
    ) {
      console.log('first annotationsOntarget ', annotationOnTarget[0]);
      annoIdEncoded = encodeAnnoId(annotationOnTarget[0].id);
    } else {
      // check if the next index would be out off bounds, if yes select the first annotaiton in the list
      // to start at the beginning of the list again and cycle through
      if (
        annotationOnTarget.findIndex((annotation) => annotation.id === window.SELECTED_ANNOTATION.id) + 1 >
        annotationOnTarget.length - 1
      ) {
        annoIdEncoded = encodeAnnoId(annotationOnTarget[0].id);
        console.log('first annotationsOntarget 2 ', annotationOnTarget[0]);
      } else {
        annoIdEncoded = encodeAnnoId(
          annotationOnTarget[
            annotationOnTarget.findIndex((annotation) => annotation.id === window.SELECTED_ANNOTATION.id) + 1
          ].id,
        );
        console.log(
          '2-n annotationsOntarget ',
          annotationOnTarget[
            annotationOnTarget.findIndex((annotation) => annotation.id === window.SELECTED_ANNOTATION.id) + 1
          ],
        );
      }
    }

    console.log('select anno id encoded: ', annoIdEncoded);
    selectAnnotation(null, annoIdEncoded);
    //alert("asd");
    console.log('selectedAnnotation 2: ', window.SELECTED_ANNOTATION);
    if ($annotationCard.classList.contains('is-hidden')) {
      toggleOverview('annotationCard');
    }
  }
}
