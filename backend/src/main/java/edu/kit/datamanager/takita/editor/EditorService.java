package edu.kit.datamanager.takita.editor;

import edu.kit.datamanager.takita.NoSuchIndexEntryException;
import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.dataaccess.AnnotationConverter;
import edu.kit.datamanager.takita.dataaccess.IAnnotationStoreAccessService;
import edu.kit.datamanager.takita.dataaccess.IRepositoryAccessService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.page.Page;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

/**
 * Implements the Interface IEditorService, handles methods needed by the EditorController.
 */
@Service
@SessionScope
public class EditorService implements IEditorService {
  private final ThreadLocal<Manuscript> currentManuscript = new ThreadLocal<>();
  private final ThreadLocal<Page> currentPage = new ThreadLocal<>();
  private Annotation currentAnnotation;

  private final IAssistanceService assistanceService;
  private final ISearchIndexService searchIndexService;
  private final IAnnotationStoreAccessService accessService;
  private final IRepositoryAccessService repositoryAccessService;
  private final AnnotationConverter annotationConverter;

  private static final Logger logger = LoggerFactory.getLogger(EditorService.class);

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param assistanceService instance of IAssistanceService
   * @param searchIndexService instance of ISearchIndexService
   * @param accessService instance of IAccessService
   * @param repositoryAccessService instance of IRepositoryService
   */
  @Autowired
  public EditorService(IAssistanceService assistanceService,
                           ISearchIndexService searchIndexService,
                           IAnnotationStoreAccessService accessService,
                           IRepositoryAccessService repositoryAccessService) {
    this.assistanceService = assistanceService;
    this.searchIndexService = searchIndexService;
    this.accessService = accessService;
    this.repositoryAccessService = repositoryAccessService;
    this.annotationConverter = new AnnotationConverter(accessService, repositoryAccessService);
  }

  /**
   * Adds an annotation to the search index and the database.
   *
   * @param pageId ID of the page on which the annotation is located
   * @param selectors 1-n selectors (part of the target) of the annotation
   * @param motivation motivation of the annotation
   * @return the added annotation
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such page in the index
   * @throws IOException when the http request to database was faulty
   * @throws JSONException when there is a problem with the JSON object holding the selector
   */
  @Override
  public Annotation addAnnotation(String pageId, JSONArray selectors, String motivation)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
    List<String> creators = Collections.singletonList(
              assistanceService.getCurrentUser().getName());
    Instant currentTime = Instant.now();
    Page page = searchIndexService.getPageById(pageId);
    String linkToResource = repositoryAccessService.getLinkForPage(pageId, page.getPageNumber(), page.getResourceType());
    Annotation newAnnotation = new Annotation(pageId, creators, currentTime, currentTime, linkToResource, selectors, motivation);
    try {
      logger.info("EditorService: " + newAnnotation.toString());
      newAnnotation = searchIndexService.addAnnotation(newAnnotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newAnnotation;
  }

  /**
   * Gets an annotation from the searchIndexService by its ID.
   *
   * @param annotationId ID of annotation
   * @return requested annotation
   * @throws NoSuchIndexEntryException when there is no annotation like this in the index
   */
  @Override
  public Annotation getAnnotation(String annotationId) throws NoSuchIndexEntryException {
    return searchIndexService.getAnnotationById(annotationId);       
  }

  /**
   * Updates an annotation in the search index and the database.
   *
   * @param annotationId ID of the annotation to update
   * @param selectors new 1-n selectors (part of the target) of the annotation
   * @param motivation new motivation of the annotation
   * @return updated annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   * @throws JSONException when there is a problem with the JSON object holding the selector
   */
  @Override
  public Annotation updateAnnotation(String annotationId, JSONArray selectors, String motivation)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException {
    Annotation updatedAnnotation = searchIndexService.getAnnotationById(annotationId);

    Page page = searchIndexService.getPageById(updatedAnnotation.getPageId());
    String linkToResource = repositoryAccessService.getLinkForPage(page.getId(), page.getPageNumber(), page.getResourceType());

    List<String> creators = Collections.singletonList(assistanceService
        .getCurrentUser().getName());
    updatedAnnotation.update(creators, linkToResource, selectors, motivation);
    try {
      updatedAnnotation = searchIndexService.updateAnnotation(updatedAnnotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return updatedAnnotation;
  }

  /**
   * Updates an annotation in the search index and the database, based on new WADM version
   * @return updated annotation
   */
  public Annotation updateWADMAnnotation(String annotationId, String wadmString) throws JSONException, NoSuchIndexEntryException, IOException, InterruptedException {
    JSONObject newAnnoData = new JSONObject(wadmString);
    Annotation currentAnnotation = searchIndexService.getAnnotationById(annotationId);
    Annotation newAnnotation = this.annotationConverter.buildAnnotationFromJson(newAnnoData);

    if (!Objects.equals(currentAnnotation.getPageId(), newAnnotation.getPageId())) {
      throw new IllegalArgumentException("Applying an annotation update that changes the targeted page is currently not supported");
    }
    Annotation updatedAnnotation = this.searchIndexService.updateAnnotation(newAnnotation);

    return updatedAnnotation;
  }

  /**
   * Validates an annotation in the search index and the database.
   *
   * @param annotationId ID of the annotation to be validated
   * @return validated annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Annotation validateAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationId);
    annotation.setModified(Instant.now());
    annotation.addCreator(assistanceService.getCurrentUser().getName());
    try {
      annotation = searchIndexService.validateAnnotation(annotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return annotation;
  }

  /**
   * Deletes an annotation from the search index and the database.
   *
   * @param annotationId of the annotation to delete
   * @return deleted annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Annotation deleteAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    Annotation deletedAnnotation = searchIndexService.getAnnotationById(annotationId);
    try {
      searchIndexService.deleteAnnotationById(annotationId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return deletedAnnotation;
  }

  /**
   * Adds a text card to an annotation in the search index and the database.
   *
   * @param annotationId of the annotation to which the text card belongs
   * @param title of the text card
   * @param value of the text card
   * @param purpose of the text card
   * @return added text card
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public TextCard addTextCard(String annotationId, String title, String subject, String value, String source, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
      List<String> creators = Collections.singletonList(assistanceService.getCurrentUser().getName());
      TextCard newTextCard = new TextCard(UUID.randomUUID().toString(), annotationId, creators,
            Instant.now(), Instant.now(), source, subject, title, value, purpose);
    
    newTextCard.setFullJson(annotationConverter.bodyToJson(newTextCard));
    try {
      newTextCard = (TextCard) searchIndexService.addBody(newTextCard);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return newTextCard;
  }

  /**
   * Adds a tag to an annotation in the search index and the database.
   *
   * @param annotationId of the annotation to which the tag belongs
   * @param title of the tag
   * @param value of the tag
   * @return added tag
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Tag addTag(String annotationId, String title, String subject, String value, String source)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
    List<String> creators = Collections.singletonList(assistanceService.getCurrentUser().getName());
    Tag newTag = new Tag(UUID.randomUUID().toString(), annotationId, creators,
            Instant.now(), Instant.now(), source, subject, title, value);
    logger.info("newTag: " + newTag.toString());
    
    newTag.setFullJson(annotationConverter.bodyToJson(newTag));
    logger.info("addedInfo: " + newTag.toString());
    try {
      newTag = (Tag) searchIndexService.addBody(newTag);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newTag;
  }

  /**
   * Gets a text card from the search index.
   *
   * @param id of the text card
   * @return text card in question
   */
  @Override
  public TextCard getTextCard(String id) throws NoSuchIndexEntryException {
    return searchIndexService.getTextCardById(id);
  }

  /**
   * Gets a tag from the search index.
   *
   * @param id of the tag
   * @return tag in question
   */
  @Override
  public Tag getTag(String id) throws NoSuchIndexEntryException {
    return searchIndexService.getTagById(id);
  }

  /**
   * Updates a text card in the search index and the database.
   *
   * @param textCardId of the text card which should be updated
   * @param title new title of the text card
   * @param value new value of the text card
   * @param purpose new purpose of the text card
   * @return updated text card
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such text card in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public TextCard updateTextCard(String textCardId, String title, String subject, String value, String source, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException, JSONException {
    TextCard textCard = searchIndexService.getTextCardById(textCardId);
    String creator = assistanceService.getCurrentUser().getName();
    textCard.update(creator, Instant.now(), source, subject, title, value, purpose);

    textCard.setFullJson(annotationConverter.bodyToJson(textCard));

    TextCard updatedTextCard;
    try {
        updatedTextCard = (TextCard) searchIndexService.updateBody(textCard);
    } catch (JSONException e) {
        updatedTextCard  = new TextCard("No TextCard");
      e.printStackTrace();
    }

    return updatedTextCard;
  }

  /**
   * Updates a tag in the search index and the database.
   *
   * @param tagId of the tag which should be updated
   * @param title new title of the tag
   * @param value new value of the tag
   * @return updated tag
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such tag in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Tag updateTag(String tagId, String title, String subject, String value, String source)
      throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException {
    Tag updatedTag = searchIndexService.getTagById(tagId);

    String creator = assistanceService.getCurrentUser().getName();
    updatedTag.update(creator, Instant.now(), source, subject, title, value);

    updatedTag.setFullJson(annotationConverter.bodyToJson(updatedTag));

    try {
      updatedTag = (Tag) searchIndexService.updateBody(updatedTag);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return updatedTag;

  }

  /**
   * Deletes a text card in the search index and the database.
   *
   * @param textCardId of the text card which should be deleted
   * @return deleted text card
   * @throws NoSuchIndexEntryException when there is no such text card in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public TextCard deleteTextCard(String textCardId)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    TextCard deletedTextCard = searchIndexService.getTextCardById(textCardId);
    try {
      searchIndexService.deleteBodyById(textCardId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return deletedTextCard;
  }

  /**
   * Deletes a tag in the search index and the database.
   *
   * @param tagId of the tag which should be deleted
   * @return deleted tag
   * @throws NoSuchIndexEntryException when there is no such tag in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Tag deleteTag(String tagId)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    Tag deletedTag = searchIndexService.getTagById(tagId);
    try {
      searchIndexService.deleteBodyById(tagId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return deletedTag;
  }

  /**
   * Gets the raw JSON of a manuscript.
   *
   * @param manuscriptId of the manuscript to which the raw JSON should be gotten
   * @return manuscript as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public JSONObject getManuscriptJson(String manuscriptId)
      throws InterruptedException, IOException {
    try {
      return searchIndexService.getRawManuscriptJson(manuscriptId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Gets the raw XML of a manuscript.
   *
   * @param manuscriptId of the manuscript to which the raw XML should be gotten
   * @return manuscript as XML as String
   * @throws IOException when the http request to database was faulty
   * @throws InterruptedException when the http request to database is interrupted
   */
  @Override
  public String getManuscriptXml(String manuscriptId) throws IOException, InterruptedException {
    return searchIndexService.getRawManuscriptXml(manuscriptId);
  }

  /**
   * Gets the raw XML of a page.
   *
   * @param pageId of the manuscript to which the raw XML should be gotten
   * @param fileName identifies the file associated to a page
   * @return page as XML as String
   * @throws IOException when the http request to database was faulty
   * @throws InterruptedException when the http request to database is interrupted
   */
  @Override
  public String getPageContentXml(String pageId, String fileName) throws IOException, InterruptedException {
	    return searchIndexService.getRawPageContentXml(pageId, fileName);
  }

  /**
   * Gets the raw JSON of a page.
   *
   * @param pageId of the page to which the raw JSON should be gotten
   * @return page as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public JSONObject getPageJson(String pageId)
      throws InterruptedException, IOException {
    try {
      return searchIndexService.getRawPageJson(pageId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Gets the raw JSON of an annotation.
   *
   * @param annotationId of the annotation to which the raw JSON should be gotten
   * @return annotation as JSONObject
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public JSONObject getAnnotationJson(String annotationId)
      throws InterruptedException, IOException {
    try {
      return searchIndexService.getRawAnnotationJson(annotationId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }
  
  @Override
  public List<JSONObject> getAnnotationsForPage(String pageId, String pageNumber)
    throws InterruptedException, IOException, JSONException {
    return accessService.getAnnotationsByPageId(pageId, pageNumber);
  }
  
  @Override
  public List<Annotation> getAnnotationsForId(String id)
    throws NoSuchIndexEntryException, InterruptedException, IOException, JSONException {
    //return accessService.getAnnotationsByTarget(target);
    return searchIndexService.getAnnotationsForPageById(id);
  }

  @Override
  public void selectPage(String pageId) throws NoSuchIndexEntryException {
    currentPage.set(searchIndexService.getPageById(pageId));
    if (currentManuscript.get() == null || !currentManuscript.get().getId().equals(currentPage.get().getManuscriptId())) {
      currentManuscript.set(searchIndexService.getManuscriptById(currentPage.get().getManuscriptId()));
    }
  }

  @Override
  public Manuscript getCurrentManuscript() {
    return currentManuscript.get();
  }

  @Override
  public Page getCurrentPage() {
    return currentPage.get();
  }

}
