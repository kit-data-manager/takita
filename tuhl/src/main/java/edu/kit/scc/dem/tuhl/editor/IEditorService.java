package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;
import java.io.IOException;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;


/**
 * Interface for an Editor Service that should handle the requests from the Editor controller.
 */
@Service
public interface IEditorService {
  /**
   * Initializes the editor view of the page with a specific page Id.
   *
   * @param pageId Id of the page that should be displayed
   */
  void init(String pageId);

  /**
   * Changes the displayed page.
   *
   * @param pageId Identifier of the page that should be displayed
   */
  void changePage(String pageId) throws NoSuchIndexEntryException;

  /**
   * Makes an Annotation visible or invisible on the page.
   *
   * @param annotationNumber internal number of the annotation
   * @param visibility       true, if the annotation should be visible, false if not
   */
  void changeVisibility(int annotationNumber, Boolean visibility);

  void selectAnnotation(String annotationId) throws NoSuchIndexEntryException;

  /**
   * adds an Annotation to the page, that is opened in the editor.
   *
   * @param svg   svg of the annotation
   * @param color color of the annotation
   */
  void addAnnotation(String svg, Color color, String motivation)
      throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException;

  /**
   * Changes the color of the currently selected annotation.
   *
   * @param color new color of the annotation
   */
  void updateColor(Color color) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException;

  /**
   * Changes the SVG-code of the currently selected annotation.
   *
   * @param svg modified SVG-code of the annotation
   */
  void updateSvg(String svg) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException;

  /**
   * Changes the motivation of an annotation, that is set per default.
   *
   * @param motivation motivation of the annotation
   */
  void updateMotivation(String motivation) throws InterruptedException,
      IOException, JSONException, NoSuchIndexEntryException;

  /**
   * Deletes the currently selected annotation.
   */
  void deleteAnnotation() throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException;

  /**
   * Adds a text card to the currently selected annotation.
   *
   * @param text    text of the text card
   * @param purpose purpose of the text card
   * @param title title of the text card
   */
  void addTextCard(String text, String purpose, String title)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException;

  /**
   * updates the text of the currently selected text card.
   *
   * @param text new text of the text card
   */
  void updateTextCard(String text) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException;

  /**
   * updates the purpose of the currently selected text card.
   *
   * @param purpose new purpose of the text card
   */
  void updatePurpose(String purpose) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException;

  /**
   * displays all metadata of the current page.
   */
  void displayMetadata();

  /**
   * displays a JSON of the metadata of the current page.
   * @return
   */
  String displayRawMetadata() throws InterruptedException, JSONException, IOException;

  JSONObject getPageJson() throws InterruptedException, IOException, JSONException;

  /**
   * adds a tag to the currently selected annotation.
   *
   * @param tag tag that should be added to an annotation
   */
  void addTag(String tag) throws InterruptedException, IOException, JSONException,
      NoSuchIndexEntryException;

  /**
   * deletes a tag from an annotation.
   *
   * @param tag tag that should be deleted
   */
  void deleteTag(String tag) throws InterruptedException, IOException, JSONException,
      NoSuchIndexEntryException;

  /**
   * gets all tags that are possible for an annotation.
   *
   * @return all possible tags
   */
  String[] getAllTags() throws NoSuchIndexEntryException;


  /**
   * Returns all Pages, that the Manuscript has.
   * @return pages of the Manuscript
   */
  List<Page> getAllPages();

  /**
   * Changes the current layer to Algorithm-layer, where the user can validate annotation made
   * by an algorithm or to user layer, where an user can make or edit its own annotations.
   *
   * @param algorithmLayer true if it should change to algorithm-layer, false if it should
   *                       change to userLayer
   */
  void algorithmLayer(boolean algorithmLayer);

  /**
   * Validates an Annotation made by an algorithm.
   *
   * @param right true, if the annotation is alright, false if the annotation is wrong
   */
  void validateAnnotation(boolean right) throws InterruptedException,
      IOException, JSONException, NoSuchIndexEntryException;

  String getPageResource(String pageId, String pageNumber, ResourceType resourceType)
      throws NoSuchIndexEntryException;

  /**
   * Gets the currently displaied Annotation.
   * @return currentAnnotation
   */
  Annotation getCurrentAnnotation();

  /**
   * Gets the currently displaied Page.
   * @return Page displaied
   */
  Page getCurrentPage();

  List<Annotation> getAnnotations();

  List<TextCard> getTextCards();
  
  Manuscript getCurrentManuscript();
  
  void updateModel(Model model);
}
