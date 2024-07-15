/**
 * @module annotationCard
 *
 * NOTES:
 * This module is respsonsible for disaplying an annotation selected by a user in the
 * "annotationCard" on the right side of the screen. It
 * - first retrieves the necessary data from tAkita core (utils.js)
 * - then creates a container element (elements.js)
 * - appends jsonForms to the container element (formManipulation.js)
 */

export { selectAnnotation } from './annotationCard';
export { timestampsToISOString } from './utils';
