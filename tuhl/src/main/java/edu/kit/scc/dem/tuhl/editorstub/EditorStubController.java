package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.dataaccess.IAnnotationStoreAccessService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
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

  @PostMapping("/create_annotation")
  public String createAnnotation(@RequestBody String jsonString,
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

  @PostMapping("create_card")
  public String createTextCard(@RequestBody String jsonString,
                               Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString("annoId");
      String title = json.getString("title");
      String value = json.getString("value");
      String purpose = json.getString("purpose");
      TextCard textCard = editorStubService.addTextCard(annoId, title, value, purpose);
      model.addAttribute("body", textCard);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
  }
  
  @PostMapping("update_card")
  public String updateTextCard(@RequestBody String jsonString,
                               Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      String title = json.getString("title");
      String value = json.getString("value");
      String purpose = json.getString("purpose");
      TextCard textCard = editorStubService.updateTextCard(id, title, value, purpose);
      model.addAttribute("body", textCard);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
  }
  
  @PostMapping("delete_card")
  public String deleteTextCard(@RequestBody String jsonString,
                               Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      TextCard textCard = editorStubService.deleteTextCard(id);
      model.addAttribute("body", textCard);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
  }
  
  @PostMapping("create_tag")
  public String createTag(@RequestBody String jsonString,
                               Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String annoId = json.getString("annoId");
      String title = json.getString("title");
      String value = json.getString("value");
      Tag tag = editorStubService.addTag(annoId, title, value);
      model.addAttribute("body", tag);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
  }
  
  @PostMapping("update_tag")
  public String updateTag(@RequestBody String jsonString,
                               Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      String title = json.getString("title");
      String value = json.getString("value");
      Tag tag = editorStubService.updateTag(id, title, value);
      model.addAttribute("body", tag);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
  }
  
  @PostMapping("delete_tag")
  public String deleteTag(@RequestBody String jsonString,
                               Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      Tag tag = editorStubService.deleteTag(id);
      model.addAttribute("body", tag);
    } catch (JSONException | InterruptedException | IOException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
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
