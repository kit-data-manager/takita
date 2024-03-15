//internal modules
import { selectAnnotation } from '../../common/annotationDisplay';
import { encodeAnnoId } from '../../common/utils';
import { updateDisplay } from './highlight';
import {
  checkIsNodeOnWorkspace,
  getContentOfSelection,
  removeWhitespaceFromSelectionTextContent,
} from './textSelection';
import { createTargetList, createXPath } from './targetCreation';
import { getColorNameFromEnumEntry } from './annotationCreation/creationTemplates';

export function modifySelection() {
  window.SELECTING_TEXT = true;
  window.MODE = window.MODE_CLASS.Modify;
  //document.getElementById('modifyButton').parentElement.classList.add('active');
  if (window.SELECTED_ANNOTATION === undefined) {
    //document.getElementById('modifyButton').parentElement.classList.remove('active');
    window.MODE = window.MODE_CLASS.View;
    window.SELECTING_TEXT = false;
    return;
  }
  console.log('Selected annotation: ', window.SELECTED_ANNOTATION);

  // disable/enable and hide/show the buttons connected
  // to the modifaction of a text selection
  document.getElementById('buttonModifySelection').disabled = true;
  document.getElementById('buttonModifySelection').classList.add('is-hidden');
  document.getElementById('buttonSaveModification').disabled = false;
  document.getElementById('buttonSaveModification').classList.remove('is-hidden');
  document.getElementById('buttonCancelModification').disabled = false;
  document.getElementById('buttonCancelModification').classList.remove('is-hidden');
}

export function saveModification() {
  if (
    window.getSelection().toString() &&
    checkIsNodeOnWorkspace(window.getSelection().getRangeAt(0).commonAncestorContainer)
  ) {
    // let selectionRange = window.getSelection().getRangeAt(0);
    let selectionRangeContents = getContentOfSelection(window.getSelection());

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
      return;
    }

    // targetRangeList holds all the nodes from the selection, that are <w> elements
    let targetRangeList = createTargetList(window.getSelection());
    console.log('Filled targetRangeList for annotation target update: ', targetRangeList);

    // targetXPath hold the xPath resolving to the elements in targeRangetList
    let targetXPath = createXPath(targetRangeList);
    console.log('Target/XPath of the NEW selection: ', targetXPath);

    // ask user if the new selection should be saved in a modal

    // get the previously selected text from the respective body (purpose: describing),
    // or reconstruct it from the target
    let oldSelectedText = window.SELECTED_ANNOTATION.textCards.find((textCard) => textCard.purpose === 'describing');
    if (oldSelectedText != undefined) {
      oldSelectedText = oldSelectedText.value;
    } else {
      let idArray = [];
      window.SELECTED_ANNOTATION.targets.forEach((target) => {
        idArray.push(target.selector.xPath.split('"')[1]);
      });
      // this sorts the xml:ids to retrieve a somehow appropriate reconstruction of the text out of the targets
      // in cases, where the ids are not in an ascending nummerical order, the reconstruction will be off
      idArray = idArray.sort((a, b) => {
        return a - b;
      });
      idArray = idArray.sort((a, b) => {
        const na = a.split('.').slice(-1)[0];
        const nb = b.split('.').slice(-1)[0];
        return na - nb;
      });
      oldSelectedText = '';
      idArray.forEach((id) => {
        oldSelectedText += document.getElementById(id).textContent + ' ';
      });
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

export function updateTarget() {
  const modal = document.getElementById('updateSelection');
  let idOfAnnotationToUpdate = encodeAnnoId(window.SELECTED_ANNOTATION.id);
  //let idOfAnnotationToUpdate = encodeAnnoId(modal.dataset.SelectedAnnotationId);
  let targetXPath = modal.dataset.newTargetXmlId;

  // update the target of an annotation (and the "purpose:describing" body, if it exists) by sending a put request
  let colorName = getColorNameFromEnumEntry(window.SELECTED_ANNOTATION.color);
  let annotationDataJson = { color: colorName, motivation: 'describing', svgCode: targetXPath };
  $.ajax({
    type: 'PUT',
    url: window.CONTEXTPATH + 'editor_rest/annotations/' + idOfAnnotationToUpdate,
    data: JSON.stringify(annotationDataJson),
    headers: {
      'Content-Type': 'application/json',
    },

    success: function (responseData) {
      console.log('Response data from succesfull target update: ', responseData);

      let responseDataJson = JSON.parse(responseData);

      // TODO: only temporary solution to update the body containing the selected text
      // if the purpose changes, the following needs to be changed
      let result = null;
      result = responseDataJson.textCards.filter((textCard) => textCard.purpose === 'describing');
      if (result != null && result.length > 0) {
        // TODO: fix, when it goes into production, bc then the innerHTML will only be
        // the selected text without any "|"s
        let newSelectedText = document.getElementById('newSelectedText').children[0].innerHTML.split('|')[0];
        newSelectedText.slice(0, newSelectedText.length - 1);
        // TODO: should there not be a field to store, who modified the body in addition
        // to the timestamp of the modification?
        // console.log(responseDataJson.creators);
        let updatedBody = {
          created: new Date(
            responseDataJson.created.seconds * 1000 + responseDataJson.created.nanos / 1000000,
          ).toISOString(),
          creators: responseDataJson.creators,
          id: result[0].id,
          modified: new Date(
            responseDataJson.modified.seconds * 1000 + responseDataJson.modified.nanos / 1000000,
          ).toISOString(),
          purpose: result[0].purpose,
          value: newSelectedText,
        };
        console.log('Updated body: ', updatedBody);

        let annoIdEncoded = encodeAnnoId(responseDataJson.id);
        let endpoint = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + result[0].id;
        console.log('Endpoint for body update: ', endpoint);

        $.ajax({
          type: 'PUT',
          url: endpoint,
          data: JSON.stringify(updatedBody),
          headers: {
            'Content-Type': 'application/json',
          },

          success: function (responseData) {
            // show the updated annotation
            selectAnnotation(null, encodeAnnoId(responseDataJson.id));
            console.log('Response data from succesfull body update: ', responseData);
          },

          error: function (errorData) {
            console.log('Error data from failed body update: ', errorData);
          },
        });
      }

      // redraw
      updateDisplay();

      // hide modal
      document.getElementById('updateSelection').classList.toggle('show-modal');
      //document.getElementById('modifyButton').parentElement.classList.remove('active');
      window.MODE = window.MODE_CLASS.View;
      window.SELECTING_TEXT = false;

      // show the updated annotation
      selectAnnotation(null, encodeAnnoId(responseDataJson.id));
    },

    error: function (errorData) {
      console.log('Error data from failed target update: ', errorData);
    },
  });
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
