package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.assistance.User;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.IRepositoryAccessService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.body.Body;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.target.SVGSelector;
import edu.kit.datamanager.takita.model.target.Target;

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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = EditorService.class)
@TestPropertySource("classpath:application-test.properties")
class EditorServiceTest {

  @Autowired
  private IEditorService EditorService;

  @MockBean
  private IAssistanceService mockedAssistanceService;

  @MockBean
  private ISearchIndexService mockedSearchIndexService;

  @MockBean
  private IRepositoryAccessService mockRepositoryAccessService;

  @MockBean
  private IAnnotationStoreAccessService mockAnnotationStoreAccessService;

  @Test
  void addAnnotation1() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("tagging");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
         });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(), targets, annotation.getMotivation().toString());
    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation2() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("moderating");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });
    
    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation3() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("bookmarking");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation4() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("classifying");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation5() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("commenting");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation6() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("describing");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }
  @Test
  void addAnnotation7() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("editing");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation8() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("highlighting");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation9() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("identifying");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
       targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }
  @Test
  void addAnnotation10() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("moderating");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation11() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("replying");

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void getAnnotation() throws NoSuchIndexEntryException {
    Annotation annotation = buildMockAnnotation("highlighting");

    Mockito.when(mockedSearchIndexService.getAnnotationById(annotation.getId()
    )).thenReturn(annotation);

    assertEqualsAnnotations(annotation, EditorService.getAnnotation(annotation.getId()));
  }

  @Test
  void updateAnnotation1() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException {
    Annotation annotation = buildMockAnnotation("replying");
    User currentUser = new User("Maximilian Walz");

    Annotation updatedAnnotation = buildMockAnnotation("commenting");
    updatedAnnotation.addCreator(currentUser.getName());
    updatedAnnotation.setEtag("qwertzuiop");

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.getAnnotationById(annotation.getId()
    )).thenReturn(annotation);
    Mockito.when(mockedSearchIndexService.updateAnnotation(Mockito.any(Annotation.class))).thenAnswer(invocation -> {
      Annotation thisAnnotation = invocation.getArgument(0);
      assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
      assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
      assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
      return updatedAnnotation;
    });

    Annotation actualAnnotation = EditorService.updateAnnotation(annotation.getId(),
       null, null);

    assertEqualsAnnotations(updatedAnnotation, actualAnnotation);
  }

  @Test
  void updateAnnotation2() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException {
    Annotation annotation = buildMockAnnotation("replying");
    User currentUser = new User("Maximilian Walz");

    Annotation updatedAnnotation = buildMockAnnotation("commenting");
    updatedAnnotation.addCreator(currentUser.getName());
    updatedAnnotation.setEtag("qwertzuiop");

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.getAnnotationById(annotation.getId()
    )).thenReturn(annotation);
    Mockito.when(mockedSearchIndexService.updateAnnotation(Mockito.any(Annotation.class))).thenAnswer(invocation -> {
      Annotation thisAnnotation = invocation.getArgument(0);
      assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
      return updatedAnnotation;
    });

    JSONArray targets = new JSONArray();
    targets.put(updatedAnnotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.updateAnnotation(annotation.getId(),
        targets, updatedAnnotation.getMotivation().toString());

    assertEqualsAnnotations(updatedAnnotation, actualAnnotation);
  }

  @Test
  void validateAnnotation() throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException {
    Annotation validatedAnnotation = buildMockAnnotation("tagging");
    Annotation unvalidatedAnnotation = buildMockAnnotation("tagging");
    unvalidatedAnnotation.setId(validatedAnnotation.getVia());
    unvalidatedAnnotation.setVia("");
    unvalidatedAnnotation.setCanonical("");
    User currentUser = new User("Nicoletta Pütz");
    validatedAnnotation.addCreator(currentUser.getName());

    Mockito.when(mockedSearchIndexService.getAnnotationById(unvalidatedAnnotation.getId())).thenReturn(unvalidatedAnnotation);
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.validateAnnotation(Mockito.any(Annotation.class))).thenAnswer(invocation -> {
      Annotation thisAnnotation = invocation.getArgument(0);
      assertEquals(validatedAnnotation.getPageId(), thisAnnotation.getPageId());
      assertEquals(validatedAnnotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
      assertEquals(validatedAnnotation.getMotivation(), thisAnnotation.getMotivation());
      return validatedAnnotation;
    });

    assertEqualsAnnotations(validatedAnnotation, EditorService.validateAnnotation(unvalidatedAnnotation.getId()));
  }

  @Test
  void deleteAnnotation() throws NoSuchIndexEntryException, IOException, InterruptedException {
    Annotation annotation = buildMockAnnotation("questioning");

    Mockito.when(mockedSearchIndexService.getAnnotationById(annotation.getId())).thenReturn(annotation);

    assertEqualsAnnotations(annotation, EditorService.deleteAnnotation(annotation.getId()));
  }

  @Test
  void addTextCard() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException, org.json.JSONException {
    TextCard textCard = buildMockTextCard("questioning");
    User currentUser = new User(textCard.getCreators().get(0));

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.addBody(Mockito.any(Body.class))).thenAnswer(invocation -> {
      TextCard thisTextCard = invocation.getArgument(0);
      assertEquals(textCard.getAnnotationId(), thisTextCard.getAnnotationId());
      assertEquals(textCard.getTitle(), thisTextCard.getTitle());
      assertEquals(textCard.getValue(), thisTextCard.getValue());
      assertEquals(textCard.getPurpose(), thisTextCard.getPurpose());
      return textCard;
    });

    assertEqualsBodies(textCard, EditorService
        .addTextCard(textCard.getAnnotationId(), textCard.getTitle(), textCard.getSubject(),
        textCard.getValue(), textCard.getSource(), textCard.getPurpose().toString()));
  }

  @Test
  void addTag() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException, org.json.JSONException {
    Tag tag = buildMockTag();
    User currentUser = new User(tag.getCreators().get(0));

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.addBody(Mockito.any(Body.class))).thenAnswer(invocation -> {
      Tag thisTag = invocation.getArgument(0);
      assertEquals(tag.getAnnotationId(), thisTag.getAnnotationId());
      assertEquals(tag.getTitle(), thisTag.getTitle());
      assertEquals(tag.getValue(), thisTag.getValue());
      return tag;
    });

    assertEqualsBodies(tag, EditorService.addTag(tag.getAnnotationId(), tag.getTitle(), tag.getSubject(),
    tag.getValue(), tag.getSource()));
  }

  @Test
  void getTextCard() throws NoSuchIndexEntryException, JSONException, org.json.JSONException {
    TextCard textCard = buildMockTextCard("bookmarking");

    Mockito.when(mockedSearchIndexService.getTextCardById(textCard.getId())).thenReturn(textCard);

    assertEqualsBodies(textCard, EditorService.getTextCard(textCard.getId()));
  }

  @Test
  void getTag() throws NoSuchIndexEntryException, JSONException, org.json.JSONException {
    Tag tag = buildMockTag();

    Mockito.when(mockedSearchIndexService.getTagById(tag.getId())).thenReturn(tag);

    assertEqualsBodies(tag, EditorService.getTag(tag.getId()));
  }

  @Test
  void updateTextCard() throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException, org.json.JSONException {
    TextCard textCard = buildMockTextCard("moderating");
    User currentUser = new User("Queen Elizabeth");
    TextCard updatedTextCard = buildMockTextCard("linking");
    updatedTextCard.addCreator(currentUser.getName());
    updatedTextCard.setValue("updatedValue");
    updatedTextCard.setTitle("updatedTitle");

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.getTextCardById(textCard.getId())).thenReturn(textCard);
    Mockito.when(mockedSearchIndexService.updateBody(Mockito.any(Body.class))).thenAnswer(invocation -> {
      TextCard thisTextCard = invocation.getArgument(0);
      assertEquals(textCard.getAnnotationId(), thisTextCard.getAnnotationId());
      assertEquals(textCard.getTitle(), thisTextCard.getTitle());
      assertEquals(textCard.getValue(), thisTextCard.getValue());
      assertEquals(textCard.getPurpose(), thisTextCard.getPurpose());
      return updatedTextCard;
    });

    assertEqualsBodies(updatedTextCard, EditorService.updateTextCard(textCard.getId(), updatedTextCard.getTitle(),
        updatedTextCard.getSubject(), updatedTextCard.getValue(), updatedTextCard.getSource(), 
        updatedTextCard.getPurpose().toString()));
  }

  @Test
  void updateTag() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException, org.json.JSONException {
    Tag tag = buildMockTag();
    User currentUser = new User("Queen Elizabeth");
    Tag updatedTag = buildMockTag();
    updatedTag.addCreator(currentUser.getName());
    updatedTag.setValue("updatedValue");
    updatedTag.setTitle("updatedTitle");

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.getTagById(tag.getId())).thenReturn(tag);
    Mockito.when(mockedSearchIndexService.updateBody(Mockito.any(Body.class))).thenAnswer(invocation -> {
      Tag thisTag = invocation.getArgument(0);
      assertEquals(tag.getAnnotationId(), thisTag.getAnnotationId());
      assertEquals(tag.getTitle(), thisTag.getTitle());
      assertEquals(tag.getValue(), thisTag.getValue());
      return updatedTag;
    });

    assertEqualsBodies(updatedTag, EditorService.updateTag(tag.getId(), updatedTag.getTitle(), 
    updatedTag.getSubject(), updatedTag.getValue(), updatedTag.getSource()));
  }

  @Test
  void deleteTextCard() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException, org.json.JSONException {
    TextCard textCard = buildMockTextCard("replying");

    Mockito.when(mockedSearchIndexService.getTextCardById(textCard.getId())).thenReturn(textCard);

    assertEqualsBodies(textCard, EditorService.deleteTextCard(textCard.getId()));
  }

  @Test
  void deleteTag() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException, org.json.JSONException {
    Tag tag = buildMockTag();

    Mockito.when(mockedSearchIndexService.getTagById(tag.getId())).thenReturn(tag);

    assertEqualsBodies(tag, EditorService.deleteTag(tag.getId()));
  }

  @Test
  void getManuscriptJson() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject manuscript = new JSONObject(readStringFromRelativePath("manuscript.json"));
    String manuscriptId = manuscript.getString("id");

    Mockito.when(mockedSearchIndexService.getRawManuscriptJson(manuscriptId)).thenReturn(manuscript);

    JSONAssert.assertEquals(manuscript.toString(), EditorService.getManuscriptJson(manuscriptId).toString(), true);
  }

  @Test
  void getManuscriptXml() throws IOException, InterruptedException {
    String manuscript = readStringFromRelativePath("manuscriptXml.xml");
    String manuscriptId = "1234567890";

    Mockito.when(mockedSearchIndexService.getRawManuscriptXml(manuscriptId)).thenReturn(manuscript);

    assertEquals(manuscript, EditorService.getManuscriptXml(manuscriptId));
  }

  @Test
  void getPageJson() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject page = new JSONObject(readStringFromRelativePath("page.json"));
    String pageId = page.getString("id");

    Mockito.when(mockedSearchIndexService.getRawPageJson(pageId)).thenReturn(page);

    JSONAssert.assertEquals(page.toString(), EditorService.getPageJson(pageId).toString(), true);
  }

  @Test
  void getAnnotationJson() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject annotation = new JSONObject(readStringFromRelativePath("annotation.json"));
    String annotationId = annotation.getString("id");

    Mockito.when(mockedSearchIndexService.getRawAnnotationJson(annotationId)).thenReturn(annotation);

    JSONAssert.assertEquals(annotation.toString(), EditorService.getAnnotationJson(annotationId).toString(), true);
  }

  private Annotation buildMockAnnotation(String motivation) {
    List<String> creators = new ArrayList<>();
    creators.add("Leonie Schmidt");

    Annotation mockAnnotation = new Annotation();

    mockAnnotation.setId("http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825");
    mockAnnotation.setPageId("758735a2-8e0d-4ac7-815e-bba2060217c3");
    mockAnnotation.setCreated(Instant.now());
    mockAnnotation.setModified(Instant.now());
    List<Target> mockTargets = new ArrayList<>();
    Target mockTarget = new Target();
    SVGSelector mockSvgSelector = new SVGSelector("<svg xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"279\" y=\"48\" width=\"2951\" height=\"4500\"/></svg>");
    mockTarget.setSelector(mockSvgSelector);
    mockTargets.add(mockTarget);
    mockAnnotation.setTargets(mockTargets);
    mockAnnotation.setCreators(creators);
    mockAnnotation.setIsAlgorithmAnnotation(false);
    mockAnnotation.setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89");
    mockAnnotation.setEtag("asdfghjklyxc");
    mockAnnotation.setMotivation(motivation);
    mockAnnotation.setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89");

    return mockAnnotation;
  }

  private TextCard buildMockTextCard(String motivation) {
    TextCard textCard = new TextCard(UUID.randomUUID().toString());
    List<String> creators = new ArrayList<>();
    creators.add("Leonie Schmidt");

    textCard.setAnnotationId("http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825");
    textCard.setCreated(Instant.now());
    textCard.setModified(Instant.now());
    textCard.setValue("value");
    textCard.setTitle("title");
    textCard.setPurpose(motivation);
    textCard.setCreators(creators);

    return textCard;
  }

  private Tag buildMockTag() {
    Tag tag = new Tag(UUID.randomUUID().toString());
    List<String> creators = new ArrayList<>();
    creators.add("Leonie Schmidt");

    tag.setAnnotationId("http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825");
    tag.setCreated(Instant.now());
    tag.setModified(Instant.now());
    tag.setValue("value");
    tag.setTitle("title");
    tag.setCreators(creators);

    return tag;
  }

  private void assertEqualsAnnotations(Annotation expectedAnno, Annotation actualAnno) {
    assertEquals(expectedAnno.getId(), actualAnno.getId());
    assertEquals(expectedAnno.getPageId(), actualAnno.getPageId());
    assertEquals(expectedAnno.getMotivation(), actualAnno.getMotivation());
    assertEquals(expectedAnno.getTargets().get(0).getSelector().toString(), actualAnno.getTargets().get(0).getSelector().toString());
    assertEquals(expectedAnno.getCanonical(), actualAnno.getCanonical());
    assertEquals(expectedAnno.getCreated(), actualAnno.getCreated());
    assertEquals(expectedAnno.getModified(), actualAnno.getModified());
    assertEquals(expectedAnno.getEtag(), actualAnno.getEtag());
    assertEquals(expectedAnno.getIsAlgorithmAnnotation(), actualAnno.getIsAlgorithmAnnotation());
    assertEquals(expectedAnno.getVia(), actualAnno.getVia());
    assertEquals(expectedAnno.getCreators().size(), actualAnno.getCreators().size());
    assertEquals(expectedAnno.getTags().size(), actualAnno.getTags().size());
    assertEquals(expectedAnno.getTextCards().size(), actualAnno.getTextCards().size());
    assertEquals(expectedAnno.getEtag(), actualAnno.getEtag());
    assertEquals(expectedAnno.getIsAlgorithmAnnotation(), actualAnno.getIsAlgorithmAnnotation());
    assertIterableEquals(expectedAnno.getCreators(), actualAnno.getCreators());
    assertIterableEquals(expectedAnno.getTextCards(), actualAnno.getTextCards());
    assertIterableEquals(expectedAnno.getTags(), actualAnno.getTags());
  }

  private void assertEqualsBodies(Body expectedBody, Body actualBody) throws JSONException, org.json.JSONException {
    assertEquals(expectedBody.getId(), actualBody.getId());
    assertEquals(expectedBody.getAnnotationId(), actualBody.getAnnotationId());
    assertEquals(expectedBody.getCreated(), actualBody.getCreated());
    assertEquals(expectedBody.getModified(), actualBody.getModified());
    assertEquals(expectedBody.getPurpose(), actualBody.getPurpose());
    assertEquals(expectedBody.getTitle(), actualBody.getTitle());
    assertEquals(expectedBody.getValue(), actualBody.getValue());
    assertEquals(expectedBody.getSubject(), actualBody.getSubject());
    assertEquals(expectedBody.getSource(), actualBody.getSource());
    JSONAssert.assertEquals(expectedBody.getFullJson().toString(), actualBody.getFullJson().toString(), true);
    assertEquals(expectedBody.getCreators().size(), actualBody.getCreators().size());
    assertIterableEquals(expectedBody.getCreators(), actualBody.getCreators());
  }

  private String readStringFromRelativePath(String relativePath) throws IOException {
    return Files.readString(
        Path.of("src/test/resources/editorService/" + relativePath));
  }
}