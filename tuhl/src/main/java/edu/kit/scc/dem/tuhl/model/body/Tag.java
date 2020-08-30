package edu.kit.scc.dem.tuhl.model.body;

import edu.kit.scc.dem.tuhl.model.Motivation;

public class Tag extends Body {

  /**
   * Constructor for Tag.
   *
   * @param id to be set
   */
  public Tag(String id) {
    super(id);
    setPurpose(Motivation.TAGGING);
  }
}
