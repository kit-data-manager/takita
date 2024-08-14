package edu.kit.scc.dem.tuhl;


import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ErrorController.class)
@TestPropertySource("classpath:application-test.properties")
class ErrorControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ISearchIndexService searchIndexService;

  @Test
  void testHandleError() throws Exception {
    this.mockMvc.perform(get("/error"))
        .andExpect(status().isOk())
        .andExpect(view().name("error"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testHandleErrorWithMsg() throws Exception {
    String message = "Error Message ...";
    this.mockMvc.perform(get("/error/" + message))
        .andExpect(status().isOk())
        .andExpect(model().attribute("errorMessage", equalTo(message)))
        .andDo(MockMvcResultHandlers.print());
  }

}