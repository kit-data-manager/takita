import { JSDOM } from 'jsdom';
import { setMRWAnnos, setSelectedText } from './editor';
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

describe('getting all mrw annotations present in a selection and storing it in a window.VARIABLE', () => {
  it('gets all mrw annotations present in a selection', () => {
    let dom = new JSDOM(innerHtmlCreationTest);
    const selection = dom.window.getSelection();
    const range = dom.window.document.createRange();
    range.setStart(dom.window.document.getElementById('w.133'), 0);
    range.setEnd(dom.window.document.getElementById('w.136'), 1);
    selection.addRange(range);
    const annoJson = [
      { id: '1', color: '#000011', svg: ['"w.134"'] },
      { id: '2', color: '#000011', svg: ['"w.135"'] },
      { id: '3', color: '#000021', svg: ['"w.136"'] },
    ];
    setMRWAnnos(selection, annoJson);
    expect(window.MRW_ANNOS).toStrictEqual([
      { id: '1', color: '#000011', svg: ['"w.134"'] },
      { id: '2', color: '#000011', svg: ['"w.135"'] },
    ]);
  });
});

describe('getting the selected text of an annotation and storing it in a window.VARIABLE', () => {
  // this test has to be taken with a pinch of salt. The JSDOM selection seems
  // to behave a bit different from the one in the brwoser regarding the textContent
  // of itself. Strictly speaking the last word (w.136) should not be fully selected,
  // because the offset of the ending range is "1" and therefore the word not fully selected.
  it('gets the text selected by a user and stores it', () => {
    let dom = new JSDOM(innerHtmlCreationTest);
    const selection = dom.window.getSelection();
    const range = dom.window.document.createRange();
    range.setStart(dom.window.document.getElementById('w.133'), 0);
    range.setEnd(dom.window.document.getElementById('w.136'), 1);
    selection.addRange(range);
    setSelectedText(selection);
    expect(window.SELECTED_TEXT).toStrictEqual('nor standeth in the');
  });
});
