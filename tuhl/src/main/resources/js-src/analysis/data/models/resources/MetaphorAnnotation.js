import { cloneDeep } from 'lodash';
import { parseAnalysisString } from '../../../utils';

/**
 * Represent the annotation object which we get from Takita/wapserver.
 * Provides some error checking and data conversion methods to make
 * it usable in the app.
 */
class MetaphorAnnotation {
  constructor(annotation) {
    if (annotation.id === undefined) {
      throw new TypeError('annotation data lacks id');
    }
    if (annotation.body.length === 0) {
      throw new TypeError('annotation data has no bodies');
    }
    if (annotation.body.filter(b => b.purpose === 'describing').length === 0 ) {
      throw new TypeError('annotation data has no describing body');
    }
    if (annotation.body.filter(b => b.purpose === 'linking').length === 0) {
      throw new TypeError('annotation data has no linking body');
    }
    if (annotation.body.filter(b => b.purpose === 'assessing').length !== 1) {
      //throw new TypeError('annotation data needs to include exactly on assessing body');
      //console.log('metaphor annotation has no "assessing" body yet. Creating an empty one.');
      const now = (new Date()).toISOString();
      annotation.body.push({
        created: now,
        modified: now,
        purpose: 'assessing',
        value: '{}',
      });
    }
    if (annotation.etag === undefined) {
      throw new TypeError('annotation data has no etag');
    }
    if (annotation.target.length === 0) {
      throw new TypeError('annotation data has no target');
    }

    Object.assign(this, annotation);
    try {
      this.analysisString = this.body
        .filter(b => b.purpose === 'assessing')
        .map(b => b.value)
        .pop();
      this.analysis = parseAnalysisString(this.analysisString);
    }
    catch (error) {
      console.log('inside MetaphorAnnotation() error handling');
      console.error(error);
      console.debug(this);
    }
  }

  /**
   * Alternative constructor to build a complete MetaphorAnnotation from application state.
   */
  static fromAppState(appState, originalAnnotation, etag) {
    // Start with a clone of the original annotation.
    const anno = new this(originalAnnotation);
    // Set the modified date of the annotation as a whole.
    const now = (new Date()).toISOString();
    anno.modified = now;

    // Update the `assessing` body's metadata.
    const assessing = anno.body.filter(b => b.purpose === 'assessing').pop();
    assessing.created = appState.getAnalysisCreatedDate() || now;
    assessing.modified = now;

    // Create a new analysis object using the appState
    const analysisObject = {
      auxiliaryText: appState.getAuxText(),
      propositions: appState.getPropositions(),
      mappings: appState.getMappingTables(),
      linkings: appState.getLinkings().map(l => {
        // replace source_links and target_links with only the URIs
        const newLinking = cloneDeep(l);
        newLinking.source_link = newLinking.source_link.map(sl => sl.uri);
        newLinking.target_link = newLinking.target_link.map(tl => tl.uri);
        return newLinking;
      }),
      tertiaComment: appState.getTertiaComment(),
    };
    console.warn('inside fromAppState(): this is our new analysis object:');
    console.log(analysisObject);
    anno.analysis = analysisObject;

    // Use string serialization of analysis as value of the `assessing` body.
    anno.analysisString = JSON.stringify(analysisObject);
    assessing.value = anno.analysisString;

    // Insert the assessing body into the list of other, unmodified bodies.
    anno.body = anno.body.filter(b => b.purpose !== 'assessing').concat([assessing]);

    // Finally, check if we need to update the etag.
    if (etag && etag !== originalAnnotation.etag) {
      anno.etag = etag;
    }

    return anno;
  }

  /**
   * Provide a string serialization suitable to be send to the wap server
   * for storing.
   *
   * @returns {String}
   */
  serialize() {
    const a = cloneDeep(this);
    // Remove fields which are not used on the storage backend.
    a.analysis = undefined;
    a.analysisString = undefined;
    const str = JSON.stringify(a);
    return str;
  }

  /**
   * 
   */
  getAnalysis() {
    if (!this.analysis || Object.keys(this.analysis).length === 0) {
      //console.log('analysis is currently empty');
      return {};
    }
    return this.analysis;
  }

  /**
   * Extract the linkings
   */
  getLinkings() {
    const analysis = this.getAnalysis();
    return analysis.linkings || [];
  }

  /**
   * Extract the tertiaComment text
   */
  getTertiaComment() {
    const analysis = this.getAnalysis();
    return analysis.tertiaComment || '';
  }

  /**
   * Extract the auxiliary text.
   */
  getAuxText() {
    const analysis = this.getAnalysis();
    return analysis.auxiliaryText || {};
  }

  /**
   * Extract the propositions.
   */
  getPropositions() {
    const analysis = this.getAnalysis();
    return analysis.propositions || [];
  }

  /**
   * Extract the mappings.
   */
  getMappings() {
    const analysis = this.getAnalysis();
    return analysis.mappings || [];
  }

  /**
   * Extract the URIs of all the linked MRWs.
   * 
   * @returns Array of MRW URIs
   */
  getMRWURIs() {
    const mrws = this.body
      .filter(b => b.purpose === 'linking')
      .map(b => b.value);
    return mrws;
  }

  /**
   * Extract the URIs of all the linked Concepts.
   */
  getConceptURIs() {
    const analysis = this.getAnalysis();
    if (!analysis.linkings) {
      return [];
    }
    try {
      const concepts = analysis.linkings
        .flatMap(l => {
          const sources = (l.source_link instanceof Array) ? l.source_link : [l.source_link, ];
          const targets = (l.target_link instanceof Array) ? l.target_link : [l.target_link, ];
          return sources.concat(targets);
        })
        .filter(c => !!c);

      return concepts;
    }
    catch (e) {
      console.log(e);
      //console.log('could not create analysis linkings');
      return [];
    }
  }

  /**
   * Extract the label which a user has given for the annotation.
   */
  getAnnotationLabel() {
    const label = this.body
      .filter(b => b.purpose === 'identifying')
      .map(b => b.value)
      .pop();
    return label;
  }

  getCreatorString() {
    const creator = this.creator.name;
    return creator;
  }

  getComment() {
    const comment = this.body
      .filter(b => b.purpose === 'commenting')
      .map(b => b.value)
      .pop();
    return comment;
  }

  getCreatedDate() {
    return new Date(this.created);
  }

  getAnalysisCreatedDate() {
    const a = this.getAnalysis();
    return a.created;
  }

  /* Provide the annotation ID, i.e. its URI. */
  getId() {
    return this.id;
  }

  /**
   * Reconstruct the document id (as opposed to the annotation id).
   * We need it for backlinking purposes:
   * http://localhost:8090/api/v1/dataresources/32ebbb4d-0283-45c0-8371-48ba29d99dec/data/Ram_Ar.xml
   * should yield
   * 32ebbb4d-0283-45c0-8371-48ba29d99dec
   */
  getDocumentId() {
    // If we only have a single target object, wrap it in an array for consistency.
    const target = Array.isArray(this.target) ? this.target : [this.target];
    const docId = target
      .map(t => t.source)
      .map(s => s.split('/').splice(-3, 1).pop())
      .pop();
    return docId;
  }

  getEtag() {
    return this.etag;
  }

  getModifiedDate() {
    return new Date(this.modified);
  }

  getAnalysisModifiedDate() {
    const a = this.getAnalysis();
    return a.modified;
  }

  getText() {
    const text = this.body
      .filter(b => b.purpose === 'describing')
      .map(b => b.value)
      .pop();
    return text;
  }
}

export { MetaphorAnnotation };
