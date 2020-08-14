package edu.kit.scc.dem.tuhl.model.filter;

import java.util.List;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;

/**
 * Interface specifying methods for filters, their fields, values and generating their query.
 */
public interface Filter {
  /**
   * Type of filter from enum FilterType.
   */
  FilterType TYPE = FilterType.UNDEFINED;

  /**
   * Gets the field specifying which attribute the filter searches.
   *
   * @return field as String
   */
  String getField();

  /**
   * Gets list of values the filter searches for.
   *
   * @return values as list of Strings
   */
  List<String> getValues();

  /**
   * Sets the values the filter searches for.
   *
   * @param values as list of Strings
   */
  void setValues(List<String> values);

  /**
   * Gets the search query.
   *
   * @return query as NativeSearchQuery
   */
  NativeSearchQuery getQuery();

  /**
   * Gets the type of the filter.
   *
   * @return FilterType
   */
  FilterType getType();
}
