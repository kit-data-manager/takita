import static io.specto.hoverfly.junit.core.SimulationSource.dsl;
import static io.specto.hoverfly.junit.dsl.HoverflyDsl.service;
import static io.specto.hoverfly.junit.dsl.ResponseCreators.success;
import static org.junit.jupiter.api.Assertions.*;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.TakitaApplication;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.IRepositoryAccessService;
import edu.kit.datamanager.takita.editor.IEditorService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import io.restassured.RestAssured;
import io.specto.hoverfly.junit.core.Hoverfly;
import io.specto.hoverfly.junit.core.HoverflyMode;
import io.specto.hoverfly.junit.core.model.RequestFieldMatcher;
import io.specto.hoverfly.junit5.HoverflyExtension;
import io.specto.hoverfly.junit5.api.HoverflyCore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.elasticsearch.ElasticsearchContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

/**
 * This integretion test class checks basic functionalities with an elasticsearch testcontainer
 * Testdata: 1 manuscript with 1 image page. 1 annotation on the page
 * NOTE: the tests in this class have to be run in order and are depending on each other
 * External REST API responses are provided via hoverfly. Please make sure to keep this test up-to-date with upgrades on repo and wap server dependencies
 */
@SpringBootTest(classes= TakitaApplication.class, properties = "spring.config.name=application-integration")
@ExtendWith(HoverflyExtension.class)
@HoverflyCore(mode= HoverflyMode.SIMULATE)
@Testcontainers
class BackendITTest {

    @Container
    static ElasticsearchContainer elastic= new ElasticsearchContainer("docker.elastic.co/elasticsearch/elasticsearch:8.13.4")
            .withEnv("discovery.type", "single-node").withEnv("xpack.security.enabled", "false")
            .withEnv("ES_JAVA_OPTS", "-Xms256m -Xmx512m -XX:MaxDirectMemorySize=536870912").withExposedPorts(9200);

    //replaces es port in application.properties with randomly chosen port of es testcontainer
    @DynamicPropertySource
    static void elasticProperties(DynamicPropertyRegistry registry) {
        registry.add("elasticsearch.port", elastic::getFirstMappedPort);
    }

    @Autowired
    Environment environment;

    @Autowired
    private IRepositoryAccessService repositoryAccessService;

    @Autowired
    private ISearchIndexService searchIndexService;

    @Autowired
    private IAssistanceService assistanceService;

    @Autowired
    private IAnnotationStoreAccessService annotationStoreAccessService;

    @Autowired
    private IEditorService editorService;

    @Value("${annotationStore.url}")
    private String urlPrefix;

    @Value("classpath:hoverfly/repo/dataresources.json")
    Resource dataresources;

    @Value("classpath:hoverfly/wap/root.json")
    Resource waproot;

    @Value("classpath:hoverfly/wap/annocontainer_publ.json")
    Resource annocontainer;
    @Value("classpath:hoverfly/repo/pages.json")
    Resource pagesjson;

    @Value("classpath:hoverfly/repo/manuscript_metadata.xml")
    Resource manuscriptxml;

    String manuscriptID;
    String pageID;

    //TODO: does it hurt that this is beforeEach? should it be beforeAll?
    @BeforeEach
    void setUp(Hoverfly hoverfly) throws IOException, JSONException {

        JSONArray dataresourcesArray = new JSONArray(dataresources.getContentAsString(StandardCharsets.UTF_8));
        JSONArray metadataResults = new JSONArray().put(dataresourcesArray.get(0));
        JSONObject waprootJSON = new JSONObject(waproot.getContentAsString(StandardCharsets.UTF_8));
        JSONObject containerJSON = new JSONObject(annocontainer.getContentAsString(StandardCharsets.UTF_8));
        JSONObject containerPage = new JSONObject(containerJSON.getJSONObject("first").toString());
        JSONObject annoJSON = containerPage.getJSONArray("items").getJSONObject(0);
        String annoID = annoJSON.getString("id");
        containerPage.getJSONArray("items").put(0, annoID);

        manuscriptID = ((JSONObject) dataresourcesArray.get(0)).get("id").toString();
        pageID = ((JSONObject) dataresourcesArray.get(1)).get("id").toString();

        String containerPath = waprootJSON.getString("contains").replace(environment.getProperty("intTest_annotationStore.baseurl"), "");

        hoverfly.simulate(
                //Repo dataresources
                dsl(service(repositoryAccessService.getBaseUrl())
                        .post(repositoryAccessService.getStaticPath() + "search").anyBody().anyQueryParams()
                        .willReturn(success()
                                .body(metadataResults.toString())
                        )),
                //Repo pages.json
                dsl(service(repositoryAccessService.getBaseUrl())
                        .get(repositoryAccessService.getStaticPath() + manuscriptID + "/data/pages.json")
                        .willReturn(success()
                                .body(pagesjson.getContentAsString(StandardCharsets.UTF_8))
                        )),
                //Repo image basemetadata
                dsl(service(repositoryAccessService.getBaseUrl())
                        .get(repositoryAccessService.getStaticPath() + pageID)
                        .willReturn(success()
                                .body(dataresourcesArray.get(1).toString())
                        )),
                //Repo xml metadata
                dsl(service(repositoryAccessService.getBaseUrl())
                        .get(repositoryAccessService.getStaticPath() + manuscriptID + "/data/manuscript_metadata.xml")
                        .willReturn(success()
                                .body(manuscriptxml.getContentAsString(StandardCharsets.UTF_8))
                        )),
                //WAP root
                dsl(service(environment.getProperty("intTest_annotationStore.baseurl"))
                        .get(environment.getProperty("intTest_annotationStore.root"))
                        .willReturn(success()
                                .body(waproot.getContentAsString(StandardCharsets.UTF_8))
                        )),
                //WAP anno container
                dsl(service(environment.getProperty("intTest_annotationStore.baseurl"))
                        .get(containerPath).anyQueryParams()
                        .willReturn(success()
                                .body(containerJSON.toString())
                        )),
                //WAP anno container page (with IDs only)
                dsl(service(environment.getProperty("intTest_annotationStore.baseurl"))
                        .get(containerPath).queryParam("page", RequestFieldMatcher.newRegexMatcher(".*"))
                        .willReturn(success()
                                .body(containerPage.toString())
                        )),
                //WAP anno
                dsl(service(environment.getProperty("intTest_annotationStore.baseurl"))
                        .get(containerPath + annoID.replace(environment.getProperty("intTest_annotationStore.baseurl") + containerPath, ""))
                        .willReturn(success()
                                .body(annoJSON.toString())
                        )),
                //WAP POST ANNO
                dsl(service(environment.getProperty("intTest_annotationStore.baseurl"))
                         .post(containerPath + "takita/")
                         .anyBody()
                         .willReturn(success().body("{\"id\": \"someID\"}")) //response does not seem important besides valid id
                        )
        );

    }

    @Test
    public void buildindexTest(Hoverfly hoverfly) throws IOException, JSONException, InterruptedException, NoSuchIndexEntryException {

        searchIndexService.buildIndex(-1);
        Manuscript manuscript = searchIndexService.getManuscriptById(manuscriptID);
        List<Annotation> annos = searchIndexService.getAnnotationsForPageById(pageID);

        assertEquals(1, manuscript.getNoPages());
        assertEquals(1, annos.size());

        //TODO: add metadata_manuscript?
        //TODO: check takita API calls

    }

    @Test
    public void addAnnotationTest (Hoverfly hoverfly) throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException {

        Instant testDate = Instant.now();
        Manuscript manuscript = searchIndexService.getManuscriptById(manuscriptID);
        List<Annotation> annos = searchIndexService.getAnnotationsForPageById(pageID);
        assertEquals(1, manuscript.getNoPages());
        assertEquals(1, annos.size());

        editorService.addAnnotation(pageID, null, "testing", null);
        annos = searchIndexService.getAnnotationsForPageById(pageID);
        assertEquals(2, annos.size());
        assertTrue(annos.get(1).getCreated().isAfter(testDate));
    }

    public void editAnnotationTest (Hoverfly hoverfly) {
        //TODO: manipulate annotation
    }

    public void updateByWADMAnnotation (Hoverfly hoverfly) {
        String annoString1 = """
                {
                  "@context": "http://www.w3.org/ns/anno.jsonld",
                  "id": "http://example.org/anno18",
                  "type": "Annotation",
                  "target": {
                    "id": "http://example.org/photo1",
                    "type": "SpecificResource"
                  }
                }
                """;

        String annoString2 = """
                {
                  "@context": "http://www.w3.org/ns/anno.jsonld",
                  "id": "http://example.org/anno18",
                  "type": "Annotation",
                  "body": {"value": "testing"},
                  "target": {
                    "id": "http://example.org/photo1",
                    "type": "SpecificResource"
                  }
                }
                """;




    }

    public void deleteAnnotationTest (Hoverfly hoverfly) {
        //TODO: delete annotation
    }

    //TODO: updateIndex (likely not now ...)
}