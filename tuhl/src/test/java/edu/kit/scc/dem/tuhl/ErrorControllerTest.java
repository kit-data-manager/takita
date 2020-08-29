package edu.kit.scc.dem.tuhl;

import edu.kit.scc.dem.tuhl.assistance.AssistanceController;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(ErrorController.class)
class ErrorControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ISearchIndexService searchIndexService;

  @Test
  public void testHandleError() throws Exception {
    this.mockMvc.perform(get("/error"))
        .andExpect(status().isOk())
        .andExpect(view().name("error"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  public void testHandleErrorWithMsg() throws Exception {
    this.mockMvc.perform(get("/error/Error Message.."))
        .andExpect(status().isOk())
        .andDo(MockMvcResultHandlers.print());
  }

}