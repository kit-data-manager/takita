import { BasicConcept } from './BasicConcept';
import { DetailedConcept } from '../appstate/DetailedConcept';

class SearchResult extends BasicConcept {
  constructor(data) {
    super();
    if (!data.uri || !data.prefLabel) {
      throw TypeError('not a valid search result');
    }
    Object.assign(this, data);
  }

  /**
   * Transform a concept which we got as a search result into a
   * detailed concept suitable for consumption by the UI.
   *
   * @returns {DetailedConcept}
   */
  toConcept() {
    const parent = this.broader?.length ? this.broader.pop() : { uri: '', prefLabel: '' };

    const data = {
      notation: this.notation,
      prefLabel: this.prefLabel,
      uri: this.uri,
      parentLabel: parent.prefLabel,
      parentUri: parent.uri,
    };

    const concept = new DetailedConcept(data);
    return concept;
  }
}

export { SearchResult };
