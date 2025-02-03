package edu.kit.datamanager.takita.assistance;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import edu.kit.datamanager.takita.assistance.User;
import edu.kit.datamanager.takita.model.filter.Filter;
import edu.kit.datamanager.takita.model.filter.MatchFilter;
import edu.kit.datamanager.takita.model.filter.RangeFilter;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

  User user;

  @BeforeEach
  void init() {
    user = new User("testUser");
  }

  @Test
  void testGetSetFilters() {
    List<Filter> filters = new ArrayList<>();
    Filter matchFilter1 = new MatchFilter("title");
    Filter matchFilter2 = new MatchFilter("id");
    Filter rangeFilter1 = new RangeFilter("publicationyear");

    List<String> valuesMatch1 = new ArrayList<>();
    valuesMatch1.add("this");
    matchFilter1.setValues(valuesMatch1);
    filters.add(matchFilter1);

    List<String> valuesMatch2 = new ArrayList<>();
    valuesMatch2.add("hello");
    valuesMatch2.add("goodbye");
    matchFilter2.setValues(valuesMatch2);
    filters.add(matchFilter2);

    List<String> valuesRange1 = new ArrayList<>();
    valuesRange1.add("123");
    valuesRange1.add("234");
    rangeFilter1.setValues(valuesRange1);
    filters.add(rangeFilter1);

    user.setFilter(filters);
    List<Filter> actualFilters = user.getFilters();

    assertEquals(filters.size(), actualFilters.size());
    for (Filter expFilter : filters) {
      for (Filter actFilter : actualFilters) {
        if (expFilter.getField().equals(actFilter.getField())) {
          assertEquals(expFilter.getType(), actFilter.getType());
          assertEquals(expFilter.getValues().size(), actFilter.getValues().size());
        }
      }
    }
  }

}