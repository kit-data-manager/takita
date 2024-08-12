package edu.kit.scc.dem.tuhl.mainpage.dashboard.annodash;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;

/**
 * Implementation of ContentViewController. Handles http requests regarding the table view.
 */
@Controller
@RequestMapping("/annodash")
public class AnnoDashController {

	  private final IMainPageService mainPageService;

	  /**
	   * Constructor for the TableViewController to autowire required instances.
	   * @param mainPageService instance of the business logic for the main page. Injected with
	   *                        Springs dependency injection system indicated by @autowired annotation.
	   */
	  @Autowired
	  public AnnoDashController(IMainPageService mainPageService) {
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
	    return "dashboard_anno.html :: annoDash";
	  }
}
