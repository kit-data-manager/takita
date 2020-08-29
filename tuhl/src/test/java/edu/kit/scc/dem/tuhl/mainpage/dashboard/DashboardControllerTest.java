package edu.kit.scc.dem.tuhl.mainpage.dashboard;

import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private IDashboardService mockedDashboardService;
  @MockBean
  private ISearchIndexService mockedSearchIndexService;


  @Test
  void testShowDashboard() throws Exception {
    this.mockMvc.perform(get("/dashboard"))
        .andExpect(status().isOk())
        .andExpect(view().name("dashboard.html :: dashboard"))
        .andExpect(model().attributeExists("availableViews"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  void testContentView() throws Exception {
    Mockito.when(mockedDashboardService.getRedirect()).thenReturn("redirect:/tableview");

    this.mockMvc.perform(get("/dashboard/contentview/tableview"))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());
    Mockito.verify(mockedDashboardService).setCurrentContentView(Mockito.eq("tableview"));
  }

}