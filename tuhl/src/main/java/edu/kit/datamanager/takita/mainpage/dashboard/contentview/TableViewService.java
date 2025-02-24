package edu.kit.datamanager.takita.mainpage.dashboard.contentview;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.mainpage.search.ISearchService;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.page.Page;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;

/**
 * Implementation of ContentView Service for type TableView.
 * Has specific methods for TableView Content, such as get Thumbnails,
 * add Attribute, delete Attribute.
 * Has a name/type of ContentView it is implementing and holds the Attributes
 * that are currently selected to be displayed.
 */
@SessionScope
@Service
public class TableViewService implements IContentViewService {
  
  private static final String TYPE = "tableView";
  
  private final ISearchIndexService searchIndexService;
  private final ISearchService searchService;
  private final IAssistanceService assistanceService;
  private int currentPage;
  private boolean sortAscending;
  private String sortField;
  
  /**
   * Constructor for the Table View Service to autowire required instances.
   *
   * @param searchIndexService instance of the logic for search index.
   *                           Injected with Springs dependency injection system
   *                           indicated by @autowired annotation.
   * @param searchService      instance of the logic for search.
   *                           Injected with Springs dependency injection system
   *                           indicated by @autowired annotation.
   * @param assistanceService  instance of the logic for user management.
   *                           Injected with Springs dependency injection system
   *                           indicated by @autowired annotation.
   */
  @Autowired
  public TableViewService(ISearchIndexService searchIndexService, ISearchService searchService,
                          IAssistanceService assistanceService) {
    this.searchIndexService = searchIndexService;
    this.searchService = searchService;
    this.assistanceService = assistanceService;
    this.sortAscending = false;
    this.sortField = "id";
    this.currentPage = 1;
  }
  
  
  /**
   * Trigger search.
   *
   * @return List of Manuscripts
   */
  public List<Manuscript> search() {
    return searchService.search(currentPage, sortField, sortAscending);
  }
  
  /**
   * Gets search Results from Search Service.
   *
   * @return List of Manuscripts
   */
  public List<Manuscript> getResults() {
    return searchService.getResults();
  }
  
  
  /**
   * Gets Type of content view.
   *
   * @return type of content view as String
   */
  @Override
  public String getType() {
    return TYPE;
  }
  
  /**
   * gets current page number.
   *
   * @return current page number
   */
  public int getCurrentPage() {
    return currentPage;
  }
  
  /**
   * Sets current page number.
   *
   * @param currentPage number to be set
   */
  public void setCurrentPage(int currentPage) {
    assistanceService.getCurrentUser().setCurrentPage(currentPage);
    this.currentPage = currentPage;
  }
  
  /**
   * Get SortAsc boolean.
   *
   * @return if SortAsc is true
   */
  public boolean isSortAscending() {
    return sortAscending;
  }
  
  /**
   * Sets sortAsc boolean.
   *
   * @param sortAscending bool to be set
   */
  public void setSortAscending(boolean sortAscending) {
    this.sortAscending = sortAscending;
  }
  
  /**
   * Gets sortField.
   *
   * @return sortField
   */
  public String getSortField() {
    return sortField;
  }
  
  /**
   * Sets sortField.
   *
   * @param sortField to be set
   */
  public void setSortField(String sortField) {
    this.sortField = sortField;
  }
  
  /**
   * Gets all Pages of a Manuscript from searchIndexService.
   *
   * @param manuscriptId of manuscript
   * @return List of pages
   * @throws NoSuchIndexEntryException when there is no manuscript with the given ID
   *                                   in the search index
   */
  public List<Page> getPages(String manuscriptId) throws NoSuchIndexEntryException {
    return searchIndexService.getManuscriptById(manuscriptId).getPages();
  }
  
  /**
   * Gets the id of the first Page of the Manuscript with the specified id.
   *
   * @param manuscriptId of manuscript
   * @return the id of the first page
   * @throws NoSuchIndexEntryException when there is no manuscript with this ID in the search index
   */
  public String getFirstPage(String manuscriptId) throws NoSuchIndexEntryException {
    return getPages(manuscriptId).get(0).getId();
  }
  
  /**
   * Update Model with everything from tableViewService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
    model.addAttribute("results", getResults());
    model.addAttribute("sortField", getSortField());
    if (isSortAscending()) {
      model.addAttribute("order", "asc");
    } else {
      model.addAttribute("order", "desc");
    }
    model.addAttribute("currentPage", getCurrentPage());
  }
  
  public void setNumberOfResults(int numberOfResults) {
    searchService.setPageSize(numberOfResults);
  }
  
  public long getNumberOfResultsPages() {
    return searchService.getResultPagesCount();
  }
  
  /**
   * Gets results and formats them in JSON Array for table to read.
   *
   * @return table data as JSONArray
   * @throws JSONException if the data could not be parsed to a JSONObject
   */
  public JSONArray getData() throws JSONException {
    JSONArray data = new JSONArray();
    for (Manuscript manuscript : getResults()) {
      JSONArray thumbnails = new JSONArray();
      for (Page page : manuscript.getPages()) {
        JSONObject jsonObject = new JSONObject();
        String thumbNail = page.getThumbResourceUrl();
        String id = page.getId();
        jsonObject.put("thumbNail", thumbNail);
        jsonObject.put("id", id);
        jsonObject.put("pageNumber", page.getPageNumber());
        thumbnails.put(jsonObject);
      }
      
      JSONObject row = new JSONObject();
      row.put("id", manuscript.getId());
      row.put("title", manuscript.getTitle());
      row.put("description", manuscript.getDescription());
      row.put("publisher", manuscript.getPublisher());
      row.put("created", manuscript.getCreated());
      row.put("publicationYear", manuscript.getPublicationYear());
      row.put("hasAlgorithmAnnotations", manuscript.hasAlgorithmAnnotations());
      row.put("lastModified", manuscript.getLastModified());
      row.put("noPages", manuscript.getNoPages());
      row.put("thumbnails", thumbnails);
      
      data.put(row);
    }
    return data;
  }
}
