package edu.kit.datamanager.takita.model.target;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;
import org.junit.jupiter.api.Test;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class XPathSelectorTest {

    private String xPathSelectorName = AnnotationStoreStrings.XPATH_SELECTOR.getName();
    private String xPath = "id(\"w.1\")";

    /**
     * testing getters and setters. This also tests the constructor.
     */
    @Test
    public void testGettersAndSetters(){

        XPathSelector selector = new XPathSelector(xPath);

        assertEquals(xPath, selector.getValue(), "Getting the xPath as String after constructor call");

        String newSvgCode = "id('w.2')";
        selector.setValue(newSvgCode);
        assertEquals(newSvgCode, selector.getValue(), "Getting the xPath as String after setting it manually.");

        assertEquals(xPathSelectorName, selector.getType(), "Getting the type of the selector.");
    }

    /**
     * testing the serialization of an XPathSelector to WADM.
     */
    @Test
    public void testWADMSerialization() {
        try {
            XPathSelector selector = new XPathSelector(xPath);

            JSONObject expected = new JSONObject(String.format("{'type': '%s', 'value': '%s'}",
                    xPathSelectorName, xPath));
            assertEquals(expected.toString(), selector.getWADMSerialization().toString(),
                    "Serializing the selector according to WADM.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

    }

    /**
     * testing the conversion of an XPathSelector to a String.
     */
    @Test
    public void testToString() {
        XPathSelector selector = new XPathSelector(xPath);

        assertEquals(xPath, selector.toString(), "Getting String representation of selector.");
    }
}
