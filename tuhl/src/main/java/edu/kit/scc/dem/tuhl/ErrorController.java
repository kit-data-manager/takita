package edu.kit.scc.dem.tuhl;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.autoconfigure.web.servlet.error.BasicErrorController;
import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/error")
public class ErrorController extends BasicErrorController {

  /**
   * Create a new {@link BasicErrorController} instance.
   *
   * @param errorAttributes the error attributes
   * @param errorProperties configuration properties
   */
  public ErrorController(ErrorAttributes errorAttributes, ErrorProperties errorProperties) {
    super(errorAttributes, errorProperties);
  }

  /**
   * Handles the error by adding attributes to the model.
   *
   * @param request from which to get the error
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return mapping to error page
   */
  @GetMapping
  public String handleError(HttpServletRequest request, Model model) {
    model.addAttribute("errorMessage",
        request.getAttribute(RequestDispatcher.ERROR_MESSAGE));
    model.addAttribute("errorStatusCode",
        request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE));
    model.addAttribute("errorException",
        request.getAttribute(RequestDispatcher.ERROR_EXCEPTION));
    model.addAttribute("errorServletName",
        request.getAttribute(RequestDispatcher.ERROR_SERVLET_NAME));
    model.addAttribute("errorExceptionType",
        request.getAttribute(RequestDispatcher.ERROR_EXCEPTION_TYPE));
    model.addAttribute("errorRequestUri",
        request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI));
    return "error";
  }

  /**
   * Handles the error and displays the message.
   *
   * @param msg message to display
   * @param model the holder for model attributes, used to pass attributes back to the view
   * @return mapping to error page
   */
  @GetMapping("/{msg}")
  public String handleErrorWithMsg(@PathVariable("msg") String msg, Model model) {
    model.addAttribute("errorMessage", msg);
    return "error";
  }
}
