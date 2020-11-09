package edu.kit.scc.dem.tuhl.mainpage.search;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Controls the interaction with the user interface concerning the search term and provides the
 * api endpoint for those functionalities. Delegates the tasks to the corresponding business
 * logic in a ISearchService instance.
 */
@Controller
@RequestMapping("/search")
public class SearchController {
  
  private final ISearchService searchService;
  
  /**
   * Constructor for the FilterController to autowire required instances.
   *
   * @param searchService instance of the business logic for the search. Injected with Spring
   *                      dependency injection system indicated by @autowired annotation
   */
  @Autowired
  public SearchController(ISearchService searchService) {
    this.searchService = searchService;
  }

  /**
   * Sets the search term.
   *
   * @param searchTerm to set
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return String to indicate if it was success
   */
  @PostMapping
  @ResponseBody
  public String searchTerm(@RequestBody(required = false) String searchTerm, Model model) {
    searchService.setSearchTerm(searchTerm);
    return "OK";
  }
}
