package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.page.Page;
import java.io.IOException;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.stereotype.Service;

/**
 * Responsible for adding, updating and modifying annotations.
 */
@Service
public interface IAnnotationService {

  /**
   * Creates a new annotation with the selected properties.
   *
   * @param color the color of the new annotation
   * @param svg the svg data that represents the shape of the annotation the user made
   * @param motivation the motivation of the annotation made
   * @param pageId pageId of the page, the annotation should be added to
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  void createAnnotation(Color color, String svg, String motivation, String pageId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Modifies an existing annotation by changing its color.
   *
   * @param color new color of the annotation
   * @param annotationId Id of the annotation that should be modified
   * @param motivation modified motivation of the annotation
   * @param svg modified svg of the annotation
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  void modifyAnnotation(Color color, String annotationId, String motivation, String svg)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Modifies an existing annotation in its svg code.
   *
   * @param svg svg code of the shape made by the user
   * @param annotationId ID of the annotation that should be modified
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  void modifyAnnotation(String svg, String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Modifies an existing annotation in its svg code and its color.
   *
   * @param svgCode svg code of the shape made by the user
   * @param color color of the shape
   * @param annotationId ID of the annotation that should be modified
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  void modifyAnnotation(String svgCode, Color color, String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Updates the motivation of an annotation.
   *
   * @param motivation motivation of the annotation
   * @param annotationId ID of the annotation that should be modified
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  void modifyMotivation(String motivation, String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Returns the annotation specified by the ID.
   *
   * @param annotationId ID of the annotation in question
   * @return annotation
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  Annotation getAnnotationById(String annotationId) throws NoSuchIndexEntryException;

  /**
   * Deletes an existing annotation.
   *
   * @param annotationId Id of the annotation that should be deleted
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  void deleteAnnotation(String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Validates annotations made by an algorithm.
   *
   * @param annotationId ID of the annotation that should be validated
   * @param isValidated true, if the annotation is validated, false if it is wrong
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  void validateAnnotation(String annotationId, boolean isValidated)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Method to get all annotations of a page.
   *
   * @param pageId Id of the page which to that the annotations should be get
   * @return visible represents if an annotation should be visible, true if it should be visible,
   *     false if it should be invisible
   */
  List<Annotation> getAnnotations(String pageId);

  /**
   * Returns the currently displayed page.
   *
   * @param pageId ID of the current page
   * @return current page
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  Page getCurrentPage(String pageId) throws NoSuchIndexEntryException;

}
