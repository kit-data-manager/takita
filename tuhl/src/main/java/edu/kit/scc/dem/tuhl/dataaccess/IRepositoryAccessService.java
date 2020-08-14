package edu.kit.scc.dem.tuhl.dataaccess;

import java.awt.Image;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.Date;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;


/**
 * Interface for class RepositoryAccess, contains logic for accessing the repository.
 */
public interface IRepositoryAccessService {

  /**
   * Format of the timestamps in the repository.
   */
  DateFormat TIMESTAMP_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
  DateFormat TIMESTAMP_FORMAT_MILLIS = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

  /**
   * Gets a manuscript in the database by its unique manuscript identifier.
   * @param manuscriptId manuscript identifier as String
   * @return manuscript as JSONObject
   */
  JSONObject getManuscriptById(String manuscriptId)
      throws IOException, InterruptedException, JSONException;

  /**
   * Gets the page of a manuscript by its unique identifier.
   * @param pageId page identifier as String
   * @return page as JSONObject
   */
  JSONObject getPageById(String pageId) throws InterruptedException, IOException, JSONException;

  /**
   * Gets the page assignment from a manuscript by its unique manuscript identifier.
   * @param manuscriptId manuscript identifier as String
   * @return page assignment as JSONObject
   */
  JSONArray getPageAssignmentForManuscriptId(String manuscriptId)
      throws InterruptedException, JSONException, IOException;

  /**
   * Gets all manuscripts in the database.
   * @return list of manuscripts as JSONObjects
   */
  List<JSONObject> getAllManuscripts() throws IOException, InterruptedException, JSONException;

  /**
   * Gets all manuscripts from the database modified after a certain time.
   * @param timestamp specified time after which all manuscripts should be returned as Date
   * @return list of manuscripts modified after a certain time
   */
  List<JSONObject> getManuscriptsModifiedAfter(Date timestamp)
      throws InterruptedException, JSONException, IOException, ParseException;

  /**
   * Gets the metadata of a manuscript given in XML.
   *
   * @param manuscriptId the id of the manuscript
   * @return the xml as a String
   */
  String getXmlByManuscriptId(String manuscriptId) throws IOException, InterruptedException;
}
