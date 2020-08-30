package edu.kit.scc.dem.tuhl.assistance;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.FilterType;
import edu.kit.scc.dem.tuhl.model.filter.MatchFilter;
import edu.kit.scc.dem.tuhl.model.filter.RangeFilter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
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
  private String lang;
  private String sort;

  @Lob
  private String columns;

  @Lob
  private String rows;

  @Lob
  private String matchFilter;

  @Lob
  private String rangeFilter;

  //constructor for dataJPA do not use!!
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
    this.lang = "en";
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

  public List<String> getRows(){
    Type rowType = TypeToken.getParameterized(ArrayList.class, String.class).getType();
    return new Gson().fromJson(this.rows, rowType);
  }

  public void setRows(List<String> rowList){
    this.rows = new GsonBuilder().create().toJson(rowList);
  }

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
    List<Filter> rangeFilterList = new Gson().fromJson(this.rangeFilter, rangeFilterType);
    Type matchFilterType = TypeToken.getParameterized(ArrayList.class, MatchFilter.class).getType();
    List<MatchFilter> matchFilterList = new Gson().fromJson(this.matchFilter, matchFilterType);
    List<Filter> merged = new ArrayList<>(rangeFilterList);
    merged.addAll(matchFilterList);
    return merged;
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

  public String getLang() {
    return lang;
  }

  public void setLang(String lang) {
    this.lang = lang;
  }

  /**
   * Gets saved page configuration.
   *
   * @return page configuration
   */
  public String getPage() throws JSONException {
    JSONObject obj = new JSONObject();
    obj.put("paginationSize", pageSize);
    obj.put("paginationInitialPage", 1);
    return obj.toString();
  }

  public String getSort() {
    return sort;
  }

  public void setSort(String sort) {
    this.sort = sort;
  }
}
