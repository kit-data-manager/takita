// get the smallest available nodes, that have an xmlId and store them in a list
function getSmallestNodesWithXmlIds(node, nodeList) {
  if (node.children.length !== 0) {
    Array.from(node.children).forEach((child) => {
      getSmallestNodesWithXmlIds(child, nodeList);
    });
  } else {
    if (node.id) {
      nodeList.push(node);
    }
  }
}

// create a list, that for each selection contains a JSON-object,
// which contains all the selected nodes with an Id and the offsets
// of the selection
export function createTargetList(selection) {
  let targetRangeList = [];

  for (let i = 0; i < selection.rangeCount; i++) {
    let targetList = [];
    let selectionRange = selection.getRangeAt(i);
    let selectionRangeContents = selectionRange.cloneContents();
    // selectionRangeOffsets is necessary as selectionRange.startOffset is a
    // read-only property, but it might need to change (if the selected text starts
    // with whitespace)
    let selectionRangeOffsets = {
      startOffset: selectionRange.startOffset,
      endOffset: selectionRange.endOffset,
    };

    // check if the selected text starts with whitespace (/^\s/ = regex matching any whitespace at the start of a word
    // eslint-disable-next-line @stylistic/js/max-len
    // from: https://stackoverflow.com/questions/10844294/how-to-check-whether-a-string-has-whitespace-at-the-beginning-in-javascript)
    // or if the first childs textContent is only whitespace. If it does
    // set the startOffest to 0 as the first selected element holding text
    // will have its start fully selected and the startOffset is used to
    // create the substring selector
    // TODO: find a better solution for this as there might be a time
    // where the first selected elment starts with whitespace for whatever reason
    // OR there are punctuation sign/other symbols, which are not part of the first element
    if (
      /^\s/.test(selectionRangeContents.textContent) &&
      selectionRangeContents.childNodes[0].textContent.trim() === ''
    ) {
      selectionRangeOffsets.startOffset = 0;
      console.log('Changed the selection startOffset to: 0');
    }

    // check how many words/elements got selected,
    // for some reason the selection always holds more than one element
    // even if, only one got selected. Only if a user selects the middle part
    // of a word, the selection holds only one elment
    // ------
    // TODO: firefox specific problem (works in
    // safari: just fine
    // chrome: only because double clicking selects all syllables):
    // double clicking on the first syllable of an unsandhied word (B04 specifc data) creates
    // a selection containing two text nodes. therefore no elementNode will be put into
    // the targetList and no xml:id is present to create the annotation.
    if (selectionRangeContents.childNodes.length == 1) {
      // if a user selects only the middle part of a word (eg. "or") the selection
      // won't return a w-element but a textNode, so we need to get the parent of
      // that text node (which should be a w-element)
      if (selectionRangeContents.childNodes.length == 1 && selectionRangeContents.childNodes[0].nodeType == 3) {
        if (
          selectionRange.startContainer.nodeValue == selectionRange.endContainer.nodeValue &&
          selectionRange.endContainer.nodeValue == selectionRange.commonAncestorContainer.nodeValue
        ) {
          if (selectionRange.commonAncestorContainer.parentNode.nodeName === 'TEI-W') {
            // as createXPath() checks if the innerText of the targetNode is the same
            // as of the node in the DOM with the same id to create the subStringSelector,
            // the selected string needs to be saved as the innerText of the targetNode.
            // As the parentNode is not part of the selectionRange this step is necessary.
            // To replace the innerText without altering the DOM the node has to be cloned.
            let targetNode = selectionRange.commonAncestorContainer.parentNode.cloneNode();
            targetNode.innerText = selectionRangeContents.textContent;
            targetList.push(targetNode);
          } else {
            console.log(
              'selectionRange.commonAncestorContainer.parentNode is not TEI-W. ',
              selectionRange.commonAncestorContainer.parentNode,
            );
          }
        }
        // TODO: sometimes an element "A" only has one childNode, which is a tei-w.
        // In this case, the tei-w's id WONT be added to the targetList by calling the
        // getXmlIds funciton on this selection. This is the case for B04 data,
        // when the tei-reg element holds only one tei-w element)
        // temporary solution:
        // So if the element "A" is not a textNode, but something else (Philipp can only
        // think, that it would be an elementNode then, in B04 its an tei-reg element),
        // its xmlid should be retrieved and added to the targetList by calling getXmlIds()
      } else if (selectionRangeContents.childNodes[0].nodeType == 1) {
        getSmallestNodesWithXmlIds(selectionRangeContents.children[0], targetList);
      } else {
        console.log('The following node is neither a text nor element node. ', selectionRangeContents.childNodes[0]);
      }
    } else {
      getSmallestNodesWithXmlIds(selectionRangeContents, targetList);
    }

    // "cleaning" the targetList, because sometimes an empty w-element will be included
    // in the bgeinning or at the end of the targetList as the user selected some
    // whitespace before/after the first word she wanted to select as well
    if (targetList.length > 1) {
      if (targetList[targetList.length - 1].innerHTML.trim() == '') {
        targetList.pop();
      }
      if (targetList[0].innerHTML.trim() == '') {
        targetList.shift();
      }
    }

    // add the start/end offsets/character positions of the text
    // create the json object containing all information
    let rangeItem = {
      targetList: targetList,
      startOffset: selectionRangeOffsets.startOffset,
      endOffset: selectionRangeOffsets.endOffset,
    };
    targetRangeList.push(rangeItem);
  }

  return targetRangeList;
}

// creates a concatenated list of each xPath resolving to one element, that
// is present in the selction
function createListOfIds(targetList) {
  // targetListJson is a list of all the <w> elements id to be used as targets for
  // the web annotations; its a STRING
  // targetListJsonAsJson is the same as targetListJson but as JSON
  let targetsXmlIds = '';
  // let targetListJson;
  // let targetListJsonAsJson;
  // following variables are needed to create a jsonish target
  let valueId;
  // let selectorObject;
  // let targetJson = {};
  // let targetArray = [];

  // if the targetList holds only one element, as only one element got selected
  // only that will be stored in targetListJson
  if (targetList.length === 1) {
    // storing values to build a JSON
    valueId = '//*[@xml:id="' + targetList[0].id + '"]';
    //selectorObject = {type: "XPathSelector", value: valueId};
    //targetJson = {source: window.CURRENTPAGEURL, selector: selectorObject};
    //targetListJson = targetJson;
    targetsXmlIds = valueId;
    // if holds multiple elements, as multiple elements got selected
  } else if (targetList.length !== 0) {
    // targetListJson = '[';
    targetList.forEach((item) => {
      // storing values to build a JSON and convert it to a STRING
      valueId = '//*[@xml:id="' + item.id + '"]';
      //selectorObject = {type: "XPathSelector", value: valueId};
      //targetJson = {source: window.CURRENTPAGEURL, selector: selectorObject};
      //targetListJson = targetListJson + JSON.stringify(targetJson) + ",";
      targetsXmlIds = targetsXmlIds + valueId + '|';
    });
    // slice removes the last §, as its not needed; and then remove the "\"
    //targetListJson = (targetListJson.slice(0,-1) + "]").replaceAll("\\","");
    targetsXmlIds = targetsXmlIds.slice(0, -1);

    /*targetList.forEach( item => {
              // storing values to build a JSON
              targetJson = {};
              valueId = "//*[@xml:id =\"" + item.id + "\"]";
              selectorObject = {type: "XPathSelector", value: valueId};
              targetJson = {source: window.CURRENTPAGEURL, selector: selectorObject};
              targetArray.push(targetJson);
              
          });*/
    //targetListAsJson = {target: targetArray};
    //console.log(targetListJson);
    //console.log(JSON.stringify(targetListAsJson));
  }
  return targetsXmlIds;
}

// get the offset/substringPosition for a selected word
function getSubstringPosition(target, range) {
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

// get the nextSibling of a node
function getNextSibling(node) {
  let nextSibling = node.nextSibling;
  // if the node has no nextSibling, get the nextSibling of the parentNode
  if (nextSibling === null) {
    nextSibling = getNextSibling(node.parentNode);
  }
  return nextSibling;
}

export function createXPath(targetRangeList) {
  let xPaths = [];
  let xPathContainsSubstring = false;
  let longXPath = '';

  // create an xPath for each targeted element
  targetRangeList.forEach((range) => {
    range.targetList.forEach((target) => {
      let xPathToElement = 'id("' + target.id + '")';
      // check if the targetted words are fully selected
      if (target.innerText === document.getElementById(target.id).innerText) {
        xPaths.push(xPathToElement);
      } else {
        // if they are not fully selected get the offsets/substringPosition
        xPathContainsSubstring = true;
        let substringPosition = getSubstringPosition(target, range);
        // get the substring(string, start, length) function of xPath, but it works a bit different
        // than the offsets of a selection
        // - it requires the start offset, but "As in other XPath functions, the position
        //   is not zero-based. The first character in the string has a position of 1, not 0.
        //   https://developer.mozilla.org/en-US/docs/Web/XPath/Functions/substring ",
        //   so the start offset needs to be incremented by 1
        // - and it reuires the length of the substring instead of the endOffset
        let xPathSubstring = {};
        xPathSubstring.start = substringPosition.start + 1;
        xPathSubstring.length = target.innerText.length;
        xPaths.push('substring(' + xPathToElement + ', ' + xPathSubstring.start + ', ' + xPathSubstring.length + ')');
      }
    });
  });

  // create the long xPath depending on the xPaths of the selected words.
  // If a substring is present create a concatenated xPath otherwise
  // join the xPaths together
  if (xPathContainsSubstring) {
    if (xPaths.length === 1) {
      longXPath = xPaths[0];
    } else {
      // add the trailing characters (most likely whitespace, maybe punctuation)
      // to each xPath, so that when they will be resolved, they are trailed by the
      // correct characters
      xPaths = xPaths.map((xPath) => {
        let nextSibling = getNextSibling(document.getElementById(xPath.split('"')[1]));
        if (nextSibling.nodeType === 3) {
          return xPath + ', "' + nextSibling.nodeValue + '"';
        } else {
          return xPath;
        }
      });

      // remove the string trailing the last xPath (there might not even be one)
      // as it was not selected by the user.
      // To do that, use a regex matching the substring function without its parameters
      // as they are different for each xPath
      let regex = /(substring\().*\)/;
      if (regex.test(xPaths[xPaths.length - 1])) {
        xPaths[xPaths.length - 1] = regex.exec(xPaths[xPaths.length - 1])[0];
      }

      // create the final xPath
      longXPath = 'concat(' + xPaths.join(', ') + ')';
    }
  } else {
    longXPath = xPaths.join(' | ');
  }

  return longXPath;
}
