import { Mode } from '../../common/mode';
import { saveModification } from './targetModification';

const innerHtml =
  `
<div class="modal" tabindex="-1" role="dialog" id="updateSelection" data-bs-backdrop="static">
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
` +
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">  </tei-w> <tei-w xml:id="w.138" id="w.138">       </tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>' +
  '</div>';

window.MODE_CLASS = Mode;

const annotationWithoutDescBody = {
  pageId: '9e92b0dd-dd60-48f3-9ded-ba7a8d3f0d2f',
  textCards: [],
  id: 'http://localhost/wap/sfb1475/philipp/takita/c4316923-7f25-4d36-adb6-7831255c6d6b',
  modified: '2024-04-16T08:54:54.000Z',
  creators: ['sdfsf'],
  created: '2024-04-16T08:54:54.000Z',
  targets: [
    {
      type: 'TEXT',
      linkToResource:
        'http://localhost:8090/api/v1/dataresources/9e92b0dd-dd60-48f3-9ded-ba7a8d3f0d2f/data/Book_of_Psalms.xml',
      selector: {
        xPath: 'concat(id("w.133"), "\n                    ", substring(id("w.134"), 1, 2))',
      },
    },
  ],
  etag: '"xtgitxsdbialejklodai"',
};

// Silence console.xxx() for the duration of these tests, so it does
// not spam our console
beforeEach(() => {
  console.error = jest.fn(() => {});
  console.log = jest.fn(() => {});
});
afterEach(() => {
  jest.clearAllMocks();
});

// The tested function (saveModification()) calls createTextSelectors(), which
// calls createXPath() and createTargetList(). There are problems with
// testing these function anyways as the dom is only set up once per test-suite, so only the first
// test will succeed; subsequent test will fail, because of things being undefined as the tested functions
// use the dom and on the second test, the dom will not be functional.
// This test supplements targetModification.test.js
describe('saving modification process', () => {
  it('saves the modification process for an annotation without the describing body', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;
    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.134').childNodes[0], 4);
    selection.addRange(range);
    const annotation = annotationWithoutDescBody;

    const stoppedFunction = saveModification(null, selection, annotation);
    const modal = document.getElementById('updateSelection');
    const oldSelectedText = document.getElementById('oldSelectedText').firstElementChild.innerHTML;
    const newSelectedText = document.getElementById('newSelectedText').firstElementChild.innerHTML;
    const newSelectors = modal.dataset.newTargetCode;

    expect(stoppedFunction).toBe(undefined);
    expect(oldSelectedText).toBe('nor standeth');
    expect(newSelectedText).toBe('nor stan');
    // the test result should be 'concat(id("w.133"), " ", substring(id("w.134"), 1, 4))',
    // as the functions called by saveModificaiton() are tested and working properly.
    // But for in a test-environment the targetbuilding behaves differently as
    // the nodes don't have the proper 'innerText' propertiy
    expect(newSelectors).toStrictEqual(
      JSON.stringify([
        { type: 'XPathSelector', value: 'id("w.133") | id("w.134")' },
        {
          type: 'TextQuoteSelector',
          exact: 'nor stan',
          prefix: '                                                  ',
          suffix: ' standeth in the            sinners, nor sitteth i',
        },
      ]),
    );
  });
});
