package edu.kit.scc.dem.tuhl.model;

import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * The Annotation class represents the model of an annotation with all its attributes.
 */
public class Annotation {

  private String pageId;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  private List<TextCard> textCards;

  //Annotation ID is whole link to annotationStore
  @Id
  private String id;
  private Date modified;
  private List<String> creators;
  private Date created;
  //contains old Annotation url, for validated annotations only
  private String via;
  //same as via
  private String canonical;

  private Color color;
  private String svgCode;

  private Motivation motivation;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  private List<Tag> tags;

  private boolean isAlgorithmAnnotation;
  private String etag;

  /**
   * Constructor, initializes lists.
   */
  public Annotation() {
    textCards = new ArrayList<>();
    tags = new ArrayList<>();
    creators = new ArrayList<>();
  }

  /**
   * Gets page Id of Page that the Annotation belongs to.
   *
   * @return pageId
   */
  public String getPageId() {
    return pageId;
  }

  /**
   * Sets page ID of page that the annotation belongs to.
   *
   * @param id pageId
   */
  public void setPageId(String id) {
    pageId = id;
  }


  /**
   * Gets all Ids of text cards that belong to the annotation.
   *
   * @return text card Idx
   */
  public List<TextCard> getTextCards() {
    return textCards;
  }

  /**
   * Gets all Ids of text cards that belong to the annotation.
   *
   * @param textCardIds to be set
   */
  public void setTextCards(List<TextCard> textCardIds) {
    this.textCards = textCardIds;
  }

  /**
   * Adds one text card to annotation.
   *
   * @param textCard to be added to text card list
   */
  public void addTextCard(TextCard textCard) {
    if (textCards == null) {
      textCards = new ArrayList<>();
    }
    this.textCards.add(textCard);
    
  }

  /**
   * Gets id of annotation, which is the complete link to the AnnotationStore.
   *
   * @return annotation id
   */
  public String getId() {
    return id;
  }

  /**
   * Sets id of annotation, which is the complete link to the AnnotationStore.
   *
   * @param id to be set
   */
  public void setId(String id) {
    this.id = id;
  }

  /**
   * Gets date on which annotation was last modified.
   *
   * @return modification date
   */
  public Date getModified() {
    return modified;
  }

  /**
   * Sets date on which annotation was last modified.
   *
   * @param modified date to be set
   */
  public void setModified(Date modified) {
    this.modified = modified;
  }

  /**
   * Gets list of creators of annotation.
   *
   * @return creators
   */
  public List<String> getCreators() {
    return creators;
  }

  /**
   * Sets creators of annotation.
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
   * Gets date on which annotation was created.
   *
   * @return creation date
   */
  public Date getCreated() {
    return created;
  }

  /**
   * Sets date on which annotation was created.
   *
   * @param created date to be set
   */
  public void setCreated(Date created) {
    this.created = created;
  }

  /**
   * Gets via field. If annotation is validated it contains url
   * of algorithm annotation it belongs to.
   *
   * @return via url
   */
  public String getVia() {
    return via;
  }

  /**
   * Sets via field. If annotation is validated it contains url
   * of algorithm annotation it belongs to.
   *
   * @param via url to be set
   */
  public void setVia(String via) {
    this.via = via;
  }

  /**
   * Gets canonical field. If annotation is validated it contains url
   * of algorithm annotation it belongs to.
   *
   * @return canonical url
   */
  public String getCanonical() {
    return canonical;
  }

  /**
   * Sets canonical field. If annotation is validated it contains url
   * of algorithm annotation it belongs to.
   *
   * @param canonical url to be set
   */
  public void setCanonical(String canonical) {
    this.canonical = canonical;
  }

  /**
   * Gets color of annotation.
   *
   * @return color
   */
  public Color getColor() {
    return color;
  }

  /**
   * Sets color of annotation.
   *
   * @param color to be set
   */
  public void setColor(Color color) {
    this.color = color;
  }

  /**
   * Gets SVG code of annotation.
   *
   * @return svg code
   */
  public String getSvgCode() {
    return svgCode;
  }

  /**
   * Sets SVG code of annotation.
   *
   * @param svgCode to be set
   */
  public void setSvgCode(String svgCode) {
    this.svgCode = svgCode;
  }

  /**
   * Gets motivation of annotation.
   *
   * @return motivation
   */
  public Motivation getMotivation() {
    return motivation;
  }

  /**
   * Sets motivation of annotation.
   *
   * @param motivation to be set
   */
  public void setMotivation(Motivation motivation) {
    this.motivation = motivation;
  }

  /**
   * Gets Tags of annotation.
   *
   * @return list of tags
   */
  public List<Tag> getTags() {
    return tags;
  }

  /**
   * Sets all Tags of annotation.
   *
   * @param tags to be set
   */
  public void setTags(List<Tag> tags) {
    this.tags = tags;
  }

  /**
   * Adds one tag to annotation.
   *
   * @param tag to be added
   */
  public void addTag(Tag tag) {
    if (tags == null) {
      tags = new ArrayList<>();
    }
    this.tags.add(tag);
  }

  /**
   * Gets boolean if annotation was created by algorithm.
   *
   * @return boolean isAlgorithmAnnotation
   */
  public boolean getIsAlgorithmAnnotation() {
    return isAlgorithmAnnotation;
  }

  /**
   * Sets boolean if annotation was created by algorithm.
   *
   * @param isAlgorithmAnnotation boolean
   */
  public void setIsAlgorithmAnnotation(boolean isAlgorithmAnnotation) {
    this.isAlgorithmAnnotation = isAlgorithmAnnotation;
  }

  /**
   * Gets ETag of Annotation for checking if it was unknowingly modified.
   *
   * @return String ETag
   */
  public String getEtag() {
    return etag;
  }

  /**
   * Sets ETag of Annotation.
   *
   * @param etag String
   */
  public void setEtag(String etag) {
    this.etag = etag;
  }
}
