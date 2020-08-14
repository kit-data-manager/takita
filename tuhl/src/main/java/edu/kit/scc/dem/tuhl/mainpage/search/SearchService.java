package edu.kit.scc.dem.tuhl.mainpage.search;

import static edu.kit.scc.dem.tuhl.mainpage.search.SearchIndexService.INDEX_NAME;

import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import java.util.ArrayList;
import java.util.List;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.indices.GetFieldMappingsRequest;
import org.elasticsearch.client.indices.GetFieldMappingsResponse;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.elasticsearch.index.query.MatchAllQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;


/**
 * SearchService contains all business logic to search the index provided by Spring.Data.
 */
@SessionScope
@Service
public class SearchService implements ISearchService {
  
  private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
  private final IFilterService filterService;
  private final ElasticsearchRestTemplate elasticsearchRestTemplate;
  private static final String KEYWORD_SUFFIX = ".keyword";
  
  private List<Manuscript> results;
  private long resultPagesCount;
  
  private int pageSize;
  private String searchTerm;
  
  /**
   * Constructor for the SearchService to autowire required instances.
   * 
   * @param filterService instance of the business logic for filters. Injected with Springs
   *                      dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public SearchService(IFilterService filterService,
                       ElasticsearchRestTemplate elasticsearchRestTemplate) {
    this.filterService = filterService;
    this.elasticsearchRestTemplate = elasticsearchRestTemplate;
    pageSize = 10;
  }
  
  /**
   * Searches the index and returns a certain number of results specified in pageSize.
   *
   * @param pageNumber page of search results
   * @param sortField field to sort the results
   * @param sortAsc specifies if the sorting direction is ascending
   * @return limited number of search results in list of manuscripts
   */
  @Override
  public List<Manuscript> search(int pageNumber, String sortField, boolean sortAsc) {
    if (!elasticsearchRestTemplate.execute(client ->
        client.indices().exists(new GetIndexRequest(INDEX_NAME), RequestOptions.DEFAULT))) {
      logger.error("The index does not exist. Please try to build it first.");
    }
    
    //Check if the ".keyword" suffix is needed. This is the case when the sortField has a
    // keyboard field.
    String suffix = elasticsearchRestTemplate.execute(client -> {
      GetFieldMappingsResponse response =
          client.indices().getFieldMapping(new GetFieldMappingsRequest()
          .indices(INDEX_NAME)
          .fields(sortField + KEYWORD_SUFFIX), RequestOptions.DEFAULT);
      
      boolean hasKeyword = response.mappings().get(INDEX_NAME)
          .containsKey(sortField + KEYWORD_SUFFIX);
      return hasKeyword ? KEYWORD_SUFFIX : "";
    });
    
    //Create the query builder
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    
    //Check if a search term is specified
    QueryBuilder searchTermQueryBuilder;
    if (searchTerm != null && !searchTerm.trim().equals("")) {
      //Add the search term as a query that matches against all fields
      searchTermQueryBuilder = new QueryStringQueryBuilder(searchTerm);
    } else {
      searchTermQueryBuilder = new MatchAllQueryBuilder();
    }
    queryBuilder = queryBuilder.withQuery(searchTermQueryBuilder);
    
    //Add the query of each filter to the query builder
    for (Filter f : filterService.getCurrentFilters()) {
      if (f.getQuery() != null) {
        queryBuilder = queryBuilder.withQuery(f.getQuery().getQuery());
      }
    }
    
    resultPagesCount = calculatePageCount(queryBuilder.build());
    
    //Configure the query page after calculating the number of total results
    queryBuilder = queryBuilder.withPageable(PageRequest.of(pageNumber - 1, pageSize, Sort.by(
        sortAsc ? Sort.Direction.ASC : Sort.Direction.DESC,
        sortField + suffix)));
    //Perform the search
    results = searchWithQuery(queryBuilder.build());
    return results;
  }
  
  private long calculatePageCount(Query query) {
    //Making sure integer division is ceiled
    long count = elasticsearchRestTemplate.count(query, IndexCoordinates.of(INDEX_NAME));
    return (count + pageSize - 1) / pageSize;
  }
  
  /**
   * Gets the number of pages needed to contain all results.
   *
   * @return the number of pages
   */
  @Override
  public long getResultPagesCount() {
    return resultPagesCount;
  }
  
  private List<Manuscript> searchWithQuery(NativeSearchQuery query) {
    SearchHits<Manuscript> searchHits = elasticsearchRestTemplate.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    
    List<Manuscript> results = new ArrayList<>();
    //Add the manuscript of each search hit to a list
    for (SearchHit<Manuscript> hit : searchHits) {
      results.add(hit.getContent());
    }
    return results;
  }
  
  /**
   * Set the search term.
   *
   * @param searchTerm the search term to set
   */
  @Override
  public void setSearchTerm(String searchTerm) {
    this.searchTerm = searchTerm;
  }
  
  /**
   * Gets list of search results.
   *
   * @return search results in list of manuscripts
   */
  @Override
  public List<Manuscript> getResults() {
    return results;
  }
  
  /**
   * Gets the size of a page shown to user.
   *
   * @return page size as int
   */
  @Override
  public int getPageSize() {
    return pageSize;
  }
  
  /**
   * Sets the size of a page shown to user.
   *
   * @param pageSize page size as int
   */
  @Override
  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  /**
   * Updates the number of pages and search term in the model to pass to UI.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
      model.addAttribute("numberOfPages", checkForEmptyResults());
      model.addAttribute("searchterm", searchTerm);
      model.addAttribute("noResults", pageSize);
    }

    private long checkForEmptyResults(){
      if (getResultPagesCount() < 1){
        return 1;
      }
      return getResultPagesCount();
    }
}
