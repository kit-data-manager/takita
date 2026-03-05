package edu.kit.datamanager.takita.customization;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

/**
 * This controller allows to add project specific frontend concepts with specific templates
 * Add your new templates in an addons folder ('projectspecific' by default)  to classpath:/templates
 * The controller allows for client-side routers (such as React/Vue) by serving the template for any matching subpath
 */
@Controller
@RequestMapping("/addon")
public class CustomPageController {

    //TODO: Needs documentation
    @Value("${takita.templates.addons:projectspecific}")
    private String prefix;

    /**
     * All matches with a template name will be routed to the template. Matches may contain subpaths after the template
     * @param page template name
     * @return template in project specific folder
     */
    @GetMapping({"/{page}", "/{page}/**"})
    public String renderCustomPage(@PathVariable String page) {

        if (!page.matches("[a-zA-Z0-9_-]+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid page name");
        }

        return prefix + "/" + page;
    }
}