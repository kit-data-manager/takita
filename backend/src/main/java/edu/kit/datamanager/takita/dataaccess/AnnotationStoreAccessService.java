package edu.kit.datamanager.takita.dataaccess;

import java.io.IOException;
import java.net.ConnectException;
import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.net.http.HttpResponse;
import java.nio.charset.Charset;
import java.time.Instant;
import java.util.*;

import edu.kit.datamanager.takita.MissingPropertyException;
import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriBuilder;

/**
 * Contains logic for accessing the annotation store with RestTemplate.
 */
@Service
public class AnnotationStoreAccessService implements IAnnotationStoreAccessService {
  
  private static final Logger logger = LoggerFactory.getLogger(AnnotationStoreAccessService.class);
  private final HttpRequestHelper httpRequestHelper;
  private IRepositoryAccessService repositoryAccessService;

  @Value("${annotationStore.url:#{null}}")
  private String urlPrefix;

  @Value("${sparqlQuery.urlPrefix:#{null}}")
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
   * Fail fast for application startup on missing essential properties that cannot be defaulted:
   * annotationStore.url
   * sparqlQuery.urlPrefix
   */
  @PostConstruct
  public void checkProperty() {
    if (urlPrefix == null || urlPrefix.equals("")) {
      throw new MissingPropertyException("annotationStore.url");
    }
    if (sparqlQueryUrlPrefix == null || sparqlQueryUrlPrefix.equals("")) {
      throw new MissingPropertyException("sparqlQuery.urlPrefix");
    }
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
    try {
      HttpResponse<String> response = httpRequestHelper
              .postAnnotations(urlPrefix + projectId + TAKITA_URL, jsonAnnotation);

      JSONObject annoserverAnnotation = new JSONObject(response.body());
      logger.info("Annotation store response: " + annoserverAnnotation);

      if (HttpStatus.valueOf(response.statusCode()).isError()) {
        throw new JSONException("Unexpected response code " + response.statusCode() + " on annotation store access");
      }

      String annoID;
      if (annoserverAnnotation.has(AnnotationStoreStrings.ID.getName())) {
        annoID = annoserverAnnotation.getString(AnnotationStoreStrings.ID.getName());
      } else {
        throw new JSONException("There was a problem with the annotation");
      }

      //jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), annoID);
      //jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), annoID);
      //jsonAnnotation.remove(AnnotationStoreStrings.ID.getName());
      //HttpResponse<String> response = httpRequestHelper.postAnnotations(urlPrefix
      //    + VALIDATED_URL, jsonAnnotation);
      //JSONObject validatedAnnotation = new JSONObject(response.body());
      putEtag(response, jsonAnnotation);

      jsonAnnotation.put(AnnotationStoreStrings.ID.getName(), annoID);
      return jsonAnnotation;
    } catch(ConnectException e) {
      //catch for specific error message
      logger.error("Unable to connect to annotation server");
      throw new ConnectException("Unable to connect to annotation server"); //rethrow to allow for failure on application level
    }
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

    if(HttpStatus.valueOf(response.statusCode()).isError()) {
      logger.info("Annotation store  for annotation: " + result);
      throw new JSONException("Unexpected response code " + response.statusCode() + " on annotation store access");
    }

    Optional<String> etag = response.headers().firstValue(AnnotationStoreStrings.ETAG.getName());
    if (etag.isPresent()) {
      result.put(AnnotationStoreStrings.ETAG.getName(), etag.get());
    } else {
      logger.warn("Unable to retrieve etag for " + annotationId);
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

	  HttpResponse<String> response = null;
	  String resourceTypeGeneral = repositoryAccessService.getTypeGeneralByPageId(pageId);
	  // the page URL differs depending on the typeGeneral of a page
	  if (resourceTypeGeneral.equals(RepositoryStrings.TEXT.getName())) {
		  //Sparql query to get only the annotations modified after date
		  response = httpRequestHelper.get(sparqlQueryUrlPrefix
			        + SPARQL_QUERY_ANNOTATION_BY_PAGE_1 + URLEncoder.encode(repositoryAccessService.getBaseUrl()
			        + repositoryAccessService.getStaticPath()+ pageId + RepositoryAccessService.DATA_PATH + pageNumber
			        + RepositoryAccessService.FILE_EXTENSION_XML, Charset.defaultCharset())
			        + SPARQL_QUERY_ANNOTATION_BY_PAGE_2);
	  } else if (resourceTypeGeneral.equals(RepositoryStrings.IMAGE.getName())) {
		  //Sparql query to get only the annotations modified after date
		  response = httpRequestHelper.get(sparqlQueryUrlPrefix
			        + SPARQL_QUERY_ANNOTATION_BY_PAGE_1 + URLEncoder.encode(repositoryAccessService.getBaseUrl()
			        + repositoryAccessService.getStaticPath()+ pageId + RepositoryAccessService.DATA_PATH + pageNumber
			        + RepositoryAccessService.MASTER_JPG, Charset.defaultCharset())
			        + SPARQL_QUERY_ANNOTATION_BY_PAGE_2);
	  }

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
    try {
      logger.info("Creating queue for annotation containers");
      HttpResponse<String> currentResponse;
      JSONObject containerJson;
      while (wapContainerQ.size() > 0) {
        String currentUri = wapContainerQ.poll();

        logger.info("Requesting " + currentUri);
        currentResponse = httpRequestHelper.get(currentUri);
        containerJson = new JSONObject(currentResponse.body());
        if (containerJson.has("first")) {
          annoContainerQ.add(currentUri);
        }
        if (containerJson.has("contains")) {
          Object containerContains = containerJson.get("contains");
          if (containerContains instanceof JSONArray containerUriArray) {
            for (int i = 0; i < containerUriArray.length(); i++) {
              String nextContainerURI = containerUriArray.getString(i);
              //TODO: only for testing purposes!
              if (!nextContainerURI.contains("/repo/")) {
                wapContainerQ.add(nextContainerURI);
              }
            }
          }
          if (containerContains instanceof String && !containerContains.toString().contains("/repo/")) {
            wapContainerQ.add(containerContains.toString());
          }
        }
      }
    } catch(ConnectException e) {
      //catch for specific error message
      logger.error("Unable to connect to annotation server");
      throw new ConnectException("Unable to connect to annotation server"); //rethrow to allow for failure on application level
    } catch (JSONException e) {
      //catch for specific error message
      logger.error("Response for annotation container could not be parsed");
      throw e; //rethrow to allow for failure on application level
    }
    if (annoContainerQ.isEmpty()) {
      logger.warn("Could not retrieve any annotation containers. Annotation server state might not be suitable for annotation storage");
    }

    List<JSONObject> annoJsonList = new ArrayList<>();
    for(String containerUri : annoContainerQ) {
      logger.info("Getting annos from {}", containerUri);
      annoJsonList.addAll(getAnnotationsFromContainer(containerUri));
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

    HttpResponse<String> sparqlResponse;
    try {
      //Sparql query to get only the annotations modified after date
      sparqlResponse = httpRequestHelper.get(sparqlQueryUrlPrefix
              + SPARQL_QUERY_LAST_MODIFIED_1 + date + SPARQL_QUERY_LAST_MODIFIED_2
              + date + SPARQL_QUERY_LAST_MODIFIED_3);
    } catch (ConnectException e) {
      logger.error("Error connecting to SPARQL endpoint of annotation server");
      throw new ConnectException("Error connecting to SPARQL endpoint of annotation server");
    }

    //Extracts annotations from response and adds them to the list
    List<JSONObject> modifiedAnnotations = getAnnotationsFromXml(sparqlResponse.body());
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
    //TODO: improve error handling (ConnectionError). This is the only place a responseStatusException is thrown - is it properly handled?
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
    //TODO: improve error handling
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

  /**
   * generic function to post a SPARQL query to the database.
   *
   * @param query the query to be executed
   * @return result of the query as JSONString
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  public String postQuery(String query) throws IOException, InterruptedException {
    HttpResponse<String> response = httpRequestHelper.postSPARQLQuery(sparqlQueryUrlPrefix, query);

    if (response.statusCode() != 200) {
        logger.info("Could not complete query: {} from SPARQL-ednpoint.", query);
    }
    return response.body();
  }

  /**
   * Convert URI to one that can be handled by the wap server in all cases (REST and SPARQL)
   * see: <a href="https://github.com/kit-data-manager/wap-server/issues/72">WAP Server Issue #72</a>
   * @param uri string of the URI to normalize
   * @return normalized URI as string
   */
  public String normalizeAnnostoreURI(String uri) {
    // replacing the port, if wap-server is run at port 80 or 443. Otherwise, the query will not
    // be completed properly as the wap-server will throw:
    // Bad IRI: <http://localhost:80/wap/> Code: 13/DEFAULT_PORT_SHOULD_BE_OMITTED in PORT: If
    //          the port is the default one for the scheme it should be omitted.
    // Bad IRI: <http://localhost:80/wap/> Code: 14/PORT_SHOULD_NOT_BE_WELL_KNOWN in PORT: Ports
    //          under 1024 should be accessed using the appropriate scheme name.
    if (uri == null || uri.isEmpty()) {
      throw new IllegalArgumentException("URI cannot be null or empty");
    }

    URI input;
    try {
      input = new URI(uri);
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException("Invalid URI: " + uri);
    }


    String scheme = input.getScheme();
    String userInfo = input.getUserInfo();
    String host = input.getHost();
    int port = input.getPort();
    String path = input.getPath();
    String query = input.getQuery();
    String fragment = input.getFragment();

    if ("http".equalsIgnoreCase(scheme) && input.getPort() == 80) {
      port = -1;
    }
    if ("https".equalsIgnoreCase(scheme) && input.getPort() == 443) {
      port = -1;
    }

    try {
      URI normalized = new URI(
              scheme.toLowerCase(),       // normalize scheme casing
                  userInfo,
                  host,
                  port,
                  path,
                  query,
                  fragment
      );
      return normalized.toString();
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException("URI could not be normalized: " + uri);
    }
  }
}
