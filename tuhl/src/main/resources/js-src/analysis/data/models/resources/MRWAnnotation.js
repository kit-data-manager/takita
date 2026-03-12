class MRWAnnotation {
  constructor(data) {
    if (!data) {
      throw new TypeError('needs data to instantiate MRWAnnotation');
    }
    if (data.body.length === 0) {
      throw new TypeError('no body');
    }
    if (data.body.filter((b) => ['tagging', 'classifying'].includes(b.purpose)).length === 0) {
      throw new TypeError('no MRW type');
    }
    if (data.body.filter((b) => b.purpose === 'describing').length === 0) {
      throw new TypeError('no MRW plaintext');
    }
    Object.assign(this, data);
  }

  getType() {
    const body = this.body.filter((b) => ['tagging', 'classifying'].includes(b.purpose)).pop();
    return body.value;
  }

  getText() {
    return this.body.filter((b) => b.purpose === 'describing').pop().value;
  }
}

export { MRWAnnotation };
