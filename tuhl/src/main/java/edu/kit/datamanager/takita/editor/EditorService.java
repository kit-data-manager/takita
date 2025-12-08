package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.dataaccess.AnnotationConverter;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.IExistAccessService;
import edu.kit.datamanager.takita.dataaccess.IRepositoryAccessService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Color;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.target.SVGSelector;
import edu.kit.datamanager.takita.model.target.Target;
import edu.kit.datamanager.takita.model.target.TextQuoteSelector;
import edu.kit.datamanager.takita.model.target.XPathSelector;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.xpath.XPathExpressionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;
import org.w3c.dom.DOMException;
import org.xml.sax.SAXException;

/**
 * Implements the Interface IEditorService, handles methods needed by the EditorController.
 */
@Service
@SessionScope
public class EditorService implements IEditorService {
  private Manuscript currentManuscript;
  private Page currentPage;
  private Annotation currentAnnotation;

  private final IAssistanceService assistanceService;
  private final ISearchIndexService searchIndexService;
  private final IAnnotationStoreAccessService accessService;
  private final IRepositoryAccessService repositoryAccessService;
  private final IExistAccessService existAccessService;
  private final AnnotationConverter annotationConverter;

  private static final Logger logger = LoggerFactory.getLogger(EditorService.class);

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param assistanceService instance of IAssistanceService
   * @param searchIndexService instance of ISearchIndexService
   */
  @Autowired
  public EditorService(IAssistanceService assistanceService,
                           ISearchIndexService searchIndexService,
                           IAnnotationStoreAccessService accessService,
                           IRepositoryAccessService repositoryAccessService,
                           IExistAccessService existAccessService) {
    this.assistanceService = assistanceService;
    this.searchIndexService = searchIndexService;
    this.accessService = accessService;
    this.repositoryAccessService = repositoryAccessService;
    this.existAccessService = existAccessService;
    this.annotationConverter = new AnnotationConverter(accessService, repositoryAccessService);
  }

  /**
   * Adds an annotation to the search index and the database.
   *
   * @param pageId ID of the page on which the annotation is located
   * @param color color of the annotation
   * @param selectors 1-n selectors (part of the target) of the annotation
   * @param motivation motivation of the annotation
   * @return the added annotation
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such page in the index
   * @throws IOException when the http request to database was faulty
   * @throws JSONException when there is a problem with the JSON object holding the selector
   */
  @Override
  public Annotation addAnnotation(String pageId, String color, JSONArray selectors, String motivation)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
    Annotation newAnnotation = new Annotation();
    newAnnotation.setPageId(pageId);
    newAnnotation.setCreators(Collections.singletonList(
        assistanceService.getCurrentUser().getName()));
    newAnnotation.setCreated(Instant.now());
    newAnnotation.setModified(Instant.now());

    if (color != null) {
      newAnnotation.setColor(Color.stringToColor(color));
    } else {
      newAnnotation.setColor(Color.DEFAULT);
    }

    if (selectors != null) {
    	for (int i = 0; i < selectors.length(); i++) {
			String selectorType = selectors.getJSONObject(i).getString("type");
			switch (selectorType) {
				case "XPathSelector":
					Target newTarget = new Target();
					String xPath = selectors.getJSONObject(i).getString("value");
					XPathSelector newXPathSelector = new XPathSelector(xPath);
		        	newTarget.setType("TEXT");
		        	newTarget.setSelector(newXPathSelector);
		        	newAnnotation.addTarget(newTarget);
		        	System.out.println(newAnnotation.getTargets().get(0).getWADMSerialization().toString());
					break;
				case "SvgSelector":
					Target newTarget2 = new Target();
					String svgCode = selectors.getJSONObject(i).getString("value");
					SVGSelector newSVGSelector = new SVGSelector(svgCode);
		    		newTarget2.setType("IMAGE");
		        	newTarget2.setSelector(newSVGSelector);
		        	newAnnotation.addTarget(newTarget2);
					break;
				case "TextQuoteSelector":
					Target newTarget3 = new Target();
					String exactString = selectors.getJSONObject(i).getString("exact");
					TextQuoteSelector newTextQuoteSelector = new TextQuoteSelector(exactString);
					if (selectors.getJSONObject(i).getString("prefix") != null) {
						newTextQuoteSelector.setPrefix(selectors.getJSONObject(i).getString("prefix"));
					}
					if (selectors.getJSONObject(i).getString("suffix") != null) {
						newTextQuoteSelector.setSuffix(selectors.getJSONObject(i).getString("suffix"));
					}
		    		newTarget3.setType("TEXT");
		        	newTarget3.setSelector(newTextQuoteSelector);
		        	newAnnotation.addTarget(newTarget3);
			}
    	}
    } else {
    	// this branch should get reached when users create a "page"-annotation, i.e.
    	// an annotation targeting the whole document/image
    	// TODO: this has to be tested by someone who works with page-annotations.
    	// Philipp tested it and it seems to work.
		Target newTarget = new Target();
    	newTarget.setType("PAGE");
    	newAnnotation.addTarget(newTarget);
    }

    if (motivation != null) {
      newAnnotation.setMotivation(motivation);
    }

    try {
      logger.info("EditorService: " + newAnnotation.toString());
      newAnnotation = searchIndexService.addAnnotation(newAnnotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newAnnotation;
  }

  /**
   * Gets an annotation from the searchIndexService by its ID.
   *
   * @param annotationId ID of annotation
   * @return requested annotation
   * @throws NoSuchIndexEntryException when there is no annotation like this in the index
   */
  @Override
  public Annotation getAnnotation(String annotationId) throws NoSuchIndexEntryException {
    return searchIndexService.getAnnotationById(annotationId);       
  }

  /**
   * Updates an annotation in the search index and the database.
   *
   * @param annotationId ID of the annotation to update
   * @param color new color of the annotation
   * @param svgCode new svg code of the annotation
   * @param motivation new motivation of the annotation
   * @return updated annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   * @throws JSONException when there is a problem with the JSON object holding the selector
   */
  @Override
  public Annotation updateAnnotation(String annotationId, String color,
		  JSONArray selectors, String motivation)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException {
    Annotation updatedAnnotation = searchIndexService.getAnnotationById(annotationId);
    if (!updatedAnnotation.getCreators().contains(assistanceService
        .getCurrentUser().getName())) {
      updatedAnnotation.addCreator(assistanceService.getCurrentUser().getName());
    }
    updatedAnnotation.setModified(Instant.now());

    if (color != null && !color.trim().equals("")) {
      updatedAnnotation.setColor(Color.stringToColor(color));
    } else {
      updatedAnnotation.setColor(Color.DEFAULT);
    }

    if (selectors != null) {
    	// TODO: this way of getting the link to the resource is dangerous. If there 
    	// are multiple targets, which target different resource, all targets will target
    	// the same resource after a target update (as the targets are just getting overwritten
    	// by "updatedAnnotation.setTargets(newTargets)") and the annotation will be incorrect.
    	String linkToResource = updatedAnnotation.getTargets().get(0).getLinkToResource();
    	List<Target> newTargets = new ArrayList<>();
    	for (int i = 0; i < selectors.length(); i++) {
			String selectorType = selectors.getJSONObject(i).getString("type");
			switch (selectorType) {
				case "XPathSelector":
					Target newTarget = new Target(linkToResource);
					String xPath = selectors.getJSONObject(i).getString("value");
					XPathSelector newXPathSelector = new XPathSelector(xPath);
		        	newTarget.setType("TEXT");
		        	newTarget.setSelector(newXPathSelector);
		        	newTargets.add(newTarget);
					break;
				case "SvgSelector":
					Target newTarget2 = new Target(linkToResource);
					String svgCode = selectors.getJSONObject(i).getString("value");
					SVGSelector newSVGSelector = new SVGSelector(svgCode);
		    		newTarget2.setType("IMAGE");
		        	newTarget2.setSelector(newSVGSelector);
		        	newTargets.add(newTarget2);
					break;
				case "TextQuoteSelector":
					Target newTarget3 = new Target(linkToResource);
					String exactString = selectors.getJSONObject(i).getString("exact");
					TextQuoteSelector newTextQuoteSelector = new TextQuoteSelector(exactString);
					if (selectors.getJSONObject(i).getString("prefix") != null) {
						newTextQuoteSelector.setPrefix(selectors.getJSONObject(i).getString("prefix"));
					}
					if (selectors.getJSONObject(i).getString("suffix") != null) {
						newTextQuoteSelector.setSuffix(selectors.getJSONObject(i).getString("suffix"));
					}
		    		newTarget3.setType("TEXT");
		        	newTarget3.setSelector(newTextQuoteSelector);
		        	newTargets.add(newTarget3);
					break;
			}
    	}
    	updatedAnnotation.setTargets(newTargets);
    } else {
    	// this branch should get reached when users updates a "page"-annotation, i.e.
    	// an annotation targeting the whole document/image. It might get reached, when a
    	// user wants to turn a normal annotation into a a "page"-annotation.
    	// TODO: this has to be figured out. It could just create one target w/o a selector
    	// and turn the annotation into a page-annotation
    }

    if (motivation != null) {
      updatedAnnotation.setMotivation(motivation);
    }

    try {
      updatedAnnotation = searchIndexService.updateAnnotation(updatedAnnotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return updatedAnnotation;
  }

  /**
   * Validates an annotation in the search index and the database.
   *
   * @param annotationId ID of the annotation to be validated
   * @return validated annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Annotation validateAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationId);
    annotation.setModified(Instant.now());
    annotation.addCreator(assistanceService.getCurrentUser().getName());
    try {
      annotation = searchIndexService.validateAnnotation(annotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return annotation;
  }

  /**
   * Deletes an annotation from the search index and the database.
   *
   * @param annotationId of the annotation to delete
   * @return deleted annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Annotation deleteAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    Annotation deletedAnnotation = searchIndexService.getAnnotationById(annotationId);
    try {
      searchIndexService.deleteAnnotationById(annotationId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return deletedAnnotation;
  }

  /**
   * Adds a text card to an annotation in the search index and the database.
   *
   * @param annotationId of the annotation to which the text card belongs
   * @param title of the text card
   * @param value of the text card
   * @param purpose of the text card
   * @return added text card
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public TextCard addTextCard(String annotationId, String title, String subject, String value, String source, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
    TextCard newTextCard = new TextCard(UUID.randomUUID().toString());
    newTextCard.setAnnotationId(annotationId);
    newTextCard.setCreators(Collections.singletonList(
        assistanceService.getCurrentUser().getName()));
    newTextCard.setCreated(Instant.now());
    newTextCard.setModified(Instant.now());

    if (title != null && !title.trim().equals("")) {
      newTextCard.setTitle(title);
    }
    
    if (subject != null && !subject.trim().equals("")) {
      newTextCard.setSubject(subject);
    }

    if (value != null && !value.trim().equals("")) {
      newTextCard.setValue(value);
    }
    
    if (source != null && !source.trim().equals("")) {
      newTextCard.setSource(source);
    }

    if (purpose != null) {
      newTextCard.setPurpose(purpose);
    }
    
    newTextCard.setFullJson(annotationConverter.bodyToJson(newTextCard));
    try {
      newTextCard = (TextCard) searchIndexService.addBody(newTextCard);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return newTextCard;
  }

  /**
   * Adds a tag to an annotation in the search index and the database.
   *
   * @param annotationId of the annotation to which the tag belongs
   * @param title of the tag
   * @param value of the tag
   * @return added tag
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Tag addTag(String annotationId, String title, String subject, String value, String source)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
    Tag newTag = new Tag(UUID.randomUUID().toString());
    logger.info("newTag: " + newTag.toString());
    newTag.setAnnotationId(annotationId);
    newTag.setCreators(Collections.singletonList(assistanceService.getCurrentUser().getName()));
    newTag.setCreated(Instant.now());
    newTag.setModified(Instant.now());

    if (title != null && !title.trim().equals("")) {
      newTag.setTitle(title);
    }
    
    if (subject != null && !subject.trim().equals("")) {
      newTag.setSubject(subject);
    }

    if (value != null && !value.trim().equals("")) {
      newTag.setValue(value);
    }
    
    if (source != null && !source.trim().equals("")) {
      newTag.setSource(source);
    }
    
    newTag.setFullJson(annotationConverter.bodyToJson(newTag));
    logger.info("addedInfo: " + newTag.toString());
    try {
      newTag = (Tag) searchIndexService.addBody(newTag);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newTag;
  }

  /**
   * Gets a text card from the search index.
   *
   * @param id of the text card
   * @return text card in question
   */
  @Override
  public TextCard getTextCard(String id) throws NoSuchIndexEntryException {
    return searchIndexService.getTextCardById(id);
  }

  /**
   * Gets a tag from the search index.
   *
   * @param id of the tag
   * @return tag in question
   */
  @Override
  public Tag getTag(String id) throws NoSuchIndexEntryException {
    return searchIndexService.getTagById(id);
  }

  /**
   * Updates a text card in the search index and the database.
   *
   * @param textCardId of the text card which should be updated
   * @param title new title of the text card
   * @param value new value of the text card
   * @param purpose new purpose of the text card
   * @return updated text card
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such text card in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public TextCard updateTextCard(String textCardId, String title, String subject, String value, String source, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
    TextCard updatedTextCard = searchIndexService.getTextCardById(textCardId);
    if (!updatedTextCard.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      updatedTextCard.addCreator(assistanceService.getCurrentUser().getName());
    }
    updatedTextCard.setModified(Instant.now());

    if (title != null && !title.trim().equals("")) {
      updatedTextCard.setTitle(title);
    }
    
    if (subject != null && !subject.trim().equals("")) {
      updatedTextCard.setSubject(subject);
    }

    if (value != null && !value.trim().equals("")) {
      updatedTextCard.setValue(value);
    }
    
    if (source != null && !source.trim().equals("")) {
      updatedTextCard.setSource(source);
    }

    if (purpose != null && !purpose.trim().equals("")) {
      updatedTextCard.setPurpose(purpose);
    }
    
    updatedTextCard.setFullJson(annotationConverter.bodyToJson(updatedTextCard));

    TextCard newTextCard;
    try {
      newTextCard = (TextCard) searchIndexService.updateBody(updatedTextCard);
    } catch (JSONException e) {
      newTextCard  = new TextCard("No TextCard");
      e.printStackTrace();
    }

    return newTextCard;
  }

  /**
   * Updates a tag in the search index and the database.
   *
   * @param tagId of the tag which should be updated
   * @param title new title of the tag
   * @param value new value of the tag
   * @return updated tag
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such tag in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Tag updateTag(String tagId, String title, String subject, String value, String source)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException {
    Tag updatedTag = searchIndexService.getTagById(tagId);
    if (!updatedTag.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      updatedTag.addCreator(assistanceService.getCurrentUser().getName());
    }
    updatedTag.setModified(Instant.now());

    if (title != null && !title.trim().equals("")) {
      updatedTag.setTitle(title);
    }
    
    if (subject != null && !subject.trim().equals("")) {
      updatedTag.setSubject(subject);
    }

    if (value != null && !value.trim().equals("")) {
      updatedTag.setValue(value);
    }
    
    if (source != null && !source.trim().equals("")) {
      updatedTag.setSource(source);
    }
    
    updatedTag.setFullJson(annotationConverter.bodyToJson(updatedTag));

    try {
      updatedTag = (Tag) searchIndexService.updateBody(updatedTag);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return updatedTag;

  }

  /**
   * Deletes a text card in the search index and the database.
   *
   * @param textCardId of the text card which should be deleted
   * @return deleted text card
   * @throws NoSuchIndexEntryException when there is no such text card in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public TextCard deleteTextCard(String textCardId)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    TextCard deletedTextCard = searchIndexService.getTextCardById(textCardId);
    try {
      searchIndexService.deleteBodyById(textCardId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return deletedTextCard;
  }

  /**
   * Deletes a tag in the search index and the database.
   *
   * @param tagId of the tag which should be deleted
   * @return deleted tag
   * @throws NoSuchIndexEntryException when there is no such tag in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Tag deleteTag(String tagId)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    Tag deletedTag = searchIndexService.getTagById(tagId);
    try {
      searchIndexService.deleteBodyById(tagId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return deletedTag;
  }

  /**
   * Gets the raw JSON of a manuscript.
   *
   * @param manuscriptId of the manuscript to which the raw JSON should be gotten
   * @return manuscript as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public JSONObject getManuscriptJson(String manuscriptId)
      throws InterruptedException, IOException {
    try {
      return searchIndexService.getRawManuscriptJson(manuscriptId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Gets the raw XML of a manuscript.
   *
   * @param manuscriptId of the manuscript to which the raw XML should be gotten
   * @return manuscript as XML as String
   * @throws IOException when the http request to database was faulty
   * @throws InterruptedException when the http request to database is interrupted
   */
  @Override
  public String getManuscriptXml(String manuscriptId) throws IOException, InterruptedException {
    return searchIndexService.getRawManuscriptXml(manuscriptId);
  }

  /**
   * Gets the raw XML of a page.
   *
   * @param pageId of the manuscript to which the raw XML should be gotten
   * @param fileName identifies the file associated to a page
   * @return page as XML as String
   * @throws IOException when the http request to database was faulty
   * @throws InterruptedException when the http request to database is interrupted
   */
  @Override
  public String getPageContentXml(String pageId, String fileName) throws IOException, InterruptedException {
	    return searchIndexService.getRawPageContentXml(pageId, fileName);
  }
  
   /**
	* Gets the content of a page that is given in the TEI standard from eXist-db.
	*
	* @param documentId the id of the document (usually the id of the pageDo in the base-repo)
	* @return the xml as a String
	* @throws IOException if an error occurs while sending or receiving
	* @throws InterruptedException if the get request is interrupted
	*/
  @Override
  public String getXMLDocument(String documentId) throws IOException, InterruptedException {
	  return existAccessService.getXMLDocument(documentId);
  }

   /**
    * Gets one fragment of a page that is given in the TEI standard from eXist-db.
	*
	* @param documentId the id of the document (usually the id of the pageDo in the base-repo)
	* @param xPath (encoded) identifies the document fragment
	* @param trimmed decides if the resolved xPath should have its content trimmed
	* according to the substring() function in the xPath. 
	* - "true" will lead to text contents of elements to be trimmed according to the substring-function
	* - "false" will leave the text contents of elements untouched (ignoring the substring-function)
    * @param indented decides if the resulting xml-fragment should be indented by eXist-db (true) or preserve the
    * indentation of the original document (false)
    * @return the xml as a String
	* 1. if called with an xPath holding only one id ("pageId/filename/id("e.id")/false")
	* consisting of one element and its descendants like a division or a word
	* 2. a) if called with an xPath holding only multiple ids ("pageId/filename/id("e.id")|id("e.id2")/false")
	* consisting of the closest parent of the first and last element given in the xPath. The whole parent is
	* included if the "trimmed" variable is false
	*    b) if called with an xPath holding only multiple ids ("pageId/filename/id("e.id")|id("e.id2")/false")
	* consisting of the closest parent of the first and last element given in the xPath. Only the elemts, whos
	* ids are present in the xPath are included in the result, the others are getting removed, if the
	* "trimmed" variable is false
	* @throws IOException if an error occurs while sending or receiving
	* @throws InterruptedException if the get request is interrupted
	* @throws ParserConfigurationException 
	* @throws SAXException 
	* @throws TransformerException 
	* @throws TransformerConfigurationException 
	* @throws DOMException 
	* @throws XPathExpressionException
	* @throws UnsupportedEncodingException 
	*/
  @Override
  public String getXMLDocumentFragment(String documentId, String xPath, Boolean trimmed, Boolean indented) throws IOException, InterruptedException, TransformerConfigurationException, ParserConfigurationException, SAXException, TransformerException, XPathExpressionException, DOMException, UnsupportedEncodingException {
	  return existAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
  }
  
  /**
   * Gets the raw JSON of a page.
   *
   * @param pageId of the page to which the raw JSON should be gotten
   * @return page as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public JSONObject getPageJson(String pageId)
      throws InterruptedException, IOException {
    try {
      return searchIndexService.getRawPageJson(pageId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Gets the raw JSON of an annotation.
   *
   * @param annotationId of the annotation to which the raw JSON should be gotten
   * @return annotation as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public JSONObject getAnnotationJson(String annotationId)
      throws InterruptedException, IOException {
    try {
      return searchIndexService.getRawAnnotationJson(annotationId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }
  
  @Override
  public List<JSONObject> getAnnotationsForPage(String pageId, String pageNumber)
    throws InterruptedException, IOException, JSONException {
    return accessService.getAnnotationsByPageId(pageId, pageNumber);
  }
  
  @Override
  public List<Annotation> getAnnotationsForId(String id)
    throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException {
    //return accessService.getAnnotationsByTarget(target);
    return searchIndexService.getAnnotationsForPageById(id);
  }

  @Override
  public void selectPage(String pageId) throws NoSuchIndexEntryException {
    currentPage = searchIndexService.getPageById(pageId);
    if (currentManuscript == null || currentManuscript.getId() != currentPage.getManuscriptId()) {
      currentManuscript = searchIndexService.getManuscriptById(currentPage.getManuscriptId());
    }
  }

  @Override
  public Manuscript getCurrentManuscript() {
    return currentManuscript;
  }

  @Override
  public Page getCurrentPage() {
    return currentPage;
  }

}
