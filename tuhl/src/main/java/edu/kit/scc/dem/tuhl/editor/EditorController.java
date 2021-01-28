package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.body.TextCard;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Handles requests and directs them to the EditorService.
 */
@Controller
@RequestMapping("/editor")
public class EditorController {
  private final IEditorService editorService;
  private final IAssistanceService assistanceService;

  private static final String NOT_IMPLEMENTED = "not implemented";
  private static final String REDIRECT_ERROR = "redirect:/error/";

  private static final Logger logger = LoggerFactory.getLogger(EditorController.class);


  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param editorService instance of IEditorService
   * @param assistanceService instance of IAssistanceService
   */
  @Autowired
  public EditorController(IEditorService editorService, IAssistanceService assistanceService) {
    this.editorService = editorService;
    this.assistanceService = assistanceService;
  }
  
  /**
   * Default endpoint. Updates the model and shows the editor, if a current page is set.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return a string to indicate the redirect
   */
  @GetMapping
  public String init(Model model) {
      assistanceService.updateModel(model);
      return "editor";
  }

  /**
   * Changes the currently displayed page.
   *
   * @param pageId Identifier in the editor of the page that should be displayed
   * @return name of html file to display editor
   */
  @GetMapping("/{pageId:.+}")
  public String selectPage(@PathVariable ("pageId") String pageId, Model model) {
    try {
      editorService.selectPage(pageId);
      model.addAttribute("currentPage", editorService.getCurrentPage());
      model.addAttribute("currentManuscript", editorService.getCurrentManuscript());
      assistanceService.updateModel(model);

    } catch (NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    return "/editor";
  }

  /**
   * Changes the visibility of a selected annotation on the displayed page.
   *
   * @param annotationNumber Number of the annotation in the editor
   * @param visibility true, if the annotation should be visible, false else
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/visibility")
  public String changeVisibility(@RequestParam("annotationNumber") int annotationNumber,
                                 @RequestParam("visibility") Boolean visibility, Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Adds a new annotation to the database.
   *
   * @param svg svg of the annotation, that should be added to the page
   * @param color color of the annotation, that should be added
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/addAnnotation")
  public String addAnnotation(@RequestParam("svg") String svg, @RequestParam("color") Color color,
                              Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Endpoint to change the currently selected annotation.
   *
   * @param annotationId the id of the annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return a string to indicate the redirect
   */
  @PostMapping("/select_annotation")
  public String selectAnnotation(@RequestBody String annotationJson, Model model) {
    try {
      JSONObject json = new JSONObject(annotationJson);
      String id = json.getString("id");
      editorService.selectAnnotation(id);
      model.addAttribute("currentAnnotation", editorService.getCurrentAnnotation());
      model.addAttribute("currentPage", editorService.getCurrentPage());
      model.addAttribute("currentManuscript", editorService.getCurrentManuscript());

      assistanceService.updateModel(model);
    } catch (JSONException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    return "editor_fragments :: annotationViewer";
  }

  /**
   * Updates a parameter of an annotation like the color or the SVG form of it.
   *
   * @param svg updated svg of the annotation
   * @param color updated color of the annotation
   * @param motivation updated motivation of the annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/change/annotation")
  public String updateAnnotation(@RequestParam("svg") String svg,
                                 @RequestParam("color") Color color,
                                 @RequestParam("motivation") String motivation, Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Deletes the currently selected Annotation.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/delete/annotation")
  public String deleteAnnotation(Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Adds a text card to an annotation in the database.
   *
   * @param textCard Textcard with the new title, purpose and Value
   * @return the name of the html file to display
   */
  @PostMapping("/add/textcard")
  public String addTextCard(@ModelAttribute("textCard") TextCard textCard) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Saves the made changes of the currently displayed text card.
   *
   * @param text  changed text of the text card
   * @param purpose new purpose of the text card
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/change/textcard")
  public String updateTextCard(@RequestParam("text") String text,
                               @RequestParam("purpose") String purpose, Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Displays all the available metadata of the currently displayed page in a sorted way.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/allmetadata")
  public String getAllMetadata(Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Displays all the available metadata of the currently displayed page as a raw JSON.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/rawmetadata")
  public String getRawMetadata(Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Changes the metadata that are displayed for the user in the editor.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/change/metadata")
  public String changeDisplayedMetadata(Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Adds a tag to an annotation.
   *
   * @param tag   tag that should be added
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/add/tag")
  public String addTag(@RequestParam("tag") String tag, Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Deletes a tag from an annotation.
   *
   * @param tag tag, that should be deleted
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/delete/tag")
  public String deleteTag(@RequestParam("tag") String tag, Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Gets all possible tags for annotations.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/get/allTags")
  public String getAllTags(Model model) {
    throw new AssertionError(NOT_IMPLEMENTED);
  }

  /**
   * Validates an Annotation made by an algorithm.
   *
   * @param validated true, if the annotation is validated, false if the annotation is rejected
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  public String validateAnnotation(@RequestParam("validated") String validated, Model model) {
    try {
      editorService.validateAnnotation(validated);
    } catch (IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return "editor";
  }
}
