package edu.kit.scc.dem.tuhl.editor;

import java.io.IOException;
import java.util.List;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.stereotype.Service;



/**
 * Is responsible for adding and removing tags.
 */
@Service
public interface ITagService {

  /**
   * Gets all tags an annotation has.
   *
   * @param annotationId Id of the annotation, of which the tags should be returned
   * @return list of the Tags the selected annotation has
   * @throws NoSuchIndexEntryException when there is no annotation with this ID in the search index
   */
  List<String> getTags(String annotationId) throws NoSuchIndexEntryException;

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
  void addTag(String tagValue, String annotationId) throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

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
  void updateTag(String tagValue, String tagId) throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException;

  /**
   * Deletes a tag from an annotation.
   *
   * @param tagId ID of tag that should be deleted
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no tag with this id in search index
   */
  void deleteTag(String tagId) throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;
}