package edu.kit.datamanager.takita.dataaccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.xml.sax.SAXException;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.HttpRequestHelper;
import edu.kit.datamanager.takita.dataaccess.IRepositoryAccessService;
import edu.kit.datamanager.takita.dataaccess.RepositoryStrings;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest (classes = AnnotationStoreAccessService.class)
class AnnotationStoreAccessServiceTest {
  @Autowired
  public AnnotationStoreAccessService annotationStoreAccessService;

  @MockBean
  private IRepositoryAccessService mockedRepositoryAccessService;

  @Mock
  public HttpResponse<String> mockedResponseBase;

  @Mock
  public HttpResponse<String> mockedResponseA04;

  @Mock
  public HttpResponse<String> mockedResponseValidated;

  @Mock
  public HttpResponse<String> mockedResponseDeInterpretatione;
  
  @Mock
  public HttpResponse<String> mockedResponsePage1;

  @Mock
  public HttpResponse<String> mockedResponsePage2;

  @Mock
  public HttpResponse<String> mockedResponsePage3;

  @Mock
  public HttpResponse<String> mockedAnnotation1;

  @Mock
  public HttpResponse<String> mockedAnnotation2;

  @Mock
  public HttpResponse<String> mockedAnnotation3;

  @Mock
  public HttpResponse<String> mockedAnnotation4;

  @Mock
  public HttpRequestHelper mockedRequestHelper;

  @Mock
  public HttpClient mockedHttpClient;

  @BeforeEach
  void init() throws NoSuchFieldException {
    //Insert mock HttpRequestHelper into private field of the AnnotationStoreAccessService instance
    ReflectionTestUtils.setField(annotationStoreAccessService, "httpRequestHelper", mockedRequestHelper);
  }

  @Test
  void addAnnotation() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject newAnnotation1 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation1.json"));
    JSONObject newAnnotation2 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation2.json"));

    //Builds body for mock response
    Mockito.when(mockedAnnotation1.body()).thenReturn(newAnnotation1.toString());
    Mockito.when(mockedAnnotation2.body()).thenReturn(newAnnotation2.toString());

    //Define mock headers
    List<String> etags = new ArrayList<>();
    etags.add("ktcnefhkbtgdqobilpvs");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags);
    Mockito.when(mockedAnnotation1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    Mockito.when(mockedAnnotation2.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));

    //Define mock response to get requests
    Mockito.when(mockedRequestHelper.postAnnotations("http://sampleannoserver.edu/wap/a04/takita/", newAnnotation1))
        .thenReturn(mockedAnnotation1);
    Mockito.when(mockedRequestHelper.postAnnotations("http://sampleannoserver.edu/wap/a04/takita/", newAnnotation2))
        .thenReturn(mockedAnnotation2);

    JSONObject actualAnnotation1 = annotationStoreAccessService.addAnnotation(newAnnotation1, "a04/");
    JSONObject actualAnnotation2 = annotationStoreAccessService.addAnnotation(newAnnotation2, "a04/");

    //JSONObject expectedAnnotation1 = newAnnotation1;
    JSONObject annotationJson1 = new JSONObject(mockedAnnotation1.body());
    newAnnotation1.put("etag", "ktcnefhkbtgdqobilpvs");
    newAnnotation1.put("id", annotationJson1.getString("id"));
    JSONObject annotationJson2 = new JSONObject(mockedAnnotation2.body());
    newAnnotation2.put("etag", "ktcnefhkbtgdqobilpvs");
    newAnnotation2.put("id", annotationJson2.getString("id"));

    JSONAssert.assertEquals(newAnnotation1.toString(), actualAnnotation1.toString(), true);
    JSONAssert.assertEquals(newAnnotation2.toString(), actualAnnotation2.toString(), true);
  }

  @Test
  void getAnnotationById() throws IOException, InterruptedException, JSONException, org.json.JSONException {
    //Builds body for mock response
    Mockito.when(mockedAnnotation1.body()).thenReturn(readStringFromRelativePath("getAnnotationById/annotation1.json"));
    Mockito.when(mockedAnnotation2.body()).thenReturn(readStringFromRelativePath("getAnnotationById/annotation2.json"));

    //Mock headers
    List<String> etags = new ArrayList<>();
    etags.add("ktcnefhkbtgdqobilpvs");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags);
    Mockito.when(mockedAnnotation1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    Mockito.when(mockedAnnotation2.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));


    //Define mock response to get requests
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/validated/bb43925c-9903-43f6-92c4-0b3ed4b1d3d9"))
        .thenReturn(mockedAnnotation1);
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/deinterpretatione/3fe548c5-8be6-40f7-88c8-0118e47c9ac8"))
        .thenReturn(mockedAnnotation2);

    JSONObject actualAnnotation1 = annotationStoreAccessService.getAnnotationById(
        "http://sampleannoserver.edu/wap/a04/validated/bb43925c-9903-43f6-92c4-0b3ed4b1d3d9");
    JSONObject actualAnnotation2 = annotationStoreAccessService.getAnnotationById(
        "http://sampleannoserver.edu/wap/a04/deinterpretatione/3fe548c5-8be6-40f7-88c8-0118e47c9ac8");

    JSONObject expectedAnnotation1 = new JSONObject(readStringFromRelativePath("getAnnotationById/annotation1.json"));
    expectedAnnotation1.put("etag", etags.get(etags.size() - 1));
    JSONObject expectedAnnotation2 = new JSONObject(readStringFromRelativePath("getAnnotationById/annotation2.json"));
    expectedAnnotation2.put("etag", etags.get(etags.size() - 1));

    JSONAssert.assertEquals(expectedAnnotation1.toString(), actualAnnotation1.toString(), true);
    JSONAssert.assertEquals(expectedAnnotation2.toString(), actualAnnotation2.toString(), true);
  }

  @Test
  void getAnnotationsByPageId() throws IOException, JSONException, InterruptedException, org.json.JSONException {
	  String pageId = "f2e20635-8898-4983-9a86-c6e3d8006016";
    JSONObject annotation1 = new JSONObject(readStringFromRelativePath("getAnnotationsByPageId/annotation1.json"));
        JSONObject annotation2 = new JSONObject(readStringFromRelativePath("getAnnotationsByPageId/annotation2.json"));
  //Builds bodies for mock response
    Mockito.when(mockedResponsePage1.body()).thenReturn(readStringFromRelativePath("getAnnotationsByPageId/responsePage.xml"));
    Mockito.when(mockedAnnotation1.body()).thenReturn(annotation1.toString());
    Mockito.when(mockedAnnotation2.body()).thenReturn(annotation2.toString());

    Mockito.when(mockedRepositoryAccessService.getBaseUrl()).thenReturn("http://samplerepo.edu/");
    Mockito.when(mockedRepositoryAccessService.getStaticPath()).thenReturn("api/v1/dataresources/");
    Mockito.when(mockedRepositoryAccessService.getTypeGeneralByPageId(pageId)).thenReturn(RepositoryStrings.IMAGE.getName());

    Mockito.when(mockedRequestHelper
        .get("http://sampleannoserver-sparql.edu/wap/sparql?query=PREFIX+oa%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%" +
            "2Foa%23%3E+PREFIX+as%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Factivitystreams%23%3E+PREFIX+rdf%3A+%3Cht" +
            "tp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E+PREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.or" +
            "g%2F2001%2FXMLSchema%23%3E+SELECT+DISTINCT+%3Fanno+%7BGRAPH+%3Fg+%7B%3Fanno+oa%3AhasTarget%2Foa%3AhasSource+" +
            "%3Chttp%3A%2F%2Fsamplerepo.edu%2Fapi%2Fv1%2Fdataresources%2Ff2e20635-8898-4983-9a86-c" +
            "6e3d8006016%2Fdata%2F033r.master.jpg%3E+.+FILTER+NOT+EXISTS+%7B+%3Fanno+%3Chttp%3A%2F%2Fdem.scc.kit.edu%2Fwapse" +
            "rv%2Fns%23deleted%3E+%22true%22%5E%5Exsd%3Aboolean%7D+%7D+%7D"))
        .thenReturn(mockedResponsePage1);
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/deinterpretatione/fa1aca6a-00a" +
        "b-41d0-9ef6-35bf4045c02a")).thenReturn(mockedAnnotation1);
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/deinterpretatione/4d5b56a7-7c" +
        "10-4b30-8968-b6f5a39e9ab7")).thenReturn(mockedAnnotation2);

    //Mock headers
    List<String> etags = new ArrayList<>();
    etags.add("ktcnefhkbtgdqobilpvs");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags);
    Mockito.when(mockedAnnotation1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    Mockito.when(mockedAnnotation2.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    annotation1.put("etag", "ktcnefhkbtgdqobilpvs");
    annotation2.put("etag", "ktcnefhkbtgdqobilpvs");

    List<JSONObject> expectedAnnotations = new ArrayList<>();
    expectedAnnotations.add(annotation1);
    expectedAnnotations.add(annotation2);

    List<JSONObject> actualAnnotations = annotationStoreAccessService.getAnnotationsByPageId(pageId, "033r");

    assertEquals(expectedAnnotations.size(), actualAnnotations.size());
    for (JSONObject expAnnotation : expectedAnnotations) {
      for (JSONObject actAnnotation : actualAnnotations) {
        if (expAnnotation.getString("id").equals(actAnnotation.getString("id"))) {
          JSONAssert.assertEquals(expAnnotation.toString(), actAnnotation.toString(), true);
        }
      }
    }
  }

  @Test
  void getAllAnnotations() throws IOException, InterruptedException, JSONException, org.json.JSONException {
    //Builds bodies for mock response
    Mockito.when(mockedResponseBase.body()).thenReturn(readStringFromRelativePath("getAllAnnotations/responseBaseContainer.json"));
    Mockito.when(mockedResponseA04.body()).thenReturn(readStringFromRelativePath("getAllAnnotations/responseA04Container.json"));
    Mockito.when(mockedResponseValidated.body()).thenReturn(readStringFromRelativePath("getAllAnnotations/responseValidated.json"));
    Mockito.when(mockedResponseDeInterpretatione.body()).thenReturn(readStringFromRelativePath("getAllAnnotations/responseDeInterpretatione.json"));
    Mockito.when(mockedResponsePage1.body()).thenReturn(readStringFromRelativePath("getAllAnnotations/responsePage1.json"));
    Mockito.when(mockedResponsePage2.body()).thenReturn(readStringFromRelativePath("getAllAnnotations/responsePage2.json"));

    Mockito.when(mockedAnnotation1.body()).thenReturn(new JSONArray(readStringFromRelativePath(
        "getAllAnnotations/expectedObject1.json")).getJSONObject(0).toString());
    Mockito.when(mockedAnnotation2.body()).thenReturn(new JSONArray(readStringFromRelativePath(
        "getAllAnnotations/expectedObject1.json")).getJSONObject(1).toString());
    Mockito.when(mockedAnnotation3.body()).thenReturn(new JSONArray(readStringFromRelativePath(
        "getAllAnnotations/expectedObject2.json")).getJSONObject(0).toString());

    //Define mock responses to get requests
    Mockito.when(mockedRequestHelper
        .get("http://sampleannoserver.edu/wap/"))
        .thenReturn(mockedResponseBase);
    Mockito.when(mockedRequestHelper
        .get("http://sampleannoserver.edu/wap/a04/"))
        .thenReturn(mockedResponseA04);
    Mockito.when(mockedRequestHelper
        .get("http://sampleannoserver.edu/wap/a04/validated/"))
        .thenReturn(mockedResponseValidated);
    Mockito.when(mockedRequestHelper
        .get("http://sampleannoserver.edu/wap/a04/deinterpretatione/"))
        .thenReturn(mockedResponseDeInterpretatione);
    Mockito.when(mockedRequestHelper
        .get("http://sampleannoserver.edu/wap/a04/validated/?iris=1&page=0"))
        .thenReturn(mockedResponsePage1);
    Mockito.when(mockedRequestHelper
        .get("http://sampleannoserver.edu/wap/a04/deinterpretatione/?iris=1&page=0"))
        .thenReturn(mockedResponsePage2);
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/validated/cd9267d1-540" +
        "2-4f48-ae99-8b5559ccc456")).thenReturn(mockedAnnotation1);
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/validated/bb43925c-990" +
        "3-43f6-92c4-0b3ed4b1d3d9")).thenReturn(mockedAnnotation2);
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/deinterpretatione/05c2" +
        "81d1-5184-4b74-a9dd-5fbac538f75c")).thenReturn(mockedAnnotation3);

    //Mock headers
    List<String> etags = new ArrayList<>();
    etags.add("ktcnefhkbtgdqobilpvs");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags);
    Mockito.when(mockedAnnotation1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    Mockito.when(mockedAnnotation2.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    Mockito.when(mockedAnnotation3.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));

    //Build expected return object
    List<JSONObject> expected = new ArrayList<>();
    JSONArray expectedArray1 = new JSONArray(readStringFromRelativePath("getAllAnnotations/expectedObject1.json"));
    JSONArray expectedArray2 = new JSONArray(readStringFromRelativePath("getAllAnnotations/expectedObject2.json"));
    for (int i = 0; i < expectedArray1.length(); i++) {
      expected.add(expectedArray1.getJSONObject(i));
      expected.get(i).put("etag", etags.get(etags.size() - 1));
    }
    expectedArray2.getJSONObject(0).put("etag", etags.get(etags.size() - 1));
      expected.add(expectedArray2.getJSONObject(0));

    List<JSONObject> actual = annotationStoreAccessService.getAllAnnotations();

    // TODO: return values are different JSON objects, thus assertIterable does not work - why?
    //assertIterableEquals(expected, actual);

    assertEquals(expected.size(), actual.size());
    for (int i = 0; i < expected.size(); i++) {
      for (int j = 0; j < actual.size(); j++) {
        if (expected.get(i).getString("id").equals(actual.get(j).getString("id"))) {
          JSONAssert.assertEquals(expected.get(i).toString(), actual.get(j).toString(), true);
        }
      }
    }
  }

  @Test
  void getAnnotationsModifiedAfter() throws IOException, InterruptedException, ParseException, JSONException, org.json.JSONException, ParserConfigurationException, SAXException {
    //Builds body for mock response
    Mockito.when(mockedResponsePage3.body()).thenReturn(readStringFromRelativePath("getAllAnnotationsModifiedAfter/responsePage3.xml"));
    Mockito.when(mockedAnnotation1.body()).thenReturn(readStringFromRelativePath("getAllAnnotationsModifiedAfter/annotation1.json"));
    Mockito.when(mockedAnnotation2.body()).thenReturn(readStringFromRelativePath("getAllAnnotationsModifiedAfter/annotation2.json"));

    //Mock headers
    List<String> etags = new ArrayList<>();
    etags.add("ktcnefhkbtgdqobilpvs");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags);
    Mockito.when(mockedAnnotation1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    Mockito.when(mockedAnnotation2.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));

    //Define mock response to get requests
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver-sparql.edu/wap/sparql?query=PREFIX+oa%" +
        "3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Foa%23%3E+PREFIX+as%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fac" +
        "tivitystreams%23%3E+PREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%" +
        "3E+PREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E+PREFIX+foaf%3A+%3Chttp%3A" +
        "%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E+PREFIX+dcterms%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3" +
        "E+SELECT+%3Fannotation+%7BGRAPH+%3Fg+%7B+%3Fannotation+a+oa%3AAnnotation.+%3Fannotation+dcterms" +
        "%3Acreated+%3Fcreated.+%3Fannotation+dcterms%3Amodified+%3Fmodified.+FILTER%28xsd%3AdateTime%28" +
        "%3Fcreated%29+%3E+%222019-05-08T10:59:35Z%22%5E%5Exsd%3AdateTime%29+FILTER%28xsd%3AdateTime" +
        "%28%3Fmodified%29+%3E+%222019-05-08T10:59:35Z%22%5E%5Exsd%3AdateTime%29+FILTER+NOT+EXISTS+%" +
        "7B+%3Fannotation+%3Chttp%3A%2F%2Fdem.scc.kit.edu%2Fwapserv%2Fns%23deleted%3E+%22true%22%5E%5Exs" +
        "d%3Aboolean%7D+%7D+%7D")).thenReturn(mockedResponsePage3);

    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/deinterpretatione/" +
        "05c281d1-5184-4b74-a9dd-5fbac538f75c")).thenReturn(mockedAnnotation1);
    Mockito.when(mockedRequestHelper.get("http://sampleannoserver.edu/wap/a04/deinterpretatione/" +
        "1749ce9c-a79a-4929-8299-edc9c0388fcc")).thenReturn(mockedAnnotation2);

    List<JSONObject> actual = annotationStoreAccessService.getAnnotationsModifiedAfter(
        Instant.parse("2019-05-08T10:59:35Z"));

    List<JSONObject> expected = new ArrayList<>();
    expected.add(new JSONObject(readStringFromRelativePath("getAllAnnotationsModifiedAfter/annotation1.json")));
    expected.get(0).put("etag", etags.get(0));
    expected.add(new JSONObject(readStringFromRelativePath("getAllAnnotationsModifiedAfter/annotation2.json")));
    expected.get(1).put("etag", etags.get(0));

    assertEquals(expected.size(), actual.size());
    for (int i = 0; i < expected.size(); i++) {
      for (int j = 0; j < actual.size(); j++) {
        if (expected.get(i).getString("id").equals(actual.get(j).getString("id"))) {
          JSONAssert.assertEquals(expected.get(i).toString(), actual.get(j).toString(), true);
        }
      }
    }
  }

  @Test
  void validateAnnotationTest() throws IOException, JSONException, InterruptedException {
    JSONObject newAnnotation1 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation1.json"));
    JSONObject newAnnotation2 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation2.json"));
    JSONObject expectedUnvalidatedAnnotation = new JSONObject(readStringFromRelativePath("addAnnotation/annotation1.json"));

    //Builds body for mock response
    Mockito.when(mockedAnnotation1.body()).thenReturn(newAnnotation1.toString());
    Mockito.when(mockedAnnotation2.body()).thenReturn(newAnnotation2.toString());

    //Mock headers
    List<String> etags = new ArrayList<>();
    etags.add("ktcnefhkbtgdqobilpvs");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags);
    Mockito.when(mockedAnnotation2.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));

    //Define mock response to get requests
    Mockito.when(mockedRequestHelper.postAnnotations("http://sampleannoserver.edu/wap/a04/validated/", newAnnotation1))
        .thenReturn(mockedAnnotation2);

    JSONObject actualAnnotation = annotationStoreAccessService.validateAnnotation(newAnnotation1, "a04/");
    JSONObject expectedAnnotation = newAnnotation2;
    expectedAnnotation.put("via", expectedUnvalidatedAnnotation.getString("id"));
    expectedAnnotation.put("canonical", expectedUnvalidatedAnnotation.getString("id"));
    expectedAnnotation.put("etag", etags.get(0));

    assertEquals(expectedAnnotation.toString(), actualAnnotation.toString());
  }

  @Test
  void updateAnnotation() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject originalAnnotation = new JSONObject(readStringFromRelativePath("addAnnotation/annotation1.json"));
    JSONObject newAnnotation1 = new JSONObject((readStringFromRelativePath("addAnnotation/annotation1.json")));
    
    // changing some values for testing the update
    newAnnotation1.remove("motivation");
    newAnnotation1.put("motivation", "editing");
    newAnnotation1.remove("generator");

    //Builds body for mock response
    Mockito.when(mockedAnnotation1.body()).thenReturn(newAnnotation1.toString());

    //Mock headers
    List<String> etags = new ArrayList<>();
    etags.add("ktcnefhkbtgdqobilpvs");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags);
    Mockito.when(mockedAnnotation1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
    Mockito.when(mockedAnnotation1.statusCode()).thenReturn(200);

    //Define mock response to get requests
    Mockito.when(mockedRequestHelper.put(originalAnnotation.getString("id"), newAnnotation1, etags.get(0)))
        .thenReturn(mockedAnnotation1);

    annotationStoreAccessService.updateAnnotation(originalAnnotation.getString("id"), newAnnotation1, etags.get(0));

    originalAnnotation.put("etag", etags.get(0));
    originalAnnotation.remove("motivation");
    originalAnnotation.put("motivation", "editing");
    originalAnnotation.remove("generator");

    JSONAssert.assertEquals(originalAnnotation.toString(), newAnnotation1.toString(), true);
  }

  @Test
  void deleteAnnotation() throws IOException, JSONException, InterruptedException {
    JSONObject annotation1 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation1.json"));
    JSONObject annotation2 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation2.json"));

    //Builds body for mock response
    Mockito.when(mockedAnnotation1.body()).thenReturn(annotation1.toString());
    Mockito.when(mockedAnnotation2.body()).thenReturn(annotation2.toString());

    //Mock headers
    List<String> etags1 = new ArrayList<>();
    etags1.add("abc");
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("etag", etags1);
    Mockito.when(mockedAnnotation1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));

    List<String> etags2 = new ArrayList<>();
    etags2.add("def");
    Map<String, List<String>> headersPage2 = new HashMap<>();
    headersPage1.put("etag", etags2);
    Mockito.when(mockedAnnotation2.headers())
        .thenReturn(HttpHeaders.of(headersPage2, (a, b) -> true));

      //Define mock response to get requests
    Mockito.when(mockedRequestHelper.get(annotation2.getString("id")))
        .thenReturn(mockedAnnotation2);
    Mockito.when(mockedRequestHelper.get(annotation1.getString("id")))
        .thenReturn(mockedAnnotation1);
    Mockito.when(mockedRequestHelper.delete(annotation2.getString("id"), etags2.get(0)))
        .thenReturn(mockedAnnotation2);
    Mockito.when(mockedRequestHelper.delete(annotation1.getString("id"), etags1.get(0)))
        .thenReturn(mockedAnnotation1);

    Mockito.when(mockedHttpClient.send(Mockito.any(HttpRequest.class),
        ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
        .thenAnswer(invocation -> {
          HttpRequest request = invocation.getArgument(0);

          assertEquals(etags2.get(0), request.headers().map().get("if-match").get(0));
          assertEquals("DELETE", request.method());

          return mockedResponsePage1;
        });

    annotationStoreAccessService.deleteAnnotation(annotation2.getString("id"), etags2.get(0));
  }

  private String readStringFromRelativePath(String relativePath) throws IOException {
    return Files.readString(Path.of("src/test/resources/annotationStoreAccessService/" + relativePath));
  }
}