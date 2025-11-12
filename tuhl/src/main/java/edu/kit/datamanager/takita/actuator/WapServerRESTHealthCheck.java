package edu.kit.datamanager.takita.actuator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
public class WapServerRESTHealthCheck implements HealthIndicator {

    @Value("${annotationStore.url:#{null}}")
    private String annoContainerURI;

    @Value("${sparqlQuery.urlPrefix:#{null}}")
    private String sparqlQueryUrlPrefix;

    private String sparqlQuery = String.format("""
            SELECT ?subject ?predicate ?object
            WHERE {
              GRAPH <%s>
              {
                ?subject ?predicate ?object
              }
            }
            """, annoContainerURI);

    private HttpClient httpClient;

    public WapServerRESTHealthCheck() {
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(annoContainerURI)).build();
            HttpResponse<String> responseREST = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            switch (responseREST.statusCode()) {
                case 200:
                    builder.up();
                    break;
                default:
                    builder = Health.down().status(String.valueOf(responseREST.statusCode()));
            }
        } catch (IOException | InterruptedException e) {
            builder.status("503");
        }

        return builder.build();
    }
}
