import { encodeAnnoId, toggleOverview } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationDisplay';
import { hideExpandedSidebar } from '../sidebar';
import { checkIsTargetCompatible, makeTargetsCompatible } from './highlight';
import {
  checkIsNodeOnWorkspace,
  getContentOfSelection,
  removeWhitespaceFromSelectionTextContent,
} from './textSelection';
import { modifySelection, cancelModification, updateTarget } from './annotationModification';
import { createTargetList, createXPath } from './targetCreation';
import { pickTemplate } from './annotationCreation/creationTemplates';

window.ANNOJSON;

window.SELECTING_TEXT = false;

// this is needed for editor.js (l.575ff.) to work atm
window.PAPER;

// globalSelectedAnnotation stores the annotation, that gets
// selected by right clicking on a highlighted word
// it is needed to
// - edit/update the target of that annotation
// - cycle through multiple annotations on one target and select them
// - (CRC1475: to add a mrw-annotation to a metaphor annotation)
window.SELECTED_ANNOTATION;

// selectedText stores the selected test as a string
// it is needed to add it to the annotations body
window.SELECTED_TEXT;

// mrwAnnos stores the mrws that are contained in a selection
// it is needed to link mrw annotations with metaphor annotations
window.MRW_ANNOS = [];

window.MODE_CLASS = class Mode {
  static View = new Mode('view');
  static Create = new Mode('create');
  static Modify = new Mode('modify');
  static Move = new Mode('move');

  constructor(name) {
    this.name = name;
  }
};

window.MODE = window.MODE_CLASS.View;

export function init(annotations) {
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
  document.getElementById('TEI').oncontextmenu = function (e) {
    e.preventDefault();

    let annotationOnTarget = [];
    let annoIdEncoded;
    // TODO: CUSTOMIZE textCard toggle (display of the annotation on the right side of the screen)
    // TODO: Just add a standard annotation class, which eistence can be checked here
    if (
      e.target.classList.contains('mrw') ||
      e.target.classList.contains('mflag') ||
      e.target.classList.contains('metaphor') ||
      e.target.classList.contains('metaphorSecond') ||
      e.target.classList.contains('defaulthighlight')
    ) {
      // add all the annotations targeting the selected word to an array
      window.ANNOJSON.forEach((item) => {
        item.svg.forEach((target) => {
          if (e.target.id == target.split('"')[1]) {
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
      if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
        toggleOverview('annotationCard');
      }
    }
  };

  document.getElementById('TEI').onmouseup = function (_event) {
    // only get a selection, if a user actually wants to select text
    if (window.MODE === window.MODE_CLASS.Create && window.SELECTING_TEXT) {
      annotateSelectedText();

      /*let target = [];
              
              for (element in selection) {
                  target.push(element);
              }
              const modal = document.getElementById("createAnnotation");
              modal.classList.toggle("show-modal");
              pickTemplate(target, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
              
             */
    }
    if (window.MODE === window.MODE_CLASS.Modify && window.SELECTING_TEXT) {
      modifySelection();

      /*let target = [];
              
              for (element in selection) {
                  target.push(element);
              }
              const modal = document.getElementById("createAnnotation");
              modal.classList.toggle("show-modal");
              pickTemplate(target, "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
              
             */
    }
  };

  // adding eventhandler for text selection
  document.getElementById('selectTextListItem').addEventListener('mousedown', onclickSelectText);

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

  // adding the closing functionality to text selection update modal
  document.getElementById('closeButtonUpdate').addEventListener('click', function (_e) {
    document.getElementById('updateSelection').classList.toggle('show-modal');
    // document.getElementById('modifyButton').parentElement.classList.remove('active');
    cancelModification();
    // disabling the option to create an annotation. needed, because selecting text
    // can be done before the mode was set to create by clicking the button after the text selection process
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
  });

  // adding the update target functionality to the button of the text selection update modal
  document.getElementById('updateTaregtButton').addEventListener('click', updateTarget);

  // add all global variable to the window.object
}

function annotateSelectedText() {
  const selection = window.getSelection();
  // check
  // - if the string is filled, because on a double click the first onmouseup
  // will have no selection and therefore no string
  // - and if the selection is on the workspace
  if (selection.toString() && checkIsNodeOnWorkspace(window.getSelection().getRangeAt(0).commonAncestorContainer)) {
    const selectionRangeContents = getContentOfSelection(selection);

    console.log('Selection object: ', selection);
    console.log('SelectionRange[0] object: ', selection.getRangeAt(0));
    console.log('Contents of a Selection object: ', selectionRangeContents);

    // stop the function, if the selection does not contain any text, only whitespace
    if (selectionRangeContents.textContent.trim() == '') {
      console.log('No text selected, therefore early return.');
      return;
    }

    // targetRangeList holds all the nodes from the selection, that are <w> elements
    let targetRangeList = createTargetList(selection);
    console.log('Filled targetRangeList for annotation creation: ', targetRangeList);

    // targetXPath hold the xPath resolving to the elements in targeRangetList
    let targetXPath = createXPath(targetRangeList);
    console.log('Target/XPath of the selection: ', targetXPath);

    // emptying the globalMrwAnnos array to only store the mrw
    // annotations present in the current selection
    // so they can be accessed in creation_templates_text.js to generate
    // a list of selected mrws inside a metaphor and link the mrw annotations
    // to the metaphor annotation
    window.MRW_ANNOS = [];
    targetRangeList.forEach((range) => {
      // to prevent duplicates in the globalMrwAnnos array, it has to be cleaned
      // after more mrw-annotations got included, which might be duplicates. This is needed, because
      // for some texts multiple ranges get created and then for each individual
      // range the globalMrwAnno array is appended, which can cause duplicates
      // https://medium.com/@rivoltafilippo/javascript-merge-arrays-without-duplicates-3fbd8f4881be
      // TODO: this can be improved by using a set. This will affect storeSelectedMRWAnnos() and
      // the opints in the creation_templates_text.js where the globalMrwAnno array is used.
      const tmpMrwAnnos = window.MRW_ANNOS.concat(storeSelectedMRWAnnos(range.targetList));
      window.MRW_ANNOS = tmpMrwAnnos.filter((item, idx) => tmpMrwAnnos.indexOf(item) === idx);
    });

    // set globalSelectedText so it can be displayed in the modal and remove all whitespaces
    window.SELECTED_TEXT = removeWhitespaceFromSelectionTextContent(selectionRangeContents.textContent);
    console.log('GlobalSelectedText: ', window.SELECTED_TEXT);

    // showing the modal/dropdown to select the annotation template, which can be populated
    // by the user
    const modal = document.getElementById('createAnnotation');
    modal.classList.toggle('show-modal');
    pickTemplate(targetXPath, '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');

    // resetting parameters, so no new annotation can be created without clicking on
    // the button at the sidebar, that enables annotation
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
  }
}

// store all the mrw annotations that are contained in a selection
export function storeSelectedMRWAnnos(targetList) {
  // empty the mrwAnno list beforehand
  let mrwAnnos = [];
  window.ANNOJSON.forEach((annotation) => {
    //annoXmlId = annotation.svg.split("\"")[1];
    //console.log(annotation);
    // checking if the annotation is a mrw-annotation by checking its color,
    // which is based on the classifying body.
    // See "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
    // for the corresponding hexes/mrw-annotation types
    if (
      annotation.color === '#000011' ||
      annotation.color === '#000012' ||
      annotation.color === '#000013' ||
      annotation.color === '#000014'
    ) {
      targetList.forEach((target) => {
        annotation.svg.forEach((svg) => {
          if (target.id === svg.split('"')[1]) {
            // this iteration should not be necessary as a Set
            // should not hold the same annotation twice
            if (mrwAnnos.length === 0) {
              mrwAnnos.push(annotation);
            } else {
              if (!mrwAnnos.some((entry) => entry.id === annotation.id)) {
                mrwAnnos.push(annotation);
              }
            }
          }
        });
      });
    }
  });
  console.log('MRW annotations present in current selection: ', mrwAnnos);

  return mrwAnnos;
}

function onclickSelectText(event) {
  hideExpandedSidebar();
  window.SELECTING_TEXT = true;
  window.MODE = window.MODE_CLASS.Create;
  annotateSelectedText();
}
