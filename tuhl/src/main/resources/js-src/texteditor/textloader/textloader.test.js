// external modules

// internal modules
import { applyStyles, loadText, setTextLanguage } from './textloader';

const innerHTMLSanskrit =
  '<div id="TEI"><tei-text xml:lang="sa-Latn" lang="sa-Latn" type="book" data-xmlns="http://www.tei-c.org/ns/1.0">' +
  '<tei-body n="Viṣṇupurāṇa" xml:id="b.400" id="b.400">' +
  '   <tei-div type="kāṇḍa" n="ViPur, 5">' +
  '        <tei-div type="chapter" n="1" xml:id="c.8520" id="c.8520">' +
  '            <tei-lg n="19">' +
  '                <tei-l xml:id="l.501102" id="l.501102"><tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292523.s" id="w.4292523.s">sa</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292523" id="w.4292523">saḥ</tei-w> </tei-reg></tei-choice> <tei-w xml:id="w.4292524" id="w.4292524">dadarśa</tei-w> <tei-w xml:id="w.4292525" id="w.4292525">tadā</tei-w> <tei-w xml:id="w.4292526" id="w.4292526">tatra</tei-w> <tei-w xml:id="w.4292737" id="w.4292737">kṛṣṇam</tei-w> <tei-w xml:id="w.4292755" id="w.4292755">ādohane</tei-w> <tei-w xml:id="w.4292527" id="w.4292527">gavām</tei-w> </tei-l>' +
  '                <tei-l xml:id="l.501103" id="l.501103"><tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292528_4292529_4292530.s" id="w.4292528_4292529_4292530.s">vatsamadhyagataṃ</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292528" id="w.4292528" class="">vatsa</tei-w><tei-w xml:id="w.4292529" id="w.4292529" class="">madhya</tei-w><tei-w xml:id="w.4292530" id="w.4292530">gatam</tei-w> </tei-reg></tei-choice> <tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292531_4292532_4292533_4292534.s" id="w.4292531_4292532_4292533_4292534.s">phullanīlotpaladalacchavim</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292531" id="w.4292531" class="mrw metaphor whitespaceAfter ">phulla</tei-w><tei-w xml:id="w.4292532" id="w.4292532" class="mrw metaphor whitespaceAfter ">nīlotpala</tei-w><tei-w xml:id="w.4292533" id="w.4292533" class="mrw metaphor whitespaceAfter ">dala</tei-w><tei-w xml:id="w.4292534" id="w.4292534" class="mrw metaphor">chavim</tei-w> </tei-reg></tei-choice> </tei-l>' +
  '            </tei-lg></tei-div></tei-div></tei-body></tei-text></div></body>';

const innerHTMLHebrew =
  '<div id="TEI" dir="rtl"><tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="hbo" lang="hbo" type="book">' +
  '<tei-body n="Psalmi" xml:id="b.426617" id="b.426617">' +
  '   <tei-div type="chapter" n="1" xml:id="c.427197" id="c.427197">' +
  '      <tei-ab type="verse" n="1" xml:id="v.1429538" id="v.1429538"><tei-choice data-origname="choice"><tei-orig><tei-w xml:id="w.310653_310654_310655" id="w.310653_310654_310655"><tei-w xml:id="w.310653" id="w.310653">אַ֥שְֽׁרֵי</tei-w><tei-pc xml:id="pc.47746" id="pc.47746">־</tei-pc><tei-w xml:id="w.310654" id="w.310654">הָ</tei-w><tei-w xml:id="w.310655" id="w.310655">אִ֗ישׁ</tei-w></tei-w></tei-orig> <tei-reg class="zeroOpacity"></tei-reg></tei-choice><tei-pc id="pc.1" xml:id="pc.1">׀</pc></tei-ab></tei-div></tei-body></tei-text></div></body>';

describe('applying styles based on the language of a text', () => {
  it('makes the editor display text from left to right', () => {
    // setup the document
    document.body.innerHTML = innerHTMLSanskrit;
    const $text = document.getElementById('TEI');
    setTextLanguage($text);
    const language = window.TEXTLANGUAGE;
    applyStyles($text, language);
    expect($text.dir).toBe('');
  });
  it('makes the editor display text from right to left', () => {
    // setup the document
    document.body.innerHTML = innerHTMLHebrew;
    const $text = document.getElementById('TEI');
    setTextLanguage($text);
    const language = window.TEXTLANGUAGE;
    applyStyles($text, language);
    expect($text.dir).toBe('rtl');
  });
  it('adds sandhi syllable markers to sanskrit texts', () => {
    // setup the document
    document.body.innerHTML = innerHTMLSanskrit;
    const $text = document.getElementById('TEI');
    setTextLanguage($text);
    const language = window.TEXTLANGUAGE;
    applyStyles($text, language);
    const wordElementContainsClass = document
      .getElementById('w.4292528')
      .classList.contains('sandhiSyllableMarkerAfter');
    expect(wordElementContainsClass).toBe(true);
  });
  it('removes paseq sign from hebrew texts, but adds a css class to display them', () => {
    // setup the document
    document.body.innerHTML = innerHTMLHebrew;
    const $text = document.getElementById('TEI');
    setTextLanguage($text);
    const language = window.TEXTLANGUAGE;
    applyStyles($text, language);

    const pcElement = document.getElementById('pc.1');
    const pcElementContainsClass = pcElement.classList.contains('paseq');
    expect(pcElement.innerHTML).toBe('');
    expect(pcElementContainsClass).toBe(true);
  });
});

describe('storing the language of a text', () => {
  it('stores the language used in a text', () => {
    // setup the document
    document.body.innerHTML = innerHTMLHebrew;
    const $text = document.getElementById('TEI');
    setTextLanguage($text);
    expect(window.TEXTLANGUAGE).toBe('hbo');
  });
});

// doesn't work, bc of appendChild()
// TypeError: Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'.
// at Object.exports.convert (takita/tuhl/node_modules/jsdom/lib/jsdom/living/generated/Node.js:25:9)
// at HTMLDivElement.appendChild (takita/tuhl/node_modules/jsdom/lib/jsdom/living/generated/Node.js:404:26)
// at appendChild (takita/tuhl/src/main/resources/js-src/texteditor/textloader/textloader.js:10:17)
describe.skip('loading a text', () => {
  it('loads a text given an URL', () => {
    // setup the document
    document.body.innerHTML = innerHTMLHebrew;
    const $text = loadText('./../../../../../../testfiles/HebrewBibleFull.xml');
    const $teiElement = document.getElementById('TEI');
    setTextLanguage($text);
    expect(window.TEXTLANGUAGE).toBe('hbo');
    expect($teiElement.dir).toBe('rtl');
  });
});
