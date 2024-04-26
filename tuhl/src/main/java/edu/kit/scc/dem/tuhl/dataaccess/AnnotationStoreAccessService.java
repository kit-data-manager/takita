package edu.kit.scc.dem.tuhl.dataaccess;

import java.io.IOException;
import java.net.URLEncoder;
import java.net.http.HttpResponse;
import java.nio.charset.Charset;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Contains logic for accessing the annotation store with RestTemplate.
 */
@Service
public class AnnotationStoreAccessService implements IAnnotationStoreAccessService {
  
  private static final Logger logger = LoggerFactory.getLogger(AnnotationStoreAccessService.class);
  private final HttpRequestHelper httpRequestHelper;
  private IRepositoryAccessService repositoryAccessService;

  @Value("${annotationStore.url}")
  private String urlPrefix;

  @Value("${sparqlQuery.urlPrefix}")
  private String sparqlQueryUrlPrefix;

  private static final String VALIDATED_URL = "validated/";

  //private static final String DEINTERPRETATIONE_URL = "deinterpretatione/";
  
  private static final String TAKITA_URL = "takita/";

  private static final String FIRST_PAGE = "?iris=1&page=0";

  private static final String SPARQL_QUERY_LAST_MODIFIED_1 = URLEncoder.encode(
      "PREFIX oa: <http://www.w3.org/ns/oa#> PREFIX as: <http://www.w3.org"
      + "/ns/activitystreams#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
      + "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX foaf: <http://xmlns.com"
      + "/foaf/0.1/> PREFIX dcterms: <http://purl.org/dc/terms/> SELECT ?annotation {GRAPH "
      + "?g { ?annotation a oa:Annotation. ?annotation dcterms:created ?created. ?annotation "
      + "dcterms:modified ?modified. FILTER(xsd:dateTime(?created) > \"", Charset.defaultCharset());

  private static final String SPARQL_QUERY_LAST_MODIFIED_2 = URLEncoder.encode(
      "\"^^xsd:dateTime) FILTER(xsd:dateTime(?modified) > \"", Charset.defaultCharset());

  private static final String SPARQL_QUERY_LAST_MODIFIED_3 = URLEncoder.encode(
      "\"^^xsd:dateTime) FILTER NOT EXISTS { ?annotation <http://dem.scc.kit.edu"
          + "/wapserv/ns#deleted> \"true\"^^xsd:boolean} } }", Charset.defaultCharset());

  private static final String SPARQL_QUERY_ANNOTATION_BY_PAGE_1 = URLEncoder.encode(
      "PREFIX oa: <http://www.w3.org/ns/oa#> PREFIX as: <http://www.w3.org/ns/activitystreams#>"
          + " PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX xsd: <http://www.w3.o"
          + "rg/2001/XMLSchema#> SELECT DISTINCT ?anno {GRAPH ?g {?anno oa:hasTarget/oa:hasSource <",
      Charset.defaultCharset());

  private static final String SPARQL_QUERY_ANNOTATION_BY_PAGE_2 = URLEncoder.encode("> . "
      + "FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> \"true\"^^"
      + "xsd:boolean} } }", Charset.defaultCharset());

  /**
   * Constructor for AnnotationStoreAccessService, initializes HttpRequestHelper and instance of used interface.
   * @param repositoryAccessService Instance of IRepositoryAccessService
   */
  public AnnotationStoreAccessService(IRepositoryAccessService repositoryAccessService) {
    httpRequestHelper = new HttpRequestHelper();
    this.repositoryAccessService = repositoryAccessService;
  }

  /**
   * Adds an annotation to the annotation store.
   *
   * @param jsonAnnotation annotation as JSONObject
   * @param projectId id of the project the annotation is associated with, used as subfolder in annotation store
   * @return new Annotation with ID and ETag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public JSONObject addAnnotation(JSONObject jsonAnnotation, String projectId)
      throws IOException, InterruptedException, JSONException {
    HttpResponse<String> response = httpRequestHelper
        .postAnnotations(urlPrefix + projectId + TAKITA_URL, jsonAnnotation);
    JSONObject deinterpretationeAnnotation = new JSONObject(response.body());
    logger.info("Antwort Annostore: " + deinterpretationeAnnotation.toString());

    String deinterpretationeId;
    if (deinterpretationeAnnotation.has(AnnotationStoreStrings.ID.getName())) {
      deinterpretationeId = deinterpretationeAnnotation
        .getString(AnnotationStoreStrings.ID.getName());
    } else {
      throw new JSONException("There was a problem with the annotation");
    }

    //jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), deinterpretationeId);
    //jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), deinterpretationeId);
    //jsonAnnotation.remove(AnnotationStoreStrings.ID.getName());
    //HttpResponse<String> response = httpRequestHelper.postAnnotations(urlPrefix
    //    + VALIDATED_URL, jsonAnnotation);
    //JSONObject validatedAnnotation = new JSONObject(response.body());
    putEtag(response, jsonAnnotation);
    
    jsonAnnotation.put(AnnotationStoreStrings.ID.getName(),deinterpretationeId);
    return jsonAnnotation;
  }

  /**
   * Gets an annotation from the annotation store by its unique annotation identifier.
   *
   * @param annotationId annotation identifier as String
   * @return annotation as JSONObject
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public JSONObject getAnnotationById(String annotationId)
      throws IOException, InterruptedException, JSONException {
    HttpResponse<String> response = httpRequestHelper.get(annotationId);
    JSONObject result = new JSONObject(response.body());

    if (!response.headers().allValues(AnnotationStoreStrings.ETAG.getName()).isEmpty()) {
      String etag = response.headers().allValues(AnnotationStoreStrings.ETAG.getName())
          .get(response.headers()
              .allValues(AnnotationStoreStrings.ETAG.getName()).size() - 1);
      result.put(AnnotationStoreStrings.ETAG.getName(), etag);
    }

    return result;
  }

  /**
   * Gets the Annotations belonging to a page from the AnnotationStore.
   *
   * @param pageId Identifier of the page
   * @param pageNumber Number of the page
   * @return List of annotations belonging to a page
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public List<JSONObject> getAnnotationsByPageId(String pageId, String pageNumber)
      throws IOException, InterruptedException, JSONException {
    //Sparql query to get only the annotations modified after date
    HttpResponse<String> response = httpRequestHelper.get(sparqlQueryUrlPrefix
        + SPARQL_QUERY_ANNOTATION_BY_PAGE_1 + URLEncoder.encode(repositoryAccessService.getBaseUrl()
        + repositoryAccessService.getStaticPath()+ pageId + RepositoryAccessService.DATA_PATH + pageNumber
        + RepositoryAccessService.MASTER_JPG, Charset.defaultCharset())
        + SPARQL_QUERY_ANNOTATION_BY_PAGE_2);

    //Extracts annotations from response and adds them to the list
    return getAnnotationsFromXml(response.body());
  }
  
  @Override
  public List<JSONObject> getAnnotationsByTarget(String target)
      throws IOException, InterruptedException, JSONException {
    //Sparql query to get only the annotations modified after date
    HttpResponse<String> response = httpRequestHelper.get(sparqlQueryUrlPrefix
        + SPARQL_QUERY_ANNOTATION_BY_PAGE_1 + target
        + SPARQL_QUERY_ANNOTATION_BY_PAGE_2);

    //Extracts annotations from response and adds them to the list
    return getAnnotationsFromXml(response.body());
  }

  /**
   * Gets all annotations in the annotation store.
   *
   * @return list of all annotations
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public List<JSONObject> getAllAnnotations()
      throws IOException, InterruptedException, JSONException {
    logger.info("Getting all annotations.");

    Queue<String> wapContainerQ;
    wapContainerQ = new LinkedList<String>(Arrays.asList(urlPrefix));
    Queue<String> annoContainerQ = new LinkedList<String>();
    

    //Go through all nested containers and queue annotation containers for retrieval
    HttpResponse<String> currentResponse;
    JSONObject containerJson;
    while(wapContainerQ.size() > 0) {
        String currentUri = wapContainerQ.poll();

        currentResponse = httpRequestHelper.get(currentUri.toString());
        containerJson = new JSONObject(currentResponse.body());
        if(containerJson.has("first")) {
          annoContainerQ.add(currentUri);
        }
        if(containerJson.has("contains")) {
          Object containerContains = containerJson.get("contains");
          if (containerContains instanceof JSONArray) {
            JSONArray containerUriArray = (JSONArray)containerContains;
            for (int i = 0; i < containerUriArray.length(); i++) {  
              String nextContainerURI = containerUriArray.getString(i);
              //TODO: only for testing purposes!
              if (!nextContainerURI.contains("/repo/")){
                wapContainerQ.add(nextContainerURI);
              }
            }
          }
          if (containerContains instanceof String && !containerContains.toString().contains("/repo/")) {
            wapContainerQ.add(containerContains.toString());
          }
        }
    }

    List<JSONObject> annoJsonList = new ArrayList<>();
    for(String containerUri : annoContainerQ) {
      logger.info("Getting annos from {}", containerUri);
      annoJsonList.addAll(getAnnotationsFromContainer(containerUri.toString()));
    }


    logger.info("Finished getting Annotations");
    return annoJsonList;
  }
  
  private List<JSONObject> getAnnotationsFromContainer(String containerURL)
      throws JSONException, IOException, InterruptedException {
    List<JSONObject> annotationsJson = new ArrayList<>();
    
    String nextUri = containerURL + FIRST_PAGE;
    HttpResponse<String> response;
    JSONObject annotationList;
    do {
      response = httpRequestHelper.get(nextUri);
      annotationList = new JSONObject(response.body());
    
      //Extracts annotations from response and adds them to the list
      JSONArray items;
      if (annotationList.has(AnnotationStoreStrings.ITEMS.getName())) {
        items = annotationList.getJSONArray(AnnotationStoreStrings.ITEMS.getName());
      } else {
        logger.error("There are no annotations to be got.");
        return Collections.emptyList();
      }
    
      for (int i = 0; i < items.length(); i++) {
        annotationsJson.add(getAnnotationById(items.getString(i)));
      }
    
      if (annotationList.has(AnnotationStoreStrings.NEXT.getName())) {
        nextUri = annotationList.get(AnnotationStoreStrings.NEXT.getName()).toString();
      }
    
      // Repeat while there is a next page given by a link in the response
    } while (annotationList.has(AnnotationStoreStrings.NEXT.getName()));
    return annotationsJson;
  }
  
  /*
  private List<JSONObject> getDeInterpretationeAnnotations(List<String> canonicalIds)
      throws JSONException, IOException, InterruptedException {
    List<JSONObject> deInterpretationeAnnotations = new ArrayList<>();
  
    String nextUri = urlPrefix + DEINTERPRETATIONE_URL + FIRST_PAGE;
    HttpResponse<String> response;
    JSONObject annotationList;
    do {
      response = httpRequestHelper.get(nextUri);
      annotationList = new JSONObject(response.body());
    
      //Extracts annotations from response and adds them to the list
      JSONArray items = annotationList.getJSONArray(AnnotationStoreStrings.ITEMS.getName());
    
      for (int i = 0; i < items.length(); i++) {
        JSONObject item = getAnnotationById(items.getString(i));
        if (!canonicalIds.contains(item.getString(AnnotationStoreStrings.ID.getName()))) {
          deInterpretationeAnnotations.add(item);
        }
      }
    
      if (annotationList.has(AnnotationStoreStrings.NEXT.getName())) {
        nextUri = annotationList.get(AnnotationStoreStrings.NEXT.getName()).toString();
      }
    
      // Repeat while there is a next page given by a link in the response
    } while (annotationList.has(AnnotationStoreStrings.NEXT.getName()));
    return deInterpretationeAnnotations;
  }
  */

  /**
   * Gets all annotations in the annotation store modified after a certain time.
   *
   * @param timestamp specified time after which all annotations should be returned as Date
   * @return list of annotations modified after a certain time
   * @throws JSONException if the response body could not be parsed to json
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  @Override
  public List<JSONObject> getAnnotationsModifiedAfter(Instant timestamp)
      throws JSONException, IOException, InterruptedException {
    logger.info("Getting all annotations modified after {}.", timestamp);

    //String date = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat().format(timestamp);
    String date = timestamp.toString();

    //Sparql query to get only the annotations modified after date
    HttpResponse<String> response = httpRequestHelper.get(sparqlQueryUrlPrefix
        + SPARQL_QUERY_LAST_MODIFIED_1 + date + SPARQL_QUERY_LAST_MODIFIED_2
        + date + SPARQL_QUERY_LAST_MODIFIED_3);

    //Extracts annotations from response and adds them to the list
    List<JSONObject> modifiedAnnotations = getAnnotationsFromXml(response.body());
    List<String> canonicalIds = new ArrayList<>();
    logger.info("Detected {} new or modified annotations", modifiedAnnotations.size());
    for (JSONObject annotation : modifiedAnnotations) {
      if (annotation.has(AnnotationStoreStrings.CANONICAL.getName())) {
        canonicalIds.add(annotation.getString(AnnotationStoreStrings.CANONICAL.getName()));
      }
    }
    List<JSONObject> redundantAnnotations = new ArrayList<>();
    for (JSONObject annotation : modifiedAnnotations) {
      if (canonicalIds.contains(annotation.getString(AnnotationStoreStrings.ID.getName()))) {
        redundantAnnotations.add(annotation);
      }
    }
    for (JSONObject redundantAnnotation : redundantAnnotations) {
      modifiedAnnotations.remove(redundantAnnotation);
    }
    logger.info("Detected {} relevant modified annotations", modifiedAnnotations.size());
    return modifiedAnnotations;
  }

  /**
   * Adds a validated annotation to validated container in the annotation store.
   *
   * @param jsonAnnotation validated annotation
   * @return annotation in validated container with etag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public JSONObject validateAnnotation(JSONObject jsonAnnotation, String projectId)
      throws IOException, InterruptedException, JSONException {
    jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), jsonAnnotation.getString(
        AnnotationStoreStrings.ID.getName()));
    jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), jsonAnnotation.getString(
        AnnotationStoreStrings.ID.getName()));
    jsonAnnotation.remove(AnnotationStoreStrings.ID.getName());
    HttpResponse<String> response = httpRequestHelper.postAnnotations(urlPrefix
        + projectId + VALIDATED_URL, jsonAnnotation);
  
    JSONObject result = new JSONObject(response.body());
  
    putEtag(response, result);
    
    return result;
  }

  /**
   * Updates an annotation already in the annotation store.
   *
   * @param annotationId annotation identifier as String
   * @param jsonAnnotation updated annotation as JSONObject
   * @param etag etag for updating annotation
   * @return JSONObject updated Annotation with new etag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public JSONObject updateAnnotation(String annotationId, JSONObject jsonAnnotation, String etag)
      throws IOException, InterruptedException, JSONException {

    // put in deinterpretatione and add via and canonical fields if anno is already in validated
    // TODO: serious doubts about the function of this method - investigate!
    // TODO: extend test when fixed
    if (jsonAnnotation.has(AnnotationStoreStrings.CANONICAL.getName())) {
      JSONObject deInterpretationeAnnotation = getAnnotationById(jsonAnnotation.getString(
          AnnotationStoreStrings.CANONICAL.getName()));
      JSONObject deInterpretationeJson = new JSONObject(jsonAnnotation.toString());
      deInterpretationeJson.remove(AnnotationStoreStrings.CANONICAL.getName());
      if (!deInterpretationeAnnotation.has(AnnotationStoreStrings.VIA.getName())) {
        deInterpretationeJson.remove(AnnotationStoreStrings.VIA.getName());
      }
      deInterpretationeJson.put(AnnotationStoreStrings.ID.getName(), deInterpretationeAnnotation
          .getString(AnnotationStoreStrings.ID.getName()));
      httpRequestHelper.put(deInterpretationeAnnotation.get(AnnotationStoreStrings
          .ID.getName()).toString(), deInterpretationeJson, deInterpretationeAnnotation.getString(
              AnnotationStoreStrings.ETAG.getName()));
    }
    HttpResponse<String> response = httpRequestHelper.put(annotationId, jsonAnnotation, etag);
    logger.info("Etag: " + etag);
    logger.info(response.toString());
    
    // making errors or redirects of the HTTP communication with the annotation 
    // store visible otherwise they would silently fail
    if (HttpStatus.valueOf(response.statusCode()).is3xxRedirection() || HttpStatus.valueOf(response.statusCode()).isError()) {
        throw new ResponseStatusException(HttpStatus.resolve(response.statusCode()));
    }
    
    putEtag(response, jsonAnnotation);
    
    return jsonAnnotation;
  }
  
  private void putEtag(HttpResponse<String> response, JSONObject jsonAnnotation)
      throws JSONException {
    if (!response.headers().allValues(AnnotationStoreStrings.ETAG.getName()).isEmpty()) {
      String newEtag = response.headers().allValues(AnnotationStoreStrings.ETAG.getName())
          .get(response.headers()
              .allValues(AnnotationStoreStrings.ETAG.getName()).size() - 1);
      jsonAnnotation.put(AnnotationStoreStrings.ETAG.getName(), newEtag);
    }
  }

  /**
   * Deletes an annotation from the annotation store.
   *
   * @param annotationId annotation identifier as String
   * @param etag String required for deleting annotation
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public void deleteAnnotation(String annotationId, String etag)
      throws IOException, InterruptedException, JSONException {
    JSONObject validatedAnnotation = new JSONObject(httpRequestHelper
        .get(annotationId).body());
    // delete in validated or deinterpretatione if anno not in validated
    httpRequestHelper.delete(annotationId, etag);
    // delete in deinterpretatione if anno in validated
    if (validatedAnnotation.has(AnnotationStoreStrings.CANONICAL.getName())) {
      HttpResponse<String> response = httpRequestHelper.get(validatedAnnotation
          .get(AnnotationStoreStrings.CANONICAL.getName()).toString());
      String deInterpretationeEtag = response.headers().allValues(
          AnnotationStoreStrings.ETAG.getName()).get(response.headers()
          .allValues(AnnotationStoreStrings.ETAG.getName()).size() - 1);
      httpRequestHelper.delete(validatedAnnotation.get(
          AnnotationStoreStrings.CANONICAL.getName()).toString(),
          deInterpretationeEtag);
    }
  }

  private List<JSONObject> getAnnotationsFromXml(String xmlResponse)
      throws InterruptedException, JSONException, IOException {
    List<JSONObject> allAnnotations = new ArrayList<>();
    String[] allAnnotationIds = xmlResponse.split(AnnotationStoreStrings.START_URI.getName());
    for (int i = 0; i < allAnnotationIds.length; i++) {
      if (allAnnotationIds[i].contains(AnnotationStoreStrings.URI.getName())) {
        allAnnotationIds[i] = allAnnotationIds[i].substring(allAnnotationIds[i]
                .indexOf(AnnotationStoreStrings.LINK_START.getName()),
            allAnnotationIds[i].indexOf(AnnotationStoreStrings.END_URI.getName()));

        JSONObject annotation = getAnnotationById(allAnnotationIds[i]);
        allAnnotations.add(annotation);
      }
    }
    return allAnnotations;
  }
}
