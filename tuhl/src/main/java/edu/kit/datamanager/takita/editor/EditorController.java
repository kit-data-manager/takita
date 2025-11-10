package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.configuration.SecurityConfiguration;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Color;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.ResourceType;
import edu.kit.datamanager.takita.model.target.Target;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.context.request.WebRequest;


/**
 * Handles requests and directs them to the EditorService.
 */
@Controller
@RequestMapping("/editor")
public class EditorController {
  private final IEditorService editorService;
  private final IAssistanceService assistanceService;
  private final SecurityConfiguration securityConfiguration;
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
  public EditorController(IEditorService editorService, IAssistanceService assistanceService, SecurityConfiguration securityConfiguration) {
    this.editorService = editorService;
    this.assistanceService = assistanceService;
    this.securityConfiguration = securityConfiguration;
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
      // necessary to tell thymeleaf and the frontend if security (and thereby csrf protection) is en/disabled.
      // "securityEnabled" is used to let thymleaf decide whether, the editor
      // templates should store the csrf token (which is only available, if security is enabled)
      // or a default value in the "<meta name="_csrf">"-element.
      model.addAttribute("securityEnabled", securityConfiguration.securityEnabled);
      model.addAttribute("currentPage", editorService.getCurrentPage());
      model.addAttribute("currentManuscript", editorService.getCurrentManuscript());
      // TODO: use the project abbreviation instead of the publisher. This can be done
      //	when the manuscript class has an attribute "project"
      model.addAttribute("currentProject", editorService.getCurrentManuscript().getPublisher().replaceAll("\\s",""));
      model.addAttribute("currentAnnotationsJson", 
        getDisplayableAnnotations(editorService.getCurrentPage().getAnnotations()));
      assistanceService.updateModel(model);
    } catch (UnsupportedEncodingException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    
    // choice of which editor (text or image) is returned
    if (editorService.getCurrentPage().getResourceType().equals(ResourceType.TEXT)) {
    	// the text_editor.html needs the name of the file
        // so the javascript in there can call the RestController endpoint (/editor_rest/pageId) and fetch the data.
    	// The filename and fileextension get extracted from the resourceUrl.
    	String[] parts = editorService.getCurrentPage().getResourceUrl().split("/");
    	String fileName = parts[parts.length - 1];
    	model.addAttribute("fileName", fileName);
    	return "editor_text";
    } else {
    	return "editor";
    }
  }
  
  /**
   * Serves all displayable annotations (annoJson) of a page
   * 
   * @param pageId Identifier in the editor of the page that should be displayed
   * @return HTTP entity sent back, either ok for a success including the 
   * 	JSON object containing all all displayable annotations (annoJson) of a page
   * 	or 500, if something went wrong
   */
  @RequestMapping(value = "/{pageId}/displayableAnnotationsJSON", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity getDisplayableAnnotationsJSON(@PathVariable("pageId") String pageId) {
	  JSONArray annoJson = new JSONArray();
	  
	  try {
		  editorService.selectPage(pageId);
		  annoJson =  getDisplayableAnnotations(editorService.getCurrentPage().getAnnotations());
	  } catch (Exception e) {
	      return ResponseEntity.status(500).body(e.getMessage());
	  }
	  return ResponseEntity.ok().body(annoJson.toString());
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
        
        // adding the targets
        JSONArray targets = new JSONArray();
        for (Target target : annotations.get(i).getTargets()) {
        	targets.put(target.getSelector().toString());
        }
        thisAnno.put("svg", targets);
        
        if (annotations.get(i).getColor() != null) {
            thisAnno.put("color", annotations.get(i).getColor().getColorHex());
        }
        thisAnno.put("visible", true);
        thisAnno.put("created", annotations.get(i).getCreated());
        thisAnno.put("creator", annotations.get(i).getCreators());
        thisAnno.put("modified", annotations.get(i).getModified());
        thisAnno.put("motivation", annotations.get(i).getMotivation());
        thisAnno.put("via", annotations.get(i).getVia());
        
        // adding tags to the model
        try {
        	JSONArray tagsJson = new JSONArray();
        	List<Tag> tags = annotations.get(i).getTags();
        	
        	for (Tag tag : tags) {
        		JSONObject value = new JSONObject();
        		value.put("value", tag.getValue());
        		tagsJson.put(value);
        	}
        	
        	thisAnno.put("tags", tagsJson);
        } catch (Exception e) {
        	System.out.println(e);
        	System.out.println("No tags available");
        }
        
        // adding textcards to the model
        try {
        	JSONArray textcardJson = new JSONArray();
        	List<TextCard> textcards = annotations.get(i).getTextCards();
        	
        	for (TextCard textcard : textcards) {
        		JSONObject value = new JSONObject();
        		value.put("value", textcard.getValue());
        		value.put("purpose", textcard.getPurpose());
        		textcardJson.put(value);
        	}
        	
        	thisAnno.put("textcards", textcardJson);
        } catch (Exception e) {
        	System.out.println(e);
        	System.out.println("No textcards available");
        }
        

        displayable.put(i, thisAnno);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return displayable;
  }
}
