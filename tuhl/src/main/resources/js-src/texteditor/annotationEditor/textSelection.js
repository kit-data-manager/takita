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

// merge all ranges of the selection into one and return the content
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
