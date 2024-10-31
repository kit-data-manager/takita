package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.model.Annotation;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

/**
 * Handles requests and directs them to the EditorService.
 */
@Controller
@RequestMapping("/editor")
public class EditorController {
  private final IEditorService editorService;
  private final IAssistanceService assistanceService;

  //private static final String NOT_IMPLEMENTED = "not implemented";
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
  @GetMapping("/{pageId}")
  public String selectPage(@PathVariable ("pageId") String pageId, Model model) {
    try {
      editorService.selectPage(pageId);
      model.addAttribute("currentPage", editorService.getCurrentPage());
      model.addAttribute("currentManuscript", editorService.getCurrentManuscript());
      model.addAttribute("currentAnnotationsJson", 
        getDisplayableAnnotations(editorService.getCurrentPage().getAnnotations()));
      assistanceService.updateModel(model);
      
    } catch (UnsupportedEncodingException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    return "editor";
  }

  private JSONArray getDisplayableAnnotations(List<Annotation> annotations)
    throws UnsupportedEncodingException {
    JSONArray displayable = new JSONArray();
    try {
      
      for (int i = 0; i < annotations.size(); i++) {
        JSONObject thisAnno = new JSONObject();

        thisAnno.put("id", annotations.get(i).getId());
        String encodedId = URLEncoder.encode(annotations.get(i).getId(), StandardCharsets.UTF_8.toString());
        String encodedIdDouble = URLEncoder.encode(encodedId, StandardCharsets.UTF_8.toString());
        thisAnno.put("idEncoded", encodedIdDouble);
        thisAnno.put("svg", annotations.get(i).getSvgCode());
        if (annotations.get(i).getColor() != null) {
            thisAnno.put("color", annotations.get(i).getColor().getColorHex());
        }
        thisAnno.put("visible", true);
        thisAnno.put("created", annotations.get(i).getCreated());
        thisAnno.put("creator", annotations.get(i).getCreators());
        thisAnno.put("modified", annotations.get(i).getModified());
        thisAnno.put("motivation", annotations.get(i).getMotivation());
        thisAnno.put("via", annotations.get(i).getVia());

        displayable.put(i, thisAnno);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return displayable;
  }
}
