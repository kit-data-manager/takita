import CETEI from 'CETEIcean';

/**
 * Main entry point into the textloader module. Transforms and appends given xmlString to given element
 * @param {String} xmlString the xml file to be added to the DOM
 * @param {Element} $teiElement the element the TEI-xml will be appended to
 * @param {Object} [hooks] containing an array for each hook to be called at "preMakeHTML", "postApplyStyles"
 */
export function appendTEIDocument(xmlString, $teiElement, hooks = {}) {
  const $TEIDoc = prepareTEIDocument(xmlString, hooks);
  // emptying the element
  $teiElement.innerHTML = '';
  $teiElement.appendChild($TEIDoc);
}

/**
 * converts the given xml string into custom HTML elements using the CETEIcean library
 *
 * @param {String} xmlString containing the xml document
 * @param {[Object]} [hooks] containing an array for the hook to be called at "postApplyStyles"
 * @returns an element containing the finished TEI-xml after being processed
 */
export function prepareTEIDocument(xmlString, hooks = {}) {
  const CETEIcean = new CETEI();

  // preMakeHTML hook
  if (hooks.preMakeHTML) {
    hooks.preMakeHTML.forEach((hook) => {
      xmlString = hook(xmlString);
    });
  }
  //console.log('texloader ', xmlString);
  const $html = CETEIcean.makeHTML5(xmlString);
  const language = getTextLanguage($html);
  // Apply generic transformations, and optionally custom postApplyStyles hooks.
  return applyStyles($html, language, hooks);
}

/**
 * Determine language of the document.
 *
 * @param {Element} $text the element containing the TEI-xml
 * @returns {String} language of the current text or undefined
 */
export function getTextLanguage($text) {
  return $text.querySelector('tei-text')?.lang;
}

/**
 * styles the given element based on the given language
 *
 * @param {Element} $html the element containing the TEI-xml
 * @param {String} language the language of the text
 * @param {[Object]} [hooks] containing an array for the hook to be called at "postApplyStyles"
 * @returns {Element} an element containing the TEI-xml after being processed
 */
export function applyStyles($html, language, hooks = {}) {
  let $processedHTML = $html;

  // Generic stuff
  // displaying right to left languages accordingly
  if (language === 'hbo' || language === 'he' || language === 'arb' || language === 'fa') {
    $processedHTML.firstElementChild.dir = 'rtl';
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
