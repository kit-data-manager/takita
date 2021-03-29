package edu.kit.scc.dem.tuhl.dataaccess;

import edu.kit.scc.dem.tuhl.model.Annotation;
import edu.kit.scc.dem.tuhl.model.Color;
import edu.kit.scc.dem.tuhl.model.Motivation;
import edu.kit.scc.dem.tuhl.model.body.Body;
import edu.kit.scc.dem.tuhl.model.body.Tag;
import edu.kit.scc.dem.tuhl.model.body.TextCard;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class AnnotationConverter {

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
    if (jsonAnnotation.has(AnnotationStoreStrings.MOTIVATION.getName()) && stringToMotivation(
        jsonAnnotation.getString(AnnotationStoreStrings.MOTIVATION.getName())) != null) {
      annotation.setMotivation(stringToMotivation(jsonAnnotation.getString(
          AnnotationStoreStrings.MOTIVATION.getName())));
    }
    
    //set svg code
    String svgString;
    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName())
        && jsonAnnotation
        .getJSONObject(AnnotationStoreStrings.TARGET.getName())
        .has(AnnotationStoreStrings.SELECTOR.getName())
        && jsonAnnotation
        .getJSONObject(AnnotationStoreStrings.TARGET.getName())
        .getJSONObject(AnnotationStoreStrings.SELECTOR.getName())
        .has(AnnotationStoreStrings.TYPE.getName())
        && jsonAnnotation
        .getJSONObject(AnnotationStoreStrings.TARGET.getName())
        .getJSONObject(AnnotationStoreStrings.SELECTOR.getName())
        .getString(AnnotationStoreStrings.TYPE.getName())
        .equals(AnnotationStoreStrings.SVG_SELECTOR.getName())) {

      String fullSvg = jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName())
        .getJSONObject(AnnotationStoreStrings.SELECTOR.getName()).getString(
          AnnotationStoreStrings.VALUE.getName());
      
      if (!fullSvg.contains("</svg>")) {
        svgString = "invalid";
      } else {
        svgString = fullSvg.substring(fullSvg.indexOf('>') + 1, fullSvg.lastIndexOf('<'));
      }
    } else {
      svgString = "invalid";
    }
    annotation.setSvgCode(svgString);
    
    //set via
    if (jsonAnnotation.has(AnnotationStoreStrings.VIA.getName())) {
      annotation.setVia(jsonAnnotation.getString(AnnotationStoreStrings.VIA.getName()));
    }

    //set bodies
    if (jsonAnnotation.has(AnnotationStoreStrings.BODY.getName()) && annotation.getId() != null) {
      buildBodiesFromJson(jsonAnnotation, annotation);
    }

    //set page ID
    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName()) && jsonAnnotation.getJSONObject(
        AnnotationStoreStrings.TARGET.getName()).has(AnnotationStoreStrings.SOURCE.getName())) {
      buildPageId(jsonAnnotation, annotation);
    }

    return annotation;
  }

  private void buildColor(JSONObject jsonAnnotation, Annotation annotation) throws JSONException {
    //if annotation has multiple bodies
    if (isJsonArray(jsonAnnotation.getString(AnnotationStoreStrings.BODY.getName()))) {
      JSONArray bodies = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
      for (int i = 0; i < bodies.length(); i++) {
        if (bodies.getJSONObject(i).has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
          stringToColor(bodies.getJSONObject(i).getString(
              AnnotationStoreStrings.DC_SUBJECT.getName()), annotation);
        }
      }
      //if annotation has single body
    } else {
      if (jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName())
          .has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
        stringToColor(jsonAnnotation.getJSONObject(AnnotationStoreStrings.BODY.getName()).getString(
            AnnotationStoreStrings.DC_SUBJECT.getName()), annotation);
      }
    }
  }

  /*
   * Gets page ID from link to image on which annotation lies.
   */
  private void buildPageId(JSONObject jsonAnnotation, Annotation annotation) throws JSONException {
    Pattern pattern = Pattern.compile(SOURCE_PATTERN_STRING);
    Matcher matcher = pattern.matcher(jsonAnnotation.getJSONObject(
        AnnotationStoreStrings.TARGET.getName())
        .getString(AnnotationStoreStrings.SOURCE.getName()));
    if (matcher.find()) {
      annotation.setPageId(matcher.group(1));
    }
  }

  /*
   * Builds the creator list for annotation from JSON creator String/JSONObject/JSONArray
   */
  private List<String> buildCreatorList(JSONObject jsonAnnotation, Annotation annotation)
      throws JSONException {
    List<String> creatorList = new ArrayList<>();

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
      if (jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
          .getString(AnnotationStoreStrings.TYPE.getName()).equals(
              AnnotationStoreStrings.PERSON.getName())) {
        creatorList.add(jsonAnnotation.getJSONObject(AnnotationStoreStrings.CREATOR.getName())
            .getString(AnnotationStoreStrings.NAME.getName()));
      }
    }
    return creatorList;
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

      //create body
      Body thisBody = createBody(thisJson, tags, textCards);

      //set annotation id
      thisBody.setAnnotationId(annotation.getId());

      //set full json
      thisBody.setFullJson(thisJson);

      //set creators
      if (thisJson.has(AnnotationStoreStrings.CREATOR.getName())) {
        thisBody.setCreators(buildCreatorList(thisJson, annotation));
      }

      //set created date
      if (thisJson.has(AnnotationStoreStrings.CREATED.getName())) {
        thisBody.setCreated(extractDateFromJsonAnnotation(thisJson,
            AnnotationStoreStrings.CREATED.getName()));
      }

      //set modified date
      if (thisJson.has(AnnotationStoreStrings.MODIFIED.getName())) {
        thisBody.setModified(extractDateFromJsonAnnotation(thisJson,
            AnnotationStoreStrings.MODIFIED.getName()));
      }

      //set title
      if (thisJson.has(AnnotationStoreStrings.DC_TITLE.getName())) {
        thisBody.setTitle(thisJson.getString(AnnotationStoreStrings.DC_TITLE.getName()));
      }

      //set value
      if (thisJson.has(AnnotationStoreStrings.VALUE.getName())) {
        thisBody.setValue(thisJson.getString(AnnotationStoreStrings.VALUE.getName()));
      }
    }
    annotation.setTags(tags);
    annotation.setTextCards(textCards);
  }

  /*
   * Creates tags/text cards for body and adds them to list.
   */
  private Body createBody(JSONObject jsonBody, List<Tag> tags, List<TextCard> textCards)
      throws JSONException {
    Body thisBody;
    if (jsonBody.has(AnnotationStoreStrings.PURPOSE.getName()) && jsonBody.getString(
        AnnotationStoreStrings.PURPOSE.getName()).equals(
        AnnotationStoreStrings.TAGGING.getName())) {
      thisBody = new Tag(UUID.randomUUID().toString());
      tags.add((Tag) thisBody);
    } else {
      thisBody = new TextCard(UUID.randomUUID().toString());
      if (jsonBody.has(AnnotationStoreStrings.PURPOSE.getName()) && stringToMotivation(
          jsonBody.getString(AnnotationStoreStrings.PURPOSE.getName())) != null) {
        thisBody.setPurpose(stringToMotivation(jsonBody.getString(
            AnnotationStoreStrings.PURPOSE.getName())));
      }
      textCards.add((TextCard) thisBody);
    }
    return thisBody;
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
          TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat()
              .format(annotation.getCreated()));
    }

    //put creators
    if (!annotation.getCreators().isEmpty()) {
      buildCreator(annotation, jsonAnnotation);
    }

    //put modified date
    if (annotation.getModified() != null) {
      jsonAnnotation.put(AnnotationStoreStrings.MODIFIED.getName(),
          TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat()
              .format(annotation.getModified()));
    }

    //put canonical
    if (annotation.getCanonical() != null && !annotation.getCanonical().equals("")) {
      jsonAnnotation.put(AnnotationStoreStrings.CANONICAL.getName(), annotation.getCanonical());
    }

    //put bodies
    if (annotation.getTextCards() != null && annotation.getTags() != null) {
      putBodies(jsonAnnotation, annotation);
    }

    //put target
    putTarget(jsonAnnotation, annotation, pageNumber);

    //put motivation
    if (annotation.getMotivation() != null) {
      jsonAnnotation.put(AnnotationStoreStrings.MOTIVATION.getName(),
          annotation.getMotivation().getName());
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

      if (annotation.getColor() != null) {
        JSONArray bodyArray = jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName());
        boolean hasColor = false;
        for (int i = 0; i < bodyArray.length(); i++) {
          if (bodyArray.getJSONObject(i).has(AnnotationStoreStrings.DC_SUBJECT.getName())) {
            bodyArray.getJSONObject(i).put(AnnotationStoreStrings.DC_SUBJECT.getName(),
                colorToString(annotation.getColor()));
            buildCreator(annotation, bodyArray.getJSONObject(i));
            hasColor = true;
          }
        }
        if (!hasColor) {
          JSONObject colorBody = new JSONObject();
          colorBody.put(AnnotationStoreStrings.DC_SUBJECT.getName(),
              colorToString(annotation.getColor()));
          buildCreator(annotation, colorBody);
          jsonAnnotation.getJSONArray(AnnotationStoreStrings.BODY.getName()).put(colorBody);
        }
      }
    }
  }

  /*
   * Puts target JSONObject with svg code and page image resource in JSONObject annotation.
   */
  private void putTarget(JSONObject jsonAnnotation, Annotation annotation, String pageNumber)
      throws JSONException {
    JSONObject target = new JSONObject();
    JSONObject selector = new JSONObject();
    if (jsonAnnotation.has(AnnotationStoreStrings.TARGET.getName())) {
      target = jsonAnnotation.getJSONObject(AnnotationStoreStrings.TARGET.getName());
      if (target.has(AnnotationStoreStrings.SELECTOR.getName())) {
        selector = target.getJSONObject(AnnotationStoreStrings.SELECTOR.getName());
      }
    }

    // in form <svg><code></svg>
    if (annotation.getSvgCode() != null && !annotation.getSvgCode().trim().equals("")) {
      selector.put(AnnotationStoreStrings.TYPE.getName(),
          AnnotationStoreStrings.SVG_SELECTOR.getName());
          //TODO
      selector.put(AnnotationStoreStrings.VALUE.getName(), annotation.getSvgCode());
      target.put(AnnotationStoreStrings.SELECTOR.getName(), selector);
    }

    // source is url of page image
    if (annotation.getPageId() != null && !annotation.getPageId().trim().equals("")) {
      target.put(AnnotationStoreStrings.TYPE.getName(),
          AnnotationStoreStrings.SPECIFIC_RESOURCE.getName());
      target.put(AnnotationStoreStrings.SOURCE.getName(), repositoryAccessService.getBaseUrl()
          + repositoryAccessService.getStaticPath()
          + annotation.getPageId() + RepositoryAccessService.DATA_PATH + pageNumber
          + RepositoryAccessService.MASTER_JPG);
    }
    jsonAnnotation.put(AnnotationStoreStrings.TARGET.getName(), target);
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
    return jsonBodies;
  }

  /*
   * Converts single body object to JSONObject.
   */
  private JSONObject bodyToJson(Body body) throws JSONException {
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
          TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat().format(body.getCreated()));
    }
    //puts modified date
    if (body.getModified() != null) {
      jsonBody.put(AnnotationStoreStrings.MODIFIED.getName(),
          TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat().format(body.getCreated()));
    }
    //puts purpose as Motivation
    if (body.getPurpose() != null) {
      jsonBody.put(AnnotationStoreStrings.PURPOSE.getName(), body.getPurpose().getName());
    }
    //puts value
    if (body.getValue() != null) {
      jsonBody.put(AnnotationStoreStrings.VALUE.getName(), body.getValue());
    }
    //puts title
    if (body.getTitle() != null) {
      jsonBody.put(AnnotationStoreStrings.DC_TITLE.getName(), body.getTitle());
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
      jsonBody.put(AnnotationStoreStrings.CREATOR.getName(), newCreators);
    }
  }

  private String colorToString(Color color) {
    switch (color) {
      case TEXT_REGION:
        return Color.TEXT_REGION.getName();
      case IMAGE_REGION:
        return Color.IMAGE_REGION.getName();
      case PAGE_REGION:
        return Color.PAGE_REGION.getName();
      case LINE_DRAWING_REGION:
        return Color.LINE_DRAWING_REGION.getName();
      case GRAPHIC_REGION:
        return Color.GRAPHIC_REGION.getName();
      case TABLE_REGION:
        return Color.TABLE_REGION.getName();
      case CHART_REGION:
        return Color.CHART_REGION.getName();
      case SEPARATOR_REGION:
        return Color.SEPARATOR_REGION.getName();
      case MATHS_REGION:
        return Color.MATHS_REGION.getName();
      case CHEM_REGION:
        return Color.CHEM_REGION.getName();
      case MUSIC_REGION:
        return Color.MUSIC_REGION.getName();
      case ADVERT_REGION:
        return Color.ADVERT_REGION.getName();
      case NOISE_REGION:
        return Color.NOISE_REGION.getName();
      case UNKNOWN_REGION:
        return Color.UNKNOWN_REGION.getName();
      case CUSTOM_REGION:
        return Color.CUSTOM_REGION.getName();
      default:
        return Color.DEFAULT.getName();
    }
  }


  private Motivation stringToMotivation(String stringMotivation) {
    /* See Motivation enum
    if (Motivation.ASSESSING.getName().equals(stringMotivation)) {
      return Motivation.ASSESSING;
    } else*/
    if (Motivation.BOOKMARKING.getName().equals(stringMotivation)) {
      return Motivation.BOOKMARKING;
    } else if (Motivation.CLASSIFYING.getName().equals(stringMotivation)) {
      return Motivation.CLASSIFYING;
    } else if (Motivation.COMMENTING.getName().equals(stringMotivation)) {
      return Motivation.COMMENTING;
    } else if (Motivation.DESCRIBING.getName().equals(stringMotivation)) {
      return Motivation.DESCRIBING;
    } else if (Motivation.EDITING.getName().equals(stringMotivation)) {
      return Motivation.EDITING;
    } else if (Motivation.HIGHLIGHTING.getName().equals(stringMotivation)) {
      return Motivation.HIGHLIGHTING;
    } else if (Motivation.IDENTIFYING.getName().equals(stringMotivation)) {
      return Motivation.IDENTIFYING;
    } else if (Motivation.LINKING.getName().equals(stringMotivation)) {
      return Motivation.LINKING;
    } else if (Motivation.MODERATING.getName().equals(stringMotivation)) {
      return Motivation.MODERATING;
    } else if (Motivation.QUESTIONING.getName().equals(stringMotivation)) {
      return Motivation.QUESTIONING;
    } else if (Motivation.REPLYING.getName().equals(stringMotivation)) {
      return Motivation.REPLYING;
    } else if (Motivation.TAGGING.getName().equals(stringMotivation)) {
      return Motivation.TAGGING;
    }
    return null;
  }


  private void stringToColor(String color, Annotation annotation) {
    if (Color.TEXT_REGION.getName().equals(color)) {
      annotation.setColor(Color.TEXT_REGION);
    } else if (Color.IMAGE_REGION.getName().equals(color)) {
      annotation.setColor(Color.IMAGE_REGION);
    } else if (Color.PAGE_REGION.getName().equals(color)) {
      annotation.setColor(Color.PAGE_REGION);
    } else if (Color.LINE_DRAWING_REGION.getName().equals(color)) {
      annotation.setColor(Color.LINE_DRAWING_REGION);
    } else if (Color.GRAPHIC_REGION.getName().equals(color)) {
      annotation.setColor(Color.GRAPHIC_REGION);
    } else if (Color.TABLE_REGION.getName().equals(color)) {
      annotation.setColor(Color.TABLE_REGION);
    } else if (Color.CHART_REGION.getName().equals(color)) {
      annotation.setColor(Color.CHART_REGION);
    } else if (Color.SEPARATOR_REGION.getName().equals(color)) {
      annotation.setColor(Color.SEPARATOR_REGION);
    } else if (Color.MATHS_REGION.getName().equals(color)) {
      annotation.setColor(Color.MATHS_REGION);
    } else if (Color.CHEM_REGION.getName().equals(color)) {
      annotation.setColor(Color.CHEM_REGION);
    } else if (Color.MUSIC_REGION.getName().equals(color)) {
      annotation.setColor(Color.MUSIC_REGION);
    } else if (Color.ADVERT_REGION.getName().equals(color)) {
      annotation.setColor(Color.ADVERT_REGION);
    } else if (Color.NOISE_REGION.getName().equals(color)) {
      annotation.setColor(Color.NOISE_REGION);
    } else if (Color.UNKNOWN_REGION.getName().equals(color)) {
      annotation.setColor(Color.UNKNOWN_REGION);
    } else if (Color.CUSTOM_REGION.getName().equals(color)) {
      annotation.setColor(Color.CUSTOM_REGION);
    } else {
      annotation.setColor(Color.DEFAULT);
    }
  }


  private Date extractDateFromJsonAnnotation(JSONObject json, String type) {
    Date date = null;
    try {
      //Extracts the dates from the JSON
      String dateString;
      if (json.has(type)) {
        dateString = json.getString(type);
        //Parse the right date to a Date Object.
        if (dateString.contains(".")) {
          date = TimeStampFormats.TIMESTAMP_FORMAT_MILLIS_ANNO.getDateFormat().parse(dateString);
        } else {
          date = TimeStampFormats.TIMESTAMP_FORMAT_ANNO.getDateFormat().parse(dateString);
        }
      }
    } catch (ParseException | JSONException e) {
      e.printStackTrace();
    }
    return date;
  }

  private boolean isJsonArray(String array) {
    return array.startsWith("[");
  }
}
