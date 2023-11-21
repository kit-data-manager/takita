/**
 * @module data/fetching
 * 
 * This module contains only async functions which directly use
 * the fetch API to access data. It is not concerned with the
 * validity of said data.
 */
import {
  MissingConceptError,
  MissingMRWError,
  MissingMetaphorError,
} from '../errors';
import {
  getConceptURL,
  encodeURL,
  normalizeApiUrl
} from '../utils';

/**
 * Fetch a concept from skosmos.
 * @param {string} uri 
 * @returns {Promise<Object>}
 */

export const fetchConcept = async (uri) => {
  try {
    const queryURL = `${getConceptURL()}?uri=${uri}&format=application/json&lang=en`;
    //console.warn('inside fetchConcept()');
    //console.warn(queryURL);
    const response = await fetch(queryURL);

    if (!response.ok) {
      throw new MissingConceptError(uri);
    }

    const data = await response.json();
    return data;
  }
  catch (e) {
    //console.log(e);
    return null;
  }
};

/**
 * Fetch a metaphor annotation from takita.
 * @param {string} metaphorURI 
 * @returns {Promise<Object>}
 */
export const fetchMetaphorAnnotation = async (metaphorURI) => {
  const response = await fetch(`${normalizeApiUrl(window.ANALYSIS_TOOL_API_URL)}/${metaphorURI}`);
  if (!response.ok) {
    console.warn(`error while fetching Metaphor: ${response.status}`);
    throw response;
  }

  const data = await response.json();
  if (data.status === '410') {
    throw new MissingMetaphorError(metaphorURI);
  }

  return data;
};

/**
 * Fetch a MRW annotation from takita.
 * @param {string} mrwURI 
 * @returns {Promise<Object>}
 */
export const fetchMRWAnnotation = async (mrwURI) => {
  const url = encodeURL(mrwURI);
  const response = await fetch(`${normalizeApiUrl(window.ANALYSIS_TOOL_API_URL)}/${url}`);
  if (!response.ok) {
    console.warn(`error while fetching MRWs: ${response.status}`);
    throw response;
  }

  const data = await response.json();
  if (data.status === '410') {
    throw new MissingMRWError(mrwURI);
  }

  return data;
};

/**
 * Update a complete metaphor annotation.
 *
 * @param {MetaphorAnnotation} annotation the complete metaphor annotation
 * @param {String?} apiUri URI of the API to use for updating
 * @returns json representation of updated metaphor annotation 
 */
export const updateAnalysis = async (annotation, apiUri) => {
  const payload = annotation.serialize();
  // Use takita endpoint to store annotation.
  const uri = apiUri || normalizeApiUrl(window.ANALYSIS_TOOL_API_URL);
  const resp = await fetch(`${uri}/${encodeURL(annotation.id)}`, {
    method: 'PUT',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Accepts': 'application/json',
    },
    body: payload,
  });
  if (!resp.ok) {
    console.warn(`error storing Metaphor: ${resp.status}`);
    throw resp;
  }
  const json = await resp.json();
  return json;
};