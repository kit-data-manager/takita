import { Mode } from '../../common/mode';
import { createTargetString } from './targetCreation';

// copied from the browser, don't touch this innerHtml
const innerHtmlCreationTest =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace" class="is-full-width">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

// this test is not really necessary as createTargetString() only calls createTargetList() and
// then calls createXPath() with the return of createTargetList(). There are problems with
// testing this function anyways as the dom is only set up once per test-suite, so only the first
// test will succeed; subsequent test will fail, because of things being undefined as the tested functions
// use the dom and on the second test, the dom will not be functional.
// This test is only hear for completeness, it supplements targetCreation.test.js (which holds the important tests)
// and is supplemented by targetCreation.secondA.test.js (which tests the if branch)
describe('creating a string containing all the xPaths of a target', () => {
  it('stops the function as only whitespace got selected', () => {
    window.MODE_CLASS = Mode;
    document.body.innerHTML = innerHtmlCreationTest;
    document.getElementById('w.134').innerHTML = ' ';
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(document.getElementById('w.134'), 0);
    range.setEnd(document.getElementById('w.134'), 1);
    selection.addRange(range);
    const result = createTargetString(selection);
    expect(result).toBe('');
  });
});
