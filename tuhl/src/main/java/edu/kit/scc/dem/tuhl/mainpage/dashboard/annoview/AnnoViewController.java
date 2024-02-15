package edu.kit.scc.dem.tuhl.mainpage.dashboard.annoview;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.dataaccess.IAccessService;
import edu.kit.scc.dem.tuhl.dataaccess.IAnnotationStoreAccessService;
import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;

import java.io.IOException;

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
@RequestMapping("/annoview")
public class AnnoViewController {

  private final AnnoViewService AnnoViewService;
  private final IMainPageService mainPageService;
  //private final IAnnotationStoreAccessService annotationStoreAccessService;
  private final ISearchIndexService searchIndexService;

  /**
   * Constructor for the AnnoViewController to autowire required instances.
   *
   * @param AnnoViewService instance of the business logic for the table view. Injected with
   *                         Springs dependency injection system indicated by @autowired annotation.
   * @param mainPageService instance of the business logic for the main page. Injected with
   *                        Springs dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public AnnoViewController(AnnoViewService AnnoViewService, IMainPageService mainPageService, ISearchIndexService searchIndexService) {
    this.AnnoViewService = AnnoViewService;
    this.mainPageService = mainPageService;
    this.searchIndexService = searchIndexService;
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
    return "table_view_anno.html :: annoView";
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
      return AnnoViewService.getFirstPage(manId);

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
   * @return the sorted data in json format
   */
  @RequestMapping(value = "/sort", params = {"sorters[0][field]",
      "sorters[0][dir]", "page", "size"})
  @ResponseBody
  public String getSorted(@RequestParam("sorters[0][field]") String column,
                          @RequestParam("sorters[0][dir]") String order,
                          @RequestParam("page") int pageNo, @RequestParam("size") int size,
                          Model model) {
    AnnoViewService.setCurrentPage(pageNo);
    AnnoViewService.setNumberOfResults(size);
    AnnoViewService.setSortAscending(order.equals("asc"));
    AnnoViewService.setSortField(column);
    AnnoViewService.search();
    mainPageService.update(model);
    try {
      JSONArray data = AnnoViewService.getData();
      JSONObject newData = new JSONObject();

      newData.put("last_page", AnnoViewService.getNumberOfResultsPages());
      newData.put("data", data);
      return newData.toString();
    } catch (JSONException e) {
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
   * @return the sorted data in json format
   */
  @RequestMapping(value = "/annoview")
  @ResponseBody
  public String getAnnoview(Model model) {
    AnnoViewService.search();
    mainPageService.update(model);
    try {
      JSONArray data = AnnoViewService.getData();
      JSONObject newData = new JSONObject();

      newData.put("last_page", AnnoViewService.getNumberOfResultsPages());
      newData.put("data", data);
      return data.toString();
    } catch (JSONException e) {
      model.addAttribute("errorMessage", e.getMessage());
      return "error";
    }

  }

  /**
   * Handles GET request to set table to first Page.
   *
   * @return placeholder
   */
  @GetMapping("/getFirst")
  @ResponseBody
  public String setFirstPage() {
    AnnoViewService.setCurrentPage(1);
    return "placeholder";
  }


}
