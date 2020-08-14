package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfigurationHolder;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

/**
 * Interface for class FilterService, contains logic for handling filters.
 */
@Service
public interface IFilterService {

  /**
   * Gets filters currently in use.
   * @return list of currently used filters
   */
  List<Filter> getCurrentFilters();

  /**
   * Sets filters currently in use.
   * @param currentFilters to set
   */
  void setCurrentFilters(List<Filter> currentFilters);
  
  /**
   * Sets the filter attributes to the values held by the filterConfigurationHolder.
   * @param filterConfigurationHolder the object holding the filter configs
   */
  void applyConfiguration(FilterConfigurationHolder filterConfigurationHolder);
  
  /**
   * Gets all possible filters.
   * @return list of possible filters
   */
  Map<String, Filter> getPossibleFilters();
  
  /**
   * Adds filters to the list of currently used filters.
   * @param fields new filters to add indicated by their fields
   */
  void addToCurrentFilters(List<String> fields);
  
  /**
  * Removes a filter from the list of currently used filters.
  * @param field of the filter to remove
  */
  void removeFromCurrentFilters(String field);
  
  /**
   * Clears the list of current filters.
   */
  void clearCurrentFilters();

  /**
   * Updates the filters in the model to pass to UI.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void updateModel(Model model);
}
