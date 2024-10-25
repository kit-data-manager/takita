package edu.kit.datamanager.takita.model.body;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

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
  public Body(String id) {
    this.id = id;
    creators = new ArrayList<>();
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
  
  public boolean equals(Body body) {
      return (this.fullJson.equals(body.fullJson));
  }
  
  @Override
  public String toString(){
      return getClass().getSimpleName() + id + ": " + fullJson;
  }
}

