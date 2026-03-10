package edu.kit.datamanager.takita.mainpage.search;

import edu.kit.datamanager.takita.ControllerTestHelper;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.assistance.User;
import edu.kit.datamanager.takita.configuration.SecurityConfiguration;
import edu.kit.datamanager.takita.mainpage.IMainPageService;
import edu.kit.datamanager.takita.mainpage.dashboard.contentview.TableViewService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(FilterController.class)
@TestPropertySource("classpath:application-test.properties")
@Import(SecurityConfiguration.class)
class FilterControllerTest {

  @Autowired
  private MockMvc mockMvc;


  @MockitoBean
  private IFilterService mockedFilterService;
  @MockitoBean
  private TableViewService mockedTableViewService;
  @MockitoBean
  private IMainPageService mockedMainPageService;
  @MockitoBean
  private IAssistanceService mockedAssistanceService;
  @MockitoBean
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

    this.mockMvc.perform(post("/filter/apply"))
        .andExpect(status().is3xxRedirection())
        .andExpect(view().name("redirect:/"))
        .andDo(MockMvcResultHandlers.print());
  }

}