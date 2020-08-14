package edu.kit.scc.dem.tuhl.mainpage.dashboard.contentview;


import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
import edu.kit.scc.dem.tuhl.mainpage.dashboard.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;


/**
 * Implementation of ContentViewController. Handles http requests regarding the table view.
 */
@Controller
@RequestMapping("/tableview")
public class TableViewController {

  private final IDashboardService dashboardService;
  private final TableViewService tableViewService;
  private final IMainPageService mainPageService;

  /**
   * Constructor for the TableViewController to autowire required instances.
   *
   * @param dashboardService instance of the business logic for the dashboard. Injected with
   *                         Springs dependency injection system indicated by @autowired annotation.
   * @param tableViewService instance of the business logic for the table view. Injected with
   *                         Springs dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public TableViewController(IDashboardService dashboardService,
                             TableViewService tableViewService, IMainPageService mainPageService) {
    this.dashboardService = dashboardService;
    this.tableViewService = tableViewService;
    this.mainPageService = mainPageService;
  }

  /**
   * Handles GET request for pages of manuscript. Adds all pages to Model.
   *
   * @param manId of manuscript
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   * @throws NoSuchIndexEntryException when there is no manuscript with the given ID
   *                                    in the search index
   */
  @GetMapping("/getManPages/{manId}")
  @ResponseBody
  public String getPages(@PathVariable("manId") String manId, Model model)
      throws NoSuchIndexEntryException {
    model.addAttribute("pages", tableViewService.getPages(manId));
    mainPageService.update(model);
    return "placeholder";
  }

  /**
   * Handles get request to show table view, gets Manuscripts and needed information on metadata
   * from SearchIndexService, adds full Table to Model.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return html file name to display table view
   */
  @GetMapping
  public String showContentView(Model model) {
    mainPageService.update(model);
    return "table_view.html :: tableView";
  }

  /**
   * Handles http get request for new table page.
   *
   * @param pageNo of Page to be displayed
   * @param model  the holder for model attributes, used to pass attributes back to the view
   * @return html file name to display table view
   */
  @GetMapping("/page/{pageNo}")
  @ResponseBody
  public String getNewPage(@PathVariable("pageNo") int pageNo, Model model) {
    tableViewService.setCurrentPage(pageNo);
    mainPageService.update(model);
    return "placeholder";
  }

  /**
   * Handles GET request for first page of manuscript.
   *
   * @param manId of manuscript
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return id of first page
   */
  @GetMapping("/getFirstPage/{manId}")
  @ResponseBody
  public String getFirstPage(@PathVariable("manId") String manId, Model model) {
    try {
      return tableViewService.getFirstPage(manId);

    } catch (NoSuchIndexEntryException e) {
      model.addAttribute("errorMessage", e.getMessage());
      return "error";
    }

  }

  /**
   * Handles Get request to set flag in model.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return tabelview html
   */
  @GetMapping("/flag")
  public String getNePage(Model model) {

    mainPageService.update(model);
    model.addAttribute("flag", true);
    return "table_view.html :: tableView";
  }


  /**
   * Handles http get request to sort table.
   *
   * @param column to be sorted by
   * @param order  in which column is sorted (desc or asc)
   * @param model  the holder for model attributes, used to pass attributes back to the view
   * @return html file name to display table view
   */
  @GetMapping("/sort/{col}/{order}")
  @ResponseBody
  public String getSorted(@PathVariable("col") String column, @PathVariable("order") String order,
                          Model model) {
    tableViewService.setCurrentPage(1);
    tableViewService.setSortAsc(order.equals("asc"));
    tableViewService.setSortField(column);
    mainPageService.update(model);
    return "placeholder";
  }

}
