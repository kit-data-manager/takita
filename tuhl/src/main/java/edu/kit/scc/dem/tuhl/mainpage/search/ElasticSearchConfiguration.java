package edu.kit.scc.dem.tuhl.mainpage.search;

import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.RestClients;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Some configurations for elasticsearch.
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "edu.kit.scc.dem.tuhl.mainpage.search")
public class ElasticSearchConfiguration {
  
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
        .withConnectTimeout(10000)
        .withSocketTimeout(10000)
        .build();
    
    return RestClients.create(clientConfiguration).rest();
  }
}
