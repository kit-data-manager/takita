import { fetchConcept, fetchMetaphorAnnotation, fetchMRWAnnotation } from './fetching';

// Dummy data to use with our mocked fetch() function.
import { mockConceptFetchDataLeafNode as dummyConcept } from './examples/conceptFetchDataLeafNode';

describe('test concept fetching', () => {
  // Note: when using jest, mocked functions normally should be defined in a __mock__ folder
  // next to where they are defined. Since `fetch()` is built-in, this is not possible, so
  // instead we mock it here.
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(dummyConcept),
      ok: true,
    }),
  );

  beforeEach(() => {
    fetch.mockClear();
  });

  test('successfully fetching concept', async () => {
    const data = await fetchConcept('https://w3id.org/MoRe-SFB1475/CT/concepts/2436288185');
    expect(data).toBeTruthy();
    expect(data.graph.length).toBe(3);
    expect(fetch).toHaveBeenCalledWith(
      'https://eris.vm.rub.de/Skosmos/rest/v1/ct/data?uri=https://w3id.org/MoRe-SFB1475/CT/concepts/2436288185&format=application/json&lang=en',
    );
  });
});

describe('failing concept fetching', () => {
  test('rejected promise', async () => {
    fetch.mockImplementationOnce(() => Promise.reject('no concept found with given uri'));

    const data = await fetchConcept(null);
    expect(data).toEqual(null);
    expect(fetch).toHaveBeenCalledWith(
      'https://eris.vm.rub.de/Skosmos/rest/v1/ct/data?uri=null&format=application/json&lang=en',
    );
  });

  test('non-ok status code', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve('this is an error'),
        ok: false,
      }),
    );

    const data = await fetchConcept(null);
    expect(data).toEqual(null);
    expect(fetch).toHaveBeenCalledWith(
      'https://eris.vm.rub.de/Skosmos/rest/v1/ct/data?uri=null&format=application/json&lang=en',
    );
  });
});
