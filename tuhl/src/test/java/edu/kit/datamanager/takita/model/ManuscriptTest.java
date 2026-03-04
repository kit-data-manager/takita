package edu.kit.datamanager.takita.model;

import edu.kit.datamanager.takita.dataaccess.utils.XmlUtilities;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.text.ParseException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ManuscriptTest {

  //private DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
  private Manuscript testManuscript;

  @BeforeEach
  void init() throws ParseException {
    testManuscript = new Manuscript("1", Instant.parse("2019-07-04T07:03:03Z"), "myManuscript", "Leo", 2000);
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

    ImagePage page1 = new ImagePage("123", ResourceType.IMAGE, "1", Instant.parse("2019-07-04T07:03:03Z"), "", "");
    List<Annotation> annotations1 = new ArrayList<>();
    Annotation annotation1 = new Annotation();
    annotation1.setIsAlgorithmAnnotation(false);
    annotations1.add(annotation1);
    page1.setAnnotations(annotations1);
    pages.add(page1);

    ImagePage page2 = new ImagePage("234", ResourceType.IMAGE, "2", Instant.parse("2019-07-04T07:03:03Z"), "", "");
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

  @Test
  public void testSetAndGetDescription() {
    Manuscript manuscript = new Manuscript("1", Instant.parse("2019-07-04T07:03:03Z"), "myManuscript", "Name", 2000);
    manuscript.setDescription("Description");
    assertEquals("Description", manuscript.getDescription());
  }

  @Test
  public void testTEIAuthorFunctions() {
    Manuscript manuscript = new Manuscript("1", Instant.parse("2019-07-04T07:03:03Z"), "myManuscript", "Name", 2000);

    List<String> authorList = new ArrayList<String>();
    authorList.add("Author1");
    manuscript.setTeiAuthor(authorList);
    assertEquals("Author1", manuscript.getAuthorsAsString());

    authorList.add("Author2");
    manuscript.setTeiAuthor(authorList);
    assertEquals("Author1, Author2", manuscript.getAuthorsAsString());

    authorList.add("Author3");
    manuscript.setTeiAuthor(authorList);
    assertEquals("Author1, Author2, Author3", manuscript.getAuthorsAsString());
    assertEquals(3, manuscript.getTeiAuthor().size());
  }

  @Test
  public void testTEITitleFunctions() {
    Manuscript manuscript = new Manuscript("1", Instant.parse("2019-07-04T07:03:03Z"), "myManuscript", "Name", 2000);

    List<TeiTitle> titleList = new ArrayList<TeiTitle>();
    titleList.add(new TeiTitle("Title1", null, null, "en"));
    manuscript.setTeiTitle(titleList);
    assertEquals("Title1", manuscript.getDefaultTitlesAsString());

    titleList.add(new TeiTitle("Title2", null, null, "en"));
    manuscript.setTeiTitle(titleList);
    assertEquals("Title1 (Title2)", manuscript.getDefaultTitlesAsString());

    titleList.add(new TeiTitle("Title3", null, null, "en"));
    manuscript.setTeiTitle(titleList);
    assertEquals(3, manuscript.getTeiTitle().size());
    assertEquals("Title1 (Title2; Title3)", manuscript.getDefaultTitlesAsString());
    assertEquals(3, manuscript.getTeiTitle().size());
  }
}