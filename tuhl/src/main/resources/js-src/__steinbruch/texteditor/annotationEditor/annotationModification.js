//internal modules
import { selectAnnotation } from '../../common/annotationDisplay';
import { encodeAnnoId } from '../../common/utils';
import { updateDisplay, checkIsTargetCompatible, makeTargetsCompatible } from './highlight';
import {
  checkIsNodeOnWorkspace,
  getContentOfSelection,
  removeWhitespaceFromSelectionTextContent,
} from './textSelection';
import { createTargetList, createXPath } from './targetCreation';
import { getColorNameFromEnumEntry } from './annotationCreation/creationTemplates';

/**
 * function called by an eventHandler attached to `document.getElementById('buttonModifySelection')`
 * to start the process of updating the target of an annotation
 *
 * @param {*} _event
 * @param {JSONObject} annotation the curretnly selected annotation, which will have its target updated
 * @returns a boolean (false), if no annotation is selected by a user and the function
 * needs to be stopped early
 */
export function modifySelection(_event, annotation) {
  //document.getElementById('modifyButton').parentElement.classList.add('active');
  if (annotation === undefined) {
    //document.getElementById('modifyButton').parentElement.classList.remove('active');
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
    return false;
  }
  console.log('Selected annotation: ', annotation);
  window.SELECTING_TEXT = true;
  window.MODE = window.MODE_CLASS.Modify;
  // disable/enable and hide/show the buttons connected
  // to the modifaction of a text selection
  document.getElementById('buttonModifySelection').disabled = true;
  document.getElementById('buttonModifySelection').classList.add('is-hidden');
  document.getElementById('buttonSaveModification').disabled = false;
  document.getElementById('buttonSaveModification').classList.remove('is-hidden');
  document.getElementById('buttonCancelModification').disabled = false;
  document.getElementById('buttonCancelModification').classList.remove('is-hidden');
}

/**
 * function called by an eventHandler attached to `document.getElementById('buttonSaveModification')`
 * to get store the new/old selected text and create the new Xpath during the process of updating
 * the target of an annotation
 *
 * @param {*} _event
 * @param {Selection} selection the selection created by a user
 * @param {JSONObject} annotation the curretnly selected annotation, which will have its target updated
 * @returns a boolean (false), if no text is selected by a user and the function
 * needs to be stopped early
 */
export function saveModification(_event, selection, annotation) {
  if (selection.toString() && checkIsNodeOnWorkspace(selection.getRangeAt(0).commonAncestorContainer)) {
    // let selectionRange = window.getSelection().getRangeAt(0);
    let selectionRangeContents = getContentOfSelection(selection);

    /*
          console.log("hereSaveMod");
          console.log(window.getSelection());
          console.log(selectionRange);
          console.log(selectionRangeContents);
          */

    // stop the function, if the selection does not contain any text, only whitespace
    if (selectionRangeContents.textContent.trim() == '') {
      console.log('No text selected, therefore early return.');
      // TODO: check if this causes problems. It might prevent users from saving
      // their updated selection, if the selected whitespace once
      // document.getElementById('modifyButton').parentElement.classList.remove('active');
      window.MODE = window.MODE_CLASS.View;
      window.SELECTING_TEXT = false;
      alert('No text selected. Please redo');
      return false;
    }

    // targetRangeList holds all the nodes from the selection, that are <w> elements
    let targetRangeList = createTargetList(selection);
    console.log('Filled targetRangeList for annotation target update: ', targetRangeList);

    // targetXPath hold the xPath resolving to the elements in targeRangetList
    let targetXPath = createXPath(targetRangeList);
    console.log('Target/XPath of the NEW selection: ', targetXPath);

    // ask user if the new selection should be saved in a modal

    // get the previously selected text from the respective body (purpose: describing),
    // or reconstruct it from the target
    let oldSelectedText = annotation.textCards.find((textCard) => textCard.purpose === 'describing');
    if (oldSelectedText != undefined) {
      oldSelectedText = oldSelectedText.value;
    } else {
      // TODO: this ordering seems to be unnecessary as we store only one long xPath,
      // which should have the proper order. This function
      // can't deal with substrings. This needs to be checked
      // make targets compatible, if necessary
      if (!checkIsTargetCompatible(annotation)) {
        annotation.targets = makeTargetsCompatible(annotation);
      }

      // store the ids of the words
      let idArray = [];
      annotation.targets.forEach((target) => {
        idArray.push(target.selector.xPath.split('"')[1]);
      });
      // this sorts the xml:ids to retrieve a somehow appropriate reconstruction of the text out of the targets
      // in cases, where the ids are not in an ascending nummerical order, the reconstruction will be off
      // especially regarding the punctuation
      idArray = idArray.sort((a, b) => {
        return a - b;
      });
      idArray = idArray.sort((a, b) => {
        const na = a.split('.').slice(-1)[0];
        const nb = b.split('.').slice(-1)[0];
        return na - nb;
      });
      oldSelectedText = '';
      // get the text of each element
      let stringArray = idArray.map((id) => {
        return document.getElementById(id).textContent;
      });
      // merge the text of each element into one string
      oldSelectedText = stringArray.join(' ');
    }

    let newSelectedText = removeWhitespaceFromSelectionTextContent(selectionRangeContents.textContent);

    // modal stuff should be optimised
    let el = document.createElement('div');
    el.innerHTML = oldSelectedText;
    // + window.SELECTED_ANNOTATION.targets.toString();
    //  + " | id: " + window.SELECTED_ANNOTATION.svgCode.split("\"")[1];
    document.getElementById('oldSelectedText').innerHTML = 'Current Selection:';
    document.getElementById('oldSelectedText').append(el);

    let ele = document.createElement('div');
    ele.innerHTML = newSelectedText; // + " | id: " + newTargetsXmlIds;
    document.getElementById('newSelectedText').innerHTML = 'New Selection:';
    document.getElementById('newSelectedText').append(ele);

    const modal = document.getElementById('updateSelection');
    modal.classList.toggle('show-modal');
    modal.dataset.newTargetXmlId = targetXPath;
    //modal.dataset.SelectedAnnotationId = selectedAnnotation.id;
  }
}



export function cancelModification() {
  // disable/enable and hiding/showing the buttons connected
  // to the modifaction of a text selection
  document.getElementById('buttonModifySelection').disabled = false;
  document.getElementById('buttonModifySelection').classList.remove('is-hidden');
  document.getElementById('buttonSaveModification').disabled = true;
  document.getElementById('buttonSaveModification').classList.add('is-hidden');
  document.getElementById('buttonCancelModification').disabled = true;
  document.getElementById('buttonCancelModification').classList.add('is-hidden');

  window.MODE = window.MODE_CLASS.View;
  window.SELECTING_TEXT = false;
}
