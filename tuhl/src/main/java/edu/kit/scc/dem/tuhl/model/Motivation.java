package edu.kit.scc.dem.tuhl.model;

public enum Motivation {
  //assessing doesn't yet work with the WADM
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
  TAGGING("tagging"),
  NOMOTIVATION("no motivation");

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
    if (stringMotivation.equals(Motivation.BOOKMARKING.getName())) {
      return Motivation.BOOKMARKING;
    } else if (stringMotivation.equals(Motivation.CLASSIFYING.getName())) {
      return Motivation.CLASSIFYING;
    } else if (stringMotivation.equals(Motivation.COMMENTING.getName())) {
      return Motivation.COMMENTING;
    } else if (stringMotivation.equals(Motivation.DESCRIBING.getName())) {
      return Motivation.DESCRIBING;
    } else if (stringMotivation.equals(Motivation.EDITING.getName())) {
      return Motivation.EDITING;
    } else if (stringMotivation.equals(Motivation.HIGHLIGHTING.getName())) {
      return Motivation.HIGHLIGHTING;
    } else if (stringMotivation.equals(Motivation.IDENTIFYING.getName())) {
      return Motivation.IDENTIFYING;
    } else if (stringMotivation.equals(Motivation.LINKING.getName())) {
      return Motivation.LINKING;
    } else if (stringMotivation.equals(Motivation.MODERATING.getName())) {
      return Motivation.MODERATING;
    } else if (stringMotivation.equals(Motivation.QUESTIONING.getName())) {
      return Motivation.QUESTIONING;
    } else if (stringMotivation.equals(Motivation.REPLYING.getName())) {
      return Motivation.REPLYING;
    } else if (stringMotivation.equals(Motivation.TAGGING.name())) {
      return Motivation.TAGGING;
    } else {
      return Motivation.NOMOTIVATION;
    }
  }
}
