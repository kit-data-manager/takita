package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.body.Body;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import edu.kit.scc.dem.tuhl.model.page.Page;
import java.io.IOException;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.ApplicationScope;


/**
 * Interface for class SearchIndexService,
 * contains logic for handling the search index in Spring.Data.
 */
@Service
@ApplicationScope
public interface ISearchIndexService {

  /**
   * Builds a new search index from scratch.
   *
   * @throws IOException if an error occurs while sending/receiving
   *                      http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException if an error occurs while parsing the JSON
   */
  void buildIndex() throws InterruptedException, IOException, JSONException;

  /**
   * Looks or inconsistency based on creation / modified timestamps and updates the search index.
   *
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException if an error occurs while parsing the JSON
   */
  void updateIndex() throws InterruptedException, JSONException, IOException;

  /**
   * Builds a new search index from scratch. This search index is limited to 5 manuscripts.
   *
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException if an error occurs while parsing the JSON
   */
  void buildSmallIndex() throws InterruptedException, IOException, JSONException;


  //CRUD Annotation

  /**
   * Adds an annotation to the search index.
   *
   * @param annotation new annotation
   * @return added annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Annotation addAnnotation(Annotation annotation)
      throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException;

  /**
   * Gets an annotation by its unique annotation identifier from the search index.
   *
   * @param id annotation identifier as String
   * @return Annotation
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Annotation getAnnotationById(String id) throws NoSuchIndexEntryException;

  /**
   * Updates an annotation in the search index.
   *
   * @param annotation updated Annotation
   * @return updated annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Annotation updateAnnotation(Annotation annotation)
      throws IOException, InterruptedException, JSONException, NoSuchIndexEntryException;

  /**
   * Validates an annotation in the search index and notifies the dataaccess package.
   *
   * @param annotation unvalidated annotation
   * @return validated annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Annotation validateAnnotation(Annotation annotation)
      throws IOException, InterruptedException, JSONException, NoSuchIndexEntryException;

  /**
   * Deletes an annotation by its unique annotation identifier from the search index.
   *
   * @param id annotation identifier as String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  void deleteAnnotationById(String id)
      throws IOException, InterruptedException, JSONException, NoSuchIndexEntryException;


  //CRUD TextCard

  /**
   * Adds a body to an annotation in the search index.
   *
   * @param body new Body
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  void addBody(Body body) throws IOException, InterruptedException, JSONException,
      NoSuchIndexEntryException;

  /**
   * Gets a text card from the search index by its unique identifier.
   *
   * @param id text card identifier as String
   * @return TextCard
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  TextCard getTextCardById(String id) throws NoSuchIndexEntryException;

  /**
   * Gets the tag of an annotation by its ID.
   *
   * @param id id of a tag
   * @return corresponding tag
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Tag getTagById(String id) throws NoSuchIndexEntryException;

  /**
   * Updates a body in the search index.
   *
   * @param body updated Body
   * @return updated body with new ID
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Body updateBody(Body body) throws IOException, InterruptedException, JSONException,
      NoSuchIndexEntryException;

  /**
   * Deletes a body entity from the search index by its unique identifier.
   *
   * @param id body identifier as String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  void deleteBodyById(String id) throws IOException, InterruptedException, JSONException,
      NoSuchIndexEntryException;


  /**
   * Gets a manuscript from the search index by its unique identifier.
   *
   * @param id manuscript identifier as String
   * @return Manuscript
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Manuscript getManuscriptById(String id) throws NoSuchIndexEntryException;


  /**
   * Gets a page from the search index by its unique identifier.
   *
   * @param id page identifier as String
   * @return Page
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  Page getPageById(String id) throws NoSuchIndexEntryException;

  /**
   * Gets the JSON metadata of a manuscript as the raw JSON String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw JSON as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  JSONObject getRawManuscriptJson(String manuscriptId)
      throws InterruptedException, IOException, JSONException;

  /**
   * Gets the JSON metadata of a page as the raw JSON String.
   *
   * @param pageId the id of the page
   * @return the raw JSON as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   */
  JSONObject getRawPageJson(String pageId) throws InterruptedException, IOException, JSONException;

  /**
   * Gets the JSON metadata of an annotation as the raw JSON String.
   *
   * @param annotationId the id of the annotation
   * @return the raw JSON as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   */
  JSONObject getRawAnnotationJson(String annotationId)
      throws InterruptedException, IOException, JSONException;

  /**
   * Gets the XML metadata of a manuscript as the raw XML String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw xml as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  String getRawManuscriptXml(String manuscriptId) throws IOException, InterruptedException;
  
  /**
   * Starts the update cycle of the search index with the specified parameters.
   *
   * @param updateIndexDayInterval the interval of the update
   * @param updateIndexHour the hour of day at which the update is performed
   */
  void startIndexUpdateCycle(int updateIndexDayInterval, int updateIndexHour);
}

