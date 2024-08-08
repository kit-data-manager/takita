package edu.kit.scc.dem.tuhl.dataaccess;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.kit.scc.dem.tuhl.model.body.Body;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;

import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.TestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;


@ExtendWith(MockitoExtension.class)
public class AnnotationConverterTest {
    
    @Mock
    public IAccessService mockedAccessService;
    
    @Mock
    public IRepositoryAccessService mockedRepositoryAccessService;
    
    @Mock
    public IAnnotationStoreAccessService mockedAnnotationStoreAccessService;  

    private AnnotationConverter annoConverter;
    private JSONObject testAnnoJson;
    private JSONObject testCreator;

    @BeforeEach
    void init() {
        annoConverter = new AnnotationConverter(mockedAnnotationStoreAccessService, mockedRepositoryAccessService);
        try {
            testAnnoJson = new JSONObject("{"+
                "\"@context\": \"http://www.w3.org/ns/anno.jsonld\","+
                "\"type\": \"Annotation\"," +
                "\"id\": \"https://example.com/anno1\"" +
              "}");

            testCreator = new JSONObject();
            testCreator.put("name", "John Doe");
            testCreator.put("type", "Person");
        } catch (JSONException e) {
            // Auto-generated catch block
            e.printStackTrace();
        }
    }

    /**
     * Test for json anno to anno object with creators (Person and software)
     * Beware: design decisions pending, see comments in test
     * @throws JSONException ...
     */
    @Test
    void creatorsFromJson() throws JSONException {

        System.out.println(testAnnoJson.toString());

        JSONObject creator1 = new JSONObject("{\"name\": \"Creator1\", \"type\": \"Person\"}");
        JSONObject creator2 = new JSONObject("{\"name\": \"Creator2\", \"type\": \"Software\"}");
        testAnnoJson.put("creator",creator1);

        //One human creator is added
        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        assertEquals(1, testAnno.getCreators().size(), "Unexpected length of creator list");
        
        JSONArray creatorArray = new JSONArray();
        creatorArray.put(creator1);
        creatorArray.put(creator2);
        testAnnoJson.put("creator",creatorArray);

        //A list of both human and software creators are added
        testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);

        // TODO: right now software creators are not added to creator array, design decision needed
        assertEquals(1, testAnno.getCreators().size(), "Unexpected length of creator list");
        
        //TODO: type of creator is not preserved in the creator list
    }

    /**
     * Test for json anno to anno object with creator that has nickname only
     * @throws JSONException ...
     */
    @Test
    void nicknameFromJson() throws JSONException {
        JSONObject creator = new JSONObject();
        creator.put("nickname", "cage");
        creator.put("type", "Person");
        testAnnoJson.put("creator",creator);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        assertEquals(1, testAnno.getCreators().size(), "Unexpected length of creator list");
    }

    /**
     * Test for json anno to anno object with single creator
     * creator is string value only and starts with urn:uuid
     * This results in assumption that this is an algorithmic annotation.
     * TODO: check if this function is worth keeping
     * @throws JSONException ...
     */
    @Test
    void uuidCreatorFromJson() throws JSONException {
        testAnnoJson.put("creator","urn:uuid:tool");

        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        assertTrue(testAnno.getIsAlgorithmAnnotation());
    }

    @Test
    void basicAnnoPropertiesFromJson() throws JSONException {
        String motivationString = "describing";
        String uriString = "http://example.com";
        testAnnoJson.put("motivation", motivationString);
        testAnnoJson.put("via", uriString);
        testAnnoJson.put("canonical", uriString);
        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);

        assertEquals(motivationString, testAnno.getMotivation());
        assertEquals(uriString, testAnno.getVia());
        assertEquals(uriString, testAnno.getCanonical());
    }

    /**
     * Test for json anno to anno object with target(s)
     * @throws JSONException ...
     */
    @Test
    void targetsFromJson() throws JSONException {

        //One target (specific resource)
        JSONObject target1 = new JSONObject("{\"source\": \"http://samplerepo.edu/api/v1/dataresources/8d8f2094-e85e-4947-8dca-e0b53b5b520f/data/page100_Ig100.master.jpg\", \"type\": \"SpecificResource\"}");
        testAnnoJson.put("target",target1);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        //testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        
        System.out.println();
        assertEquals("8d8f2094-e85e-4947-8dca-e0b53b5b520f", testAnno.getPageId(), "Error on extracting target resource id");
        assertNull(testAnno.getTargets().get(0).getSelector(), "Error on parsing SVG");

        //Two targets
        //TODO: uncomment/complete once implemented
        /*
        JSONArray targetArray = new JSONArray();
        targetArray.put(target1);
        targetArray.put("http://samplerepo.edu/api/v1/dataresources/8d8f2094-e85e-4947-8dca-e0b53b5b520f/data/page100_Ig100.master.jpg");
        testAnnoJson.put("target", targetArray);

        testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        //assertEquals("8d8f2094-e85e-4947-8dca-e0b53b5b520f", testAnno.getPageId(), "Error on extracting target resource id");
        //assertEquals(null, testAnno.getSvgCode(), "Error on parsing SVG");
         */
    }

    /**
     * Test for json anno to anno object with multiple bodies (with and without tagging purpose)
     * @throws JSONException ...
     * @throws org.json.JSONException ...
     */
    @Test
    void bodiesFromJson() throws JSONException, org.json.JSONException {
        String idString = testAnnoJson.getString("id");
        //body without purpose tagging = text card
        JSONObject body1 = new JSONObject("""
                {
                    "type": "TextualBody",
                    "value": "Comment text",
                    "purpose": "some other purpose",
                    "format": "text/plain"
                  }""");
        //body with purpose tagging = tag
        JSONObject body2 = new JSONObject("""
                {
                    "type": "TextualBody",
                    "value": "This is a tag",
                    "purpose": "tagging"
                  }""");
        JSONArray bodyArray = new JSONArray();
        bodyArray.put(body1);
        bodyArray.put(body2);
        testAnnoJson.put("body", bodyArray);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        assertEquals(1, testAnno.getTextCards().size(), "Unexpected number of text cards");
        assertEquals(1, testAnno.getTags().size(), "Unexpected number of text cards");
        assertEquals("Comment text", testAnno.getTextCards().get(0).getValue(), "Unexpected body value after conversion");
        assertEquals(idString, testAnno.getTextCards().get(0).getAnnotationId());
        JSONAssert.assertEquals(body1.toString(), testAnno.getTextCards().get(0).getFullJson().toString(), JSONCompareMode.LENIENT);
        JSONAssert.assertEquals(body2.toString(), testAnno.getTags().get(0).getFullJson().toString(), JSONCompareMode.LENIENT);
    }

    /**
     * Test for json anno to anno object with single body
     * @throws JSONException ...
     * @throws org.json.JSONException ...
     */
    @Test
    void textbodyFromJson() throws JSONException, org.json.JSONException {
        String timestamp = "2018-02-09T18:45:26Z";
        //body without purpose tagging = text card
        JSONObject body = new JSONObject("""
                {
                    "type": "TextualBody",
                    "value": "Comment text",
                    "dc:subject": "treat me as subject",
                    "dc:title": "treat me as title"
                  }""");
        body.put("created", timestamp);
        body.put("modified", timestamp);
        body.put("creator", testCreator);
        testAnnoJson.put("body", body);
        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);

        Boolean createdComparison = TestUtils.compareTimestamps(timestamp, testAnno.getTextCards().get(0).getCreated().toString());
        Boolean modifiedComparison = TestUtils.compareTimestamps(timestamp, testAnno.getTextCards().get(0).getModified().toString());

        assertEquals("Comment text", testAnno.getTextCards().get(0).getValue(), "Unexpected body value after conversion");
        JSONAssert.assertEquals(body.toString(), testAnno.getTextCards().get(0).getFullJson().toString(), JSONCompareMode.LENIENT);
        assertEquals("treat me as subject", testAnno.getTextCards().get(0).getSubject(), "Unexpected body subject after conversion");
        assertEquals("treat me as title", testAnno.getTextCards().get(0).getTitle(), "Unexpected body title after conversion");
        assertEquals(true, createdComparison, "Expected timestamp equivalence (including zone) when comparing " + timestamp + " and " + testAnno.getTextCards().get(0).getCreated().toString());
        assertEquals(true, modifiedComparison, "Expected timestamp equivalence (including zone) when comparing " + timestamp + " and " + testAnno.getTextCards().get(0).getModified().toString());
        assertEquals(testCreator.get("name"), testAnno.getTextCards().get(0).getCreators().get(0));
    }

    @Test
    void externalBodyFromJson() throws JSONException {
        String uriString = "http://example.com";
        JSONObject body = new JSONObject();
        body.put("source", uriString);
        testAnnoJson.put("body", body);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        assertEquals(uriString, testAnno.getTextCards().get(0).getSource());
        assertNull(testAnno.getColor());
    }

    @Test
    void pageIdFromJson() throws JSONException {
        String uriString = "http://example.com/dataresources/1234/data/";
        JSONObject target = new JSONObject();
        target.put("id", uriString);
        testAnnoJson.put("target", target);
        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);

        assertEquals("1234", testAnno.getPageId());
    }

    /**
     * Test for json anno to anno object with selectors
     * Test currently only considers embedded svgselector. Extend test for more cases once implemented
     * @throws IOException ...
     * @throws JSONException ...
     */
    @Test
    void selectorsFromJson() throws IOException, JSONException {
        //Embedded SVG Selector
        String jsonString = TestUtils.readStringFromRelativePath("wadm_examples/correct/anno27.json");
        jsonString = jsonString.replaceAll("svg:svg", "svg"); //TODO: stop doing this once application has more robust svg handling
        JSONObject wadmAnnoJson = new JSONObject(jsonString);
        wadmAnnoJson.remove("body"); //application cannot handle body with string value
        Annotation testAnno = annoConverter.buildAnnotationFromJson(wadmAnnoJson);

        assertEquals("...", testAnno.getSvgCode().strip(), "Unexpected svg value after conversion");
    }

    /**
     * Test for handling of timestamps
     * Test checks for handling of zulu timestamps in various precisions.
     * Test only checks conversion equivalence -- preservation of precision is not checked / change in precision is expected
     * @throws JSONException ...
     */
    @Test
    void timestampsFromJson() throws JSONException {
        String legacyDateString = "2018-02-09T18:45:26Z";
        String currentDateString = "2024-07-25T08:55:08.000Z";

        testAnnoJson.put("created", legacyDateString);
        testAnnoJson.put("modified", currentDateString);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);

        Boolean createdComparison = TestUtils.compareTimestamps(legacyDateString, testAnno.getCreated().toString());
        Boolean modifiedComparison = TestUtils.compareTimestamps(currentDateString, testAnno.getModified().toString());

        assertEquals(true, createdComparison, "Expected timestamp equivalence (including zone) when comparing " + legacyDateString + " and " + testAnno.getCreated().toString());
        assertEquals(true, modifiedComparison, "Expected timestamp equivalence (including zone) when comparing " + currentDateString + " and " + testAnno.getModified().toString());
    }

    @Test
    void jsonFromTag() throws JSONException {
        String uriString = "http://example.com";
        Body body = new Tag(uriString);

        body.setSource(uriString);
        body.setSubject("subj");
        JSONObject jsonBody = annoConverter.bodyToJson(body);

        assertEquals(jsonBody.get("source"), body.getSource());
        assertEquals(jsonBody.get("dc:subject"), body.getSubject());
    }

    @Test
    void buildJsonFromAnnotation() throws IOException, JSONException, InterruptedException, org.json.JSONException {
        String pageID = "cb679599-7191-422c-923b-89c31c045f1d";
        JSONObject jsonAnno = new JSONObject(TestUtils.readStringFromRelativePath("annotationStoreAccessService/getAnnotationById/annotation1.json"));
        Mockito.when(mockedAnnotationStoreAccessService.getAnnotationById(Mockito.any()))
                .thenReturn(jsonAnno);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(jsonAnno);
        JSONObject jsonOutput = annoConverter.buildJsonFromAnnotation(testAnno, pageID);

        JSONAssert.assertEquals(jsonAnno.toString(), jsonOutput.toString(), JSONCompareMode.LENIENT);
    }

    @Test
    void buildJsonFromChangedAnnotation() throws org.json.JSONException, JSONException, IOException, InterruptedException {
        String pageID = "cb679599-7191-422c-923b-89c31c045f1d";
        JSONObject jsonAnno = new JSONObject(TestUtils.readStringFromRelativePath("annotationStoreAccessService/getAnnotationById/annotation1.json"));
        JSONObject jsonAnnoChanged = new JSONObject(TestUtils.readStringFromRelativePath("annotationStoreAccessService/getAnnotationById/annotation1.json"));
        jsonAnnoChanged.remove("creator");
        Mockito.when(mockedAnnotationStoreAccessService.getAnnotationById(Mockito.any()))
                .thenReturn(jsonAnno);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(jsonAnnoChanged);
        JSONObject jsonOutput = annoConverter.buildJsonFromAnnotation(testAnno, pageID);

        JSONAssert.assertEquals(jsonAnno.toString(), jsonOutput.toString(), JSONCompareMode.STRICT);
    }

    @Test
    void buildJsonFromSimpleAnnotation() throws JSONException, IOException, InterruptedException, org.json.JSONException {
        String uriString = "http://example.com";
        String targetString = "http://example.com/dataresources/1234/data/";
        JSONObject body = new JSONObject();
        body.put("source", uriString);
        testAnnoJson.put("body", body);
        JSONObject target = new JSONObject();
        target.put("source", targetString);
        testAnnoJson.put("target", target);

        Mockito.when(mockedAnnotationStoreAccessService.getAnnotationById(Mockito.any()))
                .thenReturn(testAnnoJson);
        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        JSONObject jsonOutput = annoConverter.buildJsonFromAnnotation(testAnno, "1234");
        JSONAssert.assertEquals(testAnnoJson.toString(), jsonOutput.toString(), JSONCompareMode.STRICT);
    }

    /**
     * This test is informative only at the moment and does not count towards coverage nor does it provide indepth checking of content
     * It iterates over all WAMD examples and checks if the application is able to read them in via annotation converter.
     * On fail, the source of error is printed.
     * @throws IOException ...
     */
    @Test
    void testWADMExamples() throws IOException {

        int numExamples = 43;
        for (int i = 1; i <= numExamples; i++) {
            String currAnnoString = TestUtils.readStringFromRelativePath("wadm_examples/correct/anno" + i + ".json");
            try {
                Annotation testAnno = annoConverter.buildAnnotationFromJson(new JSONObject(currAnnoString));

            } catch (JSONException e) {
                System.out.println("Error on parsing annotation" + i);
                e.printStackTrace();
            }
        }
    }

}
