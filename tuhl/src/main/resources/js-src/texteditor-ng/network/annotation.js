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
 * delete one body from an annotation
 *
 * @param {String} url
 * a valid url looks like `window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId`
 * instead of "/bodies/", "/tags/" is also possible, since takita differentiates between these two kinds of bodies.
 * @returns {Response} containing takita's response
 */
export async function deleteAnnotationBody(url) {
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
 * @param {Object} newTarget conatins the color, motication and the new target (xPath)
 * @returns {Response} containing takita's response
 */
export async function updateTarget(url, newTarget) {
  return await fetch(url, {
    body: newTarget,
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
  });
}
