package edu.kit.scc.dem.tuhl.mainpage.dashboard.annoview;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.target.Target;
import edu.kit.scc.dem.tuhl.dataaccess.RepositoryAccessService;
import edu.kit.scc.dem.tuhl.dataaccess.AnnotationStoreAccessService;

import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;

import ch.qos.logback.classic.Logger;

/**
 * Implementation of ContentView Service for type AnnoView.
 * Has specific methods for AnnoView Content, such as get Thumbnails,
 * add Attribute, delete Attribute.
 * Has a name/type of ContentView it is implementing and holds the Attributes
 * that are currently selected to be displayed.
 */
@SessionScope
@Service
public class AnnoViewService implements IAnnoViewService {
  
  private static final String TYPE = "AnnoView";
  
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
  public AnnoViewService(ISearchIndexService searchIndexService, ISearchService searchService,
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
  public List<Annotation> search() {
    return searchService.searchAnno();
  }
  
  /**
   * Gets search Results from Search Service.
   *
   * @return List of Manuscripts
   */
  public List<Annotation> getResults() {
    return searchService.getAnnoResults();
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
   * Update Model with everything from AnnoViewService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
    model.addAttribute("annoResults", getResults());
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
    for (Annotation annotation : getResults()) {
        JSONObject row = new JSONObject();
        row.put("annoId", annotation.getId());
        row.put("creator", new JSONArray(annotation.getCreators()));
        row.put("lastModified", annotation.getModified());
        row.put("created", annotation.getCreated());
        row.put("manuscriptTitle", annotation.getManuscriptTitle());
        
        // getting all bodies
        // getting all textcards
        JSONArray textcards = new JSONArray();
        for (TextCard textcard : annotation.getTextCards()) {
        	JSONObject jsonObject = new JSONObject();
        	jsonObject.put("purpose", textcard.getPurpose());
        	if(textcard.getValue() != null) {
        		jsonObject.put("value", textcard.getValue());
        	}
        	if(textcard.getSource() != null) {
        		// It might be better to use "source" as the key for the JSONObject,
        		// but then the view needs to distinguish between "source"/"value".
        		// To avoid this distinction and to keep it more general, "value" is
        		// used.
        		jsonObject.put("value", textcard.getSource());
        	}
        	textcards.put(jsonObject);
        }
        row.put("textcards", textcards);
        // getting all tags
        JSONArray tags = new JSONArray();
        for (Tag tag : annotation.getTags()) {
        	JSONObject jsonObject = new JSONObject();
        	if(tag.getValue() != null) {
        		jsonObject.put("value", tag.getValue());
        	}
        	if(tag.getSource() != null) {
        		jsonObject.put("source", tag.getSource());
        	}
        	tags.put(jsonObject);
        }
        row.put("tags", tags);
        
        // getting all selectors
        JSONArray targetSelectors = new JSONArray();
        for (Target target : annotation.getTargets()) {
        	targetSelectors.put(target.getSelector().getWADMSerialization());
        }
        row.put("targetSelectors", targetSelectors);
        row.put("pageId", annotation.getPageId());
        
        // the following information are irrelevant for the enduser and will be ignored, but;
        // keeping the following as it might be needed in the future. 
        // JSONArray targets = new JSONArray();
        // for (Target target : annotation.getTargets()) {
        // 	targets.put(target.getWADMSerialization());
        // }
        // row.put("targets", targets);
        // TODO: this needs to be addressed, if annotations can target multiple resources/pages
        // row.put("linkToResource", annotation.getTargets().get(0).getLinkToResource());
                
        data.put(row);
    }
    return data;
  }
}
