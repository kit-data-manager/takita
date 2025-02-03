package edu.kit.datamanager.takita.analysis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping("/analysis")
@Controller
public class AnalysisController {
  /**
   * Delegates to client-side app to display and interact with an analysis.
   * 
   * Client-side routing includes URLs of the pattern
   *  "/analysis/{analysisId}/propositions", or
   *  "/analysis/{analysisId}/openmapping"
   * 
   * @return name of html file to display analysis tool
   */
  @RequestMapping("/**")
  public String analysisTool() {
    return "analysis";
  }
}
