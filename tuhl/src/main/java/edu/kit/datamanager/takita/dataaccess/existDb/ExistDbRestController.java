package edu.kit.datamanager.takita.dataaccess.existDb;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;
import org.w3c.dom.DOMException;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.xpath.XPathExpressionException;
import java.io.IOException;

@Controller
@RequestMapping("/exist")
@ConditionalOnProperty(
        value = "exist.baseUrl",
        matchIfMissing = false)
public class ExistDbRestController {

    private final IExistDbAccessService existAccessService;

    @Autowired
    public ExistDbRestController(IExistDbAccessService existAccessService){
        this.existAccessService = existAccessService;
    }


    /**
     * Delegates the task to get the raw XML content of a page from an exist-db to IEditorStubService.
     *
     * @param documentId the id of the document (usually the id of the pageDo in the base-repo)
     * @param request to access the headers from the HTTP request
     * @param response to access the headers for the HTTP response
     * @return HTTP entity sent back, either ok for a success including the
     *    XML or 500 for an internal error
     */
    @RequestMapping(value = "/{documentId}", method = RequestMethod.GET, produces = "application/xml")
    @ResponseBody
    @ConditionalOnProperty(
            value = "exist.baseUrl",
            matchIfMissing = false)
    public ResponseEntity<String> getXMLDocument(@PathVariable("documentId") String documentId,
                                                 final WebRequest request, final HttpServletResponse response) {
        String rawXml;
        try {
            rawXml = existAccessService.getXMLDocument(documentId);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(500).body(e.getMessage());
        }
        return ResponseEntity.ok().body(rawXml);
    }

    /**
     * Delegates the task to get the raw XML fragment of a page from an exist-db to IEditorStubService.
     *
     * @param documentId the id of the document (usually the id of the pageDo in the base-repo)
     * @param xPath (encoded) identifies the document fragment
     * @param trimmed decides if the resolved xPath should have its content trimmed
     * according to the substring() function in the xPath.
     * - "true" will lead to text contents of elements to be trimmed according to the substring-function
     * - "false" will leave the text contents of elements untouched (ignoring the substring-function)
     * @param indented decides if the resulting xml-fragment should be indented by exist-db (true) or preserve the
     * indentation of the original document (false)
     * @param request to access the headers from the HTTP request
     * @param response to access the headers for the HTTP response
     * @return HTTP entity sent back, either ok for a success including the
     *    XML or 500 for an internal error
     */
    @RequestMapping(value = "/{documentId}/{xPath}/{trimmed}/{indented}", method = RequestMethod.GET, produces = "application/xml")
    @ResponseBody
    public ResponseEntity<String> getXMLDocumentFragment(@PathVariable("documentId") String documentId,
                                                         @PathVariable("xPath") String xPath, @PathVariable("trimmed") Boolean trimmed, @PathVariable("indented") Boolean indented,
                                                         final WebRequest request, final HttpServletResponse response) {
        String rawXml = null;
        try {
            rawXml = existAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(500).body(e.getMessage());
        } catch (IOException | TransformerException | ParserConfigurationException | SAXException |
                 XPathExpressionException | DOMException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
        return ResponseEntity.ok().body(rawXml);
    }
}
