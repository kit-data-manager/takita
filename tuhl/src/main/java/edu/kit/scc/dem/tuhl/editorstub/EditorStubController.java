package edu.kit.scc.dem.tuhl.editorstub;

import org.springframework.stereotype.Controller;

@Controller
public class EditorStubController {

  private IEditorStubService editorStubService;

  public EditorStubController(IEditorStubService editorStubService) {
    this.editorStubService = editorStubService;
  }

  /*
  Needs: pageId
  Can get: color, svgCode, motivation
   */
  public String addAnnotation() {
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get: color, svgCode, motivation
   */
  public String updateAnnotation() {
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get:
   */
  public String validateAnnotation() {
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get:
   */
  public String deleteAnnotation() {
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get: title, value, purpose
   */
  public String addTextCard(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get: title, value
   */
  public String addTag(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: textcardId
  Can get: title, value, purpose
   */
  public String updateTextCard(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: tagId
  Can get: title, value
   */
  public String updateTag(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: textCardId
  Can get:
   */
  public String deleteTextCard(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: tagId
  Can get:
   */
  public String deleteTag(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: manuId
  Can get:
   */
  public String getManuscriptJson(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: manuId
  Can get:
   */
  public String getManuscriptXml(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: pageId
  Can get:
   */
  public String getPageJson(){
    throw new AssertionError("Not implemented yet");
  }

  /*
  Needs: annoId
  Can get:
   */
  public String getAnnotationJson(){
    throw new AssertionError("Not implemented yet");
  }
}
