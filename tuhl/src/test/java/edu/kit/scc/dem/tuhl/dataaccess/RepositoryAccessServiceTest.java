package edu.kit.scc.dem.tuhl.dataaccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.internal.util.reflection.FieldSetter;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.net.http.HttpHeaders;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.util.*;

@SpringBootTest
class RepositoryAccessServiceTest {
  
  @Mock
  public HttpRequestHelper mockedRequestHelper;
  
  @Mock
  public HttpResponse<String> mockedResponsePage1;
  
  @Mock
  public HttpResponse<String> mockedResponsePage2;
  
  @Mock
  public HttpResponse<String> mockedResponseAssignment;
  
  @Mock
  public HttpResponse<String> mockedManuscript;
  
  @Mock
  public HttpResponse<String> mockedPage;
  
  @Mock
  public HttpResponse<String> mockedXml;
  
  @Autowired
  public IRepositoryAccessService repositoryAccessService;
  
  @BeforeEach
  void init() throws NoSuchFieldException {
    MockitoAnnotations.initMocks(this);
    
    //Insert mock HttpRequestHelper into private field of the RepositoryAccessService instance
    FieldSetter.setField(repositoryAccessService,
        repositoryAccessService.getClass().getDeclaredField("httpRequestHelper"),
        mockedRequestHelper);
  }
  
  @Test
  void getAllManuscriptsTest()
      throws IOException, InterruptedException, JSONException, org.json.JSONException {
    
    prepareGetManuscriptsMock();
    
    //Build expected return object
    List<JSONObject> expected = new ArrayList<>();
    expected.add(new JSONObject(readStringFromRelativePath("getAllManuscripts/expectedObject1.json")));
    expected.add(new JSONObject(readStringFromRelativePath("getAllManuscripts/expectedObject2.json")));
    
    List<JSONObject> actual = repositoryAccessService.getAllManuscripts(-1);
  
    assertEquals(expected.size(), actual.size());
    for (int i = 0; i < expected.size(); i++) {
      JSONAssert.assertEquals(expected.get(i).toString(), actual.get(i).toString(), true);
    }
  }
 
  @Test
  void getPageAssignment()
      throws IOException, InterruptedException, JSONException, org.json.JSONException {
    String expected = readStringFromRelativePath("getPageAssignment/assignment.json");
    
    Mockito.when(mockedResponseAssignment.body()).thenReturn(expected);
  
    Mockito.when(mockedRequestHelper
            .get("http://samplerepo.edu/api/v1/dataresources/000073cd-c425-4214-9648" +
            "-b380ff20c61a/data/pages.json"))
        .thenReturn(mockedResponseAssignment);
    
    JSONArray actual = repositoryAccessService
        .getPageAssignmentForManuscriptId("000073cd-c425-4214-9648-b380ff20c61a");
    
    JSONAssert.assertEquals(expected, actual.toString(), true);
  }
  
  @Test
  void getManuscriptById()
      throws IOException, InterruptedException, JSONException, org.json.JSONException {
    String expected = readStringFromRelativePath("getManuscript/manuscript.json");
    
    Mockito.when(mockedManuscript.body()).thenReturn(expected);
  
    Mockito.when(mockedRequestHelper
        .get("http://samplerepo.edu/api/v1/dataresources/" +
            "000073cd-c425-4214-9648-b380ff20c61a"))
        .thenReturn(mockedManuscript);
  
    JSONObject actual = repositoryAccessService
        .getManuscriptById("000073cd-c425-4214-9648-b380ff20c61a");
  
    JSONAssert.assertEquals(expected, actual.toString(), true);
  }
  
  @Test
  void getPageById()
      throws IOException, InterruptedException, JSONException, org.json.JSONException {
    String expected = readStringFromRelativePath("getPage/page.json");
    
    Mockito.when(mockedPage.body()).thenReturn(expected);
    Mockito.when(mockedRequestHelper
        .get("http://samplerepo.edu/api/v1/dataresources/" +
            "000b458c-67d5-445e-8274-73e8e4582952"))
        .thenReturn(mockedPage);
    
    JSONObject actual = repositoryAccessService
        .getManuscriptById("000b458c-67d5-445e-8274-73e8e4582952");
    
    JSONAssert.assertEquals(expected, actual.toString(), true);
  }
  
  @Test
  void getManuscriptsModifiedAfter()
      throws IOException, InterruptedException, JSONException, org.json.JSONException, ParseException {

    prepareGetManuscriptsMock();
  
    //Build expected return object
    List<JSONObject> expected = new ArrayList<>();
    expected.add(new JSONObject(readStringFromRelativePath("getAllManuscripts/expectedObject2.json")));
  
    List<JSONObject> actual = repositoryAccessService.getManuscriptsModifiedAfter(
        IRepositoryAccessService.TIMESTAMP_FORMAT.parse("2019-03-11T14:13:46Z"));
  
    assertEquals(expected.size(), actual.size());
    for (int i = 0; i < expected.size(); i++) {
      JSONAssert.assertEquals(expected.get(i).toString(), actual.get(i).toString(), true);
    }
  }
  
  @Test
  void getManuscriptXml()
      throws IOException, InterruptedException {
    String expected = readStringFromRelativePath("getManuscriptXml/manuscriptXml.xml");
    
    Mockito.when(mockedXml.body()).thenReturn(expected);
  
    Mockito.when(mockedRequestHelper.get("http://samplerepo.edu/api/v1/dataresources/" +
        "000073cd-c425-4214-9648-b380ff20c61a/data/manuscript_metadata.xml"))
        .thenReturn(mockedXml);
    
    String actual = repositoryAccessService
        .getXmlByManuscriptId("000073cd-c425-4214-9648-b380ff20c61a");
    
    assertEquals(expected, actual);
  }
  
  private void prepareGetManuscriptsMock() throws IOException, InterruptedException {
    //Builds body for first mock response
    Mockito.when(mockedResponsePage1.body())
        .thenReturn(readStringFromRelativePath("getAllManuscripts/responsePage1.json"));
  
    //Builds body for second mock response
    Mockito.when(mockedResponsePage2.body())
        .thenReturn(readStringFromRelativePath("getAllManuscripts/responsePage2.json"));
  
    //Builds headers for first mock response
    List<String> links = new ArrayList<>();
    links.add(readStringFromRelativePath("getAllManuscripts/headerLinks.txt"));
    Map<String, List<String>> headersPage1 = new HashMap<>();
    headersPage1.put("link", links);
    Mockito.when(mockedResponsePage1.headers())
        .thenReturn(HttpHeaders.of(headersPage1, (a, b) -> true));
  
    //Builds headers for second mock response
    List<String> links2 = new ArrayList<>();
    links.add(readStringFromRelativePath("getAllManuscripts/headerLinks2.txt"));
    Map<String, List<String>> headersPage2 = new HashMap<>();
    headersPage1.put("link", links2);
    Mockito.when(mockedResponsePage2.headers())
        .thenReturn(HttpHeaders.of(headersPage2, (a, b) -> true));
  
  
    //Define mock response to get requests
    Mockito.when(mockedRequestHelper
        .get("http://samplerepo.edu/api/v1/dataresources/"))
        .thenReturn(mockedResponsePage1);
    Mockito.when(mockedRequestHelper
        .get("http://samplerepo.edu/api/v1/dataresources/?page=1&size=20"))
        .thenReturn(mockedResponsePage2);
  }
  
  private String readStringFromRelativePath(String relativePath) throws IOException {
    return Files.readString(
        Path.of("src/test/resources/repositoryAccessService/" + relativePath));
  }
}