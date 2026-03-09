package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.NoSuchIndexEntryException;

import java.io.IOException;
import java.util.List;

import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;

/**
 * Interface for an Editor Service that should handle the requests from the Editor controller.
 */
@Service
public interface IEditorService {

  /**
   * Adds an annotation to the search index and the database.
   *
   * @param pageId ID of the page on which the annotation is located
   * @param selectors 1-n selectors (part of the target) of the annotation
   * @param motivation motivation of the annotation
   * @param via via field of annotation
   * @return the added annotation
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such page in the index
   * @throws IOException when the http request to database was faulty and on connection error
   * @throws JSONException when server returns non success code or response payload does not contain annotation
   */
  Annotation addAnnotation(String pageId, JSONArray selectors, String motivation, String via)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException;

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
   * @param selectors 1-n selectors (part of the target) of the annotation
   * @param motivation new motivation of the annotation
   * @return updated annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   * @throws JSONException when there is a problem with the JSON object holding the selector
   */
  Annotation updateAnnotation(String annotationId, JSONArray selectors, String motivation)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException;

  /**
   * Updates an annotation in the search index and the database, based on new WADM version
   * @param annotationId ID of the annotation to update
   * @param jsonString WADM compliant json-ld string
   * @return updated annotation
   * @throws JSONException
   * @throws NoSuchIndexEntryException
   * @throws IOException
   * @throws InterruptedException
   */
  Annotation updateWADMAnnotation(String annotationId, String jsonString) throws JSONException, NoSuchIndexEntryException, IOException, InterruptedException;

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
   * @param source of the text card
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
   * @param source of the tag
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
   * @param subject new subject of the text card
   * @param value new value of the text card
   * @param source new source of the text card
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
   * @param subject new subject of the tag
   * @param value new value of the tag
   * @param source new source of the tag
   * @return updated tag
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such tag in the index
   * @throws IOException when the http request to database was faulty
   * @throws JSONException
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
   * Gets the raw JSON of an annotation.
   *
   * @param annotationId of the annotation to which the raw JSON should be gotten
   * @return annotation as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  JSONObject getAnnotationJson(String annotationId)
      throws InterruptedException, IOException;

  /**
   * Gets annotations belonging to a page from the annotation store
   * @param pageId Id of the page the annotations belong to
   * @param pageNumber number / name of the page the annotations belong to
   * @return list of annotations as json
   * @throws InterruptedException
   * @throws IOException
   * @throws JSONException
   */
  List<JSONObject> getAnnotationsForPage(String pageId, String pageNumber)
    throws InterruptedException, IOException, JSONException;

  /**
   * Gets list of annotations belonging to a page from the search index
   * @param id Id of the page the annotations belong to
   * @return list of annotations as objects
   * @throws NoSuchIndexEntryException if page cannot be found in the search index
   * @throws InterruptedException
   * @throws IOException
   * @throws JSONException
   */
  List<Annotation> getAnnotationsForId(String id)
    throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException;

  /**
   * Set page as currently used page for editor
   * @param pageId Id of the page to display in the editor
   * @throws NoSuchIndexEntryException if page cannot be found in the search index
   */
  void selectPage(String pageId) throws NoSuchIndexEntryException;

  /**
   * get manuscript the currently displayed page belongs to
   * @return manuscript object
   */
  Manuscript getCurrentManuscript();

  /**
   * get currently displayed page
   * @return page object
   */
  Page getCurrentPage();

}
