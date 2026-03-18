package edu.kit.datamanager.takita.model.filter;

import com.google.gson.annotations.Expose;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.elasticsearch.core.query.Criteria;

public class MatchFilter implements Filter {

  /**
   * Type of filter from enum FilterType.
   */
  public static final FilterType TYPE = FilterType.MATCH;
  private final String field;
  @Expose(serialize = false, deserialize = false)
  private transient Criteria criteria;
  private List<String> values;


  public MatchFilter(String field) {
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
    Criteria criteria = null;
    this.values = values;
    if (!values.isEmpty() && !values.get(0).trim().equals("")) {
      for (String v: values) {
        if (criteria == null) {
          criteria = new Criteria(field).is(v);
        } else {
          criteria = criteria.or(field).is(v);
        }
      }
      this.criteria = criteria;
    }  else {
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
    return FilterType.MATCH;
  }
}
