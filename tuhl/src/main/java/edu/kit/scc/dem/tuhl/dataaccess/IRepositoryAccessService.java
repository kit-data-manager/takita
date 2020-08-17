package edu.kit.scc.dem.tuhl.dataaccess;

import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;


/**
 * Interface for class RepositoryAccessService, contains logic for accessing the repository.
 */
public interface IRepositoryAccessService {

  /**
   * Format of the timestamps in the repository.
   */
  DateFormat TIMESTAMP_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
  DateFormat TIMESTAMP_FORMAT_MILLIS = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

  /**
   * Gets a manuscript from the repository by its unique manuscript identifier.
   *
   * @param manuscriptId manuscript identifier as String
   * @return manuscript as JSONObject
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  JSONObject getManuscriptById(String manuscriptId)
      throws IOException, InterruptedException, JSONException;

  /**
   * Gets the page of a manuscript by its unique identifier.
   *
   * @param pageId page identifier as String
   * @return page as JSONObject
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  JSONObject getPageById(String pageId) throws InterruptedException, IOException, JSONException;

  /**
   * Gets the page assignment from a manuscript by its unique manuscript identifier.
   *
   * @param manuscriptId manuscript identifier as String
   * @return page assignment as JSONObject
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  JSONArray getPageAssignmentForManuscriptId(String manuscriptId)
      throws InterruptedException, JSONException, IOException;

  /**
   * Gets all manuscripts in the repository.
   *
   * @param pages number of pages you want to get manuscripts from, -1 if you want all
   * @return list of manuscripts as JSONObjects
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  List<JSONObject> getAllManuscripts(int pages) throws IOException, InterruptedException, JSONException;

  /**
   * Gets all manuscripts in the repository modified after a certain time.
   *
   * @param timestamp specified time after which all manuscripts should be returned as Date
   * @return list of manuscripts modified after a certain time
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  List<JSONObject> getManuscriptsModifiedAfter(Date timestamp)
      throws InterruptedException, JSONException, IOException, ParseException;

  /**
   * Gets the metadata of a manuscript that is given in the TEI standard.
   *
   * @param manuscriptId the id of the manuscript
   * @return the xml as a String
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  String getXmlByManuscriptId(String manuscriptId) throws IOException, InterruptedException;
}
