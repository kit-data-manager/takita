package edu.kit.datamanager.takita.model.body;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceCreator;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * Model class for anntoation bodies
 * See <a href="https://www.w3.org/TR/annotation-model/#bodies-and-targets">WADM: Bodies and Targets</a>
 */
public abstract class Body {
  private String annotationId;
  
  @Id
  private final String id;

  private List<String> creators;

  // format = DateFormat.custom, pattern = "uuuu-MM-dd'T'HH:mm:ss.SSSZ"
  @Field(type = FieldType.Date)
  private Instant created;
  @Field(type = FieldType.Date)
  private Instant modified;


  private String title;
  private String subject;

  //Text content can either be stored in value or source
  private String value;
  private String source;
  
  private String purpose;

  private String fullJson;

  /**
   * Constructor for Body, only sets Id.
   *
   * @param id to be set
   */
  @PersistenceCreator
  public Body(String id) {
    this.id = id;
    creators = new ArrayList<>();
  }

    /**
     * constructor for body, sets all available properties.
     * If a property is not available you can use "null"; id and annotationId should be provided
     *
     * @param id of the body
     * @param annotationId Id of Annotation to which the body belongs
     * @param creators list of creators of body
     * @param created date on which the body was created
     * @param modified date on which the body was modified
     * @param source source/textual content of a body
     * @param subject subject of a body
     * @param title title of a body
     * @param value value/textual content of a body
     */
    public Body(String id, String annotationId, List<String> creators, Instant created, Instant modified,
                String source, String subject, String title, String value) {
        this.id = id;
        this.annotationId = annotationId;

        if (creators != null) {
            this.creators = creators;
        } else {
            this.creators = new ArrayList<>();
        }

        if (created != null) {
            this.created = created;
        }

        if (modified != null) {
            this.modified = modified;
        }

        if (title != null && !title.trim().isEmpty()) {
            this.title = title;
        }

        if (subject != null && !subject.trim().isEmpty()) {
            this.subject = subject;
        }

        if (value != null && !value.trim().isEmpty()) {
            this.value = value;
        }

        if (source != null && !source.trim().isEmpty()) {
            this.source = source;
        }
    }

  /**
   * Gets Annotation Id of Annotation to which the body belongs.
   *
   * @return AnnotationId
   */
  public String getAnnotationId() {
    return annotationId;
  }

  /**
   * Sets Annotation Id of Annotation to which the body belongs.
   *
   * @param annotationId to be set
   */
  public void setAnnotationId(String annotationId) {
    this.annotationId = annotationId;
  }

  /**
   * Gets Id of body.
   *
   * @return id
   */
  public String getId() {
    return id;
  }

  /**
   * Gets list of creators of body.
   *
   * @return creators
   */
  public List<String> getCreators() {
    return creators;
  }

  /**
   * Sets list of creators of body.
   *
   * @param creators to be set
   */
  public void setCreators(List<String> creators) {
    this.creators = creators;
  }

  /**
   * Adds a creator to the list of creators.
   *
   * @param creator to be added
   */
  public void addCreator(String creator) {
    creators.add(creator);
  }

  /**
   * Gets date on which the body was created.
   *
   * @return creation date
   */
  public Instant getCreated() {
    return created;
  }

  /**
   * Sets date on which the body was created.
   *
   * @param created date to be set
   */
  public void setCreated(Instant created) {
    this.created = created;
  }

  /**
   * Gets date on which the body was last modified.
   *
   * @return modification date
   */
  public Instant getModified() {
    return modified;
  }

  /**
   * Sets date on which the body was last modified.
   *
   * @param modified date to be set.
   */
  public void setModified(Instant modified) {
    this.modified = modified;
  }

  /**
   * Gets title of a body.
   *
   * @return title
   */
  public String getTitle() {
    return title;
  }

  /**
   * Sets title of a body.
   * @param title to be set
   */
  public void setTitle(String title) {
    this.title = title;
  }
  
    /**
   * Gets subject of a body.
   *
   * @return subject
   */
  public String getSubject() {
    return subject;
  }

  /**
   * Sets subject of a body.
   * @param subject to be set
   */
  public void setSubject(String subject) {
    this.subject = subject;
  }

  /**
   * Gets value/textual content of a body.
   *
   * @return value
   */
  public String getValue() {
    return value;
  }

  /**
   * Sets value/textual content of a body.
   *
   * @param value / textual content to be set
   */
  public void setValue(String value) {
    this.value = value;
  }
  
    /**
   * Gets source/textual content of a body.
   *
   * @return source
   */
  public String getSource() {
    return source;
  }

  /**
   * Sets source/textual content of a body.
   *
   * @param source / textual content to be set
   */
  public void setSource(String source) {
    this.source = source;
  }

  /**
   * Gets purpose of a body.
   *
   * @return purpose
   */
  public String getPurpose() {
    return purpose;
  }

  /**
   * Sets purpose of a body.
   *
   * @param purpose to be set
   */
  public void setPurpose(String purpose) {
    this.purpose = purpose;
  }

  /**
   * Gets the full JSONObject containing the body.
   *
   * @return text card as JSONObject
   * @throws JSONException if the JSON from the annotation store could not be parsed to a JSONObject
   */
  public JSONObject getFullJson() throws JSONException {
    if (fullJson != null) {
      return new JSONObject(fullJson);
    } else {
      return new JSONObject();
    }
  }

  /**
   * Sets the JSONObject containing the full body.
   *
   * @param json full text card
   */
  public void setFullJson(JSONObject json) {
    this.fullJson = json.toString();
  }

  /**
  * Compare function for bodies
  * @param body body, to compare the current body with
  * @return true if bodies have equivalent json representation, false otherwise
  */
  public boolean equals(Body body) {
      return (this.fullJson.equals(body.fullJson));
  }

    /**
     * updates the given properties of the body
     *
     * @param creator person responsible for the change to the body
     * @param modified date on which the body was modified
     * @param source source/textual content of a body
     * @param subject subject of a body.
     * @param title title of a body.
     * @param value value/textual content of a body
     */
  public void update(String creator, Instant modified, String source, String subject, String title, String value) {
      if (!this.creators.contains(creator)) {
          this.creators.add(creator);
      }
      this.modified = modified;
      if (title != null && !title.trim().isEmpty()) {
          this.setTitle(title);
      }

      if (subject != null && !subject.trim().isEmpty()) {
          this.setSubject(subject);
      }

      if (value != null && !value.trim().isEmpty()) {
          this.setValue(value);
      }

      if (source != null && !source.trim().isEmpty()) {
          this.setSource(source);
      }
  }

  @Override
  public String toString(){
      return getClass().getSimpleName() + id + ": " + fullJson;
  }
}

