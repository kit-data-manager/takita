package edu.kit.datamanager.takita.editor;


import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.configuration.SecurityConfiguration;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.io.UnsupportedEncodingException;
import java.time.Instant;

@WebMvcTest(EditorController.class)
@Import({EditorController.class, SecurityConfiguration.class})
@TestPropertySource("classpath:application-test.properties")
public class EditorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IEditorService mockedEditorService;
    @MockitoBean
    private IAssistanceService mockedAssistanceService;
    @MockitoBean
    private ISearchIndexService mockedSearchIndexService;

    private static Page page;

    @BeforeAll
    public static void setUp() {
        page = new ImagePage(
                "page1",
                ResourceType.IMAGE,
                "076v",
                Instant.parse("2019-03-11T14:13:38Z"), "", "");
    }

    @Test
    public void testGetDisplayableAnnotationsJSON() throws Exception {
        Mockito.when(mockedEditorService.getCurrentPage()).thenReturn(page);
        Mockito.when(mockedEditorService.convertDisplayableAnnotationsToJson(page.getAnnotations()))
                .thenReturn(new JSONArray("[]"));
        String expected = "[]";
        this.mockMvc.perform(get("/editor/1234/displayableAnnotationsJSON").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().string(expected));
    }

    @Test
    public void testGetDisplayableAnnotationsJSON2() throws Exception {
        Mockito.doThrow(NoSuchIndexEntryException.class)
                .when(mockedEditorService).selectPage("1234nf");
        this.mockMvc.perform(get("/editor/1234nf/displayableAnnotationsJSON").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());
    }

    @Test
    public void testGetDisplayableAnnotationsJSON3() throws Exception {
        Mockito.when(mockedEditorService.getCurrentPage()).thenReturn(page);
        Mockito.doThrow(UnsupportedEncodingException.class).when(mockedEditorService)
                .convertDisplayableAnnotationsToJson(page.getAnnotations());
        this.mockMvc.perform(get("/editor/1234/displayableAnnotationsJSON").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());
    }
}
