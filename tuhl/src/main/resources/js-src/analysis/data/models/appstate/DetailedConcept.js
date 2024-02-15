import { FetchResult, SearchResult } from '../resources';

const template = {
  uri: null,
  prefLabel: '',
  parentLabel: '',
  parentUri: '',
  notation: '',
};

class DetailedConcept {
  constructor(data) {
    if (!(data instanceof FetchResult || data instanceof SearchResult || data instanceof Object)) {
      throw new TypeError(data);
    }
    if (data instanceof FetchResult || data instanceof SearchResult) {
      return data.toConcept();
    } else {
      if (!(data.uri && data.prefLabel)) {
        throw new TypeError('not a valid concept');
      }
      Object.assign(this, template);
      Object.assign(this, data);
    }
  }

  getUri() {
    return this.uri;
  }

  getLabel() {
    return this.prefLabel;
  }

  getParent() {
    return { uri: this.parentUri, prefLabel: this.parentLabel };
  }
}

export { DetailedConcept };
