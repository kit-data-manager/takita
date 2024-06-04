// check if the selection happened on the textworkspace/tei element
export function checkIsNodeOnWorkspace(node) {
  if (node.parentNode.id === 'TEI') {
    return true;
  } else if (node.parentElement != null) {
    return checkIsNodeOnWorkspace(node.parentElement);
  } else {
    return false;
  }
}

// merge all ranges of the selection into one DocumentFragment and return the content.
// This is necessary as firefox can create selections with multiple ranges, hence
// the rangeCount will be bigger than 1. firefox behavior violates the selection spec
// (see https://w3c.github.io/selection-api/#dom-selection-rangecount).
// NOTE: changes to this function should be reflected in textSelection.selenium.test.js,
// where the function is turned into a String and passed to Selenium. This should work
// automatically, but checking is recommended.
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

export function removeWhitespaceFromSelectionTextContent(text) {
  // console.log('Before cleaning: ', text);
  text = text.replace(/\s{4}|[\t\n\r]|\s/g, ' ');
  while (text.includes('  ')) {
    text = text.replaceAll('  ', ' ');
  }
  text = text.trim();
  // console.log('After cleaning: ', text);
  return text;
}

// get the nextSibling of a node
export function getNextSibling(node) {
  let nextSibling = node.nextSibling;
  // if the node has no nextSibling, get the nextSibling of the parentNode
  if (nextSibling === null) {
    nextSibling = getNextSibling(node.parentNode);
  }
  return nextSibling;
}

// get the smallest available nodes, that have an xmlId and store them in a list
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

// get the offset/substringPosition for a selected word
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
