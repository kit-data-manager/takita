import { SearchResult } from './SearchResult';
import { DetailedConcept } from '../appstate/DetailedConcept';

import { mockConceptSearchData, mockConceptSearchDataToplevel } from '../../examples';

import { cloneDeep } from 'lodash';

describe('searched concepts with parent concepts', () => {
  let data;
  let concepts;

  beforeEach(() => {
    data = cloneDeep(mockConceptSearchData);
    concepts = data.results.map((r) => new SearchResult(r));
  });

  test('instantiation works', () => {
    concepts.forEach((concept) => {
      expect(concept).toBeInstanceOf(SearchResult);
    });
  });

  test('toConcept() exists', () => {
    expect(concepts.pop().toConcept).toBeDefined();
  });

  test('create DetailedConcept', () => {
    const detailed = concepts.map((c) => c.toConcept());
    detailed.forEach((d) => {
      expect(d).toBeInstanceOf(DetailedConcept);
    });
  });
});

describe('ensure DetailedConcept works correctly', () => {
  let data;
  let concept;

  beforeEach(() => {
    data = cloneDeep(mockConceptSearchData);
    concept = new SearchResult(data.results.pop()).toConcept();
  });

  test('ensure creation works', () => {
    expect(concept).toBeInstanceOf(DetailedConcept);
  });
});

describe('searched toplevel concepts', () => {
  let data;
  let concepts;

  beforeEach(() => {
    data = cloneDeep(mockConceptSearchDataToplevel);
    concepts = data.results.map((r) => new SearchResult(r));
  });

  it('instantiates successfully', () => {
    concepts.forEach((concept) => {
      expect(concept).toBeInstanceOf(SearchResult);
    });
  });

  it('provides reasonable parent values even though it has none', () => {
    const concept = concepts.pop().toConcept();
    expect(concept).toBeInstanceOf(DetailedConcept);
  });
});
