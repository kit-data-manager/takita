import { DetailedConcept } from './DetailedConcept';
import { FetchResult } from '../resources';
import { mockConceptFetchDataLeafNode } from '../../examples';

describe('DetailedConcept creation', () => {
  let concept;

  beforeAll(async () => {
    concept = new FetchResult(mockConceptFetchDataLeafNode).toConcept();
  });

  test('DetailedConcept creation works', () => {
    expect(concept).toBeInstanceOf(DetailedConcept);
  });

  test('check URI', () => {
    expect(concept.getUri()).toBe('https://w3id.org/MoRe-SFB1475/CT/concepts/2436288185');
  });

  test('check label', () => {
    expect(concept.getLabel()).toBe('Dog');
  });

  test('check parent', () => {
    const expected = {
      uri: 'https://w3id.org/MoRe-SFB1475/CT/concepts/756554114',
      prefLabel: 'Domesticated animal',
    };
    expect(concept.getParent()).toEqual(expected);
  });
});