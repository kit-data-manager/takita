package edu.kit.scc.dem.tuhl.mainpage.search;

import java.time.Instant;
import java.util.Arrays;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.RestClients;
import org.springframework.data.elasticsearch.config.AbstractElasticsearchConfiguration;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchCustomConversions;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Some configurations for elasticsearch.
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "edu.kit.scc.dem.tuhl.mainpage.search")
public class ElasticSearchConfiguration extends AbstractElasticsearchConfiguration {
  
  @Value("${elasticsearch.ip}")
  private String elasticsearchIP;
  @Value("${elasticsearch.port}")
  private String elasticsearchPort;

  /**
   * Returns an elastic search template with a configured client.
   *
   * @return ElasticsearchRestTemplate
   */
  @Bean
  public ElasticsearchRestTemplate elasticsearchTemplate() {
    return new ElasticsearchRestTemplate(elasticsearchClient());
  }

  /**
   * Return an elastic search client.
   *
   * @return RestHighLevelClient
   */
  @Bean
  public RestHighLevelClient elasticsearchClient() {
    final ClientConfiguration clientConfiguration = ClientConfiguration.builder()
        .connectedTo(elasticsearchIP + ":" + elasticsearchPort)
        .withConnectTimeout(100000)
        .withSocketTimeout(100000)
        .build();
    
    return RestClients.create(clientConfiguration).rest();
  }
  
  @Bean
  @Override
  public ElasticsearchCustomConversions elasticsearchCustomConversions() {
    return new ElasticsearchCustomConversions(
      Arrays.asList(new InstantToLong(), new LongToInstant(),
              new InstantToInteger(), new IntegerToInstant()));       
  }

  @WritingConverter                                                 
  static class InstantToLong implements Converter<Instant, Long> {

    @Override
    public Long convert(Instant time) {

      return time.getEpochSecond();
    }
  }

  @ReadingConverter                                                 
  static class LongToInstant implements Converter<Long, Instant> {

    @Override
    public Instant convert(Long time) {
      
      return Instant.ofEpochSecond(time);
    }
  }
  
  @WritingConverter                                                 
  static class InstantToInteger implements Converter<Instant, Integer> {

    @Override
    public Integer convert(Instant time) {

      return Math.toIntExact(time.getEpochSecond());
    }
  }

  @ReadingConverter                                                 
  static class IntegerToInstant implements Converter<Integer, Instant> {

    @Override
    public Instant convert(Integer time) {
      
      return Instant.ofEpochSecond(time);
    }
  }
  
}
