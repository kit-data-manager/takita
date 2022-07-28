package edu.kit.scc.dem.tuhl.model.page;

import java.util.ArrayList;
import java.util.Date;


/**
 * The ImagePage class represents the model of a page with a scanned in Image as content.
 */
public class ImagePage extends Page {

  /**
   * Constructor for the image page.
   *
   * @param id the id of the page
   * @param pageNumber number of the page
   * @param created the date the page was created
   * @param resourceUrl URL of the image of the page
   * @param thumbResourceUrl URL of the thumbnail of the page
   */
  public ImagePage(String id, String pageNumber, Date created,
                   String resourceUrl, String thumbResourceUrl) {
    super(id, ResourceType.IMAGE, pageNumber, created, resourceUrl);
    annotations = new ArrayList<>();
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
