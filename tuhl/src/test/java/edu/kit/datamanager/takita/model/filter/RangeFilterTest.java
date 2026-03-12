package edu.kit.datamanager.takita.model.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;

import edu.kit.datamanager.takita.model.filter.RangeFilter;

import java.util.ArrayList;
import java.util.List;

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

  CriteriaQuery perfectQuery = new CriteriaQuery(new Criteria("publicationYear").lessThanEqual(pubYearGte).greaterThanEqual(pubYearLte));

  //TODO: extend to test more query features
  assertEquals(perfectQuery.getFields(), new CriteriaQuery(rangeFilter.getCriteria()).getFields());
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