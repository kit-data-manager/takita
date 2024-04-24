/**
 * Utility functions which help dealing with URLs and URL parameters.
 */

/**
 * Retrieve the "fragment" URL parameter, or null if none is present.
 * @returns {String | null}
 */
export function getTargetFragment() {
  const searchParams = new URL(window.location).searchParams;
  return searchParams.get('fragment');
}

/**
 * Get the ID of a pre-selected annotation, or null if none is present.
 * @returns {String | null}
 */
export function getTargetAnnotationId() {
  const searchParams = new URL(window.location).searchParams;
  return searchParams.get('annotationId');
}
