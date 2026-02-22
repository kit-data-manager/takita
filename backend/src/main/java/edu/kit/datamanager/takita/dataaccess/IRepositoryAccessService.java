package edu.kit.datamanager.takita.dataaccess;

import java.io.IOException;
import java.text.ParseException;
import java.time.Instant;
import java.util.List;

import edu.kit.datamanager.takita.model.page.ResourceType;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;


/**
 * Interface for class RepositoryAccessService, contains logic for accessing the repository.
 */
public interface IRepositoryAccessService {

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
   * @param numberManuscripts number of pages you want to get manuscripts from, -1 if you want all
   * @return list of manuscripts as JSONObjects
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  List<JSONObject> getAllManuscripts(int numberManuscripts)
      throws IOException, InterruptedException, JSONException;

  /**
   * Gets all manuscripts in the repository modified after a certain time.
   *
   * @param timestamp specified time after which all manuscripts should be returned as Date
   * @return list of manuscripts modified after a certain time
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   * @throws ParseException if there is a problem while parsing the data to a JSONObject
   */
  List<JSONObject> getManuscriptsModifiedAfter(Instant timestamp)
      throws InterruptedException, JSONException, IOException, ParseException;

  /**
   * Returns the typeGeneral of a page.
   *
   * @param pageId page identifier as String
   * @return typeGeneral of a page
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  String getTypeGeneralByPageId(String pageId) throws InterruptedException, JSONException, IOException;
  
  /**
   * Gets the metadata of a manuscript that is given in the TEI standard.
   *
   * @param manuscriptId the id of the manuscript
   * @return the xml as a String
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  String getXmlByManuscriptId(String manuscriptId) throws IOException, InterruptedException;

  /**
   * Gets the content of a page that is given in the TEI standard.
   *
   * @param pageId the id of the page
   * @param fileName identifies the file associated to a page
   * @return the xml as a String
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  String getXmlByPageId(String pageId, String fileName) throws IOException, InterruptedException;
  
  /**
   * Gets base url for manuscript repository.
   *
   * @return base url String
   */
  String getBaseUrl();

  /**
   * Gets static path for manuscript store.
   *
   * @return static path String
   */
  String getStaticPath();

  /**
   * Construct page link from page id, number and linkType
   * @param pageId page id in repo
   * @param pageNumber page number in repo (file name without extension)
   * @param linkType link to TEXT file or IMAGE file
   * @return
   */
  String getLinkForPage(String pageId, String pageNumber, ResourceType linkType);
}
