package edu.kit.datamanager.takita.model;

import edu.kit.datamanager.takita.mainpage.search.SearchIndexService;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceCreator;
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
  
  @Field(type = FieldType.Date)
  private final Instant created;
  
  @Field(type = FieldType.Keyword)
  private final String title;
  
  @Field(type = FieldType.Keyword)
  private final String publisher;
  
  private final int publicationYear;
  
  @Field(type = FieldType.Nested, includeInParent = true)
  private List<Page> pages;
  
  private int noPages;
  
  @Field(type = FieldType.Date)
  private Instant lastModified;
  
  private boolean hasAlgorithmAnnotations;
  
  @Field(type = FieldType.Keyword)
  private String description;

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
  public Manuscript(String id, Instant created, String title, String publisher, int publicationYear) {
    this.id = id;
    this.created = created;
    this.title = title;
    this.publisher = publisher;
    this.publicationYear = publicationYear;
    pages = new ArrayList<>();
  }

  @PersistenceCreator
  public Manuscript(String id, Instant created, String title, String publisher, int publicationYear, Instant lastModified, int noPages, List<Page> pages) {
    this.id = id;
    this.created = created;
    this.title = title;
    this.publisher = publisher;
    this.publicationYear = publicationYear;
    this.lastModified = lastModified;
    this.noPages = noPages;
    this.pages = pages;
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
  public Instant getLastModified() {
    return lastModified;
  }

  /**
   * Sets date on which the manuscript was last modified.
   *
   * @param lastModified date to be set
   */
  public void setLastModified(Instant lastModified) {
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
   * Gets description of manuscript.
   *
   * @return description
   */
  public String getDescription() {
	  return description;
  }

  /**
   * Sets description of manuscript.
   * @param description description of the manuscript
   */
  public void setDescription(String description) {
	  this.description = description;
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
  public Instant getCreated() {
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
   * @return List of TEI titles classified as series titles
   */
  public List<TeiTitle> getTeiTitleSeries() {
    return teiTitleSeries;
  }
  
  /**
   * Sets series title of manuscript.
   *
   * @param teiTitleSeries List of TEI titles classified as series titles
   */
  public void setTeiTitleSeries(List<TeiTitle> teiTitleSeries) {
    this.teiTitleSeries =  teiTitleSeries;
  }
  
  /**
   * Gets monographic title of manuscript.
   *
   * @return List of TEI titles classified as monographic titles
   */
  public List<TeiTitle> getTeiTitleMonographic() {
    return teiTitleMonographic;
  }
  
  /**
   * Sets monographic title of manuscript.
   *
   * @param teiTitleMonographic List of TEI titles classified as monographic
   */
  public void setTeiTitleMonographic(List<TeiTitle> teiTitleMonographic) {
    this.teiTitleMonographic =  teiTitleMonographic;
  }
  
  /**
   * Gets analytic title of manuscript.
   *
   * @return List of TEI titles classified as analytical
   */
  public List<TeiTitle> getTeiTitleAnalytic() {
    return teiTitleAnalytic;
  }
  
  /**
   * Sets analytic title of manuscript.
   *
   * @param teiTitleAnalytic List of TEI titles classified as analytical
   */
  public void setTeiTitleAnalytic(List<TeiTitle> teiTitleAnalytic) {
    this.teiTitleAnalytic =  teiTitleAnalytic;
  }
  
  /**
   * Gets default title of manuscript.
   *
   * @return List of TEI titles not classified
   */
  public List<TeiTitle> getTeiTitle() {
	return teiTitle;
  }
	
  /**
   * Sets default title of manuscript.
   *
   * @param teiTitle List of TEI titles not classified
   */
  public void setTeiTitle(List<TeiTitle> teiTitle) {
	this.teiTitle = teiTitle;
  }

/**
   * Gets author of manuscript.
   *
   * @return List of authors as String
   */
  public List<String> getTeiAuthor() {
    return teiAuthor;
  }
  
  /**
   * Sets author of manuscript.
   *
   * @param teiAuthor List of TEI authors
   */
  public void setTeiAuthor(List<String> teiAuthor) {
    this.teiAuthor =  teiAuthor;
  }
  
  /**
   * Gets creation date of manuscript.
   *
   * @return List of TEI dates
   */
  public List<TeiDate> getTeiManuscriptCreationDate() {
    return teiManuscriptCreationDate;
  }
  
  /**
   * Sets creation date of manuscript.
   *
   * @param teiManuscriptCreationDate List of TEI dates
   */
  public void setTeiManuscriptCreationDate(List<TeiDate> teiManuscriptCreationDate) {
    this.teiManuscriptCreationDate =  teiManuscriptCreationDate;
  }

  /**
   * Gets the list of default TEI titles in String format
   * @return Main title + additional titles in brackets
   */
  public String getDefaultTitlesAsString() {
    return titleListToString(teiTitle);
  }

  // the following AsString()-functions are called by the editor thymeleaf templates
  /**
   * Gets the list of monographic TEI titles in String format
   * @return Main title + additional titles in brackets
   */
  public String getMonographicTitlesAsString() {
    return titleListToString(teiTitleMonographic);
  }

  /**
   * Gets the list of analytical TEI titles in String format
   * @return Main title + additional titles in brackets
   */
  public String getAnalyticTitlesAsString() {
    return titleListToString(teiTitleAnalytic);
  }

  /**
   * Gets the list of series TEI titles in String format
   * @return Main title + additional titles in brackets
   */
  public String getSeriesTitlesAsString() {
    return titleListToString(teiTitleSeries);
  }

  /**
   * Concatenate a list of TEI MD titles into a string, where all entries apart from
   * the first one are surrounded by brackets.
   * 
   * @param titleList to be concatenated
   * @return concatenated List as String. First title followed by other titles in brackets
   */
  private String titleListToString(List<TeiTitle> titleList) {
	if (titleList.isEmpty()) {
      return "";
    }

    String mainTitle = titleList.getFirst().content();

    if (titleList.size() > 1) {
      String remainingTitles = titleList.stream()
              .skip(1)
              .map(TeiTitle::content)
              .collect(Collectors.joining("; "));
      return mainTitle + " (" + remainingTitles + ")";
    }
    return mainTitle;
  }
  
  /**
   * Concatenate a list of TEI MD authors into a string
   *
   * @return concatenated List as String
   */
  public String getAuthorsAsString() {
	  return String.join(", ", teiAuthor);
  }
  
  /**
   * Concatenate a list of TEI MD creation dates into a string
   *
   * @return concatenated List as String
   */
  public String getCreationDatesAsString() {
	  List<String> results = new ArrayList<String>();
	  for (TeiDate date : teiManuscriptCreationDate) {
		  String dateString = date.getContent();
		  if (date.getType() != null) {
			  dateString = dateString + " (" + date.getType() + ")";
		  }
		  results.add(dateString);
		  
	  }
	  return String.join(", ", results);
  }
}

	
