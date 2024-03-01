package edu.kit.scc.dem.tuhl.dataaccess;

/**
 * Enum contains all Strings from RepositoryAccessService and AccessService
 * regarding the repository.
 */
public enum RepositoryStrings {
  IMAGE("IMAGE"),
  TEXT("TEXT"),
  ID("id"),
  TITLES("titles"),
  VALUE("value"),
  LINK("link"),
  TYPE("type"),
  RESOURCE_TYPE("resourceType"),
  TYPE_GENERAL("typeGeneral"),
  MANUSCRIPT_METADATA("manuscriptMetadata"),
  CREATED("CREATED"),
  MODIFIED("MODIFIED"),
  PUBLISHER("publisher"),
  PUBLICATION_YEAR("publicationYear"),
  DATES("dates"),
  PAGE_ID("pageId"),
  RESOURCE_ID("resourceId"),
  DESCRIPTION("description"),
  DESCRIPTIONS("descriptions");

  private final String name;

  /**
   * Constructor for RepositoryStrings.
   * @param name name of String
   */
  RepositoryStrings(String name) {
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
