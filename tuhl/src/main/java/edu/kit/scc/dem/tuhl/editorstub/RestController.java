package edu.kit.scc.dem.tuhl.editorstub;

import com.google.gson.Gson;
import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

/**
 * Controls the interaction with the user interface concerning the interaction with
 * the databases and provides the api endpoints for those functionalities.
 * Delegates the tasks to the corresponding business logic in an IEditorStubService instance.
 */
@Controller
@RequestMapping("/editor_rest")
public class RestController {
  
  
  private final IEditorStubService editorStubService;

  /**
   * Constructor for EditorStubController, initializes instances of used beans.
   *
   * @param editorStubService instance of IEditorStubService
   */
  @Autowired
  public RestController(IEditorStubService editorStubService) {
    this.editorStubService = editorStubService;
    
  }

  /**
   * Delegates the task to get all annotations for a specific page
   * to IEditorStubService.
   *
   * @param id holds the value specifying the page
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    annotations or 500 for an internal error
   */
  
@RequestMapping(value = "/annotations", method = RequestMethod.GET)
@ResponseBody
public ResponseEntity getAnnotationsForId(@RequestParam("id") String id, final WebRequest request, final HttpServletResponse response) {
   String annotationsJson;
   try {
       List <Annotation> annotations = editorStubService.getAnnotationsForId(id);
       annotationsJson = new Gson().toJson(annotations);
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
   return ResponseEntity.ok().body(annotationsJson);
}

  /**
   * Delegates the task to create an annotation to IEditorStubService.
   *
   * @param jsonString holds the values for specifying the added annotation
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    annotation or 500 for an internal error
   */

@RequestMapping(value = "/annotations", method = RequestMethod.POST)
@ResponseBody
public ResponseEntity createAnnotation(@RequestBody String jsonString, final WebRequest request, final HttpServletResponse response) {
    String annotationJson;
    try {
        JSONObject json = new JSONObject(jsonString);
        String pageId = json.getString("pageId");
        String color = json.getString("color");
        String svgCode = "";
        if (json.has("svgCode")) {
            svgCode = json.getString("svgCode");
        }
        String motivation = json.getString("motivation");
        Annotation annotation = editorStubService.addAnnotation(pageId, color, svgCode, motivation);
        annotationJson = new Gson().toJson(annotation);
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(annotationJson);
}

  /**
   * Delegates the task to read an annotation to IEditorStubService.
   *
   * @param id identifies the annotation to get
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    annotation or 404 if the annotation cannot be found
   */

@RequestMapping(value = "/annotations/{id}", method = RequestMethod.GET, produces = "application/json")
@ResponseBody
public ResponseEntity getAnnotationById(@PathVariable("id") final String id, final WebRequest request, final HttpServletResponse response) { 
    String annotationJson;
    try {
        Annotation annotation = editorStubService.getAnnotation(decodeURL(id));
        annotationJson = new Gson().toJson(annotation);
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (UnsupportedEncodingException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(annotationJson);
}

 /**
   * Delegates the task to read an annotation to IEditorStubService.
   *
   * @param id identifies the annotation to get
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    annotation or 404 if the annotation cannot be found
   */

@RequestMapping(value = "/annotations/{id}", method = RequestMethod.GET, produces = "application/ld+json")
@ResponseBody
public ResponseEntity getAnnotationByIdWadm(@PathVariable("id") final String id, final WebRequest request, final HttpServletResponse response) { 
    String rawJson;
    try {
        rawJson = editorStubService
          .getAnnotationJson(decodeURL(id))
          .toString(2)
          .replace("\\/", "/");
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(rawJson);
}

  /**
   * Delegates the task to update an annotation to IEditorStubService.
   *
   * @param id identifies the annotation to update
   * @param jsonString holds the values for specifying the updated annotation
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    annotation or 404 if the annotation cannot be found or 500 if an 
   *    internal error occurs
   */

@RequestMapping(value = "/annotations/{id}", method = RequestMethod.PUT)
@ResponseBody
public ResponseEntity updateAnnotationById(@PathVariable("id") final String id, @RequestBody final String jsonString, final WebRequest request, final HttpServletResponse response) {
    String annotationJson;
    try {
        JSONObject json = new JSONObject(jsonString);
        String color = json.getString("color");
        String svgCode = json.getString("svgCode");
        String motivation = json.getString("motivation");
        Annotation annotation = editorStubService
          .updateAnnotation(decodeURL(id), color, svgCode, motivation);
        annotationJson = new Gson().toJson(annotation);
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(annotationJson);
}

  /**
   * Delegates the task to delete an annotation to IEditorStubService.
   *
   * @param id identifies the annotation to delete
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either noContent for a success or 404 
   *    if the annotation cannot be found or 500 for an internal error
   */

@RequestMapping(value = "/annotations/{id}", method = RequestMethod.DELETE)
@ResponseBody
public ResponseEntity deleteAnnotationById(@PathVariable("id") final String id, final WebRequest request, final HttpServletResponse response) {
    String annotationJson;
    try {
        Annotation annotation = editorStubService.deleteAnnotation(decodeURL(id));
        annotationJson = new Gson().toJson(annotation);
    } catch (IOException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.noContent().build();
}

  /**
   * Delegates the task to get all bodies for an annotation to IEditorStubService.
   *
   * @param id identifies the annotation for which the bodies are fetched
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success or 404 
   *    if the annotation cannot be found
   */

@RequestMapping(value = "/annotations/{id}/bodies", method = RequestMethod.GET)
@ResponseBody
public ResponseEntity getBodiesForAnnotationById(@PathVariable("id") final String id, final WebRequest request, final HttpServletResponse response) {
    String textCardsJson;
    try {
        Annotation annotation = editorStubService.getAnnotation(decodeURL(id));
        List<TextCard> textCards = annotation.getTextCards();
        textCardsJson = new Gson().toJson(textCards);
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (UnsupportedEncodingException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(textCardsJson);
}

  /**
   * Delegates the task to create an annotation body to IEditorStubService.
   *
   * @param id identifies the annotation to which the body is added
   * @param jsonString holds the values for specifying the added body
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success or 404 
   *    if the annotation cannot be found or 500 for an internal error
   */

@RequestMapping(value = "/annotations/{id}/bodies", method = RequestMethod.POST)
@ResponseBody
public ResponseEntity createBodyForAnnotationById(@PathVariable("id") final String id, @RequestBody String jsonString, final WebRequest request, final HttpServletResponse response) {
    String textCardJson;
    try {
        JSONObject json = new JSONObject(jsonString);
        String title = "";
        String subject = "";
        if (json.has("title")) {
            title = json.getString("title");
        }
        if (json.has("subject")) {
            subject = json.getString("subject");
        }
        String value = "";
        String source = "";
        if (json.has("value")) {
            value = json.getString("value");
        }
        if (json.has("source")) {
            source = json.getString("source");
        }
        String purpose = json.getString("purpose");
        TextCard textCard = editorStubService.addTextCard(decodeURL(id), title, subject, value, source, purpose);
        textCardJson = new Gson().toJson(textCard);
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(textCardJson);
}

  /**
   * Delegates the task to read an annotation body to IEditorStubService.
   *
   * @param id identifies the annotation to get
   * @param bodyId identifies the body to get
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    body or 404 if the body cannot be found
   */

@RequestMapping(value = "/annotations/{id}/bodies/{bodyId}", method = RequestMethod.GET, produces = "application/json")
@ResponseBody
public ResponseEntity getBodyByIdForAnnotationById(@PathVariable("id") final String id, @PathVariable("bodyId") final String bodyId, final WebRequest request, final HttpServletResponse response) {
    String textCardJson;
    try {
        TextCard textCard = editorStubService.getTextCard(bodyId);
        textCardJson = new Gson().toJson(textCard);
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
    return ResponseEntity.ok().body(textCardJson);
}

  /**
   * Delegates the task to read an annotation body to IEditorStubService.
   *
   * @param id identifies the annotation to get
   * @param bodyId identifies the body to get
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    body or 404 if the body cannot be found
   */

@RequestMapping(value = "/annotations/{id}/bodies/{bodyId}", method = RequestMethod.GET, produces = "application/ld+json")
@ResponseBody
public ResponseEntity getBodyByIdForAnnotationByIdWadm(@PathVariable("id") final String id, @PathVariable("bodyId") final String bodyId, final WebRequest request, final HttpServletResponse response) {
    TextCard textCard;
    JSONObject fullJson;
    try {
        textCard = editorStubService.getTextCard(bodyId);
        fullJson = textCard.getFullJson();
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(fullJson);
}

 /**
   * Delegates the task to update an annotation body to IEditorStubService.
   *
   * @param id identifies the annotation to update
   * @param bodyId identifies the body to update
   * @param jsonString holds the values for specifying the updated text card
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    body or 404 if the body cannot be found or 500 for an internal error
   */

@RequestMapping(value = "/annotations/{id}/bodies/{bodyId}", method = RequestMethod.PUT)
@ResponseBody
public ResponseEntity updateBodyByIdForAnnotationById(@PathVariable("id") final String id, @PathVariable("bodyId") final String bodyId, @RequestBody final String jsonString, final WebRequest request, final HttpServletResponse response) {
    String textCardJson;
    try {
        JSONObject json = new JSONObject(jsonString);
        String title = "";
        String subject = "";
        if (json.has("title")) {
            title = json.getString("title");
        }
        if (json.has("subject")) {
            subject = json.getString("subject");
        }
        String value = "";
        String source = "";
        if (json.has("value")) {
            value = json.getString("value");
        }
        if (json.has("source")) {
            source = json.getString("source");
        }
        String purpose = "";
        if (json.has("purpose")) {
            purpose = json.getString("purpose");
        }
        TextCard textCard = editorStubService.updateTextCard(bodyId, title, subject, value, source, purpose);
        textCardJson = new Gson().toJson(textCard);
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    
    return ResponseEntity.ok().body(textCardJson);
}

  /**
   * Delegates the task to delete an annotation body to IEditorStubService.
   *
   * @param id identifies the annotation to delete
   * @param bodyId identifies the body to delete
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either noContent for a success or 404 if 
   * the body cannot be found or 500 for an internal error
   */

@RequestMapping(value = "/annotations/{id}/bodies/{bodyId}", method = RequestMethod.DELETE)
@ResponseBody
public ResponseEntity deleteBodyByIdForAnnotationById(@PathVariable("id") final String id, @PathVariable("bodyId") final String bodyId, final WebRequest request, final HttpServletResponse response) {
    String textCardJson;
    try {
        TextCard textCard = editorStubService.deleteTextCard(bodyId);
        textCardJson = new Gson().toJson(textCard);
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (IOException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.noContent().build();
}

  /**
   * Delegates the task to get all tags for an annotation to IEditorStubService.
   *
   * @param id identifies the annotation for which the bodies are fetched
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success or 404 
   *    if the annotation cannot be found
   */

@RequestMapping(value = "/annotations/{id}/tags", method = RequestMethod.GET)
@ResponseBody
public ResponseEntity getTagsForAnnotationById(@PathVariable("id") final String id, final WebRequest request, final HttpServletResponse response) {
    String tagsJson;
    try {
        Annotation annotation = editorStubService.getAnnotation(decodeURL(id));
        List<Tag> tags = annotation.getTags();
        tagsJson = new Gson().toJson(tags);
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (UnsupportedEncodingException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(tagsJson);
}

  /**
   * Delegates the task to create a tag to IEditorStubService.
   *
   * @param id identifies the annotation to which the tag is added
   * @param jsonString holds the values for specifying the added tag
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success or 404 
   *    if the annotation cannot be found or 500 for an internal error
   */

@RequestMapping(value = "/annotations/{id}/tags", method = RequestMethod.POST)
@ResponseBody
public ResponseEntity createTagForAnnotationById(@PathVariable("id") final String id, @RequestBody String jsonString, final WebRequest request, final HttpServletResponse response) {
    String tagJson;
    try {
        JSONObject json = new JSONObject(jsonString);
        String title = "";
        String subject = "";
        if (json.has("title")) {
            title = json.getString("title");
        }
        if (json.has("subject")) {
            title = json.getString("subject");
        }
        String value = "";
        String source = "";
        if (json.has("value")) {
            value = json.getString("value");
        }
        if (json.has("source")) {
            source = json.getString("source");
        }
        Tag tag = editorStubService.addTag(decodeURL(id), title, subject, value, source);
        tagJson = new Gson().toJson(tag);
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(tagJson);
}

  /**
   * Delegates the task to read a tag to IEditorStubService.
   *
   * @param id identifies the annotation to get
   * @param tagId identifies the body to get
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    tag or 404 if the body cannot be found
   */

@RequestMapping(value = "/annotations/{id}/tags/{tagId}", method = RequestMethod.GET, produces = "application/json")
@ResponseBody
public ResponseEntity getTagByIdForAnnotationById(@PathVariable("id") final String id, @PathVariable("tagId") final String tagId, final WebRequest request, final HttpServletResponse response) {
    String tagJson;
    try {
        Tag tag = editorStubService.getTag(tagId);
        tagJson = new Gson().toJson(tag);
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
    return ResponseEntity.ok().body(tagJson);
}

/**
   * Delegates the task to read a tag to IEditorStubService.
   *
   * @param id identifies the annotation to get
   * @param tagId identifies the body to get
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    tag or 404 if the body cannot be found
   */

@RequestMapping(value = "/annotations/{id}/tags/{tagId}", method = RequestMethod.GET, produces = "application/ld+json")
@ResponseBody
public ResponseEntity getTagByIdForAnnotationByIdWadm(@PathVariable("id") final String id, @PathVariable("tagId") final String tagId, final WebRequest request, final HttpServletResponse response) {
    Tag tag;
    JSONObject fullJson;
    try {
        tag = editorStubService.getTag(tagId);
        fullJson = tag.getFullJson();
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.ok().body(fullJson);
}

 /**
   * Delegates the task to update a tag to IEditorStubService.
   *
   * @param id identifies the annotation to update
   * @param tagId identifies the tag to update
   * @param jsonString holds the values for specifying the updated tag
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    body or 404 if the tag cannot be found or 500 for an internal error
   */

@RequestMapping(value = "/annotations/{id}/tags/{tagId}", method = RequestMethod.PUT)
@ResponseBody
public ResponseEntity updateTagByIdForAnnotationById(@PathVariable("id") final String id, @PathVariable("tagId") final String tagId, @RequestBody final String jsonString, final WebRequest request, final HttpServletResponse response) {
    String tagJson;
    try {
        JSONObject json = new JSONObject(jsonString);
        String title = "";
        String subject = "";
        if (json.has("title")) {
            title = json.getString("title");
        }
        if (json.has("subject")) {
            subject = json.getString("subject");
        }
        String value = "";
        String source = "";
        if (json.has("value")) {
            value = json.getString("value");
        }
        if (json.has("source")) {
            source = json.getString("source");
        }
        Tag tag = editorStubService.updateTag(tagId, title, subject, value, source);
        tagJson = new Gson().toJson(tag);
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    
    return ResponseEntity.ok().body(tagJson);
}

  /**
   * Delegates the task to delete a tag to IEditorStubService.
   *
   * @param id identifies the annotation to delete
   * @param tagId identifies the tag to delete
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either noContent for a success or 404 if 
   * the tag cannot be found or 500 for an internal error
   */

@RequestMapping(value = "/annotations/{id}/tags/{tagId}", method = RequestMethod.DELETE)
@ResponseBody
public ResponseEntity deleteTagByIdForAnnotationById(@PathVariable("id") final String id, @PathVariable("tagId") final String tagId, final WebRequest request, final HttpServletResponse response) {
    Tag tag;
    try {
        tag = editorStubService.deleteTag(tagId);
    } catch (NoSuchIndexEntryException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    } catch (IOException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
    return ResponseEntity.noContent().build();
}

/**
   * Delegates the task to get the raw JSON file to a manuscript to IEditorStubService.
   *
   * @param objectId identifies the object to get meta data about
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    JSON or 500 for an internal error
   */
  
@RequestMapping(value = "/raw/{objectId}", method = RequestMethod.GET, produces = "application/json")
@ResponseBody
public ResponseEntity getObjectJson(@PathVariable("objectId") String objectId, final WebRequest request, final HttpServletResponse response) {
   String rawJson;
   try {
       rawJson = editorStubService.getManuscriptJson(objectId).toString(2).replace("\\/", "/");
    } catch (IOException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
   return ResponseEntity.ok().body(rawJson);
}

/**
   * Delegates the task to get the raw XML file to a manuscript to IEditorStubService.
   *
   * @param objectId identifies the object to get meta data about
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    XML or 500 for an internal error
   */

@RequestMapping(value = "/raw/{objectId}", method = RequestMethod.GET, produces = "application/xml")
@ResponseBody
public ResponseEntity getObjectXml(@PathVariable("objectId") String objectId, final WebRequest request, final HttpServletResponse response) {
   String rawXml;
   try {
       rawXml = editorStubService.getManuscriptXml(objectId);
    } catch (IOException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ResponseEntity.status(500).body(e.getMessage());
    }
   return ResponseEntity.ok().body(rawXml);
}

private String decodeURL(String url) throws UnsupportedEncodingException {
    String decoded = URLDecoder.decode(url, StandardCharsets.UTF_8.toString());
    if (!url.equals(decoded)) {
        decoded = decodeURL(decoded);
    } 
    return decoded;
}

}

