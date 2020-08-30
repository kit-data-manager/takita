package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controls the interaction with the user interface concerning the interaction with
 * the databases and provides the api endpoints for those functionalities.
 * Delegates the tasks to the corresponding business logic in an IEditorStubService instance.
 */
@Controller
@RequestMapping("/editor_stub")
public class EditorStubController {
  
  private static final String REDIRECT_ERROR = "redirect:/error/";
  private static final String FRAGMENT_ANNOTATION_VIEWER = "editor_stub :: annotationViewer";
  private static final String FRAGMENT_BODY_VIEWER = "editor_stub :: bodyViewer";
  private static final String FRAGMENT_RAW_JSON_VIEWER = "editor_stub :: rawJsonViewer";
  private static final String FRAGMENT_RAW_XML_VIEWER = "editor_stub :: rawXmlViewer";
  private static final String ANNOTATION_STRING = "annotation";
  private static final String RAW_JSON_STRING = "rawJson";
  private static final String TITLE_STRING = "title";
  private static final String VALUE_STRING = "value";
  private static final String ANNO_ID_STRING = "annoId";
  private static final String ID_STRING = "id";
  private static final String BODY_STRING = "body";
  
  private final IEditorStubService editorStubService;
  private final IAssistanceService assistanceService;

  /**
   * Constructor for EditorStubController, initializes instances of used beans.
   *
   * @param editorStubService instance of IEditorStubService
   */
  @Autowired
  public EditorStubController(IEditorStubService editorStubService,
                              IAssistanceService assistanceService) {
    this.editorStubService = editorStubService;
    this.assistanceService = assistanceService;
  }

  /**
   * Initializes editor stub.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return editor stub HTML
   */
  @RequestMapping
  public String init(Model model) {
    assistanceService.updateModel(model);
    return "editor_stub";
  }

  /**
   * Delegates the task to create an annotation to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the added annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/create_annotation")
  public String createAnnotation(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String pageId = json.getString("pageId");
      String color = json.getString("color");
      String svgCode = json.getString("svgCode");
      String motivation = json.getString("motivation");
      Annotation annotation = editorStubService.addAnnotation(pageId, color, svgCode, motivation);
      model.addAttribute(ANNOTATION_STRING, annotation);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_ANNOTATION_VIEWER;
  }

  /**
   * Delegates the task to read an annotation to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the annotation to read
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/read_annotation")
  public String readAnnotation(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      Annotation annotation = editorStubService.getAnnotation(id);
      model.addAttribute(ANNOTATION_STRING, annotation);
      assistanceService.updateModel(model);
    } catch (JSONException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_ANNOTATION_VIEWER;
  }

  /**
   * Delegates the task to update an annotation to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the updated annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/update_annotation")
  public String updateAnnotation(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString(ANNO_ID_STRING);
      String color = json.getString("color");
      String svgCode = json.getString("svgCode");
      String motivation = json.getString("motivation");
      Annotation annotation = editorStubService
          .updateAnnotation(annoId, color, svgCode, motivation);
      model.addAttribute(ANNOTATION_STRING, annotation);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_ANNOTATION_VIEWER;
  }

  /**
   * Delegates the task to validate an annotation to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the validated annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/validate_annotation")
  public String validateAnnotation(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString(ANNO_ID_STRING);
      Annotation annotation = editorStubService.validateAnnotation(annoId);
      model.addAttribute(ANNOTATION_STRING, annotation);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_ANNOTATION_VIEWER;
  }

  /**
   * Delegates the task to delete an annotation to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the deleted annotation
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/delete_annotation")
  public String deleteAnnotation(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString(ANNO_ID_STRING);
      Annotation annotation = editorStubService.deleteAnnotation(annoId);
      model.addAttribute(ANNOTATION_STRING, annotation);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_ANNOTATION_VIEWER;
  }

  /**
   * Delegates the task to create a text card to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the added text card
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/create_card")
  public String createTextCard(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString(ANNO_ID_STRING);
      String title = json.getString(TITLE_STRING);
      String value = json.getString(VALUE_STRING);
      String purpose = json.getString("purpose");
      TextCard textCard = editorStubService.addTextCard(annoId, title, value, purpose);
      model.addAttribute(BODY_STRING, textCard);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to read a text card to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the text card to be read
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/read_card")
  public String readCard(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      TextCard textCard = editorStubService.getTextCard(id);
      model.addAttribute(BODY_STRING, textCard);
      assistanceService.updateModel(model);
    } catch (JSONException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to update a text card to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the updated text card
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/update_card")
  public String updateTextCard(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      String title = json.getString(TITLE_STRING);
      String value = json.getString(VALUE_STRING);
      String purpose = json.getString("purpose");
      TextCard textCard = editorStubService.updateTextCard(id, title, value, purpose);
      model.addAttribute(BODY_STRING, textCard);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to delete a text card to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the deleted text card
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/delete_card")
  public String deleteTextCard(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      TextCard textCard = editorStubService.deleteTextCard(id);
      model.addAttribute(BODY_STRING, textCard);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to create a tag to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the added tag
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/create_tag")
  public String createTag(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString(ANNO_ID_STRING);
      String title = json.getString(TITLE_STRING);
      String value = json.getString(VALUE_STRING);
      Tag tag = editorStubService.addTag(annoId, title, value);
      model.addAttribute(BODY_STRING, tag);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to read a tag to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the tag to be read
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/read_tag")
  public String readTag(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      Tag tag = editorStubService.getTag(id);
      model.addAttribute(BODY_STRING, tag);
      assistanceService.updateModel(model);
    } catch (JSONException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to update a tag to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the updated tag
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/update_tag")
  public String updateTag(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      String title = json.getString(TITLE_STRING);
      String value = json.getString(VALUE_STRING);
      Tag tag = editorStubService.updateTag(id, title, value);
      model.addAttribute(BODY_STRING, tag);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to delete a tag to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the deleted tag
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/delete_tag")
  public String deleteTag(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      Tag tag = editorStubService.deleteTag(id);
      model.addAttribute(BODY_STRING, tag);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_BODY_VIEWER;
  }

  /**
   * Delegates the task to get the raw JSON file to a manuscript to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the manuscript in question
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/raw_manuscript_json")
  public String getManuscriptJson(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      String rawJson = editorStubService.getManuscriptJson(id).toString(2).replace("\\/", "/");
      model.addAttribute(RAW_JSON_STRING, rawJson);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_RAW_JSON_VIEWER;
  }

  /**
   * Delegates the task to get the raw XML file to a manuscript to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the manuscript in question
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/raw_manuscript_xml")
  public String getManuscriptXml(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      String rawXml = editorStubService.getManuscriptXml(id);
      model.addAttribute(RAW_JSON_STRING, rawXml);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_RAW_XML_VIEWER;
  }

  /**
   * Delegates the task to get the raw JSON file to a page to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the page in question
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/raw_page_json")
  public String getPageJson(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      String rawJson = editorStubService.getPageJson(id).toString(2).replace("\\/", "/");
      model.addAttribute(RAW_JSON_STRING, rawJson);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_RAW_JSON_VIEWER;
  }

  /**
   * Delegates the task to get the raw JSON file to an annotation to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the annotation in question
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/raw_annotation_json")
  public String getAnnotationJson(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString(ID_STRING);
      String rawJson = editorStubService
          .getAnnotationJson(id)
          .toString(2)
          .replace("\\/", "/");
      model.addAttribute(RAW_JSON_STRING, rawJson);
      assistanceService.updateModel(model);
    } catch (JSONException | IOException e) {
      return REDIRECT_ERROR + e.getMessage();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return REDIRECT_ERROR + e.getMessage();
    }
    return FRAGMENT_RAW_JSON_VIEWER;
  }
}
