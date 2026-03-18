package edu.kit.datamanager.takita.mainpage.search;

import edu.kit.datamanager.takita.configuration.SecurityConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.mainpage.search.ISearchService;
import edu.kit.datamanager.takita.mainpage.search.SearchController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
@TestPropertySource("classpath:application-test.properties")
@Import(SecurityConfiguration.class)
class SearchControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private ISearchService mockedSearchService;
  @MockitoBean
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