/**
 * @module data/api
 *
 * This is the most high-level API of the `data` module. Calling code should
 * only ever call functions from this module, instead of fetching or loading
 * on its own.
 */

import { fetchConcept, fetchMetaphorAnnotation, fetchMRWAnnotation, updateAnalysis } from './fetching';
import { createAppState, createFetchedConcept, createMetaphor, createMRWs, createSearchedConcepts } from './converting';
import { searchForConcept as search, storeSearchAnalytics as storeSearchData } from './searching';

import { MetaphorAnnotation } from './models';

/**
 * Fetch all the data which belongs to a given metaphor and converts
 * it to a usable application state.
 *
 * @param {string}  metaphorURI URI of the metaphor annotation
 * @returns {Object}
 */
export const loadAnalysis = async (metaphorURI) => {
  console.debug('Load analysis via Takita');
  // Fetch a complete metaphor web annotation from Takita/WAPS. We will
  // ignore much of its content for the purposes of the analysis tool,
  // but we will still keep it around so that we can reuse it when we
  // later update the metaphor annotation.
  const metaphorData = await fetchMetaphorAnnotation(metaphorURI);
  console.log(metaphorData);
  console.log('we have fetched metaphorAnnotation');
  // Construct initial MetaphorAnnotation object.
  const metaphor = createMetaphor(metaphorData);
  console.log(metaphor);
  console.log('we have created metaphor');
  // Aquire all the linked data to construct a fully usable application state.
  const appState = await constructAppState(metaphor);

  return { appState, etag: metaphorData.etag, originalAnnotation: metaphorData };
};

/**
 * Update an existing analysis annotation, by sending a PUT
 * request with a new annotation object.
 */
export const storeAnalysis = async (appState, originalAnnotation, etag) => {
  console.debug('Store analysis via Takita');
  // We need to send the entire metaphor web annotation as payload, including
  // all the bodies and targets which we never interact with in the analysis
  // tool. That is the reason we keep the original annotation, so we can
  // simply reuse a large part of it.
  const newAnno = MetaphorAnnotation.fromAppState(appState, originalAnnotation, etag);
  console.log('we have created a new MetAnno fromAppState:');
  console.log(newAnno);

  // Send PUT request with annotation as payload.
  const updatedData = await updateAnalysis(newAnno);
  console.log('we have done updateAnalysis() and this is what we got:');
  console.log(updatedData);

  // Now we do the same as we do when we initially load metaphorData.
  // First, we create a MetaphorAnnotation object using the updated data.
  const metaphor = createMetaphor(updatedData);
  // Now we re-aquire all the linked data to construct a fully usable application state,
  // just like we would if we had just initially loaded a metaphor.
  const newAppState = await constructAppState(metaphor);

  return { appState: newAppState, etag: updatedData.etag, originalAnnotation: updatedData };
};

/**
 * When we have aquired a metaphor annotation, either by GET request or
 * as the response of a PUT, (re-)aquire all its linked annotations
 * and concepts to create a complete ApplicationState.
 *
 * @param {MetaphorAnnotation} metaphor
 * @returns {ApplicationState}
 */
const constructAppState = async (metaphor) => {
  console.log('enter constructAppState()');
  // Fetch all linked MRW annotations.
  const mrwData = await Promise.all(metaphor.getMRWURIs().map(async (uri) => fetchMRWAnnotation(uri)));
  console.log(mrwData);
  console.log('we have fetched all the MRW Annotations');
  const mrws = createMRWs(mrwData);
  // Fetch all linked concepts.
  const conceptData = await Promise.all(metaphor.getConceptURIs().map(async (uri) => fetchConcept(uri)));
  console.log(conceptData);
  console.log('we have fetched concepts');
  const concepts = conceptData.map((item) => createFetchedConcept(item));
  console.log(concepts);
  console.log('we have created concepts');
  const appState = createAppState(metaphor, mrws, concepts);
  console.log(appState);
  console.log('we have created appState, leave constructAppState()');
  return appState;
};

/**
 *
 * @param {string} query search term
 * @returns {Array} list of DetailedConcepts
 */
export const searchForConcept = async (query) => {
  // TODO: search for URI or ID should try to fetch the concept
  // directly, instead of searching for it.
  const data = await search(query);
  const results = createSearchedConcepts(data);
  return results.map((searchResult) => searchResult.toConcept());
};

/**
 * Store search analytics.
 *
 * @param {String} query original search query
 * @param {String} selectedURI selected concept or null
 * @param {Number} selectedRank search rank of the selected concept or null
 * @param {String} annoURI analysis annotation where the linking took place
 */
export const storeSearchAnalytics = async (query, selectedURI, selectedRank, annoURI) => {
  if (!query) {
    return;
  }
  const respData = await storeSearchData(query, selectedURI, selectedRank, annoURI);
  return respData;
};
