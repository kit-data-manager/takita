package edu.kit.scc.dem.tuhl.dataaccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.mockito.internal.util.reflection.FieldSetter;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

class HttpRequestHelperTest {
  
  @Mock
  HttpClient mockedHttpClient;
  
  @Mock
  HttpResponse<String> response;
  
  HttpRequestHelper httpRequestHelper;
  
  
  @BeforeEach
  void init() throws NoSuchFieldException {
    MockitoAnnotations.initMocks(this);
    httpRequestHelper = new HttpRequestHelper();
    
    //Insert mock HttpRequestHelper into private field of the RepositoryAccessService instance
    FieldSetter.setField(httpRequestHelper,
        httpRequestHelper.getClass().getDeclaredField("client"),
        mockedHttpClient);
  }
  
  @Test
  void get() throws IOException, InterruptedException, URISyntaxException {
    String uriString = "http://www.samplerepo.edu";
    URI uri = new URI(uriString);
    
    Mockito.when(mockedHttpClient.send(Mockito.any(HttpRequest.class),
        ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
        .thenAnswer(invocation -> {
          HttpRequest request = invocation.getArgument(0);
          assertEquals(uri, request.uri());
          assertEquals("GET", request.method());
          
          return response;
        });
    
    assertEquals(response, httpRequestHelper.get(uriString));
  }
  
  @Test
  void post() throws URISyntaxException, IOException, InterruptedException, JSONException {
    String uriString = "http://www.samplerepo.edu";
    URI uri = new URI(uriString);
    JSONObject requestBody = new JSONObject("{\"test\": \"postRequest\"}");
  
    Mockito.when(mockedHttpClient.send(Mockito.any(HttpRequest.class),
        ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
        .thenAnswer(invocation -> {
          HttpRequest request = invocation.getArgument(0);
          assertTrue(request.bodyPublisher().isPresent());
          assertEquals(requestBody.toString().length(), request.bodyPublisher().get().contentLength());
          assertEquals(uri, request.uri());
          assertEquals("POST", request.method());
          
          return response;
        });
  
    assertEquals(response, httpRequestHelper.postAnnotations(uriString, requestBody));
  }
  
  @Test
  void put() throws URISyntaxException, IOException, InterruptedException, JSONException {
    String uriString = "http://www.samplerepo.edu";
    URI uri = new URI(uriString);
    JSONObject requestBody = new JSONObject("{\"test\": \"putRequest\"}");
  
    Mockito.when(mockedHttpClient.send(Mockito.any(HttpRequest.class),
        ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
        .thenAnswer(invocation -> {
          HttpRequest request = invocation.getArgument(0);
        
          assertTrue(request.bodyPublisher().isPresent());
          assertEquals(requestBody.toString().length(), request.bodyPublisher().get().contentLength());
          assertEquals(uri, request.uri());
          assertEquals("PUT", request.method());
        
          return response;
        });
  
    assertEquals(response, httpRequestHelper.put(uriString, requestBody));
  }
  
  @Test
  void delete() throws URISyntaxException, IOException, InterruptedException {
    String uriString = "http://www.samplerepo.edu";
    URI uri = new URI(uriString);
    String etag = new String("abc");
  
    Mockito.when(mockedHttpClient.send(Mockito.any(HttpRequest.class),
        ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
        .thenAnswer(invocation -> {
          HttpRequest request = invocation.getArgument(0);

          assertEquals(etag, request.headers().map().get("if-match").get(0));
          assertEquals(uri, request.uri());
          assertEquals("DELETE", request.method());
        
          return response;
        });
  
    assertEquals(response, httpRequestHelper.delete(uriString, "abc"));
  }
}