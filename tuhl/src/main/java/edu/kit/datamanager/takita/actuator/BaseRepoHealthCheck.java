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
public class BaseRepoHealthCheck implements HealthIndicator {

    @Value("${repository.baseUrl:#{null}}")
    private String baseUrl;
    private String actuatorPath = "actuator/health";

    private final HttpClient httpClient;

    public BaseRepoHealthCheck() {
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public Health health() {
        Health.Builder builder;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(this.baseUrl + this.actuatorPath))
                .build();
        try {
            HttpResponse<String> response = this.httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                builder = Health.up();
            } else {
                builder = Health.down().status(String.valueOf(response.statusCode()));
            }
        } catch (IOException | InterruptedException e) {
            builder = Health.status("503");
        }
        return builder.build();
    }
}
