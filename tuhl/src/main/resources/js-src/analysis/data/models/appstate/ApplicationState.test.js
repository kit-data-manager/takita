import { ApplicationState } from './ApplicationState';

import { cloneDeep } from 'lodash';

import {
  FetchResult,
  MetaphorAnnotation,
  MRWAnnotation
} from '../resources';

import {
  mockConceptFetchDataLeafNode,
  mockMetaphorAnnoData,
  mockMRWAnnoData,
} from '../../examples';


describe('basic ApplicationState functionality', () => {
  let metaphor, mrws, concepts, state;

  beforeAll(() => {
    metaphor = new MetaphorAnnotation(mockMetaphorAnnoData);
    mrws = [new MRWAnnotation(mockMRWAnnoData)];
    //concepts = [new FetchResult(mockConceptFetchDataLeafNode)];
    state = new ApplicationState(metaphor, mrws, []);
  });

  test('instantiation', () => {
    expect(state).toBeInstanceOf(ApplicationState);
    expect(state.etag).toBe('"ofbxgmiorjlmgkuhaynl"');
  });
});

describe('metaphor text included in AppState', () => {
  let metaphor, mrws, concepts, state;

  beforeAll(() => {
    metaphor = new MetaphorAnnotation(mockMetaphorAnnoData);
    mrws = [new MRWAnnotation(mockMRWAnnoData)];
    concepts = new FetchResult(mockConceptFetchDataLeafNode);
    concepts = [concepts];
    state = new ApplicationState(metaphor, mrws, concepts);
  });

  test('text is present', () => {
    expect(state.getText()).toBe('Blessed [is] the man that walketh not in the counsel of the ungodly');
  });
});


describe('ApplicationState with prefilled mappings', () => {
  let metaphor, mrws, concepts, state;

  beforeEach(() => {
    metaphor = new MetaphorAnnotation(mockMetaphorAnnoData);
    mrws = [new MRWAnnotation(mockMRWAnnoData)];
    concepts = [new FetchResult(mockConceptFetchDataLeafNode).toConcept()];
    state = new ApplicationState(metaphor, mrws, concepts);
  });

  it('retrieves mapping tables', () => {
    const mappings = state.getMappingTables();
    expect(mappings.length).toBe(1);
  });

  it('retrieves first mapping table', () => {
    const mt = state.getMappingTableAt(0);
    expect(mt).toBeDefined();
    expect(mt.length).toBe(2);
  });

  it('parses first mapping table', () => {
    const mt = state.getMappingTableAt(0);
    const m = mt[0];
    expect(m).toBeDefined();
    expect(m.source.value).toBe('gnu');
    expect(m.target.step).toBe('open');
  });

  it('is never completely empty', () => {
    expect(state.getMappingTables().length).toBe(1);
    const changed = state.deleteMappingTableAt(0);
    expect(changed.getMappingTables().length).toBe(1);
  });

  it('deletes a mapping table', () => {
    const updated = state.deleteMappingTableAt(0);
    const mt = updated.getMappingTables();
    // there should always be at least one empty table
    expect(mt.length).toBe(1);
    const firstMapping = mt[0][0];
    expect(firstMapping.source).toEqual({value:'', step:null});
    expect(firstMapping.target).toEqual({value:'', step:null});
  });

  it('appends a mapping table', () => {
    const updated = state.appendMappingTable();
    const tables = updated.getMappingTables();
    expect(tables.length).toBe(2);
    expect(tables[0][0].source.value).toBe('gnu');
    expect(tables[1][0].source.value).toBe('');
  });

  it('deletes a single mapping', () => {
    const tableBefore = state.getMappingTableAt(0);
    expect(tableBefore.length).toBe(2);
    const updated = state.deleteMappingAt(0, 0);
    const tableAfter = updated.getMappingTableAt(0);
    expect(tableAfter.length).toBe(1);
  });

  it('updates a single mapping source', () => {
    const updated = state.changeMappingAt(0, 0, 'source', 'complete', 'foo');
    const firstMapping = updated.getMappingTableAt(0)[0];
    expect(firstMapping.source.value).toBe('foo');
    expect(firstMapping.source.step).toBe('complete');
  });

  it('updates a single mapping target', () => {
    const updated = state.changeMappingAt(0, 0, 'target', 'open', 'bar');
    const firstMapping = updated.getMappingTableAt(0)[0];
    expect(firstMapping.target.value).toBe('bar');
    expect(firstMapping.target.step).toBe('open');
  });

  it('swaps a single mapping', () => {
    const firstBefore = state.getMappingTableAt(0)[0];
    expect(firstBefore.source.value).toBe('gnu');
    expect(firstBefore.target.value).toBe('penguin');
    const updated = state.swapMappingAt(0, 0);
    const firstAfter = updated.getMappingTableAt(0)[0];
    expect(firstAfter.source.value).toBe('penguin');
    expect(firstAfter.target.value).toBe('gnu');
  });

  it('inserts a single mapping before an index', () => {
    const firstTable = state.getMappingTableAt(0);
    expect(firstTable.length).toBe(2);
    const updated = state.insertMappingBefore(0, 0);
    expect(updated.getMappingTableAt(0).length).toBe(3);
    expect(updated.getMappingTableAt(0)[0].source.value).toBe('');
    expect(updated.getMappingTableAt(0)[0].target.value).toBe('');
  });

  it('inserts a single mapping after an index', () => {
    const firstTable = state.getMappingTableAt(0);
    expect(firstTable.length).toBe(2);
    const updated = state.insertMappingAfter(0, 0);
    expect(updated.getMappingTableAt(0).length).toBe(3);
    expect(updated.getMappingTableAt(0)[1].source.value).toBe('');
    expect(updated.getMappingTableAt(0)[1].target.value).toBe('');
  });
});

describe('ApplicationState with old single mappings table', () => {
  let metaphor, mrws, concepts, state;

  beforeEach(() => {
    metaphor = new MetaphorAnnotation(mockMetaphorAnnoData);
    // "unpack" mappings, so that only one table exists
    metaphor.analysis.mappings = metaphor.analysis.mappings[0];
    mrws = [new MRWAnnotation(mockMRWAnnoData)];
    concepts = [new FetchResult(mockConceptFetchDataLeafNode).toConcept()];
    state = new ApplicationState(metaphor, mrws, concepts);
  });

  it('can still load', () => {
    expect(state).toBeDefined();
  });
});

describe('ApplicationState linkings', () => {
  let metaphor, mrws, concepts, state;

  beforeEach(() => {
    metaphor = new MetaphorAnnotation(mockMetaphorAnnoData);
    mrws = [new MRWAnnotation(mockMRWAnnoData)];
    concepts = [new FetchResult(mockConceptFetchDataLeafNode).toConcept()];
    state = new ApplicationState(metaphor, mrws, concepts);
  });

  it('extracts linkings', () => {
    const knownFirst =  {
      source:"Hirte",source_link:["https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343"],
      target:"Gott",target_link:["https://w3id.org/MoRe-SFB1475/CT/concepts/1520345177"]
    };
    const first = state.getLinkings()[0];
    expect(first).toBeDefined();
    expect(first.source).toBe(knownFirst.source);
    expect(first.source_link).toEqual(knownFirst.source_link);
    expect(first.target).toBe(knownFirst.target);
    expect(first.target_link).toEqual(knownFirst.target_link);
  });

  it('filters out null or undefined link URIs', () => {
    metaphor.analysis.linkings[0].source_link.push(null);
    metaphor.analysis.linkings[0].target_link.push(undefined);
    state = new ApplicationState(metaphor, mrws, concepts);

    const knownFirst =  {
      source:"Hirte",source_link:["https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343"],
      target:"Gott",target_link:["https://w3id.org/MoRe-SFB1475/CT/concepts/1520345177"]
    };
    const first = state.getLinkings()[0];
    expect(first).toBeDefined();
    expect(first.source).toBe(knownFirst.source);
    expect(first.source_link).toEqual(knownFirst.source_link);
    expect(first.target).toBe(knownFirst.target);
    expect(first.target_link).toEqual(knownFirst.target_link);    
  });
});
