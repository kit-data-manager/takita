package edu.kit.datamanager.takita.mainpage.search;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.mainpage.IMainPageService;
import edu.kit.datamanager.takita.mainpage.dashboard.contentview.TableViewService;
import edu.kit.datamanager.takita.model.filter.FilterConfigurationHolder;
import edu.kit.datamanager.takita.model.filter.FilterSelection;

/**
 * Controls the interaction with the user interface concerning filters and provides the api
 * endpoints for those functionalities.
 * Delegates the tasks to the corresponding business logic in an IFilterService instance.
 */
@Controller
@RequestMapping("/filter")
public class FilterController {
  
  private static final String FRAGMENT_FILTER_SELECTION = "filter_selection :: filterSelection";
  private final IFilterService filterService;
  private final IAssistanceService assistanceService;
  private final IMainPageService mainPageService;
  private final TableViewService tableViewService;
  
  /**
   * Constructor for the FilterController to autowire required instances.
   *
   * @param filterService instance of the business logic for filters. Injected with Springs
   *                      dependency injection system indicated by @autowired annotation.
   * @param assistanceService instance of the business logic of the assistance service. Injected
   *                          with Springs dependency injection system indicated by @autowired
   *                          annotation.
   * @param mainPageService instance of the business logic of the main page. Injected with Springs
   *                        dependency injection system indicated by @autowired annotation.
   *
   * @param tableViewService instance of the business logic of the table view. Injected with Springs
   *                         dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public FilterController(IFilterService filterService, IAssistanceService assistanceService,
                          IMainPageService mainPageService, TableViewService tableViewService) {
    this.filterService = filterService;
    this.assistanceService = assistanceService;
    this.mainPageService = mainPageService;
    this.tableViewService = tableViewService;
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
    return FRAGMENT_FILTER_SELECTION;
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
    return FRAGMENT_FILTER_SELECTION;
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
    tableViewService.setCurrentPage(1);
    return FRAGMENT_FILTER_SELECTION;
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
    assistanceService.getCurrentUser().setFilter(filterService.getCurrentFilters());
    assistanceService.updateUser();
    tableViewService.setCurrentPage(1);
    return "redirect:/";
  }

}
