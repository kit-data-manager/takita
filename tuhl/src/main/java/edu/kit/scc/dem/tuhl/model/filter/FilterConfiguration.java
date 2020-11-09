package edu.kit.scc.dem.tuhl.model.filter;

import java.util.ArrayList;
import java.util.List;

/**
 * Holds a configuration for a filter. Needed for the ui forms.
 */
public class FilterConfiguration {
  private String field;
  private List<String> values;
  
  /**
   * Constructor, initializes the values list.
   */
  public FilterConfiguration() {
    values = new ArrayList<>();
  }
  
  /**
   * Sets the values list.
   * @param values list of strings to set
   */
  public void setValues(List<String> values) {
    this.values = values;
  }
  
  /**
   * Gets the values.
   * @return the values list
   */
  public List<String> getValues() {
    return values;
  }
  
  /**
   * Gets the field.
   * @return the field
   */
  public String getField() {
    return field;
  }
  
  /**
   * Sets the field.
   * @param field to set
   */
  public void setField(String field) {
    this.field = field;
  }
}
