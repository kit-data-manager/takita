import { checkIsNodeOnWorkspace, removeWhitespaceFromSelectionTextContent } from './textSelection';

const innerHtml =
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace" class="is-full-width">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '                        <tei-lg><tei-l><tei-w xml:id="w.121" id="w.121">Blessed</tei-w>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>';

describe('removing most whitespace (leading, trailing and whitespaces > 1) from the selection', () => {
  it('deals with leading whitespace', () => {
    const string = ' word';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('word');
  });

  it('deals with trailing whitespace', () => {
    const string = 'word ';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('word');
  });

  it('deals with duplicated (more than 1) whitespace', () => {
    const string = '      w            o     r' + '     \t\n\rd';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('w o r d');
  });
});

describe('checking if node is on workspace', () => {
  it('checks if a word on the worskapce returns true', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const node = document.getElementById('w.121');
    const result = checkIsNodeOnWorkspace(node);
    expect(result).toBe(true);
  });
  it('checks if a word not on the worskapce returns false', () => {
    // setup the document
    document.body.innerHTML = innerHtml;
    const node = document.getElementById('notOnWorkspace');
    const result = checkIsNodeOnWorkspace(node);
    expect(result).toBe(false);
  });
});
