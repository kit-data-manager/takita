package edu.kit.datamanager.takita.configuration;

import edu.kit.datamanager.security.filter.KeycloakTokenFilter;
import edu.kit.datamanager.security.filter.NoAuthenticationFilter;
import edu.kit.datamanager.security.filter.PublicAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.firewall.DefaultHttpFirewall;
import org.springframework.security.web.firewall.HttpFirewall;

import java.util.Optional;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(WebSecurityConfig.class);

    @Value("${repo.auth.jwtSecret:#{null}}")
    private String jwtSecret;

    @Value("${repo.auth.enabled:FALSE}")
    private boolean isAuthEnabled;

    @Autowired
    private Optional<KeycloakTokenFilter> keycloaktokenFilterBean;


    public WebSecurityConfig() {
        // Not used
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        HttpSecurity httpSecurity = http.
                authorizeHttpRequests(
                    authorize -> {
//                        authorize.requestMatchers("/").permitAll();
                        authorize.anyRequest().authenticated();
                    }).
                oauth2Login(Customizer.withDefaults());
//                sessionManagement(
//                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        httpSecurity = httpSecurity.csrf(csrf -> csrf.disable());
        if (keycloaktokenFilterBean.isPresent()) {
            logger.info("Add keycloak filter!");
            httpSecurity.addFilterAfter(keycloaktokenFilterBean.get(), BasicAuthenticationFilter.class);
            httpSecurity = httpSecurity.addFilterAfter(new PublicAuthenticationFilter(jwtSecret), BasicAuthenticationFilter.class);
       }
        if (!isAuthEnabled) {
            logger.info("Authentication is DISABLED. Adding 'NoAuthenticationFilter' to authentication chain.");
            AuthenticationManager defaultAuthenticationManager = http.getSharedObject(AuthenticationManager.class);
            httpSecurity = httpSecurity.addFilterAfter(new NoAuthenticationFilter(jwtSecret, defaultAuthenticationManager), BasicAuthenticationFilter.class);
        } else {
            logger.info("Authentication is ENABLED.");
        }

        httpSecurity.headers(headers -> headers.cacheControl(cache -> cache.disable()));
        return httpSecurity.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.httpFirewall(allowUrlEncodedSlashHttpFirewall());
    }

    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        DefaultHttpFirewall firewall = new DefaultHttpFirewall();
        firewall.setAllowUrlEncodedSlash(true);
        return firewall;
    }

//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowCredentials(true);
//        config.addAllowedOriginPattern(applicationProperties.getAllowedOriginPattern());
//        config.setAllowedHeaders(Arrays.asList(applicationProperties.getAllowedHeaders()));
//        config.setAllowedMethods(Arrays.asList(applicationProperties.getAllowedMethods()));
//        config.setExposedHeaders(Arrays.asList(applicationProperties.getExposedHeaders()));
//
//        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//
//        source.registerCorsConfiguration("/**", config);
//        return source;
//    }
}
