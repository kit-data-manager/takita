package edu.kit.scc.dem.tuhl.thesaurus;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

/**
 * Provides endpoints to query a configured IThesaurusService.
 */
@Controller
@RequestMapping("/thesaurus_rest")
public class ThesaurusRestController {

    @Autowired
    @Qualifier("skosmos")
    private final IThesaurusService thesaurusService;

    /**
     * Constructor for ThesaurusDataController, initializes service to access a thesaurus.
     *
     * @param thesaurusService instance of IThesaurusService
     */
    public ThesaurusRestController(IThesaurusService thesaurusService) {
        this.thesaurusService = thesaurusService;
    }

    @RequestMapping(value = "/concepts/label/{term}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity searchByLabel(@PathVariable("term") final String term, final WebRequest request, final HttpServletResponse response) {
        JSONObject conceptJson;
        try {
            conceptJson = thesaurusService.search(decodeURL(term));
        } catch (IOException | InterruptedException | JSONException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
        return ResponseEntity.ok().body(conceptJson);
    }

    @RequestMapping(value = "/concepts/labelexact/{term}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity searchByLabelExact(@PathVariable("term") final String term, final WebRequest request, final HttpServletResponse response) {
        JSONObject conceptJson;
        try {
            conceptJson = thesaurusService.searchExact(decodeURL(term));
        } catch (IOException | InterruptedException | JSONException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
        return ResponseEntity.ok().body(conceptJson);
    }


    private String decodeURL(String url) throws UnsupportedEncodingException {
        String decoded = URLDecoder.decode(url, StandardCharsets.UTF_8.toString());
        if (!url.equals(decoded)) {
            decoded = decodeURL(decoded);
        } 
        return decoded;
    }
}