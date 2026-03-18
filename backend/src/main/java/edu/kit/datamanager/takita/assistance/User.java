package edu.kit.datamanager.takita.assistance;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import edu.kit.datamanager.takita.model.filter.Filter;
import edu.kit.datamanager.takita.model.filter.FilterType;
import edu.kit.datamanager.takita.model.filter.MatchFilter;
import edu.kit.datamanager.takita.model.filter.RangeFilter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;




/**
 * Stores user specific information such as Settings and Pseudonym.
 * Provides methods to modify settings.
 */
@Entity
public class User {

  @Id
  private String name;

  private boolean checkThumbs;
  private int currentPage;
  private int pageSize;
  private String language;
  private String sort;

  @Lob
  private String columns;

  @Lob
  private String rows;

  @Lob
  private String matchFilter;

  @Lob
  private String rangeFilter;

  //constructor for dataJPA, do not use!!
  protected User() {
  }


  /**
   * Constructor for User.
   *
   * @param name of User
   */
  public User(String name) {
    this.name = name;
    this.checkThumbs = false;
    this.currentPage = 1;
    this.pageSize = 10;
    this.language = "en";
    this.sort = "[{\"column\":\"id\",\"dir\":\"asc\"}]";
    clearRows();
    setFilter(new ArrayList<>());
  }

  /**
   * Gets name of User.
   *
   * @return name
   */
  public String getName() {
    return this.name;
  }

  /**
   * Gets all saved match filters as String.
   *
   * @return List of MatchFilter as JSON String
   */
  public String getMatchFilter() {
    return matchFilter;
  }

  /**
   * Gets all saved range filters as String.
   *
   * @return List of RangeFilter as JSON String
   */
  public String getRangeFilter() {
    return rangeFilter;
  }

  /**
   * Gets rows of displayed thumbnails.
   *
   * @return list of rows
   */
  public List<String> getRows(){
    Type rowType = TypeToken.getParameterized(ArrayList.class, String.class).getType();
    return new Gson().fromJson(this.rows, rowType);
  }

  /**
   * Sets rows of displayed thumbnails.
   *
   * @param rowList list of rows
   */
  public void setRows(List<String> rowList){
    this.rows = new GsonBuilder().create().toJson(rowList);
  }

  /**
   * Resets rows of displayed thumbnails.
   */
  private void clearRows(){
    List<String> list = new ArrayList<>();
    list.add("def");
    this.rows = new GsonBuilder().create().toJson(list);
  }

  /**
   * Gets all saved Filters.
   *
   * @return List of Filters
   */
  public List<Filter> getFilters() {
    Type rangeFilterType = TypeToken.getParameterized(ArrayList.class, RangeFilter.class).getType();
    List<Filter> rangeFilters = new Gson().fromJson(this.rangeFilter, rangeFilterType);
    Type matchFilterType = TypeToken.getParameterized(ArrayList.class, MatchFilter.class).getType();
    List<MatchFilter> matchFilters = new Gson().fromJson(this.matchFilter, matchFilterType);
    List<Filter> mergedFilters = new ArrayList<>(rangeFilters);
    mergedFilters.addAll(matchFilters);
    return mergedFilters;
  }

  /**
   * Saves Filters for User.
   *
   * @param filters List of Filters to be saved
   */
  public void setFilter(List<Filter> filters) {
    List<Filter> filterList = filters.stream().filter(
        filter1 -> filter1.getType() == FilterType.RANGE).collect(Collectors.toList());
    List<Filter> matchFilList = filters.stream().filter(
        filter1 -> filter1.getType() == FilterType.MATCH).collect(Collectors.toList());
    this.matchFilter = new GsonBuilder().create().toJson(matchFilList);
    this.rangeFilter = new GsonBuilder().create().toJson(filterList);
  }

  /**
   * Gets checkThumb boolean.
   *
   * @return if checkThumb is true
   */
  public boolean isCheckThumbs() {
    return checkThumbs;
  }

  /**
   * Sets checkThumb boolean.
   *
   * @param checkThumbs bool to be set
   */
  public void setCheckThumbs(boolean checkThumbs) {
    this.checkThumbs = checkThumbs;
  }

  /**
   * Gets currentPage.
   *
   * @return currentPage
   */
  public int getCurrentPage() {
    return currentPage;
  }

  /**
   * Sets current Page.
   *
   * @param currentPage to be set
   */
  public void setCurrentPage(int currentPage) {
    clearRows();
    this.currentPage = currentPage;
  }

  /**
   * Gets table config.
   *
   * @return table config
   */
  public String getColumns() {
    return columns;
  }

  /**
   * Sets table config.
   *
   * @param columns config to be set.
   */
  public void setColumns(String columns) {
    this.columns = columns;
  }

  public int getPageSize() {
    return pageSize;
  }

  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  /**
   * Gets saved page configuration.
   *
   * @return page configuration
   * @throws JSONException if the json containing the data is invalid
   */
  public String getPage() throws JSONException {
    JSONObject jsonObject = new JSONObject();
    jsonObject.put("paginationSize", pageSize);
    jsonObject.put("paginationInitialPage", 1);
    return jsonObject.toString();
  }

  public String getSort() {
    return sort;
  }

  public void setSort(String sort) {
    this.sort = sort;
  }
}
