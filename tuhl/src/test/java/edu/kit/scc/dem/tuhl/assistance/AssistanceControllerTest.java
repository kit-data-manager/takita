package edu.kit.scc.dem.tuhl.assistance;

import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AssistanceController.class)
public class AssistanceControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private IAssistanceService assistanceService;
  @MockBean
  private ISearchIndexService searchIndexService;


  @Test
  public void testHelpCall() throws Exception {
    this.mockMvc.perform(get("/assistance/help"))
        .andExpect(status().isOk())
        .andExpect(view().name("help"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  public void testPseudonym() throws Exception {
    this.mockMvc.perform(get("/assistance/Test Pseudonym"))
        .andExpect(status().isOk())
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  public void testSaveTablecolumns() throws Exception {
    String col = "[{\"hozAlign\":\"center\",\"resizable\":false,\"frozen\":true,\"headerSort\":false,\"width\":41},{\"field\":\"id\",\"title\":\"ID\",\"width\":347},{\"field\":\"title\",\"title\":\"Title\",\"head";
    this.mockMvc.perform(post("/assistance/saveTablecolumns").contentType(MediaType.APPLICATION_JSON).content(col))
        .andExpect(status().isOk())
        .andExpect(content().string("placeholder"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  public void testSaveTablesort() throws Exception {
    String col = "[{\"column\":\"id\",\"dir\":\"asc\"}]";
    this.mockMvc.perform(post("/assistance/saveTablesort").contentType(MediaType.APPLICATION_JSON).content(col))
        .andExpect(status().isOk())
        .andExpect(content().string("placeholder"))
        .andDo(MockMvcResultHandlers.print());
  }


  @Test
  public void testSaveTablepage() throws Exception {

    User mockedUser = Mockito.mock(User.class);
    Mockito.when(assistanceService.getCurrentUser()).thenReturn(mockedUser);

    String col = "{\"paginationSize\":10,\"paginationInitialPage\":1}";
    String page = "noJSON";
    this.mockMvc.perform(post("/assistance/saveTablepage").contentType(MediaType.APPLICATION_JSON).content(col))
        .andExpect(status().isOk())
        .andExpect(content().string("placeholder"))
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(post("/assistance/saveTablepage").contentType(MediaType.APPLICATION_JSON).content(page))
        .andExpect(status().isOk())
        .andExpect(content().string("error"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  public void testToggleCheckThumbs() throws Exception {
    this.mockMvc.perform(get("/assistance/toggleCheckThumbs"))
        .andExpect(status().isOk())
        .andExpect(content().string("placeholder"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  public void testSetLanguage() throws Exception {
    this.mockMvc.perform(get("/assistance/lang/testLanguage"))
        .andExpect(status().isOk())
        .andExpect(content().string("placeholder"))
        .andDo(MockMvcResultHandlers.print());
  }


}
