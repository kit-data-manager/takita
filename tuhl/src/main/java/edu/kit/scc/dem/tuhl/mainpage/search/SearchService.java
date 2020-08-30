package edu.kit.scc.dem.tuhl.mainpage.search;

import static edu.kit.scc.dem.tuhl.mainpage.search.SearchIndexService.INDEX_NAME;

import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.TextPage;
import java.io.IOException;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.elasticsearch.action.search.SearchAction;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.elasticsearch.common.unit.Fuzziness;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MatchAllQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.sort.SortOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
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
  
  private List<Manuscript> results;
  private long resultPagesCount;
  
  private int pageSize;
  private String searchTerm;
  
  /**
   * Constructor for the SearchService to autowire required instances.
   *
   * @param filterService instance of the business logic for filters. Injected with Springs
   *                      dependency injection system indicated by @autowired annotation.
   * @param elasticsearchRestTemplate instance of the elasticsearch rest template. Injected with
   *                                  Springs dependency injection system indicated by @autowired
   *                                  annotation.
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
   * @param sortField  field to sort the results
   * @param sortAsc    specifies if the sorting direction is ascending
   * @return limited number of search results in list of manuscripts
   */
  @Override
  public List<Manuscript> search(int pageNumber, String sortField, boolean sortAsc) {
    
    //Cannot use lambda because of reflection in test class
    boolean exists = elasticsearchRestTemplate.execute(
        new ElasticsearchRestTemplate.ClientCallback<Boolean>() {
        @Override
        public Boolean doWithClient(RestHighLevelClient client) throws IOException {
          return client.indices().exists(new GetIndexRequest(INDEX_NAME), RequestOptions.DEFAULT);
        }
      });
    if (!exists) {
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
    
    resultPagesCount = calculatePageCount(queryBuilder.build());
    //Perform the search
    return performRequest(queryBuilder.build(), pageNumber, sortField, sortAsc);
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
  
  private List<Manuscript> performRequest(NativeSearchQuery query, int pageStart,
                                          String sortField, boolean sortAsc) {
    SearchResponse response = elasticsearchRestTemplate.execute(client -> client.search(
        new SearchRequestBuilder(null, SearchAction.INSTANCE).setIndices(INDEX_NAME)
            .setQuery(query.getQuery())
            .setFrom((pageStart - 1) * pageSize)
            .setSize(pageSize)
            .addSort(sortField, sortAsc ? SortOrder.ASC : SortOrder.DESC)
            .setFetchSource(null, "pages.annotations")
            .request(),
        RequestOptions.DEFAULT)
    );
    return parseResults(response.getHits());
  }
  
  private List<Manuscript> parseResults(SearchHits hits) {
    List<Manuscript> searchResults = new ArrayList<>();
    for (SearchHit hit : hits.getHits()) {
      Map<String, Object> manuscriptMap = hit.getSourceAsMap();
      Manuscript m = new Manuscript(
          (String) manuscriptMap.get("id"),
          new Date((Long) manuscriptMap.get("created")),
          (String) manuscriptMap.get("title"),
          (String) manuscriptMap.get("publisher"),
          (int) manuscriptMap.get("publicationYear"));
      
      m.setLastModified(new Date((Long) manuscriptMap.get("lastModified")));
      m.setNoPages((int) manuscriptMap.get("noPages"));
      m.setHasAlgorithmAnnotations((boolean) manuscriptMap.get("hasAlgorithmAnnotations"));
      
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> pageMaps = (List<Map<String, Object>>) manuscriptMap.get("pages");
      List<Page> pages = new ArrayList<>();
      for (Map<String, Object> pageMap : pageMaps) {
        Page p;
        String id = (String) pageMap.get("id");
        String thumbResourceUrl = (String) pageMap.get("thumbResourceUrl");
        Date created = new Date((Long) pageMap.get("created"));
        String resourceUrl = (String) pageMap.get("resourceUrl");
        String manuscriptId = (String) pageMap.get("manuscriptId");
        String pageNumber = (String) pageMap.get("pageNumber");
        if (pageMap.get("resourceType").equals("TEXT")) {
          p = new TextPage(id, pageNumber, created, resourceUrl);
          p.setManuscriptId(manuscriptId);
          pages.add(p);
        } else if (pageMap.get("resourceType").equals("IMAGE")) {
          p = new ImagePage(id, pageNumber, created, resourceUrl, thumbResourceUrl);
          p.setManuscriptId(manuscriptId);
          pages.add(p);
        }
      }
      m.setPages(pages);
      searchResults.add(m);
    }
    this.results = searchResults;
    return searchResults;
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
