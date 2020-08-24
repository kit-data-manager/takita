package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;


/**
 * Implements IAnnotationService, responsible for adding, updating and modifying annotations.
 */
@Service
@SessionScope
public class AnnotationService implements IAnnotationService {

  private final ISearchIndexService searchIndexService;
  private final IAssistanceService assistanceService;

  /**
   * Constructor, initializes instances of interfaces.
   *
   * @param searchIndexService instance of ISearchIndexService
   * @param assistanceService instance of IAssistanceService
   */
  @Autowired
  public AnnotationService(ISearchIndexService searchIndexService,
                           IAssistanceService assistanceService) {
    this.searchIndexService = searchIndexService;
    this.assistanceService = assistanceService;
  }

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
  @Override
  public void createAnnotation(Color color, String svg, String motivation, String pageId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    Annotation annotation = new Annotation();
    annotation.setPageId(pageId);
    annotation.setCreated(Date.from(Instant.now()));
    annotation.setModified(Date.from(Instant.now()));
    annotation.setCreators(Collections.singletonList(assistanceService.getCurrentUser().getName()));
    annotation.setColor(color);
    annotation.setSvgCode(svg);
    //annotation.setMotivation(motivation);
    searchIndexService.addAnnotation(annotation);
  }

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
  @Override
  public void modifyAnnotation(Color color, String annotationId, String motivation, String svg)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationId);
    annotation.setColor(color);
    //annotation.setMotivation(motivation);
    annotation.setSvgCode(svg);
    annotation.setModified(Date.from(Instant.now()));
    if (!annotation.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      annotation.addCreator(assistanceService.getCurrentUser().getName());
    }
    searchIndexService.updateAnnotation(annotation);
  }

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
  @Override
  public void modifyAnnotation(String svg, String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationId);
    annotation.setModified(new java.util.Date());
    annotation.setSvgCode(svg);
    if (!annotation.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      annotation.addCreator(assistanceService.getCurrentUser().getName());
    }
    searchIndexService.updateAnnotation(annotation);
  }

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
  @Override
  public void modifyAnnotation(String svgCode, Color color, String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationId);
    annotation.setSvgCode(svgCode);
    annotation.setColor(color);
    annotation.setModified(Date.from(Instant.now()));
    if (!annotation.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      annotation.addCreator(assistanceService.getCurrentUser().getName());
    }
    searchIndexService.updateAnnotation(annotation);
  }

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
  @Override
  public void modifyMotivation(String motivation, String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationId);
    annotation.setModified(Date.from(Instant.now()));
    //annotation.setMotivation(motivation);
    if (!annotation.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      annotation.addCreator(assistanceService.getCurrentUser().getName());
    }
    searchIndexService.updateAnnotation(annotation);
  }

  /**
   * Returns the annotation specified by the ID.
   *
   * @param annotationId ID of the annotation in question
   * @return annotation
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  @Override
  public Annotation getAnnotationById(String annotationId) throws NoSuchIndexEntryException {
    return searchIndexService.getAnnotationById(annotationId);
  }

  /**
   * Deletes an existing annotation.
   *
   * @param annotationId Id of the annotation that should be deleted
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  @Override
  public void deleteAnnotation(String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    searchIndexService.deleteAnnotationById(annotationId);
  }

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
  @Override
  public void validateAnnotation(String annotationId, boolean isValidated)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    if (isValidated) {
      Annotation annotation = searchIndexService.getAnnotationById(annotationId);
      searchIndexService.validateAnnotation(annotation);
    } else {
      searchIndexService.deleteAnnotationById(annotationId);
    }
  }

  /**
   * Method to get all annotations of a page.
   *
   * @param pageId Id of the page which to that the annotations should be get
   * @return visible represents if an annotation should be visible, true if it should be visible,
   *     false if it should be invisible
   */
  @Override
  public List<Annotation> getAnnotations(String pageId) {
    try {
      ImagePage page = (ImagePage) searchIndexService.getPageById(pageId);
      return page.getAnnotations();
    } catch (IllegalArgumentException | NoSuchIndexEntryException e) {
      return new ArrayList<>();
    }
  }

  /**
   * Returns the currently displayed page.
   *
   * @param pageId ID of the current page
   * @return current page
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  @Override
  public Page getCurrentPage(String pageId) throws NoSuchIndexEntryException {
    return searchIndexService.getPageById(pageId);
  }

}
