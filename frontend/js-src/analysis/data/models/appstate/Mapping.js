import { cloneDeep } from 'lodash';

/**
 * This models what we frequently call "mapping" i.e. the connection
 * of an expression from any source domain to another expression from
 * any target domain.
 */

/* Specifies the step during which this value was given. */
const stepEnum = Object.freeze({
  open: 'open',
  complete: 'complete',
});

/* Specifies an "empty" mapping.
 */
const template = {
  source: { value: '', step: null },
  target: { value: '', step: null },
};

class Mapping {
  constructor(data = {}) {
    const t = cloneDeep(template);
    this.source = data.source || t.source;
    this.target = data.target || t.target;
  }
}

export { stepEnum, Mapping };
