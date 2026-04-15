// TEXTLOADER
/**
 * Sum Type which specifies if the current text document has special requirements.
 */
export class Variant {
  static Default = new Variant('Default');

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
// eslint-disable-next-line no-unused-vars
export function determineVariant($text, language) {
  let variant = Variant.Default;

  // logic to determine variant, eg.:
  // if (language === 'hbo') {
  //   variant = Variant.Hebrew;
  // }

  return variant;
}
