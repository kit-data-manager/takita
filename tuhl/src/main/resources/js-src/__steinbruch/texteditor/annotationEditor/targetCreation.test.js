import {
  getSmallestNodesWithXmlIds,
  createTargetList,
  createXPath,
  getNextSibling,
  getSubstringPosition,
} from './targetCreation';

// copied from the browser, don't touch this innerHtml
const innerHtmlSiblingTest =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-lg> <tei-l><tei-w xml:id="w.166" id="w.166">And</tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w> <tei-w xml:id="w.168" id="w.168">shall</tei-w> <tei-w xml:id="w.169" id="w.169">be</tei-w> <tei-w xml:id="w.170" id="w.170">like</tei-w> <tei-w xml:id="w.171" id="w.171">a</tei-w> <tei-w xml:id="w.172" id="w.172">tree</tei-w> <tei-w xml:id="w.173" id="w.173">planted</tei-w> <tei-w xml:id="w.174" id="w.174">by</tei-w> <tei-w xml:id="w.175" id="w.175">the</tei-w> <tei-w xml:id="w.176" id="w.176">rivers</tei-w> <tei-w xml:id="w.177" id="w.177">of</tei-w> <tei-w xml:id="w.178" id="w.178">water</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l> <tei-l><tei-w xml:id="w.179" id="w.179">that</tei-w> <tei-w xml:id="w.99993" id="w.99993">bringeth</tei-w> <tei-w xml:id="w.180" id="w.180">forth</tei-w> <tei-w xml:id="w.181" id="w.181">his</tei-w> <tei-w xml:id="w.182" id="w.182">fruit</tei-w> <tei-w xml:id="w.183" id="w.183">in</tei-w> <tei-w xml:id="w.184" id="w.184">his</tei-w> <tei-w xml:id="w.185" id="w.185">season</tei-w><tei-pc xml:id="pc.6" id="pc.6">;</tei-pc></tei-l> <tei-l><tei-w xml:id="w.186" id="w.186">his</tei-w> <tei-w xml:id="w.187" id="w.187">leaf</tei-w> <tei-w xml:id="w.188" id="w.188">also</tei-w> <tei-w xml:id="w.189" id="w.189">shall</tei-w> <tei-w xml:id="w.190" id="w.190">notwither</tei-w><tei-pc xml:id="pc.7" id="pc.7">;</tei-pc></tei-l> <tei-l><tei-w xml:id="w.191" id="w.191">and</tei-w> <tei-w xml:id="w.192" id="w.192">whatsoever</tei-w> <tei-w xml:id="w.193" id="w.193">he</tei-w> <tei-w xml:id="w.194" id="w.194">doeth</tei-w> <tei-w xml:id="w.195" id="w.195">shall</tei-w> <tei-w xml:id="w.196" id="w.196">prosper</tei-w><tei-pc xml:id="pc.8" id="pc.8">.</tei-pc></tei-l></tei-lg>';

describe('getting next sibling', () => {
  it('gets the next sibling of a node where the next sibling is an element', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSiblingTest;
    const $node = document.getElementById('w.178');
    const $nextSibling = getNextSibling($node);
    expect($nextSibling.id).toBe('pc.5');
  });
  it('gets the next sibling of a node where the next sibling is a text', () => {
    // setup the document
    document.body.innerHTML = innerHtmlSiblingTest;
    const $node = document.getElementById('w.173');
    const $nextSibling = getNextSibling($node);
    expect($nextSibling.nodeType).toBe(3);
  });
  it(
    'recursively gets the next sibling of a node where the next sibling is null, ' +
      'so the parentNodes next sibling will be used, which in turn has a text node as a nextSibling',
    () => {
      // setup the document
      document.body.innerHTML = innerHtmlSiblingTest;
      const $node = document.getElementById('pc.5');
      const $nextSibling = getNextSibling($node);
      expect($nextSibling.nodeType).toBe(3);
    },
  );
});

function getSelection(type) {
  const selection = window.getSelection();
  // if (type === 'default') {
  //   const range = new Range();
  //   range.setStart(document.getElementById('w.133'), 0);
  //   range.setEnd(document.getElementById('w.134').childNodes[0], 2);

  //   selection.addRange(range);
  // }

  if (type === 'empty word end') {
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.134'), 0);

    selection.addRange(range);
  }
  return selection;
}

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

// see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/61
const innerHtmlCreationTestWithLinebreaks =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace" class="is-full-width">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">sta<teil-lb n="1" id="lb.1" xml:id="lb.1"/>ndeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">t<teil-lb n="2"/>he</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

// see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/166
const innerHtmlCreationTestWithChildren =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace" class="is-full-width">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">sta<tei-supplied id="s.8" xml:id="s.8">m</tei-supplied>deth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

// describe.only('1creating a list of targets', () => {
//   afterEach(() => {
//     document.body.innerHTML = '';
//   });
//   it('creates a list of targets for a standard case', () => {
//     // setup the document
//     console.log('stan');
//     document.body.innerHTML = innerHtmlCreationTest;
//     console.log('1st inner ', document.body.innerHTML);
//     const selection = getSelection('default');
//     const result = createTargetList(selection);
//     console.log('1result ', result);
//     console.log('1result[0] ', result[0]);
//     console.log('1result[0].targetList[0] ', result[0].targetList[0]);
//     console.log('1result[0].targetList[0] ', result[0].targetList[1]);
//     expect(result.length).toBe(1);
//     expect(result[0].targetList.length).toBe(2);
//     expect(result[0].targetList[0].id).toBe('w.133');
//     expect(result[0].targetList[1].id).toBe('w.134');
//     expect(result[0].startOffset).toBe(0);
//     expect(result[0].endOffset).toBe(2);
//   });
// });

// @HENNING
describe.only('creating a list of targets', () => {
  // afterEach(() => {
  //   document.body.innerHTML = '';
  // });
  // WORKS
  // it('creates a list of targets for a standard case', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTest;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   range.setStart(document.getElementById('w.133'), 0);
  //   range.setEnd(document.getElementById('w.134').childNodes[0], 2);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(2);
  //   expect(result[0].targetList[0].id).toBe('w.133');
  //   expect(result[0].targetList[1].id).toBe('w.134');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(2);
  // });
  // WORKS
  // it('creates a list of targets, if only one word got selected', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTest;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   range.setStart(document.getElementById('w.134').childNodes[0], 1);
  //   range.setEnd(document.getElementById('w.134').childNodes[0], 4);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   console.log('2result ', result);
  //   console.log('2result[0] ', result[0]);
  //   console.log('2result[0].targetList[0] ', result[0].targetList[0]);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(1);
  //   expect(result[0].targetList[0].id).toBe('w.134');
  //   expect(result[0].startOffset).toBe(1);
  //   expect(result[0].endOffset).toBe(4);
  // });
  // WORKS
  // it('creates a list of targets where the starting element is empty; 2 words in total', () => {
  //   // setup the document
  //   console.log('start miss');
  //   document.body.innerHTML = innerHtmlCreationTest;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   document.getElementById('w.134').innerHTML = ' ';
  //   range.setStart(document.getElementById('w.134'), 0);
  //   range.setEnd(document.getElementById('w.135'), 1);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   // console.log('result ', result);
  //   // console.log('result[0] ', result[0]);
  //   // console.log('result[0].targetList[0] ', result[0].targetList[0]);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(1);
  //   expect(result[0].targetList[0].id).toBe('w.135');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(1);
  // });
  // WORKS
  // it('creates a list of targets where the starting element is empty; 3 words in total', () => {
  //   // setup the document
  //   console.log('start miss');
  //   document.body.innerHTML = innerHtmlCreationTest;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   document.getElementById('w.134').innerHTML = ' ';
  //   range.setStart(document.getElementById('w.134'), 0);
  //   range.setEnd(document.getElementById('w.136'), 1);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   // console.log('result ', result);
  //   // console.log('result[0] ', result[0]);
  //   // console.log('result[0].targetList[0] ', result[0].targetList[0]);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(2);
  //   expect(result[0].targetList[0].id).toBe('w.135');
  //   expect(result[0].targetList[1].id).toBe('w.136');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(1);
  // });
  // WORKS
  // it('creates a list of targets where the ending element is empty; 2 words in total', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTest;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   document.getElementById('w.134').innerHTML = ' ';
  //   range.setStart(document.getElementById('w.133'), 0);
  //   range.setEnd(document.getElementById('w.134'), 0);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(1);
  //   expect(result[0].targetList[0].id).toBe('w.133');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(0);
  // });
  // WORKS
  // it('creates a list of targets where the ending element is empty; 3 words in total', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTest;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   document.getElementById('w.135').innerHTML = ' ';
  //   range.setStart(document.getElementById('w.133'), 0);
  //   range.setEnd(document.getElementById('w.135'), 0);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(2);
  //   expect(result[0].targetList[0].id).toBe('w.133');
  //   expect(result[0].targetList[1].id).toBe('w.134');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(0);
  // });
  // WORKS
  // it('creates a list of targets where the starting and ending element is empty; 3 words in total', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTest;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   document.getElementById('w.133').innerHTML = ' ';
  //   document.getElementById('w.135').innerHTML = ' ';
  //   range.setStart(document.getElementById('w.133'), 0);
  //   range.setEnd(document.getElementById('w.135'), 0);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(1);
  //   expect(result[0].targetList[0].id).toBe('w.134');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(0);
  // });
  // see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/61
  // it('creates a list of targets with a linebreak with an id (lb/tei-lb) present in the selection', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTestWithLinebreaks;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   range.setStart(document.getElementById('w.133'), 0);
  //   range.setEnd(document.getElementById('w.135'), 1);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   console.log(result[0].targetList[0].id);
  //   console.log(result[0].targetList[1].id);
  //   console.log(result[0].targetList[2].id);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(3);
  //   expect(result[0].targetList[0].id).toBe('w.133');
  //   expect(result[0].targetList[1].id).toBe('w.134'); // as the function is not working as intended atm this is 'lb.1'
  //   expect(result[0].targetList[2].id).toBe('w.135');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(1);
  // });
  // see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/61
  // it('creates a list of targets with a linebreak without an id (lb/tei-lb) present in the selection', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTestWithLinebreaks;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   range.setStart(document.getElementById('w.135'), 0);
  //   range.setEnd(document.getElementById('w.137'), 1);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   console.log(result[0].targetList[0].id);
  //   console.log(result[0].targetList[1].id);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(3); // as the function is not working as intended atm this is 2
  //   expect(result[0].targetList[0].id).toBe('w.135');
  //   expect(result[0].targetList[1].id).toBe('w.136'); // as the function is not working as intended atm this is 'w.137'
  //   expect(result[0].targetList[2].id).toBe('w.137'); // as the function is not working as intended atm this is 'undefined'
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(1);
  // });
  // see https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/166
  // it('creates a list of targets with a word element having a non-word child element (supplied/tei-supplied) present in the selection', () => {
  //   // setup the document
  //   document.body.innerHTML = innerHtmlCreationTestWithChildren;
  //   const selection = window.getSelection();
  //   const range = new Range();
  //   range.setStart(document.getElementById('w.133'), 0);
  //   range.setEnd(document.getElementById('w.135'), 1);
  //   selection.addRange(range);
  //   const result = createTargetList(selection);
  //   console.log(result[0].targetList[0].id);
  //   console.log(result[0].targetList[1].id);
  //   expect(result.length).toBe(1);
  //   expect(result[0].targetList.length).toBe(3);
  //   expect(result[0].targetList[0].id).toBe('w.133');
  //   expect(result[0].targetList[1].id).toBe('w.134'); // as the function is not working as intended atm this is 's.8'
  //   expect(result[0].targetList[2].id).toBe('w.135');
  //   expect(result[0].startOffset).toBe(0);
  //   expect(result[0].endOffset).toBe(1);
  // });
});
// 133-135 with id
// 135-137 w/o id
// <tei-w id="w.133">nor</tei-w> <tei-w id="w.134">sta<teil-lb n="1" id="lb.1"/>ndeth</tei-w>
// <tei-w id="w.135">in</tei-w> <tei-w id="w.136">t<teil-lb n="2"/>he</tei-w>
// <tei-w id="w.137">way</tei-w>

// copy of innerHtml, but modified to resemble a more nested structure like in the Hebrew files of B03
const innerHtmlSmallestNodeTest =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-l id="test"><tei-w id="w.166a_166b"><tei-w id="w.166a">An</tei-w><tei-w id="w.166b">d</tei-w></tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l>';

describe('getting smallest nodes, which have an id', () => {
  it(
    'gets the smallest nodes, which have an id, by getting the' +
      'children of a node until there are no children anymore',
    () => {
      // setup the document
      document.body.innerHTML = innerHtmlSmallestNodeTest;
      const $node = document.getElementById('test');
      let nodeList = [];
      getSmallestNodesWithXmlIds($node, nodeList);
      // extarcting the ids of the nodes, to check if all the relevant nodes are included
      const result = nodeList.map((node) => node.id);
      expect(result).toStrictEqual(['w.166a', 'w.166b', 'w.167', 'pc.5']);
    },
  );
});

// copied from the browser, don't touch this innerHtml
const innerHtml =
  // eslint-disable-next-line @stylistic/js/max-len
  '<tei-l><tei-w xml:id="w.166" id="w.166">And</tei-w> <tei-w xml:id="w.167" id="w.167">he</tei-w> <tei-w xml:id="w.168" id="w.168">shall</tei-w> <tei-w xml:id="w.169" id="w.169">be</tei-w> <tei-w xml:id="w.170" id="w.170">like</tei-w> <tei-w xml:id="w.171" id="w.171">a</tei-w> <tei-w xml:id="w.172" id="w.172">tree</tei-w> <tei-w xml:id="w.173" id="w.173">planted</tei-w> <tei-w xml:id="w.174" id="w.174">by</tei-w> <tei-w xml:id="w.175" id="w.175">the</tei-w> <tei-w xml:id="w.176" id="w.176">rivers</tei-w> <tei-w xml:id="w.177" id="w.177">of</tei-w> <tei-w xml:id="w.178" id="w.178">water</tei-w><tei-pc xml:id="pc.5" id="pc.5">,</tei-pc></tei-l>';

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
