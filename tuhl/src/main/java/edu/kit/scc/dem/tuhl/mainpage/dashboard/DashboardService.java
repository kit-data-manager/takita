package edu.kit.scc.dem.tuhl.mainpage.dashboard;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.ResourceBundle;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.context.annotation.SessionScope;


/**
 * Implements Dashboard Service Interface. Holds currently displayed content view and
 * all available/ implemented content views. Implements all mandatory methods such as get and
 * set current content view and get all content views.
 */
@SessionScope
@Service
public class DashboardService implements IDashboardService {
  
  private static final String VIEW_PREFIX = "views.";
  private ResourceBundle messages =
      ResourceBundle.getBundle("messages", LocaleContextHolder.getLocale());
  private final Map<String, String> availableContentViews;
  private String currentContentView;

  public DashboardService() throws IOException, JSONException {
    this.currentContentView = "tableview";
    this.availableContentViews = readAvailableViews();
  }
  
  private Map<String, String> readAvailableViews() throws IOException, JSONException {
    JSONArray availableViewsJson =
        new JSONArray(readFromFile());
  
    Map<String, String> contentViews = new HashMap<>();
    for (int i = 0; i < availableViewsJson.length(); i++) {
      String viewId = availableViewsJson.getJSONObject(i).getString("id");
      contentViews.put(viewId, messages.getString(VIEW_PREFIX + viewId));
    }
    return contentViews;
  }
  
  private String readFromFile()
      throws IOException {
    InputStream inputStream = getClass().getResourceAsStream("/availableViews.json");
    InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
    BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
    StringBuilder stringBuilder = new StringBuilder();
    String line;
    while ((line = bufferedReader.readLine()) != null) {
      stringBuilder.append(line);
    }
    bufferedReader.close();
    inputStreamReader.close();
    inputStream.close();
    return stringBuilder.toString();
  }
  
  private void updateAvailableViews() {
    messages = ResourceBundle.getBundle(messages.getBaseBundleName(),
        LocaleContextHolder.getLocale());
    availableContentViews.replaceAll((k, v) -> messages.getString(VIEW_PREFIX + k));
  }
  
  /**
   * Gets content view that is currently selected and displayed for the User.
   *
   * @return type of content view
   */
  @Override
  public String getCurrentContentView() {
    return this.currentContentView;
  }

  /**
   * Sets current content view.
   *
   * @param currentContentView type to be set
   */
  @Override
  public void setCurrentContentView(String currentContentView) {
    this.currentContentView = currentContentView;
  }

  /**
   * Gets all available/ implemented types of content views.
   *
   * @return array with all content view types.
   */
  @Override
  public Map<String, String> getAvailableContentViews() {
    updateAvailableViews();
    return this.availableContentViews;
  }

  /**
   * Gets redirect to currentContentview.
   *
   * @return redirect
   */
  @Override
  public String getRedirect() {
    return "redirect:/" + currentContentView;
  }

  /**
   * Update Model with everything from dashboardService.
   *
   * @param model the holder for model attributes, used to pass attributes back to the view
   */
  public void updateModel(Model model) {
    model.addAttribute("availableViews", getAvailableContentViews());
  }
}
