package edu.kit.scc.dem.tuhl;

public class NoSuchIndexEntryException extends Exception {

  /**
   * Gets thrown when there is no index entry like the one sought for.
   *
   * @param errorMessage to display
   */
  public NoSuchIndexEntryException(String errorMessage) {
    super(errorMessage);
  }

  /**
   * Gets thrown when there is no index entry like the one sought for.
   *
   * @param errorMessage to display
   * @param throwable to throw
   */
  public NoSuchIndexEntryException(String errorMessage, Throwable throwable) {
    super(errorMessage, throwable);
  }
}
