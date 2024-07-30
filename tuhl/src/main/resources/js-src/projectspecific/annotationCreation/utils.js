/**
 * TODO: CUSTOMISE
 * get content from the form and turn it into the data necessary for annotation creation (incl. target and bodies)
 *
 * @param {String} formvalue value of the JSONForm after a user submitted it/started the annotation creation process
 * @returns {Object} the data for the annotation creation
 */
export function makeAnnotationData(formvalue) {
  // formvalue contains all the information from the jsonForm as a string
  console.log('value of the jsonForm/annotation creation modal', formvalue);
  let formDataJson = JSON.parse(formvalue);

  // CRC 1475 specific
  // as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
  // of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws)
  if ('mrws' in formDataJson) {
    formDataJson = spreadMRWArray(formDataJson);
  }

  // formDataJson.color?.color will return the value of the color (which is a truthy value), if a
  // color is available. If no color is available formDataJson.color?.color will return 'undefined (which
  // is a falsy value) and therefore the ternary operator will return a default color
  const color = formDataJson?.color ? formDataJson.color : '#89f099';

  const bodies = makeBodiesData(formDataJson);
  // to create an annotation
  let annotationData = {
    pageId: window.CURRENTPAGEID,
    color: color,
    motivation: 'describing',
    bodies: bodies,
  };
  if (document.getElementById('createAnnotationForm').title !== '') {
    annotationData.svgCode = document.getElementById('createAnnotationForm').title;
  }
  console.log('finished annotation data', annotationData);

  return annotationData;
}

/**
 * TODO: CUSTOMISE
 * create 1-n bodies based on the JSONForm and store them in an array, so they can be stored. 
 * 
 * @param {Object} formDataJson the value ofeach of the fields of the JSONForm, eg.
 * {
      "selectedText": "of the ungodly",
      "classification": "metaphor",
      "label": "Book_of_Psalms1715325572436",
      "color": "#000021",
      "mrws0": "https://example.org/wap/0da130fd"
    }
 * @returns {[Object]} holding all the bodies as JSONObjects in the format necessary to store them, eg.:
 * [
    { purpose: 'describing', value: 'of the ungodly' },
    { purpose: 'classifying', value: 'metaphor' },
    { purpose: 'identifying', value: 'Book_of_Psalms1715325572436' },
    { purpose: 'linking', value: 'https://example.org/wap/0da130fd' },
   ]
 */
export function makeBodiesData(formDataJson) {
  let bodiesArray = [];
  Object.entries(formDataJson).forEach(([key, value]) => {
    const bodyObject = makeBodyData(key, value);
    // the bodyObject can be undefined for the "color", if the "color" isn't matching
    // the CRC980 stuff
    if (bodyObject) {
      bodiesArray.push(bodyObject);
    }
  });
  return bodiesArray;
}

/**
 * TODO: CUSTOMISE
 * create the data for one body based on the JSONForm value.
 * Each body gets a 'purpose'. A finished body should have at least one of the following properties:
 * - value: value of the body comes from specific input into a field of of the form
 * - subject: similar to "value", but is based on the color
 * - source: see subject
 * Turns '"classification": "metaphor"' into { purpose: 'classifying', value: 'metaphor' }
 *
 * @param {String} formKey the key of the key value pair, eg. 'classification'
 * @param {String} formValue the value of the key value pair, eg. 'metaphor'
 * @returns {Object} a full body object, eg. {purpose: 'classifying', value: 'metaphor'}
 */
export function makeBodyData(formKey, formValue) {
  let bodyObject;
  if (formKey === 'color') {
    // this is CRC980 specific stuff
    switch (formKey) {
      case '#e2b8f7':
        bodyObject = { purpose: 'classifying', subject: 'PageRegion' };
        break;
      case '#00edff':
        bodyObject = {
          purpose: 'classifying',
          subject: 'TextRegion',
          source: 'http://episteme.org/A04Vokabular#text_block',
        };
        break;
      // no default case given as most annotations will have a color and we don't want
      // an additional unnecessary body to be created
    }
  } else {
    const purpose = assignPurpose(formKey);
    bodyObject = { purpose: purpose, value: formValue };
  }

  return bodyObject;
}

/**
 * TODO: CUSTOMISE
 * convert the type of a body into a wadm-purpose. The type is based on the dataModel.properties.$key of
 * the JSONForm
 *
 * @param {String} bodyType the type of a body. It gets assigned by the JSONForm
 * @returns {String} the purpose matching the type of a body
 */
export function assignPurpose(bodyType) {
  // CRC980
  if (bodyType === 'reference' || bodyType === 'anchor' || bodyType === 'tag') {
    return 'tagging';
  } else if (bodyType === 'transcription') {
    return 'tadirah:transcription';
  } // CRC175
  else if (bodyType === 'selectedText') {
    return 'describing';
  } else if (bodyType.includes('mrws')) {
    return 'linking';
  } else if (bodyType === 'label') {
    return 'identifying';
  } else if (bodyType === 'comment') {
    return 'commenting';
  } else if (bodyType === 'classification') {
    return 'classifying';
  } else {
    return 'classifying';
  }
}

/**
 * replace the button to create an annotation with a message on how to enable it.
 * currently not used as users are allowed to create a metaphorannotation without a mrw-annotation
 */
export function disableAnnotationCreation() {
  document.querySelector('#createAnnotationForm > div:nth-child(1) > input:nth-child(2)').remove();
  let explanationDiv = document.createElement('div');
  explanationDiv.innerText = 'Please include a mrw-annotation in your selection after closing this window.';
  document.querySelector('#createAnnotationForm').append(explanationDiv);
}

/**
 * function to check/uncheck all inputs
 *
 * @param {[Element]} inputs input elements to be checked/unchecked
 */
export function toggleCheckedInputs(inputs) {
  // to select/unselect all inputs the first input will be checked,
  // wether it is selected or not. Based on that all inputs will be
  // checked or unchecked
  let isInputChecked = false;

  if (inputs[0].checked) {
    isInputChecked = true;
  }

  inputs.forEach((input) => {
    if (isInputChecked) {
      input.checked = false;
    } else {
      input.checked = true;
    }
  });
}

/**
 * returns an object to create a button to select/unselect all mrws; is used by
 * - the METAPHOR annotation template
 * - the MRW body template
 *
 * @param {Enumerator} mrwEnum holding all mrws present in the form
 * @returns {Object} to be used by jsonForm to create a button to select/unselect
 * all mrws present in the form
 */
export function getSelectMRWButton(mrwEnum) {
  const selectMRWButton = {
    type: 'button',
    title: 'Select/unselect all mrws',
    onClick: function (_e) {
      // select all input fields, where the name starts with "mrws"
      // the input fields storing the mrws present in a selection
      // get their name from the ordering in the mrws-array:
      // name="mrws[0]" and name="mrws[1]" etc.
      // to get the changing name I refered to
      // https://stackoverflow.com/questions/16791527/how-to-use-a-regular-expression-in-queryselectorall
      const inputs = document.querySelectorAll('input[name^=mrws');
      // checking if any mrws are present in the selection and allowing the toggle
      // only if there are. This prevents an error to be thrown, when no mrws are present
      if (inputs.length > 0) {
        toggleCheckedInputs(inputs);
      }
    },
  };
  // if less than two mrws are present in the selection, the
  // "is-hidden"-class (defined in chota.css) is added to the button and
  // the button won't be displayed
  if (mrwEnum.length < 2) {
    selectMRWButton['htmlClass'] = 'is-hidden';
  }

  return selectMRWButton;
}

// takes a list of mrwAnnos and returns
// - an enum holding all the ids of these annotations
// - a titleMap linking the ids to targeted strings and the type of the mrw annotation
//   which is set according to its color, which is based on the classifying body
/**
 * takes a list of mrwAnnos and stores their ids in an array and in a map, which
 * also stores the text targetted by the annotation and the type of the mrw annotation
 *
 * @param {Array} mrwAnnos list of mrw annotations
 * @returns {[Array, Map]}
 * - an array holding all the ids of these annotations
 * - a Map linking the ids to targeted strings and the type of the mrw annotation
 *   which is set according to its color, which is based on the classifying body
 */
export function getEnumAndTitleMap(mrwAnnos) {
  const idEnum = mrwAnnos.map((anno) => anno.id);
  const mrwTitleMap = {};

  mrwAnnos.forEach((anno) => {
    // getting the words targetted by the annotation
    // and concatenate them into one string
    const targetedString = anno.svg
      .map((svgs) => {
        const id = svgs.split('"')[1];
        return document.getElementById(id).innerHTML;
      })
      .join(' ');

    // adding the value of the classifying body (which is stored in the color)
    // to the string, that will be displayed in the modal.
    let mrwType = 'DEFAULT';
    switch (anno.color) {
      case '#000011':
        mrwType = 'mrw (direct)';
        break;
      case '#000012':
        mrwType = 'mrw (indirect)';
        break;
      case '#000013':
        mrwType = 'mrw (implicit)';
        break;
      case '#000014':
        mrwType = 'mflag';
        break;
    }
    mrwTitleMap[anno.id] = targetedString + ' | ' + mrwType;
  });

  return [idEnum, mrwTitleMap];
}

/**
 * replace the mrws key, with a new key for each value of the mrws key. Turn a key holding an array as value,
 * into multiple keys based on the arrays entries.
 * as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
 * of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws0-n)
 *
 * @param {Object} jsonObject
 * @returns {Object} with replaced key
 */
export function spreadMRWArray(jsonObject) {
  let mrws = [...jsonObject.mrws];
  delete jsonObject.mrws;
  mrws.forEach((mrw, index) => (jsonObject['mrws' + index] = mrw));

  return jsonObject;
}

/**
 * preselect all checkboxes for the mrw-annos present in the current selection
 * during metaphor annotation creation via the template
 *
 * @param {[Object]} mrwAnnos holding the mrw annotations
 * @param {String} annotationType type of the annotation to be created (usually derived
 * from value of the select element used to chose the template during annotation creation)
 * @param {[Element]} $inputs all input elements available during the creation of a
 * metaphor annotation (one for each mrw annotation present in the selection of the user)
 */
export function preselectAllMRWAnnos(mrwAnnos, annotationType, $inputs) {
  // if a user wants to create a metaphor-annotation, preselect the checkboxes
  // for the linking of mrw-annotations
  if (mrwAnnos.length > 0 && annotationType === 'METAPHOR') {
    // checking if any mrws are present in the selection and allowing the toggle
    // only if there are. This prevents an error to be thrown, when no mrws are present
    if ($inputs.length > 0) {
      toggleCheckedInputs($inputs);
    }
  }
}

// previously a wrapper function, to hold all functions to be called after the
// modal to create an annotation is being displayed, was available. This is no
// longer necessary after the modularisation as the templates are in the
// projectspecifi module, which has to be configured by each project-
// if a user wants to create a metaphor-annotation, but there is no
// mrw-annotation present in the selection, disable annotation creation
//if (window.MRW_ANNOS.length === 0 &&
//document.querySelector("#pickAnnotationTemplateForm > div:nth-child(1) > div:nth-child(1)
// > div:nth-child(2) > select:nth-child(1)").value === "METAPHOR"){
//disableAnnotationCreation();
//}

/**
 * find all the mrw annotations that are contained in a selection
 *
 * @param {JSONArray} annoJson contains all the annotation of the pages as JSONObjects
 * @param {Array} targetList of ranges from the selection
 * @returns an array holding all the annotation that are mrw-annotations and
 * target words present in the current selection (targetList)
 */
export function findSelectedMRWAnnos(annoJson, targetList) {
  // empty the mrwAnno list beforehand
  let mrwAnnos = [];
  annoJson.forEach((annotation) => {
    //annoXmlId = annotation.svg.split("\"")[1];
    //console.log(annotation);
    // checking if the annotation is a mrw-annotation by checking its color,
    // which is based on the classifying body.
    // See "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
    // for the corresponding hexes/mrw-annotation types
    if (
      annotation.color === '#000011' ||
      annotation.color === '#000012' ||
      annotation.color === '#000013' ||
      annotation.color === '#000014'
    ) {
      targetList.forEach((target) => {
        annotation.svg.forEach((svg) => {
          if (target.id === svg.split('"')[1]) {
            // this iteration should not be necessary as a Set
            // should not hold the same annotation twice
            if (mrwAnnos.length === 0) {
              mrwAnnos.push(annotation);
            } else {
              if (!mrwAnnos.some((entry) => entry.id === annotation.id)) {
                mrwAnnos.push(annotation);
              }
            }
          }
        });
      });
    }
  });
  console.log('MRW annotations present in current selection: ', mrwAnnos);

  return mrwAnnos;
}
