package edu.kit.scc.dem.tuhl.mainpage.search;

import static org.elasticsearch.index.query.QueryBuilders.boolQuery;
import static org.elasticsearch.index.query.QueryBuilders.matchQuery;
import static org.elasticsearch.index.query.QueryBuilders.nestedQuery;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.dataaccess.IAccessService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.body.Body;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;
import edu.kit.scc.dem.tuhl.model.page.TextPage;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.TimeUnit;
import org.apache.lucene.search.join.ScoreMode;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.action.support.master.AcknowledgedResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.index.query.InnerHitBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;


/**
 * Class containing business logic for handling the search index.
 */
@Service
public class  SearchIndexService implements ISearchIndexService {
  
  private static final Logger logger = LoggerFactory.getLogger(SearchIndexService.class);
  public static final String INDEX_NAME = "search_index";
  private final IAccessService accessService;
  private final ManuscriptRepository manuscriptRepository;
  private final ElasticsearchRestTemplate elasticsearchRestTemplate;
  
  private Date lastUpdatedIndex;
  
  
  /**
   * Constructor for the SearchIndexService to autowire required instances.
   *
   * @param accessService instance of the business logic for database access. Injected with
   *                      Springs dependency injection system indicated by @autowired annotation.
   * @param manuscriptRepository instance of the manuscript repository. Injected with Springs
   *                             dependency injection system indicated by @autowired annotation.
   * @param elasticsearchRestTemplate instance of the elasticsearch rest template. Injected with
   *                                  Springs dependency injection system indicated by @autowired
   *                                  annotation.
   */
  @Autowired
  public SearchIndexService(IAccessService accessService,
                            ManuscriptRepository manuscriptRepository,
                            ElasticsearchRestTemplate elasticsearchRestTemplate) {
    this.accessService = accessService;
    this.manuscriptRepository = manuscriptRepository;
    this.elasticsearchRestTemplate = elasticsearchRestTemplate;
    lastUpdatedIndex = Date.from(Instant.EPOCH);
    accessService.setSearchIndexService(this);
  }
  
  /**
   * Builds a new search index from scratch.
   *
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException if an error occurs while parsing the JSON
   */
  @Override
  public void buildIndex() throws InterruptedException, IOException, JSONException {
    logger.info("Index rebuild started. Deleting old index.");
    final LocalDateTime startBuild = LocalDateTime.now();
    lastUpdatedIndex = Date.from(Instant.now());
    deleteIndex();
    
    //Creating the index
    elasticsearchRestTemplate.execute(client ->
        client.indices().create(new CreateIndexRequest(INDEX_NAME)
                .settings(Settings.builder()
                    .put("index.mapping.nested_objects.limit", 1000000)),
            RequestOptions.DEFAULT));
    
    logger.info("Building new index. This may take a while.");
    
    IndexOperations indexOp = elasticsearchRestTemplate.indexOps(Manuscript.class);
    createMappings(indexOp);
    
    List<Manuscript> allManuscripts = accessService.getAllManuscripts();
    for (Manuscript m : allManuscripts) {
      logger.info("Finished. Indexing manuscript {}", m.getId());
      manuscriptRepository.save(m);
    }
    
    indexOp.refresh();
    
    Duration duration = Duration.between(startBuild, LocalDateTime.now());
    logger.info("Finished index build in {} minutes and {} seconds",
        duration.toMinutes(),
        duration.getSeconds() % 60);
  }
  
  private void deleteIndex() {
    if (indexExists()) {
      AcknowledgedResponse response = elasticsearchRestTemplate.execute(client ->
          client.indices().delete(new DeleteIndexRequest(INDEX_NAME), RequestOptions.DEFAULT));
      if (response.isAcknowledged()) {
        logger.info("Index successfully deleted.");
      } else {
        logger.info("Index could not be deleted.");
      }
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
    if (!indexExists()) {
      logger.info("Index does not exist yet. Starting build.");
      buildIndex();
    } else {
      logger.info("Index update started. This may take a while.");
      Date timestamp = lastUpdatedIndex;
      
      //after a restart or rebuild the application might have no information about the last update.
      //In this case try to use index creation date instead.
      //TODO: find a better solution, i.e. checking the most recent updates in the index somehow
      if(timestamp.equals(Date.from(Instant.EPOCH))) {
        logger.warn("No date for last index build found");
        Date creationDate = indexCreationDate();
        
        if(creationDate != null && creationDate.after(Date.from(Instant.EPOCH))) {
          timestamp = creationDate;
        }
      }

      lastUpdatedIndex = Date.from(Instant.now());
      final LocalDateTime startUpdate = LocalDateTime.now();
      
      List<Manuscript> newManuscripts;
      
      try {
        newManuscripts = accessService.getAllManuscriptsModifiedAfter(timestamp);
      } catch (ParseException | NoSuchIndexEntryException e) {
        throw new IllegalArgumentException("The timestamp format is not correct");
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
      Duration duration = Duration.between(startUpdate, LocalDateTime.now());
      logger.info("Finished index update in {} minutes and {} seconds", duration.toMinutes(),
          duration.getSeconds() % 60);
    }
  }
  
  public Date indexCreationDate() {

    GetIndexRequest indexReq = new GetIndexRequest(INDEX_NAME);
    indexReq.includeDefaults(true);
    try {
      logger.info("Getting index creation date");
      return elasticsearchRestTemplate.execute(client -> 
        Date.from(Instant.ofEpochMilli(Long.parseLong(client.indices().get(indexReq, RequestOptions.DEFAULT).getSetting(INDEX_NAME, "index.creation_date"))))    
      );      
    } catch (NullPointerException e) {
      logger.error("Search index creation date could not be parsed");
      return null;
    }

}

  private boolean indexExists() {
    return elasticsearchRestTemplate.execute(client ->
        client.indices().exists(new GetIndexRequest(INDEX_NAME), RequestOptions.DEFAULT));
  }
  
  /**
   * Builds a new search index from scratch. This search index is limited to 5 manuscripts.
   *
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   * @throws JSONException if an error occurs while parsing the JSON
   */
  @Override
  public void buildSmallIndex() throws InterruptedException, IOException, JSONException {
    logger.info("Limited Index rebuild started. Deleting old index.");
    final LocalDateTime startBuild = LocalDateTime.now();
    deleteIndex();
    
    //Creating the index
    elasticsearchRestTemplate.execute(client ->
        client.indices().create(new CreateIndexRequest(INDEX_NAME)
                .settings(Settings.builder()
                    .put("index.mapping.nested_objects.limit", 1000000)),
            RequestOptions.DEFAULT));
    
    logger.info("Building new small index.");
  
    IndexOperations indexOp = elasticsearchRestTemplate.indexOps(Manuscript.class);
    createMappings(indexOp);
    
    List<Manuscript> allManuscripts = accessService.getFewManuscripts();
    logger.info("Indexing Manuscripts.");
    
    for (Manuscript manuscript : allManuscripts) {
      manuscriptRepository.save(manuscript);
    }
    indexOp.refresh();
    
    Duration duration = Duration.between(startBuild, LocalDateTime.now());
    logger.info("Finished limited index build in {} minutes and {} seconds", duration.toMinutes(),
        duration.getSeconds() % 60);
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
    Page page = getPageById(annotation.getPageId());
    Manuscript manuscript = getManuscriptById(page.getManuscriptId());
    logger.info(manuscript.getPublisher());
    
    String manuscriptPublisher = manuscript.getPublisher();
    // bad string magic, take everything after the last occurence of "-", 
    // omit the space and convert it to lower case to use this as a subfolder 
    // in the annotion store
    String projectId = manuscriptPublisher.substring(manuscriptPublisher.lastIndexOf("-") + 2).toLowerCase() + "/";
    
    Annotation newAnnotation;
    
    // if a parsing error occurs then store the annotation to a default subfolder
    if (projectId != null && !projectId.equals(manuscriptPublisher)) {
        newAnnotation = accessService.addAnnotation(annotation, page.getPageNumber(), projectId);
    } else {
        newAnnotation = accessService.addAnnotation(annotation, page.getPageNumber(), "takitadefault");
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
    Query query =
        new NativeSearchQueryBuilder().withQuery(
            matchQuery("pages.annotations.id.keyword", id)).build();
    
    SearchHits<Manuscript> searchHits = elasticsearchRestTemplate.search(
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
    Query query =
        new NativeSearchQueryBuilder().withQuery(
            matchQuery("pages.id.keyword", id)).build();
    
    SearchHits<Manuscript> searchHits = elasticsearchRestTemplate.search(
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
   * Updates an annotation in the search index AND THE DATABASE??? (PHILIPP).
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
    Page page = getPageById(annotation.getPageId());
    
    Annotation validatedAnnotation = accessService.validateAnnotation(annotation,
        page.getPageNumber());
    
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
    if (body.getPurpose().equalsIgnoreCase("tagging")) {
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
    Query query = new NativeSearchQueryBuilder()
        .withQuery(matchQuery("pages.annotations.textCards.id.keyword", id)).build();
    
    SearchHits<Manuscript> manuscriptForPage = elasticsearchRestTemplate.search(
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
      if (page.getResourceType() == ResourceType.IMAGE) {
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
    Query query = new NativeSearchQueryBuilder()
        .withQuery(matchQuery("pages.annotations.tags.id.keyword", id)).build();
    
    SearchHits<Manuscript> manuscriptForPage = elasticsearchRestTemplate.search(
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
    if (body.getPurpose().equalsIgnoreCase("tagging")) {
      updatedAnnotation.getTags().remove(body);
    } else {
      updatedAnnotation.getTextCards().remove(body);
    }
    updateAnnotation(updatedAnnotation);
  }
  
  private Annotation getAnnotationByBodyId(String bodyId) throws NoSuchIndexEntryException {
    Query query =
        new NativeSearchQueryBuilder().withQuery(boolQuery()
            .should(matchQuery("pages.annotations.tags.id.keyword", bodyId))
            .should(matchQuery("pages.annotations.textCards.id.keyword", bodyId))
            .minimumShouldMatch(1))
            .build();
    
    SearchHits<Manuscript> searchHits = elasticsearchRestTemplate.search(
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
    Query query = new NativeSearchQueryBuilder().withQuery(
        nestedQuery("pages", matchQuery("pages.id.keyword", id), ScoreMode.Avg)
            .innerHit(new InnerHitBuilder().setName("innerHitName"))).build();
    
    SearchHits<Manuscript> manuscripts = elasticsearchRestTemplate.search(
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
        logger.info(newBody.getFullJson().toString());
        logger.info(body.getFullJson().toString());
        if (newBody.equals(body)) {
            return newBody;
        }
      // can't use ID because same body can have different IDs
      // old bodies may miss a created date? newBody.getCreated() != null
      // newBody.getCreated().equals(body.getCreated())
      // && newBody.getTitle().equals(body.getTitle())
      //if (newBody.getCreators().containsAll(body.getCreators())
      //    && newBody.getPurpose() == body.getPurpose()
      //    && newBody.getValue().equals(body.getValue())) {
      //  return newBody;
      //}
    }
    throw new NoSuchIndexEntryException("No body like this was found in the index.");
  }
}
