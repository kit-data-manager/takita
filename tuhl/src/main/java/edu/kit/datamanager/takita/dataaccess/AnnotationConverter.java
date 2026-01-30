package edu.kit.datamanager.takita.dataaccess;

import edu.kit.datamanager.takita.model.Annotation;
import edu.kit.datamanager.takita.model.Color;
import edu.kit.datamanager.takita.model.body.Body;
import edu.kit.datamanager.takita.model.body.Tag;
import edu.kit.datamanager.takita.model.body.TextCard;
import edu.kit.datamanager.takita.model.target.SVGSelector;
import edu.kit.datamanager.takita.model.target.Target;
import edu.kit.datamanager.takita.model.target.TextQuoteSelector;
import edu.kit.datamanager.takita.model.target.XPathSelector;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AnnotationConverter {

  private static final Logger logger = LoggerFactory.getLogger(AnnotationConverter.class);
  private IAnnotationStoreAccessService annotationStoreAccessService;
  private IRepositoryAccessService repositoryAccessService;

  private static final String ALGORITHM_CREATOR_PREFIX = "urn:uuid";
  private static final String SOURCE_PATTERN_STRING = "/dataresources/(.*?)/data/";

  /**
   * Constructor, initializes instances of used interfaces.
   *
   * @param annotationStoreAccessService instance of IAnnotationStoreAccessService
   * @param repositoryAccessService instance of IRepositoryAccessService
   */
  public AnnotationConverter(IAnnotationStoreAccessService annotationStoreAccessService,
                             IRepositoryAccessService repositoryAccessService) {
    this.annotationStoreAccessService = annotationStoreAccessService;
    this.repositoryAccessService = repositoryAccessService;
  }

  /**
   * Converts the JSON of an annotation to an annotation.
   *
   * @param jsonAnnotation annotation in JSON form
   * @return annotation as anno object
   * @throws JSONException if an error occurs while parsing json
   */
  public Annotation buildAnnotationFromJson(JSONObject jsonAnnotation) throws JSONException {
    Annotation annotation = new Annotation();
    
    //set ID
    if (jsonAnnotation.has(AnnotationStoreStrings.ID.getName())) {
      annotation.setId(jsonAnnotation.getString(AnnotationStoreStrings.ID.getName()));
    }

    //set canonical
    if (jsonAnnotation.has(AnnotationStoreStrings.CANONICAL.getName())) {
      annotation.setCanonical(jsonAnnotation.getString(AnnotationStoreStrings.CANONICAL.getName()));
    }

    //set etag
    if (jsonAnnotation.has(AnnotationStoreStrings.ETAG.getName())) {
      annotation.setEtag(jsonAnnotation.getString(AnnotationStoreStrings.ETAG.getName()));
    }

    //set color
    if (jsonAnnotation.has(AnnotationStoreStrings.BODY.getName())) {
      buildColor(jsonAnnotation, annotation);
    }

    //set created date
    if (jsonAnnotation.has(AnnotationStoreStrings.CREATED.getName())) {
      annotation.setCreated(extractDateFromJsonAnnotation(jsonAnnotation,
          AnnotationStoreStrings.CREATED.getName()));
    }

    //set modified date
    if (jsonAnnotation.has(AnnotationStoreStrings.MODIFIED.getName())) {
      annotation.setModified(extractDateFromJsonAnnotation(jsonAnnotation,
          AnnotationStoreStrings.MODIFIED.getName()));
    }

    //set creators
    if (jsonAnnotation.has(AnnotationStoreStrings.CREATOR.getName())) {
      annotation.setCreators(buildCreatorList(jsonAnnotation, annotation));
    }

    //set motivation
    if (jsonAnnotation.has(AnnotationStoreStrings.MOTIVATION.getName()) 
        && jsonAnnotation
            .getString(AnnotationStoreStrings.MOTIVATION.getName()) != null) {

      annotation.setMotivation(jsonAnnotation
            .getString(AnnotationStoreStrings.MOTIVATION.getName()));
    }
    
    //set targets
    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName())) {
      buildTargetsFromJson(jsonAnnotation, annotation);
    }
    
    //else {
    //  svgString = "invalid";
    //}
        
    
    //set via
    if (jsonAnnotation.has(AnnotationStoreStrings.VIA.getName())) {
      annotation.setVia(jsonAnnotation.getString(AnnotationStoreStrings.VIA.getName()));
    }

    //set bodies
    if (jsonAnnotation.has(AnnotationStoreStrings.BODY.getName()) && annotation.getId() != null) {
      buildBodiesFromJson(jsonAnnotation, annotation);
    }

    //set page ID - either from target-source or target-id
    // after multitargetchange, it needs to be checked if the target is a multi target, i.e. is a JSONArray
    // this check needs to be done only once i guess
    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName())){
        if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.TARGET.getName()))){
        	JSONArray array = new JSONArray(jsonAnnotation.getString(AnnotationStoreStrings.TARGET.getName()));
        	if (array.getJSONObject(0).has(AnnotationStoreStrings.SOURCE.getName()) || 
        			array.getJSONObject(0).has(AnnotationStoreStrings.ID.getName()) ) {
        		buildPageId(jsonAnnotation, annotation);
        	}
        } else {
            if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName()) && (jsonAnnotation.getJSONObject(
                    AnnotationStoreStrings.TARGET.getName()).has(AnnotationStoreStrings.SOURCE.getName()) ||
                    jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName()).has(AnnotationStoreStrings.ID.getName()))) {
                  buildPageId(jsonAnnotation, annotation);
                }
        }
    }

    return annotation;
  }

  private void buildColor(JSONObject jsonAnnotation, Annotation annotation) throws JSONException {
    //if annotation has multiple bodies
    if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.BODY.getName()))) {
      JSONArray bodies = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
      for (int i = 0; i < bodies.length(); i++) {
        if (bodies.getJSONObject(i).has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
          annotation.setColor(Color.stringToColor(bodies.getJSONObject(i).getString(
              AnnotationStoreStrings.DC_SUBJECT.getName())));
        }
        // non CRC980 annotations use a different annotation model, which stores the
        // color relevant information in the value of the tagging (toRoll) or classifying (CRC1475) body
        // TODO: CUSTOMISE which body is used to retrieve the color
        // TODO: improve the color storage
        if (bodies.getJSONObject(i).has(AnnotationStoreStrings.PURPOSE.getName())) {
        	if (bodies.getJSONObject(i).getString(AnnotationStoreStrings.PURPOSE.getName()).equals("tagging")) {
        		if (bodies.getJSONObject(i).has(AnnotationStoreStrings.VALUE.getName())) {
        			annotation.setColor(Color.stringToColor(bodies.getJSONObject(i).getString(
        	                AnnotationStoreStrings.VALUE.getName())));
        			//logger.info("Color of the annotation: " + Color.stringToColor(bodies.getJSONObject(i).getString(AnnotationStoreStrings.VALUE.getName())).getName());
            	}
        	}
        }
      }
      //if annotation has single body
    } else {
      if (jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName())
          .has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
            annotation.setColor(Color.stringToColor(jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName()).getString(
            AnnotationStoreStrings.DC_SUBJECT.getName())));
      }
      // non CRC980 annotations use a different annotation model, which stores the
      // color relevant information in the value of the tagging (toRoll) or classifying (CRC1475) body
      // TODO: CUSTOMISE which body is used to retrieve the color
      // TODO: improve the color storage
      JSONObject body = jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName());
      if (body.has(AnnotationStoreStrings.PURPOSE.getName())) {
      	if (body.getString(AnnotationStoreStrings.PURPOSE.getName()).equals("tagging")) {
      		if (body.has(AnnotationStoreStrings.VALUE.getName())) {
      			annotation.setColor(Color.stringToColor(body.getString(
      	                AnnotationStoreStrings.VALUE.getName())));
          	}
      	}
      }
    }
  }

  /*
   * Gets page ID from link to image on which annotation lies.
   */
  private void buildPageId(JSONObject jsonAnnotation, Annotation annotation) throws JSONException {
    Pattern pattern = Pattern.compile(SOURCE_PATTERN_STRING);
    Matcher matcher;
    // only works for targets url stored in either source or id
    //System.out.print(jsonAnnotation);
    // after multitargetchange, it needs to be checked if the target is a multi target, i.e. is a JSONArray
    if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.TARGET.getName()))){
    	JSONArray array = new JSONArray(jsonAnnotation.getString(AnnotationStoreStrings.TARGET.getName()));
    	if (array.getJSONObject(0).has(AnnotationStoreStrings.SOURCE.getName())) {
    		matcher = pattern.matcher(array.getJSONObject(0).
    				getString(AnnotationStoreStrings.SOURCE.getName()));
    	} else {
    		matcher = pattern.matcher(array.getJSONObject(0).
    				getString(AnnotationStoreStrings.ID.getName()));
    	}
    	
        if (matcher.find()) {
            annotation.setPageId(matcher.group(1));
        }
    } else {
        if (jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName()).has(AnnotationStoreStrings.SOURCE.getName())) {
            matcher = pattern.matcher(jsonAnnotation.getJSONObject(
            AnnotationStoreStrings.TARGET.getName())
            .getString(AnnotationStoreStrings.SOURCE.getName()));
        } else {
            matcher = pattern.matcher(jsonAnnotation.getJSONObject(
            AnnotationStoreStrings.TARGET.getName())
            .getString(AnnotationStoreStrings.ID.getName()));
        }
         
        if (matcher.find()) {
          annotation.setPageId(matcher.group(1));
        }
    }

  }

  /*
   * Builds the creator list for annotation from JSON creator String/JSONObject/JSONArray
   */
  private List<String> buildCreatorList(JSONObject jsonAnnotation, Annotation annotation)
      throws JSONException {
    List<String> creatorList = new ArrayList<>();
    
    //TODO: If array of creators, all creators of type person are added
    if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName()))) {
      JSONArray creators = jsonAnnotation.getJSONArray(AnnotationStoreStrings.CREATOR.getName());

      for (int i = 0; i < creators.length(); i++) {
        if (creators.getJSONObject(i).getString(AnnotationStoreStrings.TYPE.getName()).equals(
            AnnotationStoreStrings.PERSON.getName())) {
          creatorList.add(creators.getJSONObject(i).getString(
              AnnotationStoreStrings.NAME.getName()));
        }
      }

    } else if (jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName())
        .startsWith(ALGORITHM_CREATOR_PREFIX)) {
      creatorList.add(jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName()));
      annotation.setIsAlgorithmAnnotation(true);
    } else {
      //If creator type is a person
      if (jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
          .getString(AnnotationStoreStrings.TYPE.getName()).equals(
              AnnotationStoreStrings.PERSON.getName())) {
        if(jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName()).has(AnnotationStoreStrings.NAME.getName())) {
          creatorList.add(jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
          .getString(AnnotationStoreStrings.NAME.getName()));
        } else {
          if(jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName()).has(AnnotationStoreStrings.NICK.getName())) {
            creatorList.add(jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
            .getString(AnnotationStoreStrings.NICK.getName()));
          }
        }

      }
    }
    return creatorList;
  }

  /*
   * Builds target objects from JSON annotation.
   */
  private void buildTargetsFromJson(JSONObject jsonAnnotation, Annotation annotation)
      throws JSONException {
	  
	  List<Target> targets = new ArrayList<>();
	  JSONArray targetsJson = new JSONArray();
	  // extract target(s) json
	  if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.TARGET.getName()))) {
		  targetsJson = jsonAnnotation.getJSONArray(AnnotationStoreStrings.TARGET.getName());
	  } else {
		  targetsJson.put(jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName()));
	  }
	  
	  // create target(s)
	  for (int i = 0; i < targetsJson.length(); i++) {
		  String linkToResource = "";
		  JSONObject targetJson = targetsJson.getJSONObject(i);
		  // this is basically the code from above (Set page ID)
		  if (targetJson.has(AnnotationStoreStrings.SOURCE.getName()) 
					||targetJson.has(AnnotationStoreStrings.ID.getName())) {
			  if (targetJson.has(AnnotationStoreStrings.SOURCE.getName())){
				  linkToResource = targetJson.getString(AnnotationStoreStrings.SOURCE.getName());
			  }
			  if (targetJson.has(AnnotationStoreStrings.ID.getName())){
				  linkToResource = targetJson.getString(AnnotationStoreStrings.ID.getName());
			  }
		  }
		  Target target;

          if (targetJson.has(AnnotationStoreStrings.SELECTOR.getName())){
              target  = new Target(linkToResource, targetJson.getJSONObject(AnnotationStoreStrings.SELECTOR.getName()));
          } else {
              target = new Target(linkToResource, null);
          }

		  targets.add(target);
	  }
	  
	  annotation.setTargets(targets);
  }
  
  /*
   * Builds body objects from JSON annotation if JSON for bodies is JSONArray.
   */
    private void buildBodiesFromJson(JSONObject jsonAnnotation, Annotation annotation)
            throws JSONException {
        //ensure body json is json array
        JSONArray bodyJson = new JSONArray();
        if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.BODY.getName()))) {
            bodyJson = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
        } else {
            bodyJson.put(jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName()));
        }

        List<Tag> tags = new ArrayList<>();
        List<TextCard> textCards = new ArrayList<>();
        for (int i = 0; i < bodyJson.length(); i++) {
            //extract body json
            JSONObject thisJson = bodyJson.getJSONObject(i);
            createBody(thisJson, tags, textCards, annotation);

        }
        annotation.setTags(tags);
        annotation.setTextCards(textCards);
    }

    /*
     * Creates tags/text cards for body and adds them to list.
     */
    private void createBody(JSONObject jsonBody, List<Tag> tags, List<TextCard> textCards, Annotation annotation)
            throws JSONException {
        Body thisBody;
        String annotationId = annotation.getId();
        List<String> creators = jsonBody.has(AnnotationStoreStrings.CREATOR.getName()) ?
                buildCreatorList(jsonBody, annotation) : new ArrayList<>();
        Instant created = jsonBody.has(AnnotationStoreStrings.CREATED.getName()) ?
                extractDateFromJsonAnnotation(jsonBody, AnnotationStoreStrings.CREATED.getName()) : null;
        Instant modified = jsonBody.has(AnnotationStoreStrings.MODIFIED.getName()) ?
                extractDateFromJsonAnnotation(jsonBody, AnnotationStoreStrings.MODIFIED.getName()) : null;
        String title = jsonBody.has(AnnotationStoreStrings.DC_TITLE.getName()) ?
                jsonBody.getString(AnnotationStoreStrings.DC_TITLE.getName()) : null;
        String subject = jsonBody.has(AnnotationStoreStrings.DC_SUBJECT.getName()) ?
                jsonBody.getString(AnnotationStoreStrings.DC_SUBJECT.getName()) : null;
        String value = jsonBody.has(AnnotationStoreStrings.VALUE.getName()) ?
                jsonBody.getString(AnnotationStoreStrings.VALUE.getName()) : null;
        String source = jsonBody.has(AnnotationStoreStrings.SOURCE.getName()) ?
                jsonBody.getString(AnnotationStoreStrings.SOURCE.getName()) : null;
        String purpose = jsonBody.has(AnnotationStoreStrings.PURPOSE.getName()) ?
                jsonBody.getString(AnnotationStoreStrings.PURPOSE.getName()) : null;

        if (purpose != null) {
            if (purpose.equals(AnnotationStoreStrings.TAGGING.getName())) {
                Tag tag = new Tag(UUID.randomUUID().toString(), annotationId, creators,
                        created, modified, source, subject, title, value);
                tag.setFullJson(jsonBody);
                tags.add(tag);
            } else {
                TextCard textCard = new TextCard(UUID.randomUUID().toString(), annotationId, creators,
                        created, modified, source, subject, title, value, purpose);
                textCard.setFullJson(jsonBody);
                textCards.add(textCard);
            }
        } else {
            TextCard textCard = new TextCard(UUID.randomUUID().toString(), annotationId, creators,
                    created, modified, source, subject, title, value, purpose);
            textCard.setFullJson(jsonBody);
            textCards.add(textCard);
        }

    }

  /**
   * Builds a JSONObject from an existing annotation.
   * @param pageNumber number of the page the annotation is on
   * @param annotation annotation to convert to json
   * @return Annotation as JSONObject conforming to annotation store norm
   * @throws JSONException if an error occurs while parsing json
   * @throws IOException if an error occurs while sending or receiving http request
   * @throws InterruptedException if the http request is interrupted
   */
  public JSONObject buildJsonFromAnnotation(Annotation annotation, String pageNumber)
      throws JSONException, IOException, InterruptedException {
    JSONObject jsonAnnotation;

    //extract jsonAnnotation
    if (annotation.getId() != null && !annotation.getId().trim().equals("")) {
      jsonAnnotation = annotationStoreAccessService.getAnnotationById(annotation.getId());
      jsonAnnotation.put(AnnotationStoreStrings.ID.getName(), annotation.getId());
    } else {
      jsonAnnotation = new JSONObject();
      jsonAnnotation.put(AnnotationStoreStrings.CONTEXT.getName(),
          AnnotationStoreStrings.URL_JSONID.getName());
      jsonAnnotation.put(AnnotationStoreStrings.TYPE.getName(),
          AnnotationStoreStrings.ANNOTATION.getName());
    }

    //put etag
    if (jsonAnnotation.has(AnnotationStoreStrings.ETAG.getName())) {
      jsonAnnotation.remove(AnnotationStoreStrings.ETAG.getName());
    }

    //put created date
    if (annotation.getCreated() != null) {
      jsonAnnotation.put(AnnotationStoreStrings.CREATED.getName(),
          annotation.getCreated().toString());
              //TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat()
              //.format(annotation.getCreated()));
    }
   
    //put creators
    if (!annotation.getCreators().isEmpty()) {
      buildCreator(annotation, jsonAnnotation);
    }

    //put modified date
    if (annotation.getModified() != null) {
      jsonAnnotation.put(AnnotationStoreStrings.MODIFIED.getName(),
              annotation.getModified().toString());
          //TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat()
          //    .format(annotation.getModified()));
    }
   
    //put canonical
    if (annotation.getCanonical() != null && !annotation.getCanonical().equals("")) {
      jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), annotation.getCanonical());
    }

    //put bodies
    if (!(annotation.getTextCards().isEmpty() && annotation.getTags().isEmpty())) {
        // annotation.getTextCards() != null && annotation.getTags() != null
      putBodies(jsonAnnotation, annotation);
    }
  
    //put target
    putTarget(jsonAnnotation, annotation, pageNumber);
    
    //put motivation
    if (annotation.getMotivation() != null) {
      jsonAnnotation.put(AnnotationStoreStrings.MOTIVATION.getName(),
          annotation.getMotivation());
    }
    
    //put via
    if (annotation.getVia() != null && !annotation.getVia().equals("")) {
      jsonAnnotation.put(AnnotationStoreStrings.VIA.getName(), annotation.getVia());
    }
    
    return jsonAnnotation;
  }

  /*
   * Puts bodies and color from annotation in JSONObject form in JSON annotation
   */
  private void putBodies(JSONObject jsonAnnotation, Annotation annotation) throws JSONException {
    if (annotation.getTextCards().size() + annotation.getTags().size() == 1
        && annotation.getColor() == null) {
      jsonAnnotation.put(AnnotationStoreStrings.BODY.getName(), buildJsonFromBody(annotation));
    } else {
      jsonAnnotation.put(AnnotationStoreStrings.BODY.getName(), buildJsonFromBodies(annotation));
      // TODO: the following lines are commented out, because they create a new body when the shape of an annotation
      //	is modified. This needs more investigation. What is the purpose/function of the following code?
      /*if (annotation.getColor() != null) {
        JSONArray bodyArray = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
        boolean hasColor = false;
        for (int i = 0; i < bodyArray.length(); i++) {
          if (bodyArray.getJSONObject(i).has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
            bodyArray.getJSONObject(i).put(AnnotationStoreStrings.DC_SUBJECT.getName(),
                Color.colorToString(annotation.getColor()));
            buildCreator(annotation, bodyArray.getJSONObject(i));
            hasColor = true;
          }
        }
        if (!hasColor && annotation.getColor() != Color.DEFAULT) {
          JSONObject colorBody = new JSONObject();
          colorBody.put(AnnotationStoreStrings.DC_SUBJECT.getName(),
          Color.colorToString(annotation.getColor()));
          buildCreator(annotation, colorBody);
          jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName()).put(colorBody);
        }
      }*/
    }
  }


  
  /* function to check if a string is a valid XPATH
   * 
   * 
   */
  private boolean validateXPATH(String target) {
	  XPath xPath = XPathFactory.newInstance().newXPath();
	  boolean isValid = false;
	  try {
		    xPath.compile(target);
		    isValid = true;
      } catch (Exception e) {
		    e.printStackTrace();
	  } 
	  return isValid;
  }
  /*
   * Puts target JSONObject with svg code and page image resource in JSONObject annotation.
   */
  private void putTarget(JSONObject jsonAnnotation, Annotation annotation, String pageNumber)
      throws JSONException {

	JSONArray targetArray = new JSONArray();
	for (Target target : annotation.getTargets()) {
		// the targets' linkToResource needs to be set, as this is the first time it is present in takita core
		// the targets' linkToResource differs for text and image file regarding their extensions
		String targetType = target.getType();
		switch (targetType) {
			case "TEXT":
				target.setLinkToResource(repositoryAccessService.getBaseUrl()
			            + repositoryAccessService.getStaticPath()
			            + annotation.getPageId() + RepositoryAccessService.DATA_PATH + pageNumber
			            + RepositoryAccessService.FILE_EXTENSION_XML);
				// add the target serialized as WADM to the list
				targetArray.put(target.getWADMSerialization());
				break;
			case "IMAGE":
				target.setLinkToResource(repositoryAccessService.getBaseUrl()
			            + repositoryAccessService.getStaticPath()
			            + annotation.getPageId() + RepositoryAccessService.DATA_PATH + pageNumber
			            + RepositoryAccessService.MASTER_JPG);
				// add the target serialized as WADM to the list
				targetArray.put(target.getWADMSerialization());
				break;
			case "PAGE":
				// TODO: currently only the imageEditor an produce PAGE-annotations, so we
				// assume that the target resource is an image
				target.setLinkToResource(repositoryAccessService.getBaseUrl()
			            + repositoryAccessService.getStaticPath()
			            + annotation.getPageId() + RepositoryAccessService.DATA_PATH + pageNumber
			            + RepositoryAccessService.MASTER_JPG);
				// add the target serialized as WADM to the list
				targetArray.put(target.getWADMSerialization());
				break;
			default:
				// TODO: this should throw an exception
				logger.error("Target is neither an image, a text file nor a page.");
				break;
		}
    }
	// add the targets to the JSON annotation
	jsonAnnotation.put(AnnotationStoreStrings.TARGET.getName(), targetArray);
  }

  /*
   * Builds JSON from annotation bodies if there is only one single body.
   */
  private JSONObject buildJsonFromBody(Annotation annotation) throws JSONException {
    Body thisBody;
    if (annotation.getTextCards().size() == 1) {
      thisBody = annotation.getTextCards().get(0);
    } else {
      thisBody = annotation.getTags().get(0);
    }

    return bodyToJson(thisBody);
  }

  /*
   * Builds JSON from annotation bodies if there is more than one body.
   */
  private JSONArray buildJsonFromBodies(Annotation annotation)
      throws JSONException {
    JSONArray jsonBodies = new JSONArray();
    //logger.error("Number of bodies: " + (annotation.getTags().size() + annotation.getTextCards().size()));
    if (!annotation.getTextCards().isEmpty()) {
      for (Body body : annotation.getTextCards()) {
        jsonBodies.put(bodyToJson(body));
      }
    }
    if (!annotation.getTags().isEmpty()) {
      for (Body body : annotation.getTags()) {
        jsonBodies.put(bodyToJson(body));
      }
    }
    //logger.error("JsonBodies: " + jsonBodies);
    return jsonBodies;
  }

  /*
   * Converts single body object to JSONObject.
   */
  public JSONObject bodyToJson(Body body) throws JSONException {
    JSONObject jsonBody = new JSONObject();
    if (body.getFullJson() != null) {
      jsonBody = body.getFullJson();
    } else {
      body.setFullJson(jsonBody);
    }

    //puts creators
    if (!body.getCreators().isEmpty()) {
      buildCreatorsFromBodies(jsonBody, body);
    }

    //puts created date
    if (body.getCreated() != null) {
      jsonBody.put(AnnotationStoreStrings.CREATED.getName(),
        body.getCreated().toString());
        //TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat().format(body.getCreated()));
    }
    //puts modified date
    if (body.getModified() != null) {
      jsonBody.put(AnnotationStoreStrings.MODIFIED.getName(),
        body.getModified().toString());
        //TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat().format(body.getModified()));
    }
    //puts purpose as Motivation
    if (body.getPurpose() != null) {
      jsonBody.put(AnnotationStoreStrings.PURPOSE.getName(), body.getPurpose());
    }
    //puts value
    if (body.getValue() != null) {
      jsonBody.put(AnnotationStoreStrings.VALUE.getName(), body.getValue());
      jsonBody.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.TEXTUAL_BODY.getName());
    }
    //puts source
    if (body.getSource() != null) {
      jsonBody.put(AnnotationStoreStrings.SOURCE.getName(), body.getSource());
      jsonBody.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.SPECIFIC_RESOURCE.getName());
    }
    //puts title
    if (body.getTitle() != null) {
      jsonBody.put(AnnotationStoreStrings.DC_TITLE.getName(), body.getTitle());
    }
    //puts subject
    if (body.getSubject() != null) {
      jsonBody.put(AnnotationStoreStrings.DC_SUBJECT.getName(), body.getSubject());
    }
    return jsonBody;
  }

  private void buildCreator(Annotation annotation, JSONObject jsonAnnotation) throws JSONException {
    //if that annotation already has existing json
    if (jsonAnnotation.has(AnnotationStoreStrings.CREATOR.getName())) {

      //add new person creators to annotation
      if (!annotation.getIsAlgorithmAnnotation()
          && isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.CREATOR.getName()))) {
        jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(),
            putPersonCreatorsArray(jsonAnnotation, annotation.getCreators()));
      } else {
        //add new other creators to annotation
        jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(),
            putNewCreatorsAsArray(jsonAnnotation, annotation.getCreators()));
      }
    } else {
      //if creators have to be built from scratch
      if (annotation.getCreators().size() > 1) {
        JSONArray creators = new JSONArray();
        for (String thisCreator : annotation.getCreators()) {
          creators.put(putPersonCreator(thisCreator));
        }
        jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(), creators);
      } else {
        jsonAnnotation.put(AnnotationStoreStrings.CREATOR.getName(),
            putPersonCreator(annotation.getCreators().get(0)));
      }
    }
  }

  /*
   * Puts the creators in the JSON if there was a previously existing JSON,
   * the creator object was a JSONArray and it does not contain the ID of an algorithm creator.
   */
  private JSONArray putPersonCreatorsArray(JSONObject jsonAnnotation, List<String> creatorStrings)
      throws JSONException {
    JSONArray creators = jsonAnnotation.getJSONArray(AnnotationStoreStrings.CREATOR.getName());
    boolean containsCreator;
    for (String newCreator : creatorStrings) {
      containsCreator = false;
      for (int i = 0; i < creators.length(); i++) {
        if (creators.getJSONObject(i).getString(AnnotationStoreStrings.NAME.getName())
            .equals(newCreator)) {
          containsCreator = true;
        }
      }
      if (!containsCreator) {
        creators.put(putPersonCreator(newCreator));
      }
    }
    return creators;
  }

  /*
   * Puts the new creators as a JSONArray in case the previously existing creator object
   * was a String or JSONObject. Returns all creators as JSONArray.
   */
  private JSONArray putNewCreatorsAsArray(JSONObject jsonObject, List<String> creatorStrings)
      throws JSONException {
    JSONObject oldCreator;
    if (jsonObject.getString(AnnotationStoreStrings.CREATOR.getName())
        .startsWith(ALGORITHM_CREATOR_PREFIX)) {
      oldCreator = new JSONObject(jsonObject.getString(
          AnnotationStoreStrings.CREATOR.getName()));
    } else {
      oldCreator = jsonObject.getJSONObject(
          AnnotationStoreStrings.CREATOR.getName());
    }
    JSONArray newCreators = new JSONArray();
    newCreators.put(oldCreator);
    for (String newCreator : creatorStrings) {
      if (!oldCreator.getString(AnnotationStoreStrings.NAME.getName()).equals(newCreator)) {
        newCreators.put(putPersonCreator(newCreator));
      }
    }
    return newCreators;
  }

  /*
   * Puts a creator as type person.
   */
  private JSONObject putPersonCreator(String creator) throws JSONException {
    JSONObject person = new JSONObject();
    person.put(AnnotationStoreStrings.TYPE.getName(),
        AnnotationStoreStrings.PERSON.getName());
    person.put(AnnotationStoreStrings.NAME.getName(), creator);
    return person;
  }

  /*
   * Puts the creators as JSONObject, JSONArray or String from the creators of a body object.
   */
  // TODO: give the method a return value, changes fullJson as side effect ATM
  private void buildCreatorsFromBodies(JSONObject jsonBody, Body body)
      throws JSONException {
    //if body already has json and multiple creators
    if (jsonBody.has(AnnotationStoreStrings.CREATOR.getName())
        && isJsonArray(jsonBody.getString(AnnotationStoreStrings.CREATOR.getName()))) {
      putPersonCreatorsArray(jsonBody, body.getCreators());
    } else {
      //if body does not have json or only a single creator
      JSONObject creator = new JSONObject();
      if (jsonBody.has(AnnotationStoreStrings.CREATOR.getName())) {
        creator = jsonBody.getJSONObject(AnnotationStoreStrings.CREATOR.getName());
      }
      JSONArray newCreators = new JSONArray();
      // what happens to software?!
      for (String newCreator : body.getCreators()) {
        if (!creator.has(AnnotationStoreStrings.PERSON.getName())
            || !creator.getString(AnnotationStoreStrings.NAME.getName()).equals(newCreator)) {
          JSONObject person = new JSONObject();
          person.put(AnnotationStoreStrings.TYPE.getName(),
              AnnotationStoreStrings.PERSON.getName());
          person.put(AnnotationStoreStrings.NAME.getName(), newCreator);
          newCreators.put(person);
        }
      }
      //logger.info(Integer.toString(newCreators.length()));
      if (newCreators.length() == 1) {
          jsonBody.put(AnnotationStoreStrings.CREATOR.getName(), newCreators.get(0));
      } else {
          jsonBody.put(AnnotationStoreStrings.CREATOR.getName(), newCreators);
      }
      
    }
  }

  private Instant extractDateFromJsonAnnotation(JSONObject json, String type) {
    Instant date = null;
    try {
      //Extracts the dates from the JSON
      String dateString;
      if (json.has(type)) {
        dateString = json.getString(type);
        date = Instant.parse(dateString);
        
        //Parse the right date to a Date Object.
        //if (dateString.contains(".")) {
        //    isoFormatter = DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss.[SSS][SS][S]XXX");
        //    date = Instant.parse(dateString, isoFormatter);
        //  date = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat().parse(dateString);
        //} else {
        //    isoFormatter = DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ssXXX");
        //    date = LocalDateTime.parse(dateString, isoFormatter);
        //  date = TimeStampFormats.TIMESTAMP_FORMAT_ANNO.getDateFormat().parse(dateString);
        //}
      }
        
    } catch (JSONException e) {
      e.printStackTrace();
    }
    
    return date;
  }

  private boolean isJsonArray(String array) {
    return array.startsWith("[");
  }
}
