package edu.kit.datamanager.takita.mainpage;

import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.mainpage.dashboard.IDashboardService;
import edu.kit.datamanager.takita.mainpage.dashboard.annoview.AnnoViewService;
import edu.kit.datamanager.takita.mainpage.dashboard.contentview.TableViewService;
import edu.kit.datamanager.takita.mainpage.search.IFilterService;
import edu.kit.datamanager.takita.mainpage.search.ISearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;

/**
 * Service for functionalities of the entry page to tAKITA
 */
@SessionScope
@Service
public class MainPageService implements IMainPageService {

  IAssistanceService assistanceService;
  IFilterService filterService;
  IDashboardService dashboardService;
  TableViewService tableViewService;
  AnnoViewService annoViewService;
  ISearchService searchService;

  /**
   * Constructor for the Main Page Service to autowire required instances.
   * *
   *
   * @param assistanceService instance of the logic for assistance. Injected with Springs dependency
   *                          injection system indicated by @autowired annotation.
   * @param filterService instance of the logic for filter. Injected with Springs dependency
   *                      injection system indicated by @autowired annotation.
   * @param dashboardService instance of the logic for dashboard. Injected with Springs
   *                         dependency injection system indicated by @autowired annotation.
   * @param searchService instance of the logic for search service. Injected with Springs
   *                      dependency injection system indicated by @autowired annotation.
   * @param annoViewService instance of the logic for annoView service
   * @param tableViewService instance of the logic for table view service. Injected with Springs
   *                         dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public MainPageService(IAssistanceService assistanceService, IFilterService filterService,
                         IDashboardService dashboardService, TableViewService tableViewService,
                         AnnoViewService annoViewService, ISearchService searchService) {
    this.assistanceService = assistanceService;
    this.filterService = filterService;
    this.dashboardService = dashboardService;
    this.tableViewService = tableViewService;
    this.annoViewService = annoViewService;
    this.searchService = searchService;
  }

  /**
   * Updates Model with all necessary attributes for MainPage.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void update(Model model) {
    assistanceService.updateModel(model);
    filterService.updateModel(model);
    dashboardService.updateModel(model);
    tableViewService.updateModel(model);
    annoViewService.updateModel(model);
    searchService.updateModel(model);

  }

}
