package edu.kit.scc.dem.tuhl.dataaccess;


import java.io.IOException;
import java.net.http.HttpResponse;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;

/**
 * Contains logic for accessing the repository with RestTemplate.
 */
@Service
public class RepositoryAccessService implements IRepositoryAccessService {

  //All public variables are for accessing the path to images/thumbnails
  public static final String DATA_PATH = "/data/";
  public static final String THUMB_JPG = ".thumb.jpg";
  public static final String MASTER_JPG = ".master.jpg";
  private static final String PAGE_STRING = "?page=";
  private static final String MANUSCRIPT_PATTERN = "<(.*?)>; rel=\"next\",";
  private static final String MANUSCRIPT_METADATA_FILE = "manuscript_metadata.xml";
  private static final String PAGES_JSON = "pages.json";
  private static final String SEARCH_URL = "search?page=";
  private static final String SEARCH_SIZE_URL = "&size=";

  @Value("${repository.baseUrl}")
  private String baseUrl;
  @Value("${repository.staticPath}")
  private String staticPath;

  private final HttpRequestHelper httpRequestHelper;

  /**
   * Implements IRepositoryAccessService, contains logic for accessing the repository.
   */
  public RepositoryAccessService() {
    httpRequestHelper = new HttpRequestHelper();
  }

  /**
   * Gets a manuscript from the repository by its unique manuscript identifier.
   *
   * @param manuscriptId manuscript identifier as String
   * @return manuscript as JSONObject
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  @Override
  public JSONObject getManuscriptById(String manuscriptId)
      throws IOException, InterruptedException, JSONException {
    return new JSONObject(httpRequestHelper.get(baseUrl + staticPath + manuscriptId).body());
  }

  /**
   * Gets the page of a manuscript by its unique identifier.
   *
   * @param pageId page identifier as String
   * @return page as JSONObject
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  @Override
  public JSONObject getPageById(String pageId)
      throws InterruptedException, IOException, JSONException {
    return new JSONObject(httpRequestHelper.get(baseUrl + staticPath + pageId).body());
  }

  /**
   * Gets the page assignment from a manuscript by its unique manuscript identifier.
   *
   * @param manuscriptId manuscript identifier as String
   * @return page assignment as JSONObject
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  @Override
  public JSONArray getPageAssignmentForManuscriptId(String manuscriptId)
      throws InterruptedException, JSONException, IOException {
    return new JSONArray(httpRequestHelper
        .get(baseUrl + staticPath + manuscriptId + DATA_PATH + PAGES_JSON)
        .body());
  }

  /**
   * Gets all manuscripts in the repository.
   * @param numberManuscripts number of pages you want to get manuscripts from, -1 if you want all
   * @return list of manuscripts as JSONObjects
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  @Override
  public List<JSONObject> getAllManuscripts(int numberManuscripts)
      throws IOException, InterruptedException, JSONException {
    int pageSize;
    int pageCounter = 0;
    if (numberManuscripts <= 0 && numberManuscripts != -1) {
      return new ArrayList<>();
    } else if (numberManuscripts > 100 || numberManuscripts == -1) {
      pageSize = 99;
    } else {
      pageSize = numberManuscripts;
    }

    Pattern pattern = Pattern.compile(MANUSCRIPT_PATTERN);

    List<JSONObject> manuscriptsJson = new ArrayList<>();
    String nextUri = baseUrl + staticPath + SEARCH_URL + pageCounter + SEARCH_SIZE_URL;

    JSONObject resourceType = new JSONObject();
    JSONObject typeGeneral = new JSONObject();
    typeGeneral.put(RepositoryStrings.TYPE_GENERAL.getName(), RepositoryStrings.TEXT.getName());
    resourceType.put(RepositoryStrings.RESOURCE_TYPE.getName(), typeGeneral);

    HttpResponse<String> pageResponse = httpRequestHelper.postManuscript(
        nextUri + pageSize, resourceType);
    Optional<String> link;
  
    boolean findNextLink;
    do {
      findNextLink = false;
      link = pageResponse.headers().firstValue(RepositoryStrings.LINK.getName());
      
      //Extracts manuscripts from response body and adds them to the list
      JSONArray responseBodyJson = new JSONArray(pageResponse.body());
      for (int i = 0; i < responseBodyJson.length(); i++) {
        JSONObject resource = responseBodyJson.getJSONObject(i);
        //Adds all resources which are manuscripts and not pages to the list
        manuscriptsJson.add(resource);

        // Check if number of required manuscripts already reached
        if (numberManuscripts != -1 && manuscriptsJson.size() >= numberManuscripts) {
          return manuscriptsJson;
        }
      }
      if (link.isPresent()) {
        //Extracts next link from response header
        Matcher matcher = pattern.matcher(link.get());
        findNextLink = matcher.find();
        if (findNextLink) {
          nextUri = matcher.group(1);

          //Workaround for bug in the repository; inserts missing "/"
          //nextUri = new
          // StringBuilder(nextUri).insert(nextUri.indexOf(PAGE_STRING), "/").toString();

          //Workaround for bug in repository
          pageCounter++;
          nextUri = baseUrl + staticPath + SEARCH_URL + pageCounter + SEARCH_SIZE_URL + pageSize;

          //Gets manuscripts from extracted next link
          pageResponse = httpRequestHelper.postManuscript(nextUri, resourceType);
        }
      }
      // Repeat while there is a next page given by a link in the response header
    } while (findNextLink);

    return manuscriptsJson;
  }

  /**
   * Gets all manuscripts in the repository modified after a certain time.
   *
   * @param timestamp specified time after which all manuscripts should be returned as Date
   * @return list of manuscripts modified after a certain time
   * @throws JSONException if the response body could not be parsed to JSON
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  @Override
  public List<JSONObject> getManuscriptsModifiedAfter(Date timestamp)
      throws InterruptedException, JSONException, IOException {
    List<JSONObject> modifiedManuscripts = new ArrayList<>();

    //Goes through all manuscripts
    for (JSONObject manuscript : getAllManuscripts(-1)) {
      try {

        //Retrieves its modified and created timestamps
        JSONArray dates = manuscript.getJSONArray(RepositoryStrings.DATES.getName());
        for (int i = 0; i < dates.length(); i++) {
          JSONObject date = dates.getJSONObject(i);

          //Adds it to the returned list, if the modified/created timestamp
          //is after the specified timestamp
          if ((date.get(RepositoryStrings.TYPE.getName())
              .equals(RepositoryStrings.CREATED.getName())
              || date.get(RepositoryStrings.TYPE.getName())
              .equals(RepositoryStrings.MODIFIED.getName()))
                && isAfterFromString(date.getString(RepositoryStrings.VALUE.getName()),
              timestamp)) {
            modifiedManuscripts.add(manuscript);
            break;
          }
        }
      } catch (ParseException | JSONException e) {
        e.printStackTrace();
      }
    }

    return modifiedManuscripts;
  }

  private boolean isAfterFromString(String manuscriptDateString, Date isAfterDate)
      throws ParseException {
    Date manuscriptDate = IRepositoryAccessService.TIMESTAMP_FORMAT.parse(manuscriptDateString);
    return manuscriptDate.after(isAfterDate);
  }


  /**
   * Gets the metadata of a manuscript that is given in the TEI standard.
   *
   * @param manuscriptId the id of the manuscript
   * @return the xml as a String
   * @throws IOException if an error occurs while sending or receiving
   * @throws InterruptedException if the get request is interrupted
   */
  @Override
  public String getXmlByManuscriptId(String manuscriptId) throws IOException, InterruptedException {
    return httpRequestHelper.get(baseUrl + staticPath + manuscriptId + DATA_PATH
        + MANUSCRIPT_METADATA_FILE).body();
  }
}
