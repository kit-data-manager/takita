package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.Motivation;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

/**
 * Implements IEditorStubService, is responsible for handling requests to the SearchIndexService.
 */
@Service
@SessionScope
public class EditorStubService implements IEditorStubService {

  private final IAssistanceService assistanceService;
  private final ISearchIndexService searchIndexService;

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param assistanceService instance of IAssistanceService
   * @param searchIndexService instance of ISearchIndexService
   */
  @Autowired
  public EditorStubService(IAssistanceService assistanceService,
                           ISearchIndexService searchIndexService) {
    this.assistanceService = assistanceService;
    this.searchIndexService = searchIndexService;
  }

  /**
   * Adds an annotation to the search index and the database.
   *
   * @param pageId ID of the page on which the annotation is located
   * @param color color of the annotation
   * @param svgCode svg code of the shape of the annotation
   * @param motivation motivation of the annotation
   * @return the added annotation
   * @throws InterruptedException when the http request to database is interrupted
   * @throws NoSuchIndexEntryException when there is no such page in the index
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Annotation addAnnotation(String pageId, String color, String svgCode, String motivation)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    Annotation newAnnotation = new Annotation();
    newAnnotation.setPageId(pageId);
    newAnnotation.setCreators(Collections.singletonList(
        assistanceService.getCurrentUser().getName()));
    newAnnotation.setCreated(Date.from(Instant.now()));
    newAnnotation.setModified(Date.from(Instant.now()));

    if (color != null) {
      newAnnotation.setColor(stringToColor(color));
    } else {
      newAnnotation.setColor(Color.DEFAULT);
    }

    if (svgCode != null && !svgCode.trim().equals("")) {
      newAnnotation.setSvgCode(svgCode);
    }

    if (motivation != null && stringToMotivation(motivation) != null) {
      newAnnotation.setMotivation(stringToMotivation(motivation));
    }

    try {
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
   * Gets the text cards for an annotation from the searchIndexService.
   *
   * @param annotationId ID of the annotation for the text cards
   * @return list of text cards
   * @throws NoSuchIndexEntryException when there is no annotation like this in the index
   */
  @Override
  public List<TextCard> getTextCardsForAnnotation(String annotationId) throws NoSuchIndexEntryException {
    return searchIndexService.getAnnotationById(annotationId).getTextCards();
  }

  /**
   * Gets the tags for an annotation from the searchIndexService.
   *
   * @param annotationId ID of the annotation for the tags
   * @return list of tags
   * @throws NoSuchIndexEntryException when there is no annotation like this in the index
   */
  @Override
  public List<Tag> getTagsForAnnotation(String annotationId) throws NoSuchIndexEntryException {
    return searchIndexService.getAnnotationById(annotationId).getTags();
  }

  /**
   * Updates an annotation in the search index and the database.
   *
   * @param annotationId ID of the annotation to update
   * @param color new color of the annotation
   * @param svgCode new svg code of the annotation
   * @param motivation new motivation of the annotation
   * @return updated annotation
   * @throws NoSuchIndexEntryException when there is no such annotation in the index
   * @throws InterruptedException when the http request to database is interrupted
   * @throws IOException when the http request to database was faulty
   */
  @Override
  public Annotation updateAnnotation(String annotationId, String color,
                                     String svgCode, String motivation)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    Annotation updatedAnnotation = searchIndexService.getAnnotationById(annotationId);
    if (!updatedAnnotation.getCreators().contains(assistanceService
        .getCurrentUser().getName())) {
      updatedAnnotation.addCreator(assistanceService.getCurrentUser().getName());
    }
    updatedAnnotation.setModified(Date.from(Instant.now()));

    if (color != null) {
      updatedAnnotation.setColor(stringToColor(color));
    } else {
      updatedAnnotation.setColor(Color.DEFAULT);
    }

    if (svgCode != null && !svgCode.trim().equals("")) {
      updatedAnnotation.setSvgCode(svgCode);
    }

    if (motivation != null && stringToMotivation(motivation) != null) {
      updatedAnnotation.setMotivation(stringToMotivation(motivation));
    }

    try {
      updatedAnnotation = searchIndexService.updateAnnotation(updatedAnnotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }

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
    annotation.setModified(Date.from(Instant.now()));
    annotation.addCreator(assistanceService.getCurrentUser().getName());
    try {
      return searchIndexService.validateAnnotation(annotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
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
  public TextCard addTextCard(String annotationId, String title, String value, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    TextCard newTextCard = new TextCard(UUID.randomUUID().toString());
    newTextCard.setAnnotationId(annotationId);
    newTextCard.setCreators(Collections.singletonList(
        assistanceService.getCurrentUser().getName()));
    newTextCard.setCreated(Date.from(Instant.now()));
    newTextCard.setModified(Date.from(Instant.now()));

    if (title != null && !title.trim().equals("")) {
      newTextCard.setTitle(title);
    }

    if (value != null && !value.trim().equals("")) {
      newTextCard.setValue(value);
    }

    if (purpose != null && stringToMotivation(purpose) != null) {
      newTextCard.setPurpose(stringToMotivation(purpose));
    }
    try {
      searchIndexService.addBody(newTextCard);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return newTextCard;
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
  public Tag addTag(String annotationId, String title, String value)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    Tag newTag = new Tag(UUID.randomUUID().toString());
    newTag.setAnnotationId(annotationId);
    newTag.setCreators(Collections.singletonList(assistanceService.getCurrentUser().getName()));
    newTag.setCreated(Date.from(Instant.now()));
    newTag.setModified(Date.from(Instant.now()));

    if (title != null && !title.trim().equals("")) {
      newTag.setTitle(title);
    }

    if (value != null && !value.trim().equals("")) {
      newTag.setValue(value);
    }

    try {
      searchIndexService.addBody(newTag);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newTag;
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
  public TextCard updateTextCard(String textCardId, String title, String value, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    TextCard updatedTextCard = searchIndexService.getTextCardById(textCardId);
    if (updatedTextCard.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      updatedTextCard.addCreator(assistanceService.getCurrentUser().getName());
    }
    updatedTextCard.setModified(Date.from(Instant.now()));

    if (title != null && !title.trim().equals("")) {
      updatedTextCard.setTitle(title);
    }

    if (value != null && !value.trim().equals("")) {
      updatedTextCard.setValue(value);
    }

    if (purpose != null && stringToMotivation(purpose) != null) {
      updatedTextCard.setPurpose(stringToMotivation(purpose));
    }

    try {
      searchIndexService.updateBody(updatedTextCard);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return searchIndexService.getTextCardById(textCardId);
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
  public Tag updateTag(String tagId, String title, String value)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    Tag updatedTag = searchIndexService.getTagById(tagId);
    if (updatedTag.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      updatedTag.addCreator(assistanceService.getCurrentUser().getName());
    }
    updatedTag.setModified(Date.from(Instant.now()));

    if (title != null && !title.trim().equals("")) {
      updatedTag.setTitle(title);
    }

    if (value != null && !value.trim().equals("")) {
      updatedTag.setValue(value);
    }

    try {
      searchIndexService.updateBody(updatedTag);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return searchIndexService.getTagById(tagId);

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

  private Color stringToColor(String stringColor) {
    if (Color.TEXT_REGION.toString().equals(stringColor)) {
      return Color.TEXT_REGION;
    } else if (Color.IMAGE_REGION.toString().equals(stringColor)) {
      return Color.IMAGE_REGION;
    } else if (Color.PAGE_REGION.toString().equals(stringColor)) {
      return Color.PAGE_REGION;
    } else if (Color.LINE_DRAWING_REGION.toString().equals(stringColor)) {
      return Color.LINE_DRAWING_REGION;
    } else if (Color.GRAPHIC_REGION.toString().equals(stringColor)) {
      return Color.GRAPHIC_REGION;
    } else if (Color.TABLE_REGION.toString().equals(stringColor)) {
      return Color.TABLE_REGION;
    } else if (Color.CHART_REGION.toString().equals(stringColor)) {
      return Color.CHART_REGION;
    } else if (Color.SEPARATOR_REGION.toString().equals(stringColor)) {
      return Color.SEPARATOR_REGION;
    } else if (Color.MATHS_REGION.toString().equals(stringColor)) {
      return Color.MATHS_REGION;
    } else if (Color.CHEM_REGION.toString().equals(stringColor)) {
      return Color.CHEM_REGION;
    } else if (Color.MUSIC_REGION.toString().equals(stringColor)) {
      return Color.MUSIC_REGION;
    } else if (Color.ADVERT_REGION.toString().equals(stringColor)) {
      return Color.ADVERT_REGION;
    } else if (Color.NOISE_REGION.toString().equals(stringColor)) {
      return Color.NOISE_REGION;
    } else if (Color.UNKNOWN_REGION.toString().equals(stringColor)) {
      return Color.UNKNOWN_REGION;
    } else if (Color.CUSTOM_REGION.toString().equals(stringColor)) {
      return Color.CUSTOM_REGION;
    } else {
      return Color.DEFAULT;
    }
  }

  private Motivation stringToMotivation(String stringMotivation) {
    if (Motivation.ASSESSING.getName().equals(stringMotivation)) {
      return Motivation.ASSESSING;
    } else if (Motivation.BOOKMARKING.getName().equals(stringMotivation)) {
      return Motivation.BOOKMARKING;
    } else if (Motivation.CLASSIFYING.getName().equals(stringMotivation)) {
      return Motivation.CLASSIFYING;
    } else if (Motivation.COMMENTING.getName().equals(stringMotivation)) {
      return Motivation.COMMENTING;
    } else if (Motivation.DESCRIBING.getName().equals(stringMotivation)) {
      return Motivation.DESCRIBING;
    } else if (Motivation.EDITING.getName().equals(stringMotivation)) {
      return Motivation.EDITING;
    } else if (Motivation.HIGHLIGHTING.getName().equals(stringMotivation)) {
      return Motivation.HIGHLIGHTING;
    } else if (Motivation.IDENTIFYING.getName().equals(stringMotivation)) {
      return Motivation.IDENTIFYING;
    } else if (Motivation.LINKING.getName().equals(stringMotivation)) {
      return Motivation.LINKING;
    } else if (Motivation.MODERATING.getName().equals(stringMotivation)) {
      return Motivation.MODERATING;
    } else if (Motivation.QUESTIONING.getName().equals(stringMotivation)) {
      return Motivation.QUESTIONING;
    } else if (Motivation.REPLYING.getName().equals(stringMotivation)) {
      return Motivation.REPLYING;
    } else if (Motivation.TAGGING.getName().equals(stringMotivation)) {
      return Motivation.TAGGING;
    }
    return null;
  }
}
