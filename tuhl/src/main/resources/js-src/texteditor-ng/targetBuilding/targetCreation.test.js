import { JSDOM } from 'jsdom';
import { createTargetList, createXPath } from './targetCreation';
// copied from the browser, don't touch this innerHtml
const innerHtmlCreationTest =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

// see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/61
const innerHtmlCreationTestWithLinebreaks =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">sta<teil-lb n="1" id="lb.1" xml:id="lb.1"/>ndeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">t<teil-lb n="2"/>he</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

// see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/166
const innerHtmlCreationTestWithChildren =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">sta<tei-supplied id="s.8" xml:id="s.8">m</tei-supplied>deth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

// copied from the browser, don't touch this innerHtml
const innerHtml =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-l><tei-w xml:id="w.166" id="w.166">And</tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w> <tei-w xml:id="w.168" id="w.168">shall</tei-w> <tei-w xml:id="w.169" id="w.169">be</tei-w> <tei-w xml:id="w.170" id="w.170">like</tei-w> <tei-w xml:id="w.171" id="w.171">a</tei-w> <tei-w xml:id="w.172" id="w.172">tree</tei-w> <tei-w xml:id="w.173" id="w.173">planted</tei-w> <tei-w xml:id="w.174" id="w.174">by</tei-w> <tei-w xml:id="w.175" id="w.175">the</tei-w><tei-w xml:id="w.176" id="w.176">rivers</tei-w> <tei-w xml:id="w.177" id="w.177">of</tei-w> <tei-w xml:id="w.178" id="w.178">water</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l>';

// Silence console.xxx() for the duration of these tests, so it does
// not spam our console
beforeEach(() => {
  console.error = jest.fn(() => {});
  console.log = jest.fn(() => {});
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('creating a list of targets', () => {
  describe('for standard html', () => {
    // setup the document
    let dom;
    beforeEach(() => {
      dom = new JSDOM(innerHtmlCreationTest);
      // using the "normal" document as well, because 'targetBuilding/utils/isSelectable' requires it to be set up
      document.body.innerHTML = innerHtmlCreationTest;
    });

    it('creates a list of targets for multiple selected words', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      range.setStart(dom.window.document.getElementById('w.133'), 0);
      range.setEnd(dom.window.document.getElementById('w.134').childNodes[0], 2);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(2);
      expect(result[0].targetList[0].id).toBe('w.133');
      expect(result[0].targetList[1].id).toBe('w.134');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(2);
    });

    it('creates a list of targets for multiple selected words, but one should not be selectable', () => {
      // adding the 'user-select: none' property to an element, so it should be excluded from the result.
      // outside the test-environment the element should not even be part of the selection object, but
      // webkit browsers still includes it in the selection object, so it has to be removed again.
      document.getElementById('w.133').style.setProperty('user-select', 'none');
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      range.setStart(dom.window.document.getElementById('w.133'), 0);
      range.setEnd(dom.window.document.getElementById('w.134').childNodes[0], 2);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(1);
      expect(result[0].targetList[0].id).toBe('w.134');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(2);
    });

    it('creates a list of targets, if only one word got selected', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      range.setStart(dom.window.document.getElementById('w.134').childNodes[0], 1);
      range.setEnd(dom.window.document.getElementById('w.134').childNodes[0], 4);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(1);
      expect(result[0].targetList[0].id).toBe('w.134');
      expect(result[0].startOffset).toBe(1);
      expect(result[0].endOffset).toBe(4);
    });

    it('creates a list of targets where the starting element is empty; 2 words in total', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      dom.window.document.getElementById('w.134').innerHTML = ' ';
      range.setStart(dom.window.document.getElementById('w.134'), 0);
      range.setEnd(dom.window.document.getElementById('w.135'), 1);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(1);
      expect(result[0].targetList[0].id).toBe('w.135');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(1);
    });

    it('creates a list of targets where the starting element is empty; 3 words in total', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      dom.window.document.getElementById('w.134').innerHTML = ' ';
      range.setStart(dom.window.document.getElementById('w.134'), 0);
      range.setEnd(dom.window.document.getElementById('w.136'), 1);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(2);
      expect(result[0].targetList[0].id).toBe('w.135');
      expect(result[0].targetList[1].id).toBe('w.136');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(1);
    });

    it('creates a list of targets where the ending element is empty; 2 words in total', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      dom.window.document.getElementById('w.134').innerHTML = ' ';
      range.setStart(dom.window.document.getElementById('w.133'), 0);
      range.setEnd(dom.window.document.getElementById('w.134'), 0);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(1);
      expect(result[0].targetList[0].id).toBe('w.133');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(0);
    });

    it('creates a list of targets where the ending element is empty; 3 words in total', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      dom.window.document.getElementById('w.135').innerHTML = ' ';
      range.setStart(dom.window.document.getElementById('w.133'), 0);
      range.setEnd(dom.window.document.getElementById('w.135'), 0);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(2);
      expect(result[0].targetList[0].id).toBe('w.133');
      expect(result[0].targetList[1].id).toBe('w.134');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(0);
    });

    it('creates a list of targets where the starting and ending element is empty; 3 words in total', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      dom.window.document.getElementById('w.133').innerHTML = ' ';
      dom.window.document.getElementById('w.135').innerHTML = ' ';
      range.setStart(dom.window.document.getElementById('w.133'), 0);
      range.setEnd(dom.window.document.getElementById('w.135'), 0);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(1);
      expect(result[0].targetList[0].id).toBe('w.134');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(0);
    });
  });

  describe('for html with linebreaks', () => {
    // setup the document
    let dom;
    beforeEach(() => {
      dom = new JSDOM(innerHtmlCreationTestWithLinebreaks);
      // using the "normal" document as well, because 'targetBuilding/utils/isSelectable' requires it to be set up
      document.body.innerHTML = innerHtmlCreationTestWithLinebreaks;
    });

    // see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/61
    it.skip('creates a list of targets with a linebreak with an id (lb/tei-lb) present in the selection', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      range.setStart(dom.window.document.getElementById('w.133'), 0);
      range.setEnd(dom.window.document.getElementById('w.135'), 1);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(3);
      expect(result[0].targetList[0].id).toBe('w.133');
      expect(result[0].targetList[1].id).toBe('w.134'); // as the function is not working as intended atm this is 'lb.1'
      expect(result[0].targetList[2].id).toBe('w.135');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(1);
    });

    // see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/61
    it.skip('creates a list of targets with a linebreak without an id (lb/tei-lb) present in the selection', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      range.setStart(dom.window.document.getElementById('w.135'), 0);
      range.setEnd(dom.window.document.getElementById('w.137'), 1);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(3); // as the function is not working as intended atm this is 2
      expect(result[0].targetList[0].id).toBe('w.135');
      expect(result[0].targetList[1].id).toBe('w.136'); // as the function is not working as intended atm this is 'w.137'
      expect(result[0].targetList[2].id).toBe('w.137'); // as the function is not working as intended atm this is 'undefined'
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(1);
    });
  });

  describe('for html with w-elements with children, that are not w-elements themself', () => {
    // setup the document
    let dom;
    beforeEach(() => {
      dom = new JSDOM(innerHtmlCreationTestWithChildren);
      // using the "normal" document as well, because 'targetBuilding/utils/isSelectable' requires it to be set up
      document.body.innerHTML = innerHtmlCreationTestWithChildren;
    });

    // see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/166
    it.skip('creates a list of targets with a word element having a non-word child element (supplied/tei-supplied) present in the selection', () => {
      const selection = dom.window.getSelection();
      const range = dom.window.document.createRange();
      range.setStart(dom.window.document.getElementById('w.133'), 0);
      range.setEnd(dom.window.document.getElementById('w.135'), 1);
      selection.addRange(range);
      const result = createTargetList(selection);
      expect(result.length).toBe(1);
      expect(result[0].targetList.length).toBe(3);
      expect(result[0].targetList[0].id).toBe('w.133');
      expect(result[0].targetList[1].id).toBe('w.134'); // as the function is not working as intended atm this is 's.8'
      expect(result[0].targetList[2].id).toBe('w.135');
      expect(result[0].startOffset).toBe(0);
      expect(result[0].endOffset).toBe(1);
    });
  });
});

describe('creating long xpaths', () => {
  it('creates an xPath including only one fully selected word (no substring); one range', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const mockTargetRangeList = [
      {
        targetList: [{ id: 'w.176', innerText: 'rivers' }],
        startOffset: 0,
        endOffset: 6,
      },
    ];
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // EDIT July 2024: Philipp didn't know how to use JSDOM properly. See above
    // tests for the usage of JSDOM. If there is some spare time, feel free to update this test
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe('id("w.176")');
  });

  it('creates an xPath including only one partly selected word (substring); one range', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const mockTargetRangeList = [
      {
        targetList: [{ id: 'w.176', innerText: 'iver' }],
        startOffset: 1,
        endOffset: 5,
      },
    ];
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // EDIT July 2024: Philipp didn't know how to use JSDOM properly. See above
    // tests for the usage of JSDOM. If there is some spare time, feel free to update this test
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe('substring(id("w.176"), 2, 4)');
  });

  it('creates an xPath including only fully selected words (no substrings); one range', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const mockTargetRangeList = [
      {
        targetList: [
          { id: 'w.174', innerText: 'by' },
          { id: 'w.175', innerText: 'the' },
          { id: 'w.176', innerText: 'rivers' },
        ],
        startOffset: 0,
        endOffset: 6,
      },
    ];
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // EDIT July 2024: Philipp didn't know how to use JSDOM properly. See above
    // tests for the usage of JSDOM. If there is some spare time, feel free to update this test
    document.getElementById('w.174').innerText = 'by';
    document.getElementById('w.175').innerText = 'the';
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe('id("w.174") | id("w.175") | id("w.176")');
  });

  it('creates an xPath including partly selected words (substrings); one range', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const mockTargetRangeList = [
      {
        targetList: [
          { id: 'w.174', innerText: 'y' },
          { id: 'w.175', innerText: 'the' },
          { id: 'w.176', innerText: 'river' },
        ],
        startOffset: 1,
        endOffset: 5,
      },
    ];
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // EDIT July 2024: Philipp didn't know how to use JSDOM properly. See above
    // tests for the usage of JSDOM. If there is some spare time, feel free to update this test
    document.getElementById('w.174').innerText = 'by';
    document.getElementById('w.175').innerText = 'the';
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe('concat(substring(id("w.174"), 2, 1), " ", id("w.175"), substring(id("w.176"), 1, 5))');
  });

  it('creates an xPath including only fully selected words (no substrings); n ranges', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const mockTargetRangeList = [
      {
        targetList: [
          { id: 'w.170', innerText: 'like' },
          { id: 'w.171', innerText: 'a' },
          { id: 'w.172', innerText: 'tree' },
        ],
        startOffset: 0,
        endOffset: 4,
      },

      {
        targetList: [
          { id: 'w.174', innerText: 'by' },
          { id: 'w.175', innerText: 'the' },
          { id: 'w.176', innerText: 'rivers' },
        ],
        startOffset: 0,
        endOffset: 6,
      },
    ];
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // EDIT July 2024: Philipp didn't know how to use JSDOM properly. See above
    // tests for the usage of JSDOM. If there is some spare time, feel free to update this test
    document.getElementById('w.170').innerText = 'like';
    document.getElementById('w.171').innerText = 'a';
    document.getElementById('w.172').innerText = 'tree';
    document.getElementById('w.174').innerText = 'by';
    document.getElementById('w.175').innerText = 'the';
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe('id("w.170") | id("w.171") | id("w.172") | id("w.174") | id("w.175") | id("w.176")');
  });

  it('creates an xPath including partly selected words (substrings); n ranges', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const mockTargetRangeList = [
      {
        targetList: [
          { id: 'w.170', innerText: 'ke' },
          { id: 'w.171', innerText: 'a' },
          { id: 'w.172', innerText: 'tree' },
        ],
        startOffset: 2,
        endOffset: 4,
      },

      {
        targetList: [
          { id: 'w.174', innerText: 'by' },
          { id: 'w.175', innerText: 'the' },
          { id: 'w.176', innerText: 'rivers' },
        ],
        startOffset: 0,
        endOffset: 6,
      },
    ];
    // manipulating the document as "innerText" is not avialable in jest
    // somewhere it was suggested to use puppeteer
    // EDIT July 2024: Philipp didn't know how to use JSDOM properly. See above
    // tests for the usage of JSDOM. If there is some spare time, feel free to update this test
    document.getElementById('w.170').innerText = 'like';
    document.getElementById('w.171').innerText = 'a';
    document.getElementById('w.172').innerText = 'tree';
    document.getElementById('w.174').innerText = 'by';
    document.getElementById('w.175').innerText = 'the';
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe(
      // eslint-disable-next-line @stylistic/js/max-len
      'concat(substring(id("w.170"), 3, 2), " ", id("w.171"), " ", id("w.172"), " ", id("w.174"), " ", id("w.175"), id("w.176"))',
    );
  });
});
