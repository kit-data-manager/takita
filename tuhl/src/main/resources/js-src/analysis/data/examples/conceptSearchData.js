export const mockConceptSearchData = {
  "@context":{
    "skos":"http:\/\/www.w3.org\/2004\/02\/skos\/core#",
    "isothes":"http:\/\/purl.org\/iso25964\/skos-thes#",
    "onki":"http:\/\/schema.onki.fi\/onki#",
    "uri":"@id",
    "type":"@type",
    "results":{
      "@id":"onki:results",
      "@container":"@list"
    },
    "prefLabel":"skos:prefLabel",
    "altLabel":"skos:altLabel",
    "hiddenLabel":"skos:hiddenLabel",
    "broader":"skos:broader"
  },
  "uri":"",
  "results":[
    {
      "uri":"https:\/\/w3id.org\/MoRe-SFB1475\/CT\/concepts\/3401688171",
      "type":["skos:Concept"],
      "localname":"3401688171",
      "prefLabel":"Religious person",
      "lang":"en",
      "notation":"4.9.7.1",
      "vocab":"ct",
      "broader":[{
          "uri":"https:\/\/w3id.org\/MoRe-SFB1475\/CT\/concepts\/2480737489",
          "prefLabel":"Religious organization"
      }]
    },
    {
      "uri":"https:\/\/w3id.org\/MoRe-SFB1475\/CT\/concepts\/817646690",
      "type":["skos:Concept"],
      "localname":"817646690",
      "prefLabel":"Religious purification",
      "lang":"en",
      "notation":"4.9.5.6",
      "vocab":"ct",
      "broader":[{
        "uri":"https:\/\/w3id.org\/MoRe-SFB1475\/CT\/concepts\/1749050684",
        "prefLabel":"Practice religion"
      }]
    }
  ]
};
