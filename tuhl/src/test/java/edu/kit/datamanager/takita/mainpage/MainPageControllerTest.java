package edu.kit.datamanager.takita.mainpage;

import edu.kit.datamanager.takita.ControllerTestHelper;
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
import org.springframework.ui.Model;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(MainPageController.class)
@TestPropertySource("classpath:application-test.properties")
@Import(SecurityConfiguration.class)
class MainPageControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private IMainPageService mockedMainPageService;
  @MockitoBean
  private ISearchIndexService mockedSearchIndexService;

  @Test
  void testInit() throws Exception {

    ControllerTestHelper.mockUpdateModel(mockedMainPageService);

    this.mockMvc.perform(get("/"))
        .andExpect(status().isOk())
        .andExpect(view().name("main_page"))
        .andDo(MockMvcResultHandlers.print());
    Mockito.verify(mockedMainPageService).update(Mockito.any(Model.class));
  }


}