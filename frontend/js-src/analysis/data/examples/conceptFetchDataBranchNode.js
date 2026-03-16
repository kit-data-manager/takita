export const mockConceptFetchDataBranchNode = {
  "@context": {
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "isothes": "http://purl.org/iso25964/skos-thes#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "dct": "http://purl.org/dc/terms/",
    "dc11": "http://purl.org/dc/elements/1.1/",
    "uri": "@id",
    "type": "@type",
    "lang": "@language",
    "value": "@value",
    "graph": "@graph",
    "label": "rdfs:label",
    "prefLabel": "skos:prefLabel",
    "altLabel": "skos:altLabel",
    "hiddenLabel": "skos:hiddenLabel",
    "broader": "skos:broader",
    "narrower": "skos:narrower",
    "related": "skos:related",
    "inScheme": "skos:inScheme",
    "exactMatch": "skos:exactMatch",
    "closeMatch": "skos:closeMatch",
    "broadMatch": "skos:broadMatch",
    "narrowMatch": "skos:narrowMatch",
    "relatedMatch": "skos:relatedMatch"
  },
  "graph": [
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts",
      "type": "skos:ConceptScheme",
      "prefLabel": { "lang": "en", "value": "Semantic Domains" }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2028515610",
      "type": "skos:Concept",
      "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.3" },
      "prefLabel": { "lang": "en", "value": "Milk" }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2645917290",
      "type": "skos:Concept",
      "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.6" },
      "prefLabel": { "lang": "en", "value": "Poultry raising" }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2785982304",
      "type": "skos:Concept",
      "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.5" },
      "prefLabel": { "lang": "en", "value": "Wool production" }
    },
    { 
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2994550131",
      "type": "skos:Concept",
      "narrower": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6" },
      "prefLabel": { "lang": "en", "value": "Work and occupation" }
    },
    { 
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343",
      "type": "skos:Concept",
      "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.2" },
      "prefLabel": { "lang": "en", "value": "Tend herds in fields" }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3201080430",
      "type": "skos:Concept",
      "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.7" },
      "prefLabel": { "lang": "en", "value": "Animal products" }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3715214274",
      "type": "skos:Concept", "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.8" },
      "prefLabel": { "lang": "en", "value": "Veterinary science" }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3957870482",
      "type": "skos:Concept", "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.4" },
      "prefLabel": { "lang": "en", "value": "Butcher, slaughter" }
    },
    {
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
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/756554114",
      "type": "skos:Concept",
      "broader": { "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4169615150" },
      "skos:notation": { "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath", "value": "6.3.1" },
      "prefLabel": { "lang": "en", "value": "Domesticated animal" }
    }
  ]
};