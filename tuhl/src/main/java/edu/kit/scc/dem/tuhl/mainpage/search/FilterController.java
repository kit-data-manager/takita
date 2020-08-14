package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.assistance.IUser;
import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfigurationHolder;
import edu.kit.scc.dem.tuhl.model.filter.FilterSelection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controls the interaction with the user interface concerning filters and provides the api
 * endpoints for those functionalities.
 * Delegates the tasks to the corresponding business logic in an IFilterService instance.
 */
@Controller
@RequestMapping("/filter")
public class FilterController {
  
  private final IFilterService filterService;
  private final IAssistanceService assistanceService;
  private final IMainPageService mainPageService;
  
  /**
   * Constructor for the FilterController to autowire required instances.
   * @param filterService instance of the business logic for filters. Injected with Springs
   *                      dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public FilterController(IFilterService filterService, IAssistanceService assistanceService,
                          IMainPageService mainPageService) {
    this.filterService = filterService;
    this.assistanceService = assistanceService;
    this.mainPageService = mainPageService;
  }
  
  /**
   * Delegates the task to add a selection of filters specified by the user to the current
   * filters that can be edited and applied to the search.
   *
   * @param filterSelection holds the selection of filters to add to the current active filters
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/add")
  public String addFilters(@RequestBody FilterSelection filterSelection, Model model) {
    filterService.addToCurrentFilters(filterSelection.getFields());
    mainPageService.update(model);
    return "filter_selection :: filterSelection";
  }
  
  /**
   * Delegates the task to remove a filter from the list of current filters that can be edited
   * and applied to the search.
   *
   * @param filterField the field of the filter to remove
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @PostMapping("/remove")
  public String removeFilter(@RequestBody String filterField, Model model) {
    filterService.removeFromCurrentFilters(filterField);
    mainPageService.update(model);
    return "filter_selection :: filterSelection";
  }
  
  /**
   * Delegates the task to clear the list of current filters that can be edited and applied to
   * the search.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/clear")
  public String clearFilters(Model model) {
    filterService.clearCurrentFilters();
    mainPageService.update(model);
    return "filter_selection :: filterSelection";
  }
  
  /**
   * Delegates the task to execute the search with the given FilterSelection which holds a list
   * of filters.
   *
   * @param filterConfigurationHolder the configuration of filters to apply
   * @return the name of the html file to display
   */
  @PostMapping("/apply")
  public String applyFilters(@ModelAttribute("filterConfiguration")
                                   FilterConfigurationHolder filterConfigurationHolder) {
    filterService.applyConfiguration(filterConfigurationHolder);
    IUser user = assistanceService.getCurrentUser();
    if (user.isSaveFilter()) {
      assistanceService.getCurrentUser().setFilter(filterService.getCurrentFilters());
      assistanceService.updateUser();

      System.out.println(filterService.getCurrentFilters());
    }

    return "redirect:/";
  }

}
