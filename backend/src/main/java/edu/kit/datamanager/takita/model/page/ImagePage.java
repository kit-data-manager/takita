package edu.kit.datamanager.takita.model.page;

import java.time.Instant;


/**
 * The ImagePage class represents the model of a page with a scanned in Image as content.
 */
public class ImagePage extends Page {

  /**
   * Constructor for the image page.
   *
   * @param id the id of the page
   * @param resourceType resourceType of the page
   * @param pageNumber number of the page
   * @param created the date the page was created
   * @param resourceUrl URL of the image of the page
   * @param thumbResourceUrl URL of the thumbnail of the page
   */
  public ImagePage(String id, ResourceType resourceType, String pageNumber, Instant created,
                   String resourceUrl, String thumbResourceUrl) {
    super(id, resourceType, pageNumber, created, resourceUrl);
    this.thumbResourceUrl = thumbResourceUrl;
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
  public String getThumbResourceUrl() {
    return thumbResourceUrl;
  }
}
