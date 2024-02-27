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
  
  // variables obtained from manuscript_metadata.xml
  // for the various title levels consult:
  // https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-title.html
  private List<TeiTitle> teiTitleSeries;
  
  private List<TeiTitle> teiTitleMonographic;
  
  private List<TeiTitle> teiTitleAnalytic;
  
  // default title used when no title levels are used
  private List<TeiTitle> teiTitle;
  
  private List<String> teiAuthor;
  
  private List<TeiDate> teiManuscriptCreationDate;
  
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
  
  /**
   * Gets series title of manuscript.
   *
   * @return teiTitle
   */
  public List<TeiTitle> getTeiTitleSeries() {
    return teiTitleSeries;
  }
  
  /**
   * Sets series title of manuscript.
   *
   * @param teiTitle
   */
  public void setTeiTitleSeries(List<TeiTitle> teiTitleSeries) {
    this.teiTitleSeries =  teiTitleSeries;
  }
  
  /**
   * Gets monographic title of manuscript.
   *
   * @return teiTitle
   */
  public List<TeiTitle> getTeiTitleMonographic() {
    return teiTitleMonographic;
  }
  
  /**
   * Sets monographic title of manuscript.
   *
   * @param teiTitle
   */
  public void setTeiTitleMonographic(List<TeiTitle> teiTitleMonographic) {
    this.teiTitleMonographic =  teiTitleMonographic;
  }
  
  /**
   * Gets analytic title of manuscript.
   *
   * @return teiTitle
   */
  public List<TeiTitle> getTeiTitleAnalytic() {
    return teiTitleAnalytic;
  }
  
  /**
   * Sets analytic title of manuscript.
   *
   * @param teiTitle
   */
  public void setTeiTitleAnalytic(List<TeiTitle> teiTitleAnalytic) {
    this.teiTitleAnalytic =  teiTitleAnalytic;
  }
  
  /**
   * Gets default title of manuscript.
   *
   * @return teiTitle
   */
  public List<TeiTitle> getTeiTitle() {
	return teiTitle;
  }
	
  /**
   * Sets default title of manuscript.
   *
   * @param teiTitle
   */
  public void setTeiTitle(List<TeiTitle> teiTitle) {
	this.teiTitle = teiTitle;
  }

/**
   * Gets author of manuscript.
   *
   * @return teiTitle
   */
  public List<String> getTeiAuthor() {
    return teiAuthor;
  }
  
  /**
   * Sets author of manuscript.
   *
   * @param teiTitle
   */
  public void setTeiAuthor(List<String> teiAuthor) {
    this.teiAuthor =  teiAuthor;
  }
  
  /**
   * Gets creation date of manuscript.
   *
   * @return teiTitle
   */
  public List<TeiDate> getTeiManuscriptCreationDate() {
    return teiManuscriptCreationDate;
  }
  
  /**
   * Sets creation date of manuscript.
   *
   * @param teiTitle
   */
  public void setTeiManuscriptCreationDate(List<TeiDate> teiManuscriptCreationDate) {
    this.teiManuscriptCreationDate =  teiManuscriptCreationDate;
  }
  
  // the following toString()-functions are called by the editor thymeleaf templates
  /**
   * Concatenate a list of titles into a string, where all entries apart from
   * the first one are surrounded by brackets.
   * 
   * @param List of titles to be concatenated
   * @return concatenated List as String
   */
  public String titleListToString(List<TeiTitle> titleList) {
	  String result = titleList.get(0).getContent();
	  titleList.remove(0);

	  if (titleList.size() >= 1) {
		  List<String> titleContents = new ArrayList();
		  // storing the titles to be able to join them
		  for (TeiTitle title : titleList) {
			  titleContents.add(title.getContent());
		  }
		  result = result + " (" + String.join("; ", titleContents) + ")";
	  }
	  return result;
  }
  
  /**
   * Concatenate a list of authors into a string
   * 
   * @param List of Strings to be concatenated
   * @return concatenated List as String
   */
  public String authorListToString(List<String> authorList) {
	  return String.join(", ", authorList);
  }
  
  /**
   * Concatenate a list of dates into a string
   * 
   * @param List of dates to be concatenated
   * @return concatenated List as String
   */
  public String dateListToString(List<TeiDate> dateList) {
	  List<String> results = new ArrayList<String>();
	  for (TeiDate date : dateList) {
		  String dateString = date.getContent();
		  if (date.getType() != null) {
			  dateString = dateString + " (" + date.getType() + ")";
		  }
		  results.add(dateString);
		  
	  }
	  return String.join(", ", results);
  }
}

	
