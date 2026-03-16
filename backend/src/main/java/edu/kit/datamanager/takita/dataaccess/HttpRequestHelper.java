package edu.kit.datamanager.takita.dataaccess;

import java.io.IOException;
import java.net.Authenticator;
import java.net.PasswordAuthentication;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.apache.http.protocol.HTTP;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONObject;


/**
 * Helper class to send http requests.
 */
public class HttpRequestHelper {
  HttpClient client;

  /**
   * Constructor for the HttpRequestHelper. Creates the HttpClient instance.
   */
  public HttpRequestHelper() {
    client = HttpClient.newHttpClient();
  }

  /**
   * Overloaded constructor for the HttpRequestHelper. Creates the HttpClient instance with basic
   * authentication.
   * @param user user for authentication
   * @param password password for authentication
   */
  public HttpRequestHelper(String user, String password) {
        client = HttpClient.newBuilder()
                .authenticator(new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(user, password.toCharArray());
                    }
                })
                .build();
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

  /**
   * Performs a post request with json request body
   * @param url url to post to
   * @param requestBody request payload as json
   * @return json response payload
   * @throws IOException
   * @throws InterruptedException
   */
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
   * generic function to post a SPARQL query to the database. Performs HTTP post request at the specified url.
   *
   * @param url url of the database/SPARQL endpoint
   * @param query the query to be executed
   * @return result of the query as JSONString
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  public HttpResponse<String> postSPARQLQuery(String url, String query)
      throws IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header(HTTP.CONTENT_TYPE, "application/sparql-query")
            .header("Accept", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(query))
            .build();
    return client.send(request,
            HttpResponse.BodyHandlers.ofString());
  }

  /**
   * Performs a HTTP put request at the specified url.
   *
   * @param url the url path specified as a String
   * @param requestBody jsonObject you want to put
   * @param etag ETAG to match for update operation
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
   * @param etag ETAG to match for delete operation
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