package edu.kit.scc.dem.tuhl.dataaccess;


import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import edu.kit.scc.dem.tuhl.model.Annotation;

public class AnnotationConverterTest {
    
    @Mock
    public IAccessService mockedAccessService;
    
    @Mock
    public IRepositoryAccessService mockedRepositoryAccessService;
    
    @Mock
    public IAnnotationStoreAccessService mockedAnnotationStoreAccessService;  

    private AnnotationConverter annoConverter;
    private JSONObject testAnnoJson;

    @BeforeEach
    void init() {
        annoConverter = new AnnotationConverter(mockedAnnotationStoreAccessService, mockedRepositoryAccessService);       
        try {
            testAnnoJson = new JSONObject("{"+
                "\"@context\": \"http://www.w3.org/ns/anno.jsonld\","+
                "\"type\": \"Annotation\"" +
              "}");
        } catch (JSONException e) {
            // Auto-generated catch block
            e.printStackTrace();
        }
    }

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

    @Test
    void targetFromJson() throws JSONException {

        //One target (specific resource)
        JSONObject target1 = new JSONObject("{\"source\": \"http://samplerepo.edu/api/v1/dataresources/8d8f2094-e85e-4947-8dca-e0b53b5b520f/data/page100_Ig100.master.jpg\", \"type\": \"SpecificRessource\"}");
        testAnnoJson.put("target",target1);

        Annotation testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        testAnno = annoConverter.buildAnnotationFromJson(testAnnoJson);
        
        System.out.println();
        assertEquals("8d8f2094-e85e-4947-8dca-e0b53b5b520f", testAnno.getPageId(), "Error on extracting target resource id");
        assertEquals(null, testAnno.getSvgCode(), "Error on parsing SVG");
    }

}
