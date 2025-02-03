package edu.kit.datamanager.takita.dataaccess;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Color;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;
import edu.kit.datamanager.takita.model.page.TextPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DateFormat;
import java.text.ParseException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest (classes = AccessService.class)
@TestPropertySource("classpath:application-test.properties")
class AccessServiceTest {
  
  @Autowired
  private IAccessService accessService;
  
  @MockBean
  private IRepositoryAccessService mockedRepositoryAccessService;
  
  @MockBean
  private IAnnotationStoreAccessService mockedAnnotationStoreAccessService;

  @MockBean
  private ISearchIndexService mockedSearchIndexService;

  @MockBean
  private ManuscriptConverter mockedManuscriptConverter;

  @MockBean
  private AnnotationConverter mockedAnnotationConverter;
  
  @BeforeEach
  void init() throws NoSuchFieldException {
    //Insert mock HttpRequestHelper into private field of the RepositoryAccessService instance
    ReflectionTestUtils.setField(accessService, "annotationConverter",mockedAnnotationConverter);
    ReflectionTestUtils.setField(accessService, "manuscriptConverter", mockedManuscriptConverter);
    accessService.setSearchIndexService(mockedSearchIndexService);
  }
  
  @Test
  void getAllManuscripts()
      throws InterruptedException, ParseException, JSONException, IOException, org.json.JSONException {
    List<Manuscript> expectedManuscripts = buildMocksAndExpectedManuscripts();
    assertEqualManuscriptLists(expectedManuscripts, accessService.getAllManuscripts());
  }
  
  @Test
  void getAllManuscriptsModifiedAfter() throws InterruptedException, ParseException, JSONException, IOException, NoSuchIndexEntryException {
    //List<Manuscript> expectedManuscripts = buildMocksAndExpectedManuscripts();
    //DateFormat dateFormatMillis = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat();
    Instant timestamp = Instant.parse("2019-03-10T14:13:45.000Z");

    List<JSONObject> jsonAnnotations = new ArrayList<>();
    jsonAnnotations.add(new JSONObject(readStringFromRelativePath("addAnnotation/annotation1.json")));
    jsonAnnotations.add(new JSONObject(readStringFromRelativePath("addAnnotation/annotation2.json")));
    jsonAnnotations.add(new JSONObject(readStringFromRelativePath("addAnnotation/validatedAnnotation2.json")));

    Page page1 = new ImagePage("758735a2-8e0d-4ac7-815e-bba2060217c3", ResourceType.IMAGE, "89v",
        Instant.parse("2019-04-23T14:13:45.000Z"), "", "");
    page1.setManuscriptId("123");
    Page page2 = new ImagePage("cb679599-7191-422c-923b-89c31c045f1d", ResourceType.IMAGE, "89r",
        Instant.parse("2019-04-23T14:13:45.000Z"), "", "");
    page2.setManuscriptId("123");

    List<Annotation> annotationsPage1 = buildAnnotations();
    Annotation annotationPage2 = createAnnotation1();

    Mockito.when(mockedAnnotationStoreAccessService.getAnnotationsModifiedAfter(timestamp))
        .thenReturn(jsonAnnotations);
    Mockito.when(mockedSearchIndexService.getPageById("758735a2-8e0d-4ac7-815e-bba2060217c3"))
        .thenReturn(page1);
    Mockito.when(mockedSearchIndexService.getPageById("cb679599-7191-422c-923b-89c31c045f1d"))
        .thenReturn(page2);

    Manuscript manuscript = new Manuscript("123", Instant.parse("2019-04-23T14:13:45.000Z"), "testMan1", "Leo", 300);
    manuscript.getPages().add(page1);
    manuscript.getPages().add(page2);
    List<Manuscript> expectedManuscripts = new ArrayList<>();

    expectedManuscripts.add(manuscript);

    Mockito.when(mockedSearchIndexService.getManuscriptById("123")).thenReturn(manuscript);

    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(jsonAnnotations.get(0))).thenReturn(annotationPage2);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(jsonAnnotations.get(1))).thenReturn(annotationsPage1.get(0));
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(jsonAnnotations.get(2))).thenReturn(annotationsPage1.get(1));

    List<Manuscript> actualManuscripts = accessService.getAllManuscriptsModifiedAfter(timestamp);

    assertIterableEquals(expectedManuscripts, actualManuscripts);
    //assertEquals(expectedManuscripts.size(), actualManuscripts.size());
    //for (Manuscript expectedManuscript : expectedManuscripts) {
    //  for (Manuscript actualManuscript : actualManuscripts) {
    //    if (expectedManuscript.getId().equals(actualManuscript.getId())) {
    //      assertEquals(expectedManuscript.getCreated(), actualManuscript.getCreated());
    //      assertEquals(expectedManuscript.getPages().size(), actualManuscript.getPages().size());
    //      assertEquals(expectedManuscript.getPages().get(expectedManuscript.getPages().size() - 1).getId(),
    //          actualManuscript.getPages().get(actualManuscript.getPages().size() - 1).getId());
    //      assertEquals(expectedManuscript.getTitle(), actualManuscript.getTitle());
    //    }
    //  }
    //}
  }

  @Test
  void getFewManuscripts() throws InterruptedException, ParseException, JSONException, IOException, org.json.JSONException {
    List<Manuscript> expectedManuscripts = buildMocksAndExpectedManuscripts();
    List<Manuscript> moreManuscripts = buildMoreMocksAndManuscripts();
    expectedManuscripts.addAll(moreManuscripts);

    List<JSONObject> buildExpectedManuscripts = buildExpectedManuscriptsJSON();

    Mockito.when(mockedRepositoryAccessService.getAllManuscripts(5)).thenReturn(buildExpectedManuscripts);
    Mockito.when(mockedManuscriptConverter.buildManuscriptFromJson(buildExpectedManuscripts.get(0), null)).thenReturn(expectedManuscripts.get(0));
    Mockito.when(mockedManuscriptConverter.buildManuscriptFromJson(buildExpectedManuscripts.get(1), null)).thenReturn(expectedManuscripts.get(1));
    Mockito.when(mockedManuscriptConverter.buildManuscriptFromJson(buildExpectedManuscripts.get(2), null)).thenReturn(moreManuscripts.get(0));
    Mockito.when(mockedManuscriptConverter.buildManuscriptFromJson(buildExpectedManuscripts.get(3), null)).thenReturn(moreManuscripts.get(1));
    Mockito.when(mockedManuscriptConverter.buildManuscriptFromJson(buildExpectedManuscripts.get(4), null)).thenReturn(moreManuscripts.get(2));

    List<Manuscript> actualManuscripts = accessService.getFewManuscripts();
    assertEqualManuscriptLists(expectedManuscripts, actualManuscripts);
  }
  
  @Test
  void addAnnotation() throws IOException, JSONException, InterruptedException, ParseException, NoSuchIndexEntryException {

    JSONObject jsonAnnotation1 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation1.json"));
    Annotation expectedAnnotation1 = createAnnotation1();

    Mockito.when(mockedAnnotationStoreAccessService.addAnnotation(jsonAnnotation1, "a04"))
        .thenAnswer(invocation -> {
          JSONObject actualJsonAnnotation1 = invocation.getArgument(0);

          JSONAssert.assertEquals(jsonAnnotation1.toString(), actualJsonAnnotation1.toString(), true);
          actualJsonAnnotation1.put("etag", "abc");
          return actualJsonAnnotation1;
        });
 
    Mockito.when(mockedAnnotationConverter.buildJsonFromAnnotation(expectedAnnotation1, "082r")).thenReturn(jsonAnnotation1);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(jsonAnnotation1)).thenReturn(expectedAnnotation1);

    Annotation actualAnnotation1 = accessService.addAnnotation(expectedAnnotation1, "082r", "a04");
    assertEqualsAnnotations(expectedAnnotation1, actualAnnotation1);
  }
  
  @Test
  void validateAnnotation() throws IOException, ParseException, JSONException, InterruptedException, NoSuchIndexEntryException {

    JSONObject jsonAnnotation2 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation2.json"));
    JSONObject validatedJsonAnnotation2 = new JSONObject((readStringFromRelativePath("addAnnotation/validatedAnnotation2.json")));
    List<Annotation> annotations = buildAnnotations();
    Annotation expectedAnnotation = annotations.get(0);
    Annotation actualAnnotationBefore = annotations.get(1);

    Mockito.when(mockedAnnotationStoreAccessService.validateAnnotation(jsonAnnotation2, "a04/")).thenReturn(validatedJsonAnnotation2);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(validatedJsonAnnotation2)).thenReturn(expectedAnnotation);
    Mockito.when(mockedAnnotationConverter.buildJsonFromAnnotation(actualAnnotationBefore, "082r")).thenReturn(jsonAnnotation2);

    Annotation actualAnnotationAfter = accessService.validateAnnotation(actualAnnotationBefore, "082r", "a04/");
    assertEqualsAnnotations(expectedAnnotation, actualAnnotationAfter);
  }
  
  @Test
  void updateAnnotation() throws IOException, JSONException, ParseException, InterruptedException, NoSuchIndexEntryException {
    JSONObject jsonAnnotation2 = new JSONObject(readStringFromRelativePath("addAnnotation/annotation2.json"));
    JSONObject validatedJsonAnnotation2 = new JSONObject((readStringFromRelativePath("addAnnotation/validatedAnnotation2.json")));
    List<Annotation> annotations = buildAnnotations();
    Annotation expectedAnnotation = annotations.get(0);
    Annotation actualAnnotationBefore = annotations.get(1);

    Mockito.when(mockedAnnotationStoreAccessService.updateAnnotation(actualAnnotationBefore.getId(), jsonAnnotation2, actualAnnotationBefore.getEtag())).thenReturn(validatedJsonAnnotation2);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(validatedJsonAnnotation2)).thenReturn(expectedAnnotation);
    Mockito.when(mockedAnnotationConverter.buildJsonFromAnnotation(actualAnnotationBefore, "082r")).thenReturn(jsonAnnotation2);

    Annotation actualAnnotationAfter = accessService.updateAnnotation(actualAnnotationBefore, "082r");
    assertEqualsAnnotations(expectedAnnotation, actualAnnotationAfter);
  }
  
  @Test
  void deleteAnnotation() throws ParseException, InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    List<Annotation> annotations = buildAnnotations();

    Mockito.doAnswer(invocation -> {
      String actualId = invocation.getArgument(0);
      String actualEtag = invocation.getArgument(1);
      assertEquals(annotations.get(0).getId(), actualId);
      assertEquals(annotations.get(0).getEtag(), actualEtag);
      return null;
    }).when(mockedAnnotationStoreAccessService).deleteAnnotation(Mockito.anyString(), Mockito.anyString());
    mockedAnnotationStoreAccessService.deleteAnnotation(annotations.get(0).getId(), annotations.get(0).getEtag());
  }

  private List<Manuscript> buildMocksAndExpectedManuscripts()
      throws InterruptedException, JSONException, IOException, ParseException {
    JSONObject annotationJson1
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation1.json"));
    JSONObject annotationJson2
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation2.json"));
    JSONObject annotationJson3
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation3.json"));
    JSONObject annotationJson4
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation4.json"));
    JSONObject pageJson1
        = new JSONObject(readStringFromRelativePath("getManuscripts/page1.json"));
    JSONObject pageJson2
        = new JSONObject(readStringFromRelativePath("getManuscripts/page2.json"));
    JSONObject pageJson3
        = new JSONObject(readStringFromRelativePath("getManuscripts/page3.json"));
    JSONObject manuscriptJson1
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript1.json"));
    JSONObject manuscriptJson2
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript2.json"));
    JSONArray assignmentJson1
        = new JSONArray(readStringFromRelativePath("getManuscripts/pageAssignment1.json"));
    JSONArray assignmentJson2
        = new JSONArray(readStringFromRelativePath("getManuscripts/pageAssignment2.json"));

    List<JSONObject> manuscriptsJson = new ArrayList<>();
    manuscriptsJson.add(manuscriptJson1);
    manuscriptsJson.add(manuscriptJson2);

    List<JSONObject> annotationsJson = new ArrayList<>();
    annotationsJson.add(annotationJson1);
    annotationsJson.add(annotationJson2);
    annotationsJson.add(annotationJson3);
    annotationsJson.add(annotationJson4);

    DateFormat dateFormat = TimeStampFormats.TIMESTAMP_FORMAT_REPO.getDateFormat();

    ImagePage page1 = new ImagePage(
        "5172f6cb-78c6-403d-b6eb-64d7738c76aa",
        ResourceType.IMAGE,
        "076v",
        Instant.parse("2019-03-11T14:13:38Z"), "", "");
    page1.setManuscriptId("000073cd-c425-4214-9648-b380ff20c61a");

    ImagePage page2 = new ImagePage(
        "3f3bf25b-e0b9-48a9-b344-20630f733f8b",
        ResourceType.IMAGE,
        "076r",
        Instant.parse("2019-03-11T14:13:37Z"), "", "");
    page2.setManuscriptId("000073cd-c425-4214-9648-b380ff20c61a");

    ImagePage page3 = new ImagePage(
        "f68e307b-c41b-412a-a2e2-60418fbbef27",
        ResourceType.IMAGE,
        "63r",
        Instant.parse("2019-03-11T14:10:39Z"), "", "");
    page3.setManuscriptId("0d5aa650-2f1e-4dd3-8eed-66a94771ca7c");

    Manuscript manuscript1 = new Manuscript(
        "000073cd-c425-4214-9648-b380ff20c61a",
        Instant.parse("2019-03-11T14:13:45Z"),
        "Vatikan Vat Gr 247",
        "SFB 980 - A04",
        2019);
    List<Page> pagesManuscript1 = new ArrayList<>();
    pagesManuscript1.add(page1);
    pagesManuscript1.add(page2);
    manuscript1.setPages(pagesManuscript1);
    manuscript1.setLastModified(Instant.parse("2019-03-11T14:13:45Z"));

    Manuscript manuscript2 = new Manuscript(
        "0d5aa650-2f1e-4dd3-8eed-66a94771ca7c",
        Instant.parse("2019-03-11T14:10:42Z"),
        "Florenz Laur 72.5",
        "SFB 980 - A04",
        2019);
    List<Page> pagesManuscript2 = new ArrayList<>();
    pagesManuscript2.add(page3);
    manuscript2.setPages(pagesManuscript2);
    manuscript2.setLastModified(Instant.parse("2019-03-11T14:10:42Z"));

    List<String> creatorListAkita = new ArrayList<>();
    creatorListAkita.add("M. K.");
    creatorListAkita.add("Akita");
    List<String> creatorList = new ArrayList<>();
    creatorList.add("M. K.");

    List<String> creatorAlgorithm = new ArrayList<>();
    creatorAlgorithm.add("urn:uuid:c4dbcb3f-f03f-3ff6-8c6d-c0cdb44a06ac");
    
    Annotation annotation1 = new Annotation();
    annotation1.setId("http://sampleannoserver.edu/wap/a04/deinterpretatione/51e65450-1059-462f-91aa-cea2bb5de298");
    annotation1.setCreated(Instant.parse("2018-02-06T11:06:01Z"));
    annotation1.setCreators(creatorAlgorithm);
    annotation1.setModified(Instant.parse("2019-05-08T10:59:38Z"));
    annotation1.setColor(Color.CUSTOM_REGION);
    annotation1.setIsAlgorithmAnnotation(true);
    annotation1.setPageId(page1.getId());
    List<Target> targets1 = new ArrayList<>();
    Target target1 = new Target();
    SVGSelector svgSelector1 = new SVGSelector("<svg xmlns=\\\"http://www.w3.org/2000/svg\\\"><rect x=\\\"0\\\" y=\\\"3307\\\" width=\\\"587\\\" height=\\\"1047\\\"/></svg>");
	target1.setSelector(svgSelector1);
	targets1.add(target1);
    annotation1.setTargets(targets1);
    annotation1.setMotivation("tagging");
    annotation1.setVia("http://sampleannoserver.edu/wap/w3c/aea27124-b3be-417a-a3f3-ce9803f9afb4/0073d61a-5d3a-49c7-bffd-2cc0ae0d8443");

    Annotation annotation2 = new Annotation();
    annotation2.setId("http://sampleannoserver.edu/wap/a04/deinterpretatione/3fe548c5-8be6-40f7-88c8-0118e47c9ac8");
    annotation2.setCreated(Instant.parse("2018-02-09T18:31:07Z"));
    annotation2.setCreators(creatorAlgorithm);
    annotation2.setModified(Instant.parse("2019-05-08T10:59:34Z"));
    annotation2.setColor(Color.NOISE_REGION);
    annotation2.setIsAlgorithmAnnotation(true);
    annotation2.setPageId(page2.getId());
    List<Target> targets2 = new ArrayList<>();
    Target target2 = new Target();
    SVGSelector svgSelector2 = new SVGSelector("<svg xmlns=\\\"http://www.w3.org/2000/svg\\\"><rect x=\\\"2140\\\" y=\\\"3170\\\" width=\\\"200\\\" height=\\\"205\\\"/></svg>");
	target2.setSelector(svgSelector2);
	targets2.add(target2);
	annotation2.setTargets(targets2);
    annotation2.setMotivation("replying");
    annotation2.setVia("http://sampleannoserver.edu/wap/w3c/aea27124-b3be-417a-a3f3-ce9803f9afb4/00053422-d1b4-417d-b659-a294facb6485");

    Annotation annotation3 = new Annotation();
    annotation3.setId("http://sampleannoserver.edu/wap/a04/validated/7a82a8b2-0398-4b59-aed3-ab6597b26d39");
    annotation3.setCreated(Instant.parse("2019-07-04T09:23:24.014Z"));
    annotation3.setCreators(creatorList);
    annotation3.setModified(Instant.parse("2019-07-04T09:25:56Z"));
    annotation3.setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/471a5c9c-25a5-4485-a213-7b51221dba9b");
    annotation3.setColor(Color.DEFAULT);
    annotation3.setIsAlgorithmAnnotation(false);
    annotation3.setPageId(page3.getId());
    List<Target> targets3 = new ArrayList<>();
    Target target3 = new Target();
    SVGSelector svgSelector3 = new SVGSelector("<svg><rect x=\\\"245\\\" y=\\\"-2\\\" width=\\\"3070\\\" height=\\\"4690\\\"/></svg>");
	target3.setSelector(svgSelector3);
	targets3.add(target3);
	annotation3.setTargets(targets3);
    annotation3.setMotivation("moderating");
    annotation3.setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/471a5c9c-25a5-4485-a213-7b51221dba9b");

    Annotation annotation4 = new Annotation();
    annotation4.setId("http://sampleannoserver.edu/wap/a04/validated/cd9267d1-5402-4f48-ae99-8b5559ccc456");
    annotation4.setCreated(Instant.parse("2019-07-04T07:00:54.634Z"));
    annotation4.setCreators(creatorList);
    annotation4.setModified(Instant.parse("2019-07-04T09:14:59Z"));
    annotation4.setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/c6c83ff9-3b68-4965-9e7a-359abad3eb9d");
    annotation4.setColor(Color.TEXT_REGION);
    annotation4.setIsAlgorithmAnnotation(false);
    annotation4.setPageId(page3.getId());
    List<Target> targets4 = new ArrayList<>();
    Target target4 = new Target();
    SVGSelector svgSelector4 = new SVGSelector("<svg><rect x=\\\"214\\\" y=\\\"73\\\" width=\\\"3008\\\" height=\\\"4467\\\"/></svg>");
	target4.setSelector(svgSelector4);
	targets4.add(target4);
	annotation4.setTargets(targets4);
    annotation4.setMotivation("identifying");
    annotation4.setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/c6c83ff9-3b68-4965-9e7a-359abad3eb9d");

    TextCard textCard1 = new TextCard("0");
    textCard1.setAnnotationId(annotation1.getId());
    textCard1.setCreated(annotation1.getCreated());
    textCard1.setModified(annotation1.getModified());
    textCard1.setCreators(creatorAlgorithm);
    textCard1.setTitle("VPOS");
    textCard1.setValue("20.997332");
    textCard1.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/textCard1.json")));
    annotation1.addTextCard(textCard1);

    TextCard textCard2 = new TextCard("1");
    textCard2.setAnnotationId(annotation2.getId());
    textCard2.setCreated(annotation2.getCreated());
    textCard2.setModified(annotation2.getModified());
    textCard2.setCreators(creatorAlgorithm);
    textCard2.setTitle("RelativeVPOS");
    textCard2.setValue("90.390656");
    textCard2.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/textCard2.json")));
    annotation2.addTextCard(textCard2);

    TextCard textCard3 = new TextCard("2");
    textCard3.setAnnotationId(annotation3.getId());
    textCard3.setCreated(annotation3.getCreated());
    textCard3.setModified(annotation3.getModified());
    textCard3.setCreators(creatorList);
    textCard3.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/textCard3.json")));
    annotation3.addTextCard(textCard3);

    Tag tag1 = new Tag("3");
    tag1.setAnnotationId(annotation4.getId());
    tag1.setCreated(annotation4.getCreated());
    tag1.setModified(annotation4.getModified());
    tag1.setCreators(creatorList);
    tag1.setValue("16a8");
    tag1.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/tag1.json")));
    annotation4.addTag(tag1);

    page1.getAnnotations().add(annotation1);
    page2.getAnnotations().add(annotation2);
    page3.getAnnotations().add(annotation3);
    page3.getAnnotations().add(annotation4);
    List<JSONObject> annotationsPage1 = new ArrayList<>();
    annotationsPage1.add(annotationJson1);
    List<JSONObject> annotationsPage2 = new ArrayList<>();
    annotationsPage2.add(annotationJson2);
    List<JSONObject> annotationsPage3 = new ArrayList<>();
    annotationsPage3.add(annotationJson3);
    annotationsPage3.add(annotationJson4);

    Mockito.when(mockedRepositoryAccessService.getAllManuscripts(-1))
        .thenReturn(manuscriptsJson);
    Mockito.when(mockedRepositoryAccessService.getAllManuscripts(2))
        .thenReturn(manuscriptsJson);
    Mockito.when(mockedRepositoryAccessService.getManuscriptsModifiedAfter(
        Instant.parse("2019-03-10T14:13:45Z")))
        .thenReturn(manuscriptsJson);
    Mockito.when(mockedRepositoryAccessService.getManuscriptById(manuscript1.getId()))
        .thenReturn(manuscriptJson1);
    Mockito.when(mockedRepositoryAccessService.getManuscriptById(manuscript2.getId()))
        .thenReturn(manuscriptJson2);
    Mockito.when(mockedRepositoryAccessService.getPageAssignmentForManuscriptId(manuscript1.getId()))
        .thenReturn(assignmentJson1);
    Mockito.when(mockedRepositoryAccessService.getPageAssignmentForManuscriptId(manuscript2.getId()))
        .thenReturn(assignmentJson2);
    Mockito.when(mockedRepositoryAccessService.getPageById(page1.getId()))
        .thenReturn(pageJson1);
    Mockito.when(mockedRepositoryAccessService.getPageById(page2.getId()))
        .thenReturn(pageJson2);
    Mockito.when(mockedRepositoryAccessService.getPageById(page3.getId()))
        .thenReturn(pageJson3);
    Mockito.when(mockedAnnotationStoreAccessService.getAllAnnotations())
        .thenReturn(annotationsJson);
    Mockito.when(mockedAnnotationStoreAccessService.getAnnotationsByPageId(page1.getId(), page1.getPageNumber()))
        .thenReturn(annotationsPage1);
    Mockito.when(mockedAnnotationStoreAccessService.getAnnotationsByPageId(page2.getId(), page2.getPageNumber()))
        .thenReturn(annotationsPage2);
    Mockito.when(mockedAnnotationStoreAccessService.getAnnotationsByPageId(page3.getId(), page3.getPageNumber()))
        .thenReturn(annotationsPage3);


    List<Manuscript> manuscripts = new ArrayList<>();
    manuscripts.add(manuscript1);
    manuscripts.add(manuscript2);

    List<Annotation> annotationPage1 = new ArrayList<>();
    annotationPage1.add(annotation1);
    List<Annotation> annotationPage2 = new ArrayList<>();
    annotationPage2.add(annotation2);
    List<Annotation> annotationPage3 = new ArrayList<>();
    annotationPage3.add(annotation3);
    annotationPage3.add(annotation4);

    Map<String, List<Annotation>> sortedAnnotationsManuscript = new HashMap<>();
    sortedAnnotationsManuscript.put(page1.getId(), annotationPage1);
    sortedAnnotationsManuscript.put(page2.getId(), annotationPage2);
    sortedAnnotationsManuscript.put(page3.getId(), annotationPage3);

    Mockito.when(mockedManuscriptConverter.buildManuscriptFromJson(manuscriptJson1, sortedAnnotationsManuscript)).thenReturn(manuscript1);
    Mockito.when(mockedManuscriptConverter.buildManuscriptFromJson(manuscriptJson2, sortedAnnotationsManuscript)).thenReturn(manuscript2);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(annotationJson1)).thenReturn(annotation1);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(annotationJson2)).thenReturn(annotation2);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(annotationJson3)).thenReturn(annotation3);
    Mockito.when(mockedAnnotationConverter.buildAnnotationFromJson(annotationJson4)).thenReturn(annotation4);

    return manuscripts;
  }

  private List<Manuscript> buildMoreMocksAndManuscripts() throws IOException, JSONException, ParseException, InterruptedException {
    JSONObject annotationJson1
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation1.json"));
    JSONObject annotationJson2
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation2.json"));
    JSONObject annotationJson3
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation3.json"));
    JSONObject annotationJson4
        = new JSONObject(readStringFromRelativePath("getManuscripts/annotation4.json"));
    JSONObject pageJson1
        = new JSONObject(readStringFromRelativePath("getManuscripts/page4.json"));
    JSONObject pageJson2
        = new JSONObject(readStringFromRelativePath("getManuscripts/page5.json"));
    JSONObject pageJson3
        = new JSONObject(readStringFromRelativePath("getManuscripts/page6.json"));
    JSONObject manuscriptJson1
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript3.json"));
    JSONObject manuscriptJson2
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript4.json"));
    JSONObject manuscriptJson3
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript5.json"));
    JSONArray assignmentJson1
        = new JSONArray(readStringFromRelativePath("getManuscripts/pageAssignment3.json"));
    JSONArray assignmentJson2
        = new JSONArray(readStringFromRelativePath("getManuscripts/pageAssignment4.json"));
    JSONArray assignmentJson3
        = new JSONArray(readStringFromRelativePath("getManuscripts/pageAssignment5.json"));

    List<JSONObject> manuscriptsJson = new ArrayList<>();
    manuscriptsJson.add(manuscriptJson1);
    manuscriptsJson.add(manuscriptJson2);
    manuscriptsJson.add(manuscriptJson3);

    List<JSONObject> annotationsJson = new ArrayList<>();
    annotationsJson.add(annotationJson1);
    annotationsJson.add(annotationJson2);
    annotationsJson.add(annotationJson3);
    annotationsJson.add(annotationJson4);

    DateFormat dateFormat = TimeStampFormats.TIMESTAMP_FORMAT_REPO.getDateFormat();

    ImagePage page1 = new ImagePage(
        "3b868555-f0ac-4de7-abbc-5c14c0742dbf",
        ResourceType.IMAGE,
        "6869",
        Instant.parse("2019-03-12T14:11:35Z"), "", "");
    page1.setManuscriptId("000c557c-4a11-405e-8bbc-a0d4ea5844a4");

    ImagePage page2 = new ImagePage(
        "33f1a3cf-d06e-429b-996e-3ab794c9767e",
        ResourceType.IMAGE,
        "1069",
        Instant.parse("2019-03-11T14:09:45Z"), "", "");
    page2.setManuscriptId("00125ead-bf62-475e-aeb6-0d2b30df5648");

    ImagePage page3 = new ImagePage(
        "4b756754-54a2-4932-8b1e-a33889ab0c37",
        ResourceType.IMAGE,
        "7559",
        Instant.parse("2019-08-26T09:21:02Z"), "", "");
    page3.setManuscriptId("001abeb0-f0e4-43ed-be1e-ed37f02cd02b");

    Manuscript manuscript1 = new Manuscript(
        "000c557c-4a11-405e-8bbc-a0d4ea5844a4",
        Instant.parse("2019-03-12T14:11:16Z"),
        "Modena α V 8 13, 069r",
        "SFB 980 - A04",
        2019);
    List<Page> pagesManuscript1 = new ArrayList<>();
    pagesManuscript1.add(page1);
    manuscript1.setPages(pagesManuscript1);
    manuscript1.setLastModified(Instant.parse("2019-03-12T14:11:16Z"));

    Manuscript manuscript2 = new Manuscript(
        "00125ead-bf62-475e-aeb6-0d2b30df5648",
        Instant.parse("2019-03-12T14:11:29Z"),
        "Vatikan Urb gr 56, 084v",
        "SFB 980 - A04",
        2019);
    List<Page> pagesManuscript2 = new ArrayList<>();
    pagesManuscript2.add(page2);
    manuscript2.setPages(pagesManuscript2);
    manuscript2.setLastModified(Instant.parse("2019-03-12T14:11:29Z"));

    Manuscript manuscript3 = new Manuscript(
        "001abeb0-f0e4-43ed-be1e-ed37f02cd02b",
        Instant.parse("2019-03-11T14:09:50Z"),
        "Vatikan Reg Gr 116, 073r",
        "SFB 980 - A04",
        2019);
    List<Page> pagesManuscript3 = new ArrayList<>();
    pagesManuscript3.add(page3);
    manuscript3.setPages(pagesManuscript3);
    manuscript3.setLastModified(Instant.parse("2019-03-11T14:09:50Z"));


    List<String> creatorListAkita = new ArrayList<>();
    creatorListAkita.add("M. K.");
    creatorListAkita.add("Akita");
    List<String> creatorList = new ArrayList<>();
    creatorList.add("M. K.");

    List<String> creatorAlgorithm = new ArrayList<>();
    creatorAlgorithm.add("urn:uuid:c4dbcb3f-f03f-3ff6-8c6d-c0cdb44a06ac");

    Annotation annotation1 = new Annotation();
    annotation1.setId("http://sampleannoserver.edu/wap/a04/deinterpretatione/51e65450-1059-462f-91aa-cea2bb5de298");
    annotation1.setCreated(Instant.parse("2018-02-06T11:06:01Z"));
    annotation1.setCreators(creatorAlgorithm);
    annotation1.setModified(Instant.parse("2019-05-08T10:59:38Z"));
    annotation1.setColor(Color.CUSTOM_REGION);
    annotation1.setIsAlgorithmAnnotation(true);
    annotation1.setPageId("5172f6cb-78c6-403d-b6eb-64d7738c76aa");
    List<Target> targets1 = new ArrayList<>();
    Target target1 = new Target();
    SVGSelector svgSelector1 = new SVGSelector("<svg xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"3307\" width=\"587\" height=\"1047\"/></svg>");
	target1.setSelector(svgSelector1);
	targets1.add(target1);
    annotation1.setTargets(targets1);
    annotation1.setMotivation("tagging");
    annotation1.setVia("http://sampleannoserver.edu/wap/w3c/aea27124-b3be-417a-a3f3-ce9803f9afb4/0073d61a-5d3a-49c7-bffd-2cc0ae0d8443");

    Annotation annotation2 = new Annotation();
    annotation2.setId("http://sampleannoserver.edu/wap/a04/deinterpretatione/3fe548c5-8be6-40f7-88c8-0118e47c9ac8");
    annotation2.setCreated(Instant.parse("2018-02-09T18:31:07Z"));
    annotation2.setCreators(creatorAlgorithm);
    annotation2.setModified(Instant.parse("2019-03-11T14:09:50Z"));
    annotation2.setColor(Color.NOISE_REGION);
    annotation2.setIsAlgorithmAnnotation(true);
    annotation2.setPageId("3f3bf25b-e0b9-48a9-b344-20630f733f8b");
    List<Target> targets2 = new ArrayList<>();
    Target target2 = new Target();
    SVGSelector svgSelector2 = new SVGSelector("<svg xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"2140\" y=\"3170\" width=\"200\" height=\"205\"/></svg>");
	target2.setSelector(svgSelector2);
	targets2.add(target2);
	annotation2.setTargets(targets2);
    annotation2.setMotivation("replying");
    annotation2.setVia("http://sampleannoserver.edu/wap/w3c/aea27124-b3be-417a-a3f3-ce9803f9afb4/00053422-d1b4-417d-b659-a294facb6485");

    Annotation annotation3 = new Annotation();
    annotation3.setId("http://sampleannoserver.edu/wap/a04/validated/7a82a8b2-0398-4b59-aed3-ab6597b26d39");
    annotation3.setCreated(Instant.parse("2019-07-04T09:23:24.014Z"));
    annotation3.setCreators(creatorList);
    annotation3.setModified(Instant.parse("2019-07-04T09:25:56Z"));
    annotation3.setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/471a5c9c-25a5-4485-a213-7b51221dba9b");
    annotation3.setColor(Color.DEFAULT);
    annotation3.setIsAlgorithmAnnotation(false);
    annotation3.setPageId("f68e307b-c41b-412a-a2e2-60418fbbef27");
    List<Target> targets3 = new ArrayList<>();
    Target target3 = new Target();
    SVGSelector svgSelector3 = new SVGSelector("<svg><rect x=\"245\" y=\"-2\" width=\"3070\" height=\"4690\"/></svg>");
	target3.setSelector(svgSelector3);
	targets3.add(target3);
	annotation3.setTargets(targets3);
    annotation3.setMotivation("moderating");
    annotation3.setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/471a5c9c-25a5-4485-a213-7b51221dba9b");

    Annotation annotation4 = new Annotation();
    annotation4.setId("http://sampleannoserver.edu/wap/a04/validated/cd9267d1-5402-4f48-ae99-8b5559ccc456");
    annotation4.setCreated(Instant.parse("2019-07-04T07:00:54.634Z"));
    annotation4.setCreators(creatorList);
    annotation4.setModified(Instant.parse("2019-07-04T09:14:59Z"));
    annotation4.setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/c6c83ff9-3b68-4965-9e7a-359abad3eb9d");
    annotation4.setColor(Color.TEXT_REGION);
    annotation4.setIsAlgorithmAnnotation(false);
    annotation4.setPageId("f68e307b-c41b-412a-a2e2-60418fbbef27");
    List<Target> targets4 = new ArrayList<>();
    Target target4 = new Target();
    SVGSelector svgSelector4 = new SVGSelector("<svg><rect x=\"214\" y=\"73\" width=\"3008\" height=\"4467\"/></svg>");
	target4.setSelector(svgSelector4);
	targets4.add(target4);
	annotation4.setTargets(targets4);
    annotation4.setMotivation("identifying");
    annotation4.setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/c6c83ff9-3b68-4965-9e7a-359abad3eb9d");

    TextCard textCard1 = new TextCard("0");
    textCard1.setAnnotationId(annotation1.getId());
    textCard1.setCreated(annotation1.getCreated());
    textCard1.setModified(annotation1.getModified());
    textCard1.setCreators(creatorAlgorithm);
    textCard1.setTitle("VPOS");
    textCard1.setValue("20.997332");
    textCard1.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/textCard1.json")));
    annotation1.addTextCard(textCard1);

    TextCard textCard2 = new TextCard("1");
    textCard2.setAnnotationId(annotation2.getId());
    textCard2.setCreated(annotation2.getCreated());
    textCard2.setModified(annotation2.getModified());
    textCard2.setCreators(creatorAlgorithm);
    textCard2.setTitle("RelativeVPOS");
    textCard2.setValue("90.390656");
    textCard2.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/textCard2.json")));
    annotation2.addTextCard(textCard2);

    TextCard textCard3 = new TextCard("2");
    textCard3.setAnnotationId(annotation3.getId());
    textCard3.setCreated(annotation3.getCreated());
    textCard3.setModified(annotation3.getModified());
    textCard3.setCreators(creatorList);
    textCard3.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/textCard3.json")));
    annotation3.addTextCard(textCard3);

    Tag tag1 = new Tag("3");
    tag1.setAnnotationId(annotation4.getId());
    tag1.setCreated(annotation4.getCreated());
    tag1.setModified(annotation4.getModified());
    tag1.setCreators(creatorList);
    tag1.setValue("16a8");
    tag1.setFullJson(
        new JSONObject(readStringFromRelativePath("getManuscripts/tag1.json")));
    annotation4.addTag(tag1);

    page1.getAnnotations().add(annotation1);
    page2.getAnnotations().add(annotation2);
    page3.getAnnotations().add(annotation3);
    page3.getAnnotations().add(annotation4);
    List<JSONObject> annotationsPage1 = new ArrayList<>();
    annotationsPage1.add(annotationJson1);
    List<JSONObject> annotationsPage2 = new ArrayList<>();
    annotationsPage2.add(annotationJson2);
    List<JSONObject> annotationsPage3 = new ArrayList<>();
    annotationsPage3.add(annotationJson3);
    annotationsPage3.add(annotationJson4);

    Mockito.when(mockedRepositoryAccessService.getManuscriptById(manuscript1.getId()))
        .thenReturn(manuscriptJson1);
    Mockito.when(mockedRepositoryAccessService.getManuscriptById(manuscript2.getId()))
        .thenReturn(manuscriptJson2);
    Mockito.when(mockedRepositoryAccessService.getManuscriptById(manuscript3.getId()))
        .thenReturn(manuscriptJson3);
    Mockito.when(mockedRepositoryAccessService.getPageAssignmentForManuscriptId(manuscript1.getId()))
        .thenReturn(assignmentJson1);
    Mockito.when(mockedRepositoryAccessService.getPageAssignmentForManuscriptId(manuscript2.getId()))
        .thenReturn(assignmentJson2);
    Mockito.when(mockedRepositoryAccessService.getPageAssignmentForManuscriptId(manuscript3.getId()))
        .thenReturn(assignmentJson3);
    Mockito.when(mockedRepositoryAccessService.getPageById(page1.getId()))
        .thenReturn(pageJson1);
    Mockito.when(mockedRepositoryAccessService.getPageById(page2.getId()))
        .thenReturn(pageJson2);
    Mockito.when(mockedRepositoryAccessService.getPageById(page3.getId()))
        .thenReturn(pageJson3);
    Mockito.when(mockedAnnotationStoreAccessService.getAllAnnotations())
        .thenReturn(annotationsJson);
    Mockito.when(mockedAnnotationStoreAccessService.getAnnotationsByPageId(page1.getId(), page1.getPageNumber()))
        .thenReturn(annotationsPage1);
    Mockito.when(mockedAnnotationStoreAccessService.getAnnotationsByPageId(page2.getId(), page2.getPageNumber()))
        .thenReturn(annotationsPage2);
    Mockito.when(mockedAnnotationStoreAccessService.getAnnotationsByPageId(page3.getId(), page3.getPageNumber()))
        .thenReturn(annotationsPage3);


    List<Manuscript> manuscripts = new ArrayList<>();
    manuscripts.add(manuscript1);
    manuscripts.add(manuscript2);
    manuscripts.add(manuscript3);
    return manuscripts;
  }

  private List<JSONObject> buildExpectedManuscriptsJSON() throws JSONException, IOException {
    JSONObject manuscriptJson1
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript1.json"));
    JSONObject manuscriptJson2
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript2.json"));
    JSONObject manuscriptJson3
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript3.json"));
    JSONObject manuscriptJson4
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript4.json"));
    JSONObject manuscriptJson5
        = new JSONObject(readStringFromRelativePath("getManuscripts/manuscript5.json"));

    List<JSONObject> manuscriptsJson = new ArrayList<>();
    manuscriptsJson.add(manuscriptJson1);
    manuscriptsJson.add(manuscriptJson2);
    manuscriptsJson.add(manuscriptJson3);
    manuscriptsJson.add(manuscriptJson4);
    manuscriptsJson.add(manuscriptJson5);

    return manuscriptsJson;
  }

  private void assertEqualManuscriptLists(List<Manuscript> expectedManuscripts,
                                         List<Manuscript> actualManuscripts) throws org.json.JSONException, JSONException {
  
    assertEquals(expectedManuscripts.size(), actualManuscripts.size());
    for (int i1 = 0; i1 < actualManuscripts.size(); i1++) {
      Manuscript manuscript = actualManuscripts.get(i1);
      Manuscript expectedManuscript = expectedManuscripts.get(i1);
    
      // asserts manuscripts attributes
      assertEquals(expectedManuscript.getId(), manuscript.getId());
      assertEquals(expectedManuscript.getCreated(), manuscript.getCreated());
      assertEquals(expectedManuscript.getLastModified(), manuscript.getLastModified());
      assertEquals(expectedManuscript.getPublicationYear(), manuscript.getPublicationYear());
      assertEquals(expectedManuscript.getPublisher(), manuscript.getPublisher());
      assertEquals(expectedManuscript.getTitle(), manuscript.getTitle());
    
      List<Page> pages = manuscript.getPages();
      List<Page> expectedPages = expectedManuscript.getPages();
      assertEquals(pages.size(), expectedPages.size());
      for (int i2 = 0; i2 < pages.size(); i2++) {
        Page page = pages.get(i2);
        Page expectedPage = expectedPages.get(i2);
      
        // asserts page attributes
        assertEquals(expectedPage.getId(), page.getId());
        assertEquals(expectedPage.getCreated(), page.getCreated());
        assertEquals(expectedPage.getLastModified(), page.getLastModified());
        assertEquals(expectedPage.getPageNumber(), page.getPageNumber());
        assertEquals(expectedPage.getManuscriptId(), page.getManuscriptId());
        assertEquals(expectedPage.getResourceType(), page.getResourceType());
      
        if (page.getResourceType().equals(ResourceType.IMAGE)) {
          ImagePage imagePage = (ImagePage) page;
          ImagePage expectedImagePage = (ImagePage) expectedPage;
        
          List<Annotation> annotations = imagePage.getAnnotations();
          List<Annotation> expectedAnnotations = expectedImagePage.getAnnotations();
          
          if (expectedAnnotations == null) {
            continue;
          }
          assertNotNull(annotations);
          assertEquals(annotations.size(), expectedAnnotations.size());
          for (int i3 = 0; i3 < annotations.size(); i3++) {
            Annotation annotation = annotations.get(i3);
            Annotation expectedAnnotation = expectedAnnotations.get(i3);
          
            // assert annotation attributes
            assertEquals(expectedAnnotation.getId(), annotation.getId());
            assertEquals(expectedAnnotation.getCanonical(), annotation.getCanonical());
            assertEquals(expectedAnnotation.getVia(), annotation.getVia());
            assertEquals(expectedAnnotation.getColor(), annotation.getColor());
            assertEquals(expectedAnnotation.getCreated(), annotation.getCreated());
            assertEquals(expectedAnnotation.getCreators(), annotation.getCreators());
            assertEquals(expectedAnnotation.getMotivation(), annotation.getMotivation());
            assertEquals(expectedAnnotation.getIsAlgorithmAnnotation(), annotation.getIsAlgorithmAnnotation());
            assertEquals(expectedAnnotation.getPageId(), annotation.getPageId());
          
            List<TextCard> textCards = annotation.getTextCards();
            List<TextCard> expectedTextCards = expectedAnnotation.getTextCards();
            assertEquals(textCards.size(), expectedTextCards.size());
            for (int i4 = 0; i4 < textCards.size(); i4++) {
              TextCard textCard = textCards.get(i4);
              TextCard expectedTextCard = expectedTextCards.get(i4);
            
              // assert text card attributes

              JSONAssert.assertEquals(expectedTextCard.getFullJson().toString(), textCard.getFullJson().toString(), true);
              assertEquals(expectedTextCard.getAnnotationId(), textCard.getAnnotationId());
              assertEquals(expectedTextCard.getPurpose(), textCard.getPurpose());
              assertEquals(expectedTextCard.getTitle(), textCard.getTitle());
              assertEquals(expectedTextCard.getValue(), textCard.getValue());
              assertEquals(expectedTextCard.getCreators(), textCard.getCreators());
            
            }
            List<Tag> tags = annotation.getTags();
            List<Tag> expectedTags = expectedAnnotation.getTags();
            for (int i4 = 0; i4 < tags.size(); i4++) {
              Tag tag = tags.get(i4);
              Tag expectedTag = expectedTags.get(i4);
              // assert tag attributes
              JSONAssert.assertEquals(expectedTag.getFullJson().toString(), tag.getFullJson().toString(), true);
              assertEquals(expectedTag.getAnnotationId(), tag.getAnnotationId());
              assertEquals(expectedTag.getPurpose(), tag.getPurpose());
              assertEquals(expectedTag.getTitle(), tag.getTitle());
              assertEquals(expectedTag.getValue(), tag.getValue());
              assertEquals(expectedTag.getCreators(), tag.getCreators());
            }
          }
        }
      }
    }
  }

  private void assertEqualsAnnotations(Annotation expectedAnnotation, Annotation actualAnnotation) {
    assertEquals(expectedAnnotation.getId(), actualAnnotation.getId());
    assertEquals(expectedAnnotation.getColor(), actualAnnotation.getColor());
    assertEquals(expectedAnnotation.getCanonical(), actualAnnotation.getCanonical());
    assertEquals(expectedAnnotation.getCreated(), actualAnnotation.getCreated());
    assertEquals(expectedAnnotation.getModified(), actualAnnotation.getModified());
    assertEquals(expectedAnnotation.getPageId(), actualAnnotation.getPageId());
    assertEquals(expectedAnnotation.getIsAlgorithmAnnotation(), actualAnnotation.getIsAlgorithmAnnotation());
    assertEquals(expectedAnnotation.getMotivation(), actualAnnotation.getMotivation());
    assertEquals(expectedAnnotation.getVia(), actualAnnotation.getVia());
    assertEquals(expectedAnnotation.getEtag(), actualAnnotation.getEtag());
    System.out.println("exp " + expectedAnnotation.getCreators() + " act " + actualAnnotation.getCreators());
    assertEquals(expectedAnnotation.getCreators().size(), actualAnnotation.getCreators().size());
    if (expectedAnnotation.getCreators().size() > 0) {
      int creatorCounter = 0;
      for (String expCreator : expectedAnnotation.getCreators()) {
        for (String actCreator : actualAnnotation.getCreators()) {
          if (expCreator.equals(actCreator)) {
            creatorCounter++;
          }
        }
      }
      assertEquals(expectedAnnotation.getCreators().size(), creatorCounter);
    }
    assertEquals(expectedAnnotation.getTextCards().size(), actualAnnotation.getTextCards().size());
    if (expectedAnnotation.getTextCards().size() > 0) {
      for (TextCard expTextCard : expectedAnnotation.getTextCards()) {
        for (TextCard actTextCard : actualAnnotation.getTextCards()) {
          if (expTextCard.getId().equals(actTextCard.getId())) {
            assertEquals(expTextCard.getId(), actTextCard.getId());
            assertEquals(expTextCard.getTitle(), actTextCard.getTitle());
            assertEquals(expTextCard.getValue(), actTextCard.getValue());
            assertEquals(expTextCard.getAnnotationId(), actTextCard.getAnnotationId());
            assertEquals(expTextCard.getCreated(), actTextCard.getCreated());
            assertEquals(expTextCard.getModified(), actTextCard.getModified());
          }
        }
      }
    }
    if (expectedAnnotation.getTags().size() > 0) {
      for (Tag expectedTag : expectedAnnotation.getTags()) {
        for (Tag actualTag : actualAnnotation.getTags()) {
          if (expectedTag.getId().equals(actualTag.getId())) {
            assertEquals(expectedTag.getId(), actualTag.getId());
            assertEquals(expectedTag.getTitle(), actualTag.getTitle());
            assertEquals(expectedTag.getValue(), actualTag.getValue());
            assertEquals(expectedTag.getAnnotationId(), actualTag.getAnnotationId());
            assertEquals(expectedTag.getCreated(), actualTag.getCreated());
            assertEquals(expectedTag.getModified(), actualTag.getModified());
          }
        }
      }
    }
  }

  private List<Annotation> buildAnnotations() throws ParseException, NoSuchIndexEntryException, JSONException {
    DateFormat dateFormat = TimeStampFormats.TIMESTAMP_FORMAT_ANNO.getDateFormat();
    List<String> creatorList = new ArrayList<>();
    creatorList.add("M. K.");
    creatorList.add("Elizabeth Bennet");

    List<Annotation> annotations = new ArrayList<>();
    annotations.add(new Annotation());
    annotations.get(0).setId("http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825");
    annotations.get(0).setCreated(Instant.parse("2019-07-04T06:59:33.33Z"));
    annotations.get(0).setCreators(creatorList);
    annotations.get(0).setModified(Instant.parse("2019-07-04T07:05:57Z"));
    annotations.get(0).setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89");
    annotations.get(0).setColor(Color.PAGE_REGION);
    annotations.get(0).setIsAlgorithmAnnotation(false);
    annotations.get(0).setPageId("758735a2-8e0d-4ac7-815e-bba2060217c3");
    List<Target> targets1 = new ArrayList<>();
    Target target1 = new Target();
    SVGSelector svgSelector1 = new SVGSelector("<svg><rect x=\"279\" y=\"48\" width=\"2951\" height=\"4500\"/></svg>");
	target1.setSelector(svgSelector1);
	targets1.add(target1);
    annotations.get(0).setTargets(targets1);
    annotations.get(0).setMotivation("describing");
    annotations.get(0).setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89");
    annotations.get(0).setEtag("def");
    TextCard expectedTextCard1 = new TextCard(UUID.randomUUID().toString());
    expectedTextCard1.setCreators(creatorList);
    expectedTextCard1.setFullJson(new JSONObject("{\n" +
        "    \"dc:subject\" : \"PageRegion\",\n" +
        "    \"creator\" : [ {\n" +
        "      \"type\" : \"Software\",\n" +
        "      \"name\" : \"Akita\"\n" +
        "    }, {\n" +
        "      \"type\" : \"Person\",\n" +
        "      \"name\" : \"M. K.\"\n" +
        "    } ]\n" +
        "  }"));
    annotations.get(0).addTextCard(expectedTextCard1);
    TextCard expectedTextCard2 = new TextCard(UUID.randomUUID().toString());
    expectedTextCard2.setCreators(creatorList);
    expectedTextCard2.setValue("Questionable text block");
    expectedTextCard2.setPurpose("questioning");
    expectedTextCard2.setFullJson(new JSONObject("{\n" +
        "    \"type\" : \"TextualBody\",\n" +
        "    \"creator\" : [ {\n" +
        "      \"type\" : \"Person\",\n" +
        "      \"name\" : \"M. K.\"\n" +
        "    }, {\n" +
        "      \"type\" : \"Software\",\n" +
        "      \"name\" : \"Akita\"\n" +
        "    } ],\n" +
        "    \"value\" : \"Questionable text block\",\n" +
        "    \"purpose\" : \"questioning\"\n" +
        "  }"));
    annotations.get(0).addTextCard(expectedTextCard2);

    annotations.add(new Annotation());
    annotations.get(1).setId("http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89");
    annotations.get(1).setCreated(Instant.parse("2019-07-04T06:59:33.33Z"));
    annotations.get(1).setCreators(creatorList);
    annotations.get(1).setModified(Instant.parse("2019-07-04T07:05:57Z"));
    annotations.get(1).setColor(Color.PAGE_REGION);
    annotations.get(1).setIsAlgorithmAnnotation(false);
    annotations.get(1).setPageId("758735a2-8e0d-4ac7-815e-bba2060217c3");
    List<Target> targets2 = new ArrayList<>();
    Target target2 = new Target();
    SVGSelector svgSelector2 = new SVGSelector("<svg><rect x=\"279\" y=\"48\" width=\"2951\" height=\"4500\"/></svg>");
	target2.setSelector(svgSelector2);
	targets2.add(target2);
    annotations.get(1).setTargets(targets2);
    annotations.get(1).setMotivation("describing");
    annotations.get(1).setEtag("abc");
    annotations.get(1).addTextCard(expectedTextCard1);
    annotations.get(1).addTextCard(expectedTextCard2);

    TextPage page = new TextPage("cb679599-7191-422c-923b-89c31c045f1d", ResourceType.TEXT, "082r",
        Instant.parse("2019-07-04T00:00:00Z"), "");
    Mockito.when(mockedSearchIndexService.getPageById(annotations.get(0).getPageId()))
        .thenReturn(page);

    return annotations;
  }
  
  private String readStringFromRelativePath(String relativePath) throws IOException {
    return Files.readString(
        Path.of("src/test/resources/accessService/" + relativePath));
  }

  private Annotation createAnnotation1() throws JSONException{
    List<String> creatorList = new ArrayList<>();
    creatorList.add("M. K.");

    Annotation expectedAnnotation1 = new Annotation();
    expectedAnnotation1.setId("http://sampleannoserver.edu/wap/a04/validated/bb43925c-9903-43f6-92c4-0b3ed4b1d3d9");
    expectedAnnotation1.setCreated(Instant.parse("2019-07-04T06:57:35.961Z"));
    expectedAnnotation1.setCreators(creatorList);
    expectedAnnotation1.setModified(Instant.parse("2019-07-04T07:03:03Z"));
    expectedAnnotation1.setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/1749ce9c-a79a-4929-8299-edc9c0388fcc");
    expectedAnnotation1.setIsAlgorithmAnnotation(false);
    expectedAnnotation1.setPageId("cb679599-7191-422c-923b-89c31c045f1d");
    List<Target> targets3 = new ArrayList<>();
    Target target3 = new Target();
    SVGSelector svgSelector3 = new SVGSelector("<svg><rect x=\"214\" y=\"73\" width=\"3008\" height=\"4467\"/></svg>");
	target3.setSelector(svgSelector3);
	targets3.add(target3);
    expectedAnnotation1.setTargets(targets3);
    expectedAnnotation1.setMotivation("describing");
    expectedAnnotation1.setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/1749ce9c-a79a-4929-8299-edc9c0388fcc");
    expectedAnnotation1.setEtag("abc");
    TextCard expectedTextCard = new TextCard(UUID.randomUUID().toString());
    expectedTextCard.setCreators(creatorList);
    expectedTextCard.setValue("Questionable text block");
    expectedTextCard.setPurpose("questioning");
    expectedTextCard.setFullJson(new JSONObject("{\n" +
        "    \"type\" : \"TextualBody\",\n" +
        "    \"creator\" : {\n" +
        "      \"type\" : \"Person\",\n" +
        "      \"name\" : \"M. K.\"\n" +
        "    },\n" +
        "    \"value\" : \"Questionable text block\",\n" +
        "    \"purpose\" : \"questioning\"\n" +
        "  }"));
    expectedAnnotation1.addTextCard(expectedTextCard);
    Tag expectedTag = new Tag(UUID.randomUUID().toString());
    expectedTag.setCreators(creatorList);
    expectedTag.setValue("Questionable tag");
    expectedTag.setPurpose("tagging");
    expectedTag.setFullJson(new JSONObject("{\n" +
        "    \"type\" : \"TextualBody\",\n" +
        "    \"creator\" : [ {\n" +
        "      \"type\" : \"Person\",\n" +
        "      \"name\" : \"M. K.\"\n" +
        "    }, {\n" +
        "      \"type\" : \"Software\",\n" +
        "      \"name\" : \"Akita\"\n" +
        "    } ],\n" +
        "    \"value\" : \"Questionable tag\",\n" +
        "    \"purpose\" : \"tagging\"\n" +
        "  }"));
    expectedAnnotation1.addTag(expectedTag);

    return expectedAnnotation1;
  }
}