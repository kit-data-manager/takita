package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.MatchFilter;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;

//import org.elasticsearch.action.search.SearchResponse;
//import org.elasticsearch.client.RestHighLevelClient;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.ui.Model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;

@SpringBootTest(classes = SearchService.class)
class SearchServiceTest {
  
  @Autowired
  private ISearchService searchService;
  
  @MockBean
  private IFilterService mockedFilterService;
  
  @MockBean
  private ElasticsearchOperations mockedOperations;

  @MockBean
  private IndexOperations mockedIndexOperations;
  
  @MockBean
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
        "3f3bf25b-e0b9-48a9-b344-20630f733f8b/data/076r.thumb.jpg", page.getThumbResourceUrl());
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
    
    Mockito.when(mockedModel.addAttribute(Mockito.eq("numberOfPages"), Mockito.anyLong()))
        .thenAnswer(invocation -> {
          assertEquals(1, (Long) invocation.getArgument(1));
          return mockedModel;
        });
    Mockito.when(mockedModel.addAttribute(Mockito.eq("searchTerm"), Mockito.anyString()))
        .thenAnswer(invocation -> {
          assertEquals(searchTerm, invocation.getArgument(1));
          return mockedModel;
        });
    Mockito.when(mockedModel.addAttribute(Mockito.eq("noResults"), Mockito.anyInt()))
        .thenAnswer(invocation -> {
          assertEquals(searchService.getPageSize(), (Integer) invocation.getArgument(1));
          return mockedModel;
        });
  
    searchService.updateModel(mockedModel);
  }
}