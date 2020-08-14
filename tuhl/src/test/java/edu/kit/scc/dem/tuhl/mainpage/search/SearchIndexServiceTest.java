package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.dataaccess.IAccessService;
import edu.kit.scc.dem.tuhl.dataaccess.IAnnotationStoreAccessService;
import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.mockito.internal.util.reflection.FieldSetter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SearchIndexServiceTest {
  @Autowired
  public ISearchIndexService searchIndexService;

  @Mock
  public IAccessService mockedAccessService;

  @Mock
  public ManuscriptRepository mockedManuscriptRepository;

  @BeforeEach
  void init() throws NoSuchFieldException {
    MockitoAnnotations.initMocks(this);

    //Insert mock HttpRequestHelper into private field of the AccessService instance
    FieldSetter.setField(searchIndexService,
        searchIndexService
            .getClass()
            .getDeclaredField("manuscriptRepository"),
        mockedManuscriptRepository);
    FieldSetter.setField(searchIndexService,
        searchIndexService.getClass()
            .getDeclaredField("accessService"),
        mockedAccessService);
  }

  @Test
  void buildIndex() {
  }

  @Test
  void updateIndex() {
  }

  @Test
  void addAnnotation() {
  }

  @Test
  void getAnnotationById() {
  }

  @Test
  void updateAnnotation() {
  }

  @Test
  void validateAnnotation() {
  }

  @Test
  void deleteAnnotationById() {
  }

  @Test
  void addBody() {
  }

  @Test
  void getTextCardById() {
  }

  @Test
  void getTagById() {
  }

  @Test
  void updateBody() {
  }

  @Test
  void deleteBodyById() {
  }

  @Test
  void getManuscriptById() {
  }

  @Test
  void getPageById() {
  }

  @Test
  void getPageResourceByPageId() {
  }

  @Test
  void getPageThumbByPageId() {
  }

  @Test
  void getRawManuscriptJson() {
  }

  @Test
  void getRawPageJson() {
  }

  @Test
  void getRawAnnotationJson() {
  }

  @Test
  void getRawManuscriptXml() {
  }

  private List<Manuscript> initManuscriptList() throws ParseException {
    DateFormat dateFormatMillis = IAnnotationStoreAccessService.TIMESTAMP_FORMAT_MILLIS;
    List<Manuscript> manuscripts = new ArrayList<>();

    Manuscript manuscript1 = new Manuscript(
        "000073cd-c425-4214-9648-b380ff20c61a",
        dateFormatMillis.parse("2019-03-11T14:13:45.000Z"),
        "Vatikan Vat Gr 247", "SFB 980 - A04", 2019);
    manuscript1.getPages().add(new ImagePage("b2f8e261-a6ca-4ae5-ab91-5fb18d64d5b6",
        "1", dateFormatMillis.parse("2019-03-11T14:13:39.000Z"), "", ""));
    Annotation anno1 = new Annotation();
    anno1.setId("11");
    List<TextCard> textCards1 = new ArrayList<>();
    TextCard t1 = new TextCard("11111");
    textCards1.add(t1);
    anno1.setTextCards(textCards1);
    ((ImagePage) manuscript1.getPages().get(0)).addAnnotation(anno1);
    manuscript1.getPages().add(new ImagePage("b2f8e261-a6ca-4ae5-ab91-5fb18d64d5b7",
        "2", dateFormatMillis.parse("2019-03-11T14:13:40.000Z"), "", ""));

    Manuscript manuscript2 = new Manuscript(
        "000b458c-67d5-445e-8274-73e8e4582952",
        dateFormatMillis.parse("2019-04-11T14:13:45.000Z"),
        "Vatikan Vat Gr 666", "SFB 980 - A04", 2019);
    manuscript2.getPages().add(new ImagePage("5c17cfb4-151b-4f5d-9679-242a2434edaf",
        "1", dateFormatMillis.parse("2019-04-11T14:13:39.000Z"), "", ""));
    Annotation anno2 = new Annotation();
    anno1.setId("22");
    List<Tag> tags1 = new ArrayList<>();
    Tag tag1 = new Tag("22222");
    tags1.add(tag1);
    anno2.setTags(tags1);
    ((ImagePage) manuscript2.getPages().get(0)).addAnnotation(anno2);
    Annotation anno3 = new Annotation();
    anno3.setId("33");
    List<Tag> tags3 = new ArrayList<>();
    Tag tag2 = new Tag("33333");
    tags3.add(tag2);
    anno3.setTags(tags3);
    List<TextCard> textCards3 = new ArrayList<>();
    TextCard t3 = new TextCard("33334");
    textCards3.add(t3);
    anno3.setTextCards(textCards3);
    ((ImagePage) manuscript2.getPages().get(0)).addAnnotation(anno3);

    manuscripts.add(manuscript1);
    manuscripts.add(manuscript2);
    return manuscripts;
  }
}