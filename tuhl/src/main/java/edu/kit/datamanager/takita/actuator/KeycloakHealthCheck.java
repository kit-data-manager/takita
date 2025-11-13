package edu.kit.datamanager.takita.actuator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@ConditionalOnProperty(
        value = "takita.security.enabled",
        havingValue = "true",
        matchIfMissing = false)
public class KeycloakHealthCheck implements HealthIndicator {

    @Value("${spring.security.oauth2.client.provider.external.issuer-uri}")
    private String keycloakRealmURL;

    private HttpClient client;

    public KeycloakHealthCheck() {this.client= HttpClient.newHttpClient();}

    /**
     * check whether the Keycloak realm is available and responding
     *
     * @return - "UP", if the realm is available and responding;
     *         - "DOWN" + StatusCode, if the realm didn't return 200;
     *         - StatusCode, if an exception (IO/Interrupted) occurred
     */
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(keycloakRealmURL))
                .build();
        try {
            HttpResponse<String> response = this.client.send(request, HttpResponse.BodyHandlers.ofString());

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
