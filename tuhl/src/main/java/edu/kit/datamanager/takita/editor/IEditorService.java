package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.NoSuchIndexEntryException;

import java.io.IOException;
import java.util.List;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.xpath.XPathExpressionException;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.w3c.dom.DOMException;
import org.xml.sax.SAXException;

/**
 * Interface for an Editor Service that should handle the requests from the Editor controller.
 */
@Service
public interface IEditorService {

  /**
   * Adds an annotation to the search index and the database.
   *
   * @param pageId ID of the page on which the annotation is located
   * @param color color of the annotation
   * @param svgCode svg code of the shape of the annotation
   * @param motivation motivation of the annotation
   * @return the added annotation
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such page in the index
   * @throws IOException when the http request to database was faulty
   */
  Annotation addAnnotation(String pageId, String color, String svgCode, String motivation)
      throws InterruptedException, NoSuchIndexEntryException, IOException;

  /**
   * Gets an annotation from the searchIndexService by its ID.
   *
   * @param annotationId ID of annotation
   * @return requested annotation
   * @throws NoSuchIndexEntryException when there is no annotation like this in the index
   */
  Annotation getAnnotation(String annotationId) throws NoSuchIndexEntryException;

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
   */
  Annotation updateAnnotation(String annotationId, String color, String svgCode, String motivation)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  /**
   * Validates an annotation in the search index and the database.
   *
   * @param annotationId ID of the annotation to be validated
   * @return validated annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  Annotation validateAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  /**
   * Deletes an annotation from the search index and the database.
   *
   * @param annotationId of the annotation to delete
   * @return deleted annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  Annotation deleteAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  /**
   * Gets a text card from the search index.
   *
   * @param id of the text card
   * @return text card in question
   * @throws NoSuchIndexEntryException when the annotation containing the text card could not be
   * found in the index
   */
  TextCard getTextCard(String id) throws NoSuchIndexEntryException;

  /**
   * Gets a tag from the search index.
   *
   * @param id of the tag
   * @return tag in question
   * @throws NoSuchIndexEntryException when the annotation containing the tag could not be found
   * in the index
   */
  Tag getTag(String id) throws NoSuchIndexEntryException;

  /**
   * Adds a text card to an annotation in the search index and the database.
   *
   * @param annotationId of the annotation to which the text card belongs
   * @param title of the text card
   * @param subject of the text card
   * @param value of the text card
   * @param purpose of the text card
   * @return added text card
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws IOException when the http request to database was faulty
     * @throws org.springframework.boot.configurationprocessor.json.JSONException
   */
  TextCard addTextCard(String annotationId, String title, String subject, String value, String source, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException;

  /**
   * Adds a tag to an annotation in the search index and the database.
   *
   * @param annotationId of the annotation to which the tag belongs
   * @param title of the tag
   * @param subject of the tag
   * @param value of the tag
   * @return added tag
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws IOException when the http request to database was faulty
     * @throws org.springframework.boot.configurationprocessor.json.JSONException
   */
  Tag addTag(String annotationId, String title, String subject, String value, String source)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException;

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
     * @throws org.springframework.boot.configurationprocessor.json.JSONException
   */
  TextCard updateTextCard(String textCardId, String title, String subject, String value, String source, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException;

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
     * @throws org.springframework.boot.configurationprocessor.json.JSONException
   */
  Tag updateTag(String tagId, String title, String subject, String value, String source)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException;

  /**
   * Deletes a text card in the search index and the database.
   *
   * @param textCardId of the text card which should be deleted
   * @return deleted text card
   * @throws NoSuchIndexEntryException when there is no such text card in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  TextCard deleteTextCard(String textCardId)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  /**
   * Deletes a tag in the search index and the database.
   *
   * @param tagId of the tag which should be deleted
   * @return deleted tag
   * @throws NoSuchIndexEntryException when there is no such tag in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  Tag deleteTag(String tagId)
      throws InterruptedException, NoSuchIndexEntryException, IOException;

  /**
   * Gets the raw JSON of a manuscript.
   *
   * @param manuscriptId of the manuscript to which the raw JSON should be gotten
   * @return manuscript as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  JSONObject getManuscriptJson(String manuscriptId)
      throws InterruptedException, IOException;

  /**
   * Gets the raw XML of a manuscript.
   *
   * @param manuscriptId of the manuscript to which the raw XML should be gotten
   * @return manuscript as XML as String
   * @throws IOException when the http request to database was faulty
   * @throws InterruptedException when the http request to database is interrupted
   */
  String getManuscriptXml(String manuscriptId)
      throws IOException, InterruptedException;

  /**
   * Gets the raw JSON of a page.
   *
   * @param pageId of the page to which the raw JSON should be gotten
   * @return page as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  JSONObject getPageJson(String pageId)
      throws InterruptedException, IOException;
  
  /**
   * Gets the raw XML of a page.
   *
   * @param pageId of the manuscript to which the raw XML should be gotten
   * @param fileName identifies the file associated to a page
   * @return page as XML as String
   * @throws IOException when the http request to database was faulty
   * @throws InterruptedException when the http request to database is interrupted
   */
  String getPageContentXml(String pageId, String fileName) throws IOException, InterruptedException;
  
  /**
   * Gets the raw XML of a document from exist-db.
   *
   * @param documentId of the manuscript to which the raw XML should be gotten
   * @param fileName identifies the file associated to a page
   * @return page as XML as String
   * @throws IOException when the http request to database was faulty
   * @throws InterruptedException when the http request to database is interrupted
   */
  String getXMLDocument(String documentId, String fileName) throws IOException, InterruptedException;

  /**
   * 
   * 
   * Gets a fragment/node of a document that is given in the TEI standard.
	 *
   * @param documentId the id of the document (usually the id of the pageDo in the base-repo)
   * @param fileName identifies the file associated to a page
   * @param xPath (encoded) identifies the document fragment
   * @param trimmed decides if the resolved xPath should have its content trimmed
   *   according to the substring() function in the xPath.
   *   - "true" will lead to text contents of elements to be trimmed according to the substring-function
   *   - "false" will leave the text contents of elements untouched (ignoring the substring-function)
   * @return the xml as a String
   * @throws IOException
   * @throws InterruptedException
   * @throws TransformerException 
   * @throws SAXException 
   * @throws ParserConfigurationException 
   * @throws TransformerConfigurationException 
   * @throws DOMException 
   * @throws XPathExpressionException 
   */
  String getXMLDocumentFragment(String documentId, String fileName, String xPath, Boolean trimmed) throws IOException, InterruptedException, TransformerConfigurationException, ParserConfigurationException, SAXException, TransformerException, XPathExpressionException, DOMException;
  /**
   * Gets the raw JSON of an annotation.
   *
   * @param annotationId of the annotation to which the raw JSON should be gotten
   * @return annotation as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  JSONObject getAnnotationJson(String annotationId)
      throws InterruptedException, IOException;
  
  
 public List<JSONObject> getAnnotationsForPage(String pageId, String pageNumber)
    throws InterruptedException, IOException, JSONException;


public List<Annotation> getAnnotationsForId(String id)
    throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException;

  void selectPage(String pageId) throws NoSuchIndexEntryException;

  Manuscript getCurrentManuscript();

  Page getCurrentPage();

}
