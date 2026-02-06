// external modules
import * as bootstrap from 'bootstrap';
import { JSDOM } from 'jsdom';
// internal modules
import {
  checkIsNodeOnWorkspace,
  getContentOfSelection,
  reduceWhitespaceInString,
  getNextSibling,
  getSmallestNodesWithXmlIds,
  getSubstringPosition,
  getSelectedTextOfAnnotation,
  showSaveTargetModal,
} from './utils';

const innerHtml =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '                        <tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';
// copied from the browser, don't touch this innerHtml
const innerHtmlSiblingTest =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-lg> <tei-l><tei-w xml:id="w.166" id="w.166">And</tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w> <tei-w xml:id="w.168" id="w.168">shall</tei-w> <tei-w xml:id="w.169" id="w.169">be</tei-w> <tei-w xml:id="w.170" id="w.170">like</tei-w> <tei-w xml:id="w.171" id="w.171">a</tei-w> <tei-w xml:id="w.172" id="w.172">tree</tei-w> <tei-w xml:id="w.173" id="w.173">planted</tei-w> <tei-w xml:id="w.174" id="w.174">by</tei-w> <tei-w xml:id="w.175" id="w.175">the</tei-w> <tei-w xml:id="w.176" id="w.176">rivers</tei-w> <tei-w xml:id="w.177" id="w.177">of</tei-w> <tei-w xml:id="w.178" id="w.178">water</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l> <tei-l><tei-w xml:id="w.179" id="w.179">that</tei-w> <tei-w xml:id="w.99993" id="w.99993">bringeth</tei-w> <tei-w xml:id="w.180" id="w.180">forth</tei-w> <tei-w xml:id="w.181" id="w.181">his</tei-w> <tei-w xml:id="w.182" id="w.182">fruit</tei-w> <tei-w xml:id="w.183" id="w.183">in</tei-w> <tei-w xml:id="w.184" id="w.184">his</tei-w> <tei-w xml:id="w.185" id="w.185">season</tei-w><tei-pc xml:id="pc.6" id="pc.6">;</tei-pc></tei-l> <tei-l><tei-w xml:id="w.186" id="w.186">his</tei-w> <tei-w xml:id="w.187" id="w.187">leaf</tei-w> <tei-w xml:id="w.188" id="w.188">also</tei-w> <tei-w xml:id="w.189" id="w.189">shall</tei-w> <tei-w xml:id="w.190" id="w.190">notwither</tei-w><tei-pc xml:id="pc.7" id="pc.7">;</tei-pc></tei-l> <tei-l><tei-w xml:id="w.191" id="w.191">and</tei-w> <tei-w xml:id="w.192" id="w.192">whatsoever</tei-w> <tei-w xml:id="w.193" id="w.193">he</tei-w> <tei-w xml:id="w.194" id="w.194">doeth</tei-w> <tei-w xml:id="w.195" id="w.195">shall</tei-w> <tei-w xml:id="w.196" id="w.196">prosper</tei-w><tei-pc xml:id="pc.8" id="pc.8">.</tei-pc></tei-l></tei-lg>';

// copied from the browser, don't touch this innerHtml
const innerHtmlSubstringTest =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-l><tei-w xml:id="w.166" id="w.166">And</tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w> <tei-w xml:id="w.168" id="w.168">shall</tei-w> <tei-w xml:id="w.169" id="w.169">be</tei-w> <tei-w xml:id="w.170" id="w.170">like</tei-w> <tei-w xml:id="w.171" id="w.171">a</tei-w> <tei-w xml:id="w.172" id="w.172">tree</tei-w> <tei-w xml:id="w.173" id="w.173">planted</tei-w> <tei-w xml:id="w.174" id="w.174">by</tei-w> <tei-w xml:id="w.175" id="w.175">the</tei-w> <tei-w xml:id="w.176" id="w.176">rivers</tei-w> <tei-w xml:id="w.177" id="w.177">of</tei-w> <tei-w xml:id="w.178" id="w.178">water</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l>';

describe('checking if node is on workspace', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // setup the document
    document.body.innerHTML = innerHtml;
  });
  it('checks if a word on the worskapce returns true', () => {
    const node = document.getElementById('w.133');
    const result = checkIsNodeOnWorkspace(node);
    expect(result).toBe(true);
  });
  it('checks if a word not on the worskapce returns false', () => {
    const node = document.getElementById('notOnWorkspace');
    const result = checkIsNodeOnWorkspace(node);
    expect(result).toBe(false);
  });
});

// this test only executes the tested function partially as jsdom and all browsers
// apart from firefox stick to the selection spec. The spec states, that a selection can
// only contain one range, but firefox can append multiple ranges to a selection.
// To test the firefox behavior refer to textSelection.selenium.test.js, which is run with
// selenium as it executes the function in the browser
// The function is necessary to fix this violation and achieve the same result for all browsers
// (see https://w3c.github.io/selection-api/#dom-selection-rangecount).
describe('merging all selection ranges into one DocumentFragment', () => {
  it('merges all ranges of a selection into one DocumentFragment', () => {
    document.body.innerHTML = innerHtml;

    const range1 = new Range();
    range1.setStart(document.getElementById('w.133'), 0);
    range1.setEnd(document.getElementById('w.134'), 1);

    const range2 = new Range();
    range2.setStart(document.getElementById('w.136').childNodes[0], 2);
    range2.setEnd(document.getElementById('w.138'), 1);

    const range3 = new Range();
    range3.setStart(document.getElementById('w.139').childNodes[0], 2);
    range3.setEnd(document.getElementById('w.141').childNodes[0], 4);

    const selection = window.getSelection();
    selection.addRange(range1);
    //  the following two addRange() calls should not change the selection
    selection.addRange(range2);
    selection.addRange(range3);

    const selectionRangeContents = getContentOfSelection(selection);

    expect(selectionRangeContents.childNodes.length).toBe(3);
    expect(selectionRangeContents.firstElementChild.id).toBe('w.133');
    expect(selectionRangeContents.lastElementChild.id).toBe('w.134');
  });
});

describe('removing most whitespace (leading, trailing and whitespaces > 1) from the selection', () => {
  it('deals with leading whitespace', () => {
    const string = ' word';
    const result = reduceWhitespaceInString(string);
    expect(result).toBe('word');
  });

  it('deals with trailing whitespace', () => {
    const string = 'word ';
    const result = reduceWhitespaceInString(string);
    expect(result).toBe('word');
  });

  it('deals with duplicated (more than 1) whitespace', () => {
    const string = '      w            o     r' + '     \t\n\rd';
    const result = reduceWhitespaceInString(string);
    expect(result).toBe('w o r d');
  });
});

describe('getting next sibling', () => {
  it('gets the next sibling of a node where the next sibling is an element', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSiblingTest;
    const $node = document.getElementById('w.178');
    const $nextSibling = getNextSibling($node);
    expect($nextSibling.id).toBe('pc.5');
  });
  it('gets the next sibling of a node where the next sibling is a text', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSiblingTest;
    const $node = document.getElementById('w.173');
    const $nextSibling = getNextSibling($node);
    expect($nextSibling.nodeType).toBe(3);
  });
  it(
    'recursively gets the next sibling of a node where the next sibling is null, ' +
      'so the parentNodes next sibling will be used, which in turn has a text node as a nextSibling',
    () => {
      // setup the document
      document.body.innerHTML = innerHtmlSiblingTest;
      const $node = document.getElementById('pc.5');
      const $nextSibling = getNextSibling($node);
      expect($nextSibling.nodeType).toBe(3);
    },
  );
});
// copy of innerHtml, but modified to resemble a more nested structure like in the Hebrew files of B03
const innerHtmlSmallestNodeTest =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-l id="test"><tei-w id="w.166a_166b"><tei-w id="w.166a">An</tei-w><tei-w id="w.166b">d</tei-w></tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l>';

describe('getting smallest nodes, which have an id', () => {
  it(
    'gets the smallest nodes, which have an id, by getting the' +
      'children of a node until there are no children anymore',
    () => {
      // setup the document
      document.body.innerHTML = innerHtmlSmallestNodeTest;
      const $node = document.getElementById('test');
      let nodeList = [];
      getSmallestNodesWithXmlIds($node, nodeList);
      // extarcting the ids of the nodes, to check if all the relevant nodes are included
      const result = nodeList.map((node) => node.id);
      expect(result).toStrictEqual(['w.166a', 'w.166b', 'w.167', 'pc.5']);
    },
  );
});

// doesnt work without manipulating the document, bc TypeError: Cannot read properties of undefined (reading 'length')
// in 195 |     substringPosition.end = document.getElementById(target.id).innerText.length;
describe('getting substring position of a word in a range', () => {
  it('gets the substring position of a word at the start of a range', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSubstringTest;
    // the following variables (range, target) have types not avialable in the
    // test environment (Range, Node), so only the properties used by the function
    // are included/mocked. Only the id of the node is used by the function, so the
    // nodes are reduced to their ids.
    const mockTarget = { id: 'w.174' };
    const mockRange = {
      targetList: [mockTarget, { id: 'w.175' }, { id: 'w.176' }],
      startOffset: 1,
      endOffset: 5,
    };
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    document.getElementById(mockTarget.id).innerText = 'by';
    const result = getSubstringPosition(mockTarget, mockRange);
    expect(result).toStrictEqual({
      start: 1,
      end: 2,
    });
  });

  it('gets the substring position of a word in the middle of a range (if the range only contains one word)', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSubstringTest;
    // the following variables (range, target) have types not avialable in the
    // test environment (Range, Node), so only the properties used by the function
    // are included/mocked. Only the id of the node is used by the function, so the
    // nodes are reduced to their ids.
    const mockTarget = { id: 'w.175' };
    const mockRange = {
      targetList: [mockTarget],
      startOffset: 1,
      endOffset: 2,
    };
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    document.getElementById(mockTarget.id).innerText = 'the';
    const result = getSubstringPosition(mockTarget, mockRange);
    expect(result).toStrictEqual({
      start: 1,
      end: 2,
    });
  });

  it('gets the substring position of a word at the end of a range', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSubstringTest;
    // the following variables (range, target) have types not avialable in the
    // test environment (Range, Node), so only the properties used by the function
    // are included/mocked. Only the id of the node is used by the function, so the
    // nodes are reduced to their ids.
    const mockTarget = { id: 'w.176' };
    const mockRange = {
      targetList: [{ id: 'w.174' }, { id: 'w.175' }, mockTarget],
      startOffset: 1,
      endOffset: 5,
    };
    const result = getSubstringPosition(mockTarget, mockRange);
    expect(result).toStrictEqual({
      start: 0,
      end: 5,
    });
  });
});

describe('get string containing the selected text/target of an annotation', () => {
  it('gets the string from the body with the purpose "describing"', () => {
    const annotation = {
      textCards: [
        {
          value: 'Blessed [is] the',
          purpose: 'describing',
        },
      ],
      targets: [
        {
          selector: { type: 'XPathSelector', value: 'id("w.133") | id("w.134") | id("w.135")' },
        },
      ],
    };
    const result = getSelectedTextOfAnnotation(annotation);
    expect(result).toStrictEqual(annotation.textCards[0].value);
  });
  it('reconstructs the string from target', () => {
    document.body.innerHTML = innerHtml;
    const annotation = {
      textCards: [
        {
          purpose: 'not describing',
        },
      ],
      targets: [
        {
          selector: { type: 'XPathSelector', value: 'id("w.133") | id("w.134") | id("w.135")' },
        },
      ],
    };
    // manipulating the document as "textContent" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // EDIT July 2024: Philipp didn't know how to use JSDOM properly. See above
    // tests for the usage of JSDOM. If there is some spare time, feel free to update this test
    document.getElementById('w.133').textContent = 'Blessed';
    document.getElementById('w.134').textContent = '[is]';
    document.getElementById('w.135').textContent = 'the';
    const result = getSelectedTextOfAnnotation(annotation);
    expect(result).toStrictEqual('Blessed [is] the');
  });
});

describe('showing the modal for target modification', () => {
  it(`displays the old and newly selected text, 
    when the element is empty (first call to the function)`, () => {
    document.body.innerHTML = `
    <div class="modal" tabindex="-1" role="dialog" id="updateSelection" data-bs-backdrop="static" data-new-target-xml-id="id(&quot;w.101&quot;) | id(&quot;w.102&quot;)">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Update Seleted Text</h5>
                    <button type="button" id="dismissTargetUpdate" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="oldSelectedText"></div>
                    <div id="newSelectedText"></div>
                    <input class="btn btn-primary" type="submit" value="Update + Save" id="updateTargetButton">
                </div>
            </div>
        </div>
    </div>
    `;

    // let $modal = document.getElementById('updateSelection');
    let $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    const oldSelectedText = 'old';
    const newSelectedText = 'new';
    const xPath = 'id("w.1")';
    $modal = showSaveTargetModal($modal, oldSelectedText, newSelectedText, xPath);
    // expect($modal.querySelector('#oldSelectedText').firstElementChild.innerHTML).toStrictEqual('old');
    // expect($modal.querySelector('#newSelectedText').firstElementChild.innerHTML).toStrictEqual('new');
    expect($modal._element.querySelector('#oldSelectedText').firstElementChild.innerHTML).toStrictEqual('old');
    expect($modal._element.querySelector('#newSelectedText').firstElementChild.innerHTML).toStrictEqual('new');
    expect($modal._element.classList.contains('show')).toBe(true);
  });
  it(`displays the old and newly selected text, 
    when the element was already filled (second call to the function)`, () => {
    document.body.innerHTML = `
    <div class="modal" tabindex="-1" role="dialog" id="updateSelection" data-bs-backdrop="static" data-new-target-xml-id="id(&quot;w.101&quot;) | id(&quot;w.102&quot;)">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Update Seleted Text</h5>
                    <button type="button" id="dismissTargetUpdate" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="oldSelectedText">Current Selection:<div>party</div></div>
                    <div id="newSelectedText">New Selection:<div>disco</div></div>
                    <input class="btn btn-primary" type="submit" value="Update + Save" id="updateTargetButton">
                </div>
            </div>
        </div>
    </div>
    `;

    let $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    const oldSelectedText = 'old';
    const newSelectedText = 'new';
    const xPath = 'id("w.1")';
    $modal = showSaveTargetModal($modal, oldSelectedText, newSelectedText, xPath);
    expect($modal._element.querySelector('#oldSelectedText').firstElementChild.innerHTML).toStrictEqual('old');
    expect($modal._element.querySelector('#newSelectedText').firstElementChild.innerHTML).toStrictEqual('new');
    expect($modal._element.classList.contains('show')).toBe(true);
  });
});
