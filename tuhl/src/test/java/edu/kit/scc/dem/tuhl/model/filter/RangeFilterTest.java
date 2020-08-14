package edu.kit.scc.dem.tuhl.model.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

import java.util.ArrayList;
import java.util.List;

import static org.elasticsearch.index.query.QueryBuilders.rangeQuery;
import static org.junit.jupiter.api.Assertions.*;

class RangeFilterTest {

  private RangeFilter rangeFilter;

  @BeforeEach
  void init() {
    rangeFilter = new RangeFilter("publicationYear");
  }

  @Test
  void setValuesValid() {
    String pubYearLte = "2016";
    String pubYearGte = "2019";
    List<String> values = new ArrayList<>();
    values.add(pubYearLte);
    values.add(pubYearGte);
    rangeFilter.setValues(values);

    NativeSearchQuery perfectQuery = new NativeSearchQueryBuilder()
        .withQuery(rangeQuery("publicationYear")
            .gte(pubYearLte)
            .lte(pubYearGte))
        .build();

    assertEquals(perfectQuery.getQuery(), rangeFilter.getQuery().getQuery());
  }

  @Test
  void setValuesNull() {
    assertThrows(NullPointerException.class, () -> rangeFilter.setValues(null));
  }

  @Test
  void setValuesEmptyList() {
    List<String> values = new ArrayList<>();
    String pubYearLte = "2016";
    values.add(pubYearLte);
    assertDoesNotThrow(() -> rangeFilter.setValues(values));
  }
}