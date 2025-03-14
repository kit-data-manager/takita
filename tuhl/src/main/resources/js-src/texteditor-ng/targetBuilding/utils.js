import { makeTargetsCompatible, checkIsTargetCompatible } from '../utils';

/**
 * check if the selection happened on the textworkspace/tei element
 *
 * @param {Node} node to be checked
 * @returns {Boolean} depending on wether the node is on the workspace/a child of a 'TEI'-root-element
 */
export function checkIsNodeOnWorkspace(node) {
  if (node.parentNode.id === 'TEI') {
    return true;
  } else if (node.parentElement != null) {
    return checkIsNodeOnWorkspace(node.parentElement);
  } else {
    return false;
  }
}

/**
 * merge all ranges of the selection into one DocumentFragment and return the content.
 * This is necessary as firefox can create selections with multiple ranges, hence
 * the rangeCount will be bigger than 1. firefox behavior violates the selection spec
 * (see https://w3c.github.io/selection-api/#dom-selection-rangecount).
 * NOTE: changes to this function should be reflected in textSelection.selenium.test.js,
 * where the function is turned into a String and passed to Selenium. This should work
 * automatically, but checking is recommended.
 *
 * @param {Selection} selection created by a user
 * @returns {DocumentFragment} holding all the contents of a selection
 */
export function getContentOfSelection(selection) {
  let selectionRangeContents = selection.getRangeAt(0).cloneContents();
  // if there are multiple selection ranges (eg. in the B04 case)
  // add those
  if (selection.rangeCount > 1) {
    for (let i = 1; i < selection.rangeCount; i++) {
      selectionRangeContents.append(selection.getRangeAt(i).cloneContents());
    }
  }
  return selectionRangeContents;
}

/**
 * reduce the amount of whitespace in a String
 *
 * @param {String} text to have whitespace reduced. Tabs, newlines etc. will be fully removed;
 * double, triple ... blanks will be replaced by a single blank.
 * @returns {String} with recued amount of whitespace
 */
export function reduceWhitespaceInString(text) {
  // console.log('Before cleaning: ', text);
  text = text.replace(/\s{4}|[\t\n\r]|\s/g, ' ');
  while (text.includes('  ')) {
    text = text.replaceAll('  ', ' ');
  }
  text = text.trim();
  // console.log('After cleaning: ', text);
  return text;
}

/**
 * get the nextSibling of a node.
 * Recursively checks if a node has a next sibling and returns it or the sibling of its parent.
 * This is used by targetCreation.js/createXPath() to get the whitespace/characters following the node.
 *
 * @param {Node} node
 * @returns {Node} the next sibling
 */
export function getNextSibling(node) {
  let nextSibling = node.nextSibling;
  // if the node has no nextSibling, get the nextSibling of the parentNode
  if (nextSibling === null) {
    nextSibling = getNextSibling(node.parentNode);
  }
  return nextSibling;
}

/**
 * get the smallest available nodes, that have an xmlId and store them in a list. Works
 * recursively to the smallest node.
 *
 * @param {Node} node to be checkd, if its the smalles one and has an xmlId
 * @param {NodeList} nodeList to store the result
 */
export function getSmallestNodesWithXmlIds(node, nodeList) {
  if (node.children.length !== 0) {
    Array.from(node.children).forEach((child) => {
      getSmallestNodesWithXmlIds(child, nodeList);
    });
  } else {
    if (node.id) {
      nodeList.push(node);
      //   console.log(node.id);
      //   console.log(node.innerHTML);
    }
  }
}

/**
 * get the offset/substringPosition for a selected word, dependant
 * on the position of the word in the range/selection
 *
 * @param {Node} target part of the range
 * @param {Object} range holding all the nodes, the start and end offests of a selection range
 * @returns {Object} holding the keys for the "start"/"end"-offset of the target node
 */
export function getSubstringPosition(target, range) {
  let substringPosition = {};

  // if the target is the first word of the selectionRange use
  // - the startOffset of the selectionRange as substringPosition.start
  // - and the length of the word as substringPosition.end
  // as then the startOffset of the selectionRange is the offset of the
  // first word and the rest of the word is fully selected
  if (target === range.targetList[0]) {
    substringPosition.start = range.startOffset;
    substringPosition.end = document.getElementById(target.id).innerText.length;
  }

  // if the target is the last word of the selectionRange use
  // - 0 as substringPosition.start
  // - and the endOffset of the selectionRange as substringPosition.end
  // as then the endOffset of the selectionRange is the offset of the
  // last word and the rest of the word (the beginning) is fully selected
  if (target === range.targetList[range.targetList.length - 1]) {
    substringPosition.start = 0;
    substringPosition.end = range.endOffset;
  }

  // (if the target is the first and last word of the selectionRange)
  // if the selectionRange holds only one word use
  // - the startOffset of the selectionRange as substringPosition.start
  // - and the endOffset of the selectionRange as substringPosition.end
  // as then the offsets of the selectionRange are the offsete of the
  // last word
  if (range.targetList.length === 1) {
    substringPosition.start = range.startOffset;
    substringPosition.end = range.endOffset;
  }
  return substringPosition;
}

/**
 * get the previously selected text from the respective body (purpose: describing),
 * or reconstruct it from the target
 *
 * @param {Object} annotation
 * @returns {String} the selected text of an annotation
 */
export function getSelectedTextOfAnnotation(annotation) {
  let selectedText;
  let describingBody = annotation.textCards.find((textCard) => textCard.purpose === 'describing');
  if (describingBody != undefined) {
    selectedText = describingBody.value;
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
    // get the text of each element
    let stringArray = idArray.map((id) => {
      return document.getElementById(id).textContent;
    });
    // merge the text of each element into one string
    selectedText = stringArray.join(' ');
  }
  return selectedText;
}

/**
 * check if a node can be selected by users (has a css property, that would exclude it from a selection)
 *
 * @param {Node} node to be checked
 * @returns {Boolean} depending, if the node is selectable or not
 */
export function isSelectable(node) {
  // get the styling of the element in the DOM. The node passed as a parameter
  // doesn't have any styling, so the proper node from the DOM has to be
  // retrieved
  const computedStyle = getComputedStyle(document.getElementById(node.id));
  if (
    computedStyle.getPropertyValue('user-select') === 'none' ||
    computedStyle.getPropertyValue('-moz-user-select') === 'none' ||
    computedStyle.getPropertyValue('-webkit-user-select') === 'none' ||
    computedStyle.getPropertyValue('-ms-user-select') === 'none'
  ) {
    return false;
  } else {
    return true;
  }
}

/**
 * Store all information needed for the target update in a modal and show it
 *
 * @param {Element} $modal to hold the information and to be shown
 * @param {String} oldSelectedText
 * @param {String} newSelectedText
 * @param {String} targetXPath
 * @returns {Element} the modal containing the inforamtion from the parameters
 */
export function showSaveTargetModal($modal, oldSelectedText, newSelectedText, targetXPath) {
  const $oldSelectedTextContainer = $modal._element.querySelector('#oldSelectedText');
  const $newSelectedTextContainer = $modal._element.querySelector('#newSelectedText');

  // modal stuff should be optimised
  let $oldSelectedTextDiv = document.createElement('div');
  $oldSelectedTextDiv.innerHTML = oldSelectedText;
  // + window.SELECTED_ANNOTATION.targets.toString();
  //  + " | id: " + window.SELECTED_ANNOTATION.svgCode.split("\"")[1];
  // setting the innerHTML to empty the div (remove the innerHTML from a previous call)
  $oldSelectedTextContainer.innerHTML = 'Current Selection:';
  $oldSelectedTextContainer.append($oldSelectedTextDiv);

  let $newSelectedTextDiv = document.createElement('div');
  $newSelectedTextDiv.innerHTML = newSelectedText; // + " | id: " + newTargetsXmlIds;
  // setting the innerHTML to empty the div (remove the innerHTML from a previous call)
  $newSelectedTextContainer.innerHTML = 'New Selection:';
  $newSelectedTextContainer.append($newSelectedTextDiv);

  $modal.toggle();
  $modal._element.dataset.newTargetXmlId = targetXPath;
  //modal.dataset.SelectedAnnotationId = selectedAnnotation.id;

  return $modal;
}
