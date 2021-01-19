package edu.kit.scc.dem.tuhl.model.filter;

import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;
import static org.elasticsearch.index.query.QueryBuilders.matchQuery;

import com.google.gson.annotations.Expose;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

public class MatchFilter implements Filter {

  /**
   * Type of filter from enum FilterType.
   */
  public static final FilterType TYPE = FilterType.MATCH;
  private final String field;
  @Expose(serialize = false, deserialize = false)
  private transient NativeSearchQuery query;
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
    this.values = values;
    if (!values.isEmpty() && !values.get(0).trim().equals("")) {
      NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
      for (String v: values) {
        queryBuilder.withQuery(matchQuery(field, v));
      }
      this.query = queryBuilder.build();
    }  else {
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
    return FilterType.MATCH;
  }
}
