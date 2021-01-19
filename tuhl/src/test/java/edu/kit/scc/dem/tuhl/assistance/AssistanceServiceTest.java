package edu.kit.scc.dem.tuhl.assistance;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import edu.kit.scc.dem.tuhl.mainpage.IMainPageService;
import edu.kit.scc.dem.tuhl.mainpage.search.IFilterService;
import edu.kit.scc.dem.tuhl.model.filter.Filter;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfiguration;
import edu.kit.scc.dem.tuhl.model.filter.FilterConfigurationHolder;
import edu.kit.scc.dem.tuhl.model.filter.MatchFilter;
import edu.kit.scc.dem.tuhl.model.filter.RangeFilter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.mockito.internal.verification.VerificationModeFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ui.Model;

@SpringBootTest
class AssistanceServiceTest {
  
  @Autowired
  IAssistanceService assistanceService;
  
  @MockBean
  private UserRepository mockedUserRepository;
  
  @MockBean
  private IFilterService mockedFilterService;
  
  @MockBean
  private IMainPageService mockedMainPageService;
  
  @Test
  void getExistingUserByPseudonym() {
    String testPseudonym = "Darth Vader";
    User mockedUser = mock(User.class);
    when(mockedUserRepository.findById(testPseudonym)).thenReturn(Optional.of(mockedUser));
    assertEquals(mockedUser, assistanceService.getUserByPseudonym(testPseudonym));
  }
  
  @Test
  void getNewUserByPseudonym() {
    String testPseudonym = "Darth Vader";
    when(mockedUserRepository.findById(testPseudonym)).thenReturn(Optional.empty());
    
    when(mockedUserRepository.save(any(User.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    
    assertEquals(testPseudonym, assistanceService.getUserByPseudonym(testPseudonym).getName());
  }
  
  @Test
  void changeUser() {
    String testPseudonym = "Darth Vader";
    Filter matchFilter = new MatchFilter("id");
    Filter rangeFilter = new RangeFilter("publicationYear");
    List<Filter> filters = new ArrayList<>();
    filters.add(matchFilter);
    filters.add(rangeFilter);
    
    User mockedUser = mock(User.class);
    when(mockedUserRepository.findById(testPseudonym)).thenReturn(Optional.of(mockedUser));
    when(mockedUser.getFilters()).thenReturn(filters);
    
    doAnswer(invocation -> {
      FilterConfigurationHolder configurationHolder = invocation.getArgument(0);
      for (FilterConfiguration configuration : configurationHolder.getFilterConfigs()) {
        boolean contained = false;
        for (Filter filter : filters) {
          if (filter.getField().equals(configuration.getField())) {
            contained = true;
            break;
          }
        }
        assertTrue(contained);
      }
      return null;
    }).when(mockedFilterService).applyConfiguration(Mockito.any(FilterConfigurationHolder.class));
    
    doAnswer(invocation -> {
      List<String> fields = invocation.getArgument(0);
      for (String field : fields) {
        boolean contained = false;
        for (Filter filter : filters) {
          if (filter.getField().equals(field)) {
            contained = true;
            break;
          }
        }
        assertTrue(contained);
      }
      return null;
    }).when(mockedFilterService).addToCurrentFilters(Mockito.anyList());
    
    assistanceService.changeUser(testPseudonym, null);
    
    verify(mockedFilterService).clearCurrentFilters();
  }
  
  @Test
  void toggleCheckThumbs() {
    boolean expected = !assistanceService.getCurrentUser().isCheckThumbs();
    assistanceService.toggleCheckThumbs();
    assertEquals(expected, assistanceService.getCurrentUser().isCheckThumbs());
    verify(mockedUserRepository, VerificationModeFactory.atLeastOnce())
        .save(Mockito.any(User.class));
  }
  
  @Test
  void setTableConfig() {
    assistanceService.changeUser("Darth Vader", null);
    String columnConfig = "columnConfig";
    assistanceService.setTableConfig(columnConfig, null);
    assertEquals(columnConfig, assistanceService.getCurrentUser().getColumns());
    verify(mockedUserRepository, VerificationModeFactory.atLeastOnce())
        .save(Mockito.any(User.class));
  }
  
  @Test
  void setTablePage() {
    int expected = 20;
    assistanceService.setTablePage(expected, null);
    assertEquals(expected, assistanceService.getCurrentUser().getPageSize());
    verify(mockedUserRepository, VerificationModeFactory.atLeastOnce())
        .save(Mockito.any(User.class));
  }
  
  @Test
  void setTableSort() {
    String expected = "id";
    assistanceService.setTableSort(expected, null);
    assertEquals(expected, assistanceService.getCurrentUser().getSort());
    verify(mockedUserRepository, VerificationModeFactory.atLeastOnce())
        .save(Mockito.any(User.class));
  }
  
  @Test
  void setLanguage() {
    String expectedLang = "en";
    assistanceService.setLanguage(expectedLang, null);
    assertEquals(expectedLang, assistanceService.getCurrentUser().getLanguage());
    assertEquals(expectedLang, assistanceService.getLang());
    verify(mockedUserRepository, VerificationModeFactory.atLeastOnce())
        .save(Mockito.any(User.class));
  }
  
  @Test
  void updateModel() {
    Model mockedModel = mock(Model.class);
    when(mockedModel.addAttribute(anyString(), any(User.class))).thenAnswer(invocation -> {
      assertEquals("user", invocation.getArgument(0));
      assertEquals(assistanceService.getCurrentUser(), invocation.getArgument(1));
      return mockedModel;
    });
    assistanceService.updateModel(mockedModel);
  }
}