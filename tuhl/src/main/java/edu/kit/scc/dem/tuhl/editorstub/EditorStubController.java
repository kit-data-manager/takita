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
  
  @Autowired
  public EditorStubController(IEditorStubService editorStubService) {
    this.editorStubService = editorStubService;
  }
  
  @RequestMapping
  public String init() {
    return "editor_stub";
  }
  
  @PostMapping("/create_annotation")
  public String createAnnotation(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/read_annotation")
  public String readAnnotation(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      Annotation annotation = editorStubService.getAnnotation(id);
      model.addAttribute("annotation", annotation);
    } catch (JSONException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: annotationViewer";
  }
  
  @PostMapping("/update_annotation")
  public String updateAnnotation(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/validate_annotation")
  public String validateAnnotation(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/delete_annotation")
  public String deleteAnnotation(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/create_card")
  public String createTextCard(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/read_card")
  public String readCard(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      TextCard textCard = editorStubService.getTextCard(id);
      model.addAttribute("body", textCard);
    } catch (JSONException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
  }
  
  @PostMapping("/update_card")
  public String updateTextCard(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/delete_card")
  public String deleteTextCard(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/create_tag")
  public String createTag(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/read_tag")
  public String readTag(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      Tag tag = editorStubService.getTag(id);
      model.addAttribute("body", tag);
    } catch (JSONException | NoSuchIndexEntryException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: bodyViewer";
  }
  
  @PostMapping("/update_tag")
  public String updateTag(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/delete_tag")
  public String deleteTag(@RequestBody String jsonString, Model model) {
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
  
  @PostMapping("/raw_manuscript_json")
  public String getManuscriptJson(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      String rawJson = editorStubService.getManuscriptJson(id).toString(2).replace("\\/", "/");
      model.addAttribute("rawJson", rawJson);
    } catch (JSONException | InterruptedException | IOException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: rawJsonViewer";
  }
  
  @PostMapping("/raw_manuscript_xml")
  public String getManuscriptXml(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      String rawXml = editorStubService.getManuscriptXml(id);
      model.addAttribute("rawXml", rawXml);
    } catch (JSONException | InterruptedException | IOException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: rawXmlViewer";
  }
  
  @PostMapping("/raw_page_json")
  public String getPageJson(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      String rawJson = editorStubService.getPageJson(id).toString(2).replace("\\/", "/");
      model.addAttribute("rawJson", rawJson);
    } catch (JSONException | InterruptedException | IOException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: rawJsonViewer";
  }
  
  @PostMapping("/raw_annotation_json")
  public String getAnnotationJson(@RequestBody String jsonString, Model model) {
    try {
      JSONObject json = new JSONObject(jsonString);
      String id = json.getString("id");
      String rawJson = editorStubService.getAnnotationJson(id).toString(2).replace("\\/", "/");
      model.addAttribute("rawJson", rawJson);
    } catch (JSONException | InterruptedException | IOException e) {
      return "redirect:/error/" + e.getMessage();
    }
    return "editor_stub :: rawJsonViewer";
  }
}
