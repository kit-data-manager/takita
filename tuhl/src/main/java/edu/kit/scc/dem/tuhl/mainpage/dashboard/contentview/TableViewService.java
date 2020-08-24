package edu.kit.scc.dem.tuhl.mainpage.dashboard.contentview;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchService;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;

import java.util.List;


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
  private boolean sortAsc;
  private String sortField; //als enum?

  /**
   * Constructor for the Table View Service to autowire required instances.
   *
   * @param searchIndexService instance of the logic for search index.
   *                           Injected with Springs dependency injection system
   *                           indicated by @autowired annotation.
   * @param searchService      instance of the logic for search.
   *                           Injected with Springs dependency injection system
   *                           indicated by @autowired annotation.
   */
  @Autowired
  public TableViewService(ISearchIndexService searchIndexService, ISearchService searchService,
                          IAssistanceService assistanceService) {
    this.searchIndexService = searchIndexService;
    this.searchService = searchService;
    this.assistanceService = assistanceService;
    this.sortAsc = false;
    this.sortField = "id";
    this.currentPage = 1;
  }


  /**
   * Trigger search
   *
   * @return List of Manuscripts
   */
  public List<Manuscript> search() {
    List<Manuscript> results = searchService.search(currentPage, sortField, sortAsc);
    //Shorten results to only necessary attributes
    if (results != null) {
      for (Manuscript m : results) {
        for (Page p : m.getPages()) {
          if (p.getResourceType().equals(ResourceType.IMAGE)) {
            ((ImagePage) p).setAnnotations(null);
          }
        }
      }
    }
    return results;
  }

  /**
   * Gets search Results from Search Service.
   *
   * @return List of Manuscripts
   */
  public List<Manuscript> getResults() {
    List<Manuscript> results = searchService.getResults();
    //Shorten results to only necessary attributes
    if (results != null) {
      for (Manuscript m : results) {
        for (Page p : m.getPages()) {
          if (p.getResourceType().equals(ResourceType.IMAGE)) {
            ((ImagePage) p).setAnnotations(null);
          }
        }
      }
    }
    return results;
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
  public boolean isSortAsc() {
    return sortAsc;
  }

  /**
   * Sets sortAsc boolean.
   *
   * @param sortAsc bool to be set
   */
  public void setSortAsc(boolean sortAsc) {
    this.sortAsc = sortAsc;
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
   * Gets first Page of Manuscript.
   *
   * @param manId of manuscript
   * @return first page
   * @throws NoSuchIndexEntryException when there is no manuscript with this ID in the search index
   */
  public String getFirstPage(String manId) throws NoSuchIndexEntryException {
    return searchIndexService.getManuscriptById(manId).getPages().get(0).getId();
  }

  /**
   * Update Model with everything from tableViewService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
    model.addAttribute("results", getResults());
    model.addAttribute("sortField", getSortField());
    if (isSortAsc()) {
      model.addAttribute("order", "asc");
    } else {
      model.addAttribute("order", "desc");
    }
    model.addAttribute("currentPage", getCurrentPage());
  }

  public void setNumberOfResults(int noResults) {
    searchService.setPageSize(noResults);
  }

  public long getNumberOfResultsPages()
  {
    return searchService.getResultPagesCount();
  }
  public JSONArray getData() {


    JSONArray data = new JSONArray();
    try {
      for (Manuscript man : getResults()) {
        JSONArray thumbnails = new JSONArray();
        for (Page pg : man.getPages()) {
          JSONObject obj = new JSONObject();
          String thumb = pg.getThumbResourceUrl();
          String id = pg.getId();
          obj.put("thumb", thumb);
          obj.put("id", id);
          thumbnails.put(obj);
        }
        JSONObject row = new JSONObject();
        row.put("id", man.getId());
        row.put("title", man.getTitle());
        row.put("publisher", man.getPublisher());
        row.put("created", man.getCreated());
        row.put("publicationYear", man.getPublicationYear());
        row.put("hasAlgorithmAnnotations", man.hasAlgorithmAnnotations());
        row.put("lastModified", man.getLastModified());
        row.put("noPages", man.getNoPages());
        row.put("thumbnails", thumbnails);

        data.put(row);

      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return data;
  }
}
