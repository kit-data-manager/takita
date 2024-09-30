package edu.kit.scc.dem.tuhl.dataaccess;

import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.TeiDate;
import edu.kit.scc.dem.tuhl.model.TeiTitle;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;
import edu.kit.scc.dem.tuhl.model.page.TextPage;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;
import java.io.StringReader;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * Class responsible for converting manuscripts from JSON to Manuscript Object.
 */
class ManuscriptConverter {

  private static final Logger logger = LoggerFactory.getLogger(ManuscriptConverter.class);
  private IRepositoryAccessService repositoryAccessService;
  private IAnnotationStoreAccessService annotationStoreAccessService;
  private AnnotationConverter annotationConverter;

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param annotationStoreAccessService instance of IAnnotationStoreAccessService
   * @param repositoryAccessService instance of IRepositoryAccessService
   */
  public ManuscriptConverter(IRepositoryAccessService repositoryAccessService,
                             IAnnotationStoreAccessService annotationStoreAccessService) {
    this.repositoryAccessService = repositoryAccessService;
    this.annotationStoreAccessService = annotationStoreAccessService;
    this.annotationConverter = new AnnotationConverter(annotationStoreAccessService, repositoryAccessService);
  }

  public Manuscript buildManuscriptFromJson(
      JSONObject manuscriptJson, Map<String, List<Annotation>> sortedAnnotations)
      throws JSONException, IOException, InterruptedException {

    final String id = manuscriptJson.getString(RepositoryStrings.ID.getName());
    //Sets attributes if they are specified in the json.
    String publisher = null;
    if (manuscriptJson.has(RepositoryStrings.PUBLISHER.getName())) {
      publisher = manuscriptJson.getString(RepositoryStrings.PUBLISHER.getName());
    }
    int publicationYear = -1;
    if (manuscriptJson.has(RepositoryStrings.PUBLICATION_YEAR.getName())) {
      publicationYear = Integer.parseInt(manuscriptJson.getString(
          RepositoryStrings.PUBLICATION_YEAR.getName()));
    }
    String title = null;
    if (manuscriptJson.has(RepositoryStrings.TITLES.getName())) {
      title = manuscriptJson.getJSONArray(RepositoryStrings.TITLES.getName()).getJSONObject(0)
          .getString(RepositoryStrings.VALUE.getName());
    }

    String description = null;
    if (manuscriptJson.has(RepositoryStrings.DESCRIPTIONS.getName())) {
    	JSONArray descriptionsJson = manuscriptJson.getJSONArray(RepositoryStrings.DESCRIPTIONS.getName());
    	if (descriptionsJson.length() > 0) {
    		description = descriptionsJson.getJSONObject(0).getString(RepositoryStrings.DESCRIPTION.getName());
    	}
    }
    
    Instant created = extractInstantFromJsonManuscript(manuscriptJson,
        RepositoryStrings.CREATED.getName());
    Instant modified;
    if (extractInstantFromJsonManuscript(manuscriptJson,
        RepositoryStrings.MODIFIED.getName()) != null) {
      modified = extractInstantFromJsonManuscript(manuscriptJson,
          RepositoryStrings.MODIFIED.getName());
    } else {
      modified = created;
    }

    Manuscript manuscript = new Manuscript(id, created, title, publisher, publicationYear);
    manuscript.setLastModified(modified);
    if (description != null) {
    	manuscript.setDescription(description);
    }

    //Retrieves pages from the page assignment.
    // Adds the pages after their creation to the manuscript.
    JSONArray pageAssignments = repositoryAccessService
        .getPageAssignmentForManuscriptId(manuscript.getId());
    List<Page> pages = new ArrayList<>();
    for (int i = 0; i < pageAssignments.length(); i++) {
      JSONObject assignment = pageAssignments.getJSONObject(i);
      JSONObject pageJson = repositoryAccessService.getPageById(assignment.getString(
          RepositoryStrings.RESOURCE_ID.getName()));
      String pageNumber = assignment.getString(RepositoryStrings.PAGE_ID.getName());
      Page page;
      if (sortedAnnotations == null) {
        page = buildPageFromJson(pageJson, pageNumber, null);
      } else {
        page = buildPageFromJson(pageJson, pageNumber, sortedAnnotations);
      }
      page.setManuscriptId(manuscript.getId());
      pages.add(page);
    }

    manuscript.setPages(pages);
    
    addTeiMetadata(manuscript);
    
    return manuscript;
  }

  private Instant extractInstantFromJsonManuscript(JSONObject json, String type) {
    Instant date = null;
    try {
      //Extracts the dates array from the JSON
      if (json.has(RepositoryStrings.DATES.getName())) {
        JSONArray dates = json.getJSONArray(RepositoryStrings.DATES.getName());
        for (int i = 0; i < dates.length(); i++) {
          JSONObject dateJson = dates.getJSONObject(i);
          //Checks for each date if it has the required type & parse the right date to a Instant object
          if (dateJson.has(RepositoryStrings.TYPE.getName())
              && dateJson.getString(RepositoryStrings.TYPE.getName()).equals(type)
              && dateJson.has(RepositoryStrings.VALUE.getName())) {
            String dateString = dateJson.getString((RepositoryStrings.VALUE.getName()));
            date = Instant.parse(dateString);
            //if (dateString.contains(".")) {
            //  date = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_REPO.getDateFormat()
            //      .parse(dateString);
            //} else {
            //  date = TimeStampFormats.TIMESTAMP_FORMAT_REPO.getDateFormat().parse(dateString);
            //}
            break;
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return date;
  }

  /*
   * Fetch manuscript_metadata.xml and extract metadata from it. Then add the metadata
   * to the manuscript.
   */
  private void addTeiMetadata(Manuscript manuscript) {
	  
	  try {
		  
		  String teiString = repositoryAccessService.getXmlByManuscriptId(manuscript.getId());
		  // parsing the string into a document
		  DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		  factory.setNamespaceAware(true);
		  DocumentBuilder builder = factory.newDocumentBuilder();
		  Document teiDocument = builder.parse(new InputSource(new StringReader(teiString)));

		  // defining the namespaces to be used by the following code
		  // see: https://stackoverflow.com/questions/13702637/xpath-with-namespace-in-java
		  // and https://web.archive.org/web/20070328212209/http://blog.davber.com/2006/09/17/xpath-with-namespaces-in-java/
          // We map the prefixes to URIs
          NamespaceContext namespaceContext = new NamespaceContext() {
              public String getNamespaceURI(String prefix) {
                  String uri;
                  if (prefix.equals("tei")) {
                      uri = "http://www.tei-c.org/ns/1.0";
                  } else if (prefix.equals("xi")) {
                      uri = "http://www.w3.org/2001/XInclude";
                  } else {
                      uri = null;
                  }
                  return uri;
              }
               
              // Dummy implementation - not used!
              public Iterator getPrefixes(String val) {
                  return null;
              }
             
              // Dummy implemenation - not used!
              public String getPrefix(String uri) {
                  return null;
              }
          };

          // creating the xPath object
          XPath xPath = XPathFactory.newInstance().newXPath();
		  xPath.setNamespaceContext(namespaceContext);

		  // adding the titles
		  // xPath query string to get the title of the text
		  String titleQuery = "//tei:teiHeader/tei:fileDesc[1]/tei:titleStmt[1]/tei:title";
		  NodeList titles = (NodeList) xPath.compile(titleQuery)
				  .evaluate(teiDocument.getDocumentElement(), XPathConstants.NODESET);
		  if (titles.getLength() > 0) {
			  addTeiTitles(manuscript, titles);
		  }
		  	  
		  // adding the author names
		  // xPath for getting the author of the text
		  String authorsQuery = "//tei:teiHeader/tei:fileDesc[1]/tei:titleStmt[1]/tei:author";
		  NodeList authors = (NodeList) xPath.compile(authorsQuery)
				  .evaluate(teiDocument.getDocumentElement(), XPathConstants.NODESET);
		  if (authors.getLength() > 0) {
			  addTeiAuthor(manuscript, authors);
		  }
		  

		  // adding the dates
		  // xPath for getting the creation dates of the text
		  String datesQuery = "//tei:teiHeader[1]/tei:profileDesc[1]/tei:creation[1]/tei:date[not(@type=\"file\")]";
		  NodeList dates = (NodeList) xPath.compile(datesQuery)
				  .evaluate(teiDocument.getDocumentElement(), XPathConstants.NODESET);
		  if (dates.getLength() > 0) {
			  addTeiDate(manuscript, dates);
		  }

	  } catch (Exception e) {
		  System.out.println("Could not convert manuscript metadata for"
		  		+ " elastic index for manuscript: " + manuscript.getId());
		  e.printStackTrace();
	  }
  }
  
  /*
   * Adds the titles obtained from the metadata tei-xml-file to a manuscript.
   */
  private void addTeiTitles(Manuscript manuscript, NodeList titles) {
	  
	  List<TeiTitle> titlesSeries = new ArrayList<TeiTitle>();
	  List<TeiTitle> titlesMonographic = new ArrayList<TeiTitle>();
	  List<TeiTitle> titlesAnalytic = new ArrayList<TeiTitle>();
	  List<TeiTitle> titlesDefault = new ArrayList<TeiTitle>();
	  
	  for (int i = 0; i < titles.getLength(); i++) {
		  try {
			  TeiTitle title = new TeiTitle(titles.item(i).getTextContent());
			  
			  // getting the values of the attribute of the title (title[@attribute])
			  if (titles.item(i).getAttributes().getNamedItem("type") != null) {
				  title.setType(titles.item(i).getAttributes().getNamedItem("type").getNodeValue());
			  }
			  
			  if (titles.item(i).getAttributes().getNamedItem("xml:lang") != null) {
				  title.setLanguage(titles.item(i).getAttributes().getNamedItem("xml:lang").getNodeValue());;
			  }
			  
			  if (titles.item(i).getAttributes().getNamedItem("level") != null) {
				  
				  String level = titles.item(i).getAttributes().getNamedItem("level").getNodeValue();
				  title.setLevel(level);
				  
				  switch (level) {
					  case "s":
						  titlesSeries.add(title);
						  break;
					  case "m":
						  titlesMonographic.add(title);
						  break;
					  case "a":
						  titlesAnalytic.add(title);
						  break;
				  }
			  	} else {
			  		titlesDefault.add(title);
			  	}  
		  	} catch (Exception e) {
				System.out.println("Could not parse titles for manuscript: " + manuscript.getId());
				e.printStackTrace();
		  	}
	  }
	  
	  if (!titlesSeries.isEmpty()) {
		  manuscript.setTeiTitleSeries(titlesSeries);
	  }
	  if (!titlesMonographic.isEmpty()) {
		  manuscript.setTeiTitleMonographic(titlesMonographic);
	  }
	  if (!titlesAnalytic.isEmpty()) {
		  manuscript.setTeiTitleAnalytic(titlesAnalytic);
	  }
	  if (!titlesDefault.isEmpty()) {
		  manuscript.setTeiTitle(titlesDefault);
	  }
  }
  
  /*
   * Adds the author obtained from the metadata tei-xml-file to a manuscript.
   */
  private void addTeiAuthor(Manuscript manuscript, NodeList authors) {
	  
	  List<String> authorList = new ArrayList<String>();
	  
	  for (int i = 0; i < authors.getLength(); i++) {
		  try {
			  NodeList persNames = authors.item(i).getChildNodes();
			  
			  // removing all the text nodes
			  List<Node> cleanedPersNames = new ArrayList<Node>();
			  for (int l = 0; l < persNames.getLength(); l++) {
				  if (persNames.item(l).getNodeType() != 3) {
					  cleanedPersNames.add(persNames.item(l));
				  }
			  }
			  
			  // getting the persNames text content and adding them to the
			  // list of authors
			  List<String> persNamesList = new ArrayList<String>();
			  for (int l = 0; l < cleanedPersNames.size(); l++) {
				  persNamesList.add(cleanedPersNames.get(l).getTextContent());
			  }
			  if (persNamesList.size() > 1) {
				  String concatedPersNames = concatList(persNamesList);
				  authorList.add(concatedPersNames);
			  } else {
				  authorList.add(persNamesList.get(0));
			  }
		  } catch (Exception e) {
				System.out.println("Could not authors for manuscript: " + manuscript.getId());
				e.printStackTrace();
		  }
	  }
	  
	  if(!authorList.isEmpty()) {
		  manuscript.setTeiAuthor(authorList);
	  }
  }
  
  /*
   * Adds the date obtained from the metadata tei-xml-file to a manuscript.
   */
  private void addTeiDate(Manuscript manuscript, NodeList dates) {
	  List<TeiDate> datesList = new ArrayList<TeiDate>();
	  
	  for (int i = 0; i < dates.getLength(); i++) {
		  try {
			  TeiDate date = new TeiDate();
			  
			  if (dates.item(i).getTextContent() != null) {
				  date.setContent(dates.item(i).getTextContent());
			  }
			  if (dates.item(i).getAttributes().getNamedItem("type") != null) {
				  date.setType(dates.item(i).getAttributes().getNamedItem("type").getNodeValue());
			  }
			  
			  // set the various dates after the string a valid string, that can be parsed
			  if (dates.item(i).getAttributes().getNamedItem("when") != null) {
				  String whenValue = dates.item(i).getAttributes().getNamedItem("when").getNodeValue();
				  whenValue = makeDateStringValid(whenValue, true);
				  LocalDate when = LocalDate.parse(whenValue);
				  date.setWhen(when);
			  }
			  if (dates.item(i).getAttributes().getNamedItem("notBefore") != null) {
				  String notBeforeValue = dates.item(i).getAttributes().getNamedItem("notBefore").getNodeValue();
				  notBeforeValue = makeDateStringValid(notBeforeValue, true);
				  LocalDate notBefore = LocalDate.parse(notBeforeValue);
				  date.setNotBefore(notBefore);
			  }
			  if (dates.item(i).getAttributes().getNamedItem("notAfter") != null) {
				  String notAfterValue = dates.item(i).getAttributes().getNamedItem("notAfter").getNodeValue();
				  notAfterValue = makeDateStringValid(notAfterValue, false);
				  LocalDate notAfter = LocalDate.parse(notAfterValue);
				  date.setNotAfter(notAfter);
			  }
			  if (dates.item(i).getAttributes().getNamedItem("from") != null) {
				  String fromValue = dates.item(i).getAttributes().getNamedItem("from").getNodeValue();
				  fromValue = makeDateStringValid(fromValue, true);
				  LocalDate from = LocalDate.parse(fromValue);
				  date.setFrom(from);
			  }
			  if (dates.item(i).getAttributes().getNamedItem("to") != null) {
				  String toValue = dates.item(i).getAttributes().getNamedItem("to").getNodeValue();
				  toValue = makeDateStringValid(toValue, false);
				  LocalDate to = LocalDate.parse(toValue);
				  date.setTo(to);
			  }
			  datesList.add(date);
		  } catch (Exception e) {
				System.out.println("Could not parse dates for manuscript: " + manuscript.getId());
				e.printStackTrace();
		  }
	  }
	  
	  if(!datesList.isEmpty()) {
		  manuscript.setTeiManuscriptCreationDate(datesList);
	  }
  }

  /**
   * Helper function to make sure that the string passed is a valid date in
   * YYYY-MM-DD format.
   * 
   * @param dateString to be validated
   * @param yearStarts Boolean to decide if the date should be the start/end of a year
   * @return valid dateString
  */
  private String makeDateStringValid(String dateString, Boolean yearStart) {
	  // check if the data is in YYYY-MM-DD format
	  if (dateString.length() < 10) {
		  // add MM-DD if missing
		  if (dateString.length() <= 5) {
			  if (yearStart) {
				  if (dateString.startsWith("-")) {
					  dateString = dateString + "-12-31";
				  } else {
					  dateString = dateString + "-01-01";
				  }
			  } else {
				  if (dateString.startsWith("-")) {
					  dateString = dateString + "-01-01";
				  } else {
					  dateString = dateString + "-12-31";
				  }
			  }
		  }
		  // add DD if missing
		  if (dateString.length() <= 8 ) {
			  if (yearStart) {
				  if (dateString.startsWith("-")) {
					  dateString = dateString + "-12";
				  } else {
					  dateString = dateString + "-01";
				  }
			  } else {
				  if (dateString.startsWith("-")) {
					  dateString = dateString + "-01";
				  } else {
					  dateString = dateString + "-31";
				  }
			  }
		  }
	  }
	  
	  // dates including a time have to be cut. They are longer than 11 characters
	  // and usually contain a "T" to mark the beginning of the time stamp
	  // (10 would be the length for YYYY-MM-DD AD dates, but BC dates include a leading "-")
	  if (dateString.length() > 11 && dateString.contains("T")) {
		  if (dateString.startsWith("-")) {
			  dateString = dateString.substring(0, 11);
		  } else {
			  dateString = dateString.substring(0, 10);
		  }
	  }
	  return dateString;
  }
  
  /**
   * Helper function to concatenate a list into a string, where all entries apart from
   * the first are surrounded by brackets.
  */
  private String concatList(List list) {
	  String result = list.get(0).toString();
	  list.remove(0);
	  if (list.size() >= 1) {
		  result = result + " (" + String.join("; ", list) + ")";
	  }
	  return result;
  }
  
  /**
   * Builds the page with the accompanying annotations from sortedAnnotations.
   * If sortedAnnotations is null the annotations will be obtained by getAnnotationsByPage().
   */
  private Page buildPageFromJson(JSONObject pageJson, String pageNumber,
                                 Map<String, List<Annotation>> sortedAnnotations)
      throws JSONException, IOException, InterruptedException {
    String id = pageJson.getString(RepositoryStrings.ID.getName());

    Instant created = extractInstantFromJsonManuscript(pageJson, RepositoryStrings.CREATED.getName());
    Instant modified = extractInstantFromJsonManuscript(pageJson, RepositoryStrings.MODIFIED.getName());

    //Create the Page object depending on the resource type.
    Page page;
    String resourceTypeGeneral = pageJson.getJSONObject(RepositoryStrings.RESOURCE_TYPE.getName())
        .getString(RepositoryStrings.TYPE_GENERAL.getName());

    if (resourceTypeGeneral.equals(RepositoryStrings.IMAGE.getName())) {
      // URL to image of Page
      String resourceUrl = repositoryAccessService.getBaseUrl() + repositoryAccessService.getStaticPath() + id
          + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.MASTER_JPG;
      String thumbResourceUrl = repositoryAccessService.getBaseUrl() + repositoryAccessService.getStaticPath()
          + id + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.THUMB_JPG;

      ImagePage imagePage = new ImagePage(id, ResourceType.IMAGE, pageNumber, created, resourceUrl, thumbResourceUrl);
 
      if (sortedAnnotations == null) {
        imagePage.setAnnotations(getAnnotationsByPage(imagePage));
      } else {
        imagePage.setAnnotations(sortedAnnotations.get(imagePage.getId()));
      }

      page = imagePage;
    } else if (resourceTypeGeneral.equals(RepositoryStrings.TEXT.getName())) {

      // Here comes the URL to the resource of the page
      // just a copy of the image code from above and added "RepositoryAccessService.FILE_EXTENSION_XML"
      // and using a TextPage object instead of ImagePage
      String resourceUrl = repositoryAccessService.getBaseUrl() + repositoryAccessService.getStaticPath() + id
              + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.FILE_EXTENSION_XML;

      TextPage textPage = new TextPage(id, ResourceType.TEXT, pageNumber, created, resourceUrl);
      if (sortedAnnotations == null) {
          textPage.setAnnotations(getAnnotationsByPage(textPage));
        } else {
          textPage.setAnnotations(sortedAnnotations.get(textPage.getId()));
        }

      page = textPage;
    } else {
      throw new IllegalStateException("Unexpected value: " + resourceTypeGeneral);
    }

    page.setLastModified(modified);

    return page;
  }

  /*
   * Gets all annotations for a page.
   */
  private List<Annotation> getAnnotationsByPage(Page page)
      throws InterruptedException, JSONException, IOException {
    List<JSONObject> jsonAnnotations =
        annotationStoreAccessService.getAnnotationsByPageId(page.getId(), page.getPageNumber());
    List<Annotation> annotations = new ArrayList<>();

    for (JSONObject annotation : jsonAnnotations) {
      try {
          annotations.add(annotationConverter.buildAnnotationFromJson(annotation));
      } catch (Exception e) {
          logger.info("Couldn't add annotation" + annotation.getString("id"));
      }
    }

    //remove de interpretatione annotations to which there is a corresponding validated annotation
    List<String> canonicalIds = new ArrayList<>();
    for (Annotation annotation : annotations) {
      if (annotation.getCanonical() != null) {
        canonicalIds.add(annotation.getCanonical());
      }
    }
    List<Annotation> redundantAnnotations = new ArrayList<>();
    for (Annotation annotation : annotations) {
      if (canonicalIds.contains(annotation.getId())) {
        redundantAnnotations.add(annotation);
      }
    }
    for (Annotation redundantAnno : redundantAnnotations) {
      annotations.remove(redundantAnno);
    }

    return annotations;
  }
}
