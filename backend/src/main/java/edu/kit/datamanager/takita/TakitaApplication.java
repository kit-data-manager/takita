package edu.kit.datamanager.takita;

import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import java.io.IOException;
import java.util.Arrays;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
public class TakitaApplication implements ApplicationRunner, WebMvcConfigurer {
  private static final Logger logger = LoggerFactory.getLogger(TakitaApplication.class);
  @Autowired
  private ISearchIndexService searchIndexService;

  @Value(("${devIndex.size}"))
  private int devIndexSize;


  /**
   * Entry point of the program. Runs the application.
   *
   * @param args command line arguments
   */
  public static void main(String[] args) {
    SpringApplication.run(TakitaApplication.class, args);
  }

  /**
   * Gets executed when the program runs. Prints the command line arguments and distributes them
   * to the responsible service class.
   *
   * @param args command line arguments
   */
  @Override
  public void run(ApplicationArguments args) {
    String argString = Arrays.toString(args.getSourceArgs());
    logger.info("Application started with command-line arguments: {}", argString);
    logger.info("NonOptionArgs: {}", args.getNonOptionArgs());
    logger.info("OptionNames: {}", args.getOptionNames());
    handleArguments(args);
  }
  
  private void handleArguments(ApplicationArguments args) {
    try {
      if (args.getNonOptionArgs().contains("buildDevIndex")) {
        searchIndexService.buildIndex(devIndexSize);
      }

      if (args.getNonOptionArgs().contains("buildIndex")) {
        searchIndexService.buildIndex(-1);
      }

      if (args.getNonOptionArgs().contains("updateIndex")) {
        searchIndexService.updateIndex();
      }
      
      if (args.getNonOptionArgs().contains("scheduleIndex")) {
        int updateIndexDayInterval = 1;
        int updateIndexHour = 3;
  
        if (args.getOptionNames().contains("dayInterval")) {
          updateIndexDayInterval = Integer.parseInt(args.getOptionValues("dayInterval").get(0));
        }
        if (args.getOptionNames().contains("hour")) {
          updateIndexHour = Integer.parseInt(args.getOptionValues("hour").get(0));
        }
        searchIndexService.startIndexUpdateCycle(updateIndexDayInterval, updateIndexHour);
      }
      
    } catch (InterruptedException e) {
      logger.error(e.getMessage());
      Thread.currentThread().interrupt();
    } catch (IOException | JSONException e) {
      logger.error(e.getMessage());
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
