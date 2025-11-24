package edu.kit.datamanager.takita.actuator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.Authenticator;
import java.net.PasswordAuthentication;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@ConditionalOnProperty(
        value = "exist.baseUrl",
        matchIfMissing = false)
public class ExistDBHealthCheck implements HealthIndicator {

    @Value("${exist.baseUrl:#{null}}")
    private String baseUrl;
    @Value("${exist.restEndpoint:rest/db/}")
    private String restEndpoint;

    private final HttpClient httpClient;

    /**
     * constructor using values from the application.properties. If credentials of an eXist-db user
     * are available use these to build an HttpClient w/ an authenticator; if no credentials are available
     * build an HttpClient w/o an authenticator
     * 
     * @param username of the eXist-db user provided in the application.properties
     * @param password of the eXist-db user provided in the application.properties
     */
    public ExistDBHealthCheck(@Value("${exist.user.name:#{null}}") String username,
                              @Value("${exist.user.password:#{null}}") String password) {
        boolean credentialsGiven = (username != null && !username.isEmpty()) && (password != null && !password.isEmpty());
        if (credentialsGiven) {
            this.httpClient  = HttpClient.newBuilder()
                    .authenticator(new Authenticator() {
                        @Override
                        protected PasswordAuthentication getPasswordAuthentication() {
                            return new PasswordAuthentication(username, password.toCharArray());
                        }
                    })
                    .build();

        } else {
            this.httpClient = HttpClient.newHttpClient();
        }

    }

    /**
     * check whether the REST-endpoint of eXist-db is available and responding
     *
     * @return - "UP", if the REST-endpoint of eXist-db working;
     *         - "DOWN" + StatusCode, if the REST-endpoint of eXist-db didn't return 200;
     *         - StatusCode, if an exception (IO/Interrupted) occurred
     */
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(this.baseUrl + this.restEndpoint))
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
