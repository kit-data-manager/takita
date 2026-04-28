package edu.kit.datamanager.takita.mainpage.search;

import static edu.kit.datamanager.takita.mainpage.search.SearchIndexService.INDEX_NAME;

import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.filter.Filter;
import edu.kit.datamanager.takita.model.page.Page;
import java.util.ArrayList;
import java.util.List;
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
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
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
  private List<Annotation> annoResults;
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
    
    Criteria criteria;
    
    //Check if a search term is specified
    if (searchTerm != null && !searchTerm.trim().equals("")) {
      String escapedTerm = searchTerm.replace(":", "\\:");
      criteria = Criteria.and();
      Criteria subCriteria;

      //Check if search term consists of multiple terms and create one criteria for earch
      for (String singleSearchTerm : escapedTerm.split(" ")) {
        if (singleSearchTerm.isBlank()) continue;

        logger.info("Searching for " + singleSearchTerm);
        subCriteria = new Criteria("title").contains(singleSearchTerm)
                            .or("publisher").contains(singleSearchTerm)
                            .or("pages.pageNumber").contains(singleSearchTerm)
                            .or("pages.resourceType").contains(singleSearchTerm)
                            .or("pages.annotations.title").contains(singleSearchTerm)
                            .or("pages.annotations.creators").contains(singleSearchTerm)
                            .or("pages.annotations.tags.creators").contains(singleSearchTerm)
                            .or("pages.annotations.tags.purpose").contains(singleSearchTerm)
                            .or("pages.annotations.tags.value").contains(singleSearchTerm)
                            .or("pages.annotations.textCards.creators").contains(singleSearchTerm)
                            .or("pages.annotations.textCards.title").contains(singleSearchTerm)
                            .or("pages.annotations.textCards.purpose").contains(singleSearchTerm)
                            .or("pages.annotations.textCards.value").contains(singleSearchTerm);
      
      if (singleSearchTerm.matches("^[0-9]+$")) {
        try {
          //we convert to integer because it will fit a year for sure
          // and it will not lead to an overflow of the publicationYear field if its mapping is either int or long
          int numericTerm = Integer.parseInt(singleSearchTerm);
          subCriteria = subCriteria.or(
                  new Criteria("publicationYear").is(numericTerm)
          );
        } catch (NumberFormatException ex) {
            logger.warn("Could not parse numeric term: {}", singleSearchTerm);
        }
      }

      criteria = criteria.subCriteria(subCriteria);
      }
    } else {
      //Generic criteria constructor to obtain all search results
      criteria = new Criteria();
    }

    //Add the query of each filter to the query builder
    for (Filter f : filterService.getCurrentFilters()) {
      if (f.getCriteria() != null) {
        criteria = criteria.and(f.getCriteria());
      }
    }

    CriteriaQuery query = new CriteriaQuery(criteria);
    // pageable result objects starts counting at 0, tabular view at 1
    PageRequest page = PageRequest.of(pageNumber-1, pageSize);
    query.setPageable(page);

    if (sortAsc) {
      query.addSort(Sort.by(Sort.Direction.ASC, sortField));
    } else {
      query.addSort(Sort.by(Sort.Direction.DESC, sortField));
    }
    
    resultPagesCount = calculatePageCount(query);
    //Perform the search
    SearchHits<Manuscript> searchHits = elasticsearchOperations.search(query, Manuscript.class);
    List<Manuscript> searchResults = new ArrayList<>();

    for (SearchHit<Manuscript> hit : searchHits.getSearchHits()) {
      searchResults.add(hit.getContent());
    }

    this.results = searchResults;
    return searchResults;
  }
  
  /**
   * Searches the index and returns all annotation results
   *
   * @return list of all annotations
   */
  @Override
  public List<Annotation> queryAllAnnotations() {
	//Generic criteria constructor to obtain all search results
	Criteria criteria = new Criteria();
	CriteriaQuery query = new CriteriaQuery(criteria);
    
    //Perform the search
    SearchHits<Manuscript> searchHits = elasticsearchOperations.search(query, Manuscript.class);
	
    // Extract the annotations from the search results, which only return the full manuscripts
    List<Annotation> searchAnnoResults = new ArrayList<>();
    for (SearchHit<Manuscript> manuscript : searchHits.getSearchHits()) {
    	try {
    		List<Page> pages = manuscript.getContent().getPages();
    		for (Page page : pages) {
    			List<Annotation> annotations = page.getAnnotations();
    			// the title of the manuscript has to be added manually as they are not present in the index
    			String manuscriptTitle =  manuscript.getContent().getTitle();
    			for (Annotation annotation : annotations) {
    				annotation.setManuscriptTitle(manuscriptTitle);
    			}
    			searchAnnoResults.addAll(annotations);
    		}
    	} catch (Exception e) {
    		System.out.println("Could not get annotations for manuscript: " + manuscript.getContent().getTitle() + " " + manuscript.getContent().getId());
    		e.printStackTrace();
    	}	    
	}
    
	this.annoResults = searchAnnoResults;
	return searchAnnoResults;
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
