package edu.kit.scc.dem.tuhl.model.page;

import java.util.Date;

/**
 * The TextPage class represents the model of a page with a txt document as content.
 */
public class TextPage extends Page {

  private String content;

  /**
   * Constructor for the text page.
   *
   * @param id the id of the page
   * @param created the date the page was created
   */
  public TextPage(String id, String pageNumber, Date created, String resourceUrl) {
    super(id, ResourceType.TEXT, pageNumber, created, resourceUrl);
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
