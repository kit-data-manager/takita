package edu.kit.datamanager.takita.model.target;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;
import netscape.javascript.JSException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class TargetTest {

    private String linkToResource = "https://example.org";
    private String svgSelectorName = AnnotationStoreStrings.SVG_SELECTOR.getName();
    private String svgCode = "<svg:svg>...</svg:svg>";
    private String textQuoteSelectorName = AnnotationStoreStrings.TEXTQUOTE_SELECTOR.getName();
    private String exact = "exact";
    private String prefix = "prefix";
    private String suffix = "suffix";
    private String xPathSelectorName = AnnotationStoreStrings.XPATH_SELECTOR.getName();
    private String xPath = "id(\"w.1\")";

    // constructor tests.The empty constructor is tested together with the getters and setters
    /**
     * test the constructor of Target when called with only the linkToResource.
     */
    @Test
    public void testConstructorLinkToResource(){
        Target target = new Target(linkToResource);
        assertEquals(linkToResource, target.getLinkToResource(), "Getting the link to resource after setting it via the constructor.");
    }

    /**
     * test the constructor of Target when called with null as both parameters, which will create a Target
     * targeting the whole page (no selector).
     */
    @Test
    public void testConstructorPage(){
        try {
            Target target2 = new Target(null, null);
            assertEquals("PAGE", target2.getType(), "Getting the type of a target after calling constructor with null.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * test the constructor of Target when called with a XPath selector.
     */
    @Test
    public void testConstructorXPath(){
        try {
            JSONObject selectorJSON3 = new JSONObject(String.format("{'type': '%s', 'value': '%s'}",
                    xPathSelectorName, xPath));
            Target target3 = new Target(linkToResource, selectorJSON3);
            assertEquals("TEXT", target3.getType(), "Getting the type of a target after calling constructor with a link to resource and a selector JSON.");
            assertEquals(linkToResource, target3.getLinkToResource(), "Getting the link to resource after setting it via the constructor.");
            XPathSelector xPathSelector = (XPathSelector) target3.getSelector();
            assertEquals(xPath, xPathSelector.getValue(), "Getting the value of the selector after setting it via the constructor.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * test the constructor of Target when called with a SVG selector.
     */
    @Test
    public void testConstructorSVG(){
        try {
            JSONObject selectorJSON4 = new JSONObject(String.format("{'type': '%s', 'value': '%s'}",
                    svgSelectorName, svgCode));
            Target target4 = new Target(linkToResource, selectorJSON4);
            assertEquals("IMAGE", target4.getType(), "Getting the type of a target after calling constructor with a link to resource and a selector JSON.");
            assertEquals(linkToResource, target4.getLinkToResource(), "Getting the link to resource after setting it via the constructor.");
            SVGSelector svgSelector = (SVGSelector) target4.getSelector();
            assertEquals(svgCode, svgSelector.getValue(), "Getting the value of the selector after setting it via the constructor.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * test the constructor of Target when called with a TextQuote selector.
     */
    @Test
    public void testConstructorTextQuote(){
        try {
            JSONObject selectorJSON5 = new JSONObject(String.format("{'type': '%s', 'exact': '%s', 'prefix': '%s', 'suffix': '%s'}",
                    textQuoteSelectorName, exact, prefix, suffix));
            Target target5 = new Target(linkToResource, selectorJSON5);
            assertEquals("TEXT", target5.getType(), "Getting the type of a target after calling constructor with a link to resource and a selector JSON.");
            assertEquals(linkToResource, target5.getLinkToResource(), "Getting the link to resource after setting it via the constructor.");
            TextQuoteSelector textQuoteSelector = (TextQuoteSelector) target5.getSelector();
            assertEquals(exact, textQuoteSelector.getExact(), "Getting the exact of the selector after setting it via the constructor.");
            assertEquals(prefix, textQuoteSelector.getPrefix(), "Getting the prefix of the selector after setting it via the constructor.");
            assertEquals(suffix, textQuoteSelector.getSuffix(), "Getting the suffix of the selector after setting it via the constructor.");

            JSONObject selectorJSON6 = new JSONObject(String.format("{'type': '%s', 'exact': '%s'}",
                    textQuoteSelectorName, exact));
            Target target6 = new Target(linkToResource, selectorJSON6);
            assertEquals("TEXT", target6.getType(), "Getting the type of a target after calling constructor with a link to resource and a selector JSON.");
            assertEquals(linkToResource, target6.getLinkToResource(), "Getting the link to resource after setting it via the constructor.");
            TextQuoteSelector textQuoteSelector2 = (TextQuoteSelector) target6.getSelector();
            assertEquals(exact, textQuoteSelector2.getExact(), "Getting the exact of the selector after setting it via the constructor.");
            assertNull(textQuoteSelector2.getPrefix(), "Getting the prefix of the selector after setting it via the constructor.");
            assertNull(textQuoteSelector2.getSuffix(), "Getting the suffix of the selector after setting it via the constructor.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

    }

    /**
     * testing getters and setters. Call the parameterless constructor first, then set and get all properties.
     */
    @Test
    public void testGettersAndSetters(){

        XPathSelector selector = new XPathSelector(xPath);
        Target target = new Target();
        target.setType("TEXT");
        target.setLinkToResource(linkToResource);
        target.setSelector(selector);

        assertEquals("TEXT", target.getType(), "Getting the type String after setting it manually.");
        assertEquals(linkToResource, target.getLinkToResource(), "Getting the link to resource after setting it manually.");
        assertEquals(selector, target.getSelector(), "Getting the selector after setting it manually.");
    }

    /**
     * testing the serialization of a Target to WADM.
     */
    @Test
    public void testWADMSerialization() {
        try {
            JSONObject selectorJson = new JSONObject(String.format("{'type': '%s', 'exact': '%s'}",
                    textQuoteSelectorName, exact));

            Target target = new Target(linkToResource, selectorJson);
            JSONObject expected = new JSONObject(String.format("{'type': '%s', 'source': '%s', 'selector': {'type': '%s', 'exact': '%s'}}",
                    AnnotationStoreStrings.SPECIFIC_RESOURCE.getName(), linkToResource, textQuoteSelectorName, exact));
            assertEquals(expected.toString(), target.getWADMSerialization().toString(), "Getting the WADM serialization.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

}
