import { encodeAnnoId } from '../../common/utils';

import { getAnnotation } from '../network';

/**
 * Build the URL under which we can access annotation data.
 * @param {String} annoId
 * @returns {String} full URL, ready for fetching
 */
function buildAnnoUrl(annoId) {
  return window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(annoId);
}

/**
 *
 * @param {String} annoId
 * @returns {Object} annotation data
 */
export async function getAnnotationData(annoId) {
  const url = buildAnnoUrl(annoId);
  return getAnnotation(url);
}
