package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.dataaccess.IAnnotationStoreAccessService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.sql.Date;
import java.time.Instant;
import java.util.Calendar;
import java.util.List;

@Controller
@RequestMapping("/editor_stub")
public class EditorStubController {

  private final IEditorStubService editorStubService;

  private final ISearchIndexService searchIndexService;
  private final IAnnotationStoreAccessService annotationStoreAccessService;

  @Autowired
  public EditorStubController(IEditorStubService editorStubService,
                              ISearchIndexService searchIndexService,
                              IAnnotationStoreAccessService accessService) {
    this.editorStubService = editorStubService;
    this.searchIndexService = searchIndexService;
    this.annotationStoreAccessService = accessService;
  }
  
  @RequestMapping
  public String init() {
    return "editor_stub";
  }

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

  @PostMapping("/update_annotation")
  public String updateAnnotation(@RequestBody String jsonString,
                                 Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString("annoId");
      String color = json.getString("color");
      String svgCode = json.getString("svgCode");
      String motivation = json.getString("motivation");
      Annotation annotation = editorStubService.updateAnnotation(annoId, color, svgCode, motivation);
      model.addAttribute("annotation", annotation);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: annotationViewer";
  }

  @PostMapping("validate_annotation")
  public String validateAnnotation(@RequestBody String jsonString,
  Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString("annoId");
      Annotation annotation = editorStubService.validateAnnotation(annoId);
      model.addAttribute("annotation", annotation);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: annotationViewer";
  }
  
  @PostMapping("delete_annotation")
  public String deleteAnnotation(@RequestBody String jsonString,
                                 Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString("annoId");
      Annotation annotation = editorStubService.deleteAnnotation(annoId);
      model.addAttribute("annotation", annotation);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: annotationViewer";
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
