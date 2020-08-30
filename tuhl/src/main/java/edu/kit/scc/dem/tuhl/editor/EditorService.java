package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
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
import org.springframework.web.context.annotation.SessionScope;

/**
 * Implements the Interface IEditorService, handles methods needed by the EditorController.
 */
@Service
@SessionScope
public class EditorService implements IEditorService {
  private Manuscript currentManuscript;
  private Page currentPage;
  private List<Page> pagesInSlider;
  private Annotation currentAnnotation;
  private List<Annotation> annotationsOnPage;
  private TextCard currentTextCard;
  private List<TextCard> textCards;

  private static final String NOT_IMPLEMENTED = "not implemented";

  private final ISearchIndexService searchIndexService;
  private final IAnnotationService annotationService;
  private final ITagService tagService;
  private final ITextCardService textCardService;
  private final IAssistanceService assistanceService;

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param searchIndexService instance of ISearchIndexService
   * @param annotationService instance of IAnnotationService
   * @param tagService instance of ITagService
   * @param textCardService instance of ITextCardService
   * @param assistanceService instance of assistanceService
   */
  public EditorService(ISearchIndexService searchIndexService, IAnnotationService annotationService,
                       ITagService tagService,
                       ITextCardService textCardService, IAssistanceService assistanceService) {
    this.textCardService = textCardService;
    this.searchIndexService = searchIndexService;
    this.annotationService = annotationService;
    this.tagService = tagService;
    this.assistanceService = assistanceService;
  }

  /**
   * Initializes the editor view of the page with a specific page Id.
   *
   * @param pageId Id of the page that should be displayed
   */
  @Override
  public void init(String pageId) {
    throw new UnsupportedOperationException(NOT_IMPLEMENTED);
  }

  /**
   * Changes the displayed page.
   *
   * @param pageId Identifier of the page that should be displayed
   * @throws NoSuchIndexEntryException when there is no page with given ID in the search index
   */
  @Override
  public void changePage(String pageId) throws NoSuchIndexEntryException {
    currentPage = searchIndexService.getPageById(pageId);
    currentManuscript = searchIndexService.getManuscriptById(currentPage.getManuscriptId());
    currentTextCard = null;
  }

  /**
   * Makes an Annotation visible or invisible on the page.
   *
   * @param annotationNumber internal number of the annotation
   * @param visibility true, if the annotation should be visible, false if not
   */
  @Override
  public void changeVisibility(int annotationNumber, Boolean visibility) {
    throw new UnsupportedOperationException(NOT_IMPLEMENTED);
  }

  /**
   * gets all text cards of an Annotation.
   *
   * @param annotationId ID of the Annotation witch text cards should be given
   * @throws NoSuchIndexEntryException when there is no annotation with given ID in the search index
   */
  @Override
  public void selectAnnotation(String annotationId) throws NoSuchIndexEntryException {
    currentAnnotation = annotationService.getAnnotationById(annotationId);
  }

  /**
   * Adds an Annotation to the page, that is opened in the editor.
   *
   * @param svg svg of the annotation as String
   * @param color color of the annotation as Color
   * @param motivation motivation of the annotation as String
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void addAnnotation(String svg, Color color, String motivation)
      throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    annotationService.createAnnotation(color, svg, motivation, currentPage.getId());
  }

  /**
   * Changes the color of the currently selected annotation.
   *
   * @param color new color of the annotation
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void updateColor(Color color) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {
    annotationService.modifyAnnotation(currentAnnotation.getSvgCode(), color,
            currentAnnotation.getId());
  }

  /**
   * Changes the SVG-code of the currently selected annotation.
   *
   * @param svg modified SVG-code of the annotation
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void updateSvg(String svg) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {
    annotationService.modifyAnnotation(svg, currentAnnotation.getId());
  }

  /**
   * Changes the motivation of an annotation, that is set per default.
   *
   * @param motivation motivation of the annotation
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void updateMotivation(String motivation)
      throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    annotationService.modifyMotivation(motivation, currentAnnotation.getId());
  }

  /**
   * Deletes the currently selected annotation.
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void deleteAnnotation() throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {
    searchIndexService.deleteAnnotationById(currentAnnotation.getId());
  }

  /**
   * Adds a text card to the currently selected annotation.
   *
   * @param text text of the text card
   * @param purpose purpose of the text card
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   */
  @Override
  public void addTextCard(String text, String purpose, String title)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException {
    textCardService.createTextCard(currentAnnotation.getId(), text, purpose, title);
  }

  /**
   * Updates the text of the currently selected text card.
   *
   * @param text new text of the text card
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void updateTextCard(String text) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {
    textCardService.modifyTextCard(currentAnnotation.getId(), currentTextCard.getId(), text);
  }

  /**
   * updates the purpose of the currently selected text card.
   *
   * @param purpose new purpose of the text card
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void updatePurpose(String purpose)
      throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    textCardService.modifyPurpose(currentTextCard.getId(), purpose);
  }

  /**
   * Displays all metadata of the current page.
   */
  @Override
  public void displayMetadata() {
    throw new UnsupportedOperationException(NOT_IMPLEMENTED);
  }

  /**
   * Displays a JSON of the metadata of the current page.
   *
   * @return String with the raw JSON data
   * @throws InterruptedException when saving to the database is interrupted
   * @throws JSONException when parsing the object to JSON throw error
   * @throws IOException when http request to database has errors
   */
  @Override
  public String displayRawMetadata() throws InterruptedException, JSONException, IOException {
    String currentMetadata = "The raw JSON: \n \n";
    if (currentManuscript != null) {
      currentMetadata = currentMetadata
              + "JSON of The Manuscript"
                      +  searchIndexService.getRawManuscriptJson(
                          currentManuscript.getId()).toString();
    }
    if (currentPage != null) {
      currentMetadata =
              currentMetadata + "JSON of The Page: /n"
                      + searchIndexService.getRawPageJson(currentPage.getId()).toString();
    }

    if (currentAnnotation != null) {
      currentMetadata = currentMetadata
          + searchIndexService.getRawAnnotationJson(currentAnnotation.getId()).toString();
    }
    return currentMetadata;
  }

  /**
   * Gets the raw JSON of a page.
   *
   * @return JSONObject raw page
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   */
  @Override
  public JSONObject getPageJson() throws InterruptedException, IOException, JSONException {
    return searchIndexService.getRawPageJson(currentPage.getId());
  }

  /**
   * adds a tag to the currently selected annotation.
   *
   * @param tag tag that should be added to an annotation
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void addTag(String tag) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {
    tagService.addTag(tag, currentAnnotation.getId());
  }

  /**
   * Deletes a tag from an annotation.
   *
   * @param tagId ID of tag that should be deleted
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void deleteTag(String tagId) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {
    tagService.deleteTag(tagId);
  }

  /**
   * gets all tags that are possible for an annotation.
   *
   * @return all possible tags
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public String[] getAllTags() throws NoSuchIndexEntryException {
    List<String> listOfTags = tagService.getTags(currentAnnotation.getId());
    return listOfTags.toArray(new String[0]);
  }

  /**
   * Changes the current layer to Algorithm-layer, where the user can validate annotation made by
   * an algorithm or to user layer, where an user can make or edit its own annotations.
   *
   * @param algorithmLayer true if it should change to algorithm-layer, false if it should change
   *                       to userLayer
   */
  @Override
  public void algorithmLayer(boolean algorithmLayer) {
    throw new UnsupportedOperationException(NOT_IMPLEMENTED);
  }

  /**
   * Validates an Annotation made by an algorithm.
   *
   * @param right true, if the annotation is alright, false if the annotation is wrong
   * @throws InterruptedException when saving to the database is interrupted
   * @throws IOException when http request to database has errors
   * @throws JSONException when parsing the object to JSON throw error
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public void validateAnnotation(boolean right)
      throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    annotationService.validateAnnotation(currentAnnotation.getId(), right);
  }

  /**
   * Gets the Image or the Text, that should be displayed.
   *
   * @param pageId Identifier of the page that should be displayed
   * @return Image or Text of the page
   * @throws NoSuchIndexEntryException when there is no object with given ID in the search index
   */
  @Override
  public String getPageResource(String pageId, String pageNumber, ResourceType resourceType)
      throws NoSuchIndexEntryException {
    return searchIndexService.getPageById(pageId).getResourceUrl();
  }

  /**
   * Gets the currently displayed Annotation.
   *
   * @return currentAnnotation
   */
  @Override
  public Annotation getCurrentAnnotation() {
    return currentAnnotation;
  }

  /**
   * Gets the currently displayed Page.
   *
   * @return Page displayed
   */
  @Override
  public Page getCurrentPage() {
    return currentPage;
  }

  /**
   * Gets the current annotations.
   *
   * @return list of annotations
   */
  @Override
  public List<Annotation> getAnnotations() {
    return annotationsOnPage;
  }

  /**
   * Gets all pages of a manuscript.
   *
   * @return All Pages of a manuscript
   */
  @Override
  public List<Page> getAllPages() {
    return pagesInSlider;
  }

  /**
   * Getter for the text cards-List.
   *
   * @return List of the text cards
   */
  @Override
  public List<TextCard> getTextCards() {
    return textCards;
  }

  /**
   * Gets the current manuscript.
   *
   * @return current manuscript
   */
  @Override
  public Manuscript getCurrentManuscript() {
    return currentManuscript;
  }

  /**
   * Updates the attributes of the model.
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  @Override
  public void updateModel(Model model) {
    model.addAttribute("currentPage", getCurrentPage());
    model.addAttribute("currentManuscript", getCurrentManuscript());
    model.addAttribute("currentAnnotation", getCurrentAnnotation());
    model.addAttribute("colors", Color.values());
    model.addAttribute("user", assistanceService.getCurrentUser());
  }
}
