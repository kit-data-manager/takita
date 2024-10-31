package edu.kit.datamanager.takita.dataaccess;

import edu.kit.datamanager.takita.TestUtils;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.page.ResourceType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static edu.kit.datamanager.takita.TestUtils.readStringFromRelativePath;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class ManuscriptConverterTest {

    private static final Logger logger = LoggerFactory.getLogger(ManuscriptConverter.class);
    @Mock
    private IRepositoryAccessService mockedRepositoryAccessService;
    @Mock
    private IAnnotationStoreAccessService mockedAnnotationStoreAccessService;
    private ManuscriptConverter manuscriptConverter;

    private JSONObject jsonManuscript;
    private List<JSONObject> jsonPages;

    @BeforeEach
    void init() throws IOException, JSONException, InterruptedException {
        jsonPages = new ArrayList<>();
        manuscriptConverter = new ManuscriptConverter(mockedRepositoryAccessService, mockedAnnotationStoreAccessService);
        jsonManuscript = new JSONObject(readStringFromRelativePath("./accessService/getManuscripts/manuscript1.json"));
        String manuscriptID = jsonManuscript.getString("id");
        JSONArray pagesJSON = new JSONArray(readStringFromRelativePath("./accessService/getManuscripts/pageAssignment1.json"));

        JSONObject page1 = new JSONObject(readStringFromRelativePath("./accessService/getManuscripts/page1.json"));
        JSONObject page2 = new JSONObject(readStringFromRelativePath("./accessService/getManuscripts/page2.json"));

        jsonPages.add(page1);
        jsonPages.add(page2);

        Mockito.lenient().when(mockedRepositoryAccessService.getPageAssignmentForManuscriptId(manuscriptID)).thenReturn(pagesJSON);
        Mockito.lenient().when(mockedRepositoryAccessService.getPageById(page1.getString("id"))).thenReturn(page1);
        Mockito.lenient().when(mockedRepositoryAccessService.getPageById(page2.getString("id"))).thenReturn(page2);
    }

    @Test
    void manuscriptFromJsonWithoutAnnosTest() throws JSONException, IOException, InterruptedException {

        Manuscript manuscript = manuscriptConverter.buildManuscriptFromJson(jsonManuscript, null);

        assertEquals(2, manuscript.getNoPages());
        String createdString = jsonManuscript.getJSONArray("dates").getJSONObject(0).getString("value");
        Boolean createdComparison = TestUtils.compareTimestamps(createdString, manuscript.getCreated().toString());
        assertEquals(true, createdComparison, "Expected timestamp equivalence (including zone) when comparing " + createdString + " and " + manuscript.getCreated().toString());
    }

    @Test
    void manuscriptFromJsonWithNullAnnosTest() throws JSONException, IOException, InterruptedException {
        JSONObject page1 = jsonPages.get(0);
        JSONObject page2 = jsonPages.get(1);

        HashMap<String, List<Annotation>> annoMap = new HashMap<>();
        annoMap.put(page1.getString("id"), new ArrayList<>());
        annoMap.put(page2.getString("id"), new ArrayList<>());

        Manuscript manuscript = manuscriptConverter.buildManuscriptFromJson(jsonManuscript, annoMap);

        assertEquals(2, manuscript.getNoPages());
        String createdString = jsonManuscript.getJSONArray("dates").getJSONObject(0).getString("value");
        Boolean createdComparison = TestUtils.compareTimestamps(createdString, manuscript.getCreated().toString());
        assertEquals(true, createdComparison, "Expected timestamp equivalence (including zone) when comparing " + createdString + " and " + manuscript.getCreated().toString());
    }

    @Test
    void manuscriptFromJsonWithOneAnnoTest() throws IOException, JSONException, InterruptedException {
        JSONObject page1 = jsonPages.get(0);
        JSONObject page2 = jsonPages.get(1);

        HashMap<String, List<Annotation>> annoMap = new HashMap<>();
        List<Annotation> annoList = new ArrayList<>();
        Annotation expectedAnnotation1 = new Annotation();
        expectedAnnotation1.setId("http://wap/testContainer/1234");
        expectedAnnotation1.setCreated(Instant.parse("2019-07-04T06:57:35.961Z"));
        expectedAnnotation1.setPageId(page1.getString("id"));
        expectedAnnotation1.setSvgCode("");
        expectedAnnotation1.setIsAlgorithmAnnotation(true);
        annoList.add(expectedAnnotation1);
        annoMap.put(page1.getString("id"), annoList);
        annoMap.put(page2.getString("id"), new ArrayList<>());

        Manuscript manuscript = manuscriptConverter.buildManuscriptFromJson(jsonManuscript, annoMap);

        assertEquals(2, manuscript.getNoPages());
        String createdString = jsonManuscript.getJSONArray("dates").getJSONObject(0).getString("value");
        Boolean createdComparison = TestUtils.compareTimestamps(createdString, manuscript.getCreated().toString());
        assertEquals(true, createdComparison, "Expected timestamp equivalence (including zone) when comparing " + createdString + " and " + manuscript.getCreated().toString());
        assertTrue(manuscript.hasAlgorithmAnnotations()); //might not be the most useful test. But it is the only direct check for annotations on the manuscript
        List<Annotation> actualAnnotations = manuscript.getPages().get(0).getAnnotations();
        assertEquals(expectedAnnotation1, actualAnnotations.get(0));
        assertEquals(1, actualAnnotations.size());
    }

    @Test
    void manuscriptFromJsonTextType() throws JSONException, IOException, InterruptedException {
        JSONObject page1 = jsonPages.get(0);
        page1.getJSONObject("resourceType").put("typeGeneral", "TEXT");

        Manuscript manuscript = manuscriptConverter.buildManuscriptFromJson(jsonManuscript, null);

        assertEquals(2, manuscript.getNoPages());
        String createdString = jsonManuscript.getJSONArray("dates").getJSONObject(0).getString("value");
        Boolean createdComparison = TestUtils.compareTimestamps(createdString, manuscript.getCreated().toString());
        assertEquals(true, createdComparison, "Expected timestamp equivalence (including zone) when comparing " + createdString + " and " + manuscript.getCreated().toString());
        assertEquals(ResourceType.TEXT, manuscript.getPages().get(0).getResourceType());
    }

    @Test
    void manuscriptFromInvalidType() throws JSONException {
        JSONObject page1 = jsonPages.get(0);
        page1.getJSONObject("resourceType").put("typeGeneral", "Some unknown type");

        //This exception is never caught and might not be proper handling of this problem
        assertThrows(IllegalStateException.class, () -> manuscriptConverter.buildManuscriptFromJson(jsonManuscript, null));
    }

}
