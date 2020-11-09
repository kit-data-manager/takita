package edu.kit.scc.dem.tuhl.mainpage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


/**
 * Controls the interaction with the user interface concerning the main page and provides the api
 * endpoints for those functionalities. Delegates the tasks to the corresponding business logic.
 */
@Controller
public class MainPageController {
  private final IMainPageService mainPageService;

  @Autowired
  public MainPageController(IMainPageService mainPageService) {
    this.mainPageService = mainPageService;
  }


  /**
   * Delegates the task to initialize the possible filters and to show the dashboard
   * related content.
   *
   * @param model the holder for model attributes. Used to pass attributes back to the view
   * @return the name of the html file to display
   */
  @GetMapping("/")
  public String init(Model model) {
    mainPageService.update(model);
    return "main_page";
  }

}
