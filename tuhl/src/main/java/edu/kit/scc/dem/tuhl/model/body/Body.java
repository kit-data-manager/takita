package edu.kit.scc.dem.tuhl.model.body;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import edu.kit.scc.dem.tuhl.model.Motivation;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

public abstract class Body {
  private String annotationId;
  private final String id;

  private List<String> creators;

  private Date created;
  private Date modified;


  private String title;

  //Text content
  private String value;
  private Motivation purpose;

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
  public Date getCreated() {
    return created;
  }

  /**
   * Sets date on which the body was created.
   *
   * @param created date to be set
   */
  public void setCreated(Date created) {
    this.created = created;
  }

  /**
   * Gets date on which the body was last modified.
   *
   * @return modification date
   */
  public Date getModified() {
    return modified;
  }

  /**
   * Sets date on which the body was last modified.
   *
   * @param modified date to be set.
   */
  public void setModified(Date modified) {
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
   * Gets purpose of a body.
   *
   * @return purpose
   */
  public Motivation getPurpose() {
    return purpose;
  }

  /**
   * Sets purpose of a body.
   *
   * @param purpose to be set
   */
  public void setPurpose(Motivation purpose) {
    this.purpose = purpose;
  }

  /**
   * Gets the full JSONObject containing the body.
   *
   * @return text card as JSONObject
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
}

