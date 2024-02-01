package edu.kit.scc.dem.tuhl.model;

import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ManuscriptTest {

  private DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
  private Manuscript testManuscript;

  @BeforeEach
  void init() throws ParseException {
    testManuscript = new Manuscript("1", dateFormat.parse("2019-07-04T07:03:03Z"), "myManuscript", "Leo", 2000);
  }

  @Test
  void setPages() throws ParseException {
    testManuscript.setPages(initPages());
    assertTrue(testManuscript.hasAlgorithmAnnotations());
  }

  @Test
  void hasAlgorithmAnnotations() {
  }

  private List<Page> initPages() throws ParseException {

    List<Page> pages = new ArrayList<>();

    ImagePage page1 = new ImagePage("123", ResourceType.IMAGE, "1", dateFormat.parse("2019-07-04T07:03:03Z"), "", "");
    List<Annotation> annotations1 = new ArrayList<>();
    Annotation annotation1 = new Annotation();
    annotation1.setIsAlgorithmAnnotation(false);
    annotations1.add(annotation1);
    page1.setAnnotations(annotations1);
    pages.add(page1);

    ImagePage page2 = new ImagePage("234", ResourceType.IMAGE, "2", dateFormat.parse("2019-07-04T07:03:03Z"), "", "");
    List<Annotation> annotations2 = new ArrayList<>();
    Annotation annotation2 = new Annotation();
    annotation2.setIsAlgorithmAnnotation(false);
    annotations2.add(annotation2);
    Annotation annotation3 = new Annotation();
    annotation3.setIsAlgorithmAnnotation(true);
    annotations2.add(annotation3);
    page2.setAnnotations(annotations2);
    pages.add(page2);

    return pages;
  }
}