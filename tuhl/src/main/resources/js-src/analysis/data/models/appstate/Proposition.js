import { cloneDeep } from 'lodash';

/**
 * This models what we usually call "Propositions" i.e.
 * standardized forms of statements taken from the source text.
 */

const typeEnum = Object.freeze({
  attribute: 'attribute',
  concept: 'concept',
  metonymy: 'metonymy',
  possessive: 'possessive',
  relation: 'relation',
});

const evidenceEnum = Object.freeze({
  context: 'context',
  explicit: 'explicit',
  implicit: 'implicit',
  worldKnowledge: 'world knowledge',
});

const template = {
  evidence: evidenceEnum.explicit,
  predicate: '',
  subject: '',
  type: typeEnum.attribute,
  value: '',
};

class Proposition {
  constructor(data = {}) {
    const temp = cloneDeep(template);
    const prop = { ...temp, ...data };
    if (!Object.values(typeEnum).includes(prop.type)) { prop.type = template.type; }
    if (!Object.values(evidenceEnum).includes(prop.evidence)) { prop.evidence = template.evidence; }
    Object.assign(this, prop);
  }
}

export { typeEnum, evidenceEnum, Proposition };
