package edu.kit.datamanager.takita.mainpage.dashboard.contentview;

import edu.kit.datamanager.takita.ControllerTestHelper;
import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.mainpage.IMainPageService;
import edu.kit.datamanager.takita.mainpage.dashboard.IDashboardService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.ui.Model;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TableViewController.class)
@TestPropertySource("classpath:application-test.properties")
class TableViewControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private TableViewService mockedTableViewService;
  @MockBean
  private IMainPageService mockedMainPageService;
  @MockBean
  private IDashboardService mockedDashboardService;
  @MockBean
  private ISearchIndexService mockedSearchIndexService;

  @Test
  void testShowContentView() throws Exception {
    ControllerTestHelper.mockUpdateModel(mockedMainPageService);

    this.mockMvc.perform(get("/tableview"))
        .andExpect(status().isOk())
        .andExpect(view().name("table_view.html :: tableView"))
        .andDo(MockMvcResultHandlers.print());

    Mockito.verify(mockedMainPageService).update(Mockito.any(Model.class));
  }

  @Test
  void testGetFirstPage() throws Exception {
    String manId = "manId";
    Mockito.when(mockedTableViewService.getFirstPage(manId)).thenReturn("pageId");

    String wrongManId = "wrongManId";
    Mockito.when(mockedTableViewService.getFirstPage(wrongManId)).thenThrow(new NoSuchIndexEntryException("I am an exception message"));

    this.mockMvc.perform(get("/tableview/getFirstPage/" + manId))
        .andExpect(status().isOk())
        .andExpect(content().string("pageId"))
        .andDo(MockMvcResultHandlers.print());

    this.mockMvc.perform(get("/tableview/getFirstPage/" + wrongManId))
        .andExpect(status().isOk())
        .andExpect(content().string("error"))
        .andDo(MockMvcResultHandlers.print());

  }

  @Test
  void testGetSorted() throws Exception {

    this.mockMvc.perform(get("/tableview/sort")
        .param("page", "1")
        .param("size", "10")
        .param("sorters[0][field]", "id")
        .param("sorters[0][dir]", "asc"))
        .andExpect(status().isOk())
        .andDo(MockMvcResultHandlers.print());

    Mockito.verify(mockedTableViewService).setCurrentPage(1);
    Mockito.verify(mockedTableViewService).setNumberOfResults(10);
    Mockito.verify(mockedTableViewService).setSortAscending(true);
    Mockito.verify(mockedTableViewService).setSortField("id");
    Mockito.verify(mockedTableViewService).search();
    Mockito.verify(mockedMainPageService).update(Mockito.any(Model.class));


  }

  @Test
  void testSetFirstPage() throws Exception {

    this.mockMvc.perform(get("/tableview/getFirst"))
        .andExpect(status().isOk())
        .andExpect(content().string("placeholder"))
        .andDo(MockMvcResultHandlers.print());

    Mockito.verify(mockedTableViewService).setCurrentPage(1);
  }

}