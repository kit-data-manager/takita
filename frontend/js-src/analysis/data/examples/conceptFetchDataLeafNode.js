export const mockConceptFetchDataLeafNode = {
  "@context":{
    "skos":"http://www.w3.org/2004/02/skos/core#",
    "isothes":"http://purl.org/iso25964/skos-thes#",
    "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
    "owl":"http://www.w3.org/2002/07/owl#",
    "dct":"http://purl.org/dc/terms/",
    "dc11":"http://purl.org/dc/elements/1.1/",
    "uri":"@id",
    "type":"@type",
    "lang":"@language",
    "value":"@value",
    "graph":"@graph",
    "label":"rdfs:label",
    "prefLabel":"skos:prefLabel",
    "altLabel":"skos:altLabel",
    "hiddenLabel":"skos:hiddenLabel",
    "broader":"skos:broader",
    "narrower":"skos:narrower",
    "related":"skos:related",
    "inScheme":"skos:inScheme",
    "exactMatch":"skos:exactMatch",
    "closeMatch":"skos:closeMatch",
    "broadMatch":"skos:broadMatch",
    "narrowMatch":"skos:narrowMatch",
    "relatedMatch":"skos:relatedMatch"
  },
  "graph":[
    {
      "uri":"https://w3id.org/MoRe-SFB1475/CT/concepts",
      "type":"skos:ConceptScheme",
      "prefLabel":{"lang":"en","value":"Semantic Domains"}
    },
    {
      "uri":"https://w3id.org/MoRe-SFB1475/CT/concepts/2436288185",
      "type":"skos:Concept",
      "broader":{"uri":"https://w3id.org/MoRe-SFB1475/CT/concepts/756554114"},
      "skos:definition":{"lang":"en","value":"Use this domain for words related to dogs."},
      "inScheme":{"uri":"https://w3id.org/MoRe-SFB1475/CT/concepts"},
      "skos:notation":{"type":"https://w3id.org/MoRe-SFB1475/CT/TCPath","value":"6.3.1.5"},
      "prefLabel":{"lang":"en","value":"Dog"},
      "skos:scopeNote":{"lang":"en","value":"What words refer to dogs? dog, hound, canine, stray, cur, mangy. What words refer to male or female dogs? bitch. What words refer to young dogs? puppy, pup, whelp. What types of dogs are there? basset, beagle, bloodhound, boxer, bulldog, Chihuahua, collie, dachshund, Doberman, German shepherd, greyhound, husky, Pekinese, poodle, retriever, setter, spaniel, terrier. What sounds do dogs make? bark, howl, yap, growl. Where are dogs kept? doghouse, kennel."}
    },
    {
      "uri":"https://w3id.org/MoRe-SFB1475/CT/concepts/756554114",
      "type":"skos:Concept",
      "narrower":{"uri":"https://w3id.org/MoRe-SFB1475/CT/concepts/2436288185"},
      "skos:notation":{"type":"https://w3id.org/MoRe-SFB1475/CT/TCPath","value":"6.3.1"},
      "prefLabel":{"lang":"en","value":"Domesticated animal"}
    }
  ]
};