package edu.kit.datamanager.takita.mainpage.dashboard.annodash;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreAccessService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import edu.kit.datamanager.takita.mainpage.IMainPageService;
import org.springframework.web.context.request.WebRequest;

import java.io.IOException;
import java.util.Base64;

/**
 * Implementation of ContentViewController. Handles http requests regarding the table view.
 */
@Controller
@RequestMapping("/annodash")
public class AnnoDashController {

	  private final IMainPageService mainPageService;
	  private final AnnotationStoreAccessService annotationStoreAccessService;

	  /**
	   * Constructor for the TableViewController to autowire required instances.
	   * @param mainPageService instance of the business logic for the main page. Injected with
	   *                        Springs dependency injection system indicated by @autowired annotation.
	   */
	  @Autowired
	  public AnnoDashController(IMainPageService mainPageService, AnnotationStoreAccessService annotationStoreAccessService) {
	    this.mainPageService = mainPageService;
		this.annotationStoreAccessService = annotationStoreAccessService;
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

	/**
	 * generic endpoint to process SPARQL queries. The query will be processed by AnnotationStoreAccessService.
	 *
	 * @param query Base64 encoded String containing the SPARQL query. This is the body of the request
	 *              sent to this endpoint
	 * @param request to access the headers from the HTTP request
	 * @param response to access the headers for the HTTP response
	 * @return results of the SPARQL query as a JSONString
	 */
	@RequestMapping(value = "/data", method = RequestMethod.POST,  produces = "application/json")
	@ResponseBody
	public ResponseEntity getQueryResult(@RequestBody String query, final WebRequest request, final HttpServletResponse response) {
		String result;
		try {
			String decodedQuery = new String(Base64.getDecoder().decode(query));
			result = annotationStoreAccessService.postQuery(decodedQuery);
		} catch (IOException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			return ResponseEntity.status(500).body(e.getMessage());
		}
		return ResponseEntity.ok().body(result);
	}
}
