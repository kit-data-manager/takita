/**
 * TODO: CUSTOMISE
 * get content from the form and turn it into the data necessary for annotation creation (incl. target and bodies)
 *
 * @param {String} formvalue value of the JSONForm after a user submitted it/started the annotation creation process
 * @param {[Object]} selectors array holding all the selectors
 * @returns {Object} the data for the annotation creation
 */
export function makeAnnotationData(formvalue, selectors) {
  // formvalue contains all the information from the jsonForm as a string
  console.log('value of the jsonForm/annotation creation modal', formvalue);
  let formDataJson = JSON.parse(formvalue);

  const bodies = makeBodiesData(formDataJson);
  // to create an annotation
  let annotationData = {
    pageId: window.CURRENTPAGEID,
    motivation: 'describing',
    bodies: bodies,
  };
  if (selectors) {
    annotationData.selectors = selectors;
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
    bodiesArray.push(bodyObject);
  });
  return bodiesArray;
}

/**
 * TODO: CUSTOMISE
 * create the data for one body based on the JSONForm value.
 * Each body gets a 'purpose'. A finished body should have at least one of the following properties:
 * - value: value of the body comes from specific input into a field of of the form
 * - subject: similar to "value"
 * - source: see subject
 * Turns '"classification": "metaphor"' into { purpose: 'classifying', value: 'metaphor' }
 *
 * @param {String} formKey the key of the key value pair, eg. 'classification'
 * @param {String} formValue the value of the key value pair, eg. 'metaphor'
 * @returns {Object} a full body object, eg. {purpose: 'classifying', value: 'metaphor'}
 */
export function makeBodyData(formKey, formValue) {
  let bodyObject;
  const purpose = assignPurpose(formKey);
  bodyObject = { purpose: purpose, value: formValue };

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
  if (bodyType === 'freetext') {
    return 'commenting';
  } else if (bodyType === 'tag') {
    return 'tagging';
  } else {
    return 'tagging';
  }
}
