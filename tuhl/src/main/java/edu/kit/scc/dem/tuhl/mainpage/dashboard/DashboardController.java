package edu.kit.scc.dem.tuhl.mainpage.dashboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Provides method to display Dashboard, has an Instance of Dashboard Service.
 */

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

  private final IDashboardService dashboardService;

  /**
   * Constructor for the DashboardController to autowire required instances.
   *
   * @param dashboardService instance of the business logic for the dashboard. Injected with
   *                         Springs dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public DashboardController(IDashboardService dashboardService) {
    this.dashboardService = dashboardService;
  }

  /**
   * Handles http request to show dashboard.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return name of html file to display dashboard
   */
  @GetMapping
  public String showDashboard(Model model) {
    model.addAttribute("availableViews", dashboardService.getAvailableContentViews());
    return "dashboard.html :: dashboard";
  }

  /**
   * Get mapping to display content view.
   *
   * @return redirect
   */
  @GetMapping("/contentview")
  public String showContentView() {
    return dashboardService.getRedirect();
  }

  /**
   * handles http get request for chosen content view.
   *
   * @param contentView that is chosen
   * @return redirect to /content view
   */
  @GetMapping("/contentview/{view}")
  public String getContentView(@PathVariable("view") String contentView) {
    dashboardService.setCurrentContentView(contentView);
    return "redirect:/dashboard/contentview";
  }


}
