package edu.kit.scc.dem.tuhl.model.filter;

import java.util.ArrayList;
import java.util.List;

/**
 * Model class for saving the filters newly selected in the UI, helps Thymeleaf.
 */
public class FilterSelection {

  private List<String> fields;

  public FilterSelection() {
    fields = new ArrayList<>();
  }

  /**
   * Gets the newly selected filters as a list of fields.
   *
   * @return new filters as list of Strings indicating their fields
   */
  public List<String> getFields() {
    return fields;
  }

  /**
   * Sets the list of Strings containing the fields of the filters.
   *
   * @param fields to set
   */
  public void setFields(List<String> fields) {
    this.fields = fields;
  }
}
