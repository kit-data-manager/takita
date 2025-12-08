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
