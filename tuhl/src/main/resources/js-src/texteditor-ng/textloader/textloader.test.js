import { prepareTEIDocument, getTextLanguage, applyStyles, appendTEIDocument } from './textloader';

const innerHTMLSanskrit =
  '<div id="TEI"><tei-text xml:lang="sa-Latn" lang="sa-Latn" type="book" data-xmlns="http://www.tei-c.org/ns/1.0">' +
  '<tei-body n="Viṣṇupurāṇa" xml:id="b.400" id="b.400">' +
  '   <tei-div type="kāṇḍa" n="ViPur, 5">' +
  '        <tei-div type="chapter" n="1" xml:id="c.8520" id="c.8520">' +
  '            <tei-lg n="19">' +
  '                <tei-l xml:id="l.501102" id="l.501102"><tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292523.s" id="w.4292523.s">sa</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292523" id="w.4292523">saḥ</tei-w> </tei-reg></tei-choice> <tei-w xml:id="w.4292524" id="w.4292524">dadarśa</tei-w> <tei-w xml:id="w.4292525" id="w.4292525">tadā</tei-w> <tei-w xml:id="w.4292526" id="w.4292526">tatra</tei-w> <tei-w xml:id="w.4292737" id="w.4292737">kṛṣṇam</tei-w> <tei-w xml:id="w.4292755" id="w.4292755">ādohane</tei-w> <tei-w xml:id="w.4292527" id="w.4292527">gavām</tei-w> </tei-l>' +
  '                <tei-l xml:id="l.501103" id="l.501103"><tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292528_4292529_4292530.s" id="w.4292528_4292529_4292530.s">vatsamadhyagataṃ</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292528" id="w.4292528" class="">vatsa</tei-w><tei-w xml:id="w.4292529" id="w.4292529" class="">madhya</tei-w><tei-w xml:id="w.4292530" id="w.4292530">gatam</tei-w> </tei-reg></tei-choice> <tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292531_4292532_4292533_4292534.s" id="w.4292531_4292532_4292533_4292534.s">phullanīlotpaladalacchavim</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292531" id="w.4292531" class="mrw metaphor whitespaceAfter ">phulla</tei-w><tei-w xml:id="w.4292532" id="w.4292532" class="mrw metaphor whitespaceAfter ">nīlotpala</tei-w><tei-w xml:id="w.4292533" id="w.4292533" class="mrw metaphor whitespaceAfter ">dala</tei-w><tei-w xml:id="w.4292534" id="w.4292534" class="mrw metaphor">chavim</tei-w> </tei-reg></tei-choice> </tei-l>' +
  '            </tei-lg></tei-div></tei-div></tei-body></tei-text></div>';

const innerHTMLHebrew =
  '<div id="TEI" dir="rtl"><tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="hbo" lang="hbo" type="book">' +
  '<tei-body n="Psalmi" xml:id="b.426617" id="b.426617">' +
  '   <tei-div type="chapter" n="1" xml:id="c.427197" id="c.427197">' +
  '      <tei-ab type="verse" n="1" xml:id="v.1429538" id="v.1429538"><tei-choice data-origname="choice"><tei-orig><tei-w xml:id="w.310653_310654_310655" id="w.310653_310654_310655"><tei-w xml:id="w.310653" id="w.310653">אַ֥שְֽׁרֵי</tei-w><tei-pc xml:id="pc.47746" id="pc.47746">־</tei-pc><tei-w xml:id="w.310654" id="w.310654">הָ</tei-w><tei-w xml:id="w.310655" id="w.310655">אִ֗ישׁ</tei-w></tei-w></tei-orig> <tei-reg class="zeroOpacity"></tei-reg></tei-choice><tei-pc id="pc.1" xml:id="pc.1">׀</pc></tei-ab></tei-div></tei-body></tei-text></div>';

describe('appending custom html to an element', () => {
  it('appends simple xml transformed into custom html to an element', () => {
    // setup the document
    document.body.innerHTML = '<div id="TEI"></div>';
    const xmlString = `
          <text xml:lang="hbo" xmlns="http://www.tei-c.org/ns/1.0">
            <body n="Psalms" xml:id="b.426591">
              <div type="chapter" n="1" xml:id="c.426630">
                <lg><l><w xml:id="w.121">Blessed</w> <w xml:id="w.122">[is]</w> <w xml:id="w.123">the</w> <w xml:id="w.124">man</w> <w xml:id="w.125">that</w> <w xml:id="w.126">walketh</w><pc xml:id="pc.1">,</pc></l>
                    <l><w xml:id="w.133">nor</w> <w xml:id="w.134">standeth</w><pc xml:id="pc.2">.</pc></l></lg>
              </div>
            </body>
          </text>
        `;
    const $TEI = document.getElementById('TEI');
    appendTEIDocument(xmlString, $TEI, {});
    const result = `
        <tei-text xml:lang="hbo" lang="hbo" data-xmlns="http://www.tei-c.org/ns/1.0" data-origname="text" data-origatts="xml:lang xmlns" dir="rtl">
                    <tei-body n="Psalms" xml:id="b.426591" id="b.426591" data-origname="body" data-origatts="n xml:id">
                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630" data-origname="div" data-origatts="type n xml:id">
                        <tei-lg data-origname="lg"><tei-l data-origname="l"><tei-w xml:id="w.121" id="w.121" data-origname="w" data-origatts="xml:id">Blessed</tei-w> <tei-w xml:id="w.122" id="w.122" data-origname="w" data-origatts="xml:id">[is]</tei-w> <tei-w xml:id="w.123" id="w.123" data-origname="w" data-origatts="xml:id">the</tei-w> <tei-w xml:id="w.124" id="w.124" data-origname="w" data-origatts="xml:id">man</tei-w> <tei-w xml:id="w.125" id="w.125" data-origname="w" data-origatts="xml:id">that</tei-w> <tei-w xml:id="w.126" id="w.126" data-origname="w" data-origatts="xml:id">walketh</tei-w><tei-pc xml:id="pc.1" id="pc.1" data-origname="pc" data-origatts="xml:id">,</tei-pc></tei-l>
                            <tei-l data-origname="l"><tei-w xml:id="w.133" id="w.133" data-origname="w" data-origatts="xml:id">nor</tei-w> <tei-w xml:id="w.134" id="w.134" data-origname="w" data-origatts="xml:id">standeth</tei-w><tei-pc xml:id="pc.2" id="pc.2" data-origname="pc" data-origatts="xml:id">.</tei-pc></tei-l></tei-lg>
                    </tei-div>
                    </tei-body>
                </tei-text>`;
    // removing all whitespace from the compared strings as the result will have leading tabs
    expect($TEI.innerHTML.replace(/\s/g, '')).toStrictEqual(result.replace(/\s/g, ''));
  });
});

describe('using CETEI', () => {
  it('transform super simple xml', () => {
    const xmlString = `
      <TEI xmlns="http://www.tei-c.org/ns/1.0">
        <teiHeader>
          <fileDesc>
            <titleStmt>
              <title>Review: an electronic transcription</title>
            </titleStmt>
            <publicationStmt>
              <p>Published as an example for the CETEIcean project.</p>
            </publicationStmt>
            <sourceDesc>
              <p>No source: born digital.</p>
            </sourceDesc>
          </fileDesc>
          <encodingDesc>
            <tagsDecl>
              <rendition scheme="css" xml:id="italic">font-style: italic;</rendition>
              <rendition scheme="css" selector="title">text-decoration: underline;</rendition>
            </tagsDecl>
          </encodingDesc>
        </teiHeader>
        <text>
          <body>
            <head>Review</head>
            <p>
              <title xml:id="foo" xml:lang="de">Die Leiden des jungen Werther</title>
              <note place="foot">by <name>Goethe</name></note>
              is an <emph>exceptionally</emph>
              good example of a book full of <term rendition="#italic">Weltschmerz</term>.
              Here is some <add>added</add> text.</p>
            <p>Here is a pointer: <ptr target="https://github.com/TEIC/CETEIcean"/>.
          And here is a <ref target="https://github.com/TEIC">ref</ref>. But
          <ref target="addBehaviorTest.html">here</ref> is a relative link.</p>
          <p><egXML xmlns="http://www.tei-c.org/ns/Examples"><fuzzbuckets>egXML test</fuzzbuckets></egXML></p>
          </body>
        </text>
      </TEI>
    `;
    document.body.innerHTML = '<div class="testing" />';
    const $parent = document.querySelector('div.testing');
    const result = prepareTEIDocument(xmlString, $parent);
  });
  it('appends an xml string from CRC1475 to the document', async () => {
    // setup the document
    document.body.innerHTML = '<div id="TEI"></div>';
    const xmlString = `
      <text xml:lang="hbo" xmlns="http://www.tei-c.org/ns/1.0">
        <body n="Psalms" xml:id="b.426591">
          <div type="chapter" n="1" xml:id="c.426630">
            <lg><l><w xml:id="w.121">Blessed</w> <w xml:id="w.122">[is]</w> <w xml:id="w.123">the</w> <w xml:id="w.124">man</w> <w xml:id="w.125">that</w> <w xml:id="w.126">walketh</w><pc xml:id="pc.1">,</pc></l>
                <l><w xml:id="w.133">nor</w> <w xml:id="w.134">standeth</w><pc xml:id="pc.2">.</pc></l></lg>
          </div>
        </body>
      </text>
    `;

    const $result = prepareTEIDocument(xmlString, {});

    const language = getTextLanguage($result);
    const $testElement = $result.getElementById('w.121');
    const $wElements = $result.querySelectorAll('tei-w');
    const $pcElements = $result.querySelectorAll('tei-pc');
    expect(language).toBe('hbo');
    expect($result.firstElementChild.dir).toBe('rtl');
    expect($testElement.id).toBe('w.121');
    expect($wElements.length).toBe(8);
    expect($pcElements.length).toBe(2);
  });
});

describe('using prepareTEIDocument with hooks', () => {
  it('calls preMakeHTML hook with correct params', () => {
    const hook = jest.fn((_xmlString) => {});
    const _results = prepareTEIDocument('<text xml:lang="hbo"></text>', { preMakeHTML: [hook] });
    expect(hook).toHaveBeenCalled();
    expect(hook).toHaveBeenCalledWith('<text xml:lang="hbo"></text>');
  });
});

describe('applying styles based on the language of a text', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  it('makes the editor display text from left to right', () => {
    // setup the document
    document.body.innerHTML = innerHTMLSanskrit;
    const $text = document.getElementById('TEI');
    const language = getTextLanguage($text);
    const $result = applyStyles($text, language);
    expect($result.firstElementChild.dir).toBe('');
  });
  it('makes the editor display text from right to left', () => {
    // setup the document
    document.body.innerHTML = innerHTMLHebrew;
    const $text = document.getElementById('TEI');
    const language = getTextLanguage($text);
    const $result = applyStyles($text, language);
    expect($result.firstElementChild.dir).toBe('rtl');
  });
  it('calls postApplyStyles hook with correct params', () => {
    const $text = document.createElement('div');
    $text.appendChild(document.createElement('div'));
    const hook = jest.fn((_$html, _lang) => {});
    const _results = applyStyles($text, 'hbo', { postApplyStyles: [hook] });
    expect(hook).toHaveBeenCalled();
    expect(hook).toHaveBeenCalledWith($text, 'hbo');
  });
});

describe('storing the language of a text', () => {
  it('retrieves "hbo" correctly', () => {
    // setup the document
    document.body.innerHTML = innerHTMLHebrew;
    const $text = document.getElementById('TEI');
    const language = getTextLanguage($text);
    expect(language).toBe('hbo');
  });

  it('retrieves "sa-Latn" correctly', () => {
    document.body.innerHTML = innerHTMLSanskrit;
    const $text = document.getElementById('TEI');
    const language = getTextLanguage($text);
    expect(language).toBe('sa-Latn');
  });
});
