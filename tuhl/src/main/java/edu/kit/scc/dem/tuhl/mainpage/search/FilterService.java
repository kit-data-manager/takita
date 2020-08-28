package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfiguration;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfigurationHolder;
import edu.kit.scc.dem.tuhl.model.filter.FilterSelection;
import edu.kit.scc.dem.tuhl.model.filter.MatchFilter;
import edu.kit.scc.dem.tuhl.model.filter.RangeFilter;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.*;

import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;

/**
 * Class containing business logic for handling filters.
 */
@SessionScope
@Service
public class FilterService implements IFilterService {
  
  private List<Filter> currentFilters;
  private final Map<String, Filter> possibleFilters;
  
  /**
   * Constructor, initializes the list of current filters and the hashmap of possible filters.
   */
  public FilterService() {
    currentFilters = new ArrayList<>();
    possibleFilters = new LinkedHashMap<>();
    readPossibleFilters();
  }
  
  private void readPossibleFilters() {
    try {
      JSONArray possibleFiltersJson =
          new JSONArray(readFromFile("/possibleFilters.json"));
      
      //Go through each filter representation and create Filter object
      for (int i = 0; i < possibleFiltersJson.length(); i++) {
        JSONObject filterJson = possibleFiltersJson.getJSONObject(i);
        if (filterJson.has("field") && filterJson.has("type")) {
          String field = filterJson.getString("field");
          String typeString = filterJson.getString("type");
          Filter filter;
          if (typeString.equals("MATCH")) {
            filter = new MatchFilter(field);
          } else if (typeString.equals("RANGE")) {
            filter = new RangeFilter(field);
          } else {
            throw new IllegalArgumentException("Cannot resolve FilterType " + typeString);
          }
          //Put them in the map of possible filters
          possibleFilters.put(field, filter);
        } else {
          throw new IllegalArgumentException("The file possibleFilter.json does not match the "
              + "required structure.");
        }
      }
    } catch (IOException | JSONException e) {
      e.printStackTrace();
    }
  }
  
  private String readFromFile(String filename)
      throws IOException {
    InputStream is = getClass().getResourceAsStream(filename);
    InputStreamReader isr = new InputStreamReader(is);
    BufferedReader br = new BufferedReader(isr);
    StringBuilder sb = new StringBuilder();
    String line;
    while ((line = br.readLine()) != null) {
      sb.append(line);
    }
    br.close();
    isr.close();
    is.close();
    return sb.toString();
  }
  
  /**
   * Gets filters currently in use.
   *
   * @return list of currently used filters
   */
  @Override
  public List<Filter> getCurrentFilters() {
    return currentFilters;
  }
  
  /**
   * Sets filters currently in use.
   *
   * @param currentFilters to set
   */
  @Override
  public void setCurrentFilters(List<Filter> currentFilters) {
    this.currentFilters = currentFilters;
  }
  
  /**
   * Gets the map  of possible filters.
   *
   * @return list of possible filters
   */
  @Override
  public Map<String, Filter> getPossibleFilters() {
    return possibleFilters;
  }
  
  /**
   * Adds filters to the list of currently used filters.
   *
   * @param fields new filters to add indicated by their fields
   */
  @Override
  public void addToCurrentFilters(List<String> fields) {
    for (String field : fields) {
      currentFilters.add(possibleFilters.get(field));
    }
  }
  
  /**
   * Removes a filter from the list of currently used filters.
   *
   * @param field of the filter to remove
   */
  @Override
  public void removeFromCurrentFilters(String field) {
    currentFilters.remove(possibleFilters.get(field));
  }

  /**
   * Clears the list of current filters.
   */
  @Override
  public void clearCurrentFilters() {
    currentFilters.clear();
  }
  
  /**
   * Sets the filter attributes to the values held by the filterConfigurationHolder.
   *
   * @param filterConfigurationHolder the object holding the filter configs
   */
  @Override
  public void applyConfiguration(FilterConfigurationHolder filterConfigurationHolder) {
    for (FilterConfiguration config : filterConfigurationHolder.getFilterConfigs()) {
      possibleFilters.get(config.getField()).setValues(config.getValues());
    }
  }

  /**
   * Updates the filters in the model to pass to UI.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
    model.addAttribute("currentFilters", getCurrentFilters());
    model.addAttribute("possibleFilters", getPossibleFilters());
    model.addAttribute("filterSelection", new FilterSelection());
    model.addAttribute("filterConfigurationHolder",
        new FilterConfigurationHolder(getCurrentFilters()));
  }

}
