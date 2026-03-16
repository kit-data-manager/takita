package edu.kit.datamanager.takita.model.target;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;
import org.junit.jupiter.api.Test;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SVGSelectorTest {

    private String svgSelectorName = AnnotationStoreStrings.SVG_SELECTOR.getName();
    private String svgCode = "<svg:svg>...</svg:svg>";

    /**
     * testing getters and setters. This also tests the constructor.
     */
    @Test
    public void testGettersAndSetters(){

        SVGSelector selector = new SVGSelector(svgCode);

        assertEquals(svgCode, selector.getValue(), "Getting the svgCode as String after constructor call");

        String newSvgCode = "<svg:svg>new</svg:svg>";
        selector.setValue(newSvgCode);
        assertEquals(newSvgCode, selector.getValue(), "Getting the svgCode as String after setting it manually.");

        assertEquals(svgSelectorName, selector.getType(), "Getting the type of the selector.");
    }

    /**
     * testing the serialization of a SVGSelector to WADM.
     */
    @Test
    public void testWADMSerialization() {
        try {
            SVGSelector selector = new SVGSelector(svgCode);

            String wadmString = "<svg xmlns=\"http://www.w3.org/2000/svg\">...</svg>";
            JSONObject expected = new JSONObject(String.format("{'type': '%s', 'value': '%s'}",
                    svgSelectorName, wadmString));
            assertEquals(expected.toString(), selector.getWADMSerialization().toString(),
                    "Serializing the selector according to WADM.");

            // test if the svgCode get properly wrapped in an svg-element, if the element is missing
            String svgCodeNew = "new";
            String wadmStringNew = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + svgCodeNew + "</svg>";
            selector.setValue(svgCodeNew);
            JSONObject expectedNew = new JSONObject(String.format("{'type': '%s', 'value': '%s'}",
                    svgSelectorName, wadmStringNew));
            assertEquals(expectedNew.toString(), selector.getWADMSerialization().toString(),
                    "Serializing the selector according to WADM when no wrapping svg-element is present for the svgCode.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

    }

    /**
     * testing the conversion of a SVGSelector to a String.
     */
    @Test
    public void testToString() {
        SVGSelector selector = new SVGSelector(svgCode);

        assertEquals(svgCode, selector.toString(), "Getting String representation of selector.");
    }
}
