package edu.kit.scc.dem.tuhl.mainpage.dashboard.contentview;


import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
import edu.kit.scc.dem.tuhl.mainpage.dashboard.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
   * Handles request when sort function in table is called.
   *
   * @param column to be sorted by
   * @param order  asc or desc
   * @param pageNo current pageNo
   * @param size   current page size
   * @param model  the holder for model attributes, used to pass attributes back to the view
   * @return
   */
  @RequestMapping(value = "/sort", params = {"sorters[0][field]",
      "sorters[0][dir]", "page", "size"})
  @ResponseBody
  public String getSorted(@RequestParam("sorters[0][field]") String column,
                          @RequestParam("sorters[0][dir]") String order,
                          @RequestParam("page") int pageNo, @RequestParam("size") int size,
                          Model model) {
    tableViewService.setCurrentPage(pageNo);
    tableViewService.setNumberOfResults(size);
    tableViewService.setSortAsc(order.equals("asc"));
    tableViewService.setSortField(column);
    tableViewService.search();
    mainPageService.update(model);

    JSONArray data = tableViewService.getData();
    JSONObject newData = new JSONObject();
    try {
      newData.put("last_page", tableViewService.getNumberOfResultsPages());
      newData.put("data", data);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newData.toString();
  }

  // not sure if needed anymore

  /*
  @RequestMapping(value = "/sort", params = {"page", "size"})
  @ResponseBody
  public String getPage(@RequestParam("page") int pageNo, @RequestParam("size") int size,
                         Model model) {
    tableViewService.setCurrentPage(pageNo);
    tableViewService.setNumberOfResults(size);
    tableViewService.search();
    mainPageService.update(model);

    JSONArray data = tableViewService.getData();
    JSONObject newData = new JSONObject();
    try {
      newData.put("last_page", tableViewService.getNumberOfResultsPages());
      newData.put("data", data);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newData.toString();
  }

   */

  @RequestMapping(value = "/getData")
  @ResponseBody
  public String getPage(Model model) {
    mainPageService.update(model);
    return tableViewService.getData().toString();
  }


}
