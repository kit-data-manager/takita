package edu.kit.datamanager.takita.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.target.Target;

/**
 * The Annotation class represents the model of an annotation with all its attributes.
 */
public class Annotation {

  private String pageId;
  private String manuscriptTitle;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  private List<TextCard> textCards;

  //Annotation ID is whole link to annotationStore - format = DateFormat.custom, pattern = "uuuu-MM-dd'T'HH:mm:ss.SSSZ"
  @Id
  private String id;
  @Field(type = FieldType.Date)
  private Instant modified;
  private List<String> creators;
  @Field(type = FieldType.Date)
  private Instant created;
  //contains old Annotation url, for validated annotations only
  private String via;
  //same as via
  private String canonical;

  private Color color;
  private List<Target> targets;

  private String motivation;
  
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
    targets = new ArrayList<>();
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
   * Gets name of the manuscripts that the Annotation belongs to.
   *
   * @return manuscriptName
   */
  public String getManuscriptTitle() {
    return manuscriptTitle;
  }
  
  /**
   * Sets name of the manuscripts that the Annotation belongs to.
   *
   * @return manuscriptName
   */
  public void setManuscriptTitle(String manuscriptTitle) {
	  this.manuscriptTitle = manuscriptTitle;
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
   * Updates one text card in the annotation.
   *
   * @param textCard to be updated in the text card list
   */
  public void updateTextCard(TextCard textCard) {
    for (TextCard existingTextCard : this.textCards) {
        if (existingTextCard.getId().equals(textCard.getId())) {
            this.textCards.set(this.textCards.indexOf(existingTextCard), textCard);
            
        }
    }
    
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
  public Instant getModified() {
    return modified;
  }

  /**
   * Sets date on which annotation was last modified.
   *
   * @param modified date to be set
   */
  public void setModified(Instant modified) {
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
  public Instant getCreated() {
    return created;
  }

  /**
   * Sets date on which annotation was created.
   *
   * @param created date to be set
   */
  public void setCreated(Instant created) {
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
   * Gets targets of annotation.
   *
   * @return targets
   */
  public List<Target> getTargets() {
    return this.targets;
  }

  /**
   * Sets all targets of annotation.
   *
   * @param targets to be set
   */
  public void setTargets(List<Target> targets) {
    this.targets = targets;
  }
  
  /**
   * Adds one target to the annotation.
   *
   * @param target to be added
   */
  public void addTarget(Target target) {
    if (this.targets == null) {
        this.targets = new ArrayList<>();
      }
      this.targets.add(target);
  }

  /**
   * Gets motivation of annotation.
   *
   * @return motivation
   */
  public String getMotivation() {
    return motivation;
  }

  /**
   * Sets motivation of annotation.
   *
   * @param motivation to be set
   */
  public void setMotivation(String motivation) {
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
   * Updates one tag in the annotation.
   *
   * @param tag to be updated in the text card list
   */
  public void updateTag(Tag tag) {
    for (Tag existingTag : this.tags) {
        if (existingTag.getId().equals(tag.getId())) {
            this.tags.set(this.tags.indexOf(existingTag), tag);
            
        }
    }
    
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
  
  @Override
  public String toString(){
      return getClass().getSimpleName() + id + ": { " + "pageId: " + pageId + 
              ", modified: " + modified + ", created: " + created +
              ", via: " + via + ", canonical: " + canonical +
              ", color: " + color + ", svgCode: " + targets.toString() + 
              ", motivation: " + motivation + ", etag: " + etag +
              ", isAlgorithmAnnotation: " + isAlgorithmAnnotation +
              ", creators: " + creators.toString() + 
              ", tags: " + tags.toString() +
              ", textCards: " + textCards.toString() + "}";
  }
}

