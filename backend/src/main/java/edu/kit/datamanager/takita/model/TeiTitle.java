package edu.kit.datamanager.takita.model;


// modeled according to the TEI-guidelines:
// https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-title.html
public record TeiTitle(String content, String type, String level, String language) {}

