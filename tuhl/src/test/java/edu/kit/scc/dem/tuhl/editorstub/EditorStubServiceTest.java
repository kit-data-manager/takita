package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.assistance.User;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.Motivation;
import edu.kit.scc.dem.tuhl.model.body.Body;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EditorStubServiceTest {

  @Autowired
  private IEditorStubService editorStubService;

  @MockBean
  private IAssistanceService mockedAssistanceService;

  @MockBean
  private ISearchIndexService mockedSearchIndexService;

  @Test
  void addAnnotation1() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.DEFAULT, Motivation.TAGGING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
         });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation2() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.TEXT_REGION, Motivation.ASSESSING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation3() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.PAGE_REGION, Motivation.BOOKMARKING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation4() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.LINE_DRAWING_REGION, Motivation.CLASSIFYING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation5() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.GRAPHIC_REGION, Motivation.COMMENTING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation6() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.TABLE_REGION, Motivation.DESCRIBING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }
  @Test
  void addAnnotation7() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.CHART_REGION, Motivation.EDITING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation8() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.SEPARATOR_REGION, Motivation.HIGHLIGHTING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation9() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.MATHS_REGION, Motivation.IDENTIFYING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }
  @Test
  void addAnnotation10() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.CHEM_REGION, Motivation.MODERATING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void addAnnotation11() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException {
    Annotation annotation = buildMockAnnotation(Color.ADVERT_REGION, Motivation.REPLYING);

    User currentUser = new User(annotation.getCreators().get(0));
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);

    Mockito.when(mockedSearchIndexService.addAnnotation(Mockito.any(Annotation.class)))
        .thenAnswer(invocation -> {
          Annotation thisAnnotation = invocation.getArgument(0);
          assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
          assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
          assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
          assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
          return annotation;
        });

    Annotation actualAnnotation = editorStubService.addAnnotation(annotation.getPageId(), annotation.getColor().toString(),
        annotation.getSvgCode(), annotation.getMotivation().toString());

    assertEqualsAnnotations(annotation, actualAnnotation);
  }

  @Test
  void getAnnotation() throws NoSuchIndexEntryException {
    Annotation annotation = buildMockAnnotation(Color.TABLE_REGION, Motivation.HIGHLIGHTING);

    Mockito.when(mockedSearchIndexService.getAnnotationById(annotation.getId()
    )).thenReturn(annotation);

    assertEqualsAnnotations(annotation, editorStubService.getAnnotation(annotation.getId()));
  }

  @Test
  void updateAnnotation1() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException {
    Annotation annotation = buildMockAnnotation(Color.TEXT_REGION, Motivation.REPLYING);
    User currentUser = new User("Maximilian Walz");

    Annotation updatedAnnotation = buildMockAnnotation(Color.CUSTOM_REGION, Motivation.COMMENTING);
    updatedAnnotation.addCreator(currentUser.getName());
    updatedAnnotation.setEtag("qwertzuiop");

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.getAnnotationById(annotation.getId()
    )).thenReturn(annotation);
    Mockito.when(mockedSearchIndexService.updateAnnotation(Mockito.any(Annotation.class))).thenAnswer(invocation -> {
      Annotation thisAnnotation = invocation.getArgument(0);
      assertEquals(annotation.getPageId(), thisAnnotation.getPageId());
      assertEquals(annotation.getSvgCode(), thisAnnotation.getSvgCode());
      assertEquals(annotation.getColor().getName(), thisAnnotation.getColor().getName());
      assertEquals(annotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
      return updatedAnnotation;
    });

    Annotation actualAnnotation = editorStubService.updateAnnotation(annotation.getId(),
        Color.IMAGE_REGION.toString(), null, null);

    assertEqualsAnnotations(updatedAnnotation, actualAnnotation);
  }

  @Test
  void updateAnnotation2() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException {
    Annotation annotation = buildMockAnnotation(Color.TEXT_REGION, Motivation.REPLYING);
    User currentUser = new User("Maximilian Walz");

    Annotation updatedAnnotation = buildMockAnnotation(Color.UNKNOWN_REGION, Motivation.COMMENTING);
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

    Annotation actualAnnotation = editorStubService.updateAnnotation(annotation.getId(),
        Color.UNKNOWN_REGION.toString(), updatedAnnotation.getSvgCode(), updatedAnnotation.getMotivation().toString());

    assertEqualsAnnotations(updatedAnnotation, actualAnnotation);
  }

  @Test
  void validateAnnotation() throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException {
    Annotation validatedAnnotation = buildMockAnnotation(Color.DEFAULT, Motivation.TAGGING);
    Annotation unvalidatedAnnotation = buildMockAnnotation(Color.DEFAULT, Motivation.TAGGING);
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
      assertEquals(validatedAnnotation.getSvgCode(), thisAnnotation.getSvgCode());
      assertEquals(validatedAnnotation.getColor().getName(), thisAnnotation.getColor().getName());
      assertEquals(validatedAnnotation.getMotivation().getName(), thisAnnotation.getMotivation().getName());
      return validatedAnnotation;
    });

    assertEqualsAnnotations(validatedAnnotation, editorStubService.validateAnnotation(unvalidatedAnnotation.getId()));
  }

  @Test
  void deleteAnnotation() throws NoSuchIndexEntryException, IOException, InterruptedException {
    Annotation annotation = buildMockAnnotation(Color.CUSTOM_REGION, Motivation.QUESTIONING);

    Mockito.when(mockedSearchIndexService.getAnnotationById(annotation.getId())).thenReturn(annotation);

    assertEqualsAnnotations(annotation, editorStubService.deleteAnnotation(annotation.getId()));
  }

  @Test
  void addTextCard() throws InterruptedException, NoSuchIndexEntryException, JSONException, IOException, org.json.JSONException {
    TextCard textCard = buildMockTextCard(Motivation.QUESTIONING);
    User currentUser = new User(textCard.getCreators().get(0));

    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(currentUser);
    Mockito.when(mockedSearchIndexService.addBody(Mockito.any(Body.class))).thenAnswer(invocation -> {
      TextCard thisTextCard = invocation.getArgument(0);
      assertEquals(textCard.getAnnotationId(), thisTextCard.getAnnotationId());
      assertEquals(textCard.getTitle(), thisTextCard.getTitle());
      assertEquals(textCard.getValue(), thisTextCard.getValue());
      assertEquals(textCard.getPurpose().getName(), thisTextCard.getPurpose().getName());
      return textCard;
    });

    assertEqualsBodies(textCard, editorStubService
        .addTextCard(textCard.getAnnotationId(), textCard.getTitle(), textCard.getValue(), textCard.getPurpose().toString()));
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

    assertEqualsBodies(tag, editorStubService.addTag(tag.getAnnotationId(), tag.getTitle(), tag.getValue()));
  }

  @Test
  void getTextCard() throws NoSuchIndexEntryException, JSONException, org.json.JSONException {
    TextCard textCard = buildMockTextCard(Motivation.ASSESSING);

    Mockito.when(mockedSearchIndexService.getTextCardById(textCard.getId())).thenReturn(textCard);

    assertEqualsBodies(textCard, editorStubService.getTextCard(textCard.getId()));
  }

  @Test
  void getTag() throws NoSuchIndexEntryException, JSONException, org.json.JSONException {
    Tag tag = buildMockTag();

    Mockito.when(mockedSearchIndexService.getTagById(tag.getId())).thenReturn(tag);

    assertEqualsBodies(tag, editorStubService.getTag(tag.getId()));
  }

  @Test
  void updateTextCard() throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException, org.json.JSONException {
    TextCard textCard = buildMockTextCard(Motivation.MODERATING);
    User currentUser = new User("Queen Elizabeth");
    TextCard updatedTextCard = buildMockTextCard(Motivation.LINKING);
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
      assertEquals(textCard.getPurpose().getName(), thisTextCard.getPurpose().getName());
      return updatedTextCard;
    });

    assertEqualsBodies(updatedTextCard, editorStubService.updateTextCard(textCard.getId(), updatedTextCard.getTitle(),
        updatedTextCard.getValue(), updatedTextCard.getPurpose().toString()));
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

    assertEqualsBodies(updatedTag, editorStubService.updateTag(tag.getId(), updatedTag.getTitle(), updatedTag.getValue()));
  }

  @Test
  void deleteTextCard() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException, org.json.JSONException {
    TextCard textCard = buildMockTextCard(Motivation.REPLYING);

    Mockito.when(mockedSearchIndexService.getTextCardById(textCard.getId())).thenReturn(textCard);

    assertEqualsBodies(textCard, editorStubService.deleteTextCard(textCard.getId()));
  }

  @Test
  void deleteTag() throws NoSuchIndexEntryException, IOException, InterruptedException, JSONException, org.json.JSONException {
    Tag tag = buildMockTag();

    Mockito.when(mockedSearchIndexService.getTagById(tag.getId())).thenReturn(tag);

    assertEqualsBodies(tag, editorStubService.deleteTag(tag.getId()));
  }

  @Test
  void getManuscriptJson() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject manuscript = new JSONObject(readStringFromRelativePath("manuscript.json"));
    String manuscriptId = manuscript.getString("id");

    Mockito.when(mockedSearchIndexService.getRawManuscriptJson(manuscriptId)).thenReturn(manuscript);

    JSONAssert.assertEquals(manuscript.toString(), editorStubService.getManuscriptJson(manuscriptId).toString(), true);
  }

  @Test
  void getManuscriptXml() throws IOException, InterruptedException {
    String manuscript = readStringFromRelativePath("manuscriptXml.xml");
    String manuscriptId = "1234567890";

    Mockito.when(mockedSearchIndexService.getRawManuscriptXml(manuscriptId)).thenReturn(manuscript);

    assertEquals(manuscript, editorStubService.getManuscriptXml(manuscriptId));
  }

  @Test
  void getPageJson() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject page = new JSONObject(readStringFromRelativePath("page.json"));
    String pageId = page.getString("id");

    Mockito.when(mockedSearchIndexService.getRawPageJson(pageId)).thenReturn(page);

    JSONAssert.assertEquals(page.toString(), editorStubService.getPageJson(pageId).toString(), true);
  }

  @Test
  void getAnnotationJson() throws IOException, JSONException, InterruptedException, org.json.JSONException {
    JSONObject annotation = new JSONObject(readStringFromRelativePath("annotation.json"));
    String annotationId = annotation.getString("id");

    Mockito.when(mockedSearchIndexService.getRawAnnotationJson(annotationId)).thenReturn(annotation);

    JSONAssert.assertEquals(annotation.toString(), editorStubService.getAnnotationJson(annotationId).toString(), true);
  }

  private Annotation buildMockAnnotation(Color color, Motivation motivation) {
    List<String> creators = new ArrayList<>();
    creators.add("Leonie Schmidt");

    Annotation mockAnnotation = new Annotation();

    mockAnnotation.setId("http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825");
    mockAnnotation.setPageId("758735a2-8e0d-4ac7-815e-bba2060217c3");
    mockAnnotation.setCreated(Date.from(Instant.now()));
    mockAnnotation.setModified(Date.from(Instant.now()));
    mockAnnotation.setSvgCode("<svg><rect x=\"279\" y=\"48\" width=\"2951\" height=\"4500\"/></svg>");
    mockAnnotation.setColor(color);
    mockAnnotation.setCreators(creators);
    mockAnnotation.setIsAlgorithmAnnotation(false);
    mockAnnotation.setCanonical("http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89");
    mockAnnotation.setEtag("asdfghjklyxc");
    mockAnnotation.setMotivation(motivation);
    mockAnnotation.setVia("http://sampleannoserver.edu/wap/a04/deinterpretatione/c3aeb1ef-af1e-41fe-823c-76ea3761ee89");

    return mockAnnotation;
  }

  private TextCard buildMockTextCard(Motivation motivation) {
    TextCard textCard = new TextCard(UUID.randomUUID().toString());
    List<String> creators = new ArrayList<>();
    creators.add("Leonie Schmidt");

    textCard.setAnnotationId("http://sampleannoserver.edu/wap/a04/validated/fc2f1c02-5b48-4a5e-8fda-83b2e15ae825");
    textCard.setCreated(Date.from(Instant.now()));
    textCard.setModified(Date.from(Instant.now()));
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
    tag.setCreated(Date.from(Instant.now()));
    tag.setModified(Date.from(Instant.now()));
    tag.setValue("value");
    tag.setTitle("title");
    tag.setCreators(creators);

    return tag;
  }

  private void assertEqualsAnnotations(Annotation expectedAnno, Annotation actualAnno) {
    assertEquals(expectedAnno.getId(), actualAnno.getId());
    assertEquals(expectedAnno.getPageId(), actualAnno.getPageId());
    assertEquals(expectedAnno.getMotivation().getName(), actualAnno.getMotivation().getName());
    assertEquals(expectedAnno.getColor().getName(), actualAnno.getColor().getName());
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
  }

  private void assertEqualsBodies(Body expectedBody, Body actualBody) throws JSONException, org.json.JSONException {
    assertEquals(expectedBody.getId(), actualBody.getId());
    assertEquals(expectedBody.getAnnotationId(), actualBody.getAnnotationId());
    assertEquals(expectedBody.getCreated(), actualBody.getCreated());
    assertEquals(expectedBody.getModified(), actualBody.getModified());
    assertEquals(expectedBody.getPurpose().getName(), actualBody.getPurpose().getName());
    assertEquals(expectedBody.getTitle(), actualBody.getTitle());
    assertEquals(expectedBody.getValue(), actualBody.getValue());
    JSONAssert.assertEquals(expectedBody.getFullJson().toString(), actualBody.getFullJson().toString(), true);
    assertEquals(expectedBody.getCreators().size(), actualBody.getCreators().size());
  }

  private String readStringFromRelativePath(String relativePath) throws IOException {
    return Files.readString(
        Path.of("src/test/resources/editorStubService/" + relativePath));
  }
}