export const mockConceptFetchDataToplevelNode = {
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
      "skos:hasTopConcept": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Semantic Domains"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/1284571986",
      "type": "skos:Concept",
      "broader": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1.4"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Living things"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/1466808529",
      "type": "skos:Concept",
      "broader": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1.5"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Plant"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/282313761",
      "type": "skos:Concept",
      "broader": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1.2"
      },
      "prefLabel": {
        "lang": "en",
        "value": "World"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624",
      "type": "skos:Concept",
      "skos:definition": {
        "lang": "en",
        "value": "Use this domain for general words referring to the physical universe. Some languages may not have a single word for the universe and may have to use a phrase such as 'rain, soil, and things of the sky' or 'sky, land, and water' or a descriptive phrase such as 'everything you can see' or 'everything that exists'."
      },
      "inScheme": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts"
      },
      "narrower": [
        {
          "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/1284571986"
        },
        {
          "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/665962080"
        },
        {
          "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/1466808529"
        },
        {
          "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3512167710"
        },
        {
          "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/282313761"
        },
        {
          "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4229060136"
        },
        {
          "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3838089884"
        }
      ],
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Universe, creation"
      },
      "skos:scopeNote": {
        "lang": "en",
        "value": "What words refer to everything we can see? universe, creation, cosmos, heaven and earth, macrocosm, everything that exists."
      },
      "skos:topConceptOf": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3512167710",
      "type": "skos:Concept",
      "broader": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1.7"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Nature, environment"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/3838089884",
      "type": "skos:Concept",
      "broader": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1.3"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Water"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/4229060136",
      "type": "skos:Concept",
      "broader": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1.6"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Animal"
      }
    },
    {
      "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/665962080",
      "type": "skos:Concept",
      "broader": {
        "uri": "https://w3id.org/MoRe-SFB1475/CT/concepts/2869172624"
      },
      "skos:notation": {
        "type": "https://w3id.org/MoRe-SFB1475/CT/TCPath",
        "value": "1.1"
      },
      "prefLabel": {
        "lang": "en",
        "value": "Sky"
      }
    }
  ]
};