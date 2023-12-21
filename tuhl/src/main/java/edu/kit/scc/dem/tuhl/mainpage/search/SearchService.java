package edu.kit.scc.dem.tuhl.mainpage.search;

import static edu.kit.scc.dem.tuhl.mainpage.search.SearchIndexService.INDEX_NAME;

import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.TextPage;
import edu.kit.scc.dem.tuhl.model.target.ISelector;
import edu.kit.scc.dem.tuhl.model.target.SVGSelector;
import edu.kit.scc.dem.tuhl.model.target.Target;
import edu.kit.scc.dem.tuhl.model.target.XPathSelector;

import java.io.IOException;
import java.sql.Date;
import java.time.Instant;
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
  private List<Annotation> annoResults;
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
  
  /**
   * Searches the index and returns a certain number of results specified in pageSize.
   *
   * @param pageNumber page of search results
   * @param sortField  field to sort the results
   * @param sortAsc    specifies if the sorting direction is ascending
   * @return limited number of search results in list of manuscripts
   */
  @Override
  public List<Annotation> searchAnno(int pageNumber, String sortField, boolean sortAsc) {
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
    return performAnnoRequest(queryBuilder.build(), pageNumber, sortField, sortAsc);
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
  
  private List<Annotation> performAnnoRequest(NativeSearchQuery query, int pageStart,
          String sortField, boolean sortAsc) {
	SearchResponse response = elasticsearchRestTemplate.execute(client -> client.search(
		new SearchRequestBuilder(null, SearchAction.INSTANCE).setIndices(INDEX_NAME)
			.setQuery(query.getQuery())
			.setFrom((pageStart - 1) * pageSize)
			.setSize(pageSize)
			.addSort(sortField, sortAsc ? SortOrder.ASC : SortOrder.DESC)
			//.setFetchSource(null, "pages.annotations")
			.request(),
		RequestOptions.DEFAULT)
	);
	return parseAnnoResults(response.getHits());
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
  
  
  @SuppressWarnings("unchecked")
private List<Annotation> parseAnnoResults(SearchHits hits) {
	    List<Annotation> searchAnnoResults = new ArrayList<>();
	    for (SearchHit hit : hits.getHits()) {
	      Map<String, Object> manuscriptMap = hit.getSourceAsMap();
	      String manuscriptTitle = (String) manuscriptMap.get("title");
	      
	      @SuppressWarnings("unchecked")
	      List<Map<String, Object>> pageMaps = (List<Map<String, Object>>) manuscriptMap.get("pages");
	      List<Page> pages = new ArrayList<>();
	      for (Map<String, Object> pageMap : pageMaps) {
	    	  
	        // getting the annotations
	        List<Map<String, Object>> annotationMaps = (List<Map<String, Object>>) pageMap.get("annotations");
	        if (!annotationMaps.isEmpty()) {
	        	for (Map<String, Object> annotationMap : annotationMaps) {
		        	Annotation annotation = new Annotation();
		        	annotation.setId((String) annotationMap.get("id"));
		        	annotation.setPageId((String) annotationMap.get("pageId"));
		        	annotation.setManuscriptTitle(manuscriptTitle);
		    		// TODO: revisit this on 01.01.2038 as the maximum value of an integer
		    		// is "2147483647", which will turn to "Tuesday, 19. January 2038 03:14:07",
		        	// but atm annotationMap.get("modified") returns an integer, so no other
		        	// datatype can be used
		    		annotation.setModified(Instant.ofEpochSecond((long) ((int) annotationMap.get("modified"))));
		        	annotation.setCreated(Instant.ofEpochSecond((long) ((int) annotationMap.get("created"))));
		        	
		        	annotation.setCreators((List<String>) annotationMap.get("creators"));
		        	        	
		        	// creating the targets
			        List<Map<String, Object>> targetMaps = (List<Map<String, Object>>) annotationMap.get("targets");
			        for (Map<String, Object> targetMap : targetMaps) {
			        	Target target = new Target();
			        	target.setLinkToResource((String)targetMap.get("linkToResource"));
			        	target.setType((String)targetMap.get("type"));
			        	
			        	// create the selector
			        	Map<String, Object> selectorMap = (Map<String, Object>) targetMap.get("selector");
			        	String selectorType = (String) selectorMap.get("_class");
			        	ISelector selector = null;
			        	if (selectorType.contains("XPath")) {
			        		selector = new XPathSelector((String) selectorMap.get("xPath"));
			        	}
			        	if (selectorType.contains("SVG")) {
			        		selector = new SVGSelector((String) selectorMap.get("svgCode"));
			        	}
			        	target.setSelector(selector);
			        	annotation.addTarget(target);
			        }

			        // creating the tags
			        List<Map<String, Object>> tagMaps = (List<Map<String, Object>>) annotationMap.get("tags");
			        for (Map<String, Object> tagMap : tagMaps) {
			        	if(!tagMap.isEmpty()) {
			        		Tag tag = new Tag(tagMap.get("id").toString());
			        		tag.setValue(tagMap.get("value").toString());
				        	annotation.addTag(tag);
			        	}
			        	
			        }
			        
			        // creating the textcards
			        List<Map<String, Object>> textCardMaps = (List<Map<String, Object>>) annotationMap.get("textCards");
			        for (Map<String, Object> textCardMap : textCardMaps) {
			        	if(!textCardMap.isEmpty()) {
			        		TextCard textcard = new TextCard(textCardMap.get("id").toString());
			        		if (textCardMap.get("value") != null) {
			        			textcard.setValue(textCardMap.get("value").toString());
			        		}
				        	if (textCardMap.get("source") != null) {
				        		textcard.setSource(textCardMap.get("source").toString());
				        	}
				        	textcard.setPurpose(textCardMap.get("purpose").toString());
				        	// TODO: fix time creation
				        	//textcard.setCreated(new Instant((Long) textCardMap.get("created"), pageSize));
				        	annotation.addTextCard(textcard);
			        	}
			        }
			        searchAnnoResults.add(annotation);
		        }
	        }
	      }
	    }
	    this.annoResults = searchAnnoResults;
	    return searchAnnoResults;
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
   * Gets list of search results.
   *
   * @return search results in list of manuscripts
   */
  @Override
  public List<Annotation> getAnnoResults() {
    return annoResults;
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
