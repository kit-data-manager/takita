package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
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

  @Autowired
  public EditorController(IEditorService editorService) {
    this.editorService = editorService;

  }
  
  /**
   * Default endpoint. Updates the model and shows the editor, if a current page is set.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return a string to indicate the redirect
   */
  @GetMapping
  public String editor(Model model) {
    if (editorService.getCurrentPage() != null) {
      editorService.updateModel(model);
      return "editor";
    } else {
      return "redirect:/error";
    }
  }

  /**
   * Changes the currently displayed page.
   *
   * @param pageId Identifier in the editor of the page that should be displayed
   * @return name of html file to display editor
   */
  @GetMapping("/{pageId}")
  public String selectPage(@PathVariable ("pageId") String pageId) {
    try {
      editorService.changePage(pageId);
    } catch (NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "redirect:/editor";
  }

  /**
   * Changes the visibility of a selected annotation on the displayed page.
   *
   * @param annotationNumber Number of the annotation in the editor
   * @param visibility       true, if the annotation should be visible, false else
   * @param model            the holder for model attributes. Used to pass attributes back to the
   *                         view
   * @return the name of the html file to display
   */
  @GetMapping("/visibility")
  public String changeVisibility(@RequestParam("annotationNumber") int annotationNumber,
                                 @RequestParam("visibility") Boolean visibility, Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Adds a new annotation to the database.
   *
   * @param svg   svg of the annotation, that should be added to the page
   * @param color color of the annotation, that should be added
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/add/annotation")
  public String addAnnotation(@RequestParam("svg") String svg, @RequestParam("color") Color color,
                              Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Updates a parameter of an annotation like the color or the SVG form of it.
   *
   * @param svg   updated svg of the annotation
   * @param color updated color of the annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/change/annotation")
  public String updateAnnotation(@RequestParam("svg") String svg,
                                 @RequestParam("color") Color color, Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Updates the motivation of an Annotation, creating an Annotation it is set per default.
   *
   * @param motivation new motivation of an annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/change/annotation/motivation")
  public String updateMotivation(@RequestParam("motivation") String motivation, Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Deletes the currently selected Annotation.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/delete/annotation")
  public String deleteAnnotation(Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Adds a text card to an annotation in the database.
   *
   * @param textCard Textcard with the new title, purpose and Value
   * @return the name of the html file to display
   */
  @PostMapping("/add/textcard")
  public String addTextCard(@ModelAttribute("textCard") TextCard textCard)
      throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException {
    editorService.addTextCard(textCard.getValue(), textCard.getPurpose(), textCard.getTitle());
    System.out.println("Textkarte hinzugefügt" + textCard.getPurpose() + textCard.getValue()
            + textCard.getTitle());
    return "editor";
  }
  
  /**
   * Endpoint to change the currently selected annotation.
   *
   * @param annotationId the id of the annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return a string to indicate the redirect
   */
  @PostMapping("/select")
  public String selectAnnotation(@RequestBody String annotationId, Model model) {
    try {
      editorService.selectAnnotation(annotationId);
      editorService.updateModel(model);
      return "editor :: editor";
    } catch (NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
  }
  
  /**
   * Saves the made changes of the currently displayed text card.
   *
   * @param text  changed text of the textcard
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/change/textcard/text")
  public String updateTextCard(@RequestParam("text") String text, Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * changes the purpose of a text card when the user wants to change it.
   *
   * @param purpose new purpose of the textcard
   * @param model   the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/change/textcard/purpose")
  public String changePurpose(@RequestParam("purpose") String purpose, Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * displays all the available metadata of the currently displayed page in a sorted way.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/allmetadata")
  public String getAllMetadata(Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * displays all the available metadata of the currently displayed page as a raw JSON.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/rawmetadata")
  public String getRawMetadata(Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * changes the metadata that are displayed for the user in the editor.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/change/metadata")
  public String changeDisplayedMetadata(Model model) {
    throw new AssertionError("not implemented");
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
    throw new AssertionError("not implemented");
  }

  /**
   * Adds a tag to the tag-vocabulary.
   *
   * @param tag   tag that should be added to the vocabulary
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/add/tagtovocabulary")
  public String addTagToVocabulary(@RequestParam("tag") String tag, Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Deletes a tag from the vocabulary.
   *
   * @param tag   Tag, that should be deleted
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/delete/tag")
  public String deleteTag(@RequestParam("tag") String tag, Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Gets all possible tags for annotations.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/get/allTags")
  public String getAllTags(Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Checks out the algorithm layer.
   *
   * @param algorithmLayer true, if it should be changed to altorithm layer, false if it should
   *                       be changed to user layer
   * @param model          the holder for model attributes. Used to pass attributes back to the
   *                       view
   * @return the name of the html file to display
   */
  @PostMapping("/algorithmlayer")
  public String algorithmLayer(@RequestParam("algorithmlayer") Boolean algorithmLayer,
                               Model model) {
    throw new AssertionError("not implemented");
  }

  /**
   * Validates an Annotation made by an algorithm.
   *
   * @param right true, if the annotation is allright, false if the annotation is wrong
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  public String validateAnnotation(@RequestParam("right") Boolean right, Model model) {
    throw new AssertionError("not implemented");
  }
}
