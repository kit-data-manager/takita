package edu.kit.datamanager.takita.model.target;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;
import org.junit.jupiter.api.Test;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class TextQuoteSelectorTest {

    private String textQuoteSelectorName = AnnotationStoreStrings.TEXTQUOTE_SELECTOR.getName();
    private String exact = "exact";
    private String prefix = "prefix";
    private String suffix = "suffix";

    /**
     * testing getters and setters. This also tests the constructor.
     */
    @Test
    public void testGettersAndSetters(){

        TextQuoteSelector selector = new TextQuoteSelector(exact);
        
        assertEquals(exact, selector.getExact(), "Getting the exact String after constructor call");

        String newExact = "new_exact";
        selector.setExact(newExact);
        assertEquals(newExact, selector.getExact(), "Getting the exact String after setting it manually.");

        selector.setPrefix(prefix);
        assertEquals(prefix, selector.getPrefix(), "Getting the prefix String after setting it manually.");

        selector.setSuffix(suffix);
        assertEquals(suffix, selector.getSuffix(), "Getting the suffix String after setting it manually.");

        assertEquals(textQuoteSelectorName, selector.getType(), "Getting the type of the selector.");
    }

    /**
     * testing the serialization of a TextQuoteSelector to WADM.
     */
    @Test
    public void testWADMSerialization() {
        try {
            TextQuoteSelector selector = new TextQuoteSelector(exact);

            JSONObject expected = new JSONObject(String.format("{'type': '%s', 'exact': '%s'}",
                    textQuoteSelectorName, exact));
            assertEquals(expected.toString(), selector.getWADMSerialization().toString(),
                    "Serializing the selector according to WADM.");

            selector.setPrefix(prefix);
            JSONObject expected2 = new JSONObject(String.format("{'type': '%s', 'exact': '%s', 'prefix':'%s'}",
                    textQuoteSelectorName, exact, prefix));
            assertEquals(expected2.toString(), selector.getWADMSerialization().toString(),
                    "Serializing the selector with prefix according to WADM.");

            selector.setSuffix(suffix);
            JSONObject expected3 = new JSONObject(String.format("{'type': '%s', 'exact': '%s', 'prefix':'%s', 'suffix':'%s'}",
                    textQuoteSelectorName, exact, prefix, suffix));
            assertEquals(expected3.toString(), selector.getWADMSerialization().toString(),
                    "Serializing the selector with prefix and suffix according to WADM.");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

    }

    /**
     * testing the conversion of a TextQuoteSelector to a String.
     */
    @Test
    public void testToString() {
        TextQuoteSelector selector = new TextQuoteSelector(exact);

        assertEquals(exact, selector.toString(), "Getting String representation of selector.");

        selector.setPrefix(prefix);
        assertEquals(exact + " |prefix: " + prefix, selector.toString(),
                "Getting String representation of selector with prefix.");

        selector.setSuffix(suffix);
        assertEquals(exact + " |prefix: " + prefix + " |suffix: " + suffix, selector.toString(),
                "Getting String representation of selector with prefix and suffix.");
    }
}
