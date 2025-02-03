package edu.kit.datamanager.takita.analysis;

import com.google.gson.Gson;
import com.google.gson.JsonArray;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.dataaccess.AnnotationConverter;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.IRepositoryAccessService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.Page;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;

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


/**
 * Controls the interaction with the user interface concerning the interaction with
 * the databases and provides the api endpoints for those functionalities.
 * Delegates the tasks to the corresponding business logic in an IEditorStubService instance.
 */
@Controller
@RequestMapping("/analysis_api")
public class AnalysisDataController {

  private final IAnnotationStoreAccessService annotationStoreAccessService;
  private final ISearchIndexService searchIndexService;
  private final IRepositoryAccessService repositoryAccessService;
  private final AnnotationConverter annotationConverter;

  @Autowired
  public AnalysisDataController(
    IAnnotationStoreAccessService annotationStoreAccessService,
    IRepositoryAccessService repositoryAccessService,
    ISearchIndexService searchIndexService
  ) {
    this.repositoryAccessService = repositoryAccessService;
    this.annotationStoreAccessService = annotationStoreAccessService;
    this.searchIndexService = searchIndexService;

    this.annotationConverter =  new AnnotationConverter(this.annotationStoreAccessService, this.repositoryAccessService);
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
      JSONObject newAnnoData = new JSONObject(analysisString);
      Annotation newAnnotation = this.annotationConverter.buildAnnotationFromJson(newAnnoData);
      Annotation _storedAnnotation = this.searchIndexService.updateAnnotation(newAnnotation);
      JSONObject storedData = this.annotationStoreAccessService.getAnnotationById(uri);
      annotationJson = storedData.toString();

    } catch (IOException | InterruptedException | JSONException e) {
      return ResponseEntity.status(500).body(e.getMessage());
    } catch (NoSuchIndexEntryException e) {
      return ResponseEntity.status(404).body(e.getMessage());
    }

    // Return updated annotation.
    return ResponseEntity.ok().body(annotationJson);
  }
}