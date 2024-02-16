package edu.kit.scc.dem.tuhl.mainpage.search;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.elasticsearch.client.ClientConfiguration;

import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Some configurations for elasticsearch.
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "edu.kit.scc.dem.tuhl.mainpage.search")
public class ClientConfig extends ElasticsearchConfiguration{
  
  @Value("${elasticsearch.ip}")
  private String elasticsearchIP;
  @Value("${elasticsearch.port}")
  private String elasticsearchPort;

  /**
   * Return an elastic search client.
   *
   * @return ElasticsearchClient
   */
  //@Bean
  //public ElasticsearchClient elasticsearchClient() {
  //  RestClient restClient = RestClient.builder(HttpHost.create(elasticsearchIP)).build();
  //  ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
    
  //  return new ElasticsearchClient(transport);
  //}

  @Override
  public ClientConfiguration clientConfiguration() {
    return ClientConfiguration.builder()
      .connectedTo(elasticsearchIP + ":" + elasticsearchPort)
     .build();
  }
  
  //@Bean
  //@Override
  //public ElasticsearchCustomConversions elasticsearchCustomConversions() {
  //  return new ElasticsearchCustomConversions(
  //    Arrays.asList(new InstantToLong(), new LongToInstant(),
  //            new InstantToInteger(), new IntegerToInstant()));       
  //}

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
