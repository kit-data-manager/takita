package edu.kit.datamanager.takita.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.firewall.StrictHttpFirewall;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Value("${takita.security.success-url}")
    private String successUrl;

    @Value("${takita.security.logout-url}")
    private String logoutUrl;

    @Value("${takita.security.redirect-uri}")
    private String redirectUri;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrationRepository) throws Exception {
        http
                .oauth2Login(oauth2Login -> oauth2Login
                        .successHandler(new SimpleUrlAuthenticationSuccessHandler(successUrl))
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                )
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/unauthenticated", "/oauth2/**", "/login/**").permitAll()
                        .anyRequest().authenticated()
                )
                // disabling csrf protection for now to fix "Invalid CSRF token found"
                .csrf(csrf -> csrf.disable())
                // logout taken from: https://www.baeldung.com/spring-boot-keycloak
                .logout((logout) -> {
                    var logoutSuccessHandler =
                            new OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository);
                    logoutSuccessHandler.setPostLogoutRedirectUri(redirectUri);
                    logout.logoutSuccessHandler(logoutSuccessHandler);
                });

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // overriding firewall to fix "Rejecting request due to: The request was rejected because the URL contained a potentially malicious String "%25""
        // see https://stackoverflow.com/questions/74146917/spring-security-the-request-was-rejected-because-the-url-contained-a-potential
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedPercent(true);
        return (web) -> web.httpFirewall(firewall);
    }
}