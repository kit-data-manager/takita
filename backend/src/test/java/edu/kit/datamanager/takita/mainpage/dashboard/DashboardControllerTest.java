package edu.kit.datamanager.takita.mainpage.dashboard;

import edu.kit.datamanager.takita.configuration.SecurityConfiguration;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
@TestPropertySource("classpath:application-test.properties")
@Import(SecurityConfiguration.class)
class DashboardControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private IDashboardService mockedDashboardService;
  @MockitoBean
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