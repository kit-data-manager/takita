import { toggleBoxIcon, toggleOpacity, toggleVisibility } from '../../common/utils';

/**
 * Utility functions which are specific to a subproject or which provide
 * specialized functionality which is only needed for certain documents.
 *
 * @module projectSpecific
 */

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
 * Determine whether the current document belongs to a specific subproject
 * and/or language which has special requirements.
 *
 * @param {Element} $text the text document
 * @param {String} language the document language
 * @returns {Variant}
 */
export function determineVariant($text, language) {
  let variant = Variant.Default;

  // The presence of 'tei-choice' elements and their contents is our main
  // indicator for a specific document variant.
  const teiChoice = $text.querySelector('tei-choice');

  if (teiChoice && (language === 'sa-Latn' || teiChoice.n === 'sandhi')) {
    variant = Variant.B04;
  } else if (teiChoice !== undefined && language === 'hbo') {
    variant = Variant.Hebrew;
  }

  return variant;
}

/**
 * hebrew specific display
 */
export function toggleHebrewView() {
  const $textElements = document.querySelectorAll('tei-reg');
  const $button = document.querySelector('#toggleViewsButton');
  toggleOpacity($textElements);
  // slide the toggle button to the other side
  toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
}

// sanskrit specific display
export function toggleSanskritView() {
  // querySelectorAll('tei-orig')
  // '#toggleViewsButton'
  const $textElements = document.querySelectorAll('tei-orig');
  const $button = document.querySelector('#toggleViewsButton');
  toggleVisibility($textElements);
  // slide the toggle button to the other side
  toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
}
