package edu.kit.scc.dem.tuhl.editorstub;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;

public interface IEditorStubService {

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
  Annotation addAnnotation(String pageId, Color color, String svgCode, String motivation)
      throws InterruptedException, NoSuchIndexEntryException, IOException;

  /**
   *
   *
   * @param annotationId
   * @param color
   * @param svgCode
   * @param motivation
   * @return
   * @throws NoSuchIndexEntryException
   * @throws InterruptedException
   * @throws IOException
   */
  Annotation updateAnnotation(String annotationId, Color color, String svgCode, String motivation)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  Annotation validateAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  Annotation deleteAnnotation(String annotationId)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  TextCard addTextCard(String annotationId, String title, String value, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException;

  Tag addTag(String annotationId, String title, String value)
      throws InterruptedException, NoSuchIndexEntryException, IOException;

  TextCard updateTextCard(String textCardId, String title, String value, String purpose)
      throws InterruptedException, NoSuchIndexEntryException, IOException;

  Tag updateTag(String tagId, String title, String value)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  TextCard deleteTextCard(String textCardId)
      throws NoSuchIndexEntryException, InterruptedException, IOException;

  Tag deleteTag(String tagId)
      throws InterruptedException, NoSuchIndexEntryException, IOException;

  JSONObject getManuscriptJson(String manuscriptId)
      throws InterruptedException, IOException;

  String getManuscriptXml(String manuscriptId)
      throws IOException, InterruptedException;

  JSONObject getPageJson(String manuscriptId)
      throws InterruptedException, IOException;

  JSONObject getAnnotationJson(String manuscriptId)
      throws InterruptedException, IOException;
}
