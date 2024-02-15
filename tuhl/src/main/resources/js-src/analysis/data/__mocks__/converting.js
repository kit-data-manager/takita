import { ApplicationState } from '../models';
import { MetaphorAnnotation } from '../models';
import { MRWAnnotation } from '../models';

const mockMetaphorAnnoData = {
  id: "http://localhost/wap/sfb1475/philipp/takita/54d6bfa7-3c4a-498d-9092-40c0a52d974b",
  type: "Annotation",
  etag: "\"ofbxgmiorjlmgkuhaynl\"",
  created: "2023-02-24T10:14:30Z",
  modified: "2023-02-24T10:14:31Z",
  motivation: "describing",
  creator: {
    "type" : "Person",
    "name" : "Henning"
  },
  body: [
    {
      type: "TextualBody",
      purpose: "tagging",
      value: "metaphor",
    },
    {
      type: "TextualBody",
      purpose: "describing",
      value: "Blessed [is] the man that walketh not in the counsel of the ungodly",
    },
    {
      type: "TextualBody",
      purpose: "identifying",
      value: "Book_of_Psalms1684151988148",
    },
    {
      type: "TextualBody",
      purpose: "linking",
      value: "http://localhost:8889/wap/philipp/takita/4e44c8bc-84ce-4b4b-9ef8-320c579d8470"
    },
    {
      type: "TextualBody",
      purpose: "commenting",
      value: "Just a dummy"
    },
    {
      type: "TextualBody",
      purpose: "assessing",
      value: '{"analysis_label":"","annotator":"","auxiliaryText":"","comment":"","date_created":"2023-06-21T16:14:49.386Z","date_modified":"2023-06-21T16:14:49.386Z","doc_title":"","doc_reference":"32ebbb4d-0283-45c0-8371-48ba29d99dec","file_id":"http://localhost:8889/wap/philipp/takita/8137f852-dfcc-4a3e-b97d-e9100446500c","text":{"value":"kuśa‧cīra‧parikṣiptam brāhmayā lakṣmyā samāvṛtam yathā pradīptam durdharṣam gagane sūrya‧maṇḍalam"},"propositions":[],"mappings":[],"linkings":[{"source":"Hirte","source_link":["https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343"],"target":"Gott","target_link":["https://w3id.org/MoRe-SFB1475/CT/concepts/1520345177"]},{"source":"sheep","source_link":["https://w3id.org/MoRe-SFB1475/CT/concepts/1356392694"],"target":"believer","target_link":["https://w3id.org/MoRe-SFB1475/CT/concepts/3401688171"]},{"source":"Gnu","source_link":[],"target":"Penguin","target_link":["https://w3id.org/MoRe-SFB1475/CT/concepts/3765332836","https://w3id.org/MoRe-SFB1475/CT/concepts/803141091"]}],"tertia":[],"mrws":[{"text":"brāhmayā","type":"mrw (indirect)"}]}'
    },
  ],
  target: [
    {
      type: "SpecificResource",
      selector: {
        type: "XPathSelector",
        value: "//w[@xml:id=\"w.122\"]"
      },
      source: "http://metaphors.scc.kit.edu:8080/api/v1/dataresources/d63ec633-8c1c-4fcf-9f65-94cd6d5401a7/data/Book_of_Psalms.xml"
    },
  ]
};

const mockMRWAnnoData = {
  "@context":"http:\/\/www.w3.org\/ns\/anno.jsonld",
  "id":"http:\/\/localhost:8889\/wap\/philipp\/takita\/4e44c8bc-84ce-4b4b-9ef8-320c579d8470",
  "type":"Annotation",
  "created":"2023-06-12T11:19:05Z",
  "creator":{"type":"Person","name":"Henning"},
  "modified":"2023-06-12T11:19:05Z",
  "body":[
    {"type":"TextualBody","created":"2023-06-12T11:19:05Z","creator":{"type":"Person","name":"Henning"},"modified":"2023-06-12T11:19:05Z","value":"brāhmayā","purpose":"describing"},
    {"type":"TextualBody","created":"2023-06-12T11:19:05.771264Z","creator":{"type":"Person","name":"Henning"},"modified":"2023-06-12T11:19:05.771267Z","value":"mrw (indirect)","purpose":"tagging"}
  ],
  "target":{
    "type":"SpecificResource",
    "selector":{
      "type":"XPathSelector",
      "value":"\/\/*[@xml:id=\"w.443622\"]"
    },
    "source":"http:\/\/localhost:8090\/api\/v1\/dataresources\/32ebbb4d-0283-45c0-8371-48ba29d99dec\/data\/Ram_Ar.xml"
  },
  "motivation":"describing",
  "etag":"\"vwajojxodutvnebctvxp\""
};

/**
 * @returns ApplicationState consisting entirely of dummy data
 */
const createAppState = (_metaphor, _mrws, _concepts) => {
  const metaphor = new MetaphorAnnotation(mockMetaphorAnnoData);
  const mrws = [new MRWAnnotation(mockMRWAnnoData)];
  const concepts = [];

  return new ApplicationState(metaphor, mrws, concepts);
};

export { createAppState };