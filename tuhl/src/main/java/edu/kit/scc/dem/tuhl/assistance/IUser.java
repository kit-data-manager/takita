package edu.kit.scc.dem.tuhl.assistance;

import edu.kit.scc.dem.tuhl.model.filter.Filter;
import java.util.List;

/**
 * Interface for User class. Provides methods for settings and holds Setting constants.
 */
public interface IUser {


  /**
   * Gets name of User.
   *
   * @return name
   */
  String getName();

  /**
   * Gets saveTable boolean.
   *
   * @return if SaveTable is true
   */
  boolean isSaveTable();

  /**
   * Sets saveTable boolean.
   *
   * @param bool to be set
   */
  void setSaveTable(boolean bool);

  /**
   * Gets saveFilter boolean.
   *
   * @return if SaveFilter is true
   */
  boolean isSaveFilter();

  /**
   * Set saveFilter boolean.
   *
   * @param bool to be set
   */
  void setSaveFilter(boolean bool);

  /**
   * Gets saved Filters.
   *
   * @return List of Filters
   */
  List<Filter> getFilters();

  /**
   * Sets saved Filters.
   *
   * @param filter List of Filters to be saved
   */
  void setFilter(List<Filter> filter);

  /**
   * Gets checkThumbs boolean.
   *
   * @return if checkThumbs is true
   */
  boolean isCheckThumbs();

  /**
   * Set checkThumbs boolean.
   *
   * @param bool to be set
   */
  void setCheckThumbs(boolean bool);

  /**
   * Get all saved Match filters as JSON String.
   *
   * @return JSON String
   */
  String getMatchFilter();

  /**
   * Get all saved Range filters as JSON String.
   *
   * @return JSON String
   */
  String getRangeFilter();

  /**
   * Gets currentPage.
   * @return currentPage
   */
  int getCurrentPage();

  /**
   * Sets current Page.
   * @param currentPage to be set
   */
  void setCurrentPage(int currentPage);

  /**
   * Gets table config.
   * @return table config
   */
  String getColumns();

  /**
   * Sets table config.
   * @param columns config to be set.
   */
  void setColumns(String columns);

  int getPageSize();

  void setPageSize(int pageSize);

  String getPage();

  String getLang();

  void setLang(String lang);
}
