package edu.kit.scc.dem.tuhl.mainpage.search;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
class SearchControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ISearchService mockedSearchService;
  @MockBean
  private ISearchIndexService searchIndexService;

  @Test
  void testSearchTerm() throws Exception {
    String searchterm = "{Vatikan}";
    this.mockMvc.perform(post("/search").contentType(MediaType.APPLICATION_JSON).content(searchterm))
        .andExpect(status().isOk())
        .andExpect(content().string("OK"))
        .andDo(MockMvcResultHandlers.print());
  }

}