package edu.kit.datamanager.takita.mainpage.search;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;
import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.filter.Filter;
import edu.kit.datamanager.takita.model.filter.MatchFilter;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;

//import org.elasticsearch.action.search.SearchResponse;
//import org.elasticsearch.client.RestHighLevelClient;
import edu.kit.datamanager.takita.model.page.TextPage;
import edu.kit.datamanager.takita.model.target.SVGSelector;
import edu.kit.datamanager.takita.model.target.XPathSelector;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.elasticsearch.core.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.core.suggest.response.Suggest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.ui.Model;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@SpringBootTest(classes = SearchService.class)
@TestPropertySource("classpath:application-test.properties")
class SearchServiceTest {
  
  @Autowired
  private ISearchService searchService;
  
  @MockitoBean
  private IFilterService mockedFilterService;
  
  @MockitoBean
  private ElasticsearchOperations mockedOperations;

  @MockitoBean
  private IndexOperations mockedIndexOperations;
  
  @MockitoBean
  private ManuscriptRepository mockedManuscriptRepository;
  
  
  @Test
  void search()  {
    List<Filter> filters = new ArrayList<>();
    Filter matchFilter = new MatchFilter("id");
    List<String> values = new ArrayList<>();
    values.add("12345");
    matchFilter.setValues(values);
    filters.add(matchFilter);
    Mockito.when(mockedFilterService.getCurrentFilters()).thenReturn(filters);
    long resultPagesCount = 1;
    Mockito.when(mockedOperations.count(Mockito.any(Query.class),
        Mockito.any(IndexCoordinates.class))).thenAnswer(invocation -> resultPagesCount);
    
    String id = "000073cd-c425-4214-9648-b380ff20c61a";
    //long created = 1552309842000L;
    String title = "Florenz Laur 72.5";
    String publisher = "SFB 980 - A04";
    int publicationYear = 2019;
    //long lastModified = 1552309842000L;
    int noPages = 1;

    Manuscript searchHit = new Manuscript(id, Instant.parse("2019-04-11T14:13:45.000Z"), title, publisher, publicationYear);
    searchHit.setLastModified(Instant.parse("2019-04-11T14:13:45.000Z"));
    searchHit.setNoPages(noPages);
    searchHit.setHasAlgorithmAnnotations(true);

    Page imagePage = new ImagePage("3f3bf25b-e0b9-48a9-b344-20630f733f8b", ResourceType.IMAGE, "076r", Instant.parse("2019-04-11T14:13:45.000Z"), "http://samplerepo.edu/api/v1/dataresources/3f3bf25b" +
    "-e0b9-48a9-b344-20630f733f8b/data/076r.master.jpg", "http://samplerepo.edu/api/v1/dataresources/3f3bf25b-e0b9-48a9-b344-20630f733f8b/data/076r.thumb.jpg");
    imagePage.setManuscriptId(id);
    List<Page> pageList = new ArrayList<>();
    pageList.add(imagePage);
    searchHit.setPages(pageList);

    //TODO: mocks unsafe, improve when search is updated
    Mockito.when(mockedOperations.indexOps(Manuscript.class)).thenReturn(mockedIndexOperations);
    Mockito.when(mockedIndexOperations.exists()).thenReturn(true);

    SearchHit<Manuscript> mockedManuscriptHit = Mockito.mock(SearchHit.class);
    Mockito.when(mockedManuscriptHit.getContent()).thenReturn(searchHit);
    List<SearchHit<Manuscript>> mockedManuscriptList = new ArrayList<>();
    mockedManuscriptList.add(mockedManuscriptHit);

    SearchHits<Manuscript> mockedManuscriptHits = Mockito.mock(SearchHits.class);
    Mockito.when(mockedManuscriptHits.getSearchHits()).thenReturn(mockedManuscriptList);

    Mockito.when(mockedOperations.search(Mockito.any(Query.class), any(Class.class))).thenReturn(mockedManuscriptHits);
    
    searchService.setSearchTerm("a search term");
    List<Manuscript> results = searchService.search(1, "id", false);
    assertEquals(resultPagesCount, searchService.getResultPagesCount());
  
    assertEquals(1, results.size());
    Manuscript result = results.get(0);
    assertEquals(id, result.getId());
    assertEquals(Instant.parse("2019-04-11T14:13:45.000Z"), result.getCreated());
    assertEquals(title, result.getTitle());
    assertEquals(publisher, result.getPublisher());
    assertEquals(publicationYear, result.getPublicationYear());
    assertEquals(Instant.parse("2019-04-11T14:13:45.000Z"), result.getLastModified());
    assertEquals(noPages, result.getNoPages());
    assertTrue(result.hasAlgorithmAnnotations());
    
    assertEquals(1, result.getPages().size());
    Page page = result.getPages().get(0);
    assertEquals("3f3bf25b-e0b9-48a9-b344-20630f733f8b", page.getId());
    assertEquals("http://samplerepo.edu/api/v1/dataresources/" +
        "3f3bf25b-e0b9-48a9-b344-20630f733f8b/data/076r.thumb.jpg", ((ImagePage) page).getThumbResourceUrl());
    assertEquals(Instant.parse("2019-04-11T14:13:45.000Z"), page.getCreated());
    assertEquals("http://samplerepo.edu/api/v1/dataresources/" +
        "3f3bf25b-e0b9-48a9-b344-20630f733f8b/data/076r.master.jpg", page.getResourceUrl());
    assertEquals(result.getId(), page.getManuscriptId());
    assertEquals("076r", page.getPageNumber());
    assertEquals("IMAGE", page.getResourceType().toString());
  }
  
  @Test
  void updateModel() {
    Model mockedModel = Mockito.mock(Model.class);
    String searchTerm = "a search term";
    searchService.setSearchTerm(searchTerm);
    
    Mockito.when(mockedModel.addAttribute(eq("numberOfPages"), Mockito.anyLong()))
        .thenAnswer(invocation -> {
          assertEquals(1, (Long) invocation.getArgument(1));
          return mockedModel;
        });
    Mockito.when(mockedModel.addAttribute(eq("searchTerm"), Mockito.anyString()))
        .thenAnswer(invocation -> {
          assertEquals(searchTerm, invocation.getArgument(1));
          return mockedModel;
        });
    Mockito.when(mockedModel.addAttribute(eq("noResults"), Mockito.anyInt()))
        .thenAnswer(invocation -> {
          assertEquals(searchService.getPageSize(), (Integer) invocation.getArgument(1));
          return mockedModel;
        });
  
    searchService.updateModel(mockedModel);
  }

  private SearchHits<Manuscript> setUpMockedSearchHits() throws JSONException {

    String svgSelectorName = AnnotationStoreStrings.SVG_SELECTOR.getName();
    String svgCode = "<svg:svg>...</svg:svg>";
    String textQuoteSelectorName = AnnotationStoreStrings.TEXTQUOTE_SELECTOR.getName();
    String exact = "exact";
    String prefix = "prefix";
    String suffix = "suffix";
    String xPathSelectorName = AnnotationStoreStrings.XPATH_SELECTOR.getName();
    String xPath = "id(\"w.1\")";

    // create first page (ImagePage) and corresponding annotation
    List<String> creators = Arrays.asList("Creator1", "Creator2");
    JSONArray selectors = new JSONArray(String.format("[{'type': '%s', 'value': '%s'}]",
            svgSelectorName, svgCode));
    Annotation annotation1 = new Annotation(
            "page1",
            creators,
            Instant.parse("2019-03-11T14:13:45Z"),
            Instant.parse("2019-03-11T14:13:45Z"),
            "http://example.org/doc1",
            selectors,
            "describing",
            "via");
    annotation1.setId("annoId1");
    Tag tag1 = new Tag(
            "tag1",
            "anno1",
            creators,
            Instant.parse("2019-03-11T14:13:45Z"),
            Instant.parse("2019-03-11T14:13:45Z"),
            "source1",
            "subject1",
            "title1",
            "value1"
    );
    Tag tag2 = new Tag(
            "tag2",
            "anno1",
            creators,
            Instant.parse("2019-03-11T14:13:45Z"),
            Instant.parse("2019-03-11T14:13:45Z"),
            "source2",
            "subject2",
            "title2",
            "value2"
    );
    annotation1.addTag(tag1);
    annotation1.addTag(tag2);
    ImagePage page1 = new ImagePage(
            "page1",
            ResourceType.IMAGE,
            "076v",
            Instant.parse("2019-03-11T14:13:38Z"), "", "");
    page1.addAnnotation(annotation1);

    // create second page (TextPage) and corresponding annotation
    List<String> creator = List.of("Creator1");
    JSONArray selectors2 = new JSONArray(String.format("[{'type': '%s', 'value': '%s'}, {'type': '%s', 'exact': '%s', 'prefix': '%s', 'suffix': '%s'}]",
            xPathSelectorName, xPath, textQuoteSelectorName, exact, prefix, suffix));
    Annotation annotation2 = new Annotation(
            "page2",
            creator,
            Instant.parse("2019-03-11T14:13:45Z"),
            Instant.parse("2019-03-11T14:13:45Z"),
            "http://example.org/doc1",
            selectors2,
            "describing",
            "via");
    annotation2.setId("annoId2");
    TextCard textCard = new TextCard(
            "textCard2",
            "anno1",
            creators,
            Instant.parse("2019-03-11T14:13:45Z"),
            Instant.parse("2019-03-11T14:13:45Z"),
            "source",
            "subject",
            "title",
            "value",
            "describing"
    );
    annotation2.addTextCard(textCard);
    TextPage page2 = new TextPage(
            "page2",
            ResourceType.TEXT,
            "076r",
            Instant.parse("2019-03-11T14:13:37Z"), "");
    page2.addAnnotation(annotation2);

    // create manuscript and add annotations
    Manuscript manuscript = new Manuscript(
            "000073cd-c425-4214-9648-b380ff20c61a",
            Instant.parse("2019-03-11T14:13:45Z"),
            "Vatikan Vat Gr 247",
            "SFB 980 - A04",
            2019);
    List<Page> pagesManuscript1 = new ArrayList<>();
    pagesManuscript1.add(page1);
    pagesManuscript1.add(page2);
    manuscript.setPages(pagesManuscript1);
    return new SearchHits<Manuscript>() {
      @Override
      public AggregationsContainer<?> getAggregations() {
        return null;
      }

      @Override
      public float getMaxScore() {
        return 0;
      }

      /**
       * @return
       */
      @Override
      public Duration getExecutionDuration() {
        return null;
      }

      @Override
      public SearchHit<Manuscript> getSearchHit(int index) {
        return null;
      }

      @Override
      public List<SearchHit<Manuscript>> getSearchHits() {
        SearchHit<Manuscript> searchHit = new SearchHit<Manuscript>(
                null,
                null,
                null,
                1,
                null,
                null,
                null,
                null,
                null,
                null,
                manuscript);
        return List.of(searchHit);
      }

      @Override
      public long getTotalHits() {
        return 0;
      }

      @Override
      public TotalHitsRelation getTotalHitsRelation() {
        return null;
      }

      @Override
      public Suggest getSuggest() {
        return null;
      }

      @Override
      public String getPointInTimeId() {
        return "";
      }

      /**
       * @return
       */
      @Override
      public SearchShardStatistics getSearchShardStatistics() {
        return null;
      }
    };
  }

  @Test
  public void testQueryAllAnnotations() throws JSONException {
    SearchHits<Manuscript> searchHits = setUpMockedSearchHits();
    // mock the call to elasticsearchOperations.search() to return the mocked objects build previously.
    // elasticsearchOperations.search() is called by searchService.queryAllAnnotations().
    Mockito.when(mockedOperations.search(any(Query.class), eq(Manuscript.class))).thenReturn(searchHits);
    List<Annotation> actualAnnotations = searchService.queryAllAnnotations();
    // expected values can be found in the objects created by setUpMockedSearchHits()
    assertEquals(2, actualAnnotations.size());

    Annotation actualAnnotation1 = actualAnnotations.get(0);
    assertEquals("annoId1", actualAnnotation1.getId());
    assertTrue(actualAnnotation1.getCreators().contains("Creator1"));
    assertTrue(actualAnnotation1.getCreators().contains("Creator2"));
    assertEquals(Instant.parse("2019-03-11T14:13:45Z"), actualAnnotation1.getModified());
    assertEquals(Instant.parse("2019-03-11T14:13:45Z"), actualAnnotation1.getCreated());
    assertEquals("Vatikan Vat Gr 247", actualAnnotation1.getManuscriptTitle());
    assertEquals(2, actualAnnotation1.getTags().size());
    assertEquals(0, actualAnnotation1.getTextCards().size());
    assertEquals("value1", actualAnnotation1.getTags().get(0).getValue());
    assertEquals("value2", actualAnnotation1.getTags().get(1).getValue());
    assertEquals("source1", actualAnnotation1.getTags().get(0).getSource());
    assertEquals("source2", actualAnnotation1.getTags().get(1).getSource());
    assertEquals("<svg:svg>...</svg:svg>", ((SVGSelector) actualAnnotation1.getTargets().getFirst().getSelector()).getValue());
    assertEquals("page1", actualAnnotation1.getPageId());

    Annotation actualAnnotation2 = actualAnnotations.get(1);
    assertEquals("annoId2", actualAnnotation2.getId());
    assertTrue(actualAnnotation2.getCreators().contains("Creator1"));
    assertFalse(actualAnnotation2.getCreators().contains("Creator2"));
    assertEquals(Instant.parse("2019-03-11T14:13:45Z"), actualAnnotation2.getModified());
    assertEquals(Instant.parse("2019-03-11T14:13:45Z"), actualAnnotation2.getCreated());
    assertEquals("Vatikan Vat Gr 247", actualAnnotation2.getManuscriptTitle());
    assertEquals(0, actualAnnotation2.getTags().size());
    assertEquals(1, actualAnnotation2.getTextCards().size());
    assertEquals("value", actualAnnotation2.getTextCards().getFirst().getValue());
    assertEquals("source", actualAnnotation2.getTextCards().getFirst().getSource());
    assertEquals("id(\"w.1\")", ((XPathSelector) actualAnnotation2.getTargets().getFirst().getSelector()).getValue());
    assertEquals("page2", actualAnnotation2.getPageId());
  }
}