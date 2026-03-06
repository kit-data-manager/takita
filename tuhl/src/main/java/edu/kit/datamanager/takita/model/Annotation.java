package edu.kit.datamanager.takita.model;

import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.target.Target;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * The Annotation class represents the model of an annotation with all its attributes.
 */
public class Annotation {

  private String pageId;
  private String manuscriptTitle;

  @Field(type = FieldType.Nested, includeInParent = true)
  private List<TextCard> textCards = new ArrayList<>();

  //Annotation ID is whole link to annotationStore - format = DateFormat.custom, pattern = "uuuu-MM-dd'T'HH:mm:ss.SSSZ"
  @Id
  private String id;
  @Field(type = FieldType.Date)
  private Instant modified;
  private List<String> creators = new ArrayList<>();
  @Field(type = FieldType.Date)
  private Instant created;
  //contains old Annotation url, for validated annotations only
  private String via;
  //same as via
  private String canonical;

  private List<Target> targets = new ArrayList<>();

  private String motivation;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  private List<Tag> tags = new ArrayList<>();

  private boolean isAlgorithmAnnotation;
  private String etag;

  /**
   * Non args constructor (empty)
   */
  public Annotation() {}

  /**
   * Constructor to initialize properties
   * @param pageId id of page containing annotation
   * @param creators list of creators
   * @param created created date
   * @param modified modified date
   * @param linkToResource target source
   * @param selectors Json Array of selectors
   * @param motivation motivation
   * @throws JSONException
   */
  public Annotation(String pageId, List<String> creators, Instant created, Instant modified,
                    String linkToResource, JSONArray selectors, String motivation) throws JSONException {
      this.textCards = new ArrayList<>();
      this.tags = new ArrayList<>();
      this.pageId = pageId;
      this.creators = creators;
      this.created = created;
      if (modified != null) {
          this.modified = modified;
      }
      this.targets = createTargetsFromSelectors(linkToResource, selectors);
      if (motivation != null) {
        this.motivation = motivation;
      }
  }

  /**
   * Updates an annotation based on the provided properties
   * @param creators list of creators to potentially add to the annotation
   * @param linkToResource target source (should never change and would only change if selectors are also provided)
   * @param selectors list of all selectors, will replace old selectors
   * @param motivation will replace old motivation
   * @throws JSONException
   */
  public void update(List<String> creators, String linkToResource, JSONArray selectors, String motivation ) throws JSONException {
      for (String creator : creators) {
          if (!this.getCreators().contains(creator)) {
              this.addCreator(creator);
          }
      }
      this.setModified(Instant.now());
      if (selectors != null) {
          this.setTargets(createTargetsFromSelectors(linkToResource, selectors));
      }
      if (motivation != null) {
          this.setMotivation(motivation);
      }
  }

    /**
     * helper function to extract all selectors from an array and creates a target for each. If
     * there are no selectors, one target targeting the whole "page" will be created.
     * @param selectors 0 (null) to n JSONObjects holding information about the selector
     * @return list of targets
     * @throws JSONException when there is a problem with the JSON object holding the selector
     */
  private List<Target> createTargetsFromSelectors(String linkToResource, JSONArray selectors) throws JSONException {
      List<Target> targets = new ArrayList<>();
      if (selectors != null) {
          for (int i = 0; i < selectors.length(); i++) {
              Target target = new Target(linkToResource, selectors.getJSONObject(i));
              targets.add(target);
          }
      } else {
          // this branch should get reached when users create a "page"-annotation, i.e.
          // an annotation targeting the whole document/image
          // TODO: this has to be tested by someone who works with page-annotations.
          // Philipp tested it and it seems to work.
          Target target = new Target(linkToResource, null);
          targets.add(target);
      }
      return targets;
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
   * @param manuscriptTitle title to set
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
    //we ensure that textCards is always a list so that adding a new element and updating is always possible
    textCards = Objects.requireNonNullElseGet(textCardIds, ArrayList::new);
  }

  /**
   * Adds one text card to annotation.
   *
   * @param textCard to be added to text card list
   */
  public void addTextCard(TextCard textCard) {
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
    //we ensure that tags is always a list so that adding a new element and updating is always possible.
    this.tags = Objects.requireNonNullElseGet(tags, ArrayList::new);
  }

  /**
   * Adds one tag to annotation.
   *
   * @param tag to be added
   */
  public void addTag(Tag tag) {
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
              ", svgCode: " + targets.toString() +
              ", motivation: " + motivation + ", etag: " + etag +
              ", isAlgorithmAnnotation: " + isAlgorithmAnnotation +
              ", creators: " + creators.toString() + 
              ", tags: " + tags.toString() +
              ", textCards: " + textCards.toString() + "}";
  }
}

