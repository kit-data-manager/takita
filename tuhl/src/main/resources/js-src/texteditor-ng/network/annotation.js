/**
 * get an annotation
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded`
 * @returns {Response} containing takita's response
 */
export async function getAnnotation(url) {
  return await fetch(url);
}

/**
 * get all annotations (annoJson)
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor/' + window.CURRENTPAGEID + '/displayableAnnotationsJSON'`
 * @returns {Response} containing takita's response
 */
export async function getAllAnnotations(url) {
  return await fetch(url);
}
/**
 * create a new annotation
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/'
 * @param {Object} annotationDataJson holding the necessary data for annotation creation
 * @returns {Response} containing takita's response
 */
export async function createAnnotation(url, annotationDataJson) {
  return await fetch(url, {
    body: JSON.stringify(annotationDataJson),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

/**
 * delete an annotation
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded`
 * @returns {Response} containing takita's response
 */
export async function deleteAnnotation(url) {
  return await fetch(url, { method: 'DELETE' });
}

/**
 * create a new body
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/'`
 * instead of "/bodies/", "/tags/" is also possible, since takita differentiates between these two kinds of bodies.
 * @param {Object} bodyDataJson holding the necessary data for body creation
 * @returns {Response} containing takita's response
 */
export async function createBody(url, bodyDataJson) {
  return await fetch(url, {
    body: JSON.stringify(bodyDataJson),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

/**
 * delete one body from an annotation
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId`
 * instead of "/bodies/", "/tags/" is also possible, since takita differentiates between these two kinds of bodies.
 * @returns {Response} containing takita's response
 */
export async function deleteBody(url) {
  return await fetch(url, { method: 'DELETE' });
}

/**
 * update a body of an annotation
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId`
 * instead of "/bodies/", "/tags/" is also possible, since takita differentiates between these two kinds of bodies.
 * @param {Object} annoBodyData holding the necessary data for the body update
 * @returns {Response} containing takita's response
 */
export async function updateBody(url, annoBodyData) {
  return await fetch(url, {
    body: annoBodyData,
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
  });
}

/**
 * update the target of an annotation
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId`
 * instead of "/bodies/", "/tags/" is also possible, since takita differentiates between these two kinds of bodies.
 * @param {Object} modifiedAnnotation conatins the color, motication and the new target (xPath)
 * @returns {Response} containing takita's response
 */
export async function updateTarget(url, modifiedAnnotation) {
  return await fetch(url, {
    body: modifiedAnnotation,
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
  });
}
