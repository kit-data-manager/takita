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
   * Gets User from Database by its pseudonym.
   *
   * @param pseudonym of User that should be returned
   * @return User which ID is the given pseudonym
   */
  User getUserByPseudonym(String pseudonym);

  /**
   * Gets Pseudonym of current User.
   *
   * @return pseudonym
   */
  User getCurrentUser();

  /**
   * Changes User.
   *
   * @param pseudonym of new User
   */
  void changeUser(String pseudonym, Model model);

  /**
   * Updates currentUser in Repo.
   */
  void updateUser();

  /**
   * Saves current Table config in current User and updates Model.
   *
   * @param columns table config
   * @param model   the holder for model attributes, used to pass attributes back to the view
   */
  void setTableConfig(String columns, Model model);

  /**
   * toggles checkThumb boolean of current User.
   */
  void toggleCheckThumbs();


  /**
   * Update Model with everything from assistanceService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void updateModel(Model model);

  /**
   * Set number of Results shown on one Tableview Page for current User.
   *
   * @param page  selected number of Results
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void setTablePage(int page, Model model);

  /**
   * set selected language for current user.
   *
   * @param lang  that is selected
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void setLanguage(String lang, Model model);

  /**
   * Gets saved language of current User.
   *
   * @return language
   */
  String getLang();

  /**
   * Set sort that is selected for current User.
   *
   * @param sort  selected Sort in JSON format
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  void setTableSort(String sort, Model model);

  void addRow(String row);

  void removeRow(String row);
}
