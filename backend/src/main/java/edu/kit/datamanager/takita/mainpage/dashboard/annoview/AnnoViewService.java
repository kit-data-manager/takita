package edu.kit.datamanager.takita.mainpage.dashboard.annoview;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;

import edu.kit.datamanager.takita.mainpage.search.ISearchService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.target.Target;

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

  private final ISearchService searchService;
  
  /**
   * Constructor for the Anno View Service to autowire required instances.
   *
   * @param searchService      instance of the logic for search.
   *                           Injected with Springs dependency injection system
   *                           indicated by @autowired annotation.
   */
  @Autowired
  public AnnoViewService(ISearchService searchService) {
    this.searchService = searchService;
  }
  
  
  /**
   * Trigger search.
   *
   * @return List of Manuscripts
   */
  public List<Annotation> search() {
    return searchService.queryAllAnnotations();
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
   * Update Model with everything from AnnoViewService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
    model.addAttribute("annoResults", getResults());
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
        // getting all textCards
        JSONArray textCards = new JSONArray();
        for (TextCard textCard : annotation.getTextCards()) {
        	JSONObject jsonObject = new JSONObject();
        	jsonObject.put("purpose", textCard.getPurpose());
        	if(textCard.getValue() != null) {
        		jsonObject.put("value", textCard.getValue());
        	}
        	if(textCard.getSource() != null) {
        		// It might be better to use "source" as the key for the JSONObject,
        		// but then the view needs to distinguish between "source"/"value".
        		// To avoid this distinction and to keep it more general, "value" is
        		// used.
        		jsonObject.put("value", textCard.getSource());
        	}
        	textCards.put(jsonObject);
        }
        row.put("textCards", textCards);
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
        	// this check is necessary for "page"-annotations, which don't have a selector, i.e. which
        	// target the whole document/image
        	if (target.getSelector() != null) {
        		targetSelectors.put(target.getSelector().getWADMSerialization());
        	}	
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
