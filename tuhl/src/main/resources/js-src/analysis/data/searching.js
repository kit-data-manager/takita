import { getConceptSearchURL, sanitizeSearchQuery } from '../utils';

/**
 * Send a query to the configured thesaurus.
 *
 * We basically strip all non-alphanumeric characters and then
 * append and prepend "*" wildcards to improve recall, and that's
 * it for now.
 *
 * @param {string} term the term to search for
 * @returns {Promise<Array<SearchResult>>} Array of concepts
 */
export const searchForConcept = async (term) => {
  const sanitized = sanitizeSearchQuery(term);
  console.log(`search for concept "${sanitized}"`);
  const queryURL = `${getConceptSearchURL()}?query=${sanitized}&n=5&model=all-MiniLM-L6-v2`;
  console.log('using ', queryURL);

  const response = await fetch(queryURL);
  if (!response.ok) {
    throw response;
  }

  const data = await response.json();
  if (!data.results) {
    throw new TypeError(data);
  }
  return data;
};

/**
 * @param {String} query the original search query
 * @param {String} selectedURI the concept URI which has been selected, if any, or null
 * @param {Number} selectedRank the rank of the selected URI, if any, or null
 * @param {String} annoURI the URI of the analysis annotation where the search has been done
 * @param {String} endpoint the endpoint where this data should be sent to
 */
export const storeSearchAnalytics = async (query, selectedURI, selectedRank, annoURI, endpoint = null) => {
  const uri = endpoint || `${getConceptSearchURL()}store_data`;
  const payload = JSON.stringify({
    query: query,
    selected: selectedURI || null,
    selectedRank: selectedRank || selectedRank === 0 ? selectedRank : null,
    anno: annoURI,
    datetime: new Date().toISOString(),
  });
  console.log('logging search performance: ', payload);
  const resp = await fetch(uri, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  if (!resp.ok) {
    // If analytics can not be stored, that should not affect the rest of the application.
    console.warn(`error storing search analytics: ${resp.status}\n${resp.message}`);
    //throw resp;
  }

  const json = await resp.json();
  return json;
};
