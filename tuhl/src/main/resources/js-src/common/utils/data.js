/**
 * Doubly URL-encode anno IDs to include them in requests to Takita.
 * @param {String} annoId
 * @returns {String}
 */
export function encodeAnnoId(annoId) {
  return encodeURIComponent(encodeURIComponent(annoId));
}
