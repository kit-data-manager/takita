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
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.TimeUnit;
import org.apache.lucene.search.join.ScoreMode;
import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.support.master.AcknowledgedResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.index.IndexSettings;
import org.elasticsearch.index.query.InnerHitBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
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
public class SearchIndexService implements ISearchIndexService {
  
  private static final Logger logger = LoggerFactory.getLogger(SearchIndexService.class);
  public static final String INDEX_NAME = "search_index";
  private final IAccessService accessService;
  private final ManuscriptRepository manuscriptRepository;
  private final ElasticsearchRestTemplate elasticsearchRestTemplate;

  private Date lastUpdatedIndex;


  /**
   * Constructor for the SearchIndexService to autowire required instances.
   *
   * @param accessService instance of the business logic for database access.
   *                      Injected with Springs dependency injection system
   *                      indicated by @autowired annotation.
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
    LocalDateTime startBuild = LocalDateTime.now();
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
    indexOp.putMapping(indexOp.createMapping(Manuscript.class));
    indexOp.putMapping(indexOp.createMapping(ImagePage.class));
    indexOp.putMapping(indexOp.createMapping(TextPage.class));
    indexOp.putMapping(indexOp.createMapping(Annotation.class));
    indexOp.putMapping(indexOp.createMapping(Tag.class));
    indexOp.putMapping(indexOp.createMapping(TextCard.class));
  
    List<Manuscript> allManuscripts = accessService.getAllManuscripts();
    
    logger.info("Indexing Manuscripts.");
    for (Manuscript m : allManuscripts) {
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
      lastUpdatedIndex = Date.from(Instant.now());
      LocalDateTime startUpdate = LocalDateTime.now();
      
      List<Manuscript> newManuscripts;
  
      try {
        newManuscripts = accessService.getAllManuscriptsModifiedAfter(timestamp);
      } catch (ParseException | NoSuchIndexEntryException e) {
        throw new IllegalArgumentException("The timestamp format is not correct");
      }
      logger.info("Indexing new or modified Manuscripts.");
      for (Manuscript manuscript : newManuscripts) {
        manuscriptRepository.deleteById(manuscript.getId());
        manuscriptRepository.save(manuscript);
      }
      Duration duration = Duration.between(startUpdate, LocalDateTime.now());
      logger.info("Finished index update in {} minutes and {} seconds", duration.toMinutes(),
          duration.getSeconds() % 60);
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
    LocalDateTime startBuild = LocalDateTime.now();
    deleteIndex();

    //Creating the index
    elasticsearchRestTemplate.execute(client ->
        client.indices().create(new CreateIndexRequest(INDEX_NAME)
                .settings(Settings.builder()
                    .put("index.mapping.nested_objects.limit", 1000000)),
            RequestOptions.DEFAULT));

    logger.info("Building new small index.");
    IndexOperations indexOp = elasticsearchRestTemplate.indexOps(Manuscript.class);
    indexOp.putMapping(indexOp.createMapping(Manuscript.class));
    indexOp.putMapping(indexOp.createMapping(ImagePage.class));
    indexOp.putMapping(indexOp.createMapping(TextPage.class));
    indexOp.putMapping(indexOp.createMapping(Annotation.class));
    indexOp.putMapping(indexOp.createMapping(Tag.class));
    indexOp.putMapping(indexOp.createMapping(TextCard.class));

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
  
  //CRUD Annotation

  /**
   * Adds an annotation to the search index.
   *
   * @param annotation new Annotation
   * @return added annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public Annotation addAnnotation(Annotation annotation) throws InterruptedException, IOException,
      JSONException, NoSuchIndexEntryException {
    Page page = getPageById(annotation.getPageId());
    
    Annotation newAnnotation = accessService.addAnnotation(
          annotation, page.getPageNumber());

    Optional<Manuscript> manuscriptHit = manuscriptRepository.findById(page.getManuscriptId());
    
    if (manuscriptHit.isPresent()) {
      manuscriptRepository.delete(manuscriptHit.get());
      if (page.getResourceType() == ResourceType.IMAGE) {
        ((ImagePage) page).addAnnotation(newAnnotation);
      }
      manuscriptRepository.save(manuscriptHit.get());
    }
    return newAnnotation;
  }

  /**
   * Gets an annotation by its unique annotation identifier from the search index.
   *
   * @param id annotation identifier as String
   * @return Annotation
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
    
    for (Page p : searchHits.getSearchHit(0).getContent().getPages()) {
      if (p.getResourceType().equals(ResourceType.IMAGE)) {
        for (Annotation a : ((ImagePage) p).getAnnotations()) {
          if (a.getId().equals(id)) {
            return a;
          }
        }
      }
    }
    throw new NoSuchIndexEntryException("Could not find Annotation with id: " + id);
  }

  /**
   * Updates an annotation in the search index.
   *
   * @param annotation updated annotation
   * @return updated annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public Annotation updateAnnotation(Annotation annotation) throws IOException, InterruptedException,
      JSONException, NoSuchIndexEntryException {
    // update annotation in dataaccess, dataaccess adds some information
    // to annotation only dataaccess needs
    
    Page page = getPageById(annotation.getPageId());
    Annotation newAnnotation = accessService.updateAnnotation(annotation, page.getPageNumber());

    // update annotation in index by first deleting manuscript and later adding updated one
    Optional<Manuscript> manuscriptHit =
        manuscriptRepository.findById(page.getManuscriptId());
    
    if (manuscriptHit.isPresent()) {
      manuscriptRepository.delete(manuscriptHit.get());
      
      if (page.getResourceType() == ResourceType.IMAGE
          && page.getAnnotations().contains(annotation)) {
        page.getAnnotations().remove(annotation);
        ((ImagePage) page).addAnnotation(newAnnotation);
      }
      manuscriptRepository.save(manuscriptHit.get());
    }
    return newAnnotation;
  }

  /**
   * Validates an annotation in the search index and notifies the dataaccess package.
   *
   * @param annotation unvalidated annotation
   * @return validated annotation
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public Annotation validateAnnotation(Annotation annotation) throws IOException, InterruptedException,
      JSONException, NoSuchIndexEntryException {
    Page page = getPageById(annotation.getPageId());
    
    Annotation validatedAnnotation = accessService.validateAnnotation(annotation,
        page.getPageNumber());

    Optional<Manuscript> manuscriptHit = manuscriptRepository.findById(page.getManuscriptId());
    
    if (manuscriptHit.isPresent()) {
      manuscriptRepository.delete(manuscriptHit.get());
      if (page.getResourceType() == ResourceType.IMAGE) {
        page.getAnnotations().remove(annotation);
        ((ImagePage) page).addAnnotation(validatedAnnotation);
      }
      manuscriptRepository.save(manuscriptHit.get());
    }
    return validatedAnnotation;
  }

  /**
   * Deletes an annotation by its unique annotation identifier from the search index.
   *
   * @param id annotation identifier as String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public void deleteAnnotationById(String id) throws IOException, InterruptedException,
      JSONException,
      NoSuchIndexEntryException {
    Annotation annotation = getAnnotationById(id);
    
    //Delete Annotation in the annotation store
    accessService.deleteAnnotation(annotation);
    
    //Update corresponding manuscript in the index
    Page page = getPageById(annotation.getPageId());
    Optional<Manuscript> manResult = manuscriptRepository.findById(page.getManuscriptId());
    if (manResult.isPresent()) {
      elasticsearchRestTemplate.delete(manResult.get());
      if (page.getResourceType() == ResourceType.IMAGE) {
        ((ImagePage) page).getAnnotations().remove(annotation);
      }
      manuscriptRepository.save(manResult.get());
    }
  }

  //CRUD TextCard

  /**
   * Adds a body to an annotation in the search index.
   *
   * @param body new Body
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public void addBody(Body body) throws IOException, InterruptedException, JSONException,
      NoSuchIndexEntryException {
    Annotation updatedAnnotation = getAnnotationById(body.getAnnotationId());
    if (body.getPurpose().equals("tagging")) {
      updatedAnnotation.addTag((Tag) body);
    } else {
      updatedAnnotation.addTextCard((TextCard) body);
    }

    updateAnnotation(updatedAnnotation);
  }

  /**
   * Gets a text card from the search index by its unique identifier.
   *
   * @param id text card identifier as String
   * @return TextCard
   */
  @Override
  public TextCard getTextCardById(String id) throws NoSuchIndexEntryException {
    Query query = new NativeSearchQueryBuilder()
        .withQuery(matchQuery("pages.annotations.textCards.id.keyword", id)).build();
  
    SearchHits<Manuscript> manuscriptForPage = elasticsearchRestTemplate.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
  
    Manuscript man = manuscriptForPage.getSearchHit(0).getContent();
  
    for (Page page : man.getPages()) {
      if (page.getResourceType() == ResourceType.IMAGE) {
        for (Annotation annotation : ((ImagePage) page).getAnnotations()) {
          for (TextCard card : annotation.getTextCards()) {
            if (card.getId().equals(id)) {
              return card;
            }
          }
        }
      }
    }
    throw new NoSuchIndexEntryException("There was no matching tag in the found manuscript");
  }

  /**
   * Gets the tag of an annotation by its ID.
   *
   * @param id id of a tag
   * @return corresponding tag
   */
  @Override
  public Tag getTagById(String id) throws NoSuchIndexEntryException {
    Query query = new NativeSearchQueryBuilder()
        .withQuery(matchQuery("pages.annotations.tags.id.keyword", id)).build();
    
    SearchHits<Manuscript> manuscriptForPage = elasticsearchRestTemplate.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    
    Manuscript man = manuscriptForPage.getSearchHit(0).getContent();

    for (Page page : man.getPages()) {
      if (page.getResourceType() == ResourceType.IMAGE) {
        for (Annotation annotation : ((ImagePage) page).getAnnotations()) {
          for (Tag tag : annotation.getTags()) {
            if (tag.getId().equals(id)) {
              return tag;
            }
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
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public void updateBody(Body body) throws IOException, InterruptedException, JSONException,
      NoSuchIndexEntryException {
    Annotation updatedAnnotation = getAnnotationByBodyId(body.getId());
    if (body.getPurpose().equals("tagging")) {
      updatedAnnotation.addTag((Tag) body);
    } else {
      updatedAnnotation.addTextCard((TextCard) body);
    }

    updateAnnotation(updatedAnnotation);
  }

  /**
   * Deletes a body entity from the search index by its unique identifier.
   *
   * @param id body identifier as String
   * @throws IOException if an error occurs while sending/receiving http request to annotation store
   * @throws InterruptedException if http request is interrupted
   */
  @Override
  public void deleteBodyById(String id) throws IOException, InterruptedException,
      JSONException, NoSuchIndexEntryException {
    Annotation updatedAnnotation = getAnnotationByBodyId(id);
    Body b = getBodyFromAnnotationAndId(updatedAnnotation, id);
    if (b.getPurpose().equals("tagging")) {
      updatedAnnotation.getTags().remove(b);
    } else {
      updatedAnnotation.getTextCards().remove(b);
    }
    updateAnnotation(updatedAnnotation);
  }
  
  private Annotation getAnnotationByBodyId(String bodyId) {
    Query query =
        new NativeSearchQueryBuilder().withQuery(boolQuery()
            .should(matchQuery("pages.annotations.tags.id.keyword", bodyId))
            .should(matchQuery("pages.annotations.textCards.id.keyword", bodyId))
            .minimumShouldMatch(1))
            .build();
    
    SearchHits<Manuscript> searchHits = elasticsearchRestTemplate.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    
    for (Page p : searchHits.getSearchHit(0).getContent().getPages()) {
      if (p.getResourceType().equals(ResourceType.IMAGE)) {
        for (Annotation a : ((ImagePage) p).getAnnotations()) {
          for (Body b : a.getTextCards()) {
            if (b.getId().equals(bodyId)) {
              return a;
            }
          }
          for (Body b : a.getTags()) {
            if (b.getId().equals(bodyId)) {
              return a;
            }
          }
        }
      }
    }
    throw new IllegalArgumentException("Could not find Annotation with id: " + bodyId);
  }
  
  private Body getBodyFromAnnotationAndId(Annotation annotation, String bodyId)
      throws NoSuchIndexEntryException {

    for (Body b : annotation.getTags()) {
      if (b.getId().equals(bodyId)) {
        return b;
      }
    }
    for (Body b : annotation.getTextCards()) {
      if (b.getId().equals(bodyId)) {
        return b;
      }
    }
    throw new NoSuchIndexEntryException("Could not find Body with id: " + bodyId);
  }

  // Getters

  /**
   * Gets a manuscript from the search index by its unique identifier.
   *
   * @param id manuscript identifier as String
   * @return Manuscript
   */
  @Override
  public Manuscript getManuscriptById(String id) throws NoSuchIndexEntryException {
    Optional<Manuscript> manuscript =  manuscriptRepository.findById(id);
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
   */
  @Override
  public Page getPageById(String id) throws NoSuchIndexEntryException {
    Query query = new NativeSearchQueryBuilder().withQuery(
        nestedQuery("pages", matchQuery("pages.id.keyword", id), ScoreMode.Avg)
            .innerHit(new InnerHitBuilder().setName("innerHitName"))).build();
    
    SearchHits<Manuscript> manuscripts = elasticsearchRestTemplate.search(
        query, Manuscript.class, IndexCoordinates.of(INDEX_NAME));
    
    if (manuscripts.hasSearchHits()) {
      for (Page p : manuscripts.getSearchHit(0).getContent().getPages()) {
        if (p.getId().equals(id)) {
          return p;
        }
      }
    }
    throw new NoSuchIndexEntryException("The page with the id " + id + " could not be found");
  }

  /**
   * Gets the JSON metadata of a manuscript as the raw JSON String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw JSON as a String
   */
  @Override
  public JSONObject getRawManuscriptJson(String manuscriptId)
      throws InterruptedException, IOException, JSONException {
    return accessService.getRawAnnotationJson(manuscriptId);
  }

  /**
   * Gets the JSON metadata of a page as the raw JSON String.
   *
   * @param pageId the id of the page
   * @return the raw JSON as a String
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
   */
  @Override
  public JSONObject getRawAnnotationJson(String annotationId)
      throws InterruptedException, IOException, JSONException {
    return accessService.getRawAnnotationJson(annotationId);
  }

  /**
   * Gets the XML metadata given in the TEI standard of a manuscript as the raw XML String.
   *
   * @param manuscriptId the id of the manuscript
   * @return the raw xml as a String
   */
  @Override
  public String getRawManuscriptXml(String manuscriptId) throws IOException, InterruptedException {
    return accessService.getRawManuscriptXml(manuscriptId);
  }
  
  /**
   * Starts the update cycle of the search index with the specified parameters.
   *
   * @param updateIndexDayInterval the interval of the update
   * @param updateIndexHour the hour of day at which the update is performed
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
        } catch (InterruptedException | JSONException | IOException e) {
          logger.error("Could not update the index {}", e.getMessage());
          e.printStackTrace();
        }
      }
    }, Date.from(firstExecution.toInstant()),
        TimeUnit.MILLISECONDS.convert(updateIndexDayInterval, TimeUnit.DAYS));
    logger.info("Scheduled index update cycle at the {}th hour of day every {} days",
        updateIndexHour, updateIndexDayInterval);
  }
}
