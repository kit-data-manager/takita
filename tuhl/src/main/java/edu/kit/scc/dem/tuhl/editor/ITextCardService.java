package edu.kit.scc.dem.tuhl.editor;


import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import java.io.IOException;
import java.util.List;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.stereotype.Service;


/**
 * Is responsible for adding, updating and removing text cards.
 */
@Service
public interface ITextCardService {

  /**
   * Creates a new text card to an annotation.
   *
   * @param annotationId ID of the annotation, to which the text card should be created
   * @param text text which the text card should contain
   * @param purpose purpose of the new text card
   * @param title title of the new text card
   * @throws NoSuchIndexEntryException when there is no annotation with this ID in the search index
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   */
  void createTextCard(String annotationId, String text, String purpose, String title)
      throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException;

  /**
   * Modifies an existing text card.
   *
   * @param annotationID ID of the annotation the text card contains to
   * @param textCardId ID of the textCard that should be modified
   * @param text text of the text card that was modified
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this ID in the search index
   */
  void modifyTextCard(String annotationID, String textCardId, String text)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Changes the purpose of a text card.
   *
   * @param textCardId Identifier of the text card
   * @param purpose new purpose of the text card
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this ID in the search index
   */
  void modifyPurpose(String textCardId, String purpose) throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Deletes the text card with the ID.
   *
   * @param textCardID Id of the text card that should be deleted
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this ID in the search index
   */
  void deleteTextCard(String textCardID) throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException;

  /**
   * Gets all text cards that contain to an annotation.
   *
   * @param annotationID Id of the annotation of which the text cards should be displayed
   * @return list of text cards belonging to annotation
   * @throws NoSuchIndexEntryException when there is no annotation with this id
   */
  List<TextCard> getTextCards(String annotationID) throws NoSuchIndexEntryException;


}
