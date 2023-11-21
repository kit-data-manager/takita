/**
 * @module data/converting
 * 
 * This module contains only functions which convert fetched data by
 * matching it to an appropriate model.
 */

import {
  ApplicationState,
  DetailedConcept,
  FetchResult,
  SearchResult,
  MetaphorAnnotation,
  MRWAnnotation,
} from './models';

//import { MissingConceptError } from '../errors';


export const createDetailedConcepts = (data) => {
  //const array = (data instanceof Array) ? data : [data];
  const detailed = data.map(concept => {
      try {
        const dc = new DetailedConcept(concept);
        return dc;
      }
      catch (e) {
        console.error(new TypeError(concept));
        return null;
      }
    })
    .filter(dc => dc !== null);
  return detailed;  
};

export const createMRWs = (data) => {
  const array = (data instanceof Array) ? data : [data];
  const mrws = array.map(mrw => new MRWAnnotation(mrw));
  return mrws;
};

export const createMetaphor = (data) => {
  if (!data || !(data instanceof Object)) {
    throw new TypeError(data);
  }
  const metaphor = new MetaphorAnnotation(data);
  return metaphor;
};

export const createAppState = (metaphor, mrws, concepts) => {
  const appState = new ApplicationState(metaphor, mrws, concepts);
  return appState;
};

export const createFetchedConcept = (data) => {
  const concept = new FetchResult(data);
  return concept;
};

export const createSearchedConcepts = (data) => {
  const results = data.results
    .map(r => new SearchResult(r));

  return results;
};