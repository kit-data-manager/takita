package edu.kit.scc.dem.tuhl.dataaccess;

import java.io.IOException;
import java.net.URLEncoder;
import java.net.http.HttpResponse;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;

/**
 * Contains logic for accessing the annotation store with RestTemplate.
 */
@Service
public class AnnotationStoreAccessService implements IAnnotationStoreAccessService {
  
  private static final Logger logger = LoggerFactory.getLogger(AnnotationStoreAccessService.class);
  private final HttpRequestHelper httpRequestHelper;

  @Value("${annotationStore.url}")
  private String url;

  @Value("${repository.baseUrl}")
  private String repositoryBaseUrl;
  @Value("${repository.staticPath}")
  private String repositoryStaticPath;
  @Value("${sparqlQuery.urlPrefix}")
  private String sparqlQueryUrlPrefix;

  private static final String VALIDATED_URL = "validated/";

  private static final String DEINTERPRETATIONE_URL = "deinterpretatione/";

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
      "\"^^xsd:dateTime) MINUS { ?annotation <http://dem.scc.kit.edu"
          + "/wapserv/ns#deleted> \"true\"^^xsd:boolean} } }", Charset.defaultCharset());

  private static final String SPARQL_QUERY_ANNOTATION_BY_PAGE_1 = URLEncoder.encode(
      "PREFIX oa: <http://www.w3.org/ns/oa#> PREFIX as: <http://www.w3.org/ns/activitystreams#>"
          + " PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX xsd: <http://www.w3.o"
          + "rg/2001/XMLSchema#> SELECT ?anno {GRAPH ?g {?anno oa:hasTarget/oa:hasSource <",
      Charset.defaultCharset());

  private static final String SPARQL_QUERY_ANNOTATION_BY_PAGE_2 = URLEncoder.encode("> . MINUS {"
      + " ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> \"true\"^^xsd:boolean} } }", Charset.defaultCharset());

  /**
   * Constructor for AnnotationStoreAccess, initializes HttpRequestHelper.
   */
  public AnnotationStoreAccessService() {
    httpRequestHelper = new HttpRequestHelper();
  }

  /**
   * Adds an annotation to the annotation store.
   *
   * @param jsonAnnotation annotation as JSONObject
   * @return new Annotation with ID and ETag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public JSONObject addAnnotation(JSONObject jsonAnnotation)
      throws IOException, InterruptedException, JSONException {
    JSONObject deinterpretationeAnnotation = new JSONObject(httpRequestHelper
        .post(url + DEINTERPRETATIONE_URL, jsonAnnotation).body());
    String deinterpretationeId = deinterpretationeAnnotation
        .getString(AnnotationStoreStrings.ID.getName());

    jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), deinterpretationeId);
    jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), deinterpretationeId);
    HttpResponse<String> response = httpRequestHelper.post(url
        + VALIDATED_URL, jsonAnnotation);
    JSONObject validatedAnnotation = new JSONObject(response.body());
    String etag = response.headers().allValues(AnnotationStoreStrings.ETAG.getName())
        .get(response.headers()
        .allValues(AnnotationStoreStrings.ETAG.getName()).size() - 1);

    jsonAnnotation.put(AnnotationStoreStrings.ETAG.getName(), etag);
    jsonAnnotation.put(AnnotationStoreStrings.ID.getName(),
        validatedAnnotation.getString(AnnotationStoreStrings.ID.getName()));
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
    String etag = response.headers().allValues(AnnotationStoreStrings.ETAG.getName())
        .get(response.headers()
        .allValues(AnnotationStoreStrings.ETAG.getName()).size() - 1);

    result.put(AnnotationStoreStrings.ETAG.getName(), etag);
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
        + SPARQL_QUERY_ANNOTATION_BY_PAGE_1 + URLEncoder.encode(repositoryBaseUrl
        + repositoryStaticPath + pageId + RepositoryAccessService.DATA_PATH + pageNumber
            + RepositoryAccessService.MASTER_JPG, Charset.defaultCharset())
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
    List<JSONObject> annotationsJson = new ArrayList<>();

    String nextUri = url + VALIDATED_URL + FIRST_PAGE;
    JSONObject annotationList;
    HttpResponse<String> response;

    do {
      response = httpRequestHelper.get(nextUri);
      annotationList = new JSONObject(response.body());

      //Extracts annotations from response and adds them to the list
      JSONArray items = annotationList.getJSONArray(AnnotationStoreStrings.ITEMS.getName());

      for (int i = 0; i < items.length(); i++) {
        annotationsJson.add(getAnnotationById(items.getString(i)));
      }

      if (annotationList.has(AnnotationStoreStrings.NEXT.getName())) {
        nextUri = annotationList.get(AnnotationStoreStrings.NEXT.getName()).toString();
      }

      // Repeat while there is a next page given by a link in the response
    } while (annotationList.has(AnnotationStoreStrings.NEXT.getName()));
    
    nextUri = url + DEINTERPRETATIONE_URL + FIRST_PAGE;

    do {
      response = httpRequestHelper.get(nextUri);
      annotationList = new JSONObject(response.body());

      //Extracts annotations from response and adds them to the list
      JSONArray items = annotationList.getJSONArray(AnnotationStoreStrings.ITEMS.getName());

      for (int i = 0; i < items.length(); i++) {
        JSONObject item = getAnnotationById(items.getString(i));
        boolean isContainedIn = false;
        for (JSONObject jsonObject : annotationsJson) {
          if (jsonObject.has(AnnotationStoreStrings.CANONICAL.getName())
              && item.getString(AnnotationStoreStrings.ID.getName())
              .equals(jsonObject.getString(AnnotationStoreStrings.CANONICAL.getName()))) {
            isContainedIn = true;
          }
        }
        if (!isContainedIn) {
          annotationsJson.add(item);
        }
      }

      if (annotationList.has(AnnotationStoreStrings.NEXT.getName())) {
        nextUri = annotationList.get(AnnotationStoreStrings.NEXT.getName()).toString();
      }

      // Repeat while there is a next page given by a link in the response
    } while (annotationList.has(AnnotationStoreStrings.NEXT.getName()));
    
    return annotationsJson;
  }

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
  public List<JSONObject> getAnnotationsModifiedAfter(Date timestamp)
      throws JSONException, IOException, InterruptedException {
    logger.info("Getting all annotations modified after {}.", timestamp.toString());
    List<JSONObject> annotationsJson = new ArrayList<>();

    String date = IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(timestamp);

    //Sparql query to get only the annotations modified after date
    HttpResponse<String> response = httpRequestHelper.get(sparqlQueryUrlPrefix
        + SPARQL_QUERY_LAST_MODIFIED_1 + date + SPARQL_QUERY_LAST_MODIFIED_2
        + date + SPARQL_QUERY_LAST_MODIFIED_3);

    //Extracts annotations from response and adds them to the list
    return getAnnotationsFromXml(response.body());
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
  public JSONObject validateAnnotation(JSONObject jsonAnnotation)
      throws IOException, InterruptedException, JSONException {
    jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), jsonAnnotation.getString(
        AnnotationStoreStrings.ID.getName()));
    jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), jsonAnnotation.getString(
        AnnotationStoreStrings.ID.getName()));
    HttpResponse<String> response = httpRequestHelper.post(url + VALIDATED_URL, jsonAnnotation);
    JSONObject result = new JSONObject(response.body());
    String etag = response.headers().allValues(
        AnnotationStoreStrings.ETAG.getName()).get(response.headers()
        .allValues(AnnotationStoreStrings.ETAG.getName()).size() - 1);

    result.put(AnnotationStoreStrings.ETAG.getName(), etag);
    return result;
  }

  /**
   * Updates an annotation already in the annotation store.
   *
   * @param annotationId annotation identifier as String
   * @param jsonAnnotation updated annotation as JSONObject
   * @return JSONObject updated Annotation with etag
   * @throws IOException if an I/O error occurs when sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if the response body could not be parsed to json
   */
  @Override
  public JSONObject updateAnnotation(String annotationId, JSONObject jsonAnnotation)
      throws IOException, InterruptedException, JSONException {

    JSONObject databaseAnnotation = new JSONObject(httpRequestHelper.get(annotationId).body());
    // put in deinterpretatione and add via and canonical fields if anno is already in validated
    if (databaseAnnotation.has(AnnotationStoreStrings.CANONICAL.getName())) {
      httpRequestHelper.put(databaseAnnotation.get(AnnotationStoreStrings
          .CANONICAL.getName()).toString(), jsonAnnotation);

      jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), databaseAnnotation
          .get(AnnotationStoreStrings.VIA.getName()).toString());
      jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), databaseAnnotation
          .get(AnnotationStoreStrings.CANONICAL.getName()).toString());
    }
    HttpResponse<String> response = httpRequestHelper.put(annotationId, jsonAnnotation);
    String etag = response.headers().allValues(AnnotationStoreStrings.ETAG.getName())
        .get(response.headers()
        .allValues(AnnotationStoreStrings.ETAG.getName()).size() - 1);

    jsonAnnotation.put(AnnotationStoreStrings.ETAG.getName(), etag);
    return jsonAnnotation;
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
