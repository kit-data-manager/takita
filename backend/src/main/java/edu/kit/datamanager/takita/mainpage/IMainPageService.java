package edu.kit.datamanager.takita.mainpage;

import org.springframework.ui.Model;

/**
 * Interface for MainPageService. Provides method to update model.
 */
public interface IMainPageService {

  /**
   * Updates model for mainPage.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view.
   */
  void update(Model model);
}
