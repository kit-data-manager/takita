package edu.kit.datamanager.takita.mainpage.search;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.dataaccess.IAccessService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Body;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.test.context.TestPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;

@SpringBootTest(classes = SearchIndexService.class)
@TestPropertySource("classpath:application-test.properties")
class SearchIndexServiceTest {
  @Autowired
  private ISearchIndexService searchIndexService;

  @MockBean
  private IAccessService mockedAccessService;

  @MockBean
  private ManuscriptRepository mockedManuscriptRepository;

  @MockBean
  private ElasticsearchOperations mockedElasticsearchOperations;

  private List<Manuscript> manuscriptList;

  @BeforeEach
  void init() throws JSONException {
    manuscriptList = initManuscriptList();
  }

  @Test
  void buildIndex() {
  }

  @Test
  void updateIndex() {
  }

  @Test
  void addAnnotation() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);
    Annotation newAnnotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);
    newAnnotation.setId(null);
    newAnnotation.setCanonical(null);
    newAnnotation.setVia(null);
    newAnnotation.setEtag(null);

    Mockito.when(mockedAccessService.addAnnotation(Mockito.any(Annotation.class), Mockito.eq(manuscriptList.get(0)
        .getPages().get(0).getPageNumber()), anyString())).thenAnswer(invocation -> {
      Annotation thisAnnotation = invocation.getArgument(0);
      assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
      assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
      return annotation;
    });
    Mockito.when(mockedManuscriptRepository.findById(manuscriptList.get(0).getId()))
        .thenReturn(java.util.Optional.ofNullable(manuscriptList.get(0)));

    mockSearchHits(manuscriptList.get(0));

    Annotation actualAnnotation = searchIndexService.addAnnotation(newAnnotation);

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void getAnnotationById() throws NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);

    mockSearchHits(manuscriptList.get(0));

    assertEqualsAnnotations(annotation, searchIndexService.getAnnotationById(annotation.getId()));
  }

  @Test
  void getAnnotationForPageById() throws NoSuchIndexEntryException {
    List<Annotation> expectedAnnos = manuscriptList.get(0).getPages().get(0).getAnnotations();

    mockSearchHits(manuscriptList.get(0));

    List<Annotation> resultingAnnos = searchIndexService.getAnnotationsForPageById(manuscriptList.get(0).getPages().get(0).getId());

    assertEquals(expectedAnnos.size(), resultingAnnos.size());
    assertEqualsAnnotations(expectedAnnos.get(0), resultingAnnos.get(0));
  }

  @Test
  void updateAnnotation() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);

    Mockito.when(mockedAccessService.updateAnnotation(annotation, manuscriptList.get(0).getPages().get(0).getPageNumber()))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    assertEqualsAnnotations(annotation, searchIndexService.updateAnnotation(annotation));
  }

  @Test
  void validateAnnotation() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);

    Mockito.when(mockedAccessService.validateAnnotation(annotation, manuscriptList.get(0).getPages().get(0).getPageNumber(), "a04/"))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    assertEqualsAnnotations(annotation, searchIndexService.validateAnnotation(annotation));
  }

  @Test
  void deleteAnnotationById() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);

    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    searchIndexService.deleteAnnotationById(annotation.getId());
  }

  @Test
  void addTextCard() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);
    Body body = new TextCard(UUID.randomUUID().toString());
    body.setAnnotationId(annotation.getId());
    body.setCreated(Instant.now());
    body.setModified(Instant.now());
    body.setValue("value");
    body.setTitle("title");
    
    JSONObject bodyJson = new JSONObject();
    bodyJson.put("id", body.getId());
    bodyJson.put("annotationId", body.getAnnotationId());
    bodyJson.put("created", body.getCreated());
    bodyJson.put("modified", body.getModified());
    bodyJson.put("value", body.getValue());
    bodyJson.put("title", body.getTitle());
    body.setFullJson(bodyJson);

    Mockito.when(mockedAccessService.updateAnnotation(annotation, manuscriptList.get(0).getPages().get(0).getPageNumber()))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    assertEqualsBody(body, searchIndexService.addBody(body));
  }

  @Test
  void addTag() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);
    System.out.println(annotation);
    Body body = new Tag(UUID.randomUUID().toString());
    body.setAnnotationId(annotation.getId());
    body.setCreated(Instant.now());
    body.setModified(Instant.now());
    body.setValue("value");
    body.setTitle("title");

    JSONObject bodyJson = new JSONObject();
    bodyJson.put("id", body.getId());
    bodyJson.put("annotationId", body.getAnnotationId());
    bodyJson.put("created", body.getCreated());
    bodyJson.put("modified", body.getModified());
    bodyJson.put("value", body.getValue());
    bodyJson.put("title", body.getTitle());
    body.setFullJson(bodyJson);

    System.out.println("addTagTest: " + body + body.getAnnotationId() + body.getCreated());

    Mockito.when(mockedAccessService.updateAnnotation(annotation, manuscriptList.get(0).getPages().get(0).getPageNumber()))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    assertEqualsBody(body, searchIndexService.addBody(body));
  }

  @Test
  void getTextCardById() throws NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);
    Body body = annotation.getTextCards().get(0);

    mockSearchHits(manuscriptList.get(0));

    assertEqualsBody(body, searchIndexService.getTextCardById(body.getId()));
  }

  @Test
  void getTagById() throws NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(1).getPages().get(0).getAnnotations().get(0);
    Body body = annotation.getTags().get(0);

    mockSearchHits(manuscriptList.get(1));

    assertEqualsBody(body, searchIndexService.getTagById(body.getId()));
  }

  @Test
  void updateTextCard() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);
    Body body = annotation.getTextCards().get(0);
    body.setAnnotationId(annotation.getId());
    body.setModified(Instant.now());
    body.setValue("value");
    body.setTitle("title");
    body.setPurpose("describing");
    JSONObject bodyJson = body.getFullJson();
    bodyJson.put("annotationId", body.getAnnotationId());
    bodyJson.put("modified", body.getModified());
    bodyJson.put("value", body.getValue());
    bodyJson.put("title", body.getTitle());
    bodyJson.put("purpose", body.getPurpose());
    body.setFullJson(bodyJson);

    Mockito.when(mockedAccessService.updateAnnotation(annotation, manuscriptList.get(0).getPages().get(0).getPageNumber()))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    assertEqualsBody(body, searchIndexService.updateBody(body));
  }

  @Test
  void updateTag() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(1).getPages().get(0).getAnnotations().get(0);
    Body body = annotation.getTags().get(0);
    body.setAnnotationId(annotation.getId());
    body.setModified(Instant.now());
    body.setValue("value");
    body.setTitle("title");
    JSONObject bodyJson = body.getFullJson();
    bodyJson.put("annotationId", body.getAnnotationId());
    bodyJson.put("modified", body.getModified());
    bodyJson.put("value", body.getValue());
    bodyJson.put("title", body.getTitle());
    body.setFullJson(bodyJson);

    Mockito.when(mockedAccessService.updateAnnotation(annotation, manuscriptList.get(1).getPages().get(0).getPageNumber()))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(1).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(1));
        });
    mockSearchHits(manuscriptList.get(1));

    assertEqualsBody(body, searchIndexService.updateBody(body));
  }

  @Test
  void deleteTextCardById() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(0).getPages().get(0).getAnnotations().get(0);
    Body body = annotation.getTextCards().get(0);

    Mockito.when(mockedAccessService.updateAnnotation(annotation, manuscriptList.get(0).getPages().get(0).getPageNumber()))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    searchIndexService.deleteBodyById(body.getId());
  }



  @Test
  void deleteTagById() throws InterruptedException, IOException, JSONException, NoSuchIndexEntryException {
    Annotation annotation = manuscriptList.get(1).getPages().get(0).getAnnotations().get(0);
    Body body = annotation.getTags().get(0);

    Mockito.when(mockedAccessService.updateAnnotation(annotation, manuscriptList.get(1).getPages().get(0).getPageNumber()))
        .thenReturn(annotation);
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(1).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(1));
        });
    mockSearchHits(manuscriptList.get(1));

    searchIndexService.deleteBodyById(body.getId());
  }

  @Test
  void getManuscriptById() throws NoSuchIndexEntryException {
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });

    assertEqualsManuscripts(manuscriptList.get(0), searchIndexService.getManuscriptById(manuscriptList.get(0).getId()));
  }

  @Test
  void getPageById() throws NoSuchIndexEntryException {
    Mockito.when(mockedManuscriptRepository.findById(Mockito.anyString()))
        .thenAnswer(invocation -> {
          String thisManuscriptId = invocation.getArgument(0);
          assertEquals(manuscriptList.get(0).getId(), thisManuscriptId);
          return java.util.Optional.ofNullable(manuscriptList.get(0));
        });
    mockSearchHits(manuscriptList.get(0));

    assertEqualsPages(manuscriptList.get(0).getPages().get(0), searchIndexService.getPageById(manuscriptList.get(0).getPages().get(0).getId()));
  }

  @Test
  void getRawManuscriptJson() throws InterruptedException, IOException, JSONException, org.json.JSONException {
    JSONObject manuscript = new JSONObject(readStringFromRelativePath("manuscript.json"));

    Mockito.when(mockedAccessService.getRawManuscriptJson(manuscriptList.get(0).getId())).thenReturn(manuscript);

    JSONAssert.assertEquals(manuscript.toString(),
        searchIndexService.getRawManuscriptJson(manuscriptList.get(0).getId()).toString(), true);
  }

  @Test
  void getRawPageJson() throws InterruptedException, JSONException, IOException, org.json.JSONException {
    JSONObject page = new JSONObject(readStringFromRelativePath("page.json"));

    Mockito.when(mockedAccessService.getRawPageJson(manuscriptList.get(0).getPages().get(0).getId())).thenReturn(page);

    JSONAssert.assertEquals(page.toString(),
        searchIndexService.getRawPageJson(manuscriptList.get(0).getPages().get(0).getId()).toString(), true);
  }

  @Test
  void getRawAnnotationJson() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject annotation = new JSONObject(readStringFromRelativePath("annotation.json"));

    Mockito.when(mockedAccessService.getRawAnnotationJson("http://sampleannoserver.edu/wap/a04/deinterpretatione/3fe548c5-8be6-40f7-88c8-0118e47c9ac8")).thenReturn(annotation);

    JSONAssert.assertEquals(annotation.toString(), searchIndexService.getRawAnnotationJson(
        "http://sampleannoserver.edu/wap/a04/deinterpretatione/3fe548c5-8be6-40f7-88c8-0118e47c9ac8").toString(), true);
  }

  @Test
  void getRawManuscriptXml() throws IOException, InterruptedException {
    String manuscript = readStringFromRelativePath("manuscriptXml.xml");

    Mockito.when(mockedAccessService.getRawManuscriptXml(manuscriptList.get(0).getId())).thenReturn(manuscript);

    assertEquals(manuscript, searchIndexService.getRawManuscriptXml(manuscriptList.get(0).getId()));
  }

  private List<Manuscript> initManuscriptList() throws JSONException {
    //DateFormat dateFormatMillis = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat();
    List<Manuscript> manuscripts = new ArrayList<>();

    Manuscript manuscript1 = new Manuscript(
        "000073cd-c425-4214-9648-b380ff20c61a",
        Instant.parse("2019-03-11T14:13:45.000Z"),
        "Vatikan Vat Gr 247", "SFB 980 - A04", 2019);
    manuscript1.getPages().add(new ImagePage("b2f8e261-a6ca-4ae5-ab91-5fb18d64d5b6",
        ResourceType.IMAGE, "1", Instant.parse("2019-03-11T14:13:39.000Z"), "", ""));
    Annotation anno1 = new Annotation();
    anno1.setId("11");
    List<TextCard> textCards1 = new ArrayList<>();
    TextCard t1 = new TextCard("11111");
    t1.setAnnotationId(anno1.getId());
    t1.setCreated(Instant.now());
    JSONObject t1json = new JSONObject();
    t1json.put("id", t1.getId());
    t1json.put("annotationId", t1.getAnnotationId());
    t1json.put("created", t1.getCreated());
    t1.setFullJson(t1json);
    textCards1.add(t1);
    anno1.setTextCards(textCards1);
    anno1.setPageId(manuscript1.getPages().get(0).getId());
    manuscript1.getPages().get(0).addAnnotation(anno1);
    manuscript1.getPages().get(0).setManuscriptId(manuscript1.getId());
    manuscript1.getPages().add(new ImagePage("b2f8e261-a6ca-4ae5-ab91-5fb18d64d5b7",
        ResourceType.IMAGE, "2", Instant.parse("2019-03-11T14:13:40.000Z"), "", ""));

    Manuscript manuscript2 = new Manuscript(
        "000b458c-67d5-445e-8274-73e8e4582952",
        Instant.parse("2019-04-11T14:13:45.000Z"),
        "Vatikan Vat Gr 666", "SFB 980 - A04", 2019);
    manuscript2.getPages().add(new ImagePage("5c17cfb4-151b-4f5d-9679-242a2434edaf",
        ResourceType.IMAGE, "1", Instant.parse("2019-04-11T14:13:39.000Z"), "", ""));
    Annotation anno2 = new Annotation();
    anno2.setId("22");
    List<Tag> tags1 = new ArrayList<>();
    Tag tag1 = new Tag("22222");
    tag1.setCreated(Instant.now());
    JSONObject tag1json = new JSONObject();
    tag1json.put("id", tag1.getId());
    tag1json.put("created", tag1.getCreated());
    tag1.setFullJson(tag1json);
    tags1.add(tag1);
    anno2.setTags(tags1);
    anno2.setPageId(manuscript2.getPages().get(0).getId());
    manuscript2.getPages().get(0).setManuscriptId(manuscript2.getId());
    manuscript2.getPages().get(0).addAnnotation(anno2);
    Annotation anno3 = new Annotation();
    anno3.setId("33");
    List<Tag> tags3 = new ArrayList<>();
    Tag tag2 = new Tag("33333");
    tag2.setCreated(Instant.now());
    tags3.add(tag2);
    anno3.setTags(tags3);
    List<TextCard> textCards3 = new ArrayList<>();
    TextCard t3 = new TextCard("33334");
    t3.setCreated(Instant.now());
    textCards3.add(t3);
    anno3.setTextCards(textCards3);
    anno3.setPageId(manuscript2.getPages().get(0).getId());
    manuscript2.getPages().get(0).addAnnotation(anno3);

    manuscripts.add(manuscript1);
    manuscripts.add(manuscript2);
    return manuscripts;
  }

  private void assertEqualsManuscripts(Manuscript expectedManuscript, Manuscript actualManuscript) {
    assertEquals(expectedManuscript.getId(), actualManuscript.getId());
    assertEquals(expectedManuscript.getTitle(), actualManuscript.getTitle());
    assertEquals(expectedManuscript.getCreated(), actualManuscript.getCreated());
    assertEquals(expectedManuscript.getNoPages(), actualManuscript.getNoPages());
    assertEquals(expectedManuscript.getPublicationYear(), actualManuscript.getPublicationYear());
    assertEquals(expectedManuscript.getPublisher(), actualManuscript.getPublisher());
    assertEquals(expectedManuscript.getPages().size(), actualManuscript.getPages().size());
    for (Page expectedPage : expectedManuscript.getPages()) {
      for (Page actualPage : actualManuscript.getPages()) {
        if (expectedPage.getId().equals(actualManuscript.getId())) {
          assertEqualsPages(expectedPage, actualPage);
        }
      }
    }
  }

  private void assertEqualsPages(Page expectedPage, Page actualPage) {
    assertEquals(expectedPage.getId(), actualPage.getId());
    assertEquals(expectedPage.getManuscriptId(), actualPage.getManuscriptId());
    assertEquals(expectedPage.getCreated(), actualPage.getCreated());
    assertEquals(expectedPage.getPageNumber(), actualPage.getPageNumber());
    assertEquals(expectedPage.getResourceType(), actualPage.getResourceType());
    assertEquals(expectedPage.getAnnotations().size(), actualPage.getAnnotations().size());
  }

  private void assertEqualsAnnotations(Annotation expectedAnno, Annotation actualAnno) {
    assertEquals(expectedAnno.getId(), actualAnno.getId());
    assertEquals(expectedAnno.getPageId(), actualAnno.getPageId());
    assertEquals(expectedAnno.getSvgCode(), actualAnno.getSvgCode());
    assertEquals(expectedAnno.getCanonical(), actualAnno.getCanonical());
    assertEquals(expectedAnno.getCreated(), actualAnno.getCreated());
    assertEquals(expectedAnno.getModified(), actualAnno.getModified());
    assertEquals(expectedAnno.getEtag(), actualAnno.getEtag());
    assertEquals(expectedAnno.getIsAlgorithmAnnotation(), actualAnno.getIsAlgorithmAnnotation());
    assertEquals(expectedAnno.getVia(), actualAnno.getVia());
    assertEquals(expectedAnno.getCreators().size(), actualAnno.getCreators().size());
    assertEquals(expectedAnno.getTags().size(), actualAnno.getTags().size());
    assertEquals(expectedAnno.getTextCards().size(), actualAnno.getTextCards().size());
    if (expectedAnno.getTextCards().size() > 0) {
      for (TextCard expectedTextCard : expectedAnno.getTextCards()) {
        for (TextCard actualTextCard : actualAnno.getTextCards()) {
          if (expectedTextCard.getId().equals(actualTextCard.getId())) {
            assertEqualsBody(expectedTextCard, actualTextCard);
          }
        }
      }
    }
    if (expectedAnno.getTags().size() > 0) {
      for (Tag expectedTag : expectedAnno.getTags()) {
        for (Tag actualTag : actualAnno.getTags()) {
          if (expectedTag.getId().equals(actualTag.getId())) {
            assertEqualsBody(expectedTag, actualTag);
          }
        }
      }
    }
  }

  private void assertEqualsBody(Body expectedBody, Body actualBody) {
    assertEquals(expectedBody.getId(), actualBody.getId());
    assertEquals(expectedBody.getTitle(), actualBody.getTitle());
    assertEquals(expectedBody.getValue(), actualBody.getValue());
    assertEquals(expectedBody.getAnnotationId(), actualBody.getAnnotationId());
    assertEquals(expectedBody.getCreated(), actualBody.getCreated());
    assertEquals(expectedBody.getModified(), actualBody.getModified());
  }

  private void mockSearchHits(Manuscript manuscript) {
    SearchHit<Manuscript> mockedHit = Mockito.mock(SearchHit.class);
    Mockito.when(mockedHit.getContent()).thenReturn(manuscript);
    SearchHits<Manuscript> mockedHits = Mockito.mock(SearchHits.class);
    Mockito.when(mockedHits.getSearchHit(0)).thenReturn(mockedHit);
    Mockito.when(mockedElasticsearchOperations.search(Mockito.any(Query.class),
        Mockito.eq(Manuscript.class), Mockito.any(IndexCoordinates.class)))
        .thenReturn(mockedHits);
    Mockito.when(mockedHits.hasSearchHits()).thenReturn(true);
  }

  private String readStringFromRelativePath(String relativePath) throws IOException {
    return Files.readString(
        Path.of("src/test/resources/editorService/" + relativePath));
  }
}