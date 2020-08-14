package edu.kit.scc.dem.tuhl.editor;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

/**
 * TextCardService class implements ITextCardService, is responsible for adding, updating and removing text cards.
 */
@Service
@SessionScope
public class TextCardService implements ITextCardService {
  private final ISearchIndexService searchIndexService;
  private final IAssistanceService assistanceService;

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param searchIndexService instance of ISearchIndexService
   * @param assistanceService instance of IAssistanceService
   */
  @Autowired
  public TextCardService(ISearchIndexService searchIndexService,
                         IAssistanceService assistanceService) {
    this.searchIndexService = searchIndexService;
    this.assistanceService = assistanceService;
  }

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
  @Override
  public void createTextCard(String annotationId, String text, String purpose, String title)
      throws NoSuchIndexEntryException, InterruptedException, JSONException, IOException {
    TextCard textCard = new TextCard(UUID.randomUUID().toString());
    textCard.setPurpose(purpose);
    textCard.setAnnotationId(annotationId);
    textCard.setValue(text);
    textCard.setCreated(Date.from(Instant.now()));
    textCard.setCreators(Collections.singletonList(assistanceService.getCurrentUser().getName()));
    textCard.setTitle(title);
    searchIndexService.addBody(textCard);
  }

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
  @Override
  public void modifyTextCard(String annotationID, String textCardId, String text)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    TextCard textCard = searchIndexService.getTextCardById(textCardId);
    textCard.setValue(text);
    searchIndexService.updateBody(textCard);
  }

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
  @Override
  public void modifyPurpose(String textCardId, String purpose)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    TextCard textCard = searchIndexService.getTextCardById(textCardId);
    textCard.setPurpose(purpose);
    searchIndexService.updateBody(textCard);
  }

  /**
   * Deletes the text card with the ID.
   *
   * @param textCardID Id of the text card that should be deleted
   * @throws InterruptedException when saving to database is interrupted
   * @throws JSONException when parsing the tag to JSON throws error
   * @throws IOException when http request to database has errors
   * @throws NoSuchIndexEntryException when there is no annotation with this ID in the search index
   */
  @Override
  public void deleteTextCard(String textCardID)
      throws InterruptedException, JSONException, IOException, NoSuchIndexEntryException {
    searchIndexService.deleteBodyById(textCardID);
  }

  /**
   * Gets all text cards that contain to an annotation.
   *
   * @param annotationID Id of the annotation of which the text cards should be displayed
   * @return list of text cards belonging to annotation
   * @throws NoSuchIndexEntryException when there is no annotation with this id
   */
  @Override
  public List<TextCard> getTextCards(String annotationID) throws NoSuchIndexEntryException {
    Annotation annotation = searchIndexService.getAnnotationById(annotationID);
    return annotation.getTextCards();
  }
}
