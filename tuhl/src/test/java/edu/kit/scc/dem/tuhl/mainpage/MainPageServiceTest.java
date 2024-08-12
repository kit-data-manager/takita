package edu.kit.scc.dem.tuhl.mainpage;

import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.dashboard.IDashboardService;
import edu.kit.scc.dem.tuhl.mainpage.dashboard.annoview.AnnoViewService;
import edu.kit.scc.dem.tuhl.mainpage.dashboard.contentview.TableViewService;
import edu.kit.scc.dem.tuhl.mainpage.search.IFilterService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ui.Model;


@SpringBootTest(classes = MainPageService.class)
class MainPageServiceTest {

  @Autowired
  IMainPageService mockedMainPageService;

  @MockBean
  private IAssistanceService mockedAssistanceService;

  @MockBean
  private IFilterService mockedFilterService;

  @MockBean
  private IDashboardService mockedDashboardService;

  @MockBean
  private TableViewService mockedTableViewService;
  
  @MockBean
  private AnnoViewService mockedAnnoViewService;

  @MockBean
  private ISearchService mockedSearchService;

  @Test
  void update() {

    Model mockModel = Mockito.mock(Model.class);
    mockedMainPageService.update(mockModel);
    Mockito.verify(mockedAssistanceService).updateModel(mockModel);
    Mockito.verify(mockedFilterService).updateModel(mockModel);
    Mockito.verify(mockedDashboardService).updateModel(mockModel);
    Mockito.verify(mockedTableViewService).updateModel(mockModel);
    Mockito.verify(mockedAnnoViewService).updateModel(mockModel);
    Mockito.verify(mockedSearchService).updateModel(mockModel);

  }

}