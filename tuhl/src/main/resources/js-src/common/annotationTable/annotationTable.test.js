import { fixTableStyling, initializeAnnotationTable } from './annotationTable';

const annoData = [
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/001e4e8b-632f-40cf-bb05-d8241878e02c',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F001e4e8b-632f-40cf-bb05-d8241878e02c',
    svg: ['id("w.153")'],
    visible: true,
    created: '2024-06-07T12:13:59Z',
    creator: 'dgss',
    modified: '2024-06-07T12:14:00Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/cf890431-414e-4323-869b-b66737a5f07e',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252Fcf890431-414e-4323-869b-b66737a5f07e',
    svg: ['id("w.127")'],
    visible: true,
    created: '2024-06-07T12:27:03Z',
    creator: 'asd',
    modified: '2024-06-07T12:27:29Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/33e435ac-4925-42b2-8507-8deddcfd2607',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F33e435ac-4925-42b2-8507-8deddcfd2607',
    svg: ['id("w.127")'],
    visible: true,
    created: '2024-06-07T12:27:42Z',
    creator: 'asd',
    modified: '2024-06-07T12:27:56Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (indirect)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/9616d37d-b4d5-4d7e-95b1-162d59768924',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F9616d37d-b4d5-4d7e-95b1-162d59768924',
    svg: ['id("w.126")'],
    visible: true,
    created: '2024-06-07T12:28:39Z',
    creator: 'asd',
    modified: '2024-06-07T12:28:43Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/02218c0d-7ee9-47d8-ba30-45c0cae6ffa6',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F02218c0d-7ee9-47d8-ba30-45c0cae6ffa6',
    svg: ['id("w.125")'],
    visible: true,
    created: '2024-06-07T12:29:54Z',
    creator: 'asd',
    modified: '2024-06-07T12:29:55Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mflag', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/2c3861fb-ea4c-415d-8d74-cb9990174641',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F2c3861fb-ea4c-415d-8d74-cb9990174641',
    svg: ['id("w.149")'],
    visible: true,
    created: '2024-06-07T12:42:53Z',
    creator: 'asd',
    modified: '2024-06-07T12:42:53Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/631a742f-cf52-45cb-b546-d884c3736893',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F631a742f-cf52-45cb-b546-d884c3736893',
    svg: ['id("w.159")'],
    visible: true,
    created: '2024-06-07T12:43:57Z',
    creator: 'asd',
    modified: '2024-06-07T12:45:02Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/35bc0255-49a4-444c-8613-f3b183f64668',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F35bc0255-49a4-444c-8613-f3b183f64668',
    svg: ['id("w.156")'],
    visible: true,
    created: '2024-06-07T12:14:27Z',
    creator: 'dgss',
    modified: '2024-06-07T13:24:28Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/8ea4228b-a11b-4fcd-8dfa-96c5a167bbf4',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F8ea4228b-a11b-4fcd-8dfa-96c5a167bbf4',
    svg: ['id("w.173")'],
    visible: true,
    created: '2024-06-07T12:17:10Z',
    creator: 'asd',
    modified: '2024-06-07T13:26:16Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/7e8ea38c-3af3-4922-bcdb-baf75d1a5c0e',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F7e8ea38c-3af3-4922-bcdb-baf75d1a5c0e',
    svg: ['id("w.130")'],
    visible: true,
    created: '2024-06-07T12:26:02Z',
    creator: 'asd',
    modified: '2024-07-15T08:40:55Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'mrw (direct)', purpose: 'classifying' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/130c7a9c-5b2f-4967-a9fc-84d916286c98',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F130c7a9c-5b2f-4967-a9fc-84d916286c98',
    svg: ['id("w.176")'],
    visible: true,
    created: '2024-07-15T08:41:18Z',
    creator: 'asdasasd',
    modified: '2024-07-15T08:41:18Z',
    motivation: 'describing',
    tags: [],
    textcards: [
      { value: 'mflag', purpose: 'classifying' },
      { value: 'rivers', purpose: 'describing' },
    ],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/559bc4ab-193f-4bb6-a408-ac74ed72a820',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F559bc4ab-193f-4bb6-a408-ac74ed72a820',
    svg: ['id("w.143")'],
    color: '#ff8d00',
    visible: true,
    created: '2024-03-12T11:37:43Z',
    creator: 'Licia, Philipp',
    modified: '2024-10-09T09:02:01Z',
    motivation: 'describing',
    tags: [{ value: 'xc' }],
    textcards: [
      { value: 'mrw (direct)', purpose: 'classifying' },
      { value: 'sitteth', purpose: 'describing' },
    ],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/9e6db9e5-edb7-452d-8bb1-c890a3ff99ad',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F9e6db9e5-edb7-452d-8bb1-c890a3ff99ad',
    svg: ['substring(id("w.178"), 2, 1)'],
    visible: true,
    created: '2024-10-09T12:10:50.908Z',
    creator: 'gf',
    modified: '2024-10-09T12:10:51Z',
    motivation: 'describing',
    tags: [],
    textcards: [{ value: 'asd', purpose: 'commenting' }],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/344ae33d-7c5a-403a-af7d-add5ea9df784',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F344ae33d-7c5a-403a-af7d-add5ea9df784',
    svg: ['substring(id("w.166"),  3,  1)', 'id("w.167")', 'id("w.168")', 'substring(id("w.169"),  1,  1)'],
    color: '#ff8d00',
    visible: true,
    created: '2024-10-09T13:20:36.492Z',
    creator: 'gf',
    modified: '2024-10-09T13:20:36Z',
    motivation: 'describing',
    tags: [{ value: 'Term1' }],
    textcards: [],
  },
  {
    id: 'http://localhost/wap/sfb1475/philipp/takita/920ea72c-f3c1-4245-ade3-8e99fa326d62',
    idEncoded:
      'http%253A%252F%252Flocalhost%252Fwap%252Fsfb1475%252Fphilipp%252Ftakita%252F920ea72c-f3c1-4245-ade3-8e99fa326d62',
    svg: ['id("w.194")'],
    color: '#ff8d00',
    visible: true,
    created: '2024-10-09T13:49:58.305Z',
    creator: 'gf',
    modified: '2024-10-09T13:49:58Z',
    motivation: 'describing',
    tags: [{ value: 'asd' }],
    textcards: [],
  },
];

// eslint-disable-next-line @stylistic/js/max-len
const filledTableString = `<div id="annotationTableBottom" class="tabulator" role="grid" tabulator-layout="fitColumns"><div class="tabulator-header" style="padding-right: 0px;"><div class="tabulator-headers" style="margin-left: 40px;"><div class="tabulator-col tabulator-frozen tabulator-frozen-left" role="columnheader" aria-sort="none" style="min-width: 40px; width: 40px; position: absolute; left: 0px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">&nbsp;</div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div><div class="tabulator-col tabulator-sortable" role="columnheader" aria-sort="none" tabulator-field="creator" style="min-width: 40px; width: 40px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">Creator</div><div class="tabulator-col-sorter"><div class="tabulator-arrow"></div></div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div><div class="tabulator-col tabulator-sortable" role="columnheader" aria-sort="none" tabulator-field="modified" style="min-width: 40px; width: 40px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">Modified</div><div class="tabulator-col-sorter"><div class="tabulator-arrow"></div></div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div><div class="tabulator-col tabulator-sortable" role="columnheader" aria-sort="none" tabulator-field="created" style="min-width: 40px; width: 40px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">Created</div><div class="tabulator-col-sorter"><div class="tabulator-arrow"></div></div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div></div><div class="tabulator-frozen-rows-holder"></div></div><div class="tabulator-tableHolder" tabindex="0" style="height: 0px;"><div class="tabulator-table" style="margin-right: 0px;"></div></div><div class="tabulator-footer" style="background-color: white;"><span class="tabulator-paginator"><label>Page Size</label><select class="tabulator-page-size" aria-label="Page Size" title="Page Size"><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="40">40</option></select><button class="tabulator-page" type="button" role="button" aria-label="First Page" title="First Page" data-page="first" disabled="">First</button><button class="tabulator-page" type="button" role="button" aria-label="Prev Page" title="Prev Page" data-page="prev" disabled="">Prev</button><span class="tabulator-pages"><button class="tabulator-page active" type="button" role="button" aria-label="Show Page 1" title="Show Page 1" data-page="1">1</button><button class="tabulator-page" type="button" role="button" aria-label="Show Page 2" title="Show Page 2" data-page="2">2</button></span><button class="tabulator-page" type="button" role="button" aria-label="Next Page" title="Next Page" data-page="next">Next</button><button class="tabulator-page" type="button" role="button" aria-label="Last Page" title="Last Page" data-page="last">Last</button></span></div></div>`;

describe('rendering a table displaying all annotations', () => {
  // TODO: for some reason Tabulator doesn't fill the table rows with content
  // in the test environment; footer and header are being filled however and
  // are tested here
  it('renders a table with given annotations', () => {
    document.body.innerHTML = `
      <div id="annotationTableBottom"></div>
      <div class="card card-body row-gap-2 invisible" id="annotationCard">`;
    const $table = document.getElementById('annotationTableBottom');
    const $annoCard = document.getElementById('annotationCard');
    const hook = jest.fn((tableData, columns) => {
      return [tableData, columns];
    });
    const $result = initializeAnnotationTable(annoData, $table, $annoCard, { preAnnotationTableCreation: [hook] });
    expect(hook).toHaveBeenCalled();
    expect($result.outerHTML).toStrictEqual(filledTableString);
  });
});

// TODO: this is no longer used since the merge related to the css/bootstrap/modal update;
// it can be removed, if the function gets removed
describe.skip('fixing the output of Tabulator by adding inline css', () => {
  // TODO: the css property height can't be set to "initial"
  // in the test environment, so the result doesn't include them and the test doesn't
  // test for it
  it('adds inline css to fix the output of Tabulator', () => {
    // adding the table without the fixed styling
    document.body.innerHTML = `<div id="annotationTableBottom" class="tabulator" role="grid" tabulator-layout="fitColumns"><div class="tabulator-header" style="padding-right: 0px;"><div class="tabulator-headers" style="margin-left: 40px;"><div class="tabulator-col tabulator-frozen tabulator-frozen-left" role="columnheader" aria-sort="none" style="min-width: 40px; width: 40px; position: absolute; left: 0px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">&nbsp;</div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div><div class="tabulator-col tabulator-sortable" role="columnheader" aria-sort="none" tabulator-field="creator" style="min-width: 40px; width: 40px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">Creator</div><div class="tabulator-col-sorter"><div class="tabulator-arrow"></div></div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div><div class="tabulator-col tabulator-sortable" role="columnheader" aria-sort="none" tabulator-field="modified" style="min-width: 40px; width: 40px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">Modified</div><div class="tabulator-col-sorter"><div class="tabulator-arrow"></div></div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div><div class="tabulator-col tabulator-sortable" role="columnheader" aria-sort="none" tabulator-field="created" style="min-width: 40px; width: 40px;" title=""><div class="tabulator-col-content"><div class="tabulator-col-title-holder"><div class="tabulator-col-title">Created</div><div class="tabulator-col-sorter"><div class="tabulator-arrow"></div></div></div></div><div class="tabulator-col-resize-handle"></div><div class="tabulator-col-resize-handle prev"></div></div></div><div class="tabulator-frozen-rows-holder"></div></div><div class="tabulator-tableHolder" tabindex="0" style="height: 0px;"><div class="tabulator-table" style="margin-right: 0px;"></div></div><div class="tabulator-footer"><span class="tabulator-paginator"><label>Page Size</label><select class="tabulator-page-size" aria-label="Page Size" title="Page Size"><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="40">40</option></select><button class="tabulator-page" type="button" role="button" aria-label="First Page" title="First Page" data-page="first" disabled="">First</button><button class="tabulator-page" type="button" role="button" aria-label="Prev Page" title="Prev Page" data-page="prev" disabled="">Prev</button><span class="tabulator-pages"><button class="tabulator-page active" type="button" role="button" aria-label="Show Page 1" title="Show Page 1" data-page="1">1</button><button class="tabulator-page" type="button" role="button" aria-label="Show Page 2" title="Show Page 2" data-page="2">2</button></span><button class="tabulator-page" type="button" role="button" aria-label="Next Page" title="Next Page" data-page="next">Next</button><button class="tabulator-page" type="button" role="button" aria-label="Last Page" title="Last Page" data-page="last">Last</button></span></div></div>`;
    const $table = document.getElementById('annotationTableBottom');
    const $result = fixTableStyling($table);
    expect($result.outerHTML).toStrictEqual(filledTableString);
  });
});
