import CETEI from 'CETEIcean';

/**
 * Main entry point into the textloader module.
 * @param {String} xmlString the xml file to be added to the DOM
 * @param {Element} $teiElement the element containing the TEI-xml
 * @param {Object} [hooks] containing an array for each hook to be called at "preMakeHTML", "postApplyStyles"
 */
export async function appendTEIDocument(xmlString, $teiElement, hooks = {}) {
  const CETEIcean = new CETEI();

  // preMakeHTML hook
  if (hooks.preMakeHTML) {
    hooks.preMakeHTML.forEach((hook) => hook());
  }

  const html = CETEIcean.makeHTML5(xmlString);
  $teiElement.innerHTML = '';
  // TODO: find an alternative for `appendChild` as testing it with JSDOM can fail
  $teiElement.appendChild(html);
  const language = getTextLanguage($teiElement);
  applyStyles($teiElement, language, hooks);
}

/**
 * Determine language of the document.
 * NOTE: this can only work _after_ CETEIcean has transformed the DOM.
 * @param {Element} $text the element containing the TEI-xml
 * @returns {String} language of the current text or undefined
 */
export function getTextLanguage($text) {
  return $text.querySelector('tei-text')?.lang;
}

/**
 * Main entry point into the textloader module.
 * @param {Element} $text the element containing the TEI-xml
 * @param {String} language the language of the text
 * @param {Object} [hooks] containing an array for the hook to be called at "postApplyStyles"
 */
export function applyStyles($text, language, hooks = {}) {
  // Generic stuff
  // displaying right to left languages accordingly
  if (language === 'hbo' || language === 'he' || language === 'arb' || language === 'fa') {
    $text.dir = 'rtl';
  }

  // postApplyStyles hook(s)
  if (hooks.postApplyStyles) {
    hooks.postApplyStyles.forEach((hook) => hook($text, language));
  }
}
