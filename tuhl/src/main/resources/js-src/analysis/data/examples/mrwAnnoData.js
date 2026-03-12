export const mockMRWAnnoData = {
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