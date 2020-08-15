package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Service
@SessionScope
public class EditorStubService implements IEditorStubService{

  private final IAssistanceService assistanceService;
  private final ISearchIndexService searchIndexService;

  @Autowired
  public EditorStubService(IAssistanceService assistanceService, ISearchIndexService searchIndexService) {
    this.assistanceService = assistanceService;
    this.searchIndexService = searchIndexService;
  }

  @Override
  public Annotation addAnnotation(String pageId, Color color, String svgCode, String motivation)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    Annotation newAnnotation = new Annotation();
    newAnnotation.setPageId(pageId);
    newAnnotation.setCreators(Collections.singletonList(assistanceService.getCurrentUser().getName()));
    newAnnotation.setCreated(Date.from(Instant.now()));
    newAnnotation.setModified(Date.from(Instant.now()));

    if (color != null) {
      newAnnotation.setColor(color);
    } else {
      newAnnotation.setColor(Color.DEFAULT);
    }

    if (svgCode != null && svgCode.trim() != "") {
      newAnnotation.setSvgCode(svgCode);
    }

    if (motivation != null && motivation.trim() != "") {
      newAnnotation.setMotivation(motivation);
    }

    try {
      searchIndexService.addAnnotation(newAnnotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newAnnotation;
  }

  @Override
  public Annotation updateAnnotation(String annotationId, Color color, String svgCode, String motivation)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    Annotation updatedAnnotation = searchIndexService.getAnnotationById(annotationId);
    if (updatedAnnotation.getCreators().contains(assistanceService.getCurrentUser().getName())) {
      updatedAnnotation.addCreator(assistanceService.getCurrentUser().getName());
    }
    updatedAnnotation.setModified(Date.from(Instant.now()));

    updatedAnnotation.setColor(Objects.requireNonNullElse(color, Color.DEFAULT));

    if (svgCode != null && !svgCode.trim().equals("")) {
      updatedAnnotation.setSvgCode(svgCode);
    }

    if (motivation != null && !motivation.trim().equals("")) {
      updatedAnnotation.setMotivation(motivation);
    }

    try {
    searchIndexService.updateAnnotation(updatedAnnotation);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return updatedAnnotation;
  }

  @Override
  public Annotation validateAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException {
    try {
      return searchIndexService.validateAnnotation(searchIndexService.getAnnotationById(annotationId));
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

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

  @Override
  public TextCard addTextCard(String annotationId, String title, String value, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException {
    TextCard newTextCard = new TextCard(UUID.randomUUID().toString());
    newTextCard.setAnnotationId(annotationId);
    newTextCard.setCreators(Collections.singletonList(assistanceService.getCurrentUser().getName()));
    newTextCard.setCreated(Date.from(Instant.now()));
    newTextCard.setModified(Date.from(Instant.now()));

    if (title != null && !title.trim().equals("")) {
      newTextCard.setTitle(title);
    }

    if (value != null && !value.trim().equals("")) {
      newTextCard.setValue(value);
    }

    if (purpose != null && !purpose.trim().equals("")) {
      newTextCard.setPurpose(purpose);
    }
    try {
    searchIndexService.addBody(newTextCard);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return newTextCard;
  }

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

    if (purpose != null && !purpose.trim().equals("")) {
      updatedTextCard.setPurpose(purpose);
    }

    try {
    searchIndexService.updateBody(updatedTextCard);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return searchIndexService.getTextCardById(textCardId);
  }

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

  @Override
  public JSONObject getManuscriptJson(String manuscriptId) throws InterruptedException, IOException {
    try {
      return searchIndexService.getRawManuscriptJson(manuscriptId);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  public String getManuscriptXml(String manuscriptId) throws IOException, InterruptedException {
    return searchIndexService.getRawManuscriptXml(manuscriptId);
  }

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
}
