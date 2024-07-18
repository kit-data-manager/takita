import {
  assignPurpose,
  findSelectedMRWAnnos,
  getEnumAndTitleMap,
  getSelectMRWButton,
  makeAnnotationData,
  makeBodiesData,
  makeBodyData,
  preselectAllMRWAnnos,
  spreadMRWArray,
  toggleCheckedInputs,
} from './utils';

describe('preparing data for the annotation during annotation creation', () => {
  window.CURRENTPAGEID = 'pageId';
  it('prepares the data for a mrw annotation', () => {
    document.body.innerHTML = `<div id="createAnnotationForm" title='id("w.156")'></div>`;
    const input = {
      selectedText: 'LORD',
      classification: 'mrw (direct)',
      color: '#000011',
    };
    const result = makeAnnotationData(JSON.stringify(input));
    expect(result).toStrictEqual({
      pageId: 'pageId',
      color: '#000011',
      motivation: 'describing',
      bodies: [
        {
          purpose: 'describing',
          value: 'LORD',
        },
        {
          purpose: 'classifying',
          value: 'mrw (direct)',
        },
      ],
      svgCode: 'id("w.156")',
    });
  });

  it('prepares the data for a metaphor annotation', () => {
    document.body.innerHTML = `<div id="createAnnotationForm" title='id("w.147") | id("w.148") | id("w.149") | id("w.150") | id("w.151") | id("w.152") | id("w.153") | id("w.154") | id("w.155") | id("w.156")'></div>`;
    const input = {
      selectedText: 'But his delight [is] in the law of the LORD',
      classification: 'metaphor',
      mrws: ['d7cc3b99-4dc2-4a5d-8588-988e2052b05d'],
      label: 'Book_of_Psalms1721298363668',
      comment: 'Test',
      color: '#000021',
    };
    const result = makeAnnotationData(JSON.stringify(input));
    expect(result).toStrictEqual({
      pageId: 'pageId',
      color: '#000021',
      motivation: 'describing',
      bodies: [
        {
          purpose: 'describing',
          value: 'But his delight [is] in the law of the LORD',
        },
        {
          purpose: 'classifying',
          value: 'metaphor',
        },
        {
          purpose: 'identifying',
          value: 'Book_of_Psalms1721298363668',
        },
        {
          purpose: 'commenting',
          value: 'Test',
        },
        {
          purpose: 'linking',
          value: 'd7cc3b99-4dc2-4a5d-8588-988e2052b05d',
        },
      ],
      svgCode:
        'id("w.147") | id("w.148") | id("w.149") | id("w.150") | id("w.151") | id("w.152") | id("w.153") | id("w.154") | id("w.155") | id("w.156")',
    });
  });
});

describe('preparing data for all bodies during annotation creation', () => {
  it('prepares the data for all bodies', () => {
    const input = {
      selectedText: 'of the ungodly',
      classification: 'metaphor',
      label: 'Book_of_Psalms1715325572436',
      color: '#000021',
      mrws0: 'https://example.org/wap/0da130fd',
    };
    const result = makeBodiesData(input);
    expect(result).toStrictEqual([
      { purpose: 'describing', value: 'of the ungodly' },
      { purpose: 'classifying', value: 'metaphor' },
      { purpose: 'identifying', value: 'Book_of_Psalms1715325572436' },
      { purpose: 'linking', value: 'https://example.org/wap/0da130fd' },
    ]);
  });
});

describe('preparing data for one body during annotation creation', () => {
  it('prepares the data for one body', () => {
    const result = makeBodyData('classification', 'metaphor');
    expect(result).toStrictEqual({ purpose: 'classifying', value: 'metaphor' });
  });
});

describe('returning string based on given string to assign a purpose to a body', () => {
  it('returns the poper purpose', () => {
    const types = ['default', 'selectedText', 'mrws0', 'mrws1', 'label', 'comment', 'classification'];
    const result = types.map((type) => {
      return assignPurpose(type);
    });
    expect(result).toStrictEqual([
      'classifying',
      'describing',
      'linking',
      'linking',
      'identifying',
      'commenting',
      'classifying',
    ]);
  });
});

describe('toggling the checked state of input elements', () => {
  it('checks all inputs as the first one is unchecked', () => {
    document.body.innerHTML = `<input><input>`;
    const $inputs = document.querySelectorAll('input');
    toggleCheckedInputs($inputs);
    expect($inputs[0].checked).toBe(true);
    expect($inputs[1].checked).toBe(true);
  });

  it('unchecks all inputs as the first one is checked', () => {
    document.body.innerHTML = `<input checked><input>`;
    const $inputs = document.querySelectorAll('input');
    toggleCheckedInputs($inputs);
    expect($inputs[0].checked).toBe(false);
    expect($inputs[1].checked).toBe(false);
  });
});

describe('toggling the checked state of input elements', () => {
  it('checks all inputs as the first one is unchecked', () => {
    const button = getSelectMRWButton([0]);
    expect(button.type).toStrictEqual('button');
    expect(button.htmlClass).toStrictEqual('is-hidden');
  });

  it('unchecks all inputs as the first one is checked', () => {
    const button = getSelectMRWButton([0, 1]);
    expect(button.type).toStrictEqual('button');
    expect(button.htmlClass).toBe(undefined);
  });
});

describe('getting ids, type of the annotation and selected text of mrw annotations', () => {
  it('gets ids, type of the annotation and selected text of mrw annotations', () => {
    document.body.innerHTML = `<tei-l data-origname="l">
                    <tei-w xml:id="w.147" id="w.147">But</tei-w>
                    <tei-w xml:id="w.148" id="w.148">his</tei-w>
                    <tei-w xml:id="w.149" id="w.149" class="whitespaceAfter selected underline backgroundOne">delight</tei-w>
                    <tei-w xml:id="w.150" id="w.150" class="whitespaceAfter underline">[is]</tei-w>
                    <tei-w xml:id="w.151" id="w.151" class="whitespaceAfter backgroundOne underline">in</tei-w>
                    <tei-w xml:id="w.152" id="w.152" class="whitespaceAfter backgroundOne underline">the</tei-w>
                    <tei-w xml:id="w.153" id="w.153" class="underline">law</tei-w>
                    <tei-w xml:id="w.154" id="w.154">of</tei-w>
                    <tei-w xml:id="w.155" id="w.155">the</tei-w>
                    <tei-w xml:id="w.156" id="w.156">LORD</tei-w><tei-pc xml:id="pc.3" id="pc.3" data-origname="pc" data-origatts="xml:id">;</tei-pc></tei-l>`;
    const annos = [
      {
        id: '4',
        svg: ['id("w.151")', 'substring(id("w.152"),  1,  2)'],
        color: '#000011',
      },
      {
        id: 'd',
        svg: ['id("w.149")'],
        color: '#000012',
      },
    ];
    const ids = ['4', 'd'];
    const titleMap = {
      4: 'in the | mrw (direct)',
      d: 'delight | mrw (indirect)',
    };
    const [resultIds, resultTitleMap] = getEnumAndTitleMap(annos);
    expect(resultIds).toStrictEqual(ids);
    expect(resultTitleMap).toStrictEqual(titleMap);
  });
});

describe('turning an array into multiple objects', () => {
  it('turns an array into multiple objects', () => {
    const result = spreadMRWArray({
      mrws: ['4', 'd'],
    });
    expect(result).toStrictEqual({
      mrws0: '4',
      mrws1: 'd',
    });
  });
});

describe('toggling the checked state of input elements', () => {
  it('checks all inputs', () => {
    document.body.innerHTML = `<input><input>`;
    const $inputs = document.querySelectorAll('input');
    preselectAllMRWAnnos([1, 2], 'METAPHOR', $inputs);
    expect($inputs[0].checked).toBe(true);
    expect($inputs[1].checked).toBe(true);
  });

  it('does not check all inputs as the wrong annotation type is passed', () => {
    document.body.innerHTML = `<input><input>`;
    const $inputs = document.querySelectorAll('input');
    preselectAllMRWAnnos([1, 2], 'MRW', $inputs);
    expect($inputs[0].checked).toBe(false);
    expect($inputs[1].checked).toBe(false);
  });

  it('does not check all inputs as they are not present', () => {
    document.body.innerHTML = `<input><input>`;
    const $inputs = document.querySelectorAll('input');
    preselectAllMRWAnnos([1, 2], 'METAPHOR', document.querySelectorAll('div'));
    expect($inputs[0].checked).toBe(false);
    expect($inputs[1].checked).toBe(false);
  });
});

describe('finding all mrw annotations present in a selection', () => {
  it('finds all mrw annotations present in a selection', () => {
    const annoJson = [
      {
        id: '8a988147-c1b4-4517-971e-c7a61de3e58f',
        svg: ['id("w.131")'],
        color: '#000011',
      },
      {
        id: '8b25edde-bb01-430b-ba6f-4699c585343b',
        svg: [
          'id("w.126")',
          'id("w.127")',
          'id("w.128")',
          'id("w.129")',
          'id("w.130")',
          'id("w.131")',
          'id("w.132")',
          'id("w.99990")',
        ],
        color: '#000021',
      },
      {
        id: '7a184eda-252c-4cbc-bb4d-11a8a4d921ec',
        svg: ['id("w.129")', 'substring(id("w.130"),  1,  4)'],
        color: '#000014',
      },
      {
        id: '49601eb6-724f-45cb-a743-dcfe77181e14',
        svg: ['id("w.151")', 'substring(id("w.152"),  1,  2)'],
        color: '#000011',
      },
      {
        id: 'c4316923-7f25-4d36-adb6-7831255c6d6b',
        svg: ['id("w.133")', 'substring(id("w.134"),  1,  2)'],
        color: '#000011',
      },

      {
        id: 'd57d100a-5e66-40cb-b496-9925ae75116c',
        svg: ['id("w.163")'],
        color: '#ff8d00',
      },
      {
        id: 'd7cc3b99-4dc2-4a5d-8588-988e2052b05d',
        svg: ['id("w.149")'],
        color: '#000011',
      },
      {
        id: 'fe07bbea-cf80-4601-bb25-1fb15a83dbcf',
        svg: [
          'id("w.147")',
          'id("w.148")',
          'id("w.149")',
          'id("w.150")',
          'id("w.151")',
          'id("w.152")',
          'id("w.153")',
          'id("w.154")',
        ],
        color: '#000021',
      },
    ];
    const targetList = [
      { id: 'w.148' },
      { id: 'w.149' },
      { id: 'w.150' },
      { id: 'w.151' },
      { id: 'w.152' },
      { id: 'w.153' },
      { id: 'w.154' },
      { id: 'w.155' },
    ];
    const result = findSelectedMRWAnnos(annoJson, targetList);
    expect(result).toStrictEqual([
      {
        id: '49601eb6-724f-45cb-a743-dcfe77181e14',
        svg: ['id("w.151")', 'substring(id("w.152"),  1,  2)'],
        color: '#000011',
      },
      {
        id: 'd7cc3b99-4dc2-4a5d-8588-988e2052b05d',
        svg: ['id("w.149")'],
        color: '#000011',
      },
    ]);
  });
});
