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

    private HttpClient httpClient;

    public WapServerRESTHealthCheck() {
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * check whether the wap-server REST-endpoint is available and responding
     *
     * @return - "UP", if wap-server REST-endpoint is working;
     *         - "DOWN" + StatusCode, if the endpoint didn't return 200;
     *         - StatusCode, if an exception (IO/Interrupted) occurred
     */
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(annoContainerURI)).build();
            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                builder.up();
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
