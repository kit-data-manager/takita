package edu.kit.scc.dem.tuhl.dataaccess;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.Motivation;
import edu.kit.scc.dem.tuhl.model.body.Body;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.TextPage;
import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;

/**
 * Handles requests to annotation store and repository from the rest of the application.
 */
@Service
public class AccessService implements IAccessService {
  
  private static final Logger logger = LoggerFactory.getLogger(AccessService.class);
  private final IAnnotationStoreAccessService annotationStoreAccessService;
  private final IRepositoryAccessService repositoryAccessService;
  private ISearchIndexService searchIndexService;
  private AnnotationConverter annotationConverter;

  @Value("${repository.baseUrl}")
  private String baseUrl;
  @Value("${repository.staticPath}")
  private String staticPath;
  @Value(("${devIndex.size}"))
  private int devIndexSize;

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param annotationStoreAccessService instance of IAnnotationStoreAccessService
   * @param repositoryAccessService instance of IRepositoryAccessService
   */
  @Autowired
  public AccessService(IAnnotationStoreAccessService annotationStoreAccessService,
                       IRepositoryAccessService repositoryAccessService,
                       AnnotationConverter annotationConverter) {
    this.annotationStoreAccessService = annotationStoreAccessService;
    this.repositoryAccessService = repositoryAccessService;
    this.annotationConverter = annotationConverter;
  }

  /**
   * Sets the searchIndexService.
   *
   * @param searchIndexService ISearchIndexService to set
   */
  public void setSearchIndexService(ISearchIndexService searchIndexService) {
    this.searchIndexService = searchIndexService;
  }

  private Manuscript buildManuscriptFromJson(
      JSONObject manuscriptJson, Map<String, List<Annotation>> sortedAnnotations)
      throws JSONException, IOException, InterruptedException {

    final String id = manuscriptJson.getString(RepositoryStrings.ID.getName());
    //Sets attributes if they are specified in the json.
    String publisher = null;
    if (manuscriptJson.has(RepositoryStrings.PUBLISHER.getName())) {
      publisher = manuscriptJson.getString(RepositoryStrings.PUBLISHER.getName());
    }
    int publicationYear = -1;
    if (manuscriptJson.has(RepositoryStrings.PUBLICATION_YEAR.getName())) {
      publicationYear = Integer.parseInt(manuscriptJson.getString(
          RepositoryStrings.PUBLICATION_YEAR.getName()));
    }
    String title = null;
    if (manuscriptJson.has(RepositoryStrings.TITLES.getName())) {
      title = manuscriptJson.getJSONArray(RepositoryStrings.TITLES.getName()).getJSONObject(0)
          .getString(RepositoryStrings.VALUE.getName());
    }

    Date created = extractDateFromJsonManuscript(manuscriptJson,
        RepositoryStrings.CREATED.getName());
    Date modified;
    if (extractDateFromJsonManuscript(manuscriptJson,
        RepositoryStrings.MODIFIED.getName()) != null) {
      modified = extractDateFromJsonManuscript(manuscriptJson,
          RepositoryStrings.MODIFIED.getName());
    } else {
      modified = created;
    }

    Manuscript manuscript = new Manuscript(id, created, title, publisher, publicationYear);
    manuscript.setLastModified(modified);
    
    //Retrieves pages from the page assignment.
    // Adds the pages after their creation to the manuscript.
    JSONArray pageAssignments = repositoryAccessService
        .getPageAssignmentForManuscriptId(manuscript.getId());
    List<Page> pages = new ArrayList<>();
    for (int i = 0; i < pageAssignments.length(); i++) {
      JSONObject assignment = pageAssignments.getJSONObject(i);
      JSONObject pageJson = repositoryAccessService.getPageById(assignment.getString(
          RepositoryStrings.RESOURCE_ID.getName()));
      String pageNumber = assignment.getString(RepositoryStrings.PAGE_ID.getName());
      Page page;
      if (sortedAnnotations == null) {
        page = buildPageFromJson(pageJson, pageNumber, null);
      } else {
        page = buildPageFromJson(pageJson, pageNumber, sortedAnnotations);
      }
      page.setManuscriptId(manuscript.getId());
      pages.add(page);
    }

    manuscript.setPages(pages);
    return manuscript;
  }

  private Date extractDateFromJsonManuscript(JSONObject json, String type) {
    Date date = null;
    try {
      //Extracts the dates array from the JSON
      if (json.has(RepositoryStrings.DATES.getName())) {
        JSONArray dates = json.getJSONArray(RepositoryStrings.DATES.getName());
        for (int i = 0; i < dates.length(); i++) {
          JSONObject dateJson = dates.getJSONObject(i);
          //Checks for each date if it has the required type & parse the right date to a Date object
          if (dateJson.has(RepositoryStrings.TYPE.getName())
              && dateJson.getString(RepositoryStrings.TYPE.getName()).equals(type)
              && dateJson.has(RepositoryStrings.VALUE.getName())) {
            String dateString = dateJson.getString((RepositoryStrings.VALUE.getName()));
            if (dateString.contains(".")) {
              date = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_REPO.getDateFormat()
                  .parse(dateString);
            } else {
              date = TimeStampFormats.TIMESTAMP_FORMAT_REPO.getDateFormat().parse(dateString);
            }
            break;
          }
        }
      }
    } catch (ParseException | JSONException e) {
      e.printStackTrace();
    }
    return date;
  }

  /**
   * Builds the page with the accompanying annotations from sortedAnnotations.
   * If sortedAnnotations is null the annotations will be obtained by getAnnotationsByPage().
   */
  private Page buildPageFromJson(JSONObject pageJson, String pageNumber,
                                 Map<String, List<Annotation>> sortedAnnotations)
      throws JSONException, IOException, InterruptedException {
    String id = pageJson.getString(RepositoryStrings.ID.getName());

    Date created = extractDateFromJsonManuscript(pageJson, RepositoryStrings.CREATED.getName());
    Date modified = extractDateFromJsonManuscript(pageJson, RepositoryStrings.MODIFIED.getName());

    //Create the Page object depending on the resource type.
    Page page;
    String resourceTypeString = pageJson.getJSONObject(RepositoryStrings.RESOURCE_TYPE.getName())
        .getString(RepositoryStrings.TYPE_GENERAL.getName());
    
    if (resourceTypeString.equals(RepositoryStrings.IMAGE.getName())) {
      // URL to image of Page
      String resourceUrl = baseUrl + staticPath + id
          + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.MASTER_JPG;
      String thumbResourceUrl = baseUrl + staticPath + id + RepositoryAccessService.DATA_PATH
          + pageNumber + RepositoryAccessService.THUMB_JPG;

      ImagePage imagePage = new ImagePage(id, pageNumber, created, resourceUrl, thumbResourceUrl);
      if (sortedAnnotations == null) {
        imagePage.setAnnotations(getAnnotationsByPage(imagePage));
      } else {
        imagePage.setAnnotations(sortedAnnotations.get(imagePage.getId()));
      }
      
      page = imagePage;
    } else if (resourceTypeString.equals(RepositoryStrings.TEXT.getName())) {

      // Here comes the URL to the resource of the page
      String resourceUrl = "";

      page = new TextPage(id, pageNumber, created, resourceUrl);
    } else {
      throw new IllegalStateException("Unexpected value: " + resourceTypeString);
    }

    page.setLastModified(modified);

    return page;
  }
  
  /**
   * Gets all manuscripts from repository and fuses them with all annotations
   * from the annotation store.
   *
   * @return list of all manuscripts
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  @Override
  public List<Manuscript> getAllManuscripts()
      throws InterruptedException, JSONException, IOException {
    List<Manuscript> manuscripts = new ArrayList<>();
    Map<String, List<Annotation>> sortedAnnotations =
        getAllAnnotationsSorted(annotationStoreAccessService.getAllAnnotations());

    logger.info("Getting all manuscripts.");
    for (JSONObject manuscriptJson : repositoryAccessService.getAllManuscripts(-1)) {
      manuscripts.add(buildManuscriptFromJson(manuscriptJson, sortedAnnotations));
    }
    return manuscripts;
  }

  /**
   * Gets all manuscripts and annotations last modified after a certain time.
   *
   * @param timestamp specified time after which all manuscripts should be returned as Date
   * @return list of manuscripts modified after a certain time
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws ParseException if an error occurs while parsing the date
   * @throws NoSuchIndexEntryException if there is a problem finding a modified manuscript in the
   * index
   */
  @Override
  public List<Manuscript> getAllManuscriptsModifiedAfter(Date timestamp)
      throws InterruptedException, JSONException, IOException, ParseException,
      NoSuchIndexEntryException {
    logger.info("Getting all manuscripts modified after {}.", timestamp);
    List<Manuscript> manuscripts = new ArrayList<>();
    List<Annotation> newAnnotations = new ArrayList<>();
    for (JSONObject jsonAnnotation :
        annotationStoreAccessService.getAnnotationsModifiedAfter(timestamp)) {
      newAnnotations.add(annotationConverter.buildAnnotationFromJson(jsonAnnotation));
    }

    //checks if old manuscript has new annotations and adds those
    for (Annotation annotation : newAnnotations) {
      Page page = searchIndexService.getPageById(annotation.getPageId());
      Manuscript manuscript = searchIndexService.getManuscriptById(page.getManuscriptId());
      if (!page.getAnnotations().contains(annotation)) {
        ((ImagePage) page).addAnnotation(annotation);
      }
      manuscripts.add(manuscript);
    }

    //adds new manuscripts
    for (JSONObject manuscriptJson : repositoryAccessService
        .getManuscriptsModifiedAfter(timestamp)) {

      Manuscript newManuscript = buildManuscriptFromJson(manuscriptJson, null);
      if (!manuscripts.contains(newManuscript)) {
        manuscripts.add(newManuscript);
      }
    }

    return manuscripts;
  }

  /**
   * Gets a limited number of manuscripts with pages and annotations specified above.
   *
   * @return List of some manuscripts
   * @throws InterruptedException when http request is interrupted
   * @throws JSONException when there is a problem with parsing the JSON files
   * @throws IOException when the http request is faulty
   */
  @Override
  public List<Manuscript> getFewManuscripts()
      throws InterruptedException, JSONException, IOException {
    List<JSONObject> manuscriptsJson = repositoryAccessService.getAllManuscripts(devIndexSize);

    List<Manuscript> reducedManuscripts = new ArrayList<>();
    for (JSONObject manuscript : manuscriptsJson) {
      reducedManuscripts.add(buildManuscriptFromJson(manuscript, null));
    }

    return reducedManuscripts;
  }

  /**
   * Converts annotation to JSONObject so it can be added to database more easily,
   * then tells AnnotationStoreAccess to add it.
   *
   * @param annotation annotation to add to database as Annotation
   * @param pageNumber number of the page on which the annotation is
   * @return Annotation with added fields
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  @Override
  public Annotation addAnnotation(Annotation annotation, String pageNumber)
      throws JSONException, IOException, InterruptedException {
    JSONObject response = annotationStoreAccessService
        .addAnnotation(annotationConverter.buildJsonFromAnnotation(annotation, pageNumber));
    return annotationConverter.buildAnnotationFromJson(response);
  }

  /**
   * Converts annotation to JSONObject so it can be added to database more easily,
   * then tells AnnotationStoreAccess to add it to validated container.
   *
   * @param annotation validated annotation
   * @param pageNumber number of the page on which the annotation is
   * @return validated Annotation for replacing the old one
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  @Override
  public Annotation validateAnnotation(Annotation annotation, String pageNumber)
      throws JSONException, IOException, InterruptedException {
    JSONObject validatedAnnotation = annotationStoreAccessService
        .validateAnnotation(annotationConverter.buildJsonFromAnnotation(annotation, pageNumber));
    return annotationConverter.buildAnnotationFromJson(validatedAnnotation);
  }

  /**
   * Converts annotation to JSONObject so it can be updated in database more easily,
   * then tells AnnotationStoreAccess to update it.
   *
   * @param annotation annotation to update in database as Annotation
   * @param pageNumber number of the page on which the annotation is
   * @return the updated Annotation
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  @Override
  public Annotation updateAnnotation(Annotation annotation, String pageNumber)
      throws JSONException, IOException, InterruptedException {
    JSONObject updatedAnnotation = annotationStoreAccessService.updateAnnotation(annotation.getId(),
        annotationConverter.buildJsonFromAnnotation(annotation, pageNumber), annotation.getEtag());
    return annotationConverter.buildAnnotationFromJson(updatedAnnotation);
  }

  /**
   * Converts annotation so it can be deleted from database more easily,
   * then tells AnnotationStoreAccess to delete it it.
   *
   * @param annotation annotation to be deleted as Annotation
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  @Override
  public void deleteAnnotation(Annotation annotation)
      throws InterruptedException, JSONException, IOException {
    annotationStoreAccessService.deleteAnnotation(annotation.getId(), annotation.getEtag());
  }

  /**
   * Gets the JSON metadata of a manuscript as the raw JSON String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw JSON as a String
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  @Override
  public JSONObject getRawManuscriptJson(String manuscriptId)
      throws InterruptedException, JSONException, IOException {
    return repositoryAccessService.getManuscriptById(manuscriptId);
  }

  /**
   * Gets the JSON metadata of a page as the raw JSON String.
   *
   * @param pageId the id of the page
   * @return the raw JSON as a String
   * @throws InterruptedException if the http request is interrupted
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   */
  @Override
  public JSONObject getRawPageJson(String pageId)
      throws InterruptedException, JSONException, IOException {
    return repositoryAccessService.getPageById(pageId);
  }

  /**
   * Gets the JSON metadata of an annotation as the raw JSON String.
   *
   * @param annotationId the id of the annotation
   * @return the raw JSON as a String
   * @throws InterruptedException if the http request is interrupted
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws JSONException if an error occurs while parsing json
   */
  @Override
  public JSONObject getRawAnnotationJson(String annotationId)
      throws InterruptedException, IOException, JSONException {
    return annotationStoreAccessService.getAnnotationById(annotationId);
  }

  /**
   * Gets the XML metadata given in the TEI standard of a manuscript as the raw XML String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw xml as a String
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  @Override
  public String getRawManuscriptXml(String manuscriptId) throws IOException, InterruptedException {
    return repositoryAccessService.getXmlByManuscriptId(manuscriptId);
  }


  private Map<String, List<Annotation>> getAllAnnotationsSorted(
      List<JSONObject> jsonAnnotations) throws JSONException {
    Map<String, List<Annotation>> sortedAnnotations = new HashMap<>();

    for (JSONObject jsonAnnotation : jsonAnnotations) {
      Annotation annotation = annotationConverter.buildAnnotationFromJson(jsonAnnotation);

      if (sortedAnnotations.containsKey(annotation.getPageId())) {
        sortedAnnotations.get(annotation.getPageId()).add(annotation);
      } else {
        List<Annotation> annotations = new ArrayList<>();
        annotations.add(annotation);
        sortedAnnotations.put(annotation.getPageId(), annotations);
      }
    }
    return sortedAnnotations;
  }

  /*
   * Gets all annotations for a page.
   */
  private List<Annotation> getAnnotationsByPage(Page page)
      throws InterruptedException, JSONException, IOException {
    List<JSONObject> jsonAnnotations =
        annotationStoreAccessService.getAnnotationsByPageId(page.getId(), page.getPageNumber());
    List<Annotation> annotations = new ArrayList<>();

    for (JSONObject annotation : jsonAnnotations) {
      annotations.add(annotationConverter.buildAnnotationFromJson(annotation));
    }

    //remove de interpretatione annotations to which there is a corresponding validated annotation
    List<String> canonicalIds = new ArrayList<>();
    for (Annotation annotation : annotations) {
      if (annotation.getCanonical() != null) {
        canonicalIds.add(annotation.getCanonical());
      }
    }
    List<Annotation> redundantAnnotations = new ArrayList<>();
    for (Annotation annotation : annotations) {
      if (canonicalIds.contains(annotation.getId())) {
        redundantAnnotations.add(annotation);
      }
    }
    for (Annotation redundantAnno : redundantAnnotations) {
      annotations.remove(redundantAnno);
    }

    return annotations;
  }

  private boolean isJsonArray(String array) {
    return array.startsWith("[");
  }
}
