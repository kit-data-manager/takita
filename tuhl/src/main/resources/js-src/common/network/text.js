import { fetchWithSpinner } from '../../common/utils';
/**
 * fetch (XML) document from takita
 *
 * @param {String} linkToResource URI suitable to request a document
 * a valid URI looks like window.CONTEXTPATH + "editor_rest/content/" + window.CURRENTPAGEID + "/" + [[${fileName}]];
 * @returns {String} containing a full XML document
 */
export async function fetchText(linkToResource) {
  return await fetchWithSpinner(linkToResource).then((response) => response.text());
}
