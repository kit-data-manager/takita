package edu.kit.datamanager.takita.mainpage.dashboard;

import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

/**
 * Interface for Dashboard Service. Provides methods to get and set current ContentView and
 * to get all implemented/available types of contentViews.
 */

@Service
public interface IDashboardService {

  /**
   * Gets type of currently displayed content view.
   *
   * @return type of content view
   */
  String getCurrentContentView();

  /**
   * Sets current content view.
   *
   * @param contentView type to be set
   */
  void setCurrentContentView(String contentView);

  /**
   * Gets all available/implemented types of content views.
   *
   * @return array of available content view types
   */
  Map<String, String> getAvailableContentViews();

  /**
   * Gets redirect to currentContentview.
   *
   * @return redirect
   */
  String getRedirect();

  /**
   * Update Model with everything from dashboardService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void updateModel(Model model);
}
