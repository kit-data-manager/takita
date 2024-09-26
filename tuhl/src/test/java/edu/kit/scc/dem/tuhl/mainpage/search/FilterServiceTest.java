package edu.kit.scc.dem.tuhl.mainpage.search;


import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfigurationHolder;
import edu.kit.scc.dem.tuhl.model.filter.FilterSelection;
import edu.kit.scc.dem.tuhl.model.filter.MatchFilter;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.ui.Model;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest(classes = FilterService.class)
@TestPropertySource("classpath:application-test.properties")
class FilterServiceTest {


  @Autowired
  private FilterService filterService;


  @Test
  void updateModel() {
    Model model = Mockito.mock(Model.class);

    List<Filter> mockedFilterList = new ArrayList<>();
    mockedFilterList.add(filterService.getPossibleFilters().get("title"));
    filterService.setCurrentFilters(mockedFilterList);

    Mockito.when(model.addAttribute(Mockito.anyString(), Mockito.anyList())).thenAnswer(invocation -> {
      assertEquals("currentFilters", invocation.getArgument(0));
      assertEquals(filterService.getCurrentFilters(), invocation.getArgument(1));
      return model;
    });

    Mockito.when(model.addAttribute(Mockito.anyString(), Mockito.anyMap())).thenAnswer(invocation -> {
      assertEquals("possibleFilters", invocation.getArgument(0));
      assertEquals(filterService.getPossibleFilters(), invocation.getArgument(1));
      return model;
    });
    Mockito.when(model.addAttribute(Mockito.anyString(), Mockito.any(FilterSelection.class))).thenAnswer(invocation -> {
      assertEquals("filterSelection", invocation.getArgument(0));
      return model;
    });
    Mockito.when(model.addAttribute(Mockito.anyString(), Mockito.any(FilterConfigurationHolder.class))).thenAnswer(invocation -> {
      assertEquals("filterConfigurationHolder", invocation.getArgument(0));
      return model;
    });
    filterService.updateModel(model);

  }

  @Test
  void addToCurrentFilters(){

    Filter titleFilter = new MatchFilter("title");
    List<Filter> mockedFilterList = new ArrayList<>();
    mockedFilterList.add(titleFilter);
    filterService.setCurrentFilters(mockedFilterList);

    List<String> newFilter = new ArrayList<>();
    newFilter.add("publisher");

    filterService.addToCurrentFilters(newFilter);

    assertTrue(filterService.getCurrentFilters().contains(titleFilter));
    boolean bool = false;
    for(Filter filter: filterService.getCurrentFilters()) {
      if(filter.getField().equals("publisher")){
        bool = true;
      };
    }
    assertTrue(bool);
    assertEquals(2,filterService.getCurrentFilters().size());

  }

  @Test
  void removeFromCurrentFilter(){

    List<Filter> mockedFilterList = new ArrayList<>();
    mockedFilterList.add(filterService.getPossibleFilters().get("title"));
    mockedFilterList.add(filterService.getPossibleFilters().get("id"));
    filterService.setCurrentFilters(mockedFilterList);
    filterService.removeFromCurrentFilters("id");

    assertTrue(filterService.getCurrentFilters().contains(filterService.getPossibleFilters().get("title")));
    assertEquals(1,filterService.getCurrentFilters().size());

  }

}