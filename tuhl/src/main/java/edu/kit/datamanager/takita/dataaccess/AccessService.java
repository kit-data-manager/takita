package edu.kit.datamanager.takita.dataaccess;

import java.io.IOException;
import java.text.ParseException;
import java.time.Instant;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.page.Page;

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
  private ManuscriptConverter manuscriptConverter;

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
    this.annotationConverter = new AnnotationConverter(annotationStoreAccessService, repositoryAccessService);
    this.manuscriptConverter = new ManuscriptConverter(repositoryAccessService, annotationStoreAccessService);
  }

  /**
   * Sets the searchIndexService.
   *
   * @param searchIndexService ISearchIndexService to set
   */
  public void setSearchIndexService(ISearchIndexService searchIndexService) {
    this.searchIndexService = searchIndexService;
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
      try {
        manuscripts.add(manuscriptConverter.buildManuscriptFromJson(manuscriptJson, sortedAnnotations));
      } catch (Exception e) {
        logger.info("Couldn't index manuscript " + manuscriptJson.getString("id"));
        logger.info(e.toString());
        
      }
        
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
  public List<Manuscript> getAllManuscriptsModifiedAfter(Instant timestamp)
      throws InterruptedException, JSONException, IOException, ParseException,
      NoSuchIndexEntryException {
    logger.info("Getting all manuscripts modified after {}.", timestamp);
    Set<Manuscript> manuscripts = new HashSet<>();
    List<Annotation> newAnnotations = new ArrayList<>();

    //get modified annotations
    for (JSONObject jsonAnnotation :
        annotationStoreAccessService.getAnnotationsModifiedAfter(timestamp)) {
      newAnnotations.add(annotationConverter.buildAnnotationFromJson(jsonAnnotation));
    }

    //get modified manuscripts
    List<JSONObject> modifiedManuscriptJSONs = repositoryAccessService.getManuscriptsModifiedAfter(timestamp);
    logger.info("Found {} modified manuscripts", modifiedManuscriptJSONs.size());
    for (JSONObject manuscriptJson : modifiedManuscriptJSONs) {
      Manuscript newManuscript = manuscriptConverter.buildManuscriptFromJson(manuscriptJson, null);
      //manuscriptMap.put(newManuscript.getId(), newManuscript);
      manuscripts.add(newManuscript);
    }

    //checks if old manuscript has new annotations and adds those
    Map<String, Page> pageMap = new HashMap<>();
    for (Annotation annotation : newAnnotations) {
      Page page;
      Manuscript manuscript = null; //careful what you do here, manuscript has to be properly initialized in all cases
      if(pageMap.containsKey(annotation.getPageId())) {
        //Use already updated page
        page = pageMap.get(annotation.getPageId());
      } else {
        //TODO: change to a more java and less pythonian way of coding if you like :)
        try {
          //get page from index and store it for further updates
          page = searchIndexService.getPageById(annotation.getPageId());
          manuscript = searchIndexService.getManuscriptById(page.getManuscriptId());
        } catch (NoSuchIndexEntryException e) {
          //annotation is on a page from a newly ingested manuscript
          logger.error("Page cannot be found in the current index. Is the manuscript indexed already?");
          //find the correct manuscript from the new manuscripts
          for(Manuscript mToCheck: manuscripts) {
            if(mToCheck.getPageMap().containsKey(annotation.getPageId())) {
              manuscript = mToCheck;
              break;
            }
          }
        } finally {
          if(manuscript == null) {
            logger.error("Found a modified annotation on page {} but there is no corresponding manuscript for this page. SKIPPING ANNOTATION FOR INDEXING", annotation.getPageId());
            continue;
          }
          page = manuscript.getPageMap().get(annotation.getPageId()); //get real page object from manuscript you want to change
          pageMap.put(annotation.getPageId(), page);
          manuscripts.add(manuscript);
        }
        int oldAnnoCount = page.getAnnotations().size();
        logger.debug("Number of annotations on page before {}", oldAnnoCount);
      }

      Optional<Annotation> existingAnno = page.getAnnotations().stream().filter(anno -> anno.getId().equals(annotation.getId())).findFirst();
      if (existingAnno.isPresent()) {
        logger.info("Annotation {} already exists. Replacing with new version", annotation.getId());
        page.getAnnotations().remove(existingAnno.get());
      }
      logger.info("Adding new annotation {} to page object {}", annotation.getId(), page.getId());
      page.addAnnotation(annotation);
      int newAnnoCount = page.getAnnotations().size();
      logger.debug("Number of annotations on page after {}", newAnnoCount);
    }

    if(!manuscripts.isEmpty()) {logger.info("Found {} new or newly annotated manuscripts", manuscripts.size());}
    return new ArrayList<>(manuscripts);
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
      reducedManuscripts.add(manuscriptConverter.buildManuscriptFromJson(manuscript, null));
    }

    return reducedManuscripts;
  }

  /**
   * Converts annotation to JSONObject so it can be added to database more easily,
   * then tells AnnotationStoreAccess to add it.
   *
   * @param annotation annotation to add to database as Annotation
   * @param pageNumber number of the page on which the annotation is
   * @param projectId id of the project the annotation is associated with, used as subfolder in annotation store
   * @return Annotation with added fields
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  @Override
  public Annotation addAnnotation(Annotation annotation, String pageNumber, String projectId)
      throws JSONException, IOException, InterruptedException {
      logger.info("Nach Konvertierung: " + annotationConverter.buildJsonFromAnnotation(annotation, pageNumber).toString());
    JSONObject response = annotationStoreAccessService
        .addAnnotation(annotationConverter.buildJsonFromAnnotation(annotation, pageNumber), projectId);
      logger.info("Nach Speicherung: " + response.toString());
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
  public Annotation validateAnnotation(Annotation annotation, String pageNumber, String projectId)
      throws JSONException, IOException, InterruptedException {
    JSONObject validatedAnnotation = annotationStoreAccessService
        .validateAnnotation(annotationConverter.buildJsonFromAnnotation(annotation, pageNumber), projectId);
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
    logger.info(updatedAnnotation.toString());
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
  
  /**
   * Gets the XML content given in the TEI standard of a page as the raw XML String.
   *
   * @param pageId the id of the manuscript
   * @param fileName identifies the file associated to a page
   * @return the raw xml as a String
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  @Override
  public String getRawPageContentXml(String pageId, String fileName) throws IOException, InterruptedException {
	    return repositoryAccessService.getXmlByPageId(pageId, fileName);
  }

  private Map<String, List<Annotation>> getAllAnnotationsSorted(
      List<JSONObject> jsonAnnotations) {
    Map<String, List<Annotation>> sortedAnnotations = new HashMap<>();

    for (JSONObject jsonAnnotation : jsonAnnotations) {
      Annotation annotation;
      try {
        annotation = annotationConverter.buildAnnotationFromJson(jsonAnnotation);
      } catch (JSONException e) {
        logger.error("JSON Error on Annotation conversion. Skipping Annotation");
        logger.error("Unparsable annotation: ", jsonAnnotation.optString(AnnotationStoreStrings.ID.getName()));
        logger.error(e.getMessage(), e);
        e.printStackTrace();
        continue;
      }

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
}