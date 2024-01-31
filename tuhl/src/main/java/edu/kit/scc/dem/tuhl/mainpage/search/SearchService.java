package edu.kit.scc.dem.tuhl.mainpage.search;

import static edu.kit.scc.dem.tuhl.mainpage.search.SearchIndexService.INDEX_NAME;

import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import java.util.ArrayList;
import java.util.List;
import org.elasticsearch.common.unit.Fuzziness;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MatchAllQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
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
  private final ElasticsearchOperations elasticsearchOperations;
  
  private List<Manuscript> results;
  private long resultPagesCount;
  
  private int pageSize;
  private String searchTerm;
  
  /**
   * Constructor for the SearchService to autowire required instances.
   *
   * @param filterService instance of the business logic for filters. Injected with Springs
   *                      dependency injection system indicated by @autowired annotation.
   * @param elasticsearchOperations instance of the elasticsearch operations. Injected with
   *                                  Springs dependency injection system indicated by @autowired
   *                                  annotation.
   */
  @Autowired
  public SearchService(IFilterService filterService,
                       ElasticsearchOperations elasticsearchOperations) {
    this.filterService = filterService;
    this.elasticsearchOperations = elasticsearchOperations;
    pageSize = 10;
  }
  
  /**
   * Searches the index and returns a certain number of results specified in pageSize.
   *
   * @param pageNumber page of search results
   * @param sortField  field to sort the results
   * @param sortAsc    specifies if the sorting direction is ascending
   * @return limited number of search results in list of manuscripts
   */
  @Override
  public List<Manuscript> search(int pageNumber, String sortField, boolean sortAsc) {
    IndexOperations indexOp = elasticsearchOperations.indexOps(Manuscript.class);
    
    if (!indexOp.exists()) {
      logger.error("The index does not exist. Please try to build it first.");
    }
    
    //Create the query builder
    final NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    
    //Check if a search term is specified
    QueryBuilder searchTermQueryBuilder;
    if (searchTerm != null && !searchTerm.trim().equals("")) {
      String escapedTerm = searchTerm.replace(":", "\\:");
      
      //Add the search term as a query that matches against all fields
      QueryStringQueryBuilder queryStringQueryBuilder =
          QueryBuilders.queryStringQuery(
              String.format("(%s) OR (*%s*) OR (%s)", escapedTerm, escapedTerm, escapedTerm))
              .defaultOperator(Operator.AND)
              .fuzziness(Fuzziness.ZERO)
              .field("title")
              .field("publisher")
              .field("pages.pageNumber")
              .field("pages.resourceType")
              .field("pages.annotations.title")
              .field("pages.annotations.creators", .3f)
              .field("pages.annotations.color")
              .field("pages.annotations.tags.creators", .3f)
              .field("pages.annotations.tags.purpose")
              .field("pages.annotations.tags.value")
              .field("pages.annotations.textCards.creators", .3f)
              .field("pages.annotations.textCards.title")
              .field("pages.annotations.textCards.purpose")
              .field("pages.annotations.textCards.value");
      
      if (searchTerm.matches("^[0-9]*$")) {
        queryStringQueryBuilder.field("publicationYear");
      }
      searchTermQueryBuilder = queryStringQueryBuilder;
    } else {
      searchTermQueryBuilder = new MatchAllQueryBuilder();
    }
    BoolQueryBuilder boolQuery = new BoolQueryBuilder();
    boolQuery.must(searchTermQueryBuilder);
    //Add the query of each filter to the query builder
    for (Filter f : filterService.getCurrentFilters()) {
      if (f.getQuery() != null) {
        boolQuery.must(f.getQuery().getQuery());
      }
    }
    queryBuilder.withQuery(boolQuery);

    if (sortAsc) {
      queryBuilder.withSort(Sort.by(Sort.Direction.ASC, sortField));
    } else {
      queryBuilder.withSort(Sort.by(Sort.Direction.DESC, sortField));
    }

    NativeSearchQuery query = queryBuilder.build();
    // pageable result objects starts counting at 0, tabular view at 1
    PageRequest page = PageRequest.of(pageNumber-1, pageSize);
    query.setPageable(page);
    
    resultPagesCount = calculatePageCount(queryBuilder.build());
    //Perform the search
    SearchHits<Manuscript> searchHits = elasticsearchOperations.search(query, Manuscript.class);
    List<Manuscript> searchResults = new ArrayList<>();

    for (SearchHit<Manuscript> hit : searchHits.getSearchHits()) {
      searchResults.add(hit.getContent());
    }

    this.results = searchResults;
    return searchResults;
  }
  
  private long calculatePageCount(Query query) {
    //Making sure integer division is ceiled
    long count = elasticsearchOperations.count(query, IndexCoordinates.of(INDEX_NAME));
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
  
  /**
   * Sets the search term.
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
  
  private long checkForEmptyResults() {
    if (getResultPagesCount() < 1) {
      return 1;
    }
    return getResultPagesCount();
  }
}
