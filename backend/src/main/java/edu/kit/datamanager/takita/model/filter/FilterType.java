package edu.kit.datamanager.takita.model.filter;

/**
 * Enum for saving the type of filter for UI and search package.
 */
public enum FilterType {
  UNDEFINED("edu.kit.datamanager.takita.model.filter.Undefined"),
  MATCH("edu.kit.datamanager.takita.model.filter.MatchFilter"),
  RANGE("edu.kit.datamanager.takita.model.filter.RangeFilter");

  private final String className;

  FilterType(String className) {
    this.className = className;
  }

  /**
   * Gets type of filter class
   * @return cls name
   */
  public String getClassName() {
    return className;
  }
}
