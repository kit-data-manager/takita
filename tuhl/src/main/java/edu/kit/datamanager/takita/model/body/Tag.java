package edu.kit.datamanager.takita.model.body;

public class Tag extends Body {

  /**
   * Constructor for Tag.
   *
   * @param id to be set
   */
  public Tag(String id) {
    super(id);
    setPurpose("tagging");
  }
}
