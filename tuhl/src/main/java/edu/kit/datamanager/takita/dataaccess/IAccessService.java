package edu.kit.datamanager.takita.dataaccess;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import java.io.IOException;
import java.text.ParseException;
import java.time.Instant;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;

/**
 * Interface for Class AccessService, contains logic for handling access to databases.
 */
@Service
public interface IAccessService {
  /**
   * Sets the searchIndexService.
   *
   * @param searchIndexService ISearchIndexService to set
   */
  void setSearchIndexService(ISearchIndexService searchIndexService);

  /**
   * Gets all manuscripts and fuses them with all annotations.
   *
   * @return list of all manuscripts
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  List<Manuscript> getAllManuscripts() throws InterruptedException, JSONException, IOException;

  /**
   * Gets all manuscripts and annotations last modified after a certain time.
   *
   * @param timestamp specified time after which all manuscripts should be returned as Date
   * @return list of manuscripts modified after a certain time
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws ParseException if an error occurs while parsing the date
   * @throws NoSuchIndexEntryException if there is a problem finding a modified manuscript in the
   * index
   */
  List<Manuscript> getAllManuscriptsModifiedAfter(Instant timestamp)
      throws InterruptedException, JSONException, IOException,
      ParseException, NoSuchIndexEntryException;

  /**
   * Gets a limited number of manuscripts with pages and annotations specified above.
   *
   * @return List of some manuscripts
   * @throws InterruptedException when http request is interrupted
   * @throws JSONException when there is a problem with parsing the JSON files
   * @throws IOException when the http request is faulty
   */
  List<Manuscript> getFewManuscripts() throws InterruptedException, JSONException, IOException;

  /**
   * Converts annotation to JSONObject so it can be added to database more easily,
   * then tells AnnotationStoreAccess to add it.
   *
   * @param annotation annotation to add to database as Annotation
   * @param pageNumber number of the page on which the annotation is
   * @param projectId id of the project the annotation is associated with, used as subfolder in annotation store
   * @return Annotation with added fields
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  Annotation addAnnotation(Annotation annotation, String pageNumber, String projectId)
      throws JSONException, IOException, InterruptedException;

  /**
   * Converts annotation to JSONObject so it can be added to database more easily,
   * then tells AnnotationStoreAccess to add it to validated container.
   *
   * @param annotation validated annotation
   * @param pageNumber number of the page on which the annotation is
   * @return validated Annotation
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  Annotation validateAnnotation(Annotation annotation, String pageNumber, String projectId)
      throws JSONException, IOException, InterruptedException;

  /**
   * Converts annotation to JSONObject so it can be updated in database more easily,
   * then tells AnnotationStoreAccess to update it.
   *
   * @param annotation annotation to update in database as Annotation
   * @param pageNumber number of the page on which the annotation is
   * @return the updated Annotation
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  Annotation updateAnnotation(Annotation annotation, String pageNumber)
      throws JSONException, IOException, InterruptedException;

  /**
   * Converts annotation so it can be deleted from database more easily,
   * then tells AnnotationStoreAccess to delete it it.
   *
   * @param annotation annotation to be deleted as Annotation
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  void deleteAnnotation(Annotation annotation)
      throws InterruptedException, JSONException, IOException;


  /**
   * Gets the JSON metadata of a manuscript as the raw JSON String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw JSON as a String
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  JSONObject getRawManuscriptJson(String manuscriptId)
      throws InterruptedException, JSONException, IOException;

  /**
   * Gets the JSON metadata of a page as the raw JSON String.
   *
   * @param pageId the id of the page
   * @return the raw JSON as a String
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  JSONObject getRawPageJson(String pageId) throws InterruptedException, JSONException, IOException;

  /**
   * Gets the JSON metadata of an annotation as the raw JSON String.
   *
   * @param annotationId the id of the annotation
   * @return the raw JSON as a String
   * @throws InterruptedException if the http request is interrupted
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws JSONException if an error occurs while parsing json
   */
  JSONObject getRawAnnotationJson(String annotationId)
      throws InterruptedException, JSONException, IOException;

  /**
   * Gets the XML metadata given in the TEI standard of a manuscript as the raw XML String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw xml as a String
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  String getRawManuscriptXml(String manuscriptId) throws IOException, InterruptedException;
}
