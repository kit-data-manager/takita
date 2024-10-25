package edu.kit.datamanager.takita.mainpage;

import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.mainpage.dashboard.IDashboardService;
import edu.kit.datamanager.takita.mainpage.dashboard.contentview.TableViewService;
import edu.kit.datamanager.takita.mainpage.search.IFilterService;
import edu.kit.datamanager.takita.mainpage.search.ISearchService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.ui.Model;


@SpringBootTest(classes = MainPageService.class)
@TestPropertySource("classpath:application-test.properties")
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
  private ISearchService mockedSearchService;

  @Test
  void update() {

    Model mockModel = Mockito.mock(Model.class);
    mockedMainPageService.update(mockModel);
    Mockito.verify(mockedAssistanceService).updateModel(mockModel);
    Mockito.verify(mockedFilterService).updateModel(mockModel);
    Mockito.verify(mockedDashboardService).updateModel(mockModel);
    Mockito.verify(mockedTableViewService).updateModel(mockModel);
    Mockito.verify(mockedSearchService).updateModel(mockModel);

  }

}