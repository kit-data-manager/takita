package edu.kit.scc.dem.tuhl.model.filter;

import org.elasticsearch.common.unit.Fuzziness;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

import java.util.ArrayList;
import java.util.List;

import static org.elasticsearch.index.query.QueryBuilders.matchQuery;
import static org.junit.jupiter.api.Assertions.*;

class MatchFilterTest {

  private MatchFilter matchFilter;

  @BeforeEach
  void init() {
    matchFilter = new MatchFilter("title");
  }

  @Test
  void setValuesValid() {
    String titleTerm = "Wien Vind Phil Gr 217, 193v";
    List<String> values = new ArrayList<>();
    values.add(titleTerm);
    matchFilter.setValues(values);

    NativeSearchQuery perfectQuery = new NativeSearchQueryBuilder()
        .withQuery(matchQuery("title", titleTerm)).build();
          //.fuzziness(Fuzziness.AUTO)

    assertEquals(perfectQuery.getQuery(), matchFilter.getQuery().getQuery());
  }

  @Test
  void setValuesNull() {
    assertThrows(NullPointerException.class, () -> matchFilter.setValues(null));
  }

  @Test
  void setValuesEmptyList() {
    List<String> values = new ArrayList<>();
    assertDoesNotThrow(() -> matchFilter.setValues(values));
  }
}