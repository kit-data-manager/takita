package edu.kit.scc.dem.tuhl.dataaccess;

/**
 * Enum contains all Strings in AnnotationStoreAccess and AccessService
 * regarding the annotationStore.
 */
public enum AnnotationStoreStrings {
  ID("id"),
  ETAG("etag"),
  VIA("via"),
  CANONICAL("canonical"),
  CREATED("created"),
  CREATOR("creator"),
  MODIFIED("modified"),
  BODY("body"),
  PURPOSE("purpose"),
  TAGGING("tagging"),
  NAME("name"),
  TYPE("type"),
  PERSON("Person"),
  DC_TITLE("dc:title"),
  DC_SUBJECT("dc:subject"),
  TARGET("target"),
  SELECTOR("selector"),
  SOURCE("source"),
  MOTIVATION("motivation"),


  ANNOTATION("annotation"),
  BINDINGS("bindings"),
  RESULTS("results"),
  VALUE("value"),
  ITEMS("items"),
  NEXT("next"),

  START_URI("<uri>"),
  URI("uri"),
  END_URI("</uri>"),
  LINK_START("http://");

  private final String name;

  /**
   * Constructor for AnnotationStoreStrings.
   * @param name name of String
   */
  AnnotationStoreStrings(String name) {
    this.name = name;
  }

  /**
   * Gets the name of the String.
   * @return String name
   */
  public String getName() {
    return name;
  }
}
