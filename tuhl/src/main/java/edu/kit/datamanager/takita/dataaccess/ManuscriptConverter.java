package edu.kit.datamanager.takita.dataaccess;

import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.page.ImagePage;
import edu.kit.datamanager.takita.model.page.Page;
import edu.kit.datamanager.takita.model.page.ResourceType;
import edu.kit.datamanager.takita.model.page.TextPage;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;
import java.io.StringReader;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static edu.kit.datamanager.takita.dataaccess.utils.XmlUtilities.addTeiMetadata;

/**
 * Class responsible for converting manuscripts from JSON to Manuscript Object.
 */
class ManuscriptConverter {

  private static final Logger logger = LoggerFactory.getLogger(ManuscriptConverter.class);
  private IRepositoryAccessService repositoryAccessService;
  private IAnnotationStoreAccessService annotationStoreAccessService;
  private AnnotationConverter annotationConverter;

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param annotationStoreAccessService instance of IAnnotationStoreAccessService
   * @param repositoryAccessService instance of IRepositoryAccessService
   */
  public ManuscriptConverter(IRepositoryAccessService repositoryAccessService,
                             IAnnotationStoreAccessService annotationStoreAccessService) {
    this.repositoryAccessService = repositoryAccessService;
    this.annotationStoreAccessService = annotationStoreAccessService;
    this.annotationConverter = new AnnotationConverter(annotationStoreAccessService, repositoryAccessService);
  }

  public Manuscript buildManuscriptFromJson(
      JSONObject manuscriptJson, Map<String, List<Annotation>> sortedAnnotations)
      throws JSONException, IOException, InterruptedException {

    final String id = manuscriptJson.getString(RepositoryStrings.ID.getName());
    //Sets attributes if they are specified in the json.
    String publisher = null;
    if (manuscriptJson.has(RepositoryStrings.PUBLISHER.getName())) {
      publisher = manuscriptJson.getString(RepositoryStrings.PUBLISHER.getName());
    }
    int publicationYear = -1;
    if (manuscriptJson.has(RepositoryStrings.PUBLICATION_YEAR.getName())) {
      publicationYear = Integer.parseInt(manuscriptJson.getString(
          RepositoryStrings.PUBLICATION_YEAR.getName()));
    }
    String title = null;
    if (manuscriptJson.has(RepositoryStrings.TITLES.getName())) {
      title = manuscriptJson.getJSONArray(RepositoryStrings.TITLES.getName()).getJSONObject(0)
          .getString(RepositoryStrings.VALUE.getName());
    }

    String description = null;
    if (manuscriptJson.has(RepositoryStrings.DESCRIPTIONS.getName())) {
    	JSONArray descriptionsJson = manuscriptJson.getJSONArray(RepositoryStrings.DESCRIPTIONS.getName());
    	if (descriptionsJson.length() > 0) {
    		description = descriptionsJson.getJSONObject(0).getString(RepositoryStrings.DESCRIPTION.getName());
    	}
    }
    
    Instant created = extractInstantFromJsonManuscript(manuscriptJson,
        RepositoryStrings.CREATED.getName());
    Instant modified;
    if (extractInstantFromJsonManuscript(manuscriptJson,
        RepositoryStrings.MODIFIED.getName()) != null) {
      modified = extractInstantFromJsonManuscript(manuscriptJson,
          RepositoryStrings.MODIFIED.getName());
    } else {
      modified = created;
    }

    Manuscript manuscript = new Manuscript(id, created, title, publisher, publicationYear);
    manuscript.setLastModified(modified);
    if (description != null) {
    	manuscript.setDescription(description);
    }

    //Retrieves pages from the page assignment.
    // Adds the pages after their creation to the manuscript.
    JSONArray pageAssignments = repositoryAccessService
        .getPageAssignmentForManuscriptId(manuscript.getId());
    List<Page> pages = new ArrayList<>();
    for (int i = 0; i < pageAssignments.length(); i++) {
      JSONObject assignment = pageAssignments.getJSONObject(i);
      JSONObject pageJson = repositoryAccessService.getPageById(assignment.getString(
          RepositoryStrings.RESOURCE_ID.getName()));
      String pageNumber = assignment.getString(RepositoryStrings.PAGE_ID.getName());
      Page page;
      if (sortedAnnotations == null) {
        page = buildPageFromJson(pageJson, pageNumber, null);
      } else {
        page = buildPageFromJson(pageJson, pageNumber, sortedAnnotations);
      }
      page.setManuscriptId(manuscript.getId());
      pages.add(page);
    }

    manuscript.setPages(pages);

    String teiString = repositoryAccessService.getXmlByManuscriptId(manuscript.getId());
    addTeiMetadata(manuscript, teiString);
    
    return manuscript;
  }

  private Instant extractInstantFromJsonManuscript(JSONObject json, String type) {
    Instant date = null;
    try {
      //Extracts the dates array from the JSON
      if (json.has(RepositoryStrings.DATES.getName())) {
        JSONArray dates = json.getJSONArray(RepositoryStrings.DATES.getName());
        for (int i = 0; i < dates.length(); i++) {
          JSONObject dateJson = dates.getJSONObject(i);
          //Checks for each date if it has the required type & parse the right date to a Instant object
          if (dateJson.has(RepositoryStrings.TYPE.getName())
              && dateJson.getString(RepositoryStrings.TYPE.getName()).equals(type)
              && dateJson.has(RepositoryStrings.VALUE.getName())) {
            String dateString = dateJson.getString((RepositoryStrings.VALUE.getName()));
            date = Instant.parse(dateString);
            //if (dateString.contains(".")) {
            //  date = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_REPO.getDateFormat()
            //      .parse(dateString);
            //} else {
            //  date = TimeStampFormats.TIMESTAMP_FORMAT_REPO.getDateFormat().parse(dateString);
            //}
            break;
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return date;
  }
  
  /**
   * Builds the page with the accompanying annotations from sortedAnnotations.
   * If sortedAnnotations is null the annotations will be obtained by getAnnotationsByPage().
   */
  private Page buildPageFromJson(JSONObject pageJson, String pageNumber,
                                 Map<String, List<Annotation>> sortedAnnotations)
      throws JSONException, IOException, InterruptedException {
    String id = pageJson.getString(RepositoryStrings.ID.getName());

    Instant created = extractInstantFromJsonManuscript(pageJson, RepositoryStrings.CREATED.getName());
    Instant modified = extractInstantFromJsonManuscript(pageJson, RepositoryStrings.MODIFIED.getName());

    //Create the Page object depending on the resource type.
    Page page;
    String resourceTypeString = pageJson.getJSONObject(RepositoryStrings.RESOURCE_TYPE.getName())
        .getString(RepositoryStrings.TYPE_GENERAL.getName());

    if (resourceTypeString.equals(RepositoryStrings.IMAGE.getName())) {
      // URL to image of Page
      String resourceUrl = repositoryAccessService.getBaseUrl() + repositoryAccessService.getStaticPath() + id
          + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.MASTER_JPG;
      String thumbResourceUrl = repositoryAccessService.getBaseUrl() + repositoryAccessService.getStaticPath()
          + id + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.THUMB_JPG;

      ImagePage imagePage = new ImagePage(id, ResourceType.IMAGE, pageNumber, created, resourceUrl, thumbResourceUrl);
 
      if (sortedAnnotations == null) {
        imagePage.setAnnotations(getAnnotationsByPage(imagePage));
      } else {
        imagePage.setAnnotations(sortedAnnotations.get(imagePage.getId()));
      }

      page = imagePage;
    } else if (resourceTypeString.equals(RepositoryStrings.TEXT.getName())) {

      // Here comes the URL to the resource of the page
      // just a copy of the image code from above and added "RepositoryAccessService.FILE_EXTENSION_XML"
      // and using a TextPage object instead of ImagePage
      String resourceUrl = repositoryAccessService.getBaseUrl() + repositoryAccessService.getStaticPath() + id
              + RepositoryAccessService.DATA_PATH + pageNumber + RepositoryAccessService.FILE_EXTENSION_XML;

      TextPage textPage = new TextPage(id, ResourceType.TEXT, pageNumber, created, resourceUrl);
      if (sortedAnnotations == null) {
          textPage.setAnnotations(getAnnotationsByPage(textPage));
        } else {
          textPage.setAnnotations(sortedAnnotations.get(textPage.getId()));
        }

      page = textPage;
    } else {
      throw new IllegalStateException("Unexpected value: " + resourceTypeString);
    }

    page.setLastModified(modified);

    return page;
  }

  /*
   * Gets all annotations for a page.
   */
  private List<Annotation> getAnnotationsByPage(Page page)
      throws InterruptedException, JSONException, IOException {
    List<JSONObject> jsonAnnotations =
        annotationStoreAccessService.getAnnotationsByPageId(page.getId(), page.getPageNumber());
    List<Annotation> annotations = new ArrayList<>();

    for (JSONObject annotation : jsonAnnotations) {
      try {
          annotations.add(annotationConverter.buildAnnotationFromJson(annotation));
      } catch (Exception e) {
          logger.info("Couldn't add annotation" + annotation.getString("id"));
      }
    }

    //remove de interpretatione annotations to which there is a corresponding validated annotation
    List<String> canonicalIds = new ArrayList<>();
    for (Annotation annotation : annotations) {
      if (annotation.getCanonical() != null) {
        canonicalIds.add(annotation.getCanonical());
      }
    }
    List<Annotation> redundantAnnotations = new ArrayList<>();
    for (Annotation annotation : annotations) {
      if (canonicalIds.contains(annotation.getId())) {
        redundantAnnotations.add(annotation);
      }
    }
    for (Annotation redundantAnno : redundantAnnotations) {
      annotations.remove(redundantAnno);
    }

    return annotations;
  }
}
