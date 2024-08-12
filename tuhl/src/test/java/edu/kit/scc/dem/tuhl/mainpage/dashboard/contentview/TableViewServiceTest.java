package edu.kit.scc.dem.tuhl.mainpage.dashboard.contentview;

import edu.kit.scc.dem.tuhl.NoSuchIndexEntryException;
import edu.kit.scc.dem.tuhl.assistance.IAssistanceService;
import edu.kit.scc.dem.tuhl.assistance.User;
import edu.kit.scc.dem.tuhl.dataaccess.TimeStampFormats;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchIndexService;
import edu.kit.scc.dem.tuhl.mainpage.search.ISearchService;
import edu.kit.scc.dem.tuhl.model.Manuscript;
import edu.kit.scc.dem.tuhl.model.page.ImagePage;
import edu.kit.scc.dem.tuhl.model.page.Page;
import edu.kit.scc.dem.tuhl.model.page.ResourceType;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ui.Model;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DateFormat;
import java.text.ParseException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TableViewService.class)
class TableViewServiceTest {
  
  @Autowired
  private TableViewService tableViewService;
  
  @MockBean
  private ISearchService mockedSearchService;
  
  @MockBean
  private ISearchIndexService mockedSearchIndexService;
  
  @MockBean
  private IAssistanceService mockedAssistanceService;
  
  @Test
  void getData() throws ParseException, IOException, JSONException, org.json.JSONException {
    Mockito.when(mockedSearchService.getResults()).thenReturn(prepareMockResults());
    
    JSONArray actualJson = tableViewService.getData();
    JSONArray expectedJson = new JSONArray(Files.readString(
            Path.of("src/test/resources/tableViewService/tableData.json")));
    System.out.println(expectedJson.toString());
    System.out.println(actualJson.toString());
    JSONAssert.assertEquals(expectedJson.toString(), actualJson.toString(), false);
  }
  
  @Test
  void setCurrentPage() {
    User mockedUser = Mockito.mock(User.class);
    
    Mockito.doAnswer(invocation -> {
      assertEquals(42, (Integer) invocation.getArgument(0));
      return  null;
    }).when(mockedUser).setCurrentPage(Mockito.anyInt());
    
    Mockito.when(mockedAssistanceService.getCurrentUser()).thenReturn(mockedUser);
    tableViewService.setCurrentPage(42);
    assertEquals(42, tableViewService.getCurrentPage());
  }
  
  @Test
  void getPages() throws ParseException, NoSuchIndexEntryException {
    Manuscript manuscript = prepareMockResults().get(0);
    List<Page> pages = manuscript.getPages();
    
    //mock searchIndexService behaviour
    Mockito.when(mockedSearchIndexService.getManuscriptById(manuscript.getId()))
        .thenReturn(manuscript);
    
    //perform actual test
    assertEquals(tableViewService.getPages(manuscript.getId()), pages);
  }
  
  @Test
  void getFirstPages() throws ParseException, NoSuchIndexEntryException {
    Manuscript manuscript = prepareMockResults().get(0);
    Page page = manuscript.getPages().get(0);
    
    Mockito.when(mockedSearchIndexService.getManuscriptById(manuscript.getId()))
        .thenReturn(manuscript);
    
    assertEquals(tableViewService.getFirstPage(manuscript.getId()), page.getId());
  }
  
  @Test
  void search() throws ParseException {
    List<Manuscript> results = prepareMockResults();
    
    Mockito.when(mockedSearchService.search(tableViewService.getCurrentPage(),
        tableViewService.getSortField(),
        tableViewService.isSortAscending()))
        .thenReturn(results);
    
    assertEquals(tableViewService.search(), results);
  }
  
  @Test
  void updateModel() throws ParseException {
    List<Manuscript> results = prepareMockResults();
    Mockito.when(mockedSearchService.getResults()).thenReturn(results);
    
    Model mockedModel = Mockito.mock(Model.class);
    Mockito.when(mockedModel.addAttribute(Mockito.eq("results"), Mockito.any(List.class)))
        .thenAnswer(invocation -> {
          assertEquals(tableViewService.getResults(), invocation.getArgument(1));
          return mockedModel;
        });
    Mockito.when(mockedModel.addAttribute(Mockito.eq("sortField"), Mockito.anyString()))
        .thenAnswer(invocation -> {
          assertEquals(tableViewService.getSortField(), invocation.getArgument(1));
          return mockedModel;
        });
    Mockito.when(mockedModel.addAttribute(Mockito.eq("order"), Mockito.anyString()))
        .thenAnswer(invocation -> {
          assertEquals(tableViewService.isSortAscending() ? "asc" : "desc", invocation.getArgument(1));
          return mockedModel;
        });
    Mockito.when(mockedModel.addAttribute(Mockito.eq("currentPage"), Mockito.anyInt()))
        .thenAnswer(invocation -> {
          assertEquals(tableViewService.getCurrentPage(), (Integer) invocation.getArgument(1));
          return mockedModel;
        });
    
    tableViewService.updateModel(mockedModel);
    
    //Vary data to get into other cases
    tableViewService.setSortAscending(true);
    tableViewService.setSortField("title");
    tableViewService.updateModel(mockedModel);
  }
  
  List<Manuscript> prepareMockResults() throws ParseException {
    DateFormat dateFormat = TimeStampFormats.TIMESTAMP_FORMAT_REPO.getDateFormat();
    ImagePage page1 = new ImagePage(
        "5172f6cb-78c6-403d-b6eb-64d7738c76aa", 
        ResourceType.IMAGE,
        "076v",
        Instant.parse("2019-03-11T14:13:38Z"), "", "");
  
    ImagePage page2 = new ImagePage(
        "3f3bf25b-e0b9-48a9-b344-20630f733f8b", 
        ResourceType.IMAGE,
        "076r",
        Instant.parse("2019-03-11T14:13:37Z"), "", "");
  
    ImagePage page3 = new ImagePage(
        "f68e307b-c41b-412a-a2e2-60418fbbef27", 
        ResourceType.IMAGE,
        "63r",
        Instant.parse("2019-03-11T14:10:39Z"), "", "");
  
    Manuscript manuscript1 = new Manuscript(
        "000073cd-c425-4214-9648-b380ff20c61a",
        Instant.parse("2019-03-11T14:13:45Z"),
        "Vatikan Vat Gr 247",
        "SFB 980 - A04",
        2019);
    List<Page> pagesManuscript1 = new ArrayList<>();
    pagesManuscript1.add(page1);
    pagesManuscript1.add(page2);
    pagesManuscript1.add(page3);
    manuscript1.setPages(pagesManuscript1);
  
    Manuscript manuscript2 = new Manuscript(
        "0d5aa650-2f1e-4dd3-8eed-66a94771ca7c",
        Instant.parse("2019-03-11T14:10:42Z"),
        "Florenz Laur 72.5",
        "SFB 980 - A04",
        2019);
    manuscript2.setLastModified(Instant.parse("2019-03-11T14:10:42Z"));
  
    List<Manuscript> results = new ArrayList<>();
    results.add(manuscript1);
    results.add(manuscript2);
    
    return results;
  }
  
  @Test
  void setNumberOfResults() {
    Mockito.doAnswer(invocation -> {
      assertEquals(42, (Integer) invocation.getArgument(0));
      return null;
    }).when(mockedSearchService).setPageSize(42);
    tableViewService.setNumberOfResults(42);
  }
  
  @Test
  void getNumberOfResultsPages() {
    Mockito.when(mockedSearchService.getResultPagesCount()).thenReturn((long) 1337);
    assertEquals(1337, tableViewService.getNumberOfResultsPages());
  }
}