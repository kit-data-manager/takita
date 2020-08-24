package edu.kit.scc.dem.tuhl.model;

public enum Motivation {
  ASSESSING("assessing"),
  BOOKMARKING("bookmarking"),
  CLASSIFYING("classifying"),
  COMMENTING("commenting"),
  DESCRIBING("describing"),
  EDITING("editing"),
  HIGHLIGHTING("highlighting"),
  IDENTIFYING("identifying"),
  LINKING("linking"),
  MODERATING("moderating"),
  QUESTIONING("questioning"),
  REPLYING("replying"),
  TAGGING("tagging");

  private final String name;

  /**
   * Constructor for Motivation.
   *
   * @param name lower case name for a motivation
   */
  Motivation(String name) {
    this.name = name;
  }

  /**
   * Gets the lower case name for a motivation.
   *
   * @return String name
   */
  public String getName() {
    return name;
  }
}
