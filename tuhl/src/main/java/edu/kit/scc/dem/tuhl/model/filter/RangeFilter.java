package edu.kit.scc.dem.tuhl.model.filter;

import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;
import static org.elasticsearch.index.query.QueryBuilders.rangeQuery;

import com.google.gson.annotations.Expose;
import java.util.ArrayList;
import java.util.List;
import org.elasticsearch.index.query.RangeQueryBuilder;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

public class RangeFilter implements Filter {

  /**
   * Type of filter from enum FilterType.
   */
  public static final FilterType TYPE = FilterType.RANGE;
  private final String field;
  private List<String> values;
  @Expose(serialize = false, deserialize = false)
  private transient NativeSearchQuery query;

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
      RangeQueryBuilder rangeQueryBuilder = rangeQuery(field);
      if (!values.get(0).trim().equals("")) {
        rangeQueryBuilder = rangeQueryBuilder.gte(values.get(0));
      }
      if (!values.get(1).trim().equals("")) {
        rangeQueryBuilder = rangeQueryBuilder.lte(values.get(1));
      }
      this.query = new NativeSearchQueryBuilder().withQuery(rangeQueryBuilder).build();
    } else {
      this.query = new NativeSearchQueryBuilder().withQuery(matchAllQuery()).build();
    }
  }

  /**
   * Gets the search query.
   * @return query as NativeSearchQuery
   */
  @Override
  public NativeSearchQuery getQuery() {
    return query;
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
