package edu.kit.scc.dem.tuhl.model;

import edu.kit.scc.dem.tuhl.mainpage.search.SearchIndexService;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;


/**
 * The manuscript class represents the model of a manuscript with all ist attributes.
 * It is used to create the SearchIndex.
 */
@Document(indexName = SearchIndexService.INDEX_NAME)
public class Manuscript {

  @Id
  @Field(type = FieldType.Keyword)
  private final String id;
  
  private final Date created;
  
  @Field(type = FieldType.Keyword)
  private final String title;
  
  @Field(type = FieldType.Keyword)
  private final String publisher;
  
  private final int publicationYear;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  private List<Page> pages;
  
  private int noPages;
  
  private Date lastModified;
  
  private boolean hasAlgorithmAnnotations;
  
  /**
   * Constructor for Manuscript.
   *
   * @param id the id of the manuscript, not the whole link
   * @param created the date it was created
   * @param title the title
   * @param publisher the publisher
   * @param publicationYear the publication year
   */
  public Manuscript(String id, Date created, String title, String publisher, int publicationYear) {
    this.id = id;
    this.created = created;
    this.title = title;
    this.publisher = publisher;
    this.publicationYear = publicationYear;
    pages = new ArrayList<>();
  }

  /**
   * Gets Id of manuscript.
   *
   * @return id
   */
  public String getId() {
    return id;
  }

  /**
   * Gets pages of all pages belonging to this manuscript.
   *
   * @return pages
   */
  public List<Page> getPages() {
    return pages;
  }

  public Map<String, Page> getPageMap() {
      Map<String, Page> pageMap = new HashMap<String, Page>();
      for (Page p: pages) {
        pageMap.put(p.getId(), p);
      }
      return pageMap;
  }

  /**
   * Sets pages of all pages belonging to this manuscript.
   *
   * @param pages to be set
   */
  public void setPages(List<Page> pages) {
    this.pages = pages;
    noPages = pages.size();

    for (Page page : pages) {
      if (page.getResourceType() == ResourceType.IMAGE && page.getAnnotations() != null) {
        for (Annotation annotation : page.getAnnotations()) {
          if (annotation.getIsAlgorithmAnnotation()) {
            setHasAlgorithmAnnotations(true);
            return;
          }
        }
      }
    }
  }

  /**
   * Gets date on which the manuscript was last modified.
   *
   * @return last modification date
   */
  public Date getLastModified() {
    return lastModified;
  }

  /**
   * Sets date on which the manuscript was last modified.
   *
   * @param lastModified date to be set
   */
  public void setLastModified(Date lastModified) {
    this.lastModified = lastModified;
  }

  /**
   * Gets title of manuscript.
   *
   * @return title
   */
  public String getTitle() {
    return title;
  }

  /**
   * Gets publisher of manuscript.
   *
   * @return publisher
   */
  public String getPublisher() {
    return publisher;
  }

  /**
   * Gets publication year of manuscript.
   *
   * @return publication year
   */
  public int getPublicationYear() {
    return publicationYear;
  }

  /**
   * Gets the date the manuscript was created.
   *
   * @return the date
   */
  public Date getCreated() {
    return created;
  }

  /**
   * Gets has algorithm annotations boolean.
   *
   * @return if Manuscript has algorithm annotations
   */
  public boolean hasAlgorithmAnnotations() {
    return hasAlgorithmAnnotations;
  }

  /**
   * Sets has algorithm annotations boolean.
   *
   * @param hasAlgorithmAnnotations boolean to be set
   */
  public void setHasAlgorithmAnnotations(boolean hasAlgorithmAnnotations) {
    this.hasAlgorithmAnnotations = hasAlgorithmAnnotations;
  }
  
  /**
   * Gets the number of pages.
   *
   * @return the number of pages
   */
  public int getNoPages() {
    return noPages;
  }
  
  /**
   * Sets the number of pages.
   *
   * @param noPages to set
   */
  public void setNoPages(int noPages) {
    this.noPages = noPages;
  }
}
