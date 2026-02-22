import { processAuxText, processTertiaComment } from './data/sanitizing';

/**
 * I don't know why, but takita expects the annotation ids as _doubly_ URL-encoded URIs.
 * So e.g. ":" would not be "%3A", but "%253A" ("%25" is just "%", then follows
 * the regular "3A"). I have no clue why, but in case this behavior changes, I want
 * to have a single point in the code to modify it, so here we go:
 * @param {*} uri
 */
export const encodeURL = (uri) => {
  return window.encodeURIComponent(window.encodeURIComponent(uri));
};

/**
 * parse analysis string to object
 *
 * For some reason, doing the full roundtrip of storing the appState as annotation and
 * loading it again, leads to errors in the data of the translation editor. The string
 * which contains the analysis is then no longer valid JSON, because it escapes newlines
 * and quotation marks incorrectly. These string replacements fix that.
 * See https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/132 for details.
 *
 * @param {String} analysisString JSON formatted string containing the analysis
 * @returns {Object}
 */
export const parseAnalysisString = (analysisString) => {
  let obj;
  try {
    // If the string is already well-formed, do nothing else:
    obj = JSON.parse(analysisString);
  } catch {
    //console.log('faulty analysisString');
    //console.log(analysisString);
    analysisString = processAuxText(analysisString);
    analysisString = processTertiaComment(analysisString);
    //analysisString = processMappingText(analysisString);
    //console.log('newly built analysisString');
    //console.log(analysisString);
    obj = JSON.parse(analysisString);
  } finally {
    if (!obj) {
      console.warn('analysisString contains invalid JSON: ', analysisString);
    }
  }

  return obj;
};

/**
 * We use Takita's templating system to pass certain configuration values as global
 * variables, like the URL basename where Takita is hosted. This helper function
 * normalizes such a basename to make sure we handle the absence of any basename value
 * gracefully.
 */
export const normalizeBasename = (basename) => {
  if (basename) {
    return basename;
  }
  return '/';
};

export const normalizeApiUrl = (apiUrl) => {
  return apiUrl ? apiUrl : '/editor_rest/annotations';
};

export const getConceptSearchURL = () => {
  const URL = window.THESAURUS_BASEURL;
  const PATH = window.THESAURUS_SEARCHPATH;
  //const DEFAULT = 'https://eris.vm.rub.de/Skosmos/rest/v1/ct/search';
  const DEFAULT = 'https://eris.vm.rub.de/search/';

  if (URL && PATH) {
    return `${URL}${PATH}`;
  } else {
    //console.warn('Thesaurus search URL is not set correctly.');
    return DEFAULT;
  }
};

export const getConceptURL = () => {
  const URL = window.THESAURUS_BASEURL;
  const PATH = window.THESAURUS_SEARCHPATH
    ? window.THESAURUS_SEARCHPATH.split('/').slice(0, -1).join('/') + '/data'
    : null;
  const DEFAULT = 'https://eris.vm.rub.de/Skosmos/rest/v1/ct/data';

  if (URL && PATH) {
    return `${URL}${PATH}`;
  } else {
    //console.warn('Thesaurus search URL is not set up correctly.');
    return DEFAULT;
  }
};

/**
 * Helper function to create complete URL paths to subcomponents.
 * This is especially important since currently the "id" is a
 * complete URI which needs to be URL-encoded to be a valid path
 * component.
 *
 * @param {string} id  - analysis ID
 * @param {string} route - path of the subcomponent e.g. 'propositions'
 * @returns {string} - complete route to subcomponent
 */
export const createRoute = (id, route) => {
  return `/analysis/${id}/${route}`;
};

/**
 * Analyse the current URL to extract the Metaphor Annotation URI
 *
 * To load the page in the first place we need to extract the URI of the
 * Metaphor Annotation from the page URL. The client side routing then only
 * regards the last part of the URL, i.e. which analysis step to display.
 * However, this part can be omitted, so we can't just take the second to last
 * URL segment.
 *
 * @returns {String} URI of the metaphor annotation
 */
export const getAnnoId = () => {
  // Make sure that the basename is included in the list of
  // known url path components.
  const basenameComponents = normalizeBasename(window.ANALYSIS_TOOL_BASENAME)
    .split('/')
    .filter((component) => component);
  const pathComponents = basenameComponents.concat([
    'analysis',
    'propositions',
    'linking',
    'openmapping',
    'completemapping',
    'conceptualizing',
    'textvariant',
  ]);
  // If we find a path component we don't yet know about, it must be
  // the annotation ID, even if its structure should change in the
  // future.
  const aid = window.location.pathname
    .split('/')
    .filter((comp) => !pathComponents.includes(comp))
    .pop();
  return aid;
};

const dateFormat = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};
/**
 * Provide nicely formatted string representation of a date
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('default', dateFormat);
};

export const sanitizeSearchQuery = (query) => {
  // Note: the \p{L} matches letters in all scripts, when
  // used together with the u flag!
  return query.replace(/[^\p{L}\d\s-]/gu, '');
};

/**
 * Generate an arbitrary string, which can be used to identify which concept searches
 * have been issued in the same session.
 * @returns {String}
 */
export const getSessionId = () => {
  const input = `${Math.floor(Math.random() * 100)}${Date.now()}`;

  const hash = (string) => {
    let hash = 0;
    for (let i = 0, len = string.length; i < len; i++) {
      let chr = string.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  return hash(input);
};
