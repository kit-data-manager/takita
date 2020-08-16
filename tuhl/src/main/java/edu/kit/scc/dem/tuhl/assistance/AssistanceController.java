package edu.kit.scc.dem.tuhl.assistance;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Controller to handle help menu requests and User data requests.
 */
@Controller
@RequestMapping("/assistance")
public class AssistanceController {

  private final IAssistanceService assistanceService;

  /**
   * Constructor for the Assistance Controller to autowire required instances.
   *
   * @param assistanceService instance of the logic for assistance package.
   *                          Injected with Springs dependency injection system
   *                          indicated by @autowired annotation.
   */
  @Autowired
  public AssistanceController(IAssistanceService assistanceService) {
    this.assistanceService = assistanceService;
  }

  /**
   * Handles http request to view help menu.
   *
   * @return html file name of help display
   */
  @GetMapping("/help")
  public String help() {
    return "help";
  }

  /**
   * Handles http post when a pseudonym is entered.
   *
   * @param pseudonym which is entered
   * @return html file name to display pseudonym
   */
  @GetMapping("/{pseudonym}")
  @ResponseBody
  public String setPseudonym(@PathVariable("pseudonym") String pseudonym) {
    assistanceService.changeUser(pseudonym);
    return "initiateStuff";
  }

  /**
   * Handles http get when the checkbox saveFilterConfig is checked.
   *
   * @return placeholder
   */
  @GetMapping("/safeFilterConfig")
  @ResponseBody
  public String saveFilterConfigSetting(Model model) {
    assistanceService.toggleSaveFilter();
    return "placeholder";
  }

  /**
   * Handles http get when the checkbox saveTableConfig is checked.
   *
   * @return placeholder
   */
  @GetMapping("/saveTableConfigSetting")
  @ResponseBody
  public String saveTableConfigSetting(Model model) {
    assistanceService.toggleSaveTable(model);
    return "placeholder";
  }

  /**
   * Handles http POST request to save table configuration.
   *
   * @param columns table config
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @PostMapping("/saveTablecolumns")
  @ResponseBody
  public String saveTableConfig(@RequestBody String columns, Model model) {
    System.out.println(columns);

    assistanceService.setTableConfig(columns, model);

    return "placeholder";
  }

  /**
   * Handles http POST request to save table configuration.
   *
   * @param columns table config
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @PostMapping("/saveTablesort")
  @ResponseBody
  public String saveTableSort(@RequestBody String sort, Model model) {
    System.out.println(sort);

    //assistanceService.setTableConfig(columns, model);

    return "placeholder";
  }

  @PostMapping("/saveTablepage")
  @ResponseBody
  public String saveTablePage(@RequestBody String pageInfo, Model model) {
    System.out.println(pageInfo);
    JSONObject obj = null;
    try {
      obj = new JSONObject(pageInfo);

    int pageSize = Integer.parseInt(obj.get("paginationSize").toString());
    System.out.println(pageSize);
    int currentPage = Integer.parseInt(obj.get("paginationInitialPage").toString());
    System.out.println(currentPage);

    assistanceService.getCurrentUser().setCurrentPage(currentPage);
    assistanceService.setTablePage(pageSize, model);
  } catch (JSONException e) {
    e.printStackTrace();
  }
    return "placeholder";
  }



  /**
   * Handles http request when showThumbnails checkbox is toggled.
   *
   * @return placeholder
   */
  @GetMapping("/toggleCheckThumbs")
  @ResponseBody
  public String toggleCheckThumbs() {
    assistanceService.toggleCheckThumbs();
    return "placeholder";
  }

}
