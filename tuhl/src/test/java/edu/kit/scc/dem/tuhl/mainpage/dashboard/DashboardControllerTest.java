package edu.kit.scc.dem.tuhl.mainpage.dashboard;

import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(DashboardController.class)
public class DashboardControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private IDashboardService mockedDashboardService;
  @MockBean
  private ISearchIndexService mockedSearchIndexService;


  @Test
  public void testShowDashboard() throws Exception {
    this.mockMvc.perform(get("/dashboard"))
        .andExpect(status().isOk())
        .andExpect(view().name("dashboard.html :: dashboard"))
        .andDo(MockMvcResultHandlers.print());
  }

  @Test
  public void testContentView() throws Exception {
    Mockito.when(mockedDashboardService.getRedirect()).thenReturn("redirect:/tableview");

    this.mockMvc.perform(get("/dashboard/contentview/tableview"))
        .andExpect(status().is3xxRedirection())
        .andDo(MockMvcResultHandlers.print());
  }

}