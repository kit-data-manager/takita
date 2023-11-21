import {
  createFetchedConcept,
  createMetaphor,
  createMRWs,
  createSearchedConcepts,
} from './converting';

import {
  MetaphorAnnotation,
  MRWAnnotation,
  SearchResult,
} from './models';

import { FetchResult } from './models/resources/FetchResult';

// eslint-disable-next-line jest/no-mocks-import
import { searchForConcept } from './__mocks__/searching';

// These will be imported from __mock__/fetching.js instead.
import {
  fetchMetaphorAnnotation,
  fetchConcept,
  fetchMRWAnnotation,
} from './fetching';

jest.mock('./fetching');


describe('metaphor annotation creation', () => {
  let data;

  beforeAll(async () => {
    data = await fetchMetaphorAnnotation(null);
  });
  
  test('create a metaphor annotation', () => {
    const result = createMetaphor(data);
    expect(result).toBeInstanceOf(MetaphorAnnotation);
  });

  test('analysisString property exists', () => {
    const result = createMetaphor(data);
    expect(typeof result.analysisString).toBe("string");
  });

  test('analysis property exists', () => {
    const result = createMetaphor(data);
    expect(typeof result.analysis).toBe("object");
  });
});


describe('fetched concept creation', () => {
  let data;

  beforeAll(async () => {
    data = await fetchConcept(null);
  });

  test('create a concept FetchResult', () => {
    const result = createFetchedConcept(data);
    expect(result).toBeInstanceOf(FetchResult);
  });
  
  test('toConcept() method exists', () => {
    const result = createFetchedConcept(data);
    expect(result.toConcept).toBeDefined();
  });
});

describe('single MRW annotation creation', () => {
  let data;

  beforeAll(async () => {
    data = await fetchMRWAnnotation(null);
  });

  test('create a MRW annotation', () => {
    const result = createMRWs(data);
    expect(result).toBeInstanceOf(Array);
  });

  test('check instantiation', () => {
    const mrws = createMRWs(data);
    mrws.forEach(mrw => {
      expect(mrw).toBeInstanceOf(MRWAnnotation);
    });
  });
});

describe('multiple MRW annotation creation', () => {
  let data;

  beforeAll(async () => {
    const mrw = await fetchMRWAnnotation(null);
    data = [mrw, mrw, ];
  });

  test('create multiple MRW annotations', () => {
    const result = createMRWs(data);
    expect(result).toBeInstanceOf(Array);
  });

  test('check instantiation', () => {
    const mrws = createMRWs(data);
    mrws.forEach(mrw => {
      expect(mrw).toBeInstanceOf(MRWAnnotation);
    });
  });
});

describe('searched concepts creation', () => {
  let data;

  beforeAll(async () => {
    data = await searchForConcept();
  });

  test('create multiple SearchResult concepts', () => {
    const concepts = createSearchedConcepts(data);
    concepts.forEach(c => {
      expect(c).toBeInstanceOf(SearchResult);
    });
  });
});
