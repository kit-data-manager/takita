package edu.kit.datamanager.takita.dataaccess;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

/**
 * Interface for class AnnotationStoreAccess, contains logic for accessing the annotation database.
 */
public interface IAnnotationStoreAccessService {


  /**
   * Adds an annotation to the annotation store.
   *
   * @param jsonAnnotation annotation as JSONObject
   * @param projectId id of the project the annotation is associated with, used as subfolder in annotation store
   * @return new Annotation with ID and ETag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  JSONObject addAnnotation(JSONObject jsonAnnotation, String projectId)
      throws IOException, InterruptedException, JSONException;

  /**
   * Gets an annotation from the annotation store by its unique annotation identifier.
   *
   * @param annotationId annotation identifier as String
   * @return annotation as JSONObject
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  JSONObject getAnnotationById(String annotationId)
      throws IOException, InterruptedException, JSONException;

  /**
   * Gets the Annotations belonging to a page from the AnnotationStore.
   *
   * @param pageId Identifier of the page
   * @param pageNumber Number of the page
   * @return List of annotations belonging to a page
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  List<JSONObject> getAnnotationsByPageId(String pageId, String pageNumber)
      throws IOException, InterruptedException, JSONException;
  
  List<JSONObject> getAnnotationsByTarget(String target)
      throws IOException, InterruptedException, JSONException;

  /**
   * Gets all annotations in the annotation store.
   *
   * @return list of all annotations
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  List<JSONObject> getAllAnnotations() throws IOException, InterruptedException, JSONException;

  /**
   * Gets all annotations in the annotation store modified after a certain time.
   *
   * @param timestamp specified time after which all annotations should be returned as Date
   * @return list of annotations modified after a certain time
   * @throws JSONException if the response body could not be parsed to json
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  List<JSONObject> getAnnotationsModifiedAfter(Instant timestamp)
      throws JSONException, IOException, InterruptedException;

  /**
   * Adds a validated annotation to validated container in the annotation store.
   *
   * @param jsonAnnotation validated annotation
   * @return annotation in validated container with etag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  JSONObject validateAnnotation(JSONObject jsonAnnotation, String projectId)
      throws IOException, InterruptedException, JSONException;

  /**
   * Updates an annotation already in the annotation store.
   *
   * @param annotationId annotation identifier as String
   * @param jsonAnnotation updated annotation as JSONObject
   * @param etag etag for updating annotation
   * @return JSONObject updated Annotation with new etag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  JSONObject updateAnnotation(String annotationId, JSONObject jsonAnnotation, String etag)
      throws IOException, InterruptedException, JSONException;

  /**
   * Deletes an annotation from the annotation store.
   *
   * @param annotationId annotation identifier as String
   * @param etag String required for deleting annotation
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  void deleteAnnotation(String annotationId, String etag)
      throws IOException, InterruptedException, JSONException;
}
