package edu.kit.scc.dem.tuhl.analysis;

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
   * Changes the currently displayed analysis.
   *
   * @param analysisId Identifier of the analysis that should be displayed
   * @return name of html file to display analysis tool
   */
  @RequestMapping("/**")
  public String analysisTool() {
    /*try {
      editorService.selectPage(pageId);
      model.addAttribute("currentPage", editorService.getCurrentPage());
      model.addAttribute("currentManuscript", editorService.getCurrentManuscript());
      model.addAttribute("currentAnnotationsJson", 
        getDisplayableAnnotations(editorService.getCurrentPage().getAnnotations()));
      assistanceService.updateModel(model);
      
    } catch (UnsupportedEncodingException | NoSuchIndexEntryException e) {
      return REDIRECT_ERROR + e.getMessage();
    }
    */
    return "analysis";
  }
}
