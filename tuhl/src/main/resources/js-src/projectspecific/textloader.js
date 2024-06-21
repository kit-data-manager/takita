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
