package edu.kit.scc.dem.tuhl.model.page;

import edu.kit.scc.dem.tuhl.model.Annotation;
import java.util.Date;
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
  private final Date created;
  private String manuscriptId;
  private Date lastModified;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  protected List<Annotation> annotations;

  protected String resourceUrl;
  protected String thumbResourceUrl;

  /**
   * Constructor for Page, only sets Id.
   *
   * @param id to be set, only id String and not link
   * @param created the date the page was created
   */
  public Page(String id, ResourceType resourceType, String pageNumber,
              Date created, String resourceUrl) {
    this.id = id;
    this.resourceType = resourceType;
    this.pageNumber = pageNumber;
    this.created = created;
    this.resourceUrl = resourceUrl;
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
  public Date getLastModified() {
    return lastModified;
  }

  /**
   * Sets the date is was last modified.
   *
   * @param lastModified the date to set
   */
  public void setLastModified(Date lastModified) {
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
  public Date getCreated() {
    return created;
  }
  
  /**
   * Gets the url of the resource of a page.
   *
   * @return url as String
   */
  public abstract String getResourceUrl();
  
  /**
   * Gets the url of the resource of a thumbnail.
   *
   * @return url as String
   */
  public abstract String getThumbResourceUrl();
  
  
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
}

