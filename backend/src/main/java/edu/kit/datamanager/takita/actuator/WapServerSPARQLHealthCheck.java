package edu.kit.datamanager.takita.actuator;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
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

    private HttpClient httpClient;

    private final IAnnotationStoreAccessService annotationStoreAccessService;

    public WapServerSPARQLHealthCheck(IAnnotationStoreAccessService annotationStoreAccessService) {
        this.annotationStoreAccessService = annotationStoreAccessService;
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * check whether the wap-server SPARQL-endpoint is available and responding
     *
     * @return - "UP", if wap-server SPARQL-endpoint is working; also contains information on
     *              the presence of the container specified in the application.properties
     *         - "DOWN" + StatusCode, if the endpoint didn't return 200;
     *         - StatusCode, if an exception (IO/Interrupted) occurred
     */
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();

        //This normalization is likely WAP Server specific, therefore we check if we rely on this implementation
        if (annotationStoreAccessService instanceof AnnotationStoreAccessService wapServerAccessService) {
            annoContainerURI = wapServerAccessService.normalizeAnnostoreURI(annoContainerURI);
        }

        try {
            String sparqlQueryContainer = String.format("""
            SELECT ?s ?p ?o
            WHERE {
              GRAPH <%s>
              {
                ?s ?p ?o
              }
            }
            """, annoContainerURI);

            HttpRequest request = HttpRequest
                    .newBuilder(URI.create(sparqlQueryUrlPrefix))
                    .header("Content-Type", "application/sparql-query")
                    .header("Accept", "text/csv")
                    .POST(HttpRequest.BodyPublishers.ofString(sparqlQueryContainer))
                    .build();
            HttpResponse<String> response = httpClient
                    .send(request, HttpResponse.BodyHandlers.ofString());

            // check if SPARQL endpoint is responding
            if (response.statusCode() == 200) {
                // check if the query returned a result
                if (response.body().contains(annoContainerURI)) {
                    builder.up()
                            .withDetail("Container found", true);
                } else {
                    builder.up()
                            .withDetail("Container found", false);
                }
            } else {
                builder.down()
                        .withDetail("Response code from service", String.valueOf(response.statusCode()));
            }
        } catch (IOException | InterruptedException e) {
            builder.status("503");
        }

        return builder.build();
    }
}
