package edu.kit.datamanager.takita.model.page;

import edu.kit.datamanager.takita.model.Annotation;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * The Page class represents the model of an abstract Page.
 */
public abstract class Page {
  @Id
  private final String id;
  private final ResourceType resourceType;
  private final String pageNumber;
  
  @Field(type = FieldType.Date)
  private final Instant created;
  private String manuscriptId;
  
  @Field(type = FieldType.Date)
  private Instant lastModified;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  protected List<Annotation> annotations;

  protected String resourceUrl;
  protected String thumbResourceUrl;

  /**
   * Constructor for Page, only sets Id.
   *
   * @param id to be set, only id String and not link
   * @param resourceType the resourceType of the page
   * @param pageNumber the identifier of the page
   * @param created the date the page was created
   * @param resourceUrl the url that points at the resource
   */
  public Page(String id, ResourceType resourceType, String pageNumber,
              Instant created, String resourceUrl) {
    this.id = id;
    this.resourceType = resourceType;
    this.pageNumber = pageNumber;
    this.created = created;
    this.resourceUrl = resourceUrl;
    this.annotations = new ArrayList<>();
  }

  /**
   * Gets Id of page.
   *
   * @return pageId
   */
  public String getId() {
    return id;
  }

  /**
   * Gets manuscript Id of manuscript to which the page belongs to.
   *
   * @return manuscriptId
   */
  public String getManuscriptId() {
    return manuscriptId;
  }

  /**
   * Sets manuscript Id of manuscript to which the page belongs to.
   *
   * @param manuscriptId to be set
   */
  public void setManuscriptId(String manuscriptId) {
    this.manuscriptId = manuscriptId;
  }

  /**
   * Gets the resource type.
   *
   * @return the resource type
   */
  public ResourceType getResourceType() {
    return resourceType;
  }

  /**
   * Gets the date it was last modified.
   *
   * @return the date
   */
  public Instant getLastModified() {
    return lastModified;
  }

  /**
   * Sets the date is was last modified.
   *
   * @param lastModified the date to set
   */
  public void setLastModified(Instant lastModified) {
    this.lastModified = lastModified;
  }

  /**
   * Gets the pageNumber.
   *
   * @return the pageNumber
   */
  public String getPageNumber() {
    return pageNumber;
  }

  /**
   * Gets the Date it was created.
   *
   * @return the Date
   */
  public Instant getCreated() {
    return created;
  }
  
  /**
   * Gets the url of the resource of a page.
   *
   * @return url as String
   */
  public abstract String getResourceUrl();

  /**
   * Gets all annotations belonging to page.
   * @return list of annotations
   */
  public List<Annotation> getAnnotations() {
    return annotations;
  }
  
  /**
   * Sets all annotation belonging to page.
   *
   * @param annotations to be set
   */
  public void setAnnotations(List<Annotation> annotations) {
    this.annotations = annotations;
  }

    /**
   * Adds an annotation to list of annotations.
   *
   * @param annotation to be added
   */
  public void addAnnotation(Annotation annotation) {
    annotations.add(annotation);
  }

  /**
   * Type getter (for usage in thymeleaf, which cannot check the instance type of a page object)
   * @return page type ("image" or "text")
   */
  public abstract String getType();
}

