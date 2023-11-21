import { cloneDeep } from 'lodash';

import {
  FetchResult,
  SearchResult,
  MetaphorAnnotation,
  MRWAnnotation
} from '../resources';
import { DetailedConcept } from './DetailedConcept';
import { Linking } from './Linking';
import { Mapping } from './Mapping';
import { Proposition } from './Proposition';

const template = {
  etag: null,
  analysis_label: '',
  annotator: '',
  auxiliaryText: '',
  comment: '',
  date_created: new Date(),
  date_modified: new Date(),
  doc_title: '',
  doc_reference: '',
  id: undefined,
  text: {},
  propositions: [],
  mappings: [],
  linkings: [],
  tertia: [],
  tertiaComment: '',
  mrws: [],
};

class ApplicationState {
  /**
   * 
   * @param {MetaphorAnnotation} metaphorAnno MetaphorAnnotation object
   * @param {[MRWAnnotation]} mrwAnnos Array of MRWAnnotation objects
   * @param {Array} concepts Array, can contain FetchResult, SearchResult, or DetailedConcept
   */
  constructor(metaphorAnno, mrwAnnos, concepts) {
    if ( metaphorAnno && ! (metaphorAnno instanceof MetaphorAnnotation) ) {
      throw TypeError(metaphorAnno);
    }
    if ( mrwAnnos && mrwAnnos.some(mrw => ! (mrw instanceof MRWAnnotation))) {
      throw TypeError(mrwAnnos);
    }

    Object.assign(this, template);

    // Keep various data from metaphor annotation
    this.id = metaphorAnno.getId();
    this.etag = metaphorAnno.getEtag();
    this.analysis_label = metaphorAnno.getAnnotationLabel();
    this.annotator = metaphorAnno.getCreatorString();
    this.comment = metaphorAnno.getComment();
    this.date_created = metaphorAnno.getAnalysisCreatedDate();
    this.date_modified = metaphorAnno.getAnalysisModifiedDate();
    this.doc_reference = metaphorAnno.getDocumentId();
    this.text = metaphorAnno.getText();

    // Format MRW objects.
    this.mrws = mrwAnnos.map(mrw => { return { type: mrw.getType(), text: mrw.getText() }; });

    // Create linkings field based on linked concepts
    const linkings = metaphorAnno.getLinkings();
    if (linkings.length) {
      const lookup = {};
      const detailed = concepts.map(c => {
        if (c instanceof DetailedConcept) { return c; }
        if (c instanceof SearchResult) { return c.toConcept(); }
        if (c instanceof FetchResult) { return c.toConcept(); }
        throw new TypeError(c);
      });
      detailed.forEach(dc => {
        lookup[dc.getUri()] = dc;
      });
      this.linkings = linkings.map(linking => {
        linking.source_link = linking.source_link
          .filter(sl => !!sl)
          .map(sl => lookup[sl] || sl);
        linking.target_link = linking.target_link
          .filter(tl => !!tl)
          .map(tl => lookup[tl] || tl);
        return linking;
      });
    }

    // Create propositions
    this.propositions = metaphorAnno.getPropositions()
      .map(proposition => new Proposition(proposition));
    
    // Create mappings
    const mappings = metaphorAnno.getMappings();
    if (mappings.length === 0) {
      this.mappings = [ [new Mapping()] ];
    }
    else if (!Array.isArray(mappings[0]) && mappings[0].source !== undefined) {
      // This is the old convention of only a single mapping table, just
      // wrap it in an additional array.
      //console.debug('oldschool mappings with a single mapping table');
      this.mappings = [ mappings ];
    }
    else {
      // This is the new convention: mappings is an array of arrays of
      // mapping objects, where the outer arrays represent different tables.
      this.mappings = mappings.map(table => {
        return table.map(data => new Mapping(data));
      });
    }
   
    // Create auxiliary text
    this.auxiliaryText = metaphorAnno.getAuxText();

    // Create tertia comment text.
    this.tertiaComment = metaphorAnno.getTertiaComment();
  }

  /*
   * Methods related to the source document or general metadata.
   */
  getText() {
    return this.text;
  }

  getComment() {
    return this.comment;
  }

  getId() {
    return this.id;
  }

  getDocId() {
    return this.doc_reference;
  }

  getAnalysisCreatedDate() {
    return this.date_created;
  }

  getAnalysisModifiedDate() {
    return this.date_modified;
  }

  getAnalysisLabel() {
    return this.analysis_label;
  }

  /*
   * Auxilliary Text related methods
   */

  getAuxText() {
    return this.auxiliaryText;
  }

  /**
   * Update `auxiliaryText`
   * 
   * @param {*} textDelta text delta as used by the quill text editor
   * @returns {ApplicationState} 
   */
  updateAuxText(textDelta) {
    const updated = cloneDeep(this);
    updated.auxiliaryText = textDelta;
    return updated;
  }

  /*
   * Mapping related methods 
   */

  getMappingTables() {
    // always have at least one table with at least one mapping
    if (!this.mappings.length) {
      return [[new Mapping()]];
    }
    // if the data follows the old convention of having only a single
    // mapping table simply wrap in yet another array.
    if (this.mappings.length === 1 
      && !Array.isArray(this.mappings[0])
    ) {
      return [ this.mappings ];
    }
    return this.mappings;
  }

  appendMappingTable() {
    const updated = cloneDeep(this);
    const tables = updated.getMappingTables();
    tables.push([ new Mapping() ]);
    updated.mappings = tables;
    return updated;
  }

  changeMappingTableAt(idx, table) {
    const updated = cloneDeep(this);
    const tables = updated.getMappingTables();
    tables.splice(idx, 1, table);
    updated.mappings = tables;
    return updated;
  }

  deleteMappingTableAt(idx) {
    const updated = cloneDeep(this);
    const mt = updated.getMappingTables();
    if (mt.length <= 1) {
      // Ensure that at least one table with at least one mapping exists
      mt.splice(idx, 1, [ new Mapping() ]);
    }
    else {
      mt.splice(idx, 1);
    }
    updated.mappings = mt;
    return updated;
  }

  getMappingTableAt(idx=0) {
    const m = this.getMappingTables();
    if (idx >= m.length) {
      console.warn('getMappingTableAt() idx too high');
      return [new Mapping()];
    }
    return this.mappings[idx];
  }

  changeMappingAt(tableIdx, mapIdx, domain, step, value) {
    const updated = cloneDeep(this);
    const table = updated.getMappingTableAt(tableIdx);
    const changed = table[mapIdx];
 
    if (domain === 'source') {
      changed.source.value = value;
      changed.source.step = step;
    }
    else {
      changed.target.value = value;
      changed.target.step = step;
    }
    table.splice(mapIdx, 1, changed);
    
    return updated.changeMappingTableAt(tableIdx, table);
  }

  insertMappingBefore(tableIdx, mapIdx) {
    const updated = cloneDeep(this);
    const table = updated.getMappingTableAt(tableIdx);
    table.splice(mapIdx, 0, new Mapping());
    updated.mappings[tableIdx] = table;
    return updated;
  }

  insertMappingAfter(tableIdx, mapIdx) {
    const updated = cloneDeep(this);
    const table = updated.getMappingTableAt(tableIdx);
    table.splice(mapIdx+1, 0, new Mapping());
    updated.mappings[tableIdx] = table;
    return updated;
  }

  deleteMappingAt(tableIdx, mapIdx) {
    const updated = cloneDeep(this);
    const table = updated.getMappingTableAt(tableIdx);
    
    // Make sure at least one empty mapping remains.
    if (table.length <= 1) {
      table.splice(mapIdx, 1, new Mapping());
    }
    else {
      table.splice(mapIdx, 1);
    }
    updated.mappings[tableIdx] = table;
    return updated;
  }

  swapMappingAt(tableIdx, mapIdx) {
    const updated = cloneDeep(this);
    const table = updated.getMappingTableAt(tableIdx);
    const mapping = table[mapIdx];
    table.splice(mapIdx, 1, new Mapping({source: mapping.target, target: mapping.source}));
    updated.mappings[tableIdx] = table;
    return updated;
  }

  /*
   * Proposition related methods
   */

  getPropositions() {
    return this.propositions;
  }

  appendNewProposition() {
    const updated = cloneDeep(this);
    const p = updated.getPropositions();
    p.push(new Proposition());
    updated.propositions = p;
    return updated;
  }

  changePropositionAt(idx, value) {
    const updated = cloneDeep(this);
    const p = updated.getPropositions();
    if (value === undefined) {
      p.splice(idx, 1);
      if (!p.length) {
        p.push(new Proposition());
      }
    }
    else {
      p[idx] = value;
    }
    updated.propositions = p;
    return updated;
  }

  /*
   * Linking related methods
   */

  getLinkings() {
    if (!this.linkings?.length) {
      this.linkings = [new Linking()];
    }
    return this.linkings;
  }

  appendNewLinking() {
    const updated = cloneDeep(this);
    const l = updated.getLinkings();
    l.push(new Linking());
    updated.linkings = l;
    return updated;
  }

  changeLinkingAt(idx, value) {
    const updated = cloneDeep(this);
    const l = updated.getLinkings();
    if (value === undefined || value === null) {
      l.splice(idx, 1);
      if (!l.length) {
        l.push(new Linking());
      }
    }
    else {
      l[idx] = value;
    }
    updated.linkings = l;
    return updated;
  }

  /**
   * Tertia related methods
   */

  getTertiaComment() {
    return this.tertiaComment || '';
  }

  changeTertiaComment(value) {
    const updated = cloneDeep(this);
    updated.tertiaComment = value;
    return updated;
  }
}

export { ApplicationState };