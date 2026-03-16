package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.assistance.User;
import edu.kit.datamanager.takita.dataaccess.AnnotationConverter;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.IRepositoryAccessService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.body.Body;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.TestPropertySource;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = {EditorService.class, AnnotationConverter.class})
@TestPropertySource("classpath:application-test.properties")
class EditorServiceTest {

  @Autowired
  private EditorService EditorService;

  @Autowired
  private AnnotationConverter annotationConverter;

  @MockitoBean
  private IAssistanceService mockedAssistanceService;

  @MockitoBean
  private ISearchIndexService mockedSearchIndexService;

  @MockitoBean
  private IRepositoryAccessService mockRepositoryAccessService;

  @MockitoBean
  private IAnnotationStoreAccessService mockAnnotationStoreAccessService;

  @Test
  void addAnnotation1() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("tagging");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
         });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(), targets, annotation.getMotivation(), annotation.getVia());
    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation2() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("moderating");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });
    
    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation3() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("bookmarking");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation4() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("classifying");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation5() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("commenting");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation6() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("describing");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }
  @Test
  void addAnnotation7() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("editing");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation8() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("highlighting");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation9() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("identifying");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
       targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }
  @Test
  void addAnnotation10() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("moderating");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation11() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation("replying");

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getTargets().get(0).getSelector().toString(), thisAnnotation.getTargets().get(0).getSelector().toString());
          assertEquals(annotation.getMotivation(), thisAnnotation.getMotivation());
          assertEquals(annotation.getVia(), thisAnnotation.getVia());
          return annotation;
        });

    JSONArray targets = new JSONArray();
    targets.put(annotation.getTargets().get(0).getSelector().getWADMSerialization());
    Annotation actualAnnotation = EditorService.addAnnotation(annotation.getPageId(),
        targets, annotation.getMotivation(), annotation.getVia());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation12() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    User creator = new User("creator");
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(creator);
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);
    Annotation actualAnnotation = EditorService.addAnnotation(
            page.getId(),
            null,
            "describing",
            null
    );

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
            .thenAnswer(invocation -> {
              Annotation thisAnnotation = invocation.getArgument(0);
              assertEquals(actualAnnotation.getPageId(), thisAnnotation.getPageId());
              assertEquals(actualAnnotation.getTargets().getFirst().getLinkToResource(), thisAnnotation.getTargets().getFirst().getLinkToResource());
              assertEquals(actualAnnotation.getTargets().getFirst().getType(), thisAnnotation.getTargets().getFirst().getType());
              assertEquals(actualAnnotation.getTargets().getFirst().getSelector(), thisAnnotation.getTargets().getFirst().getSelector());
              assertEquals(actualAnnotation.getMotivation(), thisAnnotation.getMotivation());
              assertEquals(actualAnnotation.getVia(), thisAnnotation.getVia());
              return actualAnnotation;
            });
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

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

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
      assertEquals(annotation.getVia(), thisAnnotation.getVia());
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

    annotation.setPageId("1234");
    Page page = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com");
    Mockito.when(mockedSearchIndexService.getPageById("1234")).thenReturn(page);

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

  @Test
  public void testConvertDisplayableAnnotationsToJson() throws JSONException, UnsupportedEncodingException, org.json.JSONException {
      // create mock annotation with some bodies
      Annotation annotation1 = buildMockAnnotation("describing");
      Tag tag1 = buildMockTag();
      Tag tag2 = buildMockTag();
      TextCard textCard = buildMockTextCard("replying");
      annotation1.addTag(tag1);
      annotation1.addTag(tag2);
      annotation1.addTextCard(textCard);

      // create mock "page" annotation with only textCard bodies. When using the buildMockAnnotation(), a target
      // will be created, which has to be replaced to create a "page" annotation
      Annotation annotation2 = buildMockAnnotation("identifying");
      TextCard textCard2 = buildMockTextCard("commenting");
      TextCard textCard3 = buildMockTextCard("classifying");
      Target target = new Target("https://example.com/test", null);
      annotation2.setTargets(List.of(target));
      annotation2.addTextCard(textCard2);
      annotation2.addTextCard(textCard3);

      JSONArray actual = EditorService.convertDisplayableAnnotationsToJson(Arrays.asList(annotation1, annotation2));
      JSONArray expected = new JSONArray("""
              [
                  {
                      "id": "http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825",
                      "idEncoded": "http%253A%252F%252Fsampleannoserver.edu%252Fwap%252Fa04%252Fvalidated%252Ffc2f1c02-5b48-4a5e-8fda-83b2e15ae825",
                      "targets": [
                          {
                              "selector": {
                                  "type": "SvgSelector",
                                  "value": "<svg xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"279\\" y=\\"48\\" width=\\"2951\\" height=\\"4500\\"/></svg>"
                              }
                          }
                      ],
                      "visible": true,
                      "created": "2019-03-11T14:13:45Z",
                      "creator": "[Leonie Schmidt]",
                      "modified": "2019-03-11T14:13:45Z",
                      "motivation": "describing",
                      "via": "http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89",
                      "tags": [
                          {"value": "value"},
                          {"value": "value"}
                      ],
                      "textCards": [
                          {
                              "value": "value",
                              "purpose": "replying"
                          }
                      ]
                  },
                  {
                      "id": "http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825",
                      "idEncoded": "http%253A%252F%252Fsampleannoserver.edu%252Fwap%252Fa04%252Fvalidated%252Ffc2f1c02-5b48-4a5e-8fda-83b2e15ae825",
                      "targets": [],
                      "visible": true,
                      "created": "2019-03-11T14:13:45Z",
                      "creator": "[Leonie Schmidt]",
                      "modified": "2019-03-11T14:13:45Z",
                      "motivation": "identifying",
                      "via": "http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89",
                      "tags": [],
                      "textCards": [
                          {
                              "value": "value",
                              "purpose": "commenting"
                          },
                          {
                              "value": "value",
                              "purpose": "classifying"
                          }
                      ]
                  }
              ]
              """);
      JSONAssert.assertEquals(expected.toString(), actual.toString().replace("\r\n", "\n"), true);
  }

  private Annotation buildMockAnnotation(String motivation) {
    List<String> creators = new ArrayList<>();
    creators.add("Leonie Schmidt");

    Annotation mockAnnotation = new Annotation();

    mockAnnotation.setId("http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825");
    mockAnnotation.setPageId("758735a2-8e0d-4ac7-815e-bba2060217c3");
    mockAnnotation.setCreated(Instant.parse("2019-03-11T14:13:45Z"));
    mockAnnotation.setModified(Instant.parse("2019-03-11T14:13:45Z"));
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
    textCard.setCreated(Instant.parse("2019-03-11T14:13:45Z"));
    textCard.setModified(Instant.parse("2019-03-11T14:13:45Z"));
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
    tag.setCreated(Instant.parse("2019-03-11T14:13:45Z"));
    tag.setModified(Instant.parse("2019-03-11T14:13:45Z"));
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