package edu.kit.datamanager.takita.model.body;

import org.springframework.data.annotation.PersistenceConstructor;
import org.springframework.data.annotation.PersistenceCreator;

import java.time.Instant;
import java.util.List;

/**
 * The TextCard class represents the model of a TextCard with all its attributes.
 */
public class TextCard extends Body {


  /**
   * Constructor for TextCard, only sets Id.
   *
   * @param id to be set
   */
  @PersistenceCreator
  public TextCard(String id) {
    super(id);
  }

    /**
     * constructor for textCard (body w/ purpose =/= "tagging"), sets all available properties.
     * If a property is not available you can use "null"; id and annotationId should be provided
     *
     * @param id of the textCard
     * @param annotationId Id of Annotation to which the textCard belongs
     * @param creators list of creators of textCard
     * @param created date on which the textCard was created
     * @param modified date on which the textCard was modified
     * @param source source/textual content of a textCard
     * @param subject subject of a textCard
     * @param title title of a textCard
     * @param value value/textual content of a textCard
     * @param purpose purpose of the textCard
     */
    public TextCard(String id, String annotationId, List<String> creators, Instant created, Instant modified,
                String source, String subject, String title, String value, String purpose) {
    super(id, annotationId, creators, created, modified, source, subject, title, value);
    if(purpose != null && !purpose.trim().isEmpty()){
      this.setPurpose(purpose);
    }
  }

    /**
     * updates the given properties of the textCard
     *
     * @param creator person responsible for the change to the textCard
     * @param modified date on which the textCard was modified
     * @param source source/textual content of a textCard
     * @param subject subject of a textCard
     * @param title title of a textCard
     * @param value value/textual content of a textCard
     * @param purpose purpose of the textCard
     */
  public void update(String creator, Instant modified, String source, String subject, String title, String value,  String purpose) {
     super.update(creator, modified, source, subject, title, value);
     if(purpose != null && !purpose.trim().isEmpty()){
        this.setPurpose(purpose);
     }
  }
}