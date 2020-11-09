package edu.kit.scc.dem.tuhl.mainpage.search;

import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.MatchFilter;
import edu.kit.scc.dem.tuhl.model.page.Page;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.ui.Model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class SearchServiceTest {
  
  @Autowired
  private ISearchService searchService;
  
  @MockBean
  private IFilterService mockedFilterService;
  
  @MockBean
  private ElasticsearchRestTemplate mockedRestTemplate;
  
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
    Mockito.when(mockedRestTemplate.count(Mockito.any(Query.class),
        Mockito.any(IndexCoordinates.class))).thenAnswer(invocation -> resultPagesCount);
    
    String id = "000073cd-c425-4214-9648-b380ff20c61a";
    long created = 1552309842000L;
    String title = "Florenz Laur 72.5";
    String publisher = "SFB 980 - A04";
    int publicationYear = 2019;
    long lastModified = 1552309842000L;
    int noPages = 1;
    
    List<Map<String, Object>> pages = new ArrayList<>();
    Map<String, Object> pageMap = new HashMap<>();
    pageMap.put("id", "3f3bf25b-e0b9-48a9-b344-20630f733f8b");
    pageMap.put("thumbResourceUrl", "http://samplerepo.edu/api/v1/dataresources/3f3bf25b-e0b9-48a9-b344-20630f733f8b/data/076r.thumb.jpg");
    pageMap.put("created", 1552310017000L);
    pageMap.put("resourceUrl", "http://samplerepo.edu/api/v1/dataresources/3f3bf25b" +
        "-e0b9-48a9-b344-20630f733f8b/data/076r.master.jpg");
    pageMap.put("manuscriptId", "000073cd-c425-4214-9648-b380ff20c61a");
    pageMap.put("pageNumber", "076r");
    pageMap.put("resourceType", "IMAGE");
    pages.add(pageMap);
    
    Map<String, Object> hitMap = new HashMap<>();
    hitMap.put("id", id);
    hitMap.put("created", created);
    hitMap.put("title", title);
    hitMap.put("publisher", publisher);
    hitMap.put("publicationYear", publicationYear);
    hitMap.put("lastModified", lastModified);
    hitMap.put("noPages", noPages);
    hitMap.put("hasAlgorithmAnnotations", true);
    hitMap.put("pages", pages);
    
    SearchHit mockedHit = Mockito.mock(SearchHit.class);
    Mockito.when(mockedHit.getSourceAsMap()).thenReturn(hitMap);
    
    SearchHit[] searchHitArray = new SearchHit[1];
    searchHitArray[0] = mockedHit;
    
    SearchHits mockedHits = Mockito.mock(SearchHits.class);
    Mockito.when(mockedHits.getHits()).thenReturn(searchHitArray);
  
    SearchResponse mockedResponse = Mockito.mock(SearchResponse.class);
    Mockito.when(mockedResponse.getHits()).thenReturn(mockedHits);
    
    Mockito.when(mockedRestTemplate.execute(Mockito.any())).thenAnswer(invocation -> {
      Class<?> returnType = invocation.getArgument(0).getClass().getMethod("doWithClient",
          RestHighLevelClient.class).getReturnType();
      
      if (returnType.equals(Boolean.class)) {
        return true;
      } else {
        return mockedResponse;
      }
    });
    
    searchService.setSearchTerm("a search term");
    List<Manuscript> results = searchService.search(1, "id", false);
    assertEquals(resultPagesCount, searchService.getResultPagesCount());
  
    assertEquals(1, results.size());
    Manuscript result = results.get(0);
    assertEquals(id, result.getId());
    assertEquals(created, result.getCreated().getTime());
    assertEquals(title, result.getTitle());
    assertEquals(publisher, result.getPublisher());
    assertEquals(publicationYear, result.getPublicationYear());
    assertEquals(lastModified, result.getLastModified().getTime());
    assertEquals(noPages, result.getNoPages());
    assertTrue(result.hasAlgorithmAnnotations());
    
    assertEquals(1, result.getPages().size());
    Page page = result.getPages().get(0);
    assertEquals("3f3bf25b-e0b9-48a9-b344-20630f733f8b", page.getId());
    assertEquals("http://samplerepo.edu/api/v1/dataresources/" +
        "3f3bf25b-e0b9-48a9-b344-20630f733f8b/data/076r.thumb.jpg", page.getThumbResourceUrl());
    assertEquals(Long.valueOf(1552310017000L), page.getCreated().getTime());
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