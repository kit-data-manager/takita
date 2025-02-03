package edu.kit.datamanager.takita.mainpage.search;

import edu.kit.datamanager.takita.model.Manuscript;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

/**
 * Interface necessary for Spring boot implementation of elasticsearch, can hold predefined queries.
 */
@Repository
public interface ManuscriptRepository extends ElasticsearchRepository<Manuscript, String> {
}
