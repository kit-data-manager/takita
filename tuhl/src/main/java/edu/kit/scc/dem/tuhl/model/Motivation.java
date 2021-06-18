package edu.kit.scc.dem.tuhl.model;

public enum Motivation {
  //assessing doesn't yet work with the WADM
  //ASSESSING("assessing"),
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

  public static Motivation stringToMotivation(String stringMotivation) {
    /* See Motivation enum
    if (Motivation.ASSESSING.toString().equals(stringMotivation)) {
      return Motivation.ASSESSING;
    } else */
    if (Motivation.BOOKMARKING.toString().equals(stringMotivation)) {
      return Motivation.BOOKMARKING;
    } else if (Motivation.CLASSIFYING.toString().equals(stringMotivation)) {
      return Motivation.CLASSIFYING;
    } else if (Motivation.COMMENTING.toString().equals(stringMotivation)) {
      return Motivation.COMMENTING;
    } else if (Motivation.DESCRIBING.toString().equals(stringMotivation)) {
      return Motivation.DESCRIBING;
    } else if (Motivation.EDITING.toString().equals(stringMotivation)) {
      return Motivation.EDITING;
    } else if (Motivation.HIGHLIGHTING.toString().equals(stringMotivation)) {
      return Motivation.HIGHLIGHTING;
    } else if (Motivation.IDENTIFYING.toString().equals(stringMotivation)) {
      return Motivation.IDENTIFYING;
    } else if (Motivation.LINKING.toString().equals(stringMotivation)) {
      return Motivation.LINKING;
    } else if (Motivation.MODERATING.toString().equals(stringMotivation)) {
      return Motivation.MODERATING;
    } else if (Motivation.QUESTIONING.toString().equals(stringMotivation)) {
      return Motivation.QUESTIONING;
    } else if (Motivation.REPLYING.toString().equals(stringMotivation)) {
      return Motivation.REPLYING;
    } else if (Motivation.TAGGING.toString().equals(stringMotivation)) {
      return Motivation.TAGGING;
    }
    throw new IllegalArgumentException("Purpose couldn't be parsed.");
  }
}
