package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.ControllerTestHelper;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.assistance.User;
import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(FilterController.class)
class FilterControllerTest {

  @Autowired
  private MockMvc mockMvc;


  @MockBean
  private IFilterService mockedFilterService;
  @MockBean
  private IMainPageService mockedMainPageService;
  @MockBean
  private IAssistanceService mockedAssistanceService;
  @MockBean
  private ISearchIndexService mockedSearchIndexService;

  @Test
  void testAddFilters() throws Exception {

    ControllerTestHelper.mockUpdateModel(mockedMainPageService);

    String filterSelection = "{\"fields\":[\"id\"]}";

    this.mockMvc.perform(post("/filter/add").contentType(MediaType.APPLICATION_JSON).content(filterSelection))
        .andExpect(status().isOk())
        .andExpect(view().name("filter_selection :: filterSelection"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testRemoveFilter() throws Exception {
    ControllerTestHelper.mockUpdateModel(mockedMainPageService);

    String filterField = "id";

    this.mockMvc.perform(post("/filter/remove").contentType(MediaType.APPLICATION_JSON).content(filterField))
        .andExpect(status().isOk())
        .andExpect(view().name("filter_selection :: filterSelection"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testClearFilters() throws Exception {
    ControllerTestHelper.mockUpdateModel(mockedMainPageService);

    this.mockMvc.perform(get("/filter/clear"))
        .andExpect(status().isOk())
        .andExpect(view().name("filter_selection :: filterSelection"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testApplyFilters() throws Exception {

    ControllerTestHelper.mockUpdateModel(mockedMainPageService);

    User mockedUser = Mockito.mock(User.class);
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(mockedUser);

    String filterField = "id";

    this.mockMvc.perform(post("/filter/apply"))
        .andExpect(status().is3xxRedirection())
        .andExpect(view().name("redirect:/"))
        .andDo(MockMvcResultHandlers.print());
  }

}