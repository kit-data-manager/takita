package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

/**
 * Interface for class SearchService, contains logic for search related tasks.
 */
@Service
public interface ISearchService {
    
  /**
  * Searches the index and returns a certain number of results specified in pageSize.
   *
  * @param pageNumber page of search results
  * @param sortField field to sort the results
  * @param sortAsc specifies if the sorting direction is ascending
  * @return limited number of search results in list of manuscripts
  */
  List<Manuscript> search(int pageNumber, String sortField, boolean sortAsc);

  /**
   * Searches the index and returns all annotation results
   *
   * @return number of search results in list of annotations
   */
  List<Annotation> searchAnno();
  
  /**
   * Gets list of search results.
   *
   * @return search results in list of manuscripts
   */
  List<Manuscript> getResults();
  
  /**
   * Gets list of search results for annotation.
   *
   * @return search results in list of annotations
   */
  List<Annotation> getAnnoResults();

  /**
   * Gets the number of pages needed to contain all results.
   *
   * @return the number of pages
   */
  long getResultPagesCount();
  
  /**
   * Set the search term.
   *
   * @param searchTerm the search term to set
   */
  void setSearchTerm(String searchTerm);
    
  /**
   * Gets the size of a page shown to user.
   *
   * @return page size as int
   */
  int getPageSize();

  /**
   * Sets the size of a page shown to user.
   *
   * @param pageSize page size as int
   */
  void setPageSize(int pageSize);

  /**
   * Updates the number of pages and search term in the model to pass to UI.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void updateModel(Model model);


  }
