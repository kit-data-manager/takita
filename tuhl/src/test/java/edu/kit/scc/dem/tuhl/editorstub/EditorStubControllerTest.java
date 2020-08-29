package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

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
  private ISearchIndexService mockedSearchIndexService;

  @Test
  void testInit() throws Exception {

    this.mockMvc.perform(get("/editor_stub"))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testCreateAnnotation() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/create_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"pageId\":\"2c01883b-5aae-4867-b0f2-06fbb093f61e\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"EDITING\"}";
    this.mockMvc.perform(post("/editor_stub/create_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: annotationViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testReadAnnotation() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/read_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60\"}";
    this.mockMvc.perform(post("/editor_stub/read_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: annotationViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testUpdateAnnotation() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/update_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"BOOKMARKING\"}";
    this.mockMvc.perform(post("/editor_stub/update_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: annotationViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testDeleteAnnotation() throws Exception {
    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/delete_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60\"}";
    this.mockMvc.perform(post("/editor_stub/delete_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: annotationViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testValidateAnnotation() throws Exception {
    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/validate_annotation").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/065c57d9-3800-49f8-838a-11a0455d8f60\"}";
    this.mockMvc.perform(post("/editor_stub/validate_annotation").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: annotationViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testCreateTextCard() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/create_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49\",\"title\":\"Ich bin ein Titel\",\"purpose\":\"DESCRIBING\",\"value\":\"Ich bin der Value\"}";
    this.mockMvc.perform(post("/editor_stub/create_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testReadCard() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/read_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"3fc86c30-5ce6-4ab3-8076-6c3109f61384\"}";
    this.mockMvc.perform(post("/editor_stub/read_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testUpdateTextCard() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/update_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"3fc86c30-5ce6-4ab3-8076-6c3109f61384\",\"title\":\"Titel\",\"purpose\":\"HIGHLIGHTING\",\"value\":\"Value\"}";
    this.mockMvc.perform(post("/editor_stub/update_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testDeleteTextCard() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/delete_card").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"3fc86c30-5ce6-4ab3-8076-6c3109f61384\"}";
    this.mockMvc.perform(post("/editor_stub/delete_card").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testCreateTag() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/create_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"annoId\":\"http://192.168.0.49:8100/wap/a04/validated/78ee189a-5ac9-4b1c-ac0b-49863387fc49\",\"title\":\"Taggg\",\"value\":\"valuee\"}";
    this.mockMvc.perform(post("/editor_stub/create_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testReadTag() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/read_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"dc66e069-9774-4525-a901-03cdcfa36af9\"}";
    this.mockMvc.perform(post("/editor_stub/read_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testUpdateTag() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/update_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"dc66e069-9774-4525-a901-03cdcfa36af9\",\"title\":\"taag\",\"value\":\"vvvalue\"}";
    this.mockMvc.perform(post("/editor_stub/update_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testDeleteTag() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/delete_tag").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"dc66e069-9774-4525-a901-03cdcfa36af9\"}";
    this.mockMvc.perform(post("/editor_stub/delete_tag").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: bodyViewer"))
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
        .andExpect(view().name("editor_stub :: rawJsonViewer"))
        .andExpect(model().attribute("rawJson", equalTo(mockObj.toString(2).replace("\\/", "/"))))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testGetManuscriptXml() throws Exception {

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_stub/raw_manuscript_xml").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"id\":\"000073cd-c425-4214-9648-b380ff20c61a\"}";
    this.mockMvc.perform(post("/editor_stub/raw_manuscript_xml").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(view().name("editor_stub :: rawXmlViewer"))
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
        .andExpect(view().name("editor_stub :: rawJsonViewer"))
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
        .andExpect(view().name("editor_stub :: rawJsonViewer"))
        .andExpect(model().attribute("rawJson", equalTo(mockObj.toString(2).replace("\\/", "/"))))
        .andDo(MockMvcResultHandlers.print());

  }


}