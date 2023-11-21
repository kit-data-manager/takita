import { BasicConcept } from './BasicConcept';
import { DetailedConcept } from '../appstate/DetailedConcept';

class FetchResult extends BasicConcept {
  constructor(data) {
    super();
    if (!data.graph) {
      throw new TypeError(data);
    }
    
    const { concept, parent } = this.findFetchedObject(data.graph);
    //console.log(concept);

    if (!concept) {
      throw new TypeError(JSON.stringify(concept));
    }
    this.concept = concept;
    this.parent = parent;
  }

  /**
   * When only looking at the graph, there is no clear indication which concept
   * was the one we have originally fetched. Since we don't want to store the
   * URI separately, we need some heuristic to find it without context knowledge.
   * 
   * @param {Object} graph
   * @returns {Object} fetched concept and its parent
   */
  findFetchedObject(graph) {
    let concept;
    const concepts = graph.filter(node => node.type !== 'skos:ConceptScheme');
    
    // If there is a concept which has both broader and narrower included, we have found it.
    concept = concepts.filter(node => node.broader && node.narrower).pop();
    // Else, there are two cases:
    // If the concept which we are looking for is a toplevel concept, it will have many
    // narrower entries, but no broader entry. All the other listed concepts will have a
    // broader entry but no narrower ones.
    // If it is a leaf concept instead, it will have one (or more?)
    // broader entries, but no narrower ones. The parent concept will only have one
    // narrower concept listed, and no broader.
    if (!concept) {
      const withNarrower = concepts.filter(node => node.narrower && !node.broader);
      const withBroader = concepts.filter(node => !node.narrower && node.broader);

      if (withBroader.length > 1 & withNarrower.length === 1) {
        concept = withNarrower.pop();
      }
      else {
        concept = withBroader.pop();
      }
    }
   
    const parent = concepts.filter(node => node.narrower?.uri === concept?.uri).pop();
    return { concept, parent };
  }

  /**
   * Transform a fetched concept into a detailed concept suitable for
   * consumption by the UI.
   * 
   * @returns {DetailedConcept}
   */
  toConcept() {
    const n = this.concept["skos:notation"];
    const d = {
      notation: n?.value,
      prefLabel: this.concept.prefLabel.value,
      uri: this.concept.uri,
      parentLabel: this.parent?.prefLabel.value || '',
      parentUri: this.parent?.uri,
    };

    const concept = new DetailedConcept(d);
    return concept;
  }
}

export { FetchResult };