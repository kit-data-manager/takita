import { createXPath, getNextSibling, getSubstringPosition } from './targetCreation';

// copied from the browser, don't touch this innerHtml
const innerHtmlSiblingTest =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-lg> <tei-l><tei-w xml:id="w.166" id="w.166">And</tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w> <tei-w xml:id="w.168" id="w.168">shall</tei-w> <tei-w xml:id="w.169" id="w.169">be</tei-w> <tei-w xml:id="w.170" id="w.170">like</tei-w> <tei-w xml:id="w.171" id="w.171">a</tei-w> <tei-w xml:id="w.172" id="w.172">tree</tei-w> <tei-w xml:id="w.173" id="w.173">planted</tei-w> <tei-w xml:id="w.174" id="w.174">by</tei-w> <tei-w xml:id="w.175" id="w.175">the</tei-w> <tei-w xml:id="w.176" id="w.176">rivers</tei-w> <tei-w xml:id="w.177" id="w.177">of</tei-w> <tei-w xml:id="w.178" id="w.178">water</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l> <tei-l><tei-w xml:id="w.179" id="w.179">that</tei-w> <tei-w xml:id="w.99993" id="w.99993">bringeth</tei-w> <tei-w xml:id="w.180" id="w.180">forth</tei-w> <tei-w xml:id="w.181" id="w.181">his</tei-w> <tei-w xml:id="w.182" id="w.182">fruit</tei-w> <tei-w xml:id="w.183" id="w.183">in</tei-w> <tei-w xml:id="w.184" id="w.184">his</tei-w> <tei-w xml:id="w.185" id="w.185">season</tei-w><tei-pc xml:id="pc.6" id="pc.6">;</tei-pc></tei-l> <tei-l><tei-w xml:id="w.186" id="w.186">his</tei-w> <tei-w xml:id="w.187" id="w.187">leaf</tei-w> <tei-w xml:id="w.188" id="w.188">also</tei-w> <tei-w xml:id="w.189" id="w.189">shall</tei-w> <tei-w xml:id="w.190" id="w.190">notwither</tei-w><tei-pc xml:id="pc.7" id="pc.7">;</tei-pc></tei-l> <tei-l><tei-w xml:id="w.191" id="w.191">and</tei-w> <tei-w xml:id="w.192" id="w.192">whatsoever</tei-w> <tei-w xml:id="w.193" id="w.193">he</tei-w> <tei-w xml:id="w.194" id="w.194">doeth</tei-w> <tei-w xml:id="w.195" id="w.195">shall</tei-w> <tei-w xml:id="w.196" id="w.196">prosper</tei-w><tei-pc xml:id="pc.8" id="pc.8">.</tei-pc></tei-l></tei-lg>';

// copied from the browser, don't touch this innerHtml
const innerHtml =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-l><tei-w xml:id="w.166" id="w.166">And</tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w> <tei-w xml:id="w.168" id="w.168">shall</tei-w> <tei-w xml:id="w.169" id="w.169">be</tei-w> <tei-w xml:id="w.170" id="w.170">like</tei-w> <tei-w xml:id="w.171" id="w.171">a</tei-w> <tei-w xml:id="w.172" id="w.172">tree</tei-w> <tei-w xml:id="w.173" id="w.173">planted</tei-w> <tei-w xml:id="w.174" id="w.174">by</tei-w> <tei-w xml:id="w.175" id="w.175">the</tei-w> <tei-w xml:id="w.176" id="w.176">rivers</tei-w> <tei-w xml:id="w.177" id="w.177">of</tei-w> <tei-w xml:id="w.178" id="w.178">water</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l>';

describe('getting next sibling', () => {
  it('gets the next sibling of a node where the next sibling is an element', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSiblingTest;
    const node = document.getElementById('w.178');
    const nextSibling = getNextSibling(node);
    expect(nextSibling.id).toBe('pc.5');
  });
  it('gets the next sibling of a node where the next sibling is a text', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSiblingTest;
    const node = document.getElementById('w.173');
    const nextSibling = getNextSibling(node);
    expect(nextSibling.nodeType).toBe(3);
  });
  it(
    'recursively gets the next sibling of a node where the next sibling is null, ' +
      'so the parentNodes next sibling will be used, which in turn has a text node as a nextSibling',
    () => {
      // setup the document
      document.body.innerHTML = innerHtmlSiblingTest;
      const node = document.getElementById('pc.5');
      const nextSibling = getNextSibling(node);
      expect(nextSibling.nodeType).toBe(3);
    },
  );
});

// doesnt work without manipulating the document, bc TypeError: Cannot read properties of undefined (reading 'length')
// in 195 |     substringPosition.end = document.getElementById(target.id).innerText.length;
describe('getting substring position of a word in a range', () => {
  it('gets the substring position of a word at the start of a range', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
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
    document.body.innerHTML = innerHtml;
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
    document.body.innerHTML = innerHtml;
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

describe('creating long xpaths', () => {
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
    document.getElementById('w.174').innerText = 'by';
    document.getElementById('w.175').innerText = 'the';
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe('concat(substring(id("w.174"), 2, 1), " ", id("w.175"), " ", substring(id("w.176"), 1, 5))');
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
    document.getElementById('w.170').innerText = 'like';
    document.getElementById('w.171').innerText = 'a';
    document.getElementById('w.172').innerText = 'tree';
    document.getElementById('w.174').innerText = 'by';
    document.getElementById('w.175').innerText = 'the';
    document.getElementById('w.176').innerText = 'rivers';

    const result = createXPath(mockTargetRangeList);
    expect(result).toBe(
      // eslint-disable-next-line @stylistic/js/max-len
      'concat(substring(id("w.170"), 3, 2), " ", id("w.171"), " ", id("w.172"), " ", id("w.174"), " ", id("w.175"), " ", id("w.176"), " ")',
    );
  });
});
