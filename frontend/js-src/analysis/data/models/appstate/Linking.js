/**
 * These classes model what we frequently call "cross-domain-mapping"
 * as well as "linking" to the conceptual thesaurus.
 */

/* Specifies an "empty" linking.
 */
const template = {
  source: '',
  source_link: [],
  target: '',
  target_link: [],
};

class Linking {
  constructor(data) {
    if (data === null || data === undefined) {
      data = {};
    }
    if (!(data instanceof Object)) {
      throw new TypeError(data);
    }
    Object.assign(this, template);
    Object.assign(this, data);
  }

  getSource() {
    return this.uri;
  }

  getSourceLinks() {
    return this.source_link;
  }

  getTarget() {
    return this.target;
  }

  getTargetLinks() {
    return this.target_link;
  }
}

export { Linking };
