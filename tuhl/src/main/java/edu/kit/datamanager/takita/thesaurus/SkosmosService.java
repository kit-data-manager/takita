package edu.kit.datamanager.takita.thesaurus;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;


@Service("skosmos")
@ConditionalOnProperty(
        value = "thesaurus.baseUrl",
        matchIfMissing = false)
public class SkosmosService  implements IThesaurusService {
    
    @Value("${thesaurus.baseUrl}")
    private String baseUrl;
    
    @Value("${thesaurus.searchPath}")
    private String searchPath;
    
    private String queryUrl;

    private final HttpClient client;


    public SkosmosService() {
        this.queryUrl = baseUrl + searchPath;
        this.client = HttpClient.newHttpClient();
    }
    public SkosmosService(String url) {
        this();
        this.queryUrl = url;
    }
 
    public String getQueryUrl() {
        return this.queryUrl;
    }

    /**
     * Gets a list of concepts which have a label that matches the query term exactly.
     *
     * @param term search query as String
     * @return list of concepts as JSONObject
     * @throws JSONException if the response body could not be parsed to JSON
     * @throws IOException if an error occurs while sending or receiving
     * @throws InterruptedException if the get request is interrupted
     */
    public JSONObject searchExact(String term)
        throws IOException, InterruptedException, JSONException {
            // httpRequestHelper uses java.net.URI.create(), which expects a valid
            // URI as string. As we use user-provided input here, we need to urlencode
            // it.
            String query = "?query=" + URLEncoder.encode(term, StandardCharsets.UTF_8);
            return new JSONObject(httpGet(this.queryUrl + query).body());
    }

    /**
     * Gets a list of concepts matching the query term broadly i.e. without regards
     * to case and surrounding characters.
     *
     * @param term search query as String
     * @return list of concepts as JSONObject
     * @throws JSONException if the response body could not be parsed to JSON
     * @throws IOException if an error occurs while sending or receiving
     * @throws InterruptedException if the get request is interrupted
     */
    public JSONObject searchFuzzy(String term) 
        throws IOException, InterruptedException, JSONException {
            String query = "?query=*" + URLEncoder.encode(term, StandardCharsets.UTF_8) + "*";
            return new JSONObject(httpGet(this.queryUrl + query).body());
    }

    /**
     * Gets a list of concepts matching the query term, using what we consider the
     * standard search method for this thesaurus.
     *
     * @param term search query as String
     * @return list of concepts as JSONObject
     * @throws JSONException if the response body could not be parsed to JSON
     * @throws IOException if an error occurs while sending or receiving
     * @throws InterruptedException if the get request is interrupted
     */
    public JSONObject search(String term) 
        throws IOException, InterruptedException, JSONException {
            return searchFuzzy(term);        
    }

    private HttpResponse<String> httpGet(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}