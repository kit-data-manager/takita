package edu.kit.datamanager.takita.model.filter;

import com.google.gson.annotations.Expose;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.elasticsearch.core.query.Criteria;

public class RangeFilter implements Filter {

  /**
   * Type of filter from enum FilterType.
   */
  public static final FilterType TYPE = FilterType.RANGE;
  private final String field;
  private List<String> values;
  @Expose(serialize = false, deserialize = false)
  private transient Criteria criteria;

  public RangeFilter(String field) {
    this.field = field;
    values = new ArrayList<>();
  }

  /**
   * Gets the field specifying which attribute the filter searches.
   * @return field as String
   */
  @Override
  public String getField() {
    return field;
  }

  /**
   * Gets list of values the filter searches for.
   * @return values as list of Strings
   */
  @Override
  public List<String> getValues() {
    return values;
  }

  /**
   * Sets the values the filter searches for and generates the query.
   * @param values as list of Strings
   */
  @Override
  public void setValues(List<String> values) {
    this.values = values;
    if (!values.isEmpty() && values.size() > 1) {
      Criteria criteria = new Criteria(field);
      if (!values.get(0).trim().equals("")) {
        criteria = criteria.greaterThanEqual(values.get(0));
      }
      if (!values.get(1).trim().equals("")) {
        criteria = criteria.lessThanEqual(values.get(1));
      }
      this.criteria = criteria;
    } else {
      this.criteria = new Criteria();
    }
  }

  /**
   * Gets the search query.
   * @return query as NativeSearchQuery
   */
  @Override
  public Criteria getCriteria() {
    return criteria;
  }

  /**
   * Gets the type of a filter.
   *
   * @return FilterType
   */
  @Override
  public FilterType getType() {
    return FilterType.RANGE;
  }
}
