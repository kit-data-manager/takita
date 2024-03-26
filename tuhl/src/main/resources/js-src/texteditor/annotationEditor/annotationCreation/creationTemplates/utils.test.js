import { getColorHexFromEnumEntry, getColorNameFromEnumEntry, getEnumAndTitleMap, spreadMRWArray } from './utils';

// copied from the browser, don't touch this innerHtml
const innerHtml =
  '<tei-l data-origname="l"><tei-w xml:id="w.121" id="w.121">Blessed</tei-w>' +
  '<tei-w xml:id="w.122" id="w.122">[is]</tei-w>' +
  '<tei-w xml:id="w.123" id="w.123">the</tei-w>' +
  '<tei-w xml:id="w.124" id="w.124">man</tei-w>' +
  '<tei-w xml:id="w.125" id="w.125">that</tei-w>' +
  '<tei-w xml:id="w.126" id="w.126">walketh</tei-w>' +
  '<tei-w xml:id="w.127" id="w.127">not</tei-w>' +
  '<tei-w xml:id="w.128" id="w.128">in</tei-w>' +
  '<tei-w xml:id="w.129" id="w.129">the</tei-w>' +
  '<tei-w xml:id="w.130" id="w.130">counsel</tei-w>' +
  '<tei-w xml:id="w.131" id="w.131">of</tei-w>' +
  '<tei-w xml:id="w.132" id="w.132">the</tei-w>' +
  '<tei-w xml:id="w.99990" id="w.99990">ungodly</tei-w><tei-pc xml:id="pc.1" id="pc.1">,' +
  '</tei-pc></tei-l>';

describe('enum and titleMap creationy', () => {
  it('creates the enum/titleMap for each possible entry of the mrwAnnos array', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    // manipulating the document as "innerHtml" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // document.getElementById('w.131').innerHtml = 'of';
    // document.getElementById('w.132').innerHtml = 'the';
    // document.getElementById('w.99990').innerHtml = 'ungodly';
    // document.getElementById('w.130').innerHtml = 'counsel';
    const mrwAnnos = [
      {
        id: '8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.131")'],
        color: '#000011',
      },
      {
        id: '8a988147-c1b4-4517-971e-c7a61de3e58d',
        svg: ['id("w.132")'],
        color: '#000012',
      },
      {
        id: '8a988147-c1b4-4517-971e-c7a61de3e58e',
        svg: ['id("w.99990")'],
        color: '#000013',
      },
      {
        id: '7a184eda-252c-4cbc-bb4d-11a8a4d921ec',
        svg: ['id("w.130")'],
        color: '#000014',
      },
    ];
    const result = getEnumAndTitleMap(mrwAnnos);
    const resultEnum = result[0];
    const resultTitleMap = result[1];
    expect(resultEnum).toStrictEqual([
      '8a988147-c1b4-4517-971e-c7a61de3e58f',
      '8a988147-c1b4-4517-971e-c7a61de3e58d',
      '8a988147-c1b4-4517-971e-c7a61de3e58e',
      '7a184eda-252c-4cbc-bb4d-11a8a4d921ec',
    ]);
    expect(resultTitleMap).toStrictEqual({
      '8a988147-c1b4-4517-971e-c7a61de3e58f': 'of | mrw (direct)',
      '8a988147-c1b4-4517-971e-c7a61de3e58d': 'the | mrw (indirect)',
      '8a988147-c1b4-4517-971e-c7a61de3e58e': 'ungodly | mrw (implicit)',
      '7a184eda-252c-4cbc-bb4d-11a8a4d921ec': 'counsel | mflag',
    });
  });
});

describe('array spreading', () => {
  it('spreads the mrwAnnos array', () => {
    const jsonObject = {
      mrws: ['8a988147-c1b4-4517-971e-c7a61de3e58f', '7a184eda-252c-4cbc-bb4d-11a8a4d921ec'],
    };
    const result = spreadMRWArray(jsonObject);

    expect(result).toStrictEqual({
      mrws0: '8a988147-c1b4-4517-971e-c7a61de3e58f',
      mrws1: '7a184eda-252c-4cbc-bb4d-11a8a4d921ec',
    });
  });
});

describe('get hex value of a "color"', () => {
  it('gets the hex value of a "color"', () => {
    const colorEnum = ['MRW_DIRECT', 'MRW_INDIRECT', 'MRW_IMPLICIT', 'MFLAG', 'METAPHOR', 'DEFAULT'];
    const result = colorEnum.map((entry) => getColorHexFromEnumEntry(entry));

    expect(result).toStrictEqual(['#000011', '#000012', '#000013', '#000014', '#000021', '#89f099']);
  });
});

describe('get name of a "color"', () => {
  it('gets the name of a "color"', () => {
    const colorEnum = ['MRW_DIRECT', 'MRW_INDIRECT', 'MRW_IMPLICIT', 'MFLAG', 'METAPHOR', 'DEFAULT'];
    const result = colorEnum.map((entry) => getColorNameFromEnumEntry(entry));

    expect(result).toStrictEqual(['mrw (direct)', 'mrw (indirect)', 'mrw (implicit)', 'mflag', 'metaphor', 'Default']);
  });
});
