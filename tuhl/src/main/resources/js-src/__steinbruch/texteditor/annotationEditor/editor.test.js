// internal modules
import { annotateSelectedText, storeSelectedMRWAnnos } from './editor';

const innerHtml =
  '<div>' +
  ' <div class="modal" id="createAnnotation">' +
  '   <div class="modal-content">' +
  '     <span class="close-button" id="closeButtonAnno">&times;</span>' +
  '     <form id="pickAnnotationTemplateForm"></form>' +
  '     <form id="createAnnotationForm"></form>' +
  '    </div>' +
  '   </div>' +
  ' </div>' +
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace" class="is-full-width">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>' +
  '</div>';

beforeEach(() => {
  window.SELECTED_TEXT = undefined;
  // not necessary as the called function empties the array anyways
  window.MRW_ANNOS = [];
  document.body.innerHTML = '';
});
afterEach(() => {
  // restore the original func after test
  jest.resetModules();
});

// will not work as I can't get the selection out of the browser
describe('annotating selected text', () => {
  beforeEach(() => {
    window.SELECTED_TEXT = undefined;
    // not necessary as the called function empties the array anyways
    window.MRW_ANNOS = [];
    document.body.innerHTML = '';
  });
  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });
  it('starts the annotation creation process to annotate two words', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;
    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.134').childNodes[0], 4);
    selection.addRange(range);
    const annoJson = [
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.133")'],
        color: '#000021',
      },
    ];
    annotateSelectedText(selection, annoJson);
    expect(window.MRW_ANNOS.length).toBe(0);
    expect(window.SELECTED_TEXT).toBe('nor stan');
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect(document.getElementById('createAnnotation').classList.contains('show-modal')).toBe(true);
  });
  it('starts the annotation creation process to annotate two words, whereof one already is marked as an "mrw"', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;
    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.134').childNodes[0], 4);
    selection.addRange(range);
    // annoJson can be empty as the function stops before it is used
    const annoJson = [
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.133")'],
        color: '#000011',
      },
    ];
    annotateSelectedText(selection, annoJson);
    expect(window.MRW_ANNOS.length).toBe(1);
    expect(window.MRW_ANNOS[0].id).toBe(
      'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
    );
    expect(window.SELECTED_TEXT).toBe('nor stan');
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect(document.getElementById('createAnnotation').classList.contains('show-modal')).toBe(true);
  });
  it('starts the annotation creation process to annotate two words, which are already marked as an "mrw"', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;
    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.134').childNodes[0], 4);
    selection.addRange(range);
    // annoJson holding a duplicate, two mrw-annos and one metaphor annotation
    const annoJson = [
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.133")'],
        color: '#000011',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.134")'],
        color: '#000011',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147',
        svg: ['id("w.134")'],
        color: '#000021',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/',
        svg: ['id("w.134")'],
        color: '#000011',
      },
    ];
    annotateSelectedText(selection, annoJson);
    expect(window.MRW_ANNOS.length).toBe(2);
    expect(window.MRW_ANNOS[0].id).toBe(
      'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
    );
    expect(window.MRW_ANNOS[1].id).toBe('http://localhost/wap/sfb1475/philipp/takita/');
    expect(window.SELECTED_TEXT).toBe('nor stan');
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect(document.getElementById('createAnnotation').classList.contains('show-modal')).toBe(true);
  });
  it('starts the annotation creation process to annotate two words, but stops as no text was selected', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;
    // setting the elements to only contain whitespace
    document.getElementById('w.133').innerHTML = '';
    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.133'), 0);
    selection.addRange(range);
    // annoJson can be empty as the function stops before it is used
    const annoJson = {};
    annotateSelectedText(selection, annoJson);
    expect(window.MRW_ANNOS).toStrictEqual([]);
    expect(window.SELECTED_TEXT).toBe(undefined);
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect(document.getElementById('createAnnotation').classList.contains('show-modal')).toBe(false);
  });
  it('starts the annotation creation process to annotate two words, but stops as only whitespace was selected', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;
    // setting the elements to only contain whitespace
    document.getElementById('w.133').innerHTML = '   ';
    document.getElementById('w.134').innerHTML = '        ';
    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.134').childNodes[0], 4);
    selection.addRange(range);
    // annoJson can be empty as the function stops before it is used
    const annoJson = {};
    const functionCompleted = annotateSelectedText(selection, annoJson);
    expect(functionCompleted).toBe(false);
    expect(window.MRW_ANNOS).toStrictEqual([]);
    expect(window.SELECTED_TEXT).toBe(undefined);
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect(document.getElementById('createAnnotation').classList.contains('show-modal')).toBe(false);
  });
});

describe('storing mrw annotations present in the selection', () => {
  it('stores mrw-annotations present in the selection', () => {
    const targetList = [{ id: 'w.133' }, { id: 'w.134' }];
    const annoJson = [
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.133")'],
        color: '#000011',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/',
        svg: ['id("w.134")'],
        color: '#000011',
      },
    ];
    const result = storeSelectedMRWAnnos(annoJson, targetList);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f');
    expect(result[1].id).toBe('http://localhost/wap/sfb1475/philipp/takita/');
  });
  it('stores mrw-annotations present in the selection', () => {
    const targetList = [{ id: 'w.133' }, { id: 'w.134' }];
    // holds a duplicate and a metaphor annotation apart from three mrw-annotations
    const annoJson = [
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.133")'],
        color: '#000011',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.133")'],
        color: '#000011',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4',
        svg: ['id("w.133")', 'id("w.134")', 'id("w.135")'],
        color: '#000011',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147',
        svg: ['id("w.134")'],
        color: '#000021',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/',
        svg: ['id("w.134")'],
        color: '#000011',
      },
    ];
    const result = storeSelectedMRWAnnos(annoJson, targetList);
    expect(result.length).toBe(3);
    expect(result[0].id).toBe('http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f');
    expect(result[1].id).toBe('http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4');
    expect(result[2].id).toBe('http://localhost/wap/sfb1475/philipp/takita/');
  });
  it('stores mrw-annotations present in the selection, but nothing is present', () => {
    const targetList = [{ id: 'w.133' }, { id: 'w.134' }];
    const annoJson = [
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.134")'],
        color: '#000021',
      },
      {
        id: 'http://localhost/wap/sfb1475/philipp/takita/',
        svg: ['id("w.135")'],
        color: '#000011',
      },
    ];
    const result = storeSelectedMRWAnnos(annoJson, targetList);
    expect(result.length).toBe(0);
  });
});
