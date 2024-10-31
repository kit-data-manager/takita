package edu.kit.datamanager.takita.model.filter;

import java.util.ArrayList;
import java.util.List;

/**
 * Holds the configurations for all the current filters to pass from the ui to the controller.
 */
public class FilterConfigurationHolder {
  
  private List<FilterConfiguration> filterConfigs;
  
  /**
   * Constructor without arguments for thymeleaf.
   */
  public FilterConfigurationHolder() {
    this.filterConfigs = new ArrayList<>();
  }
  
  /**
   * Constructor, initializes the config objects.
   * @param filters the list of current filters to initialize the config objects
   */
  public FilterConfigurationHolder(List<Filter> filters) {
    this.filterConfigs = new ArrayList<>();
    for (Filter filter : filters) {
      FilterConfiguration filterConfiguration = new FilterConfiguration();
      filterConfiguration.setField(filter.getField());
      filterConfiguration.setValues(filter.getValues());
      filterConfigs.add(filterConfiguration);
    }
  }
  
  /**
   * Gets the filters as a list.
   * @return the filters
   */
  public List<FilterConfiguration> getFilterConfigs() {
    return filterConfigs;
  }
  
  /**
   * Sets the list of Filters.
   * @param filterConfigs to set
   */
  public void setFilterConfigs(List<FilterConfiguration> filterConfigs) {
    this.filterConfigs = filterConfigs;
  }
}
