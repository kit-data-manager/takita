package edu.kit.scc.dem.tuhl;

import edu.kit.scc.dem.tuhl.assistance.User;
import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfigurationHolder;
import edu.kit.scc.dem.tuhl.model.filter.FilterSelection;
import edu.kit.scc.dem.tuhl.model.filter.MatchFilter;
import org.mockito.Mockito;
import org.springframework.ui.Model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ControllerTestHelper {

  public static void mockUpdateModel(IMainPageService mockedMainPageService){
    Mockito.doAnswer(invocation -> {
      Model model = invocation.getArgument(0);
      model.addAttribute("user", new User("Test User"));

      Filter titleFilter = new MatchFilter("title");
      List<Filter> currentFilters = new ArrayList<>();
      currentFilters.add(titleFilter);
      Map<String, Filter> possibleFilters = new HashMap<>();
      possibleFilters.put("title", titleFilter);

      model.addAttribute("currentFilters", currentFilters);
      model.addAttribute("possibleFilters", possibleFilters);
      model.addAttribute("filterSelection", new FilterSelection());
      model.addAttribute("filterConfigurationHolder",
          new FilterConfigurationHolder(new ArrayList<Filter>()));

      model.addAttribute("availableViews", new HashMap<String, String>());

      model.addAttribute("results", "Results");
      model.addAttribute("sortField", "id");
      model.addAttribute("order", "asc");
      model.addAttribute("currentPage", 1);

      model.addAttribute("numberOfPages", 1);
      model.addAttribute("searchterm", "search");
      model.addAttribute("noResults", 10);
      return null;
    }).when(mockedMainPageService).update(Mockito.any(Model.class));
  }



}
