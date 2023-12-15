class BasicConcept {
  constructor() {
    if (this.constructor === BasicConcept) {
      throw new TypeError('BasicConcept is an abstract class.');
    }
  }

  toConcept() {
    throw new Error('not implemented');
  }
}

export { BasicConcept };
