package edu.kit.datamanager.takita.dataaccess;

import java.text.SimpleDateFormat;

/**
 * Format of the timestamps in the repository and annotation store.
 */
public enum TimeStampFormats {

  TIMESTAMP_FORMAT_REPO(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")),
  TIMESTAMP_FORMAT_MILLIS_REPO(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")),
  TIMESTAMP_FORMAT_ANNO(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")),
  TIMESTAMP_FORMAT_MILLIS_ANNO(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));

  private final SimpleDateFormat simpleDateFormat;

  /**
   * Constructor, initializes simpleDateFormat.
   *
   * @param simpleDateFormat SimpleDateFormat of thetime stamp
   */
  TimeStampFormats(SimpleDateFormat simpleDateFormat) {
    this.simpleDateFormat = simpleDateFormat;
  }

  /**
   * Gets the timestamp format.
   *
   * @return SimpleDateFormat
   */
  public SimpleDateFormat getDateFormat() {
    return simpleDateFormat;
  }
}


