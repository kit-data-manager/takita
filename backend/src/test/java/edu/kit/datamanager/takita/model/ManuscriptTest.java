package edu.kit.datamanager.takita.model;

import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.text.ParseException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
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

  @Test
  public void testPersistenceConstructor() {
    String id = "id";
    Instant created = Instant.parse("2019-07-04T07:03:03Z");
    String title = "title";
    String publisher = "publisher";
    int publicationYear = 2000;
    Instant lastModified = Instant.parse("2019-07-04T07:03:03Z");
    int noPages = 100;
    List<Page> pages = new ArrayList<>();

    Manuscript manuscript = new Manuscript(id, created, title, publisher, publicationYear, lastModified, noPages, pages);
    assertEquals(id, manuscript.getId());
    assertEquals(created, manuscript.getCreated());
    assertEquals(title, manuscript.getTitle());
    assertEquals(publisher, manuscript.getPublisher());
    assertEquals(publicationYear, manuscript.getPublicationYear());
    assertEquals(lastModified, manuscript.getLastModified());
    assertEquals(noPages, manuscript.getNoPages());
    assertEquals(pages.size(), manuscript.getPages().size());
  }

  @Test
  public void getCreationDatesAsString() {
    Manuscript manuscript = new Manuscript(
            "id",
            Instant.parse("2019-07-04T07:03:03Z"),
            "title",
            "publisher",
            2000);
    TeiDate date1 = new TeiDate();
    date1.setContent("Before 2012");
    date1.setType("creation");
    TeiDate date2 = new TeiDate();
    date2.setContent("1. December 2012");
    date2.setType("publication");
    TeiDate date3 = new TeiDate();
    date3.setContent("12. December 2012");

    manuscript.setTeiManuscriptCreationDate(Arrays.asList(date1, date2, date3));
    assertEquals("Before 2012 (creation), 1. December 2012 (publication), 12. December 2012", manuscript.getCreationDatesAsString());
  }
}