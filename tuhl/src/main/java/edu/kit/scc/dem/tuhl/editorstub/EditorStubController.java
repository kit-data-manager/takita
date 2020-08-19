package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Controller
@RequestMapping("/editor_stub")
public class EditorStubController {

  private final IEditorStubService editorStubService;

  @Autowired
  public EditorStubController(IEditorStubService editorStubService) {
    this.editorStubService = editorStubService;
  }
  
  @RequestMapping
  public String init() {
    return "editor_stub";
  }

  /*
  Needs: pageId
  Can get: color, svgCode, motivation
   */
  @PostMapping("/add_annotation")
  public String addAnnotation(@RequestBody String jsonString,
                              Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String pageId = json.getString("pageId");
      String color = json.getString("color");
      String svgCode = json.getString("svgCode");
      String motivation = json.getString("motivation");
      Annotation annotation = editorStubService.addAnnotation(pageId, color, svgCode, motivation);
      model.addAttribute("annotation", annotation);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: annotationViewer";
  }

  /*
  Needs: annoId
  Can get: color, svgCode, motivation
   */
  public String updateAnnotation() {
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get:
   */
  public String validateAnnotation() {
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get:
   */
  public String deleteAnnotation() {
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get: title, value, purpose
   */
  public String addTextCard(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get: title, value
   */
  public String addTag(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: textcardId
  Can get: title, value, purpose
   */
  public String updateTextCard(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: tagId
  Can get: title, value
   */
  public String updateTag(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: textCardId
  Can get:
   */
  public String deleteTextCard(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: tagId
  Can get:
   */
  public String deleteTag(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: manuId
  Can get:
   */
  public String getManuscriptJson(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: manuId
  Can get:
   */
  public String getManuscriptXml(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: pageId
  Can get:
   */
  public String getPageJson(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get:
   */
  public String getAnnotationJson(){
    throw new AssertionError("Not implemented yet");
  }
}
