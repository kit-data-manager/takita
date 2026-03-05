package edu.kit.datamanager.takita.mainpage.search;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.dataaccess.IAccessService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Body;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;
import edu.kit.datamanager.takita.model.page.TextPage;
import java.io.IOException;
import java.net.ConnectException;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;


/**
 * Class containing business logic for handling the search index.
 */
@Service
public class  SearchIndexService implements ISearchIndexService {

  @Value("${annotationStore.defaultContainer:takitadefault}")
  private String defaultContainer;

  private static final Logger logger = LoggerFactory.getLogger(SearchIndexService.class);
  public static final String INDEX_NAME = "search_index";
  private final IAccessService accessService;
  private final ManuscriptRepository manuscriptRepository;
  private final ElasticsearchOperations elasticsearchOperations;
  
  private Instant lastUpdatedIndex;
  
  
  /**
   * Constructor for the SearchIndexService to autowire required instances.
   *
   * @param accessService instance of the business logic for database access. Injected with
   *                      Springs dependency injection system indicated by @autowired annotation.
   * @param manuscriptRepository instance of the manuscript repository. Injected with Springs
   *                             dependency injection system indicated by @autowired annotation.
   * @param elasticsearchOperations instance of the elasticsearch operations. Injected with
   *                                  Springs dependency injection system indicated by @autowired
   *                                  annotation.
   */
  @Autowired
  public SearchIndexService(IAccessService accessService,
                            ManuscriptRepository manuscriptRepository,
                            ElasticsearchOperations elasticsearchOperations) {
    this.accessService = accessService;
    this.manuscriptRepository = manuscriptRepository;
    this.elasticsearchOperations = elasticsearchOperations;
    lastUpdatedIndex = Instant.EPOCH;
    accessService.setSearchIndexService(this);
  }
  
  /**
   * Builds a new search index from scratch.
   *
   * @param indexSize number of manuscripts for index build, -1 for all
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException if an error occurs while parsing the JSON
   */
  @Override
  public void buildIndex(int indexSize) throws InterruptedException, IOException, JSONException {
    IndexOperations indexOp = elasticsearchOperations.indexOps(Manuscript.class);

    logger.info("Index rebuild started. Deleting old index.");
    if (indexSize > 0) {
      logger.info("Index will be limited to " + indexSize + " manuscripts.");
    }
    final Instant startBuild = Instant.now();
    lastUpdatedIndex = Instant.now();
    deleteIndex(indexOp);

    Document settings = Document.create();
    settings.put("index.mapping.nested_objects.limit", 1000000);

    logger.info("Building new index. This may take a while.");
    indexOp.create(settings);
    logger.info("Index created.");
    
    createMappings(indexOp);
    logger.info("Mappings created.");

    List<Manuscript> allManuscripts;
    try {
      allManuscripts = accessService.getManuscripts(indexSize);

      for (Manuscript m : allManuscripts) {
        logger.info("Finished. Indexing manuscript {}", m.getId());
        manuscriptRepository.save(m);
      }

      indexOp.refresh();

      Duration duration = Duration.between(startBuild, Instant.now());
      logger.info("Finished index build in {} minutes and {} seconds",
              duration.toMinutes(),
              duration.getSeconds() % 60);

    } catch (ConnectException ce) {
      logger.error("Aborting index build due to connection error.");
      Duration duration = Duration.between(startBuild, Instant.now());
      logger.error("Failed index build in {} minutes and {} seconds",
              duration.toMinutes(),
              duration.getSeconds() % 60);
    }
  }
  
  private void deleteIndex(IndexOperations indexOp) {
    if (indexOp.exists()) {
      boolean successful = indexOp.delete();

      if (successful) {
        logger.info("Index successfully deleted.");  
      } else {
        logger.info("Index could not be deleted.");
      };
    } else {
      logger.info("Index does not exist. Proceeding.");
    }
  }
  
  /**
   * Looks or inconsistency based on creation / modified timestamps and updates the search index.
   *
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException if an error occurs while parsing the JSON
   */
  @Override
  public void updateIndex() throws InterruptedException, JSONException, IOException {
    IndexOperations indexOp = elasticsearchOperations.indexOps(Manuscript.class);

    if (!indexOp.exists()) {
      logger.info("Index does not exist yet. Starting build.");
      buildIndex(-1);
    } else {
      logger.info("Index update started. This may take a while.");
      Instant timestamp = lastUpdatedIndex;
      
      //after a restart or rebuild the application might have no information about the last update.
      //In this case try to use index creation date instead.
      //TODO: find a better solution, i.e. checking the most recent updates in the index somehow
      if(timestamp.equals(Instant.EPOCH)) {
        logger.warn("No date for last index build found");
        Instant creationDate = indexCreationDate();
        
        if(creationDate != null && creationDate.isAfter(Instant.EPOCH)) {
          timestamp = creationDate;
        }
      }

      lastUpdatedIndex = Instant.now();
      final Instant startUpdate = Instant.now();
      
      List<Manuscript> newManuscripts;
      
      try {
        newManuscripts = accessService.getAllManuscriptsModifiedAfter(timestamp);
      } catch (ParseException e) {
        throw new IllegalArgumentException("The timestamp format is not correct");
      } catch ( NoSuchIndexEntryException e) {
        throw new IllegalArgumentException("Failure to retrieve all necessary index entries ");
      }
      logger.info("Indexing new or modified Manuscripts.");
      for (Manuscript manuscript : newManuscripts) {

        try {
          Manuscript oldManuscript = getManuscriptById(manuscript.getId());
          logger.info("Updating manuscript {}", manuscript.getId());
        } catch (NoSuchIndexEntryException e) {
          logger.info("Inserting new manuscript {}", manuscript.getId());
        }

        manuscriptRepository.deleteById(manuscript.getId());
        
        Manuscript savedManuscript = manuscriptRepository.save(manuscript);

      }
      Duration duration = Duration.between(startUpdate, Instant.now());
      logger.info("Finished index update in {} minutes and {} seconds", duration.toMinutes(),
          duration.getSeconds() % 60);
    }
  }
  
  public Instant indexCreationDate() {
    IndexOperations indexOp = elasticsearchOperations.indexOps(Manuscript.class);

    try {
      logger.info("Getting index creation date");
      //return elasticsearchOperations.execute(client -> 
      //  Date.from(Instant.ofEpochMilli(Long.parseLong(client.indices().get(indexReq, RequestOptions.DEFAULT).getSetting(INDEX_NAME, "index.creation_date"))))    
      //); 
      return Instant.ofEpochMilli(indexOp.getSettings().getLong("index.creation_date"));     
    } catch (NullPointerException e) {
      logger.error("Search index creation date could not be parsed");
      return null;
    }

}
  
  private void createMappings(IndexOperations indexOp) {
    indexOp.putMapping(indexOp.createMapping(Manuscript.class));
    indexOp.putMapping(indexOp.createMapping(ImagePage.class));
    indexOp.putMapping(indexOp.createMapping(TextPage.class));
    indexOp.putMapping(indexOp.createMapping(Annotation.class));
    indexOp.putMapping(indexOp.createMapping(Tag.class));
    indexOp.putMapping(indexOp.createMapping(TextCard.class));
  }
  
  //CRUD Annotation

  /**
   * Adds an annotation to the search index.
   *
   * @param annotation new annotation
   * @return added annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Annotation addAnnotation(Annotation annotation) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {

    Page page;
    try {
      page = getPageById(annotation.getPageId());
    } catch (NoSuchIndexEntryException e) { //log reason and rethrow
      logger.error("Page " + annotation.getPageId() + " not found in index");
      throw e;
    }

    String manuscriptPublisher;
    try {
      manuscriptPublisher = getManuscriptById(page.getManuscriptId()).getPublisher();
    } catch (NoSuchIndexEntryException e) { //log reason and rethrow
      logger.error("Manuscript " + page.getManuscriptId() + " not found in index");
      throw e;
    }
        
    // bad string magic, take everything after the last occurence of "-", 
    // omit the space and convert it to lower case to use this as a subfolder 
    // in the annotion store
    String projectId = manuscriptPublisher.substring(manuscriptPublisher.lastIndexOf("-") + 2).toLowerCase() + "/";
    Annotation newAnnotation;
    
    // if a parsing error occurs then store the annotation to a default subfolder
    if (projectId != null && !projectId.equals(manuscriptPublisher)) {
        newAnnotation = accessService.addAnnotation(annotation, page.getPageNumber(), projectId);
    } else {
        newAnnotation = accessService.addAnnotation(annotation, page.getPageNumber(), defaultContainer);
        logger.info("ProjectId could not be parsed from " + manuscriptPublisher + ", result: " + projectId);
    }
    
    Optional<Manuscript> manuscriptHit = manuscriptRepository.findById(page.getManuscriptId());
    
    if (manuscriptHit.isPresent()) {
      Page updatedPage = getPageById(annotation.getPageId(), manuscriptHit.get());
      updatedPage.getAnnotations().add(newAnnotation);
      manuscriptRepository.save(manuscriptHit.get());
      
    }
    
    return newAnnotation;
  }

  /**
   * Gets an annotation by its unique annotation identifier from the search index.
   *
   * @param id annotation identifier as String
   * @return Annotation
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Annotation getAnnotationById(String id) throws NoSuchIndexEntryException {
    Query query = new CriteriaQuery(new Criteria("pages.annotations.id").is(id));
    
    SearchHits<Manuscript> searchHits = elasticsearchOperations.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    if (searchHits.isEmpty()) {
      throw new NoSuchIndexEntryException("Could not find Annotation with id: " + id);
    }
    
    for (Page page : searchHits.getSearchHit(0).getContent().getPages()) {
      for (Annotation annotation : page.getAnnotations()) {
        if (annotation.getId().equals(id)) {
          return annotation;
        }
      }
    }
    throw new NoSuchIndexEntryException("Could not find Annotation with id: " + id);
  }
  
  @Override
  public List<Annotation> getAnnotationsForPageById(String id) throws NoSuchIndexEntryException {
    Query query = new CriteriaQuery(new Criteria("pages.id").is(id));
    
    SearchHits<Manuscript> searchHits = elasticsearchOperations.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    if (searchHits.isEmpty()) {
      throw new NoSuchIndexEntryException("Could not find page with id: " + id);
    }
    
    for (Page page : searchHits.getSearchHit(0).getContent().getPages()) {
        if (page.getId().equals(id)) {
            return page.getAnnotations();
        }
    }
    throw new NoSuchIndexEntryException("Could not find Annotation with id: " + id);
  }

  /**
   * Updates an annotation in the search index and the annotation store
   *
   * @param annotation updated Annotation
   * @return updated annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Annotation updateAnnotation(Annotation annotation)
      throws IOException, InterruptedException, JSONException, NoSuchIndexEntryException {
    // update annotation in data access, data access adds some information
    // to annotation only data access needs
    Page page = getPageById(annotation.getPageId());
    Annotation newAnnotation = accessService.updateAnnotation(annotation, page.getPageNumber());
    logger.info("SISupdateAnno1: " + annotation.toString());
    logger.info("SISupdateAnno2: " + newAnnotation.toString());
    
    applyChangedAnnotation(page, annotation, newAnnotation);
    
    return newAnnotation;
  }

  /**
   * Validates an annotation in the search index and notifies the dataaccess package.
   *
   * @param annotation unvalidated annotation
   * @return validated annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Annotation validateAnnotation(Annotation annotation)
      throws IOException, InterruptedException, JSONException, NoSuchIndexEntryException {

    // TODO: same code lines for addAnnotation and validateAnnotation, create new method for that
    Page page = getPageById(annotation.getPageId());
    String manuscriptPublisher = getManuscriptById(page.getManuscriptId()).getPublisher();
        
    // bad string magic, take everything after the last occurence of "-", 
    // omit the space and convert it to lower case to use this as a subfolder 
    // in the annotion store
    String projectId = manuscriptPublisher.substring(manuscriptPublisher.lastIndexOf("-") + 2).toLowerCase() + "/";
    Annotation validatedAnnotation;
    
    // if a parsing error occurs then store the annotation to a default subfolder
    if (projectId != null && !projectId.equals(manuscriptPublisher)) {
        validatedAnnotation = accessService.validateAnnotation(annotation, page.getPageNumber(), projectId);
    } else {
        validatedAnnotation = accessService.validateAnnotation(annotation, page.getPageNumber(), defaultContainer);
        logger.info("ProjectId could not be parsed from " + manuscriptPublisher + ", result: " + projectId);
    }
    
    applyChangedAnnotation(page, annotation, validatedAnnotation);
    
    return validatedAnnotation;
  }
  
  private void applyChangedAnnotation(Page page, Annotation annotation,
                                      Annotation changedAnnotation)
      throws NoSuchIndexEntryException, JSONException {
    Optional<Manuscript> manuscriptHit = manuscriptRepository.findById(page.getManuscriptId());
  
    logger.info("apply1: " + changedAnnotation.toString());
    if (manuscriptHit.isPresent()) {
      Page updatedPage = getPageById(annotation.getPageId(), manuscriptHit.get());
      Annotation annoToRemove = new Annotation();
      for (Annotation anno : updatedPage.getAnnotations()) {
        if (anno.getId() == null || anno.getId().equals(annotation.getId())) {
          annoToRemove = anno;
        }
      }
      updatedPage.getAnnotations().remove(annoToRemove);
      updatedPage.getAnnotations().add(changedAnnotation);
      logger.info("apply2: " + changedAnnotation.toString());
    
      manuscriptRepository.save(manuscriptHit.get());
      logger.info("apply3: " + changedAnnotation.toString());
    }
  }

  /**
   * Deletes an annotation by its unique annotation identifier from the search index.
   *
   * @param id annotation identifier as String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public void deleteAnnotationById(String id) throws IOException, InterruptedException,
      JSONException, NoSuchIndexEntryException {
    Annotation annotation = getAnnotationById(id);
    
    //Delete Annotation in the annotation store
    accessService.deleteAnnotation(annotation);
    
    //Update corresponding manuscript in the index
    Page page = getPageById(annotation.getPageId());
    Optional<Manuscript> manuscriptHit = manuscriptRepository.findById(page.getManuscriptId());
    if (manuscriptHit.isPresent()) {
      Page updatedPage = getPageById(annotation.getPageId(), manuscriptHit.get());
      Annotation annoToRemove = new Annotation();
      for (Annotation anno : updatedPage.getAnnotations()) {
        if (anno.getId() == null || anno.getId().equals(id)) {
          annoToRemove = anno;
        }
      }
      updatedPage.getAnnotations().remove(annoToRemove);
      manuscriptRepository.save(manuscriptHit.get());
    }
  }
  
  //CRUD TextCard

  /**
   * Adds a body to an annotation in the search index.
   *
   * @param body new Body
   * @return added Body with new ID
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Body addBody(Body body) throws IOException, InterruptedException, JSONException,
      NoSuchIndexEntryException {
    Annotation updatedAnnotation = getAnnotationById(body.getAnnotationId());
    logger.info("OriginalAnno: " + updatedAnnotation);
    logger.info(body.toString());
    logger.info("1: " + body.getId());
    if (body.getPurpose() != null && body.getPurpose().equalsIgnoreCase("tagging")) {
      updatedAnnotation.addTag((Tag) body);
    } else {
      updatedAnnotation.addTextCard((TextCard) body);
    }
    logger.info("2: " + updatedAnnotation.toString());
    updatedAnnotation = updateAnnotation(updatedAnnotation);
    logger.info("3: " + updatedAnnotation.toString());
    
    //return getBodyFromAnnotationAndId(updatedAnnotation, body.getId());
    return findBodyInAnnotation(body, updatedAnnotation);
  }
  
  /**
   * Gets a text card from the search index by its unique identifier.
   *
   * @param id text card identifier as String
   * @return TextCard
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public TextCard getTextCardById(String id) throws NoSuchIndexEntryException {
    Query query = new CriteriaQuery(new Criteria("pages.annotations.textCards.id").is(id));
    
    SearchHits<Manuscript> manuscriptForPage = elasticsearchOperations.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    
    Manuscript manuscript;
    if (manuscriptForPage.hasSearchHits()) {
      manuscript = manuscriptForPage.getSearchHit(0).getContent();
    } else {
      throw new NoSuchIndexEntryException("No such text card.");
    }
    
    return findTextCardInManuscriptById(manuscript, id);
  }
  
  private TextCard findTextCardInManuscriptById(Manuscript manuscript, String id)
      throws NoSuchIndexEntryException {
    for (Page page : manuscript.getPages()) {
      // the reasoning for this if-clause remains unclear (29.03.2023)
      // TODO: investigate, if this if-clause is necessary
      if (page.getResourceType() == ResourceType.IMAGE || page.getResourceType() == ResourceType.TEXT) {
        for (Annotation annotation : page.getAnnotations()) {
          for (TextCard card : annotation.getTextCards()) {
            if (card.getId().equals(id)) {
              return card;
            }
          }
        }
      }
    }
    throw new NoSuchIndexEntryException("There was no matching text card in the found manuscript");
  }

  /**
   * Gets the tag of an annotation by its ID.
   *
   * @param id id of a tag
   * @return corresponding tag
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Tag getTagById(String id) throws NoSuchIndexEntryException {
    Query query = new CriteriaQuery(new Criteria("pages.annotations.tags.id").is(id));
    
    SearchHits<Manuscript> manuscriptForPage = elasticsearchOperations.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    
    Manuscript manuscript;
    if (manuscriptForPage.hasSearchHits()) {
      manuscript = manuscriptForPage.getSearchHit(0).getContent();
    } else {
      throw new NoSuchIndexEntryException("No such tag.");
    }
    
    for (Page page : manuscript.getPages()) {
      for (Annotation annotation : page.getAnnotations()) {
        for (Tag tag : annotation.getTags()) {
          if (tag.getId().equals(id)) {
            return tag;
          }
        }
      }
    }
    throw new NoSuchIndexEntryException("There was no matching tag in the found manuscript");
  }
  
  /**
   * Updates a body in the search index.
   *
   * @param body updated Body
   * @return updated body with new ID
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Body updateBody(Body body) throws IOException, InterruptedException, JSONException,
      NoSuchIndexEntryException {
    Annotation annotation = getAnnotationByBodyId(body.getId());
    logger.info(annotation.getEtag());
    logger.info(annotation.getId());
    Body oldBody = getBodyFromAnnotationAndId(annotation, body.getId());
    logger.info("Lösche Body " + oldBody.getFullJson().toString());
    if (body.getPurpose().equalsIgnoreCase("tagging")) {
      //annotation.addTag((Tag) body);
      //annotation.getTags().remove(oldBody);
      annotation.updateTag((Tag) body);
    } else {
      //annotation.addTextCard((TextCard) body);
      //annotation.getTextCards().remove(oldBody);
      annotation.updateTextCard((TextCard) body);
    }
    
    Annotation updatedAnnotation = updateAnnotation(annotation);
    logger.info("JSON " + getBodyFromAnnotationAndId(annotation, body.getId()).getFullJson().toString());
    
    //return getBodyFromAnnotationAndId(annotation, body.getId());
    return findBodyInAnnotation(body, updatedAnnotation);
  }

  /**
   * Deletes a body entity from the search index by its unique identifier.
   *
   * @param id body identifier as String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public void deleteBodyById(String id) throws IOException, InterruptedException,
      JSONException, NoSuchIndexEntryException {
    Annotation updatedAnnotation = getAnnotationByBodyId(id);
    logger.info("Lösche Body aus " + updatedAnnotation.getId());
    Body body = getBodyFromAnnotationAndId(updatedAnnotation, id);
    logger.info("Lösche Body " + body.getFullJson().toString());
    if (body.getPurpose() != null && body.getPurpose().equalsIgnoreCase("tagging")) {
      updatedAnnotation.getTags().remove(body);
    } else {
      updatedAnnotation.getTextCards().remove(body);
    }
    updateAnnotation(updatedAnnotation);
  }
  
  private Annotation getAnnotationByBodyId(String bodyId) throws NoSuchIndexEntryException {
    Query query = new CriteriaQuery(new Criteria("pages.annotations.textCards.id").is(bodyId).or("pages.annotations.tags.id").is(bodyId));
    
    SearchHits<Manuscript> searchHits = elasticsearchOperations.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    
    for (Page page : searchHits.getSearchHit(0).getContent().getPages()) {
      for (Annotation annotation : page.getAnnotations()) {
        if (isBodyInAnnotation(annotation, bodyId)) {
          return annotation;
        }
      }
    }
    throw new NoSuchIndexEntryException("Could not find Annotation containing body with id: "
        + bodyId);
  }
  
  private boolean isBodyInAnnotation(Annotation annotation, String bodyId) {
    for (Body body : annotation.getTextCards()) {
      if (body.getId().equals(bodyId)) {
        return true;
      }
    }
    for (Body body : annotation.getTags()) {
      if (body.getId().equals(bodyId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets a body by going through given annotations bodies.
   *
   * @param annotation annotation to go through
   * @param bodyId ID of searched for body
   * @return body
   * @throws NoSuchIndexEntryException when there is no body with this ID in the annotation
   */
  @Override
  public Body getBodyFromAnnotationAndId(Annotation annotation, String bodyId)
      throws NoSuchIndexEntryException {
    
    for (Body body : annotation.getTags()) {
        logger.info("TagId: " + body.getId());
        logger.info("To check: " + bodyId);
      if (body.getId().equals(bodyId)) {
        return body;
      }
    }
    for (Body body : annotation.getTextCards()) {
      if (body.getId().equals(bodyId)) {
        return body;
      }
    }
    throw new NoSuchIndexEntryException("Could not find body with ID: " + bodyId);
  }
  
  // Getters

  /**
   * Gets a manuscript from the search index by its unique identifier.
   *
   * @param id manuscript identifier as String
   * @return Manuscript
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Manuscript getManuscriptById(String id) throws NoSuchIndexEntryException {
    Optional<Manuscript> manuscript = manuscriptRepository.findById(id);
    if (manuscript.isPresent()) {
      return manuscript.get();
    }
    throw new NoSuchIndexEntryException("No matching manuscript found.");
  }

  /**
   * Gets a page from the search index by its unique identifier.
   *
   * @param id page identifier as String
   * @return Page
   * @throws NoSuchIndexEntryException when there is no object with this ID in the search index
   */
  @Override
  public Page getPageById(String id) throws NoSuchIndexEntryException {
    Query query = new CriteriaQuery(new Criteria("pages.id").is(id));
    
    SearchHits<Manuscript> manuscripts = elasticsearchOperations.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));

    if (manuscripts.hasSearchHits()) {
      return getPageById(id, manuscripts.getSearchHit(0).getContent());
    }
    throw new NoSuchIndexEntryException("The page with the id " + id + " could not be found");
  }
  
  private Page getPageById(String pageId, Manuscript manuscript) throws NoSuchIndexEntryException {
    for (Page page : manuscript.getPages()) {
      if (page.getId().equals(pageId)) {
        return page;
      }
    }
    throw new NoSuchIndexEntryException("The page with the id " + pageId + " could not be found");
  }

  /**
   * Gets the JSON metadata of a manuscript as the raw JSON String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw JSON as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public JSONObject getRawManuscriptJson(String manuscriptId)
      throws InterruptedException, IOException, JSONException {
    return accessService.getRawManuscriptJson(manuscriptId);
  }

  /**
   * Gets the JSON metadata of a page as the raw JSON String.
   *
   * @param pageId the id of the page
   * @return the raw JSON as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   */
  @Override
  public JSONObject getRawPageJson(String pageId)
      throws InterruptedException, IOException, JSONException {
    return accessService.getRawPageJson(pageId);
  }

  /**
   * Gets the JSON metadata of an annotation as the raw JSON String.
   *
   * @param annotationId the id of the annotation
   * @return the raw JSON as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException when the object couldn't be parsed to JSON
   */
  @Override
  public JSONObject getRawAnnotationJson(String annotationId)
      throws InterruptedException, IOException, JSONException {
    return accessService.getRawAnnotationJson(annotationId);
  }

  /**
   * Gets the XML metadata of a manuscript as the raw XML String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw xml as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public String getRawManuscriptXml(String manuscriptId) throws IOException, InterruptedException {
    return accessService.getRawManuscriptXml(manuscriptId);
  }
  
  /**
   * Gets the XML content of a page as the raw XML String.
   *
   * @param pageId the id of the page
   * @param fileName identifies the file associated to a page
   * @return the raw xml as a String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * 
   */
  @Override
  public String getRawPageContentXml(String pageId, String fileName) throws IOException, InterruptedException {
	    return accessService.getRawPageContentXml(pageId, fileName);
  }
  
  /**
   * Starts the update cycle of the search index with the specified parameters.
   *
   * @param updateIndexDayInterval the interval of the update
   * @param updateIndexHour the hour of the day at which the update is performed
   */
  @Override
  public void startIndexUpdateCycle(int updateIndexDayInterval, int updateIndexHour) {
    Calendar firstExecution = Calendar.getInstance();
    firstExecution.set(Calendar.HOUR_OF_DAY, updateIndexHour);
    firstExecution.set(Calendar.MINUTE, 0);
    firstExecution.set(Calendar.SECOND, 0);
    
    //Make sure the first execution is not in the past
    if (firstExecution.toInstant().isBefore(Instant.now())) {
      firstExecution.add(Calendar.DAY_OF_MONTH, 1);
    }
    
    Timer timer = new Timer();
    timer.scheduleAtFixedRate(new TimerTask() {
          @Override
          public void run() {
            try {
              updateIndex();
            } catch (InterruptedException e) {
              logger.error("Could not update the index {}", e.getMessage());
              Thread.currentThread().interrupt();
              e.printStackTrace();
            } catch (JSONException | IOException e) {
              logger.error("Could not update the index {}", e.getMessage());
              e.printStackTrace();
            }
          }
        }, Date.from(firstExecution.toInstant()),
        TimeUnit.MILLISECONDS.convert(updateIndexDayInterval, TimeUnit.DAYS));
    logger.info("Scheduled index update cycle at the {}th hour of day every {} days",
        updateIndexHour, updateIndexDayInterval);
  }
  
  private Body findBodyInAnnotation(Body body, Annotation annotation)
      throws NoSuchIndexEntryException, JSONException {
    List<Body> allBodies = new ArrayList<>();
    allBodies.addAll(annotation.getTags());
    allBodies.addAll(annotation.getTextCards());
    for (Body newBody : allBodies) {
        logger.info("New body: " + newBody.getFullJson().toString());
        logger.info("Body to check: " + body.getFullJson().toString());
        if (newBody.equals(body)) {
            return newBody;
        }
    }
    throw new NoSuchIndexEntryException("No body like this was found in the index.");
  }
}
