package edu.kit.datamanager.takita.model.filter;

/**
 * Enum for saving the type of filter for UI and search package.
 */
public enum FilterType {
  UNDEFINED("edu.kit.scc.dem.tuhl.model.filter.Undefined"),
  MATCH("edu.kit.scc.dem.tuhl.model.filter.MatchFilter"),
  RANGE("edu.kit.scc.dem.tuhl.model.filter.RangeFilter");

  private final String className;

  FilterType(String className) {
    this.className = className;
  }

  public String getClassName() {
    return className;
  }
}
