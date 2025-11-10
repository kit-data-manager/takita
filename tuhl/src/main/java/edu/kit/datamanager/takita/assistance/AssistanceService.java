package edu.kit.datamanager.takita.assistance;

import edu.kit.datamanager.takita.configuration.SecurityConfiguration;
import edu.kit.datamanager.takita.mainpage.IMainPageService;
import edu.kit.datamanager.takita.mainpage.search.IFilterService;
import edu.kit.datamanager.takita.model.filter.Filter;
import edu.kit.datamanager.takita.model.filter.FilterConfigurationHolder;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;



/**
 * Class to handle help menu requests and to get User form Repository by its Pseudonym.
 */
@SessionScope
@Service
public class AssistanceService implements IAssistanceService {


  private final UserRepository userRepository;
  private User currentUser;
  private final IFilterService filterService;
  private final IMainPageService mainPageService;
  private final SecurityConfiguration securityConfiguration;
  
  /**
   * Constructor for the Assistance Service to autowire required instances.
   *
   * @param repo instance of the User Repository giving access to user data. Injected with
   *             Springs dependency injection system indicated by @autowired annotation.
   * @param filterService instance of the logic for filter. Injected with Springs dependency
   *                      injection system indicated by @autowired annotation.
   * @param mainPageService instance of the logic for mainPage. Injected with Springs dependency
   *                        injection system indicated by @autowired annotation.
   */
  @Autowired
  public AssistanceService(UserRepository repo, IFilterService filterService,
                           IMainPageService mainPageService, SecurityConfiguration securityConfiguration) {
    this.userRepository = repo;
    this.filterService = filterService;
    this.mainPageService = mainPageService;
    this.securityConfiguration = securityConfiguration;
    if (this.securityConfiguration.securityEnabled) {
      OAuth2User user = ((OAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
      this.currentUser = new User(user.getAttribute("name"));
    } else {
      this.currentUser = new User("default");
    }
    updateUser();
  }
  
  /**
   * Gets user from database if one with this pseudonym already exists, creates new User if not.
   *
   * @param pseudonym of User
   * @return User from database or new User
   */
  @Override
  public User getUserByPseudonym(String pseudonym) {
    Optional<User> user = userRepository.findById(pseudonym);
    return user.orElseGet(() -> createNewUser(pseudonym));
  }


  /**
   * Gets Pseudonym of current User.
   *
   * @return pseudonym
   */
  @Override
  public User getCurrentUser() {
    return currentUser;
  }
  

  /**
   * Changes current User.
   *
   * @param pseudonym of new User
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  @Override
  public void changeUser(String pseudonym, Model model) {
    User user = getUserByPseudonym(pseudonym);
    if (user != currentUser) {
      this.currentUser = user;
      filterService.clearCurrentFilters();
      filterService.applyConfiguration(new FilterConfigurationHolder(user.getFilters()));
      List<String> fields = new ArrayList<>();
      for (Filter filter : user.getFilters()) {
        fields.add(filter.getField());
      }
      filterService.addToCurrentFilters(fields);
    }
    mainPageService.update(model);
  }
  
  /**
   * Toggles checkThumbs Setting and saves current table config if set to true.
   */
  @Override
  public void toggleCheckThumbs() {
    currentUser.setCheckThumbs(!currentUser.isCheckThumbs());
    updateUser();
  }
  
  /**
   * Updates User in Repo.
   */
  @Override
  public void updateUser() {
    userRepository.save(currentUser);
  }
  
  /**
   * Saves current Table config in current User and updates Model.
   *
   * @param columns table config
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void setTableConfig(String columns, Model model) {
    if (!currentUser.getName().equals("default")) {
      currentUser.setColumns(columns);
      updateUser();
      mainPageService.update(model);
    }
  }
  
  /**
   * Set number of Results shown on one Tableview Page for current user.
   *
   * @param pageSize selected number of Results
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void setTablePage(int pageSize, Model model) {
    currentUser.setPageSize(pageSize);
    updateUser();
    mainPageService.update(model);
  }
  
  
  /**
   * Set sort that is selected for current user.
   *
   * @param sort selected Sort in JSON format
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void setTableSort(String sort, Model model) {
    currentUser.setSort(sort);
    updateUser();
    mainPageService.update(model);
  }
  
  /**
   * Update Model with everything from assistanceService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
      // necessary to tell thymeleaf and the frontend if security (and thereby csrf protection) is en/disabled.
      // "securityEnabled" is used to let thymeleaf decide whether, the main_page
      // template should store the csrf token (which is only available, if security is enabled)
      // or a default value in the "<meta name="_csrf">"-element.
      model.addAttribute("securityEnabled", securityConfiguration.securityEnabled);
      model.addAttribute("user", getCurrentUser());
  }
  
  private User createNewUser(String pseudonym) {
    User user = new User(pseudonym);
    userRepository.save(user);
    return user;
  }
  
  /**
   * set selected language for current user.
   *
   * @param lang  that is selected
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void setLanguage(String lang, Model model) {
    currentUser.setLanguage(lang);
    updateUser();
    mainPageService.update(model);
  }
  
  /**
   * Gets saved language of current User.
   *
   * @return language
   */
  public String getLang() {
    return currentUser.getLanguage();
  }


  /**
   * Adds Row of which thumbnails are displayed to current user.
   *
   * @param row to be added
   */
  public void addRow(String row){
    List<String> currentRows = currentUser.getRows();
    currentRows.add(row);
    currentUser.setRows(currentRows);
  }

  /**
   * Removes Row of which thumbnails are displayed from current user.
   *
   * @param row to be removed
   */
  public void removeRow(String row){
    List<String> currentRows = currentUser.getRows();
    currentRows.remove(row);
    currentUser.setRows(currentRows);
  }
}
