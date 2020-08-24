package edu.kit.scc.dem.tuhl.dataaccess;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.Manuscript;
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

  private static final String ALGORITHM_CREATOR_PREFIX = "urn:uuid";
  private static final String SOURCE_PATTERN_STRING = "/dataresources/(.*?)/data/";

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
                       IRepositoryAccessService repositoryAccessService) {
    this.annotationStoreAccessService = annotationStoreAccessService;
    this.repositoryAccessService = repositoryAccessService;
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
        page = buildPageFromJson(pageJson, pageNumber);
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
          //Checks for each date if it has the required type.
          if (dateJson.has(RepositoryStrings.TYPE.getName())) {
            //Parse the right date to a Date Object.
            if (dateJson.getString(RepositoryStrings.TYPE.getName()).equals(type)
                && dateJson.has(RepositoryStrings.VALUE.getName())) {
              String dateString = dateJson.getString((RepositoryStrings.VALUE.getName()));
              if (dateString.contains(".")) {
                date = IRepositoryAccessService.TIMESTAMP_FORMAT_MILLIS.parse(dateString);
              } else {
                date = IRepositoryAccessService.TIMESTAMP_FORMAT.parse(dateString);
              }
              break;
            }
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
   */
  private Page buildPageFromJson(
      JSONObject pageJson, String pageNumber, Map<String, List<Annotation>> sortedAnnotations)
      throws JSONException {
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
      imagePage.setAnnotations(sortedAnnotations.get(imagePage.getId()));
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
   * Builds the page with the accompanying annotations from separate sparql query.
   */
  private Page buildPageFromJson(JSONObject pageJson, String pageNumber)
      throws JSONException, IOException, InterruptedException {

    String id = pageJson.getString(RepositoryStrings.ID.getName());

    Date created = extractDateFromJsonManuscript(pageJson, RepositoryStrings.CREATED.getName());
    Date modified = extractDateFromJsonManuscript(pageJson, RepositoryStrings.MODIFIED.getName());

    //Create the Page object depending on the resource type.
    Page page;
    String resourceTypeString = pageJson.getJSONObject(RepositoryStrings.RESOURCE_TYPE.getName())
        .getString(RepositoryStrings.TYPE_GENERAL.getName());
    if (resourceTypeString.equals(RepositoryStrings.IMAGE.getName())) {
      // URL to image of page
      String resourceUrl = baseUrl + staticPath + id
          + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.MASTER_JPG;
      String thumbResourceUrl = baseUrl + staticPath + id + RepositoryAccessService.DATA_PATH
          + pageNumber + RepositoryAccessService.THUMB_JPG;
      ImagePage imagePage = new ImagePage(id, pageNumber, created, resourceUrl, thumbResourceUrl);
      imagePage.setAnnotations(getAnnotationsByPage(imagePage));
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
   */
  @Override
  public List<Manuscript> getAllManuscriptsModifiedAfter(Date timestamp)
      throws InterruptedException, JSONException, IOException, ParseException,
      NoSuchIndexEntryException {
    logger.info("Getting all manuscripts modified after {}.", timestamp.toString());
    List<Manuscript> manuscripts = new ArrayList<>();
    List<Annotation> newAnnotations = new ArrayList<>();
    for (JSONObject jsonAnnotation :
        annotationStoreAccessService.getAnnotationsModifiedAfter(timestamp)) {
      newAnnotations.add(buildAnnotationFromJson(jsonAnnotation));
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
    JSONObject response = annotationStoreAccessService.addAnnotation(buildJsonFromAnnotation(annotation, pageNumber));
    return buildAnnotationFromJson(response);
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
        .validateAnnotation(buildJsonFromAnnotation(annotation, pageNumber));
    return buildAnnotationFromJson(validatedAnnotation);
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
        buildJsonFromAnnotation(annotation, pageNumber), annotation.getEtag());
    return buildAnnotationFromJson(updatedAnnotation);
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
      Annotation annotation = buildAnnotationFromJson(jsonAnnotation);

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

  private Annotation buildAnnotationFromJson(JSONObject jsonAnnotation) throws JSONException {
    Annotation annotation = new Annotation();

    if (jsonAnnotation.has(AnnotationStoreStrings.ID.getName())) {
      annotation.setId(jsonAnnotation.getString(AnnotationStoreStrings.ID.getName()));
    }
    if (jsonAnnotation.has(AnnotationStoreStrings.CANONICAL.getName())) {
      annotation.setCanonical(jsonAnnotation.getString(AnnotationStoreStrings.CANONICAL.getName()));
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.ETAG.getName())) {
      annotation.setEtag(jsonAnnotation.getString(AnnotationStoreStrings.ETAG.getName()));
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.BODY.getName())) {
      if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.BODY.getName()))) {
        JSONArray bodies = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
        for (int i = 0; i < bodies.length(); i++) {
          if (bodies.getJSONObject(i).has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
            buildColor(bodies.getJSONObject(i).getString(
                AnnotationStoreStrings.DC_SUBJECT.getName()), annotation);
          }
        }
      } else {
        if (jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName())
            .has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
          buildColor(jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName()).getString(
              AnnotationStoreStrings.DC_SUBJECT.getName()), annotation);
        }
      }
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.CREATED.getName())) {
      annotation.setCreated(extractDateFromJsonAnnotation(jsonAnnotation,
          AnnotationStoreStrings.CREATED.getName()));
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.MODIFIED.getName())) {
      annotation.setModified(extractDateFromJsonAnnotation(jsonAnnotation,
          AnnotationStoreStrings.MODIFIED.getName()));
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.CREATOR.getName())) {
      List<String> creatorList = new ArrayList<>();

      if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName()))) {
        JSONArray creators = jsonAnnotation.getJSONArray(AnnotationStoreStrings.CREATOR.getName());

        for (int i = 0; i < creators.length(); i++) {
          if (creators.getJSONObject(i).getString(AnnotationStoreStrings.TYPE.getName()).equals(
              AnnotationStoreStrings.PERSON.getName())) {
            creatorList.add(creators.getJSONObject(i).getString(
                AnnotationStoreStrings.NAME.getName()));
          }
        }

      } else if (jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName())
          .startsWith(ALGORITHM_CREATOR_PREFIX)) {
        creatorList.add(jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName()));
        annotation.setIsAlgorithmAnnotation(true);
      } else {
        if (jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
            .getString(AnnotationStoreStrings.TYPE.getName()).equals(AnnotationStoreStrings.PERSON.getName())) {
          creatorList.add(jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
              .getString(AnnotationStoreStrings.NAME.getName()));
        }
      }
      annotation.setCreators(creatorList);
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.MOTIVATION.getName())) {
      annotation.setMotivation(jsonAnnotation.getString(
          AnnotationStoreStrings.MOTIVATION.getName()));
    }
    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName())
        && jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName())
            .has(AnnotationStoreStrings.SELECTOR.getName())) {
      
      annotation.setSvgCode(jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName())
          .getJSONObject(AnnotationStoreStrings.SELECTOR.getName()).getString(
              AnnotationStoreStrings.VALUE.getName()));
    }
    if (jsonAnnotation.has(AnnotationStoreStrings.VIA.getName())) {
      annotation.setVia(jsonAnnotation.getString(AnnotationStoreStrings.VIA.getName()));
    }
    if (jsonAnnotation.has(AnnotationStoreStrings.BODY.getName()) && annotation.getId() != null) {
      buildBodiesFromJson(jsonAnnotation, annotation);
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName()) && jsonAnnotation.getJSONObject(
        AnnotationStoreStrings.TARGET.getName()).has(AnnotationStoreStrings.SOURCE.getName())) {
      Pattern pattern = Pattern.compile(SOURCE_PATTERN_STRING);
      Matcher matcher = pattern.matcher(jsonAnnotation.getJSONObject(
          AnnotationStoreStrings.TARGET.getName())
          .getString(AnnotationStoreStrings.SOURCE.getName()));
      if (matcher.find()) {
        annotation.setPageId(matcher.group(1));
      }
    }

    return annotation;
  }

  private void buildBodiesFromJson(JSONObject jsonAnnotation, Annotation annotation)
      throws JSONException {
    JSONArray bodyJson = new JSONArray();
    if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.BODY.getName()))) {
      bodyJson = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
    } else {
      bodyJson.put(jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName()));
    }
    List<TextCard> textCards = new ArrayList<>();
    List<Tag> tags = new ArrayList<>();

    for (int i = 0; i < bodyJson.length(); i++) {
      JSONObject thisJson = bodyJson.getJSONObject(i);
      Body thisBody;
      if (thisJson.has(AnnotationStoreStrings.PURPOSE.getName()) && thisJson.getString(
          AnnotationStoreStrings.PURPOSE.getName()).equals(
              AnnotationStoreStrings.TAGGING.getName())) {
        thisBody = new Tag(UUID.randomUUID().toString());
        tags.add((Tag) thisBody);
      } else {
        thisBody = new TextCard(UUID.randomUUID().toString());
        if (thisJson.has(AnnotationStoreStrings.PURPOSE.getName())) {
          thisBody.setPurpose(thisJson.getString(AnnotationStoreStrings.PURPOSE.getName()));
        }
        textCards.add((TextCard) thisBody);
      }
      thisBody.setAnnotationId(annotation.getId());
      thisBody.setFullJson(thisJson);

      if (thisJson.has(AnnotationStoreStrings.CREATOR.getName())) {
        List<String> creatorsList = thisBody.getCreators();
        if (thisBody.getCreators() == null) {
          creatorsList = new ArrayList<>();
        }
        if (isJsonArray(thisJson.getString(AnnotationStoreStrings.CREATOR.getName()))) {
          JSONArray creators = thisJson.getJSONArray(AnnotationStoreStrings.CREATOR.getName());
          for (int j = 0; j < creators.length(); j++) {
            if (creators.getJSONObject(j).getString(AnnotationStoreStrings.TYPE.getName())
                .equals(AnnotationStoreStrings.PERSON.getName())) {
              creatorsList.add(creators.getJSONObject(j).getString(
                  AnnotationStoreStrings.NAME.getName()));
            }
          }
        } else if (thisJson.getString(AnnotationStoreStrings.CREATOR.getName()).startsWith(ALGORITHM_CREATOR_PREFIX)) {
          creatorsList.add(thisJson.getString(AnnotationStoreStrings.CREATOR.getName()));
        } else {
          if (thisJson.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
              .getString(AnnotationStoreStrings.TYPE.getName()).equals(AnnotationStoreStrings.PERSON.getName())) {
            creatorsList.add(thisJson.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
                .getString(AnnotationStoreStrings.NAME.getName()));
          }
        }
      }

      if (thisJson.has(AnnotationStoreStrings.CREATED.getName())) {
        thisBody.setCreated(extractDateFromJsonAnnotation(thisJson,
            AnnotationStoreStrings.CREATED.getName()));
      }
      if (thisJson.has(AnnotationStoreStrings.MODIFIED.getName())) {
        thisBody.setModified(extractDateFromJsonAnnotation(thisJson,
            AnnotationStoreStrings.MODIFIED.getName()));
      }
      if (thisJson.has(AnnotationStoreStrings.DC_TITLE.getName())) {
        thisBody.setTitle(thisJson.getString(AnnotationStoreStrings.DC_TITLE.getName()));
      }
      if (thisJson.has(AnnotationStoreStrings.VALUE.getName())) {
        thisBody.setValue(thisJson.getString(AnnotationStoreStrings.VALUE.getName()));
      }
    }
    annotation.setTags(tags);
    annotation.setTextCards(textCards);
  }

  private JSONObject buildJsonFromAnnotation(Annotation annotation, String pageNumber)
      throws JSONException, IOException, InterruptedException {
    JSONObject jsonAnnotation;
    if (annotation.getId() != null && !annotation.getId().trim().equals("")) {
       jsonAnnotation = annotationStoreAccessService.getAnnotationById(annotation.getId());
       jsonAnnotation.put(AnnotationStoreStrings.ID.getName(), annotation.getId());
    } else {
      jsonAnnotation = new JSONObject();
      jsonAnnotation.put(AnnotationStoreStrings.CONTEXT.getName(), AnnotationStoreStrings.URL_JSONID.getName());
      jsonAnnotation.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.ANNOTATION.getName());
    }

    if (jsonAnnotation.has(AnnotationStoreStrings.ETAG.getName())) {
      jsonAnnotation.remove(AnnotationStoreStrings.ETAG.getName());
    }

    if (annotation.getCreated() != null) {
      jsonAnnotation.put(AnnotationStoreStrings.CREATED.getName(),
          IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(annotation.getCreated()));
    }

    if (!annotation.getCreators().isEmpty()) {
      buildCreator(annotation, jsonAnnotation);
    }

    if (annotation.getModified() != null) {
      jsonAnnotation.put(AnnotationStoreStrings.MODIFIED.getName(),
          IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(annotation.getModified()));
    }
    if (annotation.getCanonical() != null && !annotation.getCanonical().equals("")) {
      jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), annotation.getCanonical());
    }

    if (annotation.getTextCards() != null && annotation.getTags() != null) {
      if (annotation.getTextCards().size() + annotation.getTags().size() == 1 && annotation.getColor() == null) {
        jsonAnnotation.put(AnnotationStoreStrings.BODY.getName(), buildJsonFromBody(annotation));
      } else {
        jsonAnnotation.put(AnnotationStoreStrings.BODY.getName(), buildJsonFromBodies(annotation));

        if (annotation.getColor() != null) {
          JSONArray bodyArray = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
          boolean hasColor = false;
          for (int i = 0; i < bodyArray.length(); i++) {
            if (bodyArray.getJSONObject(i).has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
              bodyArray.getJSONObject(i).put(AnnotationStoreStrings.DC_SUBJECT.getName(), putColor(annotation.getColor()));
              buildCreator(annotation, bodyArray.getJSONObject(i));
              hasColor = true;
            }
          }
          if (!hasColor) {
            JSONObject colorBody = new JSONObject();
            colorBody.put(AnnotationStoreStrings.DC_SUBJECT.getName(), putColor(annotation.getColor()));
            buildCreator(annotation, colorBody);
            jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName()).put(colorBody);
          }
        }
      }
    }

    JSONObject target = new JSONObject();
    JSONObject selector = new JSONObject();
    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName())) {
       target = jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName());
       if (target.has(AnnotationStoreStrings.SELECTOR.getName())) {
         selector = target.getJSONObject(AnnotationStoreStrings.SELECTOR.getName());
       }
    }

    // in form <svg><code></svg>
    if (annotation.getSvgCode() != null && !annotation.getSvgCode().trim().equals("")) {
      selector.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.SVG_SELECTOR.getName());
      selector.put(AnnotationStoreStrings.VALUE.getName(), annotation.getSvgCode());
      target.put(AnnotationStoreStrings.SELECTOR.getName(), selector);
    }

    // source is url of page image
    if (annotation.getPageId() != null && !annotation.getPageId().trim().equals("")) {
      target.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.SPECIFIC_RESOURCE.getName());
      target.put(AnnotationStoreStrings.SOURCE.getName(), baseUrl + staticPath
          + annotation.getPageId() + RepositoryAccessService.DATA_PATH + pageNumber
          + RepositoryAccessService.MASTER_JPG);
    }
    jsonAnnotation.put(AnnotationStoreStrings.TARGET.getName(), target);

    if (annotation.getMotivation() != null&& !annotation.getMotivation().trim().equals("")) {
      jsonAnnotation.put(AnnotationStoreStrings.MOTIVATION.getName(), annotation.getMotivation());
    }

    if (annotation.getVia() != null && !annotation.getVia().equals("")) {
      jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), annotation.getVia());
    }

    return jsonAnnotation;
  }

  private JSONObject buildJsonFromBody(Annotation annotation)
      throws JSONException {
    Body thisBody;
    JSONObject jsonBody;
    if (annotation.getTextCards().size() == 1) {
      jsonBody = annotation.getTextCards().get(0).getFullJson();
      thisBody = annotation.getTextCards().get(0);
      if (!thisBody.getCreators().isEmpty()) {
        buildCreatorsFromBodies(jsonBody, (TextCard) thisBody, null);
      }
    } else {
      jsonBody = annotation.getTags().get(0).getFullJson();
      thisBody = annotation.getTags().get(0);
      if (!thisBody.getCreators().isEmpty()) {
        buildCreatorsFromBodies(jsonBody, null, (Tag) thisBody);
      }
    }

    if (thisBody.getCreated() != null) {
      jsonBody.put(AnnotationStoreStrings.CREATED.getName(),
          IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(thisBody.getCreated()));
    }
    if (thisBody.getModified() != null) {
      jsonBody.put(AnnotationStoreStrings.MODIFIED.getName(),
          IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(thisBody.getCreated()));
    }
    if (thisBody.getPurpose() != null) {
      jsonBody.put(AnnotationStoreStrings.PURPOSE.getName(), thisBody.getPurpose());
    }
    if (thisBody.getValue() != null) {
      jsonBody.put(AnnotationStoreStrings.VALUE.getName(), thisBody.getValue());
    }
    if (thisBody.getTitle() != null) {
      jsonBody.put(AnnotationStoreStrings.DC_TITLE.getName(), thisBody.getTitle());
    }
    return jsonBody;
  }

  private JSONArray buildJsonFromBodies(Annotation annotation)
      throws JSONException {
    JSONArray jsonBodies = new JSONArray();

    if (annotation.getTextCards().size() >= 1) {
      for (TextCard textCard : annotation.getTextCards()) {
        JSONObject jsonTextCard = textCard.getFullJson();

        if (textCard.getTitle() != null) {
          jsonTextCard.put(AnnotationStoreStrings.DC_TITLE.getName(), textCard.getTitle());
        }

        if (!textCard.getCreators().isEmpty()) {
          buildCreatorsFromBodies(jsonTextCard, textCard, null);
        }

        if (textCard.getValue() != null) {
          jsonTextCard.put(AnnotationStoreStrings.VALUE.getName(), textCard.getValue());
        }
        if (textCard.getCreated() != null) {
          jsonTextCard.put(AnnotationStoreStrings.CREATED.getName(),
              IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(textCard.getCreated()));
        }
        if (textCard.getModified() != null) {
          jsonTextCard.put(AnnotationStoreStrings.MODIFIED.getName(),
              IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(textCard.getModified()));
        }
        if (textCard.getPurpose() != null) {
          jsonTextCard.put(AnnotationStoreStrings.PURPOSE.getName(), textCard.getPurpose());
        }

        jsonBodies.put(jsonTextCard);
      }
    }
    if (annotation.getTags().size() >= 1) {
      for (Tag tag : annotation.getTags()) {
        JSONObject jsonTag = tag.getFullJson();

        if (tag.getTitle() != null) {
          jsonTag.put(AnnotationStoreStrings.DC_TITLE.getName(), tag.getTitle());
        }

        if (tag.getCreators().isEmpty()) {
          buildCreatorsFromBodies(jsonTag, null, tag);
        }

        if (tag.getValue() != null) {
          jsonTag.put(AnnotationStoreStrings.VALUE.getName(), tag.getValue());
        }
        if (tag.getCreated() != null) {
          jsonTag.put(AnnotationStoreStrings.CREATED.getName(),
              IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(tag.getCreated()));
        }
        if (tag.getModified() != null) {
          jsonTag.put(AnnotationStoreStrings.MODIFIED.getName(),
              IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.format(tag.getCreated()));
        }
        if (tag.getPurpose() != null) {
          jsonTag.put(AnnotationStoreStrings.PURPOSE.getName(), tag.getPurpose());
        }
        jsonBodies.put(jsonTag);
      }
    }
    return jsonBodies;
  }

  private void buildCreator(Annotation annotation, JSONObject jsonAnnotation) throws JSONException {
    if (jsonAnnotation.has(AnnotationStoreStrings.CREATOR.getName())) {
      boolean containsCreator = false;
      if (!annotation.getIsAlgorithmAnnotation() && isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName()))) {
        JSONArray creators = jsonAnnotation.getJSONArray(AnnotationStoreStrings.CREATOR.getName());
        for (int i = 0; i < creators.length(); i++) {
          for (String newCreator : annotation.getCreators()) {
            if (creators.getJSONObject(i).getString(AnnotationStoreStrings.NAME.getName())
                .equals(newCreator)) {
              containsCreator = true;
            }
          }
        }
        if (!containsCreator) {
          for (String creator : annotation.getCreators()) {
            JSONObject person = new JSONObject();
            person.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.PERSON.getName());
            person.put(AnnotationStoreStrings.NAME.getName(), creator);
            creators.put(person);
          }
          jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(), creators);
        }

      } else {
        JSONObject oldCreator = jsonAnnotation.getJSONObject(
            AnnotationStoreStrings.CREATOR.getName());
        JSONArray newCreators = new JSONArray();
        newCreators.put(oldCreator);
        for (String newCreator : annotation.getCreators()) {
          if (!oldCreator.getString(AnnotationStoreStrings.NAME.getName()).equals(newCreator)) {
            JSONObject person = new JSONObject();
            person.put(AnnotationStoreStrings.TYPE.getName(),
                AnnotationStoreStrings.PERSON.getName());
            person.put(AnnotationStoreStrings.NAME.getName(), newCreator);
            newCreators.put(person);
          }
        }
        jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(), newCreators);
      }
    } else {
      if (annotation.getCreators().size() > 1) {
        JSONArray creators = new JSONArray();
        for (String thisCreator : annotation.getCreators()) {
          JSONObject newCreator = new JSONObject();
          newCreator.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.PERSON.getName());
          newCreator.put(AnnotationStoreStrings.NAME.getName(), thisCreator);
          creators.put(newCreator);
        }
        jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(), creators);
      } else {
        JSONObject newCreator = new JSONObject();
        newCreator.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.PERSON.getName());
        newCreator.put(AnnotationStoreStrings.NAME.getName(), annotation.getCreators().get(0));
        jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(), newCreator);
      }
    }
  }

  private void buildCreatorsFromBodies(JSONObject jsonObject, TextCard textCard, Tag tag)
      throws JSONException {
    Body modelObject;
    if (textCard != null) {
      modelObject = textCard;
    } else {
      modelObject = tag;
    }

    if (isJsonArray(jsonObject.getString(AnnotationStoreStrings.CREATOR.getName()))) {
      JSONArray creators = jsonObject.getJSONArray(AnnotationStoreStrings.CREATOR.getName());
      boolean containsCreator = false;
      for (int i = 0; i < creators.length(); i++) {
        for (String newCreator : modelObject.getCreators()) {
          if (creators.getJSONObject(i).getString(AnnotationStoreStrings.NAME.getName())
              .equals(newCreator)) {
            containsCreator = true;
          }
        }
      }
      if (!containsCreator) {
        for (String newCreator : modelObject.getCreators()) {
          JSONObject person = new JSONObject();
          person.put(AnnotationStoreStrings.TYPE.getName(),
              AnnotationStoreStrings.PERSON.getName());
          person.put(AnnotationStoreStrings.NAME.getName(), newCreator);
          creators.put(person);
        }
      }
    } else {
      JSONObject creator = jsonObject.getJSONObject(AnnotationStoreStrings.CREATOR.getName());
      JSONArray newCreators = new JSONArray();
      for (String newCreator : modelObject.getCreators()) {
        if (!creator.getString(AnnotationStoreStrings.NAME.getName()).equals(newCreator)) {
          JSONObject person = new JSONObject();
          person.put(AnnotationStoreStrings.TYPE.getName(),
              AnnotationStoreStrings.PERSON.getName());
          person.put(AnnotationStoreStrings.NAME.getName(), newCreator);
          newCreators.put(person);
        }
      }
      jsonObject.put(AnnotationStoreStrings.CREATOR.getName(), newCreators);
    }
  }

  private List<Annotation> getAnnotationsByPage(Page page)
      throws InterruptedException, JSONException, IOException {
    List<JSONObject> jsonAnnotations =
        annotationStoreAccessService.getAnnotationsByPageId(page.getId(), page.getPageNumber());
    List<Annotation> annotations = new ArrayList<>();

    for (JSONObject annotation : jsonAnnotations) {
      annotations.add(buildAnnotationFromJson(annotation));
    }

    // removes de interpretatione annos to which there is a corresponding validated anno
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

  private void buildColor(String color, Annotation annotation) {
    if (Color.TEXT_REGION.getName().equals(color)) {
      annotation.setColor(Color.TEXT_REGION);
    } else if (Color.IMAGE_REGION.getName().equals(color)) {
      annotation.setColor(Color.IMAGE_REGION);
    } else if (Color.PAGE_REGION.getName().equals(color)) {
      annotation.setColor(Color.PAGE_REGION);
    } else if (Color.LINE_DRAWING_REGION.getName().equals(color)) {
      annotation.setColor(Color.LINE_DRAWING_REGION);
    } else if (Color.GRAPHIC_REGION.getName().equals(color)) {
      annotation.setColor(Color.GRAPHIC_REGION);
    } else if (Color.TABLE_REGION.getName().equals(color)) {
      annotation.setColor(Color.TABLE_REGION);
    } else if (Color.CHART_REGION.getName().equals(color)) {
      annotation.setColor(Color.CHART_REGION);
    } else if (Color.SEPARATOR_REGION.getName().equals(color)) {
      annotation.setColor(Color.SEPARATOR_REGION);
    } else if (Color.MATHS_REGION.getName().equals(color)) {
      annotation.setColor(Color.MATHS_REGION);
    } else if (Color.CHEM_REGION.getName().equals(color)) {
      annotation.setColor(Color.CHEM_REGION);
    } else if (Color.MUSIC_REGION.getName().equals(color)) {
      annotation.setColor(Color.MUSIC_REGION);
    } else if (Color.ADVERT_REGION.getName().equals(color)) {
      annotation.setColor(Color.ADVERT_REGION);
    } else if (Color.NOISE_REGION.getName().equals(color)) {
      annotation.setColor(Color.NOISE_REGION);
    } else if (Color.UNKNOWN_REGION.getName().equals(color)) {
      annotation.setColor(Color.UNKNOWN_REGION);
    } else if (Color.CUSTOM_REGION.getName().equals(color)) {
      annotation.setColor(Color.CUSTOM_REGION);
    } else {
      annotation.setColor(Color.DEFAULT);
    }
  }

  private String putColor(Color color) {
    switch (color) {
      case TEXT_REGION:
        return Color.TEXT_REGION.getName();
      case IMAGE_REGION:
        return Color.IMAGE_REGION.getName();
      case PAGE_REGION:
        return Color.PAGE_REGION.getName();
      case LINE_DRAWING_REGION:
        return Color.LINE_DRAWING_REGION.getName();
      case GRAPHIC_REGION:
        return Color.GRAPHIC_REGION.getName();
      case TABLE_REGION:
        return Color.TABLE_REGION.getName();
      case CHART_REGION:
        return Color.CHART_REGION.getName();
      case SEPARATOR_REGION:
        return Color.SEPARATOR_REGION.getName();
      case MATHS_REGION:
        return Color.MATHS_REGION.getName();
      case CHEM_REGION:
        return Color.CHEM_REGION.getName();
      case MUSIC_REGION:
        return Color.MUSIC_REGION.getName();
      case ADVERT_REGION:
        return Color.ADVERT_REGION.getName();
      case NOISE_REGION:
        return Color.NOISE_REGION.getName();
      case UNKNOWN_REGION:
        return Color.UNKNOWN_REGION.getName();
      case CUSTOM_REGION:
        return Color.CUSTOM_REGION.getName();
      default:
        return Color.DEFAULT.getName();
    }
  }

  private Date extractDateFromJsonAnnotation(JSONObject json, String type) {
    Date date = null;
    try {
      //Extracts the dates from the JSON
      String dateString;
      if (json.has(type)) {
        dateString = json.getString(type);
        //Parse the right date to a Date Object.
        if (dateString.contains(".")) {
          date = IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS.parse(dateString);
        } else {
          date = IAnnotationStoreAccessService.TIMESTAMP_FORMAT.parse(dateString);
        }
      }
    } catch (ParseException | JSONException e) {
      e.printStackTrace();
    }
    return date;
  }

  private boolean isJsonArray(String array) {
    return array.startsWith("[");
  }
}
