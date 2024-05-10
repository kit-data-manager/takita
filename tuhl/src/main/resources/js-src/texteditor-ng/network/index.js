/**
 * @module network
 *
 * NOTES:
 * This module contains facade functions for the global `fetch` API. They generally expect a complete URL and
 * optionally a payload, and return either responses, text, or json, we will see what is appropriate.
 * I suspect that we will eventually not call these directly from outside the module, but rather
 * use a more specialized API.
 */
export { fetchText } from './text';
export {
  createAnnotation,
  getAnnotation,
  createBody,
  updateBody,
  updateTarget,
  deleteAnnotation,
  deleteBody,
} from './annotation';
