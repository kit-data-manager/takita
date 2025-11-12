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
public class WapServerSPARQLHealthCheck implements HealthIndicator {

    @Value("${annotationStore.url:#{null}}")
    private String annoContainerURI;

    @Value("${sparqlQuery.urlPrefix:#{null}}")
    private String sparqlQueryUrlPrefix;

    private String sparqlQueryStart = """
            SELECT ?subject ?predicate ?object
            WHERE {
              GRAPH <
            """;

    private String sparqlQueryEnd = """
              >
              {
                ?subject ?predicate ?object
              }
            }
            """;

    private HttpClient httpClient;

    public WapServerSPARQLHealthCheck() {
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        // replacing the port, if wap-server is run at port 80. Otherwise, query will not
        // be completed properly as the wap-server will throw:
        // Bad IRI: <http://localhost:80/wap/> Code: 13/DEFAULT_PORT_SHOULD_BE_OMITTED in PORT: If the port is the default one for the scheme it should be omitted.
        // Bad IRI: <http://localhost:80/wap/> Code: 14/PORT_SHOULD_NOT_BE_WELL_KNOWN in PORT: Ports under 1024 should be accessed using the appropriate scheme name.
        if (annoContainerURI.contains("localhost:80/wap")) {
            annoContainerURI = annoContainerURI.replace("localhost:80/wap", "localhost/wap");
        }
        try {
            HttpRequest request = HttpRequest
                    .newBuilder(URI.create(sparqlQueryUrlPrefix))
                    .header("Content-Type", "application/sparql-query")
                    .header("Accept", "text/csv")
                    .POST(HttpRequest.BodyPublishers.ofString(sparqlQueryStart.strip() + annoContainerURI + sparqlQueryEnd.strip()))
                    .build();
            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            // check if SPARQL endpoint is responding
            if (response.statusCode() == 200) {
                // check if the query returned a result
                if (response.body().contains(annoContainerURI)) {
                    builder = Health
                            .up()
                            .withDetail("Container found", true);
                } else {
                    builder = Health
                            .up()
                            .withDetail("Container found", false);
                }
            } else {
                builder = Health.down().status(String.valueOf(response.statusCode()));
            }
        } catch (IOException | InterruptedException e) {
            builder.status("503");
        }

        return builder.build();
    }
}
