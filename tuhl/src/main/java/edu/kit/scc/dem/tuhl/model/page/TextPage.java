package edu.kit.scc.dem.tuhl.model.page;

import java.util.ArrayList;
import java.time.Instant;

/**
 * The TextPage class represents the model of a page with a txt document as content.
 */
public class TextPage extends Page {

  private String content;

  /**
   * Constructor for the text page.
   *
   * @param id the id of the page
   * @param pageNumber number of the page
   * @param created the date the page was created
   * @param resourceUrl URL of the resource of the page
   */
  public TextPage(String id, ResourceType resourceType, String pageNumber, Instant created, String resourceUrl) {
    super(id, resourceType, pageNumber, created, resourceUrl);
    annotations = new ArrayList<>();
  }
  
  /**
   * Gets txt document of page.
   *
   * @return txt document
   */
  public String getContent() {
    return content;
  }

  /**
   * Sets txt document of page.
   *
   * @param content txt to be set
   */
  public void setContent(String content) {
    this.content = content;
  }

  /**
   * Gets the URL of the image resource.
   *
   * @return URL as String
   */
  @Override
  public String getResourceUrl() {
    return resourceUrl;
  }

  /**
   * Gets the URL of the thumbnail resource.
   *
   * @return URL as String
   */
  @Override
  public String getThumbResourceUrl() {
    return thumbResourceUrl;
  }
}
