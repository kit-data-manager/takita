package edu.kit.scc.dem.tuhl.dataaccess;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.apache.http.protocol.HTTP;
import org.springframework.boot.configurationprocessor.json.JSONObject;


/**
 * Helper class to send http requests.
 */
class HttpRequestHelper {
  HttpClient client;

  /**
   * Constructor for the HttpRequestHelper. Creates the HttpClient instance.
   */
  public HttpRequestHelper() {
    client = HttpClient.newHttpClient();
  }

  /**
   * Performs a HTTP get request at the specified url.
   *
   * @param url the url path specified as a String
   * @return the HttpResponse
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  public HttpResponse<String> get(String url) throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .build();

    return client.send(request,
          HttpResponse.BodyHandlers.ofString());
  }

  public HttpResponse<String> postManuscript(String url, JSONObject requestBody)
      throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .header(HTTP.CONTENT_TYPE, "application/json")
        // JSON automatically escapes slashes, this removes that
        .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString().replace("\\/", "/")))
        .build();

    return client.send(request,
        HttpResponse.BodyHandlers.ofString());
  }

  /**
   * Performs a HTTP post request at the specified url.
   *
   * @param url the url path specified as a String
   * @param requestBody jsonObject you want to post
   * @return the HttpResponse
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  public HttpResponse<String> postAnnotations(String url, JSONObject requestBody)
      throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .header(HTTP.CONTENT_TYPE, "application/ld+json;profile=\"http://www.w3.org/ns/anno.jsonld\"")
        // JSON automatically escapes slashes, this removes that
        .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString().replace("\\/", "/")))
        .build();

    return client.send(request,
        HttpResponse.BodyHandlers.ofString());
  }

  /**
   * Performs a HTTP put request at the specified url.
   *
   * @param url the url path specified as a String
   * @param requestBody jsonObject you want to put
   * @return the HttpResponse
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  public HttpResponse<String> put(String url, JSONObject requestBody, String etag)
      throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .header(HTTP.CONTENT_TYPE, "application/ld+json;profile=\"http://www.w3.org/ns/anno.jsonld\"")
        // JSON automatically escapes slashes, this removes that
        .PUT(HttpRequest.BodyPublishers.ofString(requestBody.toString().replace("\\/", "/")))
        .header("if-match", etag)
        .build();

    return client.send(request,
        HttpResponse.BodyHandlers.ofString());
  }

  /**
   * Performs a HTTP delete request at the specified url.
   *
   * @param url the url path specified as a String
   * @return the HttpResponse
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  public HttpResponse<String> delete(String url, String etag)
      throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .DELETE()
        .header("if-match", etag)
        .build();

    return client.send(request,
        HttpResponse.BodyHandlers.ofString());
  }
}