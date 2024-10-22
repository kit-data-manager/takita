import { initializeAnnotationTable } from '../../common/annotationTable';
import { possibleHighlightClasses } from '../../projectspecific';
import { getAllAnnotationsData } from '../data';
import { removeStyles, drawAnnos } from '../highlighting';
import { checkIsTargetCompatible, makeTargetsCompatible } from '../utils';

/**
 * main entry point, which fetches all annotations of a page and then
 * - removes old highlighting and applies new highlighting
 * - updates the annotation table
 *
 * @param {[Object]} hooks not called anywhere currently
 * @returns {[Object]} the most recent annoJson (all annotations of a page)
 */
export async function updateDisplay(hooks = {}) {
  try {
    // update annoJson to get the current tagging-body-values
    // as they are the basis for the highlighting
    let annoJson = await getAllAnnotationsData();
    // check if the annotations are compatible with the code, i.e. have
    // one xPath for each target and not one long xPath including all targets.
    // Make them compatible, if they are not
    annoJson = annoJson.map((annotation) => {
      if (!checkIsTargetCompatible(annotation)) {
        annotation.svg = makeTargetsCompatible(annotation);
      }
      return annotation;
    });

    // updating the annotation table.
    initializeAnnotationTable(
      annoJson,
      document.getElementById('annotationTableBottom'),
      document.getElementById('annotationCard'),
      hooks,
    );

    // remove all styling/highlighting
    removeStyles(document.getElementById('TEI'), possibleHighlightClasses);
    // highlight all annotated words
    drawAnnos(annoJson);

    console.log('Display and annoJson: ', annoJson, ' updated successfully.');
    // TODO: this window variable could maybe be removed
    window.ANNOJSON = annoJson;
    return annoJson;
  } catch (error) {
    console.error('Display update failed ', error);
  }
}
