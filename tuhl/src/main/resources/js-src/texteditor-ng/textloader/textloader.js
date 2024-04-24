import CETEI from 'CETEIcean';

/**
 * Main entry point into the textloader module. Transforms and appends given xmlString to given element
 * @param {String} xmlString the xml file to be added to the DOM
 * @param {Element} $teiElement the element the TEI-xml will be appended to
 * @param {Object} [hooks] containing an array for each hook to be called at "preMakeHTML", "postApplyStyles"
 */
export function appendTEIDocument(xmlString, $teiElement, hooks = {}) {
  const $TEIDoc = prepareTEIDocument(xmlString, hooks);
  $teiElement.appendChild($TEIDoc);
}

export function prepareTEIDocument(xmlString, hooks = {}) {
  const CETEIcean = new CETEI();

  // preMakeHTML hook
  if (hooks.preMakeHTML) {
    hooks.preMakeHTML.forEach((hook) => {
      xmlString = hook(xmlString);
    });
  }

  const $html = CETEIcean.makeHTML5(xmlString);
  const language = getTextLanguage($html);
  // Apply generic transformations, and optionally custom postApplyStyles hooks.
  return applyStyles($html, language, hooks);
}

/**
 * Determine language of the document.
 * @param {Element} $text the element containing the TEI-xml
 * @returns {String} language of the current text or undefined
 */
export function getTextLanguage($text) {
  return $text.querySelector('tei-text')?.lang;
}

/**
 * Main entry point into the textloader module.
 * @param {Element} $html the element containing the TEI-xml
 * @param {String} language the language of the text
 * @param {Object} [hooks] containing an array for the hook to be called at "postApplyStyles"
 * @returns {Element} an element containing the TEI-xml after being processed
 */
export function applyStyles($html, language, hooks = {}) {
  let $processedHTML = $html;

  // Generic stuff
  // displaying right to left languages accordingly
  if (language === 'hbo' || language === 'he' || language === 'arb' || language === 'fa') {
    $processedHTML.dir = 'rtl';
  }

  // Specific stuff
  // postApplyStyles hook(s)
  if (hooks.postApplyStyles) {
    hooks.postApplyStyles.forEach((hook) => {
      $processedHTML = hook($processedHTML, language);
    });
  }
  return $processedHTML;
}
