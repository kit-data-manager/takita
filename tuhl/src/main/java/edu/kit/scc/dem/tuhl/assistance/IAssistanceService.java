package edu.kit.scc.dem.tuhl.assistance;

import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

/**
 * Interface for Assistance Service.
 * Provides method for help menu requests and to get User by its pseudonym from the User Repository.
 */
@Service
public interface IAssistanceService {

  /**
   * Gets help display.
   *
   * @return html file name containing help display
   */
  String getHelp();

  /**
   * Gets User from Database by its pseudonym.
   *
   * @param pseudonym of User that should be returned
   * @return User which ID is the given pseudonym
   */
  IUser getUserByPseudonym(String pseudonym);

  /**
   * Gets Pseudonym of current User.
   *
   * @return pseudonym
   */
  IUser getCurrentUser();

  /**
   * Changes User.
   *
   * @param pseudonym of new User
   */
  void changeUser(String pseudonym, Model model);

  /**
   * toggles saveFilter boolean of current User.
   */
  void toggleSaveFilter();

  /**
   * toggles saveTable boolean of current User.
   */
  void toggleSaveTable(Model model);

  /**
   * Updates currentUser in Repo.
   */
  void updateUser();

  /**
   * Saves current Table config in current User and updates Model.
   * @param columns table config
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void setTableConfig(String columns, Model model);

  /**
   * toggles checkThumb boolean of current User.
   */
  void toggleCheckThumbs();


  /**
   * Update Model with everything from assistanceService.
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void updateModel(Model model);

  void setTablePage(int page, Model model);

  void setLanguage(String lang, Model model);

  String getLang();

  void setTableSort(String sort, Model model);
}
