import CETEI from 'CETEIcean';

window.TEXTLANGUAGE = 'default';

export async function loadText(linkToResource) {
  const CETEIcean = new CETEI();
  return CETEIcean.getHTML5(linkToResource).then(($data) => {
    const $teiElement = document.getElementById('TEI');
    $teiElement.innerHTML = '';
    $teiElement.appendChild($data);
    console.log($teiElement);
    setTextLanguage($teiElement);
    applyStyles($teiElement, window.TEXTLANGUAGE);
  });
}

// store the language of a text
function setTextLanguage($text) {
  window.TEXTLANGUAGE = $text.querySelector('tei-text').lang;
}

function applyStyles($text, language) {
  // displaying right to left languages accordingly
  if (language === 'hbo' || language === 'he' || language === 'arb' || language === 'fa') {
    document.getElementById('TEI').dir = 'rtl';
  }

  // B04 sanskrit specific:
  // adding of a syllable marker between the unsandhied words
  if ($text.querySelector('tei-choice') != undefined) {
    if (language === 'sa-Latn' || $text.querySelector('tei-choice').n === 'sandhi') {
      let regW = $text.querySelectorAll('tei-reg>tei-w');
      regW.forEach((word) => {
        if (word.nextElementSibling !== null) {
          // delete whitespace between the tei-reg>tei-w elements
          if (word.nextSibling.nodeType == 3 && word.nextSibling.nodeValue.trim() === '') {
            word.nextSibling.remove();
          }
          word.classList.add('sandhiSyllableMarkerAfter');
        }
      });
    }
  }

  // B03 hebrew specific:
  // the "paseq" sign "׀" will be removed, but it needs to be displayed
  // so any word followed by a "paseq" will get a class "paseq", so the css rule applies
  if (language === 'hbo') {
    $text.querySelectorAll('tei-w').forEach((word) => {
      if (!word.id.includes('_')) {
        //if (word.nextElementSibling !== null && word.nextElementSibling.localName === "tei-pc"){
        /*if (word.nextElementSibling !== null && word.nextElementSibling.innerHTML === "־"){
                  word.classList.add("maqqef");
              }*/
        if (word.nextElementSibling !== null && word.nextElementSibling.innerHTML === '׀') {
          word.classList.add('paseq');
        }
      }
    });
    // delete all the "paseq" signs as they will be rendered via css
    $text.querySelectorAll('tei-pc').forEach((punct) => {
      // if (punct.innerHTML === "־" || punct.innerHTML === "׀"){
      if (punct.innerHTML === '׀') {
        punct.remove();
      }
    });
  }
}
