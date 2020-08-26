package edu.kit.scc.dem.tuhl.assistance;

import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
import edu.kit.scc.dem.tuhl.mainpage.dashboard.contentview.TableViewService;
import edu.kit.scc.dem.tuhl.mainpage.search.IFilterService;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfigurationHolder;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;




/**
 * Class to handle help menu requests and to get User form Repository by its Pseudonym.
 */
@SessionScope
@Service
public class AssistanceService implements IAssistanceService {

  private final UserRepository repo;
  private IUser currentUser;
  private final IFilterService filterService;
  private final TableViewService tableViewService;
  private final IMainPageService mainPageService;

  /**
   * Constructor for the Assistance Service to autowire required instances.
   *
   * @param repo             instance of the User Repository giving access to user data.
   *                         Injected with Springs dependency injection system
   *                         indicated by @autowired annotation.
   * @param filterService    instance of the logic for filter.
   *                         Injected with Springs dependency injection system
   *                         indicated by @autowired annotation.
   * @param mainPageService  instance of the logic for mainPage.
   *                         Injected with Springs dependency injection system
   *                         indicated by @autowired annotation.
   * @param tableViewService instance of the logic for tabelview.
   *                         Injected with Springs dependency injection system
   *                         indicated by @autowired annotation.
   */
  @Autowired
  public AssistanceService(UserRepository repo, IFilterService filterService,
                           TableViewService tableViewService, IMainPageService mainPageService) {
    this.repo = repo;
    this.filterService = filterService;
    this.tableViewService = tableViewService;
    this.mainPageService = mainPageService;
    this.currentUser = new User("default");
    updateUser();
  }

  /**
   * Gets help display.
   *
   * @return html file name containing help display
   */
  @Override
  public String getHelp() {
    //TODO
    throw new AssertionError("not implemented");
  }

  /**
   * Gets user from database if one with this pseudonym already exists, creates new User if not.
   *
   * @param pseudonym of User
   * @return User from database or new User
   */
  @Override
  public IUser getUserByPseudonym(String pseudonym) {
    Optional<User> user = repo.findById(pseudonym);
    //TODO: ask if new user should be created
    return user.orElseGet(() -> createNewUser(pseudonym));
  }

  /**
   * Gets Pseudonym of current User.
   *
   * @return pseudonym
   */
  @Override
  public IUser getCurrentUser() {
    return currentUser;
  }

  /**
   * Changes current User.
   *
   * @param pseudonym of new User
   */
  @Override
  public void changeUser(String pseudonym, Model model) {
    IUser user = getUserByPseudonym(pseudonym);
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
   * Toggles saveFilter Setting and saves current filter if set to true.
   */
  @Override
  public void toggleSaveFilter() {
    currentUser.setSaveFilter(!currentUser.isSaveFilter());
    if (currentUser.isSaveFilter()) {
      currentUser.setFilter(filterService.getCurrentFilters());
    } else {

      currentUser.setFilter(new ArrayList<>());
    }
    updateUser();
  }

  /**
   * Toggles saveTable Setting and saves current table config if set to true.
   */
  @Override
  public void toggleSaveTable(Model model) {
    currentUser.setSaveTable(!currentUser.isSaveTable());
    updateUser();
  }

  /**
   * toggles checkThumbs Setting and saves current table config if set to true.
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
    User user = new User(currentUser.getCurrentPage(), currentUser.getColumns(),
        currentUser.getMatchFilter(), currentUser.getRangeFilter(),
        currentUser.isSaveTable(), currentUser.isSaveFilter(),
        currentUser.isCheckThumbs(), currentUser.getName(), currentUser.getPageSize(),
        currentUser.getLang(), currentUser.getSort());
    repo.save(user);
  }

  /**
   * Saves current Table config in current User and updates Model.
   *
   * @param columns table config
   * @param model   the holder for model attributes, used to pass attributes back to the view
   */
  public void setTableConfig(String columns, Model model) {
    if (currentUser.getName() != "default") {
      currentUser.setColumns(columns);
      updateUser();
      mainPageService.update(model);
    }
  }

  /**
   * Set number of Results shown on one Tableview Page for current User.
   *
   * @param pageSize selected number of Results
   * @param model    the holder for model attributes, used to pass attributes back to the view
   */
  public void setTablePage(int pageSize, Model model) {
    currentUser.setPageSize(pageSize);
    updateUser();
    mainPageService.update(model);
  }


  /**
   * Set sort that is selected for current User.
   *
   * @param sort  selected Sort in JSON format
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
    model.addAttribute("user", getCurrentUser());
  }

  private User createNewUser(String pseudonym) {
    User user = new User(pseudonym);
    repo.save(user);
    return user;
  }

  /**
   * set selected language for current user.
   *
   * @param lang  that is selected
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void setLanguage(String lang, Model model) {
    currentUser.setLang(lang);
    updateUser();
    mainPageService.update(model);
  }

  /**
   * Gets saved language of current User.
   *
   * @return language
   */
  public String getLang() {
    return currentUser.getLang();
  }
}
