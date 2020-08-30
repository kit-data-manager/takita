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

  private static final String PLACEHOLDER = "placeholder";

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
   * @param model   the holder for model attributes, used to pass attributes back to the view
   * @return html file name to display pseudonym
   */
  @GetMapping("/{pseudonym}")
  @ResponseBody
  public String setPseudonym(@PathVariable("pseudonym") String pseudonym, Model model) {
    assistanceService.changeUser(pseudonym, model);
    return assistanceService.getLang();
  }

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

    return PLACEHOLDER;
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
    return PLACEHOLDER;
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
      return PLACEHOLDER;
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
    return PLACEHOLDER;
  }


  /**
   * Handles http request to save selected language of current User.
   *
   * @param lang selected language
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @GetMapping("/lang/{lang}")
  @ResponseBody
  public String setLanguage(@PathVariable("lang") String lang, Model model) {

    assistanceService.setLanguage(lang, model);
    return PLACEHOLDER;
  }

  /**
   * Handles Http request when Thumbnails are displayed manually, to save in User.
   *
   * @param row of which thumbnails are displayed
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @GetMapping("/addRow/{row}")
  @ResponseBody
  public String setRow(@PathVariable("row") String row, Model model) {
    assistanceService.addRow(row);
    return PLACEHOLDER;
  }

  /**
   * Handles Http request when Thumbnails are hidden manually, to save in User.
   *
   * @param row of which thumbnails are hidden
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return placeholder
   */
  @GetMapping("/removeRow/{row}")
  @ResponseBody
  public String removeRow(@PathVariable("row") String row, Model model) {
    assistanceService.removeRow(row);
    return PLACEHOLDER;
  }

}
