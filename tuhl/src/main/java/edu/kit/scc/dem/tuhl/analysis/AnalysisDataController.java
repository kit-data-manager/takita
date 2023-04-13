package edu.kit.scc.dem.tuhl.analysis;

import com.google.gson.Gson;
import com.google.gson.JsonArray;

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
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

import edu.kit.scc.dem.tuhl.dataaccess.IAnnotationStoreAccessService;


/**
 * Controls the interaction with the user interface concerning the interaction with
 * the databases and provides the api endpoints for those functionalities.
 * Delegates the tasks to the corresponding business logic in an IEditorStubService instance.
 */
@Controller
@RequestMapping("/analysis_api")
public class AnalysisDataController {

  private final IAnnotationStoreAccessService annotationStoreAccessService;

  @Autowired
  public AnalysisDataController(IAnnotationStoreAccessService annotationStoreAccessService) {
    this.annotationStoreAccessService = annotationStoreAccessService;
  }

  /**
   * Gets a specific an annotation by ID.
   *
   * @param id
   * @param request
   * @param response
   * @return
   */
  @RequestMapping(value = "/{analysisId}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
  @ResponseBody
  public ResponseEntity<String> getAnnotationById(@PathVariable("analysisId") final String id, final WebRequest request, final HttpServletResponse response) {
    String annotationJson;
    String uri = java.net.URLDecoder.decode(id, StandardCharsets.UTF_8);
    try {
      JSONObject annotation = this.annotationStoreAccessService.getAnnotationById(uri);
      annotationJson = annotation.toString();
    } catch (IOException | InterruptedException | JSONException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    } 
    return ResponseEntity.ok().body(annotationJson);
  }

  /**
   * Update only the analysis body of an annotation.
   * 
   * Note that this is unusual, as normally a PUT request would have the _complete_ annotation
   * as payload, while here currently only the analyis part is given and replaced.
   * 
   * @param request
   * @param response
   * @return
   */
  @RequestMapping(value = "/{analysisId}", method = RequestMethod.PUT)
  public ResponseEntity<String> updateAnnotationAnalysisBody(@PathVariable("analysisId") final String id, @RequestBody final String analysisString, final WebRequest request, final HttpServletResponse response) {
    // Fetch existing annotation object.
    String annotationJson;
    String uri = java.net.URLDecoder.decode(id, StandardCharsets.UTF_8);

    try {
      JSONObject anno = new JSONObject(analysisString);
      String etag = anno.getString("etag");
      JSONObject r = this.annotationStoreAccessService.updateAnnotation(uri, anno, etag);
      annotationJson = r.toString();
    } catch (IOException | InterruptedException | JSONException e) {
      return ResponseEntity.status(500).body(e.getMessage());
    }

    // Return updated annotation.
    return ResponseEntity.ok().body(annotationJson);
  }


  /**
   * Gets a specific analysis annotation by ID.
   * 
   * Currently a stub which always returns the same hardcoded object,
   * just to ensure that the analysis tool has something to play with.
   *
   * @param request to access the headers from the HTTP request
   * @param response to access the headers for the HTTP response
   * @return HTTP entity sent back, either ok for a success including the 
   *    annotations or 500 for an internal error
   */
  @RequestMapping(value = "/dummy", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
  @ResponseBody
  public ResponseEntity getDummyAnalysisForId(final WebRequest request, final HttpServletResponse response) {
    final String newLine = System.getProperty("line.separator");
    final String annotationsJson = String.join(
      newLine,
      "{\"analysis_label\":\"a taste of a poison paradise\",",
      "\"annotator\":\"Britney Spears\",",
      "\"date_created\":\"2022-11-29T12:43:02.930Z\",",
      "\"date_modified\":\"2022-11-29T12:43:02.930Z\",",
      "\"doc_title\":\"Toxic\",",
      "\"doc_reference\":\"refrain, line 3\",",
      "\"file_id\":12345,",
      "\"text\":{\"value\":",
      "\"With a taste of your lips, I'm on a ride\\nYou're toxic, I'm slippin' under\\nWith a taste of a poison paradise\\nI'm addicted to you\\nDon't you know that you're toxic?\"",
      "},",
      "\"propositions\":[{\"evidence\":\"explicit\",\"predicate\":\"\",\"subject\":\"you\",\"type\":\"attribute\",\"value\":\"toxic\"}],",
      "\"open_mappings\":[{\"type\":\"open\",\"source\":\"toxic\",\"target\":\"\"}],",
      "\"complete_mappings\":[{\"type\":\"complete\",\"source\":\"toxic\",\"target\":\"harmful\"}],",
      "\"linkings\":[],",
      "\"project\":\"INF\"}"
    ) ;
    return ResponseEntity.ok().body(annotationsJson);
  }
}