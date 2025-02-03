package edu.kit.datamanager.takita.mainpage.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import edu.kit.datamanager.takita.model.Manuscript;

/**
 * Interface necessary for Spring boot implementation of elasticsearch, can hold predefined queries.
 */
@Repository
public interface ManuscriptRepository extends ElasticsearchRepository<Manuscript, String> {
}
