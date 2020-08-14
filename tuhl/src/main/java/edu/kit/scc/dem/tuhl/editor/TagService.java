package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

/**
 * Class TagService implements Interface ITagService, is responsible for adding and removing tags.
 */
@Service
@SessionScope
public class TagService implements ITagService {

  private final ISearchIndexService searchIndexService;
  private final IAssistanceService assistanceService;

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param searchIndexService instance of ISearchIndexService
   */
  @Autowired
  public TagService(ISearchIndexService searchIndexService, IAssistanceService assistanceService) {
    this.searchIndexService = searchIndexService;
    this.assistanceService = assistanceService;
  }

  /**
   * Gets all tags an annotation has.
   *
   * @param annotationId Id of the annotation, of which the tags should be returned
   * @return list of the Tags the selected annotation has
   * @throws NoSuchIndexEntryException when there is no annotation with this ID in the search index
   */
  @Override
  public List<String> getTags(String annotationId) throws NoSuchIndexEntryException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationId);
    List<Tag> tagList = annotation.getTags();
    List<String> tagValueList = new ArrayList<>();
    for (Tag tag:tagList) {
      tagValueList.add(tag.getValue());
    }
    return tagValueList;

  }

  /**
   * Adds a tag to an annotation.
   *
   * @param tagValue Tag that should be added to the annotation
   * @param annotationId ID of the annotation that should get the tag
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  @Override
  public void addTag(String tagValue, String annotationId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    Tag tag = new Tag(UUID.randomUUID().toString());
    tag.setValue(tagValue);
    tag.setAnnotationId(annotationId);
    tag.setCreated(Date.from(Instant.now()));
    tag.setModified(Date.from(Instant.now()));
    tag.setCreators(Collections.singletonList(assistanceService.getCurrentUser().getName()));
    searchIndexService.addBody(tag);
  }

  /**
   * Updates a tag to an annotation.
   *
   * @param tagValue Tag that should be added to the annotation
   * @param tagId ID of the tag to be modified
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this id in search index
   */
  @Override
  public void updateTag(String tagValue, String tagId) throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException {
    Tag tag = searchIndexService.getTagById(tagId);
    tag.setValue(tagValue);
    if (!tag.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      tag.addCreator(assistanceService.getCurrentUser().getName());
    }
    tag.setModified(Date.from(Instant.now()));
    searchIndexService.updateBody(tag);
  }

  /**
   * Deletes a tag from an annotation.
   *
   * @param tagId ID of tag that should be deleted
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no tag with this id in search index
   */
  @Override
  public void deleteTag(String tagId)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    searchIndexService.deleteBodyById(tagId);
  }
}
