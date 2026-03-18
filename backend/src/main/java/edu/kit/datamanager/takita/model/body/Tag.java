package edu.kit.datamanager.takita.model.body;

import org.springframework.data.annotation.PersistenceCreator;

import java.time.Instant;
import java.util.List;

public class Tag extends Body {

  /**
   * Constructor for Tag.
   *
   * @param id to be set
   */
  @PersistenceCreator
  public Tag(String id) {
    super(id);
    setPurpose("tagging");
  }

  /**
   * constructor for tag (body w/ purpose = "tagging"), sets all available properties.
   * If a property is not available you can use "null"; id and annotationId should be provided
   *
   * @param id of the tag
   * @param annotationId Id of Annotation to which the tag belongs
   * @param creators list of creators of tag
   * @param created date on which the tag was created
   * @param modified date on which the tag was modified
   * @param source source/textual content of a tag
   * @param subject subject of a tag
   * @param title title of a tag
   * @param value value/textual content of a tag
   */
  public Tag(String id, String annotationId, List<String> creators, Instant created, Instant modified,
              String source, String subject, String title, String value) {
    super(id, annotationId, creators, created, modified, source, subject, title, value);
    setPurpose("tagging");
  }

  /**
   * updates the given properties of the textCard
   *
   * @param creator person responsible for the change to the tag
   * @param modified date on which the tag was modified
   * @param source source/textual content of a tag
   * @param subject subject of a tag
   * @param title title of a tag
   * @param value value/textual content of a tag
   */
  public void update(String creator, Instant modified, String source, String subject, String title, String value) {
    super.update(creator, modified, source, subject, title, value);
  }
}
