// Different models which represent data which we fetch from external
// services, i.e. WAPS, Skosmos etc. (usually via Takita).
export {
  FetchResult,
  SearchResult,
  MetaphorAnnotation,
  MRWAnnotation,
} from './resources';

// Different models dealing with local application state
// (i.e. how the data is prepared for actual consumption
// by the frontend).
export { ApplicationState, DetailedConcept } from './appstate';

// Model for notifications to the user
export { Message } from './Message';