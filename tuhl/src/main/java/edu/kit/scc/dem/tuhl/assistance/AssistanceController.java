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
  public String setPseudonym(@PathVariable("pseudonym") String pseudonym, Model model) {
    assistanceService.changeUser(pseudonym, model);
    return assistanceService.getLang();
  }


  /**
   * Handles http get when the checkbox saveFilterConfig is checked.
   *
   * @return placeholder
   */
  /*
  @GetMapping("/safeFilterConfig")
  @ResponseBody
  public String saveFilterConfigSetting() {
    assistanceService.toggleSaveFilter();
    return "placeholder";
  }

   */

  /**
   * Handles http get when the checkbox saveTableConfig is checked.
   *
   * @return placeholder
   */
  /*
  @GetMapping("/saveTableConfigSetting")
  @ResponseBody
  public String saveTableConfigSetting(Model model) {
    assistanceService.toggleSaveTable(model);
    return "placeholder";
  }
  */

  /**
   * Handles http POST request to save table column configuration.
   *
   * @param columns table column config
   * @param model   the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @PostMapping("/saveTablecolumns")
  @ResponseBody
  public String saveTableConfig(@RequestBody String columns, Model model) {

    assistanceService.setTableConfig(columns, model);

    return "placeholder";
  }

  /**
   * Handles http POST request to save table sort configuration.
   *
   * @param sort  table sort config
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @PostMapping("/saveTablesort")
  @ResponseBody
  public String saveTableSort(@RequestBody String sort, Model model) {

    assistanceService.setTableSort(sort, model);
    return "placeholder";
  }

  /**
   * Handles http POST request to save table page configuration.
   *
   * @param pageInfo table page config
   * @param model    the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @PostMapping("/saveTablepage")
  @ResponseBody
  public String saveTablePage(@RequestBody String pageInfo, Model model) {

    try {
      JSONObject obj = new JSONObject(pageInfo);

      int pageSize = Integer.parseInt(obj.get("paginationSize").toString());

      int currentPage = Integer.parseInt(obj.get("paginationInitialPage").toString());


      assistanceService.getCurrentUser().setCurrentPage(currentPage);
      assistanceService.setTablePage(pageSize, model);
      return "placeholder";
    } catch (JSONException e) {
      model.addAttribute("errorMessage", e.getMessage());
      return "error";
    }

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

  /**
   * Handles http request to save selected language of current User.
   *
   * @return placeholder
   */
  @GetMapping("/lang/{lang}")
  @ResponseBody
  public String setLanguage(@PathVariable("lang") String lang, Model model) {

    assistanceService.setLanguage(lang, model);
    return "placeholder";
  }

}
