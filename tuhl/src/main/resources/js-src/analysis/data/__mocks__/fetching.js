import { mockConceptFetchDataLeafNode } from '../examples/conceptFetchDataLeafNode';
import { mockMetaphorAnnoData } from '../examples/metaphorAnnoData';
import { mockMRWAnnoData } from '../examples/mrwAnnoData';

export const fetchMetaphorAnnotation = async (_metaphorURI) => {
  return mockMetaphorAnnoData;
};

export const fetchMRWAnnotation = async (_mrwURI) => {
  return mockMRWAnnoData;
};

export const fetchConcept = async (_uri) => {
  return mockConceptFetchDataLeafNode;
};