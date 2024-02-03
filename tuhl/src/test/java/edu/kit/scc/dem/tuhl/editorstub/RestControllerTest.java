package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import com.google.gson.Gson;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;


@WebMvcTest(RestController.class)
@Import(RestController.class)
class RestControllerTest {

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
  private static String pageId = "4c4a12ad-ff05-4740-8347-302b67bea80e";
  private static String annoId = "http://sampleannoserver.edu/wap/a04/deinterpretatione/98f5351d-6890-4a97-ba9b-19e8c849724c";
  private static String bodyId = "78ee189a-5ac9-4b1c-ac0b-49863387fc49";


  @BeforeAll
  static void init() {
    //TODO: think about moving this to the specific methods
    mockAnno = new Annotation();
    mockAnno.setId(annoId);
    mockAnno.setColor(Color.TEXT_REGION);
    mockAnno.setSvgCode("");
    mockAnno.setMotivation("editing");
    mockAnno.setCreated(Instant.now().truncatedTo(ChronoUnit.DAYS));
    mockAnno.setModified(Instant.now().truncatedTo(ChronoUnit.DAYS));

    //TODO: think about moving this to the specific methods
    mockCard = new TextCard(bodyId);
    mockCard.setTitle("title");
    mockCard.setSubject("subject");
    mockCard.setValue("value");
    mockCard.setPurpose("describing");

    //TODO: think about moving this to the specific methods
    mockTag = new Tag(bodyId);
    mockTag.setTitle("title");
    mockTag.setSubject("subject");
    mockTag.setValue("value");
  }

  @Test
  void testGetAnnotationsById() throws Exception {
    List<Annotation> annotations = List.of(mockAnno, mockAnno);

    Mockito.when(mockedEditorStubService.getAnnotationsForId(pageId +"nf")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.getAnnotationsForId(pageId + "io")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.getAnnotationsForId(pageId + "int")).thenThrow(InterruptedException.class);
    Mockito.when(mockedEditorStubService.getAnnotationsForId(pageId + "js")).thenThrow(JSONException.class);
    Mockito.when(mockedEditorStubService.getAnnotationsForId(pageId)).thenReturn(annotations);

    this.mockMvc.perform(get("/editor_rest/annotations?id=" + pageId + "nf").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print()); 
        
    this.mockMvc.perform(get("/editor_rest/annotations?id=" + pageId + "io").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations?id=" + pageId + "int").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations?id=" + pageId + "js").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations?id=" + pageId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(annotations)))
        .andDo(MockMvcResultHandlers.print());
  }
  
  @Test
  void testCreateAnnotation() throws Exception {

    Mockito.when(mockedEditorStubService.addAnnotation(pageId, "TEXT_REGION", "", "editing")).thenReturn(mockAnno);
    Mockito.when(mockedEditorStubService.addAnnotation(pageId + "nf", "TEXT_REGION", "", "editing")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.addAnnotation(pageId + "io", "TEXT_REGION", "", "editing")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.addAnnotation(pageId + "int", "TEXT_REGION", "", "editing")).thenThrow(InterruptedException.class);

    String invalid = "{}";
    this.mockMvc.perform(post("/editor_rest/annotations").contentType(MediaType.APPLICATION_JSON).content(invalid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());
    
    String notfound = "{\"pageId\":\"" + pageId + "nf\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"editing\"}";
    this.mockMvc.perform(post("/editor_rest/annotations").contentType(MediaType.APPLICATION_JSON).content(notfound))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    String io = "{\"pageId\":\"" + pageId + "io\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"editing\"}";
    this.mockMvc.perform(post("/editor_rest/annotations").contentType(MediaType.APPLICATION_JSON).content(io))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    String inter = "{\"pageId\":\"" + pageId + "int\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"editing\"}";
    this.mockMvc.perform(post("/editor_rest/annotations").contentType(MediaType.APPLICATION_JSON).content(inter))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    String valid = "{\"pageId\":\"" + pageId + "\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"editing\"}";
    this.mockMvc.perform(post("/editor_rest/annotations").contentType(MediaType.APPLICATION_JSON).content(valid).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockAnno)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetAnnotationById() throws Exception {

    Mockito.when(mockedEditorStubService.getAnnotation(annoId)).thenReturn(mockAnno);
    Mockito.when(mockedEditorStubService.getAnnotation(annoId + "nf")).thenThrow(NoSuchIndexEntryException.class);

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "nf", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());  

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockAnno)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetAnnotationByIdWadm() throws Exception {
    JSONObject mockAnnoJson = new JSONObject();
    mockAnnoJson.put("@context", "http://www.w3.org/ns/anno.jsonld");
    mockAnnoJson.put("id", annoId);
    mockAnnoJson.put("type", "Annotation");
    mockAnnoJson.put("created", Instant.now().truncatedTo(ChronoUnit.DAYS));
    mockAnnoJson.put("modified", Instant.now().truncatedTo(ChronoUnit.DAYS));
    mockAnnoJson.put("body", new JSONObject());
    JSONObject selector = new JSONObject();
    selector.put("type", "SvgSelector");
    selector.put("value", "<svg><rect x=\"103\" y=\"72\" width=\"1664\" height=\"3232\"/></svg>");
    JSONObject target = new JSONObject();
    target.put("type", "SpecificResource");
    target.put("selector", selector);
    target.put("source", "http://host.scc.kit.edu:8800/api/v1/dataresources/4c4a12ad-ff05-4740-8347-302b67bea80e/data/19r.master.jpg");
    mockAnnoJson.put("target", target);
    mockAnnoJson.put("motivation", "editing");
  
    Mockito.when(mockedEditorStubService.getAnnotationJson(annoId)).thenReturn(mockAnnoJson);
    Mockito.when(mockedEditorStubService.getAnnotationJson(annoId + "io")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.getAnnotationJson(annoId + "int")).thenThrow(InterruptedException.class);
        
    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "io", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept("application/ld+json"))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print()); 

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "int", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept("application/ld+json"))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print()); 

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept("application/ld+json"))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/ld+json"))
        .andExpect(content().json(mockAnnoJson.toString(2).replace("\\/", "/")))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testUpdateAnnotationById() throws Exception {
    Annotation mockAnnoUpdated = new Annotation();
    mockAnnoUpdated.setId(annoId);
    mockAnnoUpdated.setColor(Color.TEXT_REGION);
    mockAnnoUpdated.setSvgCode("");
    mockAnnoUpdated.setMotivation("bookmarking");
    mockAnnoUpdated.setCreated(Instant.now().truncatedTo(ChronoUnit.DAYS));
    mockAnnoUpdated.setModified(Instant.now().truncatedTo(ChronoUnit.DAYS));

    Mockito.when(mockedEditorStubService.updateAnnotation(annoId, "TEXT_REGION", "", "bookmarking")).thenReturn(mockAnnoUpdated);
    Mockito.when(mockedEditorStubService.updateAnnotation(annoId + "nf", "TEXT_REGION", "", "bookmarking")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.updateAnnotation(annoId + "io", "TEXT_REGION", "", "bookmarking")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.updateAnnotation(annoId + "int", "TEXT_REGION", "", "bookmarking")).thenThrow(InterruptedException.class);

    String notfound = "{\"annoId\":\"" + annoId + "nf\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"bookmarking\"}";
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "nf", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).contentType(MediaType.APPLICATION_JSON).content(notfound).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());
        
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "io", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).contentType(MediaType.APPLICATION_JSON).content(notfound).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print()); 

    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "int", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).contentType(MediaType.APPLICATION_JSON).content(notfound).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print()); 

    String valid = "{\"annoId\":\"" + annoId + "nf\",\"color\":\"TEXT_REGION\",\"svgCode\":\"\",\"motivation\":\"bookmarking\"}";
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).contentType(MediaType.APPLICATION_JSON).content(valid).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockAnnoUpdated)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testDeleteAnnotationById() throws Exception {

    Mockito.when(mockedEditorStubService.deleteAnnotation(annoId)).thenReturn(mockAnno);
    Mockito.when(mockedEditorStubService.deleteAnnotation(annoId + "nf")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.deleteAnnotation(annoId + "io")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.deleteAnnotation(annoId + "int")).thenThrow(InterruptedException.class);

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "nf", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print()); 
        
    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "io", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "int", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name())).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNoContent())
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetBodiesForAnnotationById() throws Exception {
    mockAnno.addTextCard(mockCard);
    mockAnno.addTextCard(mockCard);

    Mockito.when(mockedEditorStubService.getAnnotation(annoId)).thenReturn(mockAnno);
    Mockito.when(mockedEditorStubService.getAnnotation(annoId + "nf")).thenThrow(NoSuchIndexEntryException.class);

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "nf", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockAnno.getTextCards())))
        .andDo(MockMvcResultHandlers.print());
  }
  
  @Test
  void testCreateBodyForAnnotationById() throws Exception {

    Mockito.when(mockedEditorStubService.addTextCard(annoId, "title", "subject", "value", "", "describing")).thenReturn(mockCard);
    Mockito.when(mockedEditorStubService.addTextCard(annoId + "nf", "title", "subject", "value", "", "describing")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.addTextCard(annoId + "io", "title", "subject", "value", "", "describing")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.addTextCard(annoId + "int", "title", "subject", "value", "", "describing")).thenThrow(InterruptedException.class);
    Mockito.when(mockedEditorStubService.addTextCard(annoId + "js", "title", "subject", "value", "", "describing")).thenThrow(JSONException.class);


    String valid = "{\"title\":\"title\",\"subject\":\"subject\",\"purpose\":\"describing\",\"value\":\"value\"}";
    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "nf", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "io", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "int", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "js", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies").contentType(MediaType.APPLICATION_JSON).content(valid).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockCard)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetBodyByIdForAnnotationById() throws Exception {

    Mockito.when(mockedEditorStubService.getTextCard(bodyId)).thenReturn(mockCard);
    Mockito.when(mockedEditorStubService.getTextCard(bodyId + "nf")).thenThrow(NoSuchIndexEntryException.class);

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "nf").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockCard)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetBodyByIdForAnnotationByIdWadm() throws Exception {
    JSONObject mockCardJson = new JSONObject();
    mockCardJson.put("dc:title", "title");
    mockCardJson.put("dc:subject", "subject");
    mockCardJson.put("value", "value");
    mockCardJson.put("purpose", "tagging");
    mockCard.setFullJson(mockCardJson);

    Mockito.when(mockedEditorStubService.getTextCard(bodyId)).thenReturn(mockCard);
    Mockito.when(mockedEditorStubService.getTextCard(bodyId + "nf")).thenThrow(NoSuchIndexEntryException.class);

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "nf").accept("application/ld+json"))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId).accept("application/ld+json"))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/ld+json"))
        .andExpect(content().json(mockCardJson.toString(2).replace("\\/", "/")))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testUpdateBodyByIdForAnnotationById() throws Exception {
    TextCard mockCardUpdated = new TextCard(bodyId);
    mockCardUpdated.setTitle("titleUpdated");
    mockCardUpdated.setSubject("subjectUpdated");
    mockCardUpdated.setValue("valueUpdated");
    mockCardUpdated.setPurpose("highlighting");

    Mockito.when(mockedEditorStubService.updateTextCard(bodyId, "titleUpdated", "subjectUpdated", "valueUpdated", "", "highlighting")).thenReturn(mockCardUpdated);
    Mockito.when(mockedEditorStubService.updateTextCard(bodyId + "nf", "titleUpdated", "subjectUpdated", "valueUpdated", "", "highlighting")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.updateTextCard(bodyId + "io", "titleUpdated", "subjectUpdated", "valueUpdated", "", "highlighting")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.updateTextCard(bodyId + "int", "titleUpdated", "subjectUpdated", "valueUpdated", "", "highlighting")).thenThrow(InterruptedException.class);
    Mockito.when(mockedEditorStubService.updateTextCard(bodyId + "js", "titleUpdated", "subjectUpdated", "valueUpdated", "", "highlighting")).thenThrow(JSONException.class);

    String valid = "{\"title\":\"titleUpdated\",\"subject\":\"subjectUpdated\",\"purpose\":\"highlighting\",\"value\":\"valueUpdated\"}";
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "nf").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "io").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "int").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "js").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());
    
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId).accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockCardUpdated)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testDeleteBodyByIdForAnnotationById() throws Exception {

    Mockito.when(mockedEditorStubService.deleteTextCard(bodyId)).thenReturn(mockCard);
    Mockito.when(mockedEditorStubService.deleteTextCard(bodyId + "nf")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.deleteTextCard(bodyId + "io")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.deleteTextCard(bodyId + "int")).thenThrow(InterruptedException.class);

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "nf").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "io").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId + "int").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());
    
    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/bodies/" + bodyId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNoContent())
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetTagsForAnnotationById() throws Exception {
    mockAnno.addTag(mockTag);
    mockAnno.addTag(mockTag);

    Mockito.when(mockedEditorStubService.getAnnotation(annoId)).thenReturn(mockAnno);
    Mockito.when(mockedEditorStubService.getAnnotation(annoId + "nf")).thenThrow(NoSuchIndexEntryException.class);

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "nf", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockAnno.getTags())))
        .andDo(MockMvcResultHandlers.print());
  }
  
  @Test
  void testCreateTagForAnnotationById() throws Exception {

    Mockito.when(mockedEditorStubService.addTag(annoId, "title", "subject", "value", "")).thenReturn(mockTag);
    Mockito.when(mockedEditorStubService.addTag(annoId + "nf", "title", "subject", "value", "")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.addTag(annoId + "io", "title", "subject", "value", "")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.addTag(annoId + "int", "title", "subject", "value", "")).thenThrow(InterruptedException.class);
    Mockito.when(mockedEditorStubService.addTag(annoId + "js", "title", "subject", "value", "")).thenThrow(JSONException.class);

    String valid = "{\"title\":\"title\",\"subject\":\"subject\",\"value\":\"value\"}";
    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "nf", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "io", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "int", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId + "js", StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags").contentType(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags").contentType(MediaType.APPLICATION_JSON).content(valid).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockTag)))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testGetTagByIdForAnnotationById() throws Exception {
    Mockito.when(mockedEditorStubService.getTag(bodyId)).thenReturn(mockTag);
    Mockito.when(mockedEditorStubService.getTag(bodyId + "nf")).thenThrow(NoSuchIndexEntryException.class);

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "nf").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockTag)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetTagByIdForAnnotationByIdWadm() throws Exception {
    JSONObject mockTagJson = new JSONObject();
    mockTagJson.put("dc:title", "title");
    mockTagJson.put("dc:subject", "subject");
    mockTagJson.put("value", "value");
    mockTagJson.put("purpose", "tagging");
    mockTag.setFullJson(mockTagJson);

    Mockito.when(mockedEditorStubService.getTag(bodyId)).thenReturn(mockTag);
    Mockito.when(mockedEditorStubService.getTag(bodyId + "nf")).thenThrow(NoSuchIndexEntryException.class);

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "nf").accept("application/ld+json"))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId).accept("application/ld+json"))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/ld+json"))
        .andExpect(content().json(mockTagJson.toString(2).replace("\\/", "/")))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testUpdateTagByIdForAnnotationById() throws Exception {
    Tag mockTagUpdated = new Tag(bodyId);
    mockTagUpdated.setTitle("titleUpdated");
    mockTagUpdated.setSubject("subjectUpdated");
    mockTagUpdated.setValue("valueUpdated");

    Mockito.when(mockedEditorStubService.updateTag(bodyId, "titleUpdated", "subjectUpdated", "valueUpdated", "")).thenReturn(mockTagUpdated);
    Mockito.when(mockedEditorStubService.updateTag(bodyId + "nf", "titleUpdated", "subjectUpdated", "valueUpdated", "")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.updateTag(bodyId + "io", "titleUpdated", "subjectUpdated", "valueUpdated", "")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.updateTag(bodyId + "int", "titleUpdated", "subjectUpdated", "valueUpdated", "")).thenThrow(InterruptedException.class);
    Mockito.when(mockedEditorStubService.updateTag(bodyId + "js", "titleUpdated", "subjectUpdated", "valueUpdated", "")).thenThrow(JSONException.class);

    String valid = "{\"title\":\"titleUpdated\",\"subject\":\"subjectUpdated\",\"value\":\"valueUpdated\"}";
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "nf").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "io").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "int").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());
    
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "js").accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());
    
    this.mockMvc.perform(put("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId).accept(MediaType.APPLICATION_JSON).content(valid))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(new Gson().toJson(mockTagUpdated)))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testdeleteTagByIdForAnnotationById() throws Exception {

    Mockito.when(mockedEditorStubService.deleteTag(bodyId)).thenReturn(mockTag);
    Mockito.when(mockedEditorStubService.deleteTag(bodyId + "nf")).thenThrow(NoSuchIndexEntryException.class);
    Mockito.when(mockedEditorStubService.deleteTag(bodyId + "io")).thenThrow(IOException.class);
    Mockito.when(mockedEditorStubService.deleteTag(bodyId + "int")).thenThrow(InterruptedException.class);

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "nf").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "io").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId + "int").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andDo(MockMvcResultHandlers.print());
    
    this.mockMvc.perform(delete("/editor_rest/annotations/" + URLEncoder.encode(URLEncoder.encode(annoId, StandardCharsets.UTF_8.name()), StandardCharsets.UTF_8.name()) + "/tags/" + bodyId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNoContent())
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetObjectJson() throws Exception {

    JSONObject mockJsonObject = new JSONObject();
    mockJsonObject.put("id", pageId);
    JSONObject mockTitles = new JSONObject();
    mockTitles.put("id",1553);
    mockTitles.put("value", "Wien Vind Phil gr 94");
    mockJsonObject.put("creators", new JSONArray().put(mockTitles));
    mockJsonObject.put("publisher", "SFB 980 - A04");
    JSONObject mockRelIds = new JSONObject();
    mockRelIds.put("id", 2998);
    mockRelIds.put("identifierType", "URL");
    mockRelIds.put("value", "http://host.scc.kit.edu:8800/api/v1/dataresources/58469f38-4072-4dc4-83a7-39fbabdcde39");
    mockRelIds.put("relationType", "IS_METADATA_FOR");
    mockJsonObject.put("relatedIdentifierts", new JSONArray().put(mockRelIds));

    Mockito.when(mockedEditorStubService.getManuscriptJson(pageId)).thenReturn(mockJsonObject);
    Mockito.when(mockedEditorStubService.getManuscriptJson(pageId + "io")).thenThrow((IOException.class));
    Mockito.when(mockedEditorStubService.getManuscriptJson(pageId + "int")).thenThrow(InterruptedException.class);

    this.mockMvc.perform(get("/editor_rest/raw/" + pageId + "io").accept(MediaType.APPLICATION_JSON))
    .andExpect(status().isInternalServerError())
    .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/raw/" + pageId + "int").accept(MediaType.APPLICATION_JSON))
    .andExpect(status().isInternalServerError())
    .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/raw/" + pageId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(content().json(mockJsonObject.toString(2).replace("\\/", "/")))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testGetObjectXml() throws Exception {

    String mockXML = "<TEI xmlns=\"http://www.tei-c.org/ns/1.0\"><teiHeader><fileDesc><titleStmt>" + 
    "<title>Beschreibung der Handschrift Vind. Phil. Gr. 94</title></titleStmt><sourceDesc>" + 
    "<msDesc xml:lang=\"de\"><msIdentifier><settlement><rs type=\"place\" ref=\"Wien\">Wien</rs>\n</settlement>" + 
    "<repository>Österreichische Nationalbibliothek</repository><idno>Vind. Phil. Gr. 94</idno></msIdentifier>" + 
    "<msContents><msItem><locus from=\"19r\" to=\"29r\" scheme=\"folio\"/><title>de interpretatione</title>" + 
    "</msItem></msContents><physDesc><objectDesc><supportDesc><support><material>Papier</material></support>" + 
    "<extent><dimensions><height unit=\"mm\" quantity=\"279\"/><width unit=\"mm\" quantity=\"148\"/></dimensions>" + 
    "</extent></supportDesc></objectDesc><additions><list><head>Diagramme</head><item><locus>keine</locus></item>" + 
    "</list><list><head>Interlinearien</head><item><locus>keine</locus><desc>rote Kapitelüberschriften</desc>" + 
    "</item></list></additions></physDesc></msDesc></sourceDesc></fileDesc></teiHeader><facsimile>" + 
    "<graphic url=\"http://dariahrepositorium.de\"/></facsimile></TEI>";

    Mockito.when(mockedEditorStubService.getManuscriptXml(pageId)).thenReturn(mockXML);
    Mockito.when(mockedEditorStubService.getManuscriptXml(pageId + "io")).thenThrow((IOException.class));
    Mockito.when(mockedEditorStubService.getManuscriptXml(pageId + "int")).thenThrow(InterruptedException.class);

    this.mockMvc.perform(get("/editor_rest/raw/" + pageId + "io").accept(MediaType.APPLICATION_XML))
    .andExpect(status().isInternalServerError())
    .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/raw/" + pageId + "int").accept(MediaType.APPLICATION_XML))
    .andExpect(status().isInternalServerError())
    .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/editor_rest/raw/" + pageId).accept(MediaType.APPLICATION_XML))
    .andExpect(status().isOk())
    .andExpect(content().contentType("application/xml;charset=UTF-8"))
    .andExpect(content().string(mockXML))
    .andDo(MockMvcResultHandlers.print());
  }


}