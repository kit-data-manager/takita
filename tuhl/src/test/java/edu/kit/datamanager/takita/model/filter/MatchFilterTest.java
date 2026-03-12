package edu.kit.datamanager.takita.model.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;

import edu.kit.datamanager.takita.model.filter.MatchFilter;

import java.util.ArrayList;
import java.util.List;

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

    CriteriaQuery perfectQuery = new CriteriaQuery(new Criteria("title").is(titleTerm));

    //TODO: extend to test more query features
    assertEquals(perfectQuery.getFields(), new CriteriaQuery(matchFilter.getCriteria()).getFields());
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