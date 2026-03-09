package edu.kit.datamanager.takita.mainpage.dashboard.annoView;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;
import edu.kit.datamanager.takita.mainpage.dashboard.annoview.AnnoViewService;
import edu.kit.datamanager.takita.mainpage.search.SearchService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.ResourceType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.ui.Model;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = AnnoViewService.class)
@TestPropertySource("classpath:application-test.properties")
public class AnnoViewServiceTest {

    private static String svgSelectorName = AnnotationStoreStrings.SVG_SELECTOR.getName();
    private static String svgCode = "<svg:svg>...</svg:svg>";
    private static String textQuoteSelectorName = AnnotationStoreStrings.TEXTQUOTE_SELECTOR.getName();
    private static String exact = "exact";
    private static String prefix = "prefix";
    private static String suffix = "suffix";
    private static String xPathSelectorName = AnnotationStoreStrings.XPATH_SELECTOR.getName();
    private static String xPath = "id(\"w.1\")";
    private static List<Annotation> annotations;

    @Autowired
    private AnnoViewService searchService;

    @MockBean
    private SearchService searchServiceMock;
    @Autowired
    private AnnoViewService annoViewService;

    @BeforeAll
    public static void setUp() throws JSONException {

        // create first annotation
        List<String> creators = Arrays.asList("Creator1", "Creator2");
        JSONArray selectors = new JSONArray(String.format("[{'type': '%s', 'value': '%s'}]",
                svgSelectorName, svgCode));
        Annotation annotation1 = new Annotation(
                "page1",
                creators,
                Instant.parse("2019-03-11T14:13:45Z"),
                Instant.parse("2019-03-11T14:13:45Z"),
                "http://example.org/doc1",
                selectors,
                "describing");
        annotation1.setId("annoId1");
        annotation1.setManuscriptTitle("Vatikan Vat Gr 247");
        Tag tag1 = new Tag(
                "tag1",
                "anno1",
                creators,
                Instant.parse("2019-03-11T14:13:45Z"),
                Instant.parse("2019-03-11T14:13:45Z"),
                "source1",
                "subject1",
                "title1",
                "value1"
        );
        Tag tag2 = new Tag(
                "tag2",
                "anno1",
                creators,
                Instant.parse("2019-03-11T14:13:45Z"),
                Instant.parse("2019-03-11T14:13:45Z"),
                "source2",
                "subject2",
                "title2",
                "value2"
        );
        annotation1.addTag(tag1);
        annotation1.addTag(tag2);

        // create second annotation
        List<String> creator = List.of("Creator1");
        JSONArray selectors2 = new JSONArray(String.format("[{'type': '%s', 'value': '%s'}, {'type': '%s', 'exact': '%s', 'prefix': '%s', 'suffix': '%s'}]",
                xPathSelectorName, xPath, textQuoteSelectorName, exact, prefix, suffix));
        Annotation annotation2 = new Annotation(
                "page2",
                creator,
                Instant.parse("2019-03-11T14:13:45Z"),
                Instant.parse("2019-03-11T14:13:45Z"),
                "http://example.org/doc1",
                selectors2,
                "describing");
        annotation2.setId("annoId2");
        annotation2.setManuscriptTitle("Vatikan Vat Gr 247");
        TextCard textCard = new TextCard(
                "textCard2",
                "anno1",
                creators,
                Instant.parse("2019-03-11T14:13:45Z"),
                Instant.parse("2019-03-11T14:13:45Z"),
                "source",
                "subject",
                "title",
                "value",
                "describing"
        );
        annotation2.addTextCard(textCard);

        annotations = Arrays.asList(annotation1, annotation2);
    }

    @Test
    public void testGetData() throws JSONException, org.json.JSONException {
        Mockito.when(searchServiceMock.getAnnoResults()).thenReturn(annotations);

        JSONArray annotationData = annoViewService.getData();
        String expected = """
                [
                    {
                        "annoId": "annoId1",
                        "creator": [
                            "Creator1",
                            "Creator2"
                        ],
                        "lastModified": "2019-03-11T14:13:45Z",
                        "created": "2019-03-11T14:13:45Z",
                        "manuscriptTitle": "Vatikan Vat Gr 247",
                        "textCards": [],
                        "tags": [
                            {
                                "value": "value1",
                                "source": "source1"
                            },
                            {
                                "value": "value2",
                                "source": "source2"
                            }
                        ],
                        "targetSelectors": [
                            {
                                "type": "SvgSelector",
                                "value": "<svg xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>"
                            }
                        ],
                        "pageId": "page1"
                    },
                    {
                        "annoId": "annoId2",
                        "creator": ["Creator1"],
                        "lastModified": "2019-03-11T14:13:45Z",
                        "created": "2019-03-11T14:13:45Z",
                        "manuscriptTitle": "Vatikan Vat Gr 247",
                        "textCards": [
                            {
                                "purpose": "describing",
                                "value": "source"
                            }
                        ],
                        "tags": [],
                        "targetSelectors": [
                            {
                                "type": "XPathSelector",
                                "value": "id(\\"w.1\\")"
                            },
                            {
                                "type": "TextQuoteSelector",
                                "exact": "exact",
                                "prefix": "prefix",
                                "suffix": "suffix"
                            }
                        ],
                        "pageId": "page2"
                    }
                ]
                
                """;
        JSONAssert.assertEquals(expected, annotationData.toString(), false);

    }



    @Test
    public void testUpdateModel() {
        Mockito.when(searchServiceMock.getAnnoResults()).thenReturn(annotations);
        Model mockedModel = Mockito.mock(Model.class);

//        List<Annotation> actualAnnos = (List<Annotation>) mockedModel.getAttribute("annoResults");
//        assertEquals(annotations, actualAnnos);
        Mockito.when(mockedModel.addAttribute(Mockito.eq("annoResults"), Mockito.any(List.class)))
                .thenAnswer(invocation -> {
                    assertEquals(annoViewService.getResults(), invocation.getArgument(1));
                    return mockedModel;
                });
        annoViewService.updateModel(mockedModel);
    }
}
