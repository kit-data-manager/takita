package edu.kit.scc.dem.tuhl.mainpage.dashboard;

import edu.kit.scc.dem.tuhl.assistance.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.ui.Model;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = DashboardService.class)
@TestPropertySource("classpath:application-test.properties")
class DashboardServiceTest {
  
  @Autowired
  private IDashboardService dashboardService;
  
  @Test
  void getAvailableContentViews() throws IOException, JSONException {
    Map<String, String> availableViews = dashboardService.getAvailableContentViews();
  
    JSONArray availableViewsJson = new JSONArray(
        Files.readString(Path.of("src/main/resources/availableViews.json")));
    
    for (int i = 0; i < availableViewsJson.length(); i++) {
      String viewId = availableViewsJson.getJSONObject(i).getString("id");
      assertTrue(availableViews.containsKey(viewId));
    }
  }
  
  @Test
  void updateModel() {
    Model mockedModel = mock(Model.class);
    when(mockedModel.addAttribute(anyString(), any(User.class))).thenAnswer(invocation -> {
      assertEquals("availableViews", invocation.getArgument(0));
      assertEquals(dashboardService.getAvailableContentViews(), invocation.getArgument(1));
      return mockedModel;
    });
    dashboardService.updateModel(mockedModel);
  }
  
  @Test
  void getRedirect() {
    String expectedRedirectString = "redirect:/" + dashboardService.getCurrentContentView();
    assertEquals(expectedRedirectString, dashboardService.getRedirect());
  }
}