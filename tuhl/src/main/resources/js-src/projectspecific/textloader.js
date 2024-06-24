// TEXTLOADER
/**
 * Sum Type which specifies if the current text document has special requirements.
 */
export class Variant {
  static Default = new Variant('Default');
  static B04 = new Variant('B04');
  static Hebrew = new Variant('Hebrew');

  constructor(name) {
    this.name = name;
  }
}

/**
 * adds a css-class to render punctuation for and removes whitespace from Sanskrit texts
 *
 * @param {Element} $processedHTML the xml file converted by CETEIcean into HTML
 * @param {String} language of the text
 * @returns {Element} modified $processedHTML
 */
export function applyStylesB04($processedHTML, language) {
  // B04 sanskrit specific:
  // adding of a syllable marker between the unsandhied words
  if ($processedHTML.querySelector('tei-choice') != undefined) {
    if (language === 'sa-Latn' || $processedHTML.querySelector('tei-choice').n === 'sandhi') {
      let regW = $processedHTML.querySelectorAll('tei-reg>tei-w');
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
  return $processedHTML;
}

/**
 * adds a css-class to render punctuation for Hebrew texts
 *
 * @param {Element} $processedHTML the xml file converted by CETEIcean into HTML
 * @param {String} language of the text
 * @returns {Element} modified $processedHTML
 */
export function applyStylesB03($processedHTML, language) {
  /**
   * Please NOTE: this test currently does not work!
   */
  // B03 hebrew specific:
  // the "paseq" sign "׀" will be removed, but it needs to be displayed
  // so any word followed by a "paseq" will get a class "paseq", so the css rule applies
  // TODO: orig should have thepaseq class, if choice is followed by the symbol
  if (language === 'hbo') {
    /*$text.querySelectorAll('tei-w').forEach((word) => {
      if (!word.id.includes('_')) {
        //if (word.nextElementSibling !== null && word.nextElementSibling.localName === "tei-pc"){
        /*if (word.nextElementSibling !== null && word.nextElementSibling.innerHTML === "־"){
                  word.classList.add("maqqef");
              }*/ /*
        if (word.nextElementSibling !== null && word.nextElementSibling.innerHTML === '׀') {
          word.classList.add('paseq');
        }
      }
    });*/
    // delete all the "paseq" signs as they will be rendered via css
    $processedHTML.querySelectorAll('tei-pc').forEach((punct) => {
      // if (punct.innerHTML === "־" || punct.innerHTML === "׀"){
      if (punct.innerHTML === '׀') {
        punct.classList.add('paseq');
        punct.innerHTML = '';
      }
    });
  }

  return $processedHTML;
}
