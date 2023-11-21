import { FetchResult } from './FetchResult';
import { DetailedConcept } from '../appstate/DetailedConcept';
import {
  mockConceptFetchDataBranchNode,
  mockConceptFetchDataLeafNode,
  mockConceptFetchDataToplevelNode,
} from '../../examples';



describe('fetched toplevel concept', () => {
  let concept;

  beforeAll(async () => {
    concept = new FetchResult(mockConceptFetchDataToplevelNode);
  });

  it('can be instantiated', () => {
    expect(concept).toBeInstanceOf(FetchResult);
  });

  it('has toConcept() method', () => {
    expect(concept.toConcept).toBeDefined();
  });

  it('finds correct concept', () => {
    expect(concept.concept.prefLabel.value).toEqual('Universe, creation');
  });

  it('has actually working toConcept()', () => {
    const dc = concept.toConcept();
    expect(dc).toBeInstanceOf(DetailedConcept);
  });

  it('creates a concept with empty parent', () => {
    const dc = concept.toConcept();
    expect(dc.getParent()).toEqual({uri: undefined, prefLabel: ''});
  });
});


describe('fetched concept which has both parent and child concepts', () => {
  let concept;

  beforeEach(() => {
    concept = new FetchResult(mockConceptFetchDataBranchNode);
  });

  it('instantiates correctly', () => {
    expect(concept).toBeInstanceOf(FetchResult);
  });

  it('finds correct concept in graph', () => {
    const knownConcept =  {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150",
      "type": "skos:Concept",
      "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2994550131" },
      "skos:definition": { "lang": "en", "value": "Use this domain for words related to animal husbandry--working with animals." },
      "inScheme": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts" },
      "narrower": [
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/756554114" },
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2785982304" },
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343" },
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3201080430" },
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3957870482" },
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3715214274" },
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2028515610" },
        { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2645917290" }
      ],
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3" },
      "prefLabel": { "lang": "en", "value": "Animal husbandry" },
      "skos:scopeNote": { "lang": "en",
      "value": "What words refer to animal husbandry? animal husbandry, tame, spray (for insects), brand. What words are used of animal shelters and enclosures? shelter, barn, shed, corral, pen, stall, manger. Where do people keep birds? birdcage, chicken coop. Where do people keep fish? fish tank, fishbowl, aquarium, fishpond. Where do people keep insects? beehive. What words refer to breeding animals? breed, crossbred, crossbreed, hybrid, interbred, mongrel, stud." }
    };
    expect(concept.concept).toEqual(knownConcept);
  });

  it('finds correct parent in graph', () => {
    const knownParent = { 
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2994550131",
      "type": "skos:Concept",
      "narrower": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6" },
      "prefLabel": { "lang": "en", "value": "Work and occupation" }
    };
    expect(concept.parent).toEqual(knownParent);
  });
  
});



describe('fetched leaf concept', () => {
  let concept;

  beforeAll(async () => {
    concept = new FetchResult(mockConceptFetchDataLeafNode);
  });

  it('can be instantiated', () => {
    expect(concept).toBeInstanceOf(FetchResult);
  });

  it('has toConcept() method', () => {
    expect(concept.toConcept).toBeDefined();
  });

  it('has actually working toConcept()', () => {
    expect(concept.toConcept()).toBeInstanceOf(DetailedConcept);
  });

  it('finds the correct concept', () => {
    expect(concept.concept.prefLabel.value).toBe('Dog');
  });

  it('finds the correct parent', () => {
    expect(concept.parent.prefLabel.value).toBe('Domesticated animal');
  });
});
