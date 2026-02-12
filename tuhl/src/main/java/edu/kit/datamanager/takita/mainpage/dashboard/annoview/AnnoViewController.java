package edu.kit.datamanager.takita.mainpage.dashboard.annoview;

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

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.dataaccess.IAccessService;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
import edu.kit.datamanager.takita.mainpage.IMainPageService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;

/**
 * Implementation of ContentViewController. Handles http requests regarding the table view.
 */
@Controller
@RequestMapping("/annoview")
public class AnnoViewController {

  private final AnnoViewService AnnoViewService;
  private final IMainPageService mainPageService;

  /**
   * Constructor for the AnnoViewController to autowire required instances.
   *
   * @param AnnoViewService instance of the business logic for the table view. Injected with
   *                         Springs dependency injection system indicated by @autowired annotation.
   * @param mainPageService instance of the business logic for the main page. Injected with
   *                        Springs dependency injection system indicated by @autowired annotation.
   */
  @Autowired
  public AnnoViewController(AnnoViewService AnnoViewService, IMainPageService mainPageService) {
    this.AnnoViewService = AnnoViewService;
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
    return "table_view_anno.html :: annoView";
  }
  
  /**
   * Handles request to get the data for the table.
   *
   * @param model  the holder for model attributes, used to pass attributes back to the view
   * @return the sorted data in json format
   */
  @RequestMapping(value = "/data")
  @ResponseBody
  public String getData(Model model) {
    AnnoViewService.search();
    mainPageService.update(model);
    try {
      JSONArray data = AnnoViewService.getData();
      JSONObject newData = new JSONObject();

      newData.put("data", data);
      return data.toString();
    } catch (JSONException e) {
      model.addAttribute("errorMessage", e.getMessage());
      return "error";
    }

  }


}
