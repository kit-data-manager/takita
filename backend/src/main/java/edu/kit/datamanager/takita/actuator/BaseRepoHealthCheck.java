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

/**
 * Health check for availability of base-repo
 */
@Component
public class BaseRepoHealthCheck implements HealthIndicator {

    @Value("${repository.baseUrl:#{null}}")
    private String baseUrl;
    private String actuatorPath = "actuator/health";

    private final HttpClient httpClient;

    public BaseRepoHealthCheck() {
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * check whether the base-repo is available and responding using the health actuator endpoint
     *
     * @return - "UP", if base-repo is working;
     *         - "DOWN" + StatusCode, if the actuator didn't return 200;
     *         - StatusCode, if an exception (IO/Interrupted) occurred
     */
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(this.baseUrl + this.actuatorPath))
                .build();
        try {
            HttpResponse<String> response = this.httpClient.send(request,
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
