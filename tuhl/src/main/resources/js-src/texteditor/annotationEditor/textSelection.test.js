import {
  checkIsNodeOnWorkspace,
  getContentOfSelection,
  removeWhitespaceFromSelectionTextContent,
} from './textSelection';

const innerHtml =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace" class="is-full-width">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '                        <tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

describe('removing most whitespace (leading, trailing and whitespaces > 1) from the selection', () => {
  it('deals with leading whitespace', () => {
    const string = ' word';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('word');
  });

  it('deals with trailing whitespace', () => {
    const string = 'word ';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('word');
  });

  it('deals with duplicated (more than 1) whitespace', () => {
    const string = '      w            o     r' + '     \t\n\rd';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('w o r d');
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

describe('checking if node is on workspace', () => {
  it('checks if a word on the worskapce returns true', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const node = document.getElementById('w.133');
    const result = checkIsNodeOnWorkspace(node);
    expect(result).toBe(true);
  });
  it('checks if a word not on the worskapce returns false', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const node = document.getElementById('notOnWorkspace');
    const result = checkIsNodeOnWorkspace(node);
    expect(result).toBe(false);
  });
});
