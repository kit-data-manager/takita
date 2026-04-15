/**
 * Doubly URL-encode anno IDs to include them in requests to Takita.
 * @param {String} annoId
 * @returns {String}
 */
export function encodeAnnoId(annoId) {
  return encodeURIComponent(encodeURIComponent(annoId));
}

/**
 * Utility functions which help dealing with URLs and URL parameters.
 */

/**
 * Retrieve the "fragment" URL parameter, or null if none is present.
 *
 * @param {Location} location the current location
 * (eg. http://localhost:8181/editor/pageId?annotationId=someAnnoId&fragment=w.147 )
 * @returns {String | null}
 */
export function getTargetFragment(location) {
  const searchParams = new URL(location).searchParams;
  return searchParams.get('fragment');
}

/**
 * Get the ID of a pre-selected annotation, or null if none is present.
 *
 * @param {Location} location the current location
 * (eg. http://localhost:8181/editor/pageId?annotationId=someAnnoId&fragment=w.147 )
 * @returns {String | null}
 */
export function getTargetAnnotationId(location) {
  const searchParams = new URL(location).searchParams;
  return searchParams.get('annotationId');
}
