package edu.kit.scc.dem.tuhl;

import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import java.io.IOException;
import java.util.Arrays;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;


/**
 * Main class. Runs the application and distributes command line arguments.
 */
@SpringBootApplication
@Configuration
public class TuhlApplication implements ApplicationRunner, WebMvcConfigurer {
  private static final Logger logger = LoggerFactory.getLogger(TuhlApplication.class);

  @Autowired
  private ISearchIndexService searchIndexService;

  /**
   * Entry point of the program. Runs the application.
   *
   * @param args command line arguments
   */
  public static void main(String[] args) {
    SpringApplication.run(TuhlApplication.class, args);
  }

  /**
   * Gets executed when the program runs. Prints the command line arguments and distributes them
   * to the responsible service class.
   *
   * @param args command line arguments
   */
  @Override
  public void run(ApplicationArguments args) {
    logger.info("Application started with command-line arguments: {}",
        Arrays.toString(args.getSourceArgs()));
    logger.info("NonOptionArgs: {}", args.getNonOptionArgs());
    logger.info("OptionNames: {}", args.getOptionNames());

    if (args.getNonOptionArgs().contains("updateIndex")) {
      int updateIndexDayInterval = 1;
      int updateIndexHour = 3;

      if (args.getOptionNames().contains("dayInterval")) {
        try {
          updateIndexDayInterval = Integer.parseInt(args.getOptionValues("dayInterval").get(0));
        } catch (NumberFormatException e) {
          logger.error(e.getMessage());
        }

      }
      if (args.getOptionNames().contains("hour")) {
        try {
          updateIndexHour = Integer.parseInt(args.getOptionValues("hour").get(0));
        } catch (NumberFormatException e) {
          logger.error(e.getMessage());
        }
      }
      searchIndexService.startIndexUpdateCycle(updateIndexDayInterval, updateIndexHour);
    }

    if (args.getNonOptionArgs().contains("buildIndex")) {
      try {
        searchIndexService.buildIndex();
      } catch (InterruptedException | IOException | JSONException e) {
        logger.error("Index could not be build: {}", e.getMessage());
        e.printStackTrace();
      }
    }
  }

  /**
   * Returns LocaleResolver for configuring application language.
   *
   * @return LocaleResolver
   */
  @Bean
  public LocaleResolver localeResolver() {
    SessionLocaleResolver slr = new SessionLocaleResolver();
    slr.setDefaultLocale(Locale.ENGLISH);
    return slr;
  }

  /**
   * Returns LocaleChangeInterceptor for configuring application language.
   *
   * @return LocaleChangeInterceptor
   */
  @Bean
  public LocaleChangeInterceptor localeChangeInterceptor() {
    LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
    lci.setParamName("lang");
    return lci;
  }

  /**
   * Returns error properties for configuring error controller.
   *
   * @return ErrorProperties
   */
  @Bean
  public ErrorProperties errorProperties() {
    return new ErrorProperties();
  }

  /**
   * Adds LocaleChangeInterceptors to registry.
   *
   * @param registry InterceptorRegistry
   */
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(localeChangeInterceptor());
  }
}
