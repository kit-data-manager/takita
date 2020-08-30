package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.assistance.User;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.Motivation;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.ui.Model;

import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(EditorStubController.class)
class EditorStubControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private IEditorStubService mockedEditorStubService;
  @MockBean
  private IAssistanceService mockedAssistanceService;
  @MockBean
  private ISearchIndexService mockedSearchIndexService;


  private static Annotation mockAnno;
  private static TextCard mockCard;
  private static Tag mockTag;

  @BeforeAll
  static void init() {
    mockAnno = new Annotation();
    mockAnno.setId("2c01883b-5aae-4867-b0f2-06fbb093f61e");
    mockAnno.setColor(Color.TEXT_REGION);
    mockAnno.setSvgCode("");
    mockAnno.setMotivation(Motivation.EDITING);

    mockCard = new TextCard("http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49");

    mockTag = new Tag("http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49");

  }

  @Test
  void testInit() throws Exception {
    Mockito.doAnswer(invocation -> {
      Model model = invocation.getArgument(0);
      model.addAttribute("user", new User("default"));
      return null;
    }).when(mockedAssistanceService).updateModel(Mockito.any(Model.class));


    this.mockMvc.perform(get("/editor_stub"))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testCreateAnnotation() throws Exception {

    Mockito.when(mockedEditorStubService.addAnnotation("2c01883b-5aae-4867-b0f2-06fbb093f61e", "TEXT_REGION", "", "EDITING")).thenReturn(mockAnno);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/create_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"pageId\":\"2c01883b-5aae-4867-b0f2-06fbb093f61e\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"EDITING\"}";
    this.mockMvc.perform(post("/editor_stub/create_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_ANNOTATION_VIEWER))
        .andExpect(model().attribute("annotation", equalTo(mockAnno)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testReadAnnotation() throws Exception {

    Mockito.when(mockedEditorStubService.getAnnotation("http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60")).thenReturn(mockAnno);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/read_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60\"}";
    this.mockMvc.perform(post("/editor_stub/read_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_ANNOTATION_VIEWER))
        .andExpect(model().attribute("annotation", equalTo(mockAnno)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testUpdateAnnotation() throws Exception {

    Mockito.when(mockedEditorStubService.updateAnnotation("http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49", "TEXT_REGION", "", "BOOKMARKING")).thenReturn(mockAnno);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/update_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"BOOKMARKING\"}";
    this.mockMvc.perform(post("/editor_stub/update_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_ANNOTATION_VIEWER))
        .andExpect(model().attribute("annotation", equalTo(mockAnno)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testDeleteAnnotation() throws Exception {

    Mockito.when(mockedEditorStubService.deleteAnnotation("http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60")).thenReturn(mockAnno);

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/delete_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60\"}";
    this.mockMvc.perform(post("/editor_stub/delete_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_ANNOTATION_VIEWER))
        .andExpect(model().attribute("annotation", equalTo(mockAnno)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testValidateAnnotation() throws Exception {

    Mockito.when(mockedEditorStubService.validateAnnotation("http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60")).thenReturn(mockAnno);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/validate_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60\"}";
    this.mockMvc.perform(post("/editor_stub/validate_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_ANNOTATION_VIEWER))
        .andExpect(model().attribute("annotation", equalTo(mockAnno)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testCreateTextCard() throws Exception {

    Mockito.when(mockedEditorStubService.addTextCard("http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49", "Ich bin ein Titel", "Ich bin der Value", "DESCRIBING")).thenReturn(mockCard);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/create_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49\",\"title\":\"Ich bin ein Titel\",\"purpose\":\"DESCRIBING\",\"value\":\"Ich bin der Value\"}";
    this.mockMvc.perform(post("/editor_stub/create_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockCard)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testReadCard() throws Exception {

    Mockito.when(mockedEditorStubService.getTextCard("3fc86c30-5ce6-4ab3-8076-6c3109f61384")).thenReturn(mockCard);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/read_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"3fc86c30-5ce6-4ab3-8076-6c3109f61384\"}";
    this.mockMvc.perform(post("/editor_stub/read_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockCard)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testUpdateTextCard() throws Exception {

    Mockito.when(mockedEditorStubService.updateTextCard("3fc86c30-5ce6-4ab3-8076-6c3109f61384", "Title", "Value", "HIGHLIGHTING")).thenReturn(mockCard);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/update_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"3fc86c30-5ce6-4ab3-8076-6c3109f61384\",\"title\":\"Title\",\"purpose\":\"HIGHLIGHTING\",\"value\":\"Value\"}";
    this.mockMvc.perform(post("/editor_stub/update_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockCard)))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testDeleteTextCard() throws Exception {

    Mockito.when(mockedEditorStubService.deleteTextCard("3fc86c30-5ce6-4ab3-8076-6c3109f61384")).thenReturn(mockCard);

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/delete_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"3fc86c30-5ce6-4ab3-8076-6c3109f61384\"}";
    this.mockMvc.perform(post("/editor_stub/delete_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockCard)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testCreateTag() throws Exception {

    Mockito.when(mockedEditorStubService.addTag("http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49", "Taggg", "valuee")).thenReturn(mockTag);

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/create_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49\",\"title\":\"Taggg\",\"value\":\"valuee\"}";
    this.mockMvc.perform(post("/editor_stub/create_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockTag)))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testReadTag() throws Exception {
    Mockito.when(mockedEditorStubService.getTag("dc66e069-9774-4525-a901-03cdcfa36af9")).thenReturn(mockTag);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/read_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"dc66e069-9774-4525-a901-03cdcfa36af9\"}";
    this.mockMvc.perform(post("/editor_stub/read_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockTag)))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testUpdateTag() throws Exception {

    Mockito.when(mockedEditorStubService.updateTag("dc66e069-9774-4525-a901-03cdcfa36af9", "taag", "vvvalue")).thenReturn(mockTag);

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/update_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"dc66e069-9774-4525-a901-03cdcfa36af9\",\"title\":\"taag\",\"value\":\"vvvalue\"}";
    this.mockMvc.perform(post("/editor_stub/update_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockTag)))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testDeleteTag() throws Exception {

    Mockito.when(mockedEditorStubService.deleteTag("dc66e069-9774-4525-a901-03cdcfa36af9")).thenReturn(mockTag);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/delete_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"dc66e069-9774-4525-a901-03cdcfa36af9\"}";
    this.mockMvc.perform(post("/editor_stub/delete_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_BODY_VIEWER))
        .andExpect(model().attribute("body", equalTo(mockTag)))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testGetManuscriptJson() throws Exception {

    JSONObject mockObj = new JSONObject();
    mockObj.put("test", "value");
    Mockito.when(mockedEditorStubService.getManuscriptJson("000073cd-c425-4214-9648-b380ff20c61a")).thenReturn(mockObj);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/raw_manuscript_json").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"000073cd-c425-4214-9648-b380ff20c61a\"}";
    this.mockMvc.perform(post("/editor_stub/raw_manuscript_json").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_RAW_JSON_VIEWER))
        .andExpect(model().attribute("rawJson", equalTo(mockObj.toString(2).replace("\\/", "/"))))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testGetManuscriptXml() throws Exception {

    String mockString = "ManuscriptXml";
    Mockito.when(mockedEditorStubService.getManuscriptXml("000073cd-c425-4214-9648-b380ff20c61a")).thenReturn(mockString);

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/raw_manuscript_xml").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"000073cd-c425-4214-9648-b380ff20c61a\"}";
    this.mockMvc.perform(post("/editor_stub/raw_manuscript_xml").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_RAW_XML_VIEWER))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testGetPageJson() throws Exception {

    JSONObject mockObj = new JSONObject();
    mockObj.put("test", "value");
    Mockito.when(mockedEditorStubService.getPageJson("2c01883b-5aae-4867-b0f2-06fbb093f61e")).thenReturn(mockObj);


    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/raw_page_json").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"2c01883b-5aae-4867-b0f2-06fbb093f61e\"}";
    this.mockMvc.perform(post("/editor_stub/raw_page_json").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_RAW_JSON_VIEWER))
        .andExpect(model().attribute("rawJson", equalTo(mockObj.toString(2).replace("\\/", "/"))))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testGetAnnotationJson() throws Exception {

    JSONObject mockObj = new JSONObject();
    mockObj.put("test", "value");
    Mockito.when(mockedEditorStubService.getAnnotationJson("http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60")).thenReturn(mockObj);

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/raw_annotation_json").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60\"}";
    this.mockMvc.perform(post("/editor_stub/raw_annotation_json").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name(EditorStubController.FRAGMENT_RAW_JSON_VIEWER))
        .andExpect(model().attribute("rawJson", equalTo(mockObj.toString(2).replace("\\/", "/"))))
        .andDo(MockMvcResultHandlers.print());

  }


}